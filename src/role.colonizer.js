module.exports = function(){
    Creep.prototype.runRoleColonizer = function() {
        if(!this.memory.working && this.carry.energy == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        if(this.memory.flagName && Game.flags[this.memory.flagName] && Game.flags[this.memory.flagName].pos.roomName != this.room.name){
            this.moveToRoomSafe(Game.flags[this.memory.flagName].pos.roomName, Game.flags[this.memory.flagName].pos);
        }else{
            if(!this.memory.working) {
                //get energy!
                // if(!this.obtainEnergy(this.memory.containerId)){
                //     if(!this.obtainEnergy(this.memory.srcID)){
                        let container = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: s=>{
                            return s.structureType == STRUCTURE_CONTAINER && s.store.energy > 0;
                        }});
                        if(container){
                            this.memory.containerId = container.id;
                            this.withdraw(container, RESOURCE_ENERGY);
                            this.moveTo(container);
                        }else{
                            let pile = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: r=>r.resourceType==RESOURCE_ENERGY});
                            if(pile){
                                if(this.pickup(pile) == ERR_NOT_IN_RANGE){
                                    this.moveTo(pile);   
                                }
                            }else{
                                var source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                                if(this.harvest(source) == ERR_NOT_IN_RANGE){
                                    this.moveTo(source);
                                }
                            }
                        }
                //     }
                // }
            }else{
                //build spawn construction sites 
                var targets = this.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: site=>site.structureType == STRUCTURE_SPAWN});
                if(targets.length > 0) {
                    this.moveToBuild(targets[0]);
                }else{ 
                    //check for spawn
                    let spawns = this.room.find(FIND_MY_SPAWNS);
                    if(spawns && spawns.length > 0){ //spawn built, can now switch to a harvester and delete flag
                        if(this.room.controller && this.room.controller.level >=4 && Game.flags[this.memory.flagName]){
                            Game.flags[this.memory.flagName].remove();
                        }
                        //autoBasePlanning.buildFromQueue(this.room.name);
                        this.switchRole('harvesterBootstrapper');
                    }else{ //no spawn, create spawn construction site
                        if(Memory.rooms[this.room.name] && Memory.rooms[this.room.name].buildQueue){
                            //check for a spawn in the build queue, making sure to iterate to keep inherent priority
                            for(let i=0, len=Memory.rooms[this.room.name].buildQueue.length; i<len; i++){
                                let site = Memory.rooms[this.room.name].buildQueue[i];
                                if(site.structureType == STRUCTURE_SPAWN){
                                    var spawnSite = site;
                                    break;
                                }
                            }
                            if(spawnSite){
                                this.room.createConstructionSite(spawnSite.x, spawnSite.y, spawnSite.structureType);
                            }
                        }else if(Game.flags[this.memory.flagName]){
                            //no build queue, just place spawn where flag is
                            Game.flags[this.memory.flagName].pos.createConstructionSite(STRUCTURE_SPAWN);
                        }
                    }
                }
      	    }
        }
        
        
    }
};