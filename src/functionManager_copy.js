// src/functionManager.js

console.log('functionManager.js executing...');
window.functionManager = {};

// In-memory storage for IFTTT functions
const iftttFunctions = {};

// In-memory storage for user-defined triggers and actions
const userTriggers = {};
const userActions = {};

// Function to create a new IFTTT function
function createFunction(id, trigger, condition, action) {
    // Validate inputs
    if (!id || typeof id !== 'string') {
        throw new Error('Function ID must be a non-empty string');
    }
    
    if (typeof trigger !== 'function') {
        throw new Error('Trigger must be a function');
    }
    
    if (typeof condition !== 'function') {
        throw new Error('Condition must be a function');
    }
    
    if (typeof action !== 'function') {
        throw new Error('Action must be a function');
    }

    // Check if function already exists
    if (iftttFunctions[id]) {
        throw new Error(`Function with ID ${id} already exists`);
    }

    iftttFunctions[id] = {
        trigger,
        condition,
        action,
        created: new Date(),
        lastExecuted: null
    };

    return { id, ...iftttFunctions[id] };
}

// Function to save an IFTTT function
function saveFunction(id, trigger, condition, action) {
    iftttFunctions[id] = { trigger, condition, action };
}

// Function to execute an IFTTT function
async function executeFunction(id, context) {
    const func = iftttFunctions[id];
    if (!func) {
        throw new Error(`Function ${id} not found`);
    }

    if (func.enabled === false) {
        console.log(`Function ${id} is disabled`);
        return;
    }

    try {
        const triggerData = await func.trigger();
        if (func.condition(triggerData)) {
            await func.action(triggerData);
            func.lastExecuted = new Date();
            func.lastSuccess = true;
        }
    } catch (error) {
        func.lastError = error;
        func.lastSuccess = false;
        console.error(`Error executing function ${id}:`, error);
    }
}

// Example of a trigger function
function exampleTrigger() {
    // Logic to determine if the trigger condition is met
    return true;
}

// Example of a condition function
function exampleCondition(context) {
    // Logic to evaluate the condition based on the context
    return context.value > 10;
}

// Example of an action function
function exampleAction(context) {
    // Logic to perform the action
    console.log('Action executed with context:', context);
}

// Add function status management
function toggleFunction(id, enabled = true) {
    if (!iftttFunctions[id]) {
        throw new Error(`Function ${id} not found`);
    }
    iftttFunctions[id].enabled = enabled;
}

// Function to register a new trigger
function registerTrigger(name, triggerFunction) {
    if (typeof triggerFunction !== 'function') {
        throw new Error('Trigger must be a function');
    }
    this.userTriggers[name] = triggerFunction;
}

// Function to register a new action
function registerAction(name, actionFunction) {
    if (typeof actionFunction !== 'function') {
        throw new Error('Action must be a function');
    }
    this.userActions[name] = actionFunction;
}


// Function to create a new IFTTT function with dynamic trigger and action
function createDynamicFunction(id, triggerName, condition, actionName) {
    const trigger = this.userTriggers[triggerName];
    const action = this.userActions[actionName];

    if (!trigger) {
        throw new Error(`Trigger ${triggerName} not found`);
    }
    if (!action) {
        throw new Error(`Action ${actionName} not found`);
    }

    this.createFunction(id, trigger, condition, action);
}

// Example usage of registering and creating dynamic functions
registerTrigger('weatherTrigger', async () => {
    const response = await fetch('weather-api-url');
    return await response.json();
});

registerAction('sendNotification', (weatherData) => {
    console.log(`It's raining! Current precipitation: ${weatherData.precipitation}mm`);
});

createDynamicFunction(
    'rain-alert-dynamic',
    'weatherTrigger',
    (weatherData) => weatherData.precipitation > 0,
    'sendNotification'
);

window.functionManager = {
    createFunction,
    saveFunction,
    executeFunction,
    exampleTrigger,
    exampleCondition,
    exampleAction,
    toggleFunction,
    registerTrigger,
    registerAction,
    createDynamicFunction
};


// Add a console log to verify it's loaded
console.log('functionManager initialized:', window.functionManager);