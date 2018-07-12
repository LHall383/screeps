module.exports = function(){
    Creep.prototype.runRoleBuilder = function() {
        if(!this.memory.working && this.carry.energy == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        if(this.memory.targetBuildRoom && this.memory.targetBuildRoom != this.pos.roomName){
            this.moveToRoom(this.memory.targetBuildRoom);
            return;
        }
        
        if(!this.memory.working) {
            if(!this.obtainEnergy(this.memory.containerId)){
                if(!this.obtainEnergy(this.memory.srcID)){
                    let energyPile = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                        filter: (r) => {
                            return r.resourceType == RESOURCE_ENERGY;
                        }
                    });
                    if(energyPile){
                        if(this.pickup(energyPile) == ERR_NOT_IN_RANGE){
                            this.moveTo(energyPile);
                        }
                    }else{
                        var source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                        if(this.harvest(source) == ERR_NOT_IN_RANGE){
                            this.moveTo(source);
                        }
                    }
                }
            }
        }else{
            if(this.memory.buildRoom && this.room.name != this.memory.buildRoom){
                this.moveToRoom(this.memory.buildRoom);
            }else{
                var targets = this.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length > 0) {
                    this.moveToBuild(targets[0]);
                }else{
                    this.runRoleUpgrader();
                }
            }
  	    }
    }
};
