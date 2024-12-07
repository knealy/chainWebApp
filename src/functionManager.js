// src/functionManager.js
   console.log('functionManager.js executing...');
   // Define the functionManager object
   const functionManager = {
       userTriggers: {},
       userActions: {},

        // Add to functionManager object
        async testChainLink(chainId, trigger, action, apiConfig) {
            console.log(`Testing chain link ${chainId} with trigger: ${trigger}, action: ${action}`);
            
            try {
                // First test the trigger
                const triggerResult = await this.testTrigger(trigger, apiConfig);
                console.log('Trigger test result:', triggerResult);

                // Then test the action with the trigger result
                const actionResult = await this.testAction(action, triggerResult, apiConfig);
                console.log('Action test result:', actionResult);

                return {
                    success: true,
                    message: 'Test completed successfully',
                    details: {
                        triggerResult,
                        actionResult
                    }
                };
            } catch (error) {
                console.error('Test execution failed:', error);
                return {
                    success: false,
                    message: `Test failed: ${error.message}`,
                    error: error.stack
                };
            }
        },

        async testTrigger(trigger, apiConfig) {
            const triggerParts = trigger.split('.');
            const triggerType = triggerParts[0];
            const triggerAction = triggerParts[1];
        
            console.log('Testing trigger:', { triggerType, triggerAction, apiConfig });
        
            // Create the appropriate endpoint based on trigger type
            let endpoint = '';
            let params = new URLSearchParams();
            
            switch (triggerType) {
                case 'weather':
                    endpoint = '/data/2.5/weather';
                    params.append('q', 'London'); // Default city for testing
                    params.append('appid', apiConfig.apiKey);
                    break;
                case 'timer':
                    endpoint = '/api/timestamp';
                    break;
                case 'webhook':
                    endpoint = '/api/webhook/test';
                    break;
                default:
                    endpoint = `/api/${triggerType}/${triggerAction}`;
            }
        
            const url = new URL(endpoint, apiConfig.apiUrl);
            url.search = params.toString();
        
            try {
                console.log('Making trigger test request to:', url.toString());
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        ...apiConfig.headers,
                        'Accept': 'application/json'
                    }
                });
        
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
        
                const data = await response.json();
                console.log('Trigger test response:', data);
        
                return {
                    type: `${triggerType}_test`,
                    data: data,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error('Trigger test error:', {
                    error: error.message,
                    triggerType,
                    triggerAction,
                    endpoint
                });
                throw new Error(`Trigger test failed: ${error.message}`);
            }
        },
        
        async testAction(action, triggerData, apiConfig) {
            const actionParts = action.split('.');
            const actionType = actionParts[0];
            const actionCommand = actionParts[1];

            // Create the appropriate endpoint based on action type
            let endpoint = '';
            let method = 'POST';
            let body = {};

            switch (actionType) {
                case 'notification':
                    endpoint = '/notify';
                    body = {
                        message: `Test notification for ${actionCommand}`,
                        data: triggerData
                    };
                    break;
                case 'email':
                    endpoint = '/email';
                    body = {
                        to: 'test@example.com',
                        subject: `Test email for ${actionCommand}`,
                        body: JSON.stringify(triggerData)
                    };
                    break;
                case 'webhook':
                    endpoint = '/webhook';
                    body = triggerData;
                    break;
                default:
                    endpoint = `/${actionCommand}`;
                    body = triggerData;
            }

            try {
                const response = await fetch(`${apiConfig.apiUrl}${endpoint}`, {
                    method: method,
                    headers: apiConfig.headers,
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    throw new Error(`Action test failed: ${response.statusText}`);
                }

                const data = await response.json();
                return {
                    type: `${actionType}_test`,
                    data: data,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error('Action test error:', error);
                throw new Error(`Action test failed: ${error.message}`);
            }
        },

       registerTrigger: function(name, triggerFunction) {
           if (typeof triggerFunction !== 'function') {
               throw new Error('Trigger must be a function');
           }
           this.userTriggers[name] = triggerFunction;
           console.log(`Trigger registered: ${name}`);
       },

       registerAction: function(name, actionFunction) {
           if (typeof actionFunction !== 'function') {
               throw new Error('Action must be a function');
           }
           this.userActions[name] = actionFunction;
           console.log(`Action registered: ${name}`);
       },

       createDynamicFunction(id, triggerNames, condition, actionNames) {
        const triggers = triggerNames.map(name => {
            const trigger = this.userTriggers[name];
            if (!trigger) {
                throw new Error(`Trigger ${name} not found`);
            }
            return trigger;
        });

        const actions = actionNames.map(name => {
            const action = this.userActions[name];
            if (!action) {
                throw new Error(`Action ${name} not found`);
            }
            return action;
        });
        
        this.createCombinedFunction(id, triggers, condition, actions);
        console.log(`Dynamic function created: ${id}`);
        },


        createCombinedFunction(id, triggers, condition, actions) {
            console.log(`Combined function ${id} created with multiple triggers and actions.`);
            (async () => {
                try {
                    const results = await Promise.all(triggers.map(trigger => trigger()));
                    if (results.every(condition)) {
                        actions.forEach(action => action(results));
                    }
                } catch (error) {
                    console.error(`Error executing combined workflow ${id}:`, error);
                }
            })();
        },

        createFunction(id, trigger, condition, action) {
            console.log(`Function ${id} created with trigger, condition, and action.`);
            // Example: Execute the workflow
            (async () => {
                try {
                    const data = await trigger();
                    if (condition(data)) {
                        action(data);
                    }
                } catch (error) {
                    console.error(`Error executing workflow ${id}:`, error);
                }
            })();
        }
   };
    
   // Make it globally available
   window.functionManager = functionManager;
   console.log('functionManager initialized:', window.functionManager);

   
