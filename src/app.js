// src/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', handleLogin);

    // Initialize API keys and dynamic functions
    let apiKeys = JSON.parse(localStorage.getItem('apiKeys')) || [];
    let dynamicFunctions = 
JSON.parse(localStorage.getItem('dynamicFunctions')) || [];

    function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Validate form inputs
        if (!username || !password) {
            alert('Please enter valid credentials.');
            return;
        }

        // Send login request to the server
        loginRequest(username, password)
            .then(response => {
                if (response.success) {
                    alert('Login successful!');
                    showDashboard();
                } else {
                    alert('Login failed: ' + response.message);
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again later.');
            });
    }

    function loginRequest(username, password) {
        return fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json());
    }

    function showDashboard() {
        // Placeholder for showing the dashboard after login
        console.log('Dashboard displayed');
        // Here you would typically render the dashboard UI
    }

    function addApiKey(key) {
        apiKeys.push(key);
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
        console.log('API Key added:', key);
    }

    function removeApiKey(key) {
        apiKeys = apiKeys.filter(k => k !== key);
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
        console.log('API Key removed:', key);
    }

    function listApiKeys() {
        console.log('API Keys:', apiKeys);
        return apiKeys;
    }

    function createDynamicFunction(trigger, action) {
        const newFunction = { trigger, action };
        dynamicFunctions.push(newFunction);
        localStorage.setItem('dynamicFunctions', 
JSON.stringify(dynamicFunctions));
        console.log('Dynamic function created:', newFunction);
    }

    function listDynamicFunctions() {
        console.log('Dynamic Functions:', dynamicFunctions);
        return dynamicFunctions;
    }

    // Example usage
    addApiKey('example-api-key-123');
    createDynamicFunction('onDataReceived', 'sendEmail');
    listApiKeys();
    listDynamicFunctions();
});
