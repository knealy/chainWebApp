// server.js


require('dotenv').config();

const express = require('express');
const path = require('path');
const UserModel = require('./src/userModel');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Add axios for making API calls
// const favicon = require('serve-favicon');
const app = express();
app.use(express.json());

// In-memory storage
const users = [];
const chainLinks = [];
const chainReactions = [];
const apiConnections = [];


const cors = require('cors');
app.use(cors());

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use((req, res, next) => {
    console.log('Incoming request:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        body: req.method === 'POST' ? req.body : undefined,
        params: req.params,
        query: req.query
    });
    next();
});

app.use('/api-events-actions', limiter);

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'src')));

// Serve the favicon
// app.use(favicon(path.join(__dirname, 'src', 'favicon.ico')));

app.use((err, req, res, next) => {
    console.error('Error occurred:', {
        url: req.originalUrl,
        method: req.method,
        error: err.message,
        stack: err.stack
    });
    
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message,
        path: req.originalUrl
    });
});

const validateApiId = (req, res, next) => {
    console.log('Validating API ID at URL:', req.originalUrl);
    const apiId = parseInt(req.params.apiId);
    if (isNaN(apiId)) {
        console.error('Invalid API ID format at URL:', req.originalUrl);
        return res.status(400).json({
            success: false,
            message: 'Invalid API ID format'
        });
    }
    req.apiId = apiId;
    next();
};



async function validateApiConnection(apiUrl, apiKey) {
    try {
        console.log('Validating API connection with URL:', apiUrl);
        
        // Common headers for all requests
        const headers = {
            'Content-Type': 'application/json'
        };

        // Create an array of possible authentication methods
        const authMethods = [
            // Bearer token
            {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            },
            // API key in header
            {
                headers: { 'X-API-Key': apiKey }
            },
            // Basic auth
            {
                headers: { 'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}` }
            },
            // Query parameter
            {
                params: { apiKey: apiKey }
            },
            // OpenWeatherMap style
            {
                params: { appid: apiKey }
            },
            // API key in custom header
            {
                headers: { 'Api-Key': apiKey }
            }
        ];

        let successfulResponse = null;
        let authMethodUsed = null;

        // Try each authentication method until one works
        for (const method of authMethods) {
            try {
                console.log('Trying authentication method:', method);
                const response = await axios.get(apiUrl, {
                    ...method,
                    headers: {
                        ...headers,
                        ...(method.headers || {})
                    },
                    validateStatus: status => status < 500 // Accept any status < 500 to check response
                });

                if (response.status === 200) {
                    successfulResponse = response;
                    authMethodUsed = method;
                    break;
                }
            } catch (error) {
                console.log('Auth method failed:', error.message);
                continue;
            }
        }

        if (!successfulResponse) {
            throw new Error('No authentication method worked');
        }

        console.log('Successfully connected using method:', authMethodUsed);

        // Try to discover API capabilities
        let events = [];
        let actions = [];

        // Common endpoint patterns to try
        const discoveryEndpoints = [
            '/events',
            '/actions',
            '/webhooks',
            '/triggers',
            '/capabilities',
            '/api/events',
            '/api/actions',
            '/v1/events',
            '/v1/actions'
        ];

        // Try to discover endpoints
        for (const endpoint of discoveryEndpoints) {
            try {
                const fullUrl = new URL(endpoint, apiUrl).toString();
                const response = await axios.get(fullUrl, {
                    ...authMethodUsed,
                    headers: {
                        ...headers,
                        ...(authMethodUsed.headers || {})
                    }
                });

                if (response.data) {
                    console.log(`Discovered endpoint ${endpoint}:`, response.data);
                    
                    // Try to identify events and actions from response
                    if (endpoint.includes('event')) {
                        events = Array.isArray(response.data) ? response.data :
                                response.data.events || response.data.data || [];
                    }
                    if (endpoint.includes('action')) {
                        actions = Array.isArray(response.data) ? response.data :
                                 response.data.actions || response.data.data || [];
                    }
                }
            } catch (error) {
                console.log(`Endpoint ${endpoint} not available:`, error.message);
            }
        }

        // If no events/actions discovered, try to infer from API response
        if (events.length === 0 || actions.length === 0) {
            const apiData = successfulResponse.data;
            
            // Try to identify potential events and actions from the API response
            const inferredCapabilities = inferCapabilitiesFromResponse(apiData);
            events = events.length > 0 ? events : inferredCapabilities.events;
            actions = actions.length > 0 ? actions : inferredCapabilities.actions;
        }

        return { 
            success: true, 
            data: successfulResponse.data,
            events,
            actions,
            authMethod: authMethodUsed
        };
    } catch (error) {
        console.error('API Connection Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });

        return { 
            success: false, 
            error: 'Failed to connect to API: ' + error.message,
            details: error.response?.data || error.message
        };
    }
}

// Helper function to infer capabilities from API response
function inferCapabilitiesFromResponse(apiData) {
    const events = [];
    const actions = [];
    
    // Convert API data to string for analysis
    const dataString = JSON.stringify(apiData).toLowerCase();
    
    // Look for common patterns in the response
    if (dataString.includes('weather')) {
        events.push(
            { id: 'weather_change', name: 'Weather Change', description: 'Weather conditions change' }
        );
        actions.push(
            { id: 'get_weather', name: 'Get Weather', description: 'Fetch weather data' }
        );
    }
    
    if (dataString.includes('user')) {
        events.push(
            { id: 'user_update', name: 'User Update', description: 'User data changes' }
        );
        actions.push(
            { id: 'get_user', name: 'Get User', description: 'Fetch user data' }
        );
    }
    
    // Add generic events and actions as fallback
    if (events.length === 0) {
        events.push(
            { id: 'data_update', name: 'Data Update', description: 'Data has been updated' },
            { id: 'status_change', name: 'Status Change', description: 'Status has changed' }
        );
    }
    
    if (actions.length === 0) {
        actions.push(
            { id: 'get_data', name: 'Get Data', description: 'Fetch data' },
            { id: 'update_data', name: 'Update Data', description: 'Update data' }
        );
    }
    
    return { events, actions };
}

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.json({ success: false, message: 'All fields are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Add user to the database
        const newUser = UserModel.addUser(username, email, hashedPassword);

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.json({ success: false, message: 'Registration failed: ' + error.message });
    }
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'main.html'));
});


// Route to handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = UserModel.getUserByUsername(username); // Use UserModel to get the user
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ success: true, message: 'Login successful!', redirectUrl: '/main' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});


// Add new endpoint to handle API connections
app.post('/connect-api', async (req, res) => {
    const { apiUrl, apiKey, apiName, webhookUrl } = req.body;

    if (!apiUrl || !apiKey || !apiName) {
        return res.json({ 
            success: false, 
            message: 'API URL, key, and name are required' 
        });
    }

    try {
        // Test the API connection and fetch events/actions
        const connectionTest = await validateApiConnection(apiUrl, apiKey);
        
        if (!connectionTest.success) {
            return res.json({ 
                success: false, 
                message: 'Failed to connect to API: ' + connectionTest.error 
            });
        }

        // Store API connection details with fetched events and actions
        const newConnection = {
            id: apiConnections.length + 1,
            name: apiName,
            url: apiUrl,
            key: apiKey,
            webhookUrl: webhookUrl,
            status: 'active',
            availableEvents: connectionTest.events || [],
            availableActions: connectionTest.actions || []
        };

        apiConnections.push(newConnection);
        console.log('New API connection added:', newConnection); // Log the new connection
        console.log('Updated API connections list:', apiConnections); // Log the updated list

        res.json({
            success: true,
            message: 'API connected successfully!',
            connections: apiConnections.map(({ id, name, status }) => ({
                id, name, status
            }))
        });
    } catch (error) {
        console.error('Error connecting to API:', error);
        res.json({ 
            success: false, 
            message: 'Failed to connect to API: ' + error.message 
        });
    }
});


app.get('/api-events-actions/:apiId', validateApiId, (req, res) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log('Received request for API events and actions:', {
        url: fullUrl,
        apiId: req.params.apiId,
        method: req.method
    });
    
    const apiId = parseInt(req.params.apiId);
    const connection = apiConnections.find(api => api.id === apiId);

    if (!connection) {
        console.error('API connection not found for ID:', {
            url: fullUrl,
            apiId: apiId,
            availableConnections: apiConnections.map(c => c.id)
        });
        return res.status(404).json({ 
            success: false, 
            message: 'API connection not found' 
        });
    }

    // Ensure these properties exist
    const events = connection.availableEvents || [];
    const actions = connection.availableActions || [];

    console.log('Sending response:', { 
        url: fullUrl,
        success: true, 
        eventsCount: events.length,
        actionsCount: actions.length
    });
    
    res.json({
        success: true,
        events,
        actions
    });
});


// List all connected APIs
app.get('/api-connections', (req, res) => {
    console.log('API connections requested');
    const connections = apiConnections.map(({ id, name, status, availableActions }) => ({
        id, name, status, availableActions
    }));

    res.json({ 
        success: true, 
        connections 
    });
});

// Test API connection endpoint
app.get('/test-api/:apiId', async (req, res) => {
    console.log('Testing API connection:', req.params.apiId);
    const apiId = parseInt(req.params.apiId);
    
    const connection = apiConnections.find(api => api.id === apiId);
    
    if (!connection) {
        return res.json({ 
            success: false, 
            message: 'API connection not found' 
        });
    }

    try {
        // Reuse validateApiConnection to test the connection
        const testResult = await validateApiConnection(connection.url, connection.key);
        
        if (testResult.success) {
            // Update the connection status if successful
            connection.status = 'active';
            return res.json({ 
                success: true, 
                message: 'API connection test successful' 
            });
        } else {
            // Update the connection status if failed
            connection.status = 'inactive';
            return res.json({ 
                success: false, 
                message: 'API connection test failed: ' + testResult.error 
            });
        }
    } catch (error) {
        console.error('Error testing API connection:', error);
        // Update the connection status on error
        connection.status = 'inactive';
        return res.json({ 
            success: false, 
            message: 'Error testing API connection: ' + error.message 
        });
    }
});

// Delete API connection endpoint
app.delete('/delete-api/:apiId', (req, res) => {
    console.log('Deleting API connection:', req.params.apiId);
    const apiId = parseInt(req.params.apiId);
    
    const connectionIndex = apiConnections.findIndex(api => api.id === apiId);
    
    if (connectionIndex === -1) {
        return res.json({ 
            success: false, 
            message: 'API connection not found' 
        });
    }

    try {
        // Remove the connection from the array
        apiConnections.splice(connectionIndex, 1);
        
        // Update IDs for remaining connections to maintain sequence
        apiConnections.forEach((conn, index) => {
            conn.id = index + 1;
        });

        return res.json({ 
            success: true, 
            message: 'API connection deleted successfully',
            connections: apiConnections.map(({ id, name, status }) => ({
                id, name, status
            }))
        });
    } catch (error) {
        console.error('Error deleting API connection:', error);
        return res.json({ 
            success: false, 
            message: 'Error deleting API connection: ' + error.message 
        });
    }
});


app.post('/create-chain-link', async (req, res) => {
    console.log('Received create chain link request:', req.body);
    
    const { name, trigger, action, apiId } = req.body;
    
    // Validate required fields
    if (!name || !trigger || !action || !apiId) {
        console.error('Missing required fields:', {
            name: !!name,
            trigger: !!trigger,
            action: !!action,
            apiId: !!apiId
        });
        return res.status(400).json({ 
            success: false, 
            message: 'Name, trigger, action, and API ID are required' 
        });
    }

    try {
        // Verify the API exists
        const api = apiConnections.find(api => api.id === apiId);
        if (!api) {
            console.error('API not found:', apiId);
            return res.status(404).json({
                success: false,
                message: 'API connection not found'
            });
        }

        // Create the new chain link
        const newChainLink = {
            id: chainLinks.length + 1,
            name,
            trigger,
            action,
            apiId,
            status: 'active',
            created: new Date().toISOString()
        };

        chainLinks.push(newChainLink);

        console.log('Created new chain link:', newChainLink);

        res.json({
            success: true,
            message: 'Chain link created successfully!',
            chainLink: newChainLink
        });
    } catch (error) {
        console.error('Error creating chain link:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create chain link: ' + error.message 
        });
    }
});


app.get('/chain-links', (req, res) => {
    console.log('Chain links requested');
    res.json({ 
        success: true, 
        chainLinks 
    });
});


// Delete chain link endpoint
app.delete('/delete-chain/:chainId', (req, res) => {
    const chainId = parseInt(req.params.chainId);
    const chainIndex = chainLinks.findIndex(chain => chain.id === chainId);
    
    if (chainIndex === -1) {
        return res.json({ 
            success: false, 
            message: 'Chain link not found' 
        });
    }

    chainLinks.splice(chainIndex, 1);
    
    res.json({ 
        success: true, 
        message: 'Chain link deleted successfully' 
    });
});


// Test chain link endpoint
app.post('/test-chain/:chainId', async (req, res) => {
    const chainId = parseInt(req.params.chainId);
    const chain = chainLinks.find(c => c.id === chainId);
    
    if (!chain) {
        return res.json({ 
            success: false, 
            message: 'Chain link not found' 
        });
    }

    try {
        // Execute the chain link's trigger and action
        const result = await functionManager.executeDynamicFunction(
            `workflow-${chain.apiId}-${chain.trigger}-${chain.action}`
        );
        
        res.json({ 
            success: true, 
            message: 'Chain link tested successfully',
            result 
        });
    } catch (error) {
        console.error('Error testing chain link:', error);
        res.json({ 
            success: false, 
            message: 'Error testing chain link: ' + error.message 
        });
    }
});
app.post('/create-chain-link', async (req, res) => {
    console.log('Received create chain link request:', req.body);
    
    const { name, trigger, action, apiId } = req.body;
    
    // Validate required fields
    if (!name || !trigger || !action || !apiId) {
        console.error('Missing required fields:', {
            name: !!name,
            trigger: !!trigger,
            action: !!action,
            apiId: !!apiId
        });
        return res.status(400).json({ 
            success: false, 
            message: 'Name, trigger, action, and API ID are required' 
        });
    }

    try {
        // Verify the API exists
        const api = apiConnections.find(api => api.id === apiId);
        if (!api) {
            console.error('API not found:', apiId);
            return res.status(404).json({
                success: false,
                message: 'API connection not found'
            });
        }

        // Create the new chain link
        const newChainLink = {
            id: chainLinks.length + 1,
            name,
            trigger,
            action,
            apiId,
            status: 'active',
            created: new Date().toISOString()
        };

        chainLinks.push(newChainLink);

        console.log('Created new chain link:', newChainLink);

        res.json({
            success: true,
            message: 'Chain link created successfully!',
            chainLink: newChainLink
        });
    } catch (error) {
        console.error('Error creating chain link:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create chain link: ' + error.message 
        });
    }
});

// Add route to list all chain links
app.get('/chain-links', (req, res) => {
    console.log('Chain links requested');
    res.json({ 
        success: true, 
        chainLinks 
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// 3. Add logging to the catch-all 404 handler
app.use('*', (req, res) => {
    console.error('404 Not Found:', {
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });
    
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requestedUrl: req.originalUrl
    });
});