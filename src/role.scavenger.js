module.exports = function(){
    Creep.prototype.runRoleScavenger = function(){
        if(!this.memory.working && this.carryTotal() == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carryTotal() == 0){
            this.memory.working = false;
        }
        
        if(this.room.name != this.memory.spawnRoom){
            this.moveToRoom(this.memory.spawnRoom);
            return;
        }
        
        var droppedResources = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => {
                return resource.amount > 50;
            }
        });
        var containers = this.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType == STRUCTURE_CONTAINER && s.store.energy > 1900;
            }
        });
        var tombstones = this.room.find(FIND_TOMBSTONES, {
            filter: (t) => {
                return _.sum(t.store) > 0;
            }
        });
        
        if(!this.memory.working){
            if(droppedResources.length > 0){
                if(this.pickup(droppedResources[0]) == ERR_NOT_IN_RANGE){
                    this.moveTo(droppedResources[0]);
                }
            }else if(containers.length > 0){
                this.moveToWithdraw(containers[0]);
            }else if(tombstones.length > 0){
                for(let resource in tombstones[0].store){
                    if(this.withdraw(tombstones[0], resource) == ERR_NOT_IN_RANGE){
                        this.moveTo(tombstones[0]);
                    }
                }
            }else{
                if(this.carryTotal() - this.carry.energy > 0 &&  this.room.terminal){
                    this.moveToTransfer(this.room.terminal);
                }else if(this.carryTotal() - this.carry.energy > 0 && this.room.storage){
                    this.moveToTransfer(this.room.storage);
                }else{
                    if(this.room.storage){
                        this.memory.srcID = this.room.storage.id;
                        this.runRoleUpgrader();
                    }else{
                        let container = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.store.energy > 100;
                        }});
                        let result = this.withdraw(container);
                        if(result === ERR_NOT_IN_RANGE) this.moveTo(container);
                    }
                }
            }
        }else{
            if(droppedResources.length > 0 || containers.length > 0 || tombstones.length > 0){
                if(this.carryTotal() - this.carry.energy > 0 && this.room.terminal){
                    this.moveToTransfer(this.room.terminal);
                }else if(this.room.storage){
                    this.moveToTransfer(this.room.storage);
                }else{
                    this.runRoleHarvester();
                }
            }else if(this.room.storage){
                this.memory.srcID = this.room.storage.id;
                this.runRoleHarvester();
            }else{
                this.runRoleHarvester();
            }
        }
    }
};