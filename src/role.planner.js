module.exports = function(){
    Creep.prototype.runRolePlanner = function(){
        if(this.memory.planRoom){
            if(this.room.name != this.memory.planRoom){
                this.moveToRoom(this.memory.planRoom);
                this.memory._move = undefined;
                if(Game.time % 3 == 0){
                    this.say('I will');
                }else if(Game.time % 3 == 1){
                    this.say('show them');
                }else{
                    this.say('da wae');
                }
            }else{
                this.moveTo(new RoomPosition(25, 25, this.pos.roomName));
                let sites = this.room.find(FIND_CONSTRUCTION_SITES, {structureType: STRUCTURE_ROAD});
                if(Memory.rooms[this.pos.roomName].needsRoad == undefined){
                    Memory.rooms[this.pos.roomName].needsRoad = true;
                }
                
                if(sites && sites.length > 1){
                    if(Game.time % 3 == 0){
                        this.say('All roads');
                    }else if(Game.time % 3 == 1){
                        this.say('lead to');
                    }else{
                        this.say('Rome!');
                    }
                }else if(this.memory.flagName && this.memory.spawnRoom && Memory.rooms[this.pos.roomName].needsRoad){
                    let flag = Game.flags[this.memory.flagName];
                    let spawnRoom = Game.rooms[this.memory.spawnRoom];
                    
                    if(flag && spawnRoom && spawnRoom.storage){
                        let start = spawnRoom.storage.pos;
                        let end = flag.pos;
                        
                        let callback = function(roomName) {
                            let room = Game.rooms[roomName];
                            if (!room) return;
                            let costs = new PathFinder.CostMatrix;
                            room.find(FIND_STRUCTURES).forEach(function(struct) {
                              if (struct.structureType === STRUCTURE_ROAD) {
                                costs.set(struct.pos.x, struct.pos.y, 1);
                              } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                         (struct.structureType !== STRUCTURE_RAMPART ||
                                          !struct.my)) {
                                // Can't walk through non-walkable buildings
                                costs.set(struct.pos.x, struct.pos.y, 0xff);
                              }
                            });
                            return costs;
                        }
                        
                        let result = PathFinder.search(start, {pos: end, range: 2}, {plainCost: 2, swampCost: 4, roomCallback: callback});
                        // this.memory.buildPath = result.path;
                        
                        // let sites = Game.rooms['E49N12'].find(FIND_CONSTRUCTION_SITES);
                        // for(let i=0; i<sites.length; i++){
                        //     sites[i].remove();
                        // }
                        if(result){
                            for(let i=0; i<result.path.length; i++){
                                // new RoomVisual(result.path[i].roomName).circle(result.path[i], {fill: '#ffffff'});
                                Game.rooms[result.path[i].roomName].createConstructionSite(result.path[i], STRUCTURE_ROAD);
                            }
                            Memory.rooms[this.pos.roomName].needsRoad = false;
                        }
                    }
                }else{
                    if(Game.time % 3 == 0){
                        this.say('They gave');
                    }else if(Game.time % 3 == 1){
                        this.say('me the');
                    }else{
                        this.say('easy job');
                    }
                }
            }
        }
    }
};