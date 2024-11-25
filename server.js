// server.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Add axios for making API calls

const app = express();
app.use(express.json());

// In-memory storage
const users = [];
const chainReactions = [];
const apiConnections = [];

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'src')));

// Validate and test API connection
async function validateApiConnection(apiUrl, apiKey) {
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('API Connection Error:', error);
        return { success: false, error: error.message };
    }
}

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
        // Test the API connection
        const connectionTest = await validateApiConnection(apiUrl, apiKey);
        
        if (!connectionTest.success) {
            return res.json({ 
                success: false, 
                message: 'Failed to connect to API: ' + connectionTest.error 
            });
        }

        // Store API connection details
        const newConnection = {
            id: apiConnections.length + 1,
            name: apiName,
            url: apiUrl,
            key: apiKey,
            webhookUrl: webhookUrl,
            status: 'active',
            availableEvents: [], // Will be populated from API if available
            availableActions: []  // Will be populated from API if available
        };

        apiConnections.push(newConnection);

        res.json({
            success: true,
            message: 'API connected successfully!',
            connection: {
                id: newConnection.id,
                name: newConnection.name,
                status: newConnection.status
            }
        });
    } catch (error) {
        console.error('Error connecting to API:', error);
        res.json({ 
            success: false, 
            message: 'Failed to connect to API: ' + error.message 
        });
    }
});

// Get available triggers and actions for an API
app.get('/api-events/:apiId', (req, res) => {
    const apiId = parseInt(req.params.apiId);
    const connection = apiConnections.find(api => api.id === apiId);

    if (!connection) {
        return res.json({ 
            success: false, 
            message: 'API connection not found' 
        });
    }

    // This would normally be fetched from the actual API
    // Here we're providing some example events and actions
    const availableEvents = [
        { id: 1, name: 'New Data Received', description: 'Triggered when new data is received' },
        { id: 2, name: 'Status Change', description: 'Triggered when status changes' },
        { id: 3, name: 'Error Occurred', description: 'Triggered when an error occurs' }
    ];

    const availableActions = [
        { id: 1, name: 'Send Notification', description: 'Send a notification' },
        { id: 2, name: 'Update Database', description: 'Update database record' },
        { id: 3, name: 'Trigger Webhook', description: 'Send data to webhook URL' }
    ];

    res.json({
        success: true,
        events: availableEvents,
        actions: availableActions
    });
});

});

// Endpoint to handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});