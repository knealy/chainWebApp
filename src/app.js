// Add this function for better error handling
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    alert(`An error occurred in ${context}. Check console for details.`);
}


async function makeRequest(url, data) {
    try {
        console.log('Making request to:', url, 'with data:', data); // Add logging

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status); // Add logging

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Request failed:', {
            url,
            error: error.message,
            data
        });
        throw error;
    }
}

async function fetchAndDisplayApis() {
    try {
        const response = await fetch('/api-connections');
        const data = await response.json();
        const apiList = document.getElementById('apiList');
        
        if (!apiList) {
            console.error('API list element not found');
            return;
        }

        // Clear existing items
        apiList.innerHTML = '';

        if (data.connections && Array.isArray(data.connections)) {
            if (data.connections.length > 0) {
                data.connections.forEach(connection => {
                    const shortenedUrl = shortenUrl(connection.apiUrl);
                    
                    const listItem = document.createElement('li');
                    listItem.className = 'api-item';
                    
                    listItem.innerHTML = `
                        <input type="checkbox" 
                            class="chain-checkbox" 
                            data-id="${connection.id}"
                            title="Select this API for chain linking">
                        <span class="api-name" 
                            title="API Name: ${connection.name}">${connection.name}</span>
                        <span class="api-details">
                            <span class="api-url" 
                                title="Full URL: ${connection.apiUrl}">URL: ${shortenedUrl}</span>
                        </span>
                        <span class="api-status ${connection.status === 'active' ? 'active' : 'inactive'}"
                            title="${connection.status === 'active' ? 'API is currently active' : 'API is currently inactive'}">
                            ${connection.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <div class="api-controls">
                            <button class="api-test-btn" 
                                data-id="${connection.id}"
                                title="Test the connection to this API">Test</button>
                            <button class="api-delete-btn" 
                                data-id="${connection.id}"
                                title="Delete this API connection">Delete</button>
                        </div>
                    `;

                    // Add event listeners for buttons
                    const deleteBtn = listItem.querySelector('.api-delete-btn');
                    const testBtn = listItem.querySelector('.api-test-btn');
                    
                    deleteBtn.addEventListener('click', () => deleteApiConnection(connection.id));
                    testBtn.addEventListener('click', () => testApiConnection(connection.id));

                    apiList.appendChild(listItem);
                });
            } else {
                apiList.innerHTML = '<li class="no-apis">No API connections available</li>';
            }

            // Add tooltips to the container buttons
            const addApiButton = document.querySelector('.add-api-button');
            if (addApiButton) {
                addApiButton.title = "Add a new API connection";
            }

            const combineChainsButton = document.querySelector('.combineChainsButton');
            if (combineChainsButton) {
                combineChainsButton.title = "Combine selected chain links into a workflow";
            }

            const addChainLinkBtn = document.querySelector('.add-chain-link-btn');
            if (addChainLinkBtn) {
                addChainLinkBtn.title = "Create a new chain link using connected APIs";
            }

            // Add tooltips to form elements
            const apiNameInput = document.getElementById('apiName');
            if (apiNameInput) {
                apiNameInput.title = "Enter a descriptive name for this API connection";
            }

            const apiUrlInput = document.getElementById('apiUrl');
            if (apiUrlInput) {
                apiUrlInput.title = "Enter the base URL for the API (e.g., api.example.com)";
            }

            const apiKeyInput = document.getElementById('apiKey');
            if (apiKeyInput) {
                apiKeyInput.title = "Enter your API authentication key";
            }

            const webhookUrlInput = document.getElementById('webhookUrl');
            if (webhookUrlInput) {
                webhookUrlInput.title = "Optional: Enter a webhook URL for API callbacks";
            }

            // Add tooltips to select elements
            const apiSelect = document.getElementById('api-select');
            if (apiSelect) {
                apiSelect.title = "Select an API to use for this chain link";
            }

            const eventSelect = document.getElementById('event-select');
            if (eventSelect) {
                eventSelect.title = "Select a trigger event for this chain link";
            }

            const actionSelect = document.getElementById('action-select');
            if (actionSelect) {
                actionSelect.title = "Select an action to perform when triggered";
            }

        } else {
            console.warn('Invalid data format received:', data);
            apiList.innerHTML = '<li class="error">Failed to load API connections</li>';
        }
    } catch (error) {
        console.error('Error fetching API connections:', error);
        if (apiList) {
            apiList.innerHTML = '<li class="error">Failed to load API connections</li>';
        }
    }
}

// Helper function to shorten URLs
function shortenUrl(url) {
    try {
        // Remove protocol (http:// or https://)
        let shortened = url.replace(/^(https?:\/\/)/, '');
        
        // Remove www. if present
        shortened = shortened.replace(/^www\./, '');
        
        // Remove trailing slash
        shortened = shortened.replace(/\/$/, '');
        
        // If URL is still too long, truncate it
        if (shortened.length > 30) {
            shortened = shortened.substring(0, 27) + '...';
        }
        
        return shortened;
    } catch (error) {
        console.error('Error shortening URL:', error);
        return url; // Return original URL if there's an error
    }
}

async function testApiConnection(apiId) {
    try {
        const response = await fetch(`/test-api/${apiId}`);
        const data = await response.json();
        if(data.success) {
            alert('API Connection is valid.');
        } else {
            alert('API Connection test failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error testing API connection:', error);
        alert('An error occurred while testing the API connection.');
    }
}

function editApiConnection(apiId) {
    // Implement edit functionality
    alert(`Edit functionality for API ID: ${apiId} is not implemented yet.`);
}



async function deleteApiConnection(apiId) {
    if(confirm('Are you sure you want to delete this API connection?')) {
        try {
            const response = await fetch(`/delete-api/${apiId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if(data.success) {
                alert('API Connection deleted successfully.');
                fetchAndDisplayApis(); // Refresh the list
            } else {
                alert('Failed to delete API connection: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting API connection:', error);
            alert('An error occurred while deleting the API connection.');
        }
    }
}

function handleApiAction(apiId, action) {
    switch(action) {
        case 'test':
            testApiConnection(apiId);
            break;
        case 'edit':
            editApiConnection(apiId);
            break;
        case 'delete':
            deleteApiConnection(apiId);
            break;
        default:
            console.warn('Unknown action:', action);
    }
}

// Modify handleApiFormSubmit to update the list automatically
async function handleApiFormSubmit(event) {
    event.preventDefault();
    const apiName = document.getElementById('apiName')?.value.trim();
    const apiUrl = document.getElementById('apiUrl')?.value.trim();
    const apiKey = document.getElementById('apiKey')?.value.trim();
    const webhookUrl = document.getElementById('webhookUrl')?.value.trim();
    const apiModal = document.getElementById('apiModal');

    if (!apiName || !apiUrl || !apiKey) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        const response = await makeRequest('/connect-api', {
            apiName,
            apiUrl,
            apiKey,
            webhookUrl
        });

        if (response.success) {
            alert('API connected successfully!');
            await fetchAndDisplayApis();
            await updateApiDropdown();

            if (apiModal) {
                apiModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
            event.target.reset();
        } else {
            console.error('Failed to connect API:', response.message);
            alert('Failed to connect API: ' + response.message);
        }
    } catch (error) {
        console.error('Error connecting API:', error);
        alert('An error occurred while connecting to the API.');
    }
}



// Form handlers
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!username || !password) {
        alert('Please enter valid credentials.');
        return;
    }

    try {
        const response = await makeRequest('/login', { username, password });
        if (response.success) {
            alert('Login successful!');
            // window.location.href = '/main';
            window.location.href = '/main.html'; // Ensure correct redirection
        } else {
            alert('Login failed: ' + response.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again later.');
    }
}

async function handleRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;

    if (!username || !email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await makeRequest('/register', { username, email, password });
        if (response.success) {
            alert('Registration successful! You can now log in.');
        } else {
            alert('Registration failed: ' + response.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again later.');
    }
}

function handleNewChain() {
    const chainName = prompt('Enter the name of the new chain reaction:');
    const chainTrigger = prompt('Enter the trigger for the chain reaction:');
    const chainAction = prompt('Enter the action for the chain reaction:');

    if (!chainName || !chainTrigger || !chainAction) {
        alert('Please fill in all fields.');
        return;
    }

    createChainRequest(chainName, chainTrigger, chainAction)
        .then(response => {
            if (response.success) {
                alert('Chain reaction created successfully!');
            } else {
                alert('Failed to create chain reaction: ' + response.message);
            }
        })
        .catch(error => {
            console.error('Error creating chain reaction:', error);
            alert('An error occurred. Please try again later.');
        });
}


// Function to combine multiple chain links into a single workflow
async function combineChainLinks(chainIds) {
    try {
        const response = await makeRequest('/combine-chain-links', { chainIds });
        if (response.success) {
            alert('Chain links combined successfully!');
            await fetchAndDisplayChainLinks(); // Refresh the list
        } else {
            throw new Error(response.message || 'Failed to combine chain links');
        }
    } catch (error) {
        console.error('Error combining chain links:', error);
        alert('An error occurred while combining chain links. Please try again.');
    }
}

// API Key Management
function addApiKey(key) {
    if (!key) return;
    apiKeys.push(key);
    try {
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
        console.log('API Key added:', key);
    } catch (error) {
        console.error('Error saving API key:', error);
    }
}

function removeApiKey(key) {
    if (!key) return;
    apiKeys = apiKeys.filter(k => k !== key);
    try {
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
        console.log('API Key removed:', key);
    } catch (error) {
        console.error('Error removing API key:', error);
    }
}

function listApiKeys() {
    return [...apiKeys]; // Return a copy to prevent direct manipulation
}

function createDynamicFunction(trigger, action) {
    if (!trigger || !action) return;
    
    const newFunction = { trigger, action };
    dynamicFunctions.push(newFunction);
    try {
        localStorage.setItem('dynamicFunctions', JSON.stringify(dynamicFunctions));
        console.log('Dynamic function created:', newFunction);
    } catch (error) {
        console.error('Error saving dynamic function:', error);
    }
}

function listDynamicFunctions() {
    return [...dynamicFunctions]; // Return a copy to prevent direct manipulation
}


async function handleNewApiConnection(event) {
    event.preventDefault();
    const name = document.getElementById('apiName').value.trim();
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!name || !apiUrl || !apiKey) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const formattedUrl = validateAndFormatApiUrl(apiUrl);
        const response = await makeRequest('/api-connection', {
            name,
            apiUrl: formattedUrl,
            apiKey
        });

        if (response.success) {
            alert('API connection created successfully!');
            document.getElementById('apiForm').reset();
            await fetchAndDisplayApis();
        } else {
            throw new Error(response.message || 'Failed to create API connection');
        }
    } catch (error) {
        console.error('Error creating API connection:', error);
        alert(`Failed to create API connection: ${error.message}`);
    }
}

// Add this function to show loading state
function setDropdownLoading(selectElement, isLoading) {
    if (!selectElement) return;
    
    selectElement.disabled = isLoading;
    if (isLoading) {
        selectElement.innerHTML = '<option value="">Loading...</option>';
    }
}

// Function to update API dropdown with available connections
async function updateApiDropdown() {
    const apiSelect = document.getElementById('api-select');
    if (!apiSelect) return;

    setDropdownLoading(apiSelect, true);
    try {
        const response = await fetch('/api-connections');
        const data = await response.json();

        const apiSelect = document.getElementById('api-select');
        if (!apiSelect) return;

        apiSelect.innerHTML = '<option value="">Select an API</option>';
        
        if (data.success && data.connections) {
            data.connections.forEach(connection => {
                if (connection.status === 'active') {  // Only add active APIs
                    const option = document.createElement('option');
                    option.value = connection.id;
                    option.textContent = connection.name;
                    apiSelect.appendChild(option);
                }
            });

            // Enable/disable the select based on whether there are any options
            const hasOptions = apiSelect.options.length > 1;
            apiSelect.disabled = !hasOptions;
            
            // Update dependent dropdowns
            if (hasOptions) {
                const eventSelect = document.getElementById('event-select');
                const actionSelect = document.getElementById('action-select');
                if (eventSelect) eventSelect.disabled = true;
                if (actionSelect) actionSelect.disabled = true;
            }
            console.log('API dropdown updated successfully');
        } else {
            console.warn('No active APIs available for dropdown');
        }
    } catch (error) {
        console.error('Error updating API dropdown:', error);
        apiSelect.innerHTML = '<option value="">Error loading APIs</option>';
        // apiSelect.disabled = true;
    } finally {
        setDropdownLoading(apiSelect, false);
    }
}

async function updateEventActionDropdowns(apiId) {
    const eventSelect = document.getElementById('event-select');
    const actionSelect = document.getElementById('action-select');
    
    if (!eventSelect || !actionSelect) {
        console.error('Could not find select elements');
        return;
    }

    try {
        // Set loading state
        eventSelect.innerHTML = '<option value="">Loading triggers...</option>';
        actionSelect.innerHTML = '<option value="">Loading actions...</option>';
        eventSelect.disabled = true;
        actionSelect.disabled = true;

        // Add debug logging
        console.log('Fetching events/actions for API ID:', apiId);
        const url = `/api-events-actions/${apiId}`;
        console.log('Requesting URL:', url);

        // Fetch events and actions for the selected API
        const response = await fetch(url);
        
        // Log response status
        console.log('Response status:', response.status);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON but got ${contentType}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        // Reset dropdowns
        eventSelect.innerHTML = '<option value="">Choose a Trigger</option>';
        actionSelect.innerHTML = '<option value="">Choose an Action</option>';
        
        if (data.success) {
            // Populate events
            if (Array.isArray(data.events)) {
                data.events.forEach(event => {
                    const option = document.createElement('option');
                    option.value = event.id;
                    option.textContent = event.name;
                    eventSelect.appendChild(option);
                });
            }

            // Populate actions
            if (Array.isArray(data.actions)) {
                data.actions.forEach(action => {
                    const option = document.createElement('option');
                    option.value = action.id;
                    option.textContent = action.name;
                    actionSelect.appendChild(option);
                });
            }

            // Enable dropdowns
            eventSelect.disabled = false;
            actionSelect.disabled = false;
        } else {
            throw new Error(data.message || 'Failed to load events and actions');
        }
    } catch (error) {
        console.error('Error updating dropdowns:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Set error state
        eventSelect.innerHTML = '<option value="">Error loading triggers</option>';
        actionSelect.innerHTML = '<option value="">Error loading actions</option>';
        eventSelect.disabled = true;
        actionSelect.disabled = true;

        // Show user-friendly error message
        const errorMessage = error.message.includes('<!DOCTYPE') 
            ? 'Server error: API endpoint not responding correctly'
            : `Error: ${error.message}`;
        alert(errorMessage);
    }
}
async function handleApiChainEvent(event) {
    event.preventDefault();
    const chainName = document.getElementById('chainLinkName')?.value.trim();
    const apiId = document.getElementById('api-select')?.value;
    const trigger = document.getElementById('event-select')?.value;
    const action = document.getElementById('action-select')?.value;
    console.log('Form values:', { chainName, apiId, trigger, action }); // Debug log

    if (!chainName || !apiId || !trigger || !action) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        console.log('Creating chain with:', { // Add logging
            chainName,
            apiId,
            trigger,
            action
        });

        const response = await makeRequest('/create-chain-link', {
            name: chainName,
            apiId: parseInt(apiId),
            trigger,
            action
        });

        if (response.success) {
            alert('Chain reaction created successfully!');
            hideChainLinkForm();
            await fetchAndDisplayChainLinks(); // Refresh the list
        } else {
            throw new Error(response.message || 'Failed to create chain reaction');
        }
    } catch (error) {
        console.error('Error creating chain reaction:', {
            error: error.message,
            stack: error.stack
        });
        alert('An error occurred while creating the chain reaction. Please try again.');
    }
}

async function testChainLink(chainId) {
    try {
        // First, fetch the chain link details
        const response = await fetch('/chain-links');
        const data = await response.json();
        const chainLink = data.chainLinks.find(chain => chain.id === chainId);
        
        if (!chainLink) {
            throw new Error('Chain link not found');
        }

        console.log('Found chain link:', chainLink);

        // Get the API connection details
        const apiResponse = await fetch('/api-connections');
        const apiData = await apiResponse.json();
        
        console.log('API Connections response:', apiData);

        if (!apiData.success || !apiData.connections) {
            throw new Error('Failed to fetch API connections');
        }

        const apiConnection = apiData.connections.find(api => api.id === chainLink.apiId);

        if (!apiConnection) {
            throw new Error(`API connection not found for ID: ${chainLink.apiId}`);
        }

        if (!apiConnection.apiUrl) {
            throw new Error(`API URL is missing for connection: ${apiConnection.name}`);
        }

        console.log('Found API connection:', {
            id: apiConnection.id,
            name: apiConnection.name,
            url: apiConnection.apiUrl
        });

        // Construct the base URL properly
        let baseUrl = apiConnection.apiUrl;
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        console.log('Using base URL:', baseUrl);

        // Use functionManager to test the chain
        const testResult = await functionManager.testChainLink(
            chainId,
            chainLink.trigger,
            chainLink.action,
            {
                apiUrl: baseUrl,
                apiKey: apiConnection.apiKey,
                headers: {
                    'Authorization': `Bearer ${apiConnection.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-API-Key': apiConnection.apiKey
                }
            }
        );

        if (testResult.success) {
            console.log('Test successful:', testResult);
            alert(`Test successful!\n\nTrigger: ${testResult.details.triggerResult.type}\nAction: ${testResult.details.actionResult.type}`);
        } else {
            throw new Error(testResult.message);
        }
    } catch (error) {
        console.error('Error testing chain:', {
            error: error.message,
            chainId,
            stack: error.stack,
            fullError: error
        });
        alert(`Error testing chain link: ${error.message}\n\nPlease check the console for more details.`);
    }
}

function validateAndFormatApiUrl(url) {
    try {
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        const urlObj = new URL(url);
        return urlObj.toString().replace(/\/$/, ''); // Remove trailing slash
    } catch (error) {
        console.error('Invalid API URL:', error);
        throw new Error('Invalid API URL format');
    }
}

// Add this function to fetch and display chain links with checkboxes
async function fetchAndDisplayChainLinks() {
    try {
        const response = await fetch('/chain-links');
        const data = await response.json();
        const chainList = document.getElementById('chainList');
        
        if (!chainList) return;

        // Clear existing list
        chainList.innerHTML = '';

        if (data.success && data.chainLinks) {
            data.chainLinks.forEach(chain => {
                // Create list item for chainList
                const listItem = document.createElement('li');
                listItem.className = 'chain-list-item';
                
                listItem.innerHTML = `
                    <input type="checkbox" class="chain-checkbox" data-id="${chain.id}">
                    <span class="chain-name">${chain.name}</span>
                    <span class="chain-details">
                        <span class="chain-trigger">Trigger: ${chain.trigger}</span>
                        <span class="chain-action">Action: ${chain.action}</span>
                    </span>
                    <span class="chain-status ${chain.status}">${chain.status}</span>
                    <div class="chain-controls">
                        <button class="chain-test-btn" data-id="${chain.id}">Test</button>
                        <button class="chain-delete-btn" data-id="${chain.id}">Delete</button>
                    </div>
                `;

                // Add event listeners for buttons
                const deleteBtn = listItem.querySelector('.chain-delete-btn');
                const testBtn = listItem.querySelector('.chain-test-btn');
                
                deleteBtn.addEventListener('click', () => deleteChainLink(chain.id));
                testBtn.addEventListener('click', () => testChainLink(chain.id));

                chainList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error fetching chain links:', error);
    }
}

// Function to create a new chain link
async function createChainLink(name, trigger, action, apiId) {
    try {
        const response = await fetch('/create-chain-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, trigger, action, apiId })
        });

        const data = await response.json();
        if (data.success) {
            fetchAndDisplayChainLinks(); // Refresh the list
            return data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error creating chain link:', error);
        throw error;
    }
}

// Function to delete a chain link
async function deleteChainLink(chainId) {
    if (!confirm('Are you sure you want to delete this chain link?')) return;

    try {
        const response = await fetch(`/delete-chain/${chainId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            fetchAndDisplayChainLinks(); // Refresh the list
        } else {
            alert('Failed to delete chain link: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting chain link:', error);
        alert('Error deleting chain link');
    }
}



// Function to register triggers and actions dynamically
function registerDynamicTriggerAndAction(triggerName, actionName) {
    // Register a sample trigger
    functionManager.registerTrigger(triggerName, async () => {
        // Example trigger logic
        console.log('Trigger executed with name:', triggerName);
        return { value: Math.random() * 100 };
    });

    // Register a sample action
    functionManager.registerAction(actionName, (data) => {
        // Example action logic
        console.log('Action executed with data:', data);
    });
}


function showChainLinkForm() {
    const chainLinkForm = document.getElementById('chainLinkForm');
    if (chainLinkForm) {
        chainLinkForm.style.display = 'block';
        document.body.classList.add('modal-open');
        updateApiDropdown();
    }
}

function hideChainLinkForm() {
    const chainLinkForm = document.getElementById('chainLinkForm');
    if (chainLinkForm) {
        chainLinkForm.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function hideApiModal() {
    const apiModal = document.getElementById('apiModal');
    if (apiModal) {
        apiModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function validateFormValues() {
    const chainName = document.getElementById('chainLinkName')?.value;
    const apiId = document.getElementById('api-select')?.value;
    const trigger = document.getElementById('event-select')?.value;
    const action = document.getElementById('action-select')?.value;

    console.log('Form values:', {
        chainName,
        apiId,
        trigger,
        action,
        elements: {
            chainNameFound: !!document.getElementById('chainLinkName'),
            apiSelectFound: !!document.getElementById('api-select'),
            eventSelectFound: !!document.getElementById('event-select'),
            actionSelectFound: !!document.getElementById('action-select')
        }
    });

    return { chainName, apiId, trigger, action };
}

/**
 * Retrieves the IDs of all selected chain links.
 * Assumes that each chain link has a checkbox with the class 'chain-checkbox'
 * and a data attribute 'data-id' containing its unique ID.
 *
 * @returns {number[]} Array of selected chain IDs
 */
function getSelectedChainIds() {
    const selectedCheckboxes = document.querySelectorAll('.chain-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-id')));
    return selectedIds;
}

// Cleanup function for removing event listeners
function cleanup() {
    if (loginForm) loginForm.removeEventListener('submit', handleLogin);
    if (registrationForm) registrationForm.removeEventListener('submit', handleRegistration);
    if (newChainButton) newChainButton.removeEventListener('click', handleNewChain);
    if (apiForm) apiForm.removeEventListener('submit', handleApiFormSubmit);
    if (closeButton) closeButton.removeEventListener('click', () => {});
    if (addChainLinkBtn) addChainLinkBtn.removeEventListener('click', showChainLinkForm);
    if (chainLinkForm) chainLinkForm.removeEventListener('submit', handleApiChainEvent);
    // Remove window click event listener
    window.removeEventListener('click', () => {});
}

// Add this function before the event listener
function conditionFunction(data) {
    // Default condition that always returns true
    // You can modify this to add specific conditions
    return true;
}

function generateUniqueId(name, url) {
    return `${name}_${url}`.replace(/[^a-zA-Z0-9]/g, '_');
}

// Function to update the username display
function updateUsernameDisplay(username) {
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = username || 'Guest';
    }
}

// Function to get the current user's info
async function getCurrentUser() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        updateUsernameDisplay(userData?.username);
        return userData;
    } catch (error) {
        console.error('Error getting user data:', error);
        updateUsernameDisplay(null);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('functionManager availability:', window.functionManager);

    // Get all elements
    const elements = {
        apiModal: document.getElementById('apiModal'),
        closeButton: document.querySelector('.close-button'),
        apiForm: document.getElementById('apiForm'),
        addApiButton: document.querySelector('.add-api-button'),
        createWorkflowButton: document.getElementById('createWorkflowButton'),
        saveButton: document.querySelector('.save-button'),
        apiSelect: document.getElementById('api-select'),
        loginForm: document.getElementById('login-form'),
        registrationForm: document.getElementById('registration-form'),
        newChainButton: document.querySelector('.new-chain-button'),
        addApiEventButton: document.querySelector('.add-api-event'),
        eventSelect: document.getElementById('event-select'),
        actionSelect: document.getElementById('action-select'),
        apiEvents: document.getElementById('api-events'),
        apiActions: document.getElementById('api-actions'),
        apiConnections: document.getElementById('api-connections'),
        apiKeyInput: document.getElementById('apiKey'),
        webhookUrlInput: document.getElementById('webhookUrl'),
        apiNameInput: document.getElementById('apiName'),
        apiUrlInput: document.getElementById('apiUrl'),
        regUsername: document.getElementById('reg-username'),
        regEmail: document.getElementById('reg-email'),
        regPassword: document.getElementById('reg-password'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),    
        addChainLinkBtn : document.querySelector('.add-chain-link-btn'),
        chainLinkForm : document.getElementById('new-chain-link-form'),
        chainLogoContainer : document.querySelector('.chain-logo-container'),
        userInfo : document.querySelector('.user-info'),
        userInfoUsername : document.querySelector('.username'),
        userInfoLogout : document.querySelector('.logout-button'),
        userInfoRegister : document.querySelector('.register-button'),
        userInfoLogin : document.querySelector('.login-button'),    
        userInfoLogout : document.querySelector('.logout-button'),
        userInfoProfile : document.querySelector('.profile-button'),
        combinedChainsButton : document.querySelector('.combineChainsButton')
    };

    // Debug log all found elements
    console.log('Elements found:', {
        apiModal: !!elements.apiModal,
        closeButton: !!elements.closeButton,
        apiForm: !!elements.apiForm,
        addApiButton: !!elements.addApiButton,
        createWorkflowButton: !!elements.createWorkflowButton,
        saveButton: !!elements.saveButton,
        apiSelect: !!elements.apiSelect,
        loginForm: !!elements.loginForm,
        registrationForm: !!elements.registrationForm,
        newChainButton: !!elements.newChainButton,
        addApiEventButton: !!elements.addApiEventButton,
        eventSelect: !!elements.eventSelect,
        actionSelect: !!elements.actionSelect,
        apiEvents: !!elements.apiEvents,
        apiActions: !!elements.apiActions,
        apiConnections: !!elements.apiConnections,
        apiKeyInput: !!elements.apiKeyInput,
        webhookUrlInput: !!elements.webhookUrlInput,
        apiNameInput: !!elements.apiNameInput,
        apiUrlInput: !!elements.apiUrlInput,
        regUsername: !!elements.regUsername,
        regEmail: !!elements.regEmail,
        regPassword: !!elements.regPassword,
        username: !!elements.username,
        password: !!elements.password,
        addChainLinkBtn : !!elements.addChainLinkBtn,
        chainLinkForm : !!elements.newChainLinkForm,
        chainLogoContainer : !!elements.chainLogoContainer,
        userInfo : !!elements.userInfo,
        userInfoUsername : !!elements.userInfoUsername,
        userInfoLogout : !!elements.userInfoLogout,
        userInfoRegister : !!elements.userInfoRegister,
        userInfoLogin : !!elements.userInfoLogin,
        combinedChainsButton : !!elements.combinedChainsButton
    });

    // Check if functionManager is available    s
    if (!window.functionManager) {
        console.error('functionManager not loaded!');
    } else {
        console.log('functionManager loaded successfully');
    }
    
    // Initialize API keys and dynamic functions with error handling
    let apiKeys = [];
    let dynamicFunctions = [];

    // Handle login form submission
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    if (elements.registrationForm) {
        elements.registrationForm.addEventListener('submit', handleRegistration);
    }

    if (elements.userInfo) {
        elements.userInfo.addEventListener('click', function() {
            elements.userInfo.classList.toggle('open');
        });
    }

    if (elements.userInfoLogout) {
        elements.userInfoLogout.addEventListener('click', function() {
            localStorage.removeItem('userData');
            window.location.reload();
        });
    }   

    if (elements.userInfoRegister) {
        elements.userInfoRegister.addEventListener('click', function() {
            elements.userInfoRegister.classList.toggle('open');
        });
    }   

    if (elements.userInfoLogin) {
        elements.userInfoLogin.addEventListener('click', function() {
            elements.userInfoLogin.classList.toggle('open');
        });
    }   

    if (elements.userInfoProfile) {
        elements.userInfoProfile.addEventListener('click', function() {
            elements.userInfoProfile.classList.toggle('open');
        });
    }   

    if (elements.usernameElement) {
        elements.usernameElement.addEventListener('click', function() {
            elements.usernameElement.classList.toggle('open');
        });
    }


    
    if (elements.chainLogoContainer) {
        elements.chainLogoContainer.addEventListener('click', function() {
            this.classList.add('spinning');
             // Remove the class when animation ends to allow it to be triggered again
            this.addEventListener('animationend', function() {
                this.classList.remove('spinning');
            }, {once: true});
        });
    }

    // Add API button
    if (elements.addApiButton && elements.apiModal) {
        elements.addApiButton.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                console.log('Add API button clicked');
                const apiModal = elements.apiModal;
                if (apiModal) {
                    apiModal.style.display = 'block';
                    document.body.classList.add('modal-open'); // Add class when modal is open
                }
            } catch (error) {
                handleError(error, 'Add API button click');
            }
        });
    }
    // close button
    if (elements.closeButton && elements.apiModal) {
        elements.closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Close button clicked');
            document.body.classList.remove('modal-open'); // Remove class when modal is closed
            apiModal.style.display = 'none';
        });
    }
    // API Form submit button
    if (elements.apiForm) {
        elements.apiForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form submitted');
            try {
                await handleApiFormSubmit(event);
                // Clear form and hide modal on success
                elements.apiForm.reset();
                elements.apiModal.style.display = 'none';
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        });
    }

    // In your DOMContentLoaded event listener
    if (elements.apiSelect) {
        console.log('Setting up API select change listener'); // Debug log
        elements.apiSelect.addEventListener('change', (e) => {
            console.log('API select changed to:', e.target.value); // Debug log
            updateEventActionDropdowns(e.target.value);
        });
    } else {
        console.error('API select element not found');
    }



    // Inside the createWorkflowButton click handler
    if (elements.createWorkflowButton) {
        elements.createWorkflowButton.addEventListener('click', async () => {
            const apiId = elements.apiSelect.value;
            const trigger = elements.eventSelect.value;
            const action = elements.actionSelect.value;
            const workflowName = `Workflow-${apiId}-${trigger}-${action}`;

            if (!apiId || !trigger || !action) {
                alert('Please select an API, trigger, and action.');
                return;
            }

            try {
                registerDynamicTriggerAndAction(trigger, action);
                functionManager.createDynamicFunction(
                    workflowName,
                    trigger,
                    conditionFunction,
                    action
                );
                await createChainLink(workflowName, trigger, action, apiId);
                alert('Workflow created successfully!');
            } catch (error) {
                console.error('Error creating workflow:', error);
                alert(`Error creating workflow: ${error.message}`);
            }
        });
    }

    // Add API event button and combine chain links button 
    if (elements.addApiEventButton) {
        elements.addApiEventButton.addEventListener('choose-api-action', handleApiChainEvent);
    }

    if (elements.combinedChainsButton) {
        elements.combinedChainsButton.addEventListener('click', async () => {
            const selectedChainIds = getSelectedChainIds();
            if (selectedChainIds.length < 2) {
                alert('Please select at least two chain links to combine.');
                return;
            }

            try {
                const response = await fetch('/combine-chains', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ chainIds: selectedChainIds })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Chains combined successfully!');
                    // Optionally, refresh the chain links list
                    fetchAndDisplayChainLinks();
                } else {
                    alert('Failed to combine chains: ' + data.message);
                }
            } catch (error) {
                console.error('Error combining chains:', error);
                alert('An error occurred while combining chains.');
            }
        });
    } else {
        console.error('Combine Chains button not found in the DOM.');
    }

    // New chain button 
    if (elements.newChainButton && elements.apiModal) {
        elements.newChainButton.addEventListener('click', () => {
            handleNewChain();
            elements.apiModal.style.display = 'block';
        });
    }

    // Save workflow button
    if (elements.saveButton) {
        elements.saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleSaveWorkflow();  // Make sure this function exists
        });
    }
    // Add Chain Link button handler
    if (elements.addChainLinkBtn) {
        elements.addChainLinkBtn.addEventListener('click', showChainLinkForm);
    }

    // Chain Link form handler
    if (elements.chainLinkForm) {
        console.log('Found chain link form, attaching submit handler');
        elements.chainLinkForm.addEventListener('submit', handleApiChainEvent);
    } else {
        console.error('Chain link form not found');
    }

    // Load API keys and dynamic functions from localStorage    
    try {
        apiKeys = JSON.parse(localStorage.getItem('apiKeys')) || [];
        dynamicFunctions = JSON.parse(localStorage.getItem('dynamicFunctions')) || [];
    } catch (error) {
        console.error('Error parsing stored data:', error);
        // Reset to empty arrays if parsing fails
        apiKeys = [];
        dynamicFunctions = [];
    }

    // Call fetchAndDisplayApis initially and after connecting a new API
    fetchAndDisplayApis();
    // Initial load of API connections
    fetchAndDisplayChainLinks();

    updateApiDropdown();
    // Set up polling to refresh the list periodically (optional)
    setInterval(fetchAndDisplayApis, 30000); // Refresh every 30 seconds
    setInterval(fetchAndDisplayChainLinks, 30000); // Refresh every 30 seconds
    // Add cleanup to window unload event
    window.addEventListener('unload', cleanup);
});

// Example login handler
function handleLogin(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    handleLoginStateChange(userData);
}
