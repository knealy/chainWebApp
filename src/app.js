// src/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize API keys and dynamic functions with error handling
    let apiKeys = [];
    let dynamicFunctions = [];
    
    try {
        apiKeys = JSON.parse(localStorage.getItem('apiKeys')) || [];
        dynamicFunctions = JSON.parse(localStorage.getItem('dynamicFunctions')) || [];
    } catch (error) {
        console.error('Error parsing stored data:', error);
        // Reset to empty arrays if parsing fails
        apiKeys = [];
        dynamicFunctions = [];
    }

    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Handle registration form submission
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Handle modal elements
    const apiModal = document.getElementById('apiModal');
    const closeButton = document.querySelector('.close-button');
    const apiForm = document.getElementById('apiForm');
    const addApiButton = document.querySelector('.add-api-button');
    const newChainButton = document.querySelector('.new-chain-button');

    // Add event listeners only if elements exist
    if (closeButton && apiModal) {
        closeButton.addEventListener('click', () => {
            apiModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === apiModal) {
                apiModal.style.display = 'none';
            }
        });
    }

    if (newChainButton && apiModal) {
        newChainButton.addEventListener('click', () => {
            handleNewChain();
            apiModal.style.display = 'block';
        });
    }

    if (addApiButton && apiModal) {
        addApiButton.addEventListener('click', () => {
            apiModal.style.display = 'block';
        });
    }

    if (apiForm) {
        apiForm.addEventListener('submit', handleApiFormSubmit);
    }


    // Standard request handler with error handling
    async function makeRequest(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add CSRF token if available
                    ...(document.querySelector('meta[name="csrf-token"]') && {
                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                    })
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
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
                updateApiDropdown();
                if (apiModal) {
                    apiModal.style.display = 'none';
                }
            } else {
                alert('Failed to connect API: ' + response.message);
            }
        } catch (error) {
            console.error('Error connecting API:', error);
            alert('An error occurred while connecting to the API.');
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

        // Add new API connection handling
    async function handleNewApiConnection() {
        if (apiModal) {
            apiModal.style.display = 'block';
        }
    }

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
                updateApiDropdown();
                if (apiModal) {
                    apiModal.style.display = 'none';
                }
            } else {
                alert('Failed to connect API: ' + response.message);
            }
        } catch (error) {
            console.error('Error connecting API:', error);
            alert('An error occurred while connecting to the API.');
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

    // Function to update events and actions dropdowns based on selected API
    async function updateEventActionDropdowns(apiId) {
        try {
            const response = await fetch(`/api-events/${apiId}`);
            const data = await response.json();

            const eventSelect = document.getElementById('event-select');
            const actionSelect = document.getElementById('action-select');

            if (!eventSelect || !actionSelect) return;

            // Clear existing options
            eventSelect.innerHTML = '<option value="">Select an Event</option>';
            actionSelect.innerHTML = '<option value="">Select an Action</option>';

            if (data.success) {
                // Populate events
                data.events.forEach(event => {
                    const option = document.createElement('option');
                    option.value = event.id;
                    option.textContent = event.name;
                    eventSelect.appendChild(option);
                });

                // Populate actions
                data.actions.forEach(action => {
                    const option = document.createElement('option');
                    option.value = action.id;
                    option.textContent = action.name;
                    actionSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error updating event/action dropdowns:', error);
        }
    }

    // Update handleApiFormSubmit
    async function handleApiFormSubmit(event) {
        event.preventDefault();
        const apiId = document.getElementById('api-select')?.value;
        const eventId = document.getElementById('event-select')?.value;
        const actionId = document.getElementById('action-select')?.value;

        if (!apiId || !eventId || !actionId) {
            alert('Please select an API, event, and action.');
            return;
        }

        try {
            const response = await makeRequest('/create-chain', {
                apiId: parseInt(apiId),
                eventId: parseInt(eventId),
                actionId: parseInt(actionId)
            });

            if (response.success) {
                alert('Chain reaction created successfully!');
                if (apiModal) {
                    apiModal.style.display = 'none';
                }
            } else {
                alert('Failed to create chain reaction: ' + response.message);
            }
        } catch (error) {
            console.error('Error creating chain reaction:', error);
            alert('An error occurred. Please try again later.');
        }
    }

    // Add event listeners for the new functionality
    const addApiButton = document.querySelector('.add-api-button');
    if (addApiButton) {
        addApiButton.addEventListener('click', handleNewApiConnection);
    }

    const apiSelect = document.getElementById('api-select');
    if (apiSelect) {
        apiSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                updateEventActionDropdowns(e.target.value);
            }
        });
    }

    // Initial load of API connections
    updateApiDropdown();

    // Cleanup function for removing event listeners
    function cleanup() {
        if (loginForm) loginForm.removeEventListener('submit', handleLogin);
        if (registrationForm) registrationForm.removeEventListener('submit', handleRegistration);
        if (newChainButton) newChainButton.removeEventListener('click', handleNewChain);
        if (apiForm) apiForm.removeEventListener('submit', handleApiFormSubmit);
        if (closeButton) closeButton.removeEventListener('click', () => {});
        // Remove window click event listener
        window.removeEventListener('click', () => {});
    }

    // Add cleanup to window unload event
    window.addEventListener('unload', cleanup);
});