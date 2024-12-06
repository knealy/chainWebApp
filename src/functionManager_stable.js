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
        createDynamicFunction(id, triggerName, condition, actionName) {
            const trigger = this.userTriggers[triggerName];
            const action = this.userActions[actionName];
            
            if (!trigger) {
                throw new Error(`Trigger ${triggerName} not found`);
            }
            if (!action) {
                throw new Error(`Action ${actionName} not found`);
            }

            // Changed from this.createDynamicFunction to this.createFunction
            this.createFunction(id, trigger, condition, action);
            console.log(`Dynamic function created: ${id}`);
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

   
