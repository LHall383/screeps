module.exports = function(){
    Creep.prototype.runRoleExtractor = function(){
        if(!this.memory.working && this.carryTotal() == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carryTotal() == 0){
            this.memory.working = false;
        }
        
        const MAX_TERMINAL = 100000;
        
        if(this.memory.working){
            let resource;
            for(var resourceType in this.carry){
                if(resourceType != RESOURCE_ENERGY){
                    resource = resourceType;
                    break;
                }
            }
            
            let storage = this.room.storage;
            let terminal = this.room.terminal;
            
            if(!terminal && !storage){
                this.say('no store');
            }else if(!terminal && storage){
                this.say('no terminal');
                this.moveToTransfer(storage);
            }else if(terminal && !storage){
                this.say('no storage');
                this.moveToTransfer(terminal);
            }else{
                if((!terminal.store[resource] || terminal.store[resource] < MAX_TERMINAL) && _.sum(terminal.store) < terminal.storeCapacity){
                    this.moveToTransfer(terminal);
                }else{
                    this.moveToTransfer(storage);
                }
            }
            
        }else{
            if(this.memory.srcID){
                if(this.harvest(Game.getObjectById(this.memory.srcID)) == ERR_NOT_IN_RANGE){
                    this.moveTo(Game.getObjectById(this.memory.srcID));
                }
            }
        }
    }
};