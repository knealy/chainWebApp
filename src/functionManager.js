// src/functionManager.js
   console.log('functionManager.js executing...');
   // Define the functionManager object
   const functionManager = {
       userTriggers: {},
       userActions: {},

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

       // Fixed recursive call in createDynamicFunction
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