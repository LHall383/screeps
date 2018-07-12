module.exports = function(){
    Creep.prototype.runRoleRepairer = function() {
        if(!this.memory.working && this.carry.energy == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        if(this.room.name != this.memory.spawnRoom){
            this.moveToRoom(this.memory.spawnRoom);
            return;
        }
        
        if(!this.memory.wallHits && !this.memory.goalHits){
            this.memory.goalHits = 30000;
        }else if(!this.memory.goalHits){
            this.memory.goalHits = this.memory.wallHits;
        }
        
        if(this.memory.working) {
            let target = Game.getObjectById(this.memory._tID);
            if(target && (target.structureType == STRUCTURE_RAMPART || target.structureType == STRUCTURE_WALL)){
                let result = this.repair(target);
                if(result === ERR_NOT_IN_RANGE) this.moveTo(target, {maxRooms: 1});
            }else{
                delete this.memory._tID;
            }
            
            if(!this.memory._tID){
                let targets = [];
                this.room.find(FIND_STRUCTURES, {filter: s=>{
                    return s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL;
                }}).forEach(s=>{
                    targets.push({target: s, score: Math.pow(s.hits / this.memory.goalHits, 3) * Math.sqrt(this.pos.getRangeTo(s) / 50)});
                });
                
                let best = _.min(targets, 'score');
                // console.log(best.target);
                if(best !== Infinity){
                    this.memory._tID = best.target.id;
                    let result = this.repair(best.target);
                    if(result === ERR_NOT_IN_RANGE) this.moveTo(best.target, {maxRooms: 1});
                }else{
                    this.runRoleBuilder();
                }
            }
            
        } else {
            delete this.memory._tID;
            if(this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0){
                this.obtainEnergy(this.room.storage.id);
            }else if(this.memory.containerId){
                this.obtainEnergy(this.memory.containerId);
            }else{
                this.obtainEnergy(this.memory.srcID);
            }
        }
    }
};
