module.exports = function(){
    Creep.prototype.runRoleMover = function(){
        if(!this.memory.working && _.sum(this.carry) == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && _.sum(this.carry) == 0){
            this.memory.working = false;
        }
        
        //temporary use for moving minerals from storage to terminal
        if(this.memory.working){
            if(this.room.terminal){
                this.moveToTransfer(this.room.terminal);
            }
        }else{
            if(this.room.storage){
                let found = false;
                for(let rType in this.room.storage.store){
                    if(rType == RESOURCE_ENERGY){
                        continue;
                    }
                    let result = this.withdraw(this.room.storage, rType);
                    if(result == ERR_NOT_IN_RANGE){
                        this.moveTo(this.room.storage);
                    }
                    found = true;
                }
                if(!found){
                    this.memory.working = true;
                }
            }
        }
    }
};
