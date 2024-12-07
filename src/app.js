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

// Function to fetch and display connected APIs
async function fetchAndDisplayApis() {
    try {
        const response = await fetch('/api-connections');
        const data = await response.json();
        const apiList = document.getElementById('apiList');
        const apiSelect = document.getElementById('api-select');
        
        if (!apiList || !apiSelect) return;

        // Clear existing lists
        apiList.innerHTML = '';
        apiSelect.innerHTML = '<option value="">Select an API</option>';

        if (data.success && data.connections) {
            data.connections.forEach(connection => {
                // Create list item for apiList
                const listItem = document.createElement('li');
                listItem.className = 'api-list-item';
                
                // Add API name and status
                listItem.innerHTML = `
                    <span class="api-name">${connection.name}</span>
                    <span class="api-status ${connection.status}">${connection.status}</span>
                    <div class="api-controls">
                        <select class="api-action-select">
                            <option value="">Select Action</option>
                            <option value="test">Test Connection</option>
                            <option value="edit">Edit</option>
                            <option value="delete">Delete</option>
                        </select>
                        <button class="api-action-btn">Execute</button>
                    </div>
                `;

                // Add event listener for the action button
                const actionBtn = listItem.querySelector('.api-action-btn');
                const actionSelect = listItem.querySelector('.api-action-select');
                
                actionBtn.addEventListener('click', () => {
                    const selectedAction = actionSelect.value;
                    if (selectedAction) {
                        handleApiAction(connection.id, selectedAction);
                    }
                });

                apiList.appendChild(listItem);

                // Add option to api-select dropdown
                const option = document.createElement('option');
                option.value = connection.id;
                option.textContent = connection.name;
                apiSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching API connections:', error);
    }
}

// Function to handle API actions
async function handleApiAction(apiId, action) {
    try {
        switch (action) {
            case 'test':
                const testResponse = await fetch(`/test-api/${apiId}`);
                const testResult = await testResponse.json();
                alert(testResult.message);
                break;
            case 'edit':
                // Implement edit functionality
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this API connection?')) {
                    const deleteResponse = await fetch(`/delete-api/${apiId}`, { method: 'DELETE' });
                    const deleteResult = await deleteResponse.json();
                    if (deleteResult.success) {
                        fetchAndDisplayApis(); // Refresh the list
                    }
                }
                break;
        }
    } catch (error) {
        console.error('Error handling API action:', error);
        alert('Error executing action. Please try again.');
    }
}

// Modify handleApiFormSubmit to update the list automatically
async function handleApiFormSubmit(event) {
    event.preventDefault();
    const apiName = document.getElementById('apiName')?.value.trim();
    const apiUrl = document.getElementById('apiUrl')?.value.trim();
    const apiKey = document.getElementById('apiKey')?.value.trim();
    const webhookUrl = document.getElementById('webhookUrl')?.value.trim();

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
             // Refresh the list automatically
            await fetchAndDisplayApis(); // Ensure the list is refreshed
            console.log('Updated API connections:', response.connections); // Log updated connections
            elements.apiModal.style.display = 'none';
            event.target.reset(); // Clear the form
        } else {
            console.error('Failed to connect API:', response.message);
            alert('Failed to connect API: ' + response.message);
        }
    } catch (error) {
        console.error('Error connecting API:', error);
        alert('An error occurred while connecting to the API.');
    }
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


    // Add new API connection handling
async function handleNewApiConnection() {
    const apiName = prompt('Enter a name for this API connection:');
    if (!apiName) return;

    const apiUrl = prompt('Enter the API URL:');
    if (!apiUrl) return;

    const apiKey = prompt('Enter the API key:');
    if (!apiKey) return;

    const webhookUrl = prompt('Enter webhook URL (optional):');

    try {
        const response = await makeRequest('/connect-api', {
            apiName,
            apiUrl,
            apiKey,
            webhookUrl
        });

        if (response.success) {
            alert('API connected successfully!');
            updateApiDropdown();
        } else {
            alert('Failed to connect API: ' + response.message);
        }
    } catch (error) {
        console.error('Error connecting API:', error);
        alert('An error occurred while connecting to the API.');
    }

    if (apiModal) {
        apiModal.style.display = 'none';
    }
}

// Function to update API dropdown with available connections
async function updateApiDropdown() {
    try {
        const response = await fetch('/api-connections');
        const data = await response.json();

        const apiSelect = document.getElementById('api-select');
        if (!apiSelect) return;

        apiSelect.innerHTML = '<option value="">Select an API</option>';
        
        if (data.success && data.connections) {
            data.connections.forEach(connection => {
                const option = document.createElement('option');
                option.value = connection.id;
                option.textContent = connection.name;
                apiSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error updating API dropdown:', error);
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
        const response = await fetch(`/test-chain/${chainId}`, {
            method: 'POST'
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error testing chain:', error);
        alert('Error testing chain link');
    }
}

// Add this function to fetch and display chain links
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
                
                // Add chain details
                listItem.innerHTML = `
                    <span class="chain-name">${chain.name}</span>
                    <span class="chain-details">
                        <span class="chain-trigger">Trigger: ${chain.trigger}</span>
                        <span class="chain-action">Action: ${chain.action}</span>
                    </span>
                    <span class="chain-status ${chain.status}">${chain.status}</span>
                    <div class="chain-controls">
                        <button class="chain-delete-btn" data-id="${chain.id}">Delete</button>
                        <button class="chain-test-btn" data-id="${chain.id}">Test</button>
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
        updateApiDropdown(); 
    }
}

function hideChainLinkForm() {
    const chainLinkForm = document.getElementById('chainLinkForm');
    if (chainLinkForm) {
        chainLinkForm.style.display = 'none';
        // Reset the form
        const form = document.getElementById('newChainLinkForm');
        if (form) form.reset();
    }
}

function hideApiModal() {
    const apiModal = document.getElementById('apiModal');
    if (apiModal) {
        apiModal.style.display = 'none';
        const form = document.getElementById('apiForm');
        if (form) form.reset();
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
    });

    // Check if functionManager is available    
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

    // Add API button
    if (elements.addApiButton && elements.apiModal) {
        elements.addApiButton.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                console.log('Add API button clicked');
                const apiModal = elements.apiModal;
                if (apiModal) {
                    apiModal.style.display = 'block';
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
    const combineChainLinksButton = document.querySelector('.combine-chain-links-btn');
    if (combineChainLinksButton) {
        combineChainLinksButton.addEventListener('click', async () => {
            const selectedChainIds = getSelectedChainIds(); // Assume this function retrieves selected chain IDs
            if (selectedChainIds.length > 0) {
                await combineChainLinks(selectedChainIds);
            } else {
                alert('Please select at least two chain links to combine.');
            }
        });
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