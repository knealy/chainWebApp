// src/sessionManager.js

// In-memory storage for sessions and API keys
const sessions = {};

// Function to create a new session
function createSession(userId) {
    const sessionId = generateSessionId();
    sessions[sessionId] = { userId, apiKeys: [] };
    return sessionId;
}

// Function to retrieve a session by sessionId
function getSession(sessionId) {
    return sessions[sessionId] || null;
}

// Function to destroy a session
function destroySession(sessionId) {
    delete sessions[sessionId];
}

// Function to add an API key to a session
function addApiKey(sessionId, apiKey) {
    const session = getSession(sessionId);
    if (session) {
        session.apiKeys.push(apiKey);
    }
}

// Function to retrieve API keys for a session
function getApiKeys(sessionId) {
    const session = getSession(sessionId);
    return session ? session.apiKeys : [];
}

// Function to remove an API key from a session
function removeApiKey(sessionId, apiKey) {
    const session = getSession(sessionId);
    if (session) {
        session.apiKeys = session.apiKeys.filter(key => key !== apiKey);
    }
}

// Helper function to generate a unique session ID
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other modules
module.exports = {
    createSession,
    getSession,
    destroySession,
    addApiKey,
    getApiKeys,
    removeApiKey
};

