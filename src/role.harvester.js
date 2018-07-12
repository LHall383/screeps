module.exports = function(){
    Creep.prototype.runRoleHarvester = function() {
        if(!this.memory.working && _.sum(this.carry) == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && _.sum(this.carry) == 0){
            this.memory.working = false;
        }
        
        if(!this.memory.working) {
            if(!this.obtainEnergy(this.memory.containerId)){
                if(!this.obtainEnergy(this.memory.srcID)){
                    let energy = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount > 50});
                    if(energy){
                        if(this.pickup(energy) == ERR_NOT_IN_RANGE){
                        this.moveTo(energy);
                        }
                    }else{
                        var source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                        let result = this.harvest(source);
                        if(result == ERR_NOT_IN_RANGE){
                            this.moveTo(source);
                        }else if(result == ERR_NOT_ENOUGH_RESOURCES){
                            if(this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0){
                                this.obtainEnergy(this.room.storage);
                            }
                        }
                    }
                }
            }
        } else {
            if(this.memory.roomTarget && this.room.name != roomTarget){
                this.moveToRoom(this.memory.roomTarget);
            }else{
                var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                });
                if(target) {
                    this.moveToTransfer(target);
                }else{
                    var towers = this.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.room.name == this.room.name && s.structureType == STRUCTURE_TOWER && s.energy < (s.energyCapacity - 250);
                        }
                    });
                    if(towers.length > 0){
                        this.moveToTransfer(towers[0]);
                    }else{
                        this.runRoleBuilder();
                    }
                }
            }
        }
    }
};
