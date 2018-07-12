module.exports = function(){
    Creep.prototype.runRoleDistanceMiner = function(){
        if(this.getActiveBodyparts(WORK) == 0){
            utility.logger.details(this.name+' can no longer work, suiciding');
            this.suicide();
        }
        
        if(this.ticksToLive < this.memory._pre){
            this.memory._rep = true;
        }
        
        if(!this.memory.working && this.carry.energy == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        if(!this.memory.working){
            if(this.memory.flagName){
                let flag = Game.flags[this.memory.flagName];
                if(flag){
                    if(Memory.rooms[flag.pos.roomName].hos && Memory.rooms[flag.pos.roomName].hos.rngatk + Memory.rooms[flag.pos.roomName].hos.atk > 0){
                        this.say('retreat!');
                        this.moveToRoom(this.memory.spawnRoom);
                        return;
                    }
                    if(flag.pos.roomName != this.room.name){
                        this.moveToRoom(flag.pos.roomName, flag.pos);
                    }else{
                        if(!this.memory._pre && this.pos.getRangeTo(flag) <= 3){
                            this.memory._pre = (CREEP_LIFE_TIME - this.ticksToLive) + (this.body.length * CREEP_SPAWN_TIME);
                        }
                        
                        if(!this.memory.srcID){
                            let source = flag.pos.lookFor(LOOK_SOURCES);
                            if(source){
                                this.obtainEnergy(source[0].id);
                                this.memory.srcID = source[0].id;
                            }
                        }else{
                            this.obtainEnergy(this.memory.srcID);
                        }
                    }
                }
            }
        }else{
            if(!this.memory.destID){
                let containers = this.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (s) => {
                        return s.structureType == STRUCTURE_CONTAINER;
                    }
                });
                if(containers.length > 0){
                    //save container as destination
                    this.memory.destID = containers[0].id;
                }else{
                    //construct a container
                    containers = this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
                        filter: (site) => {
                            return site.structureType == STRUCTURE_CONTAINER;
                        }
                    });
                    if(containers.length > 0){
                        this.build(containers[0]);
                        this.memory.destID = containers[0].id;
                    }else{
                        //build container
                        if(Game.flags[this.memory.flagName] && Memory.rooms[this.memory.spawnRoom] && Memory.rooms[this.memory.spawnRoom].base && Memory.rooms[this.memory.spawnRoom].base.center){
                            let planCloseToPos = new RoomPosition(Memory.rooms[this.memory.spawnRoom].base.center.x, Memory.rooms[this.memory.spawnRoom].base.center.y, this.memory.spawnRoom);
                            autoBasePlanning.planContainerAtPosition(this.pos, planRoad=true, roadFromPos=planCloseToPos);
                            autoBasePlanning.buildFromQueue(this.pos.roomName);
                        }
                    }
                }
            }else{
                var dest = Game.getObjectById(this.memory.destID);
                if(!dest){
                    delete this.memory.destID;
                }else if(dest.structureType == STRUCTURE_CONTAINER && dest.hits < 100000){
                    this.moveToRepair(dest);
                }else if(dest.store && dest.store.energy < dest.storeCapacity){
                    this.moveToTransfer(dest);
                    try{
                        this.obtainEnergy(this.memory.srcID);
                        this.memory.working = false;
                    }catch(e){
                        console.log('Error trying to mine and transfer');
                    }
                }else if(dest.progress && dest.progress < dest.progressTotal){
                    this.moveToBuild(dest);
                }else if(dest.store && dest.store.energy == dest.storeCapacity){
                    //nothing to do
                    let sites = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
                    let repairs = this.pos.findInRange(FIND_STRUCTURES, 3, {filter: (s) => {return s.hits < s.hitsMax;}});
                    if(sites){
                        this.build(sites[0]);
                    }else if(repairs){
                        this.repair(repairs[0]);
                    }
                }
                
            }
        }
    }
};