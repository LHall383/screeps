module.exports = {
    runReactions: function() {
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room || !room.terminal){
                continue;
            }
            let labs = Memory.rooms[roomName].labs;
            if(labs && labs.slaves && labs.masters && labs.masters.length == 2){
                let master0 = Game.getObjectById(labs.masters[0]);
                let master1 = Game.getObjectById(labs.masters[1]);
                if(!master0 || !master1){
                    continue;
                }
                
                //prepare for reacting
                let currentRequest = room.getCurrentRequest();
                if(currentRequest){
                    //spawn manager if we don't already have one
                    if(room.roleCount('labManager') < 1 && Game.time % 7 == 0){
                        room.addToSpawnQueue({mem: {role: 'labManager', spawnRoom: roomName}, body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], priority: spawnPriority.PRIORITY_LAB_MANAGER});
                    }
                }else if(room.find(FIND_MY_STRUCTURES, {filter: s=>{return s.structureType == STRUCTURE_LAB && s.mineralAmount > 0;}}).length > 0){
                    //spawn manager if we don't already have one
                    if(room.roleCount('labManager') < 1 && Game.time % 7 == 0){
                        room.addToSpawnQueue({mem: {role: 'labManager', spawnRoom: roomName}, body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], priority: spawnPriority.PRIORITY_LAB_MANAGER});
                    }
                }
                
                //run all possible reactions
                if(master0.mineralType != master1.mineralType && master0.mineralAmount > 0 && master1.mineralAmount > 0){
                    for(let id of labs.slaves){
                        let slave = Game.getObjectById(id);
                        if(slave){
                            //find what resource we will make and update the request in memory if there is one
                            let productSet = REACTIONS[master0.mineralType];
                            if(productSet){
                                let product = REACTIONS[master0.mineralType][master1.mineralType];
                                if(product){
                                    let result = slave.runReaction(master0, master1);
                                    if(result == OK && labs.labRequests && labs.labRequests[product] > 0){
                                        Memory.rooms[roomName].labs.labRequests[product] = Memory.rooms[roomName].labs.labRequests[product] - 5;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    
    runBoosts: function() {
        //Request looks like: {cn: "Mefuh", mr: 450, bm: "XGH2O"}
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room || !room.memory.labs || !room.memory.labs.boostRequests){
                continue;
            }
            if(!room.memory.labs.labRequests){
                room.memory.labs.labRequests = {};
            }
            
            //remove dead creeps
            room.memory.labs.boostRequests = _.omit(room.memory.labs.boostRequests, r=>!Game.creeps[r.cn]);
            
            for(let creepName in room.memory.labs.boostRequests){
                let creep = Game.creeps[creepName];
                let request = room.memory.labs.boostRequests[creepName];
                
                //check for the material in the room, if there's not enough, then create it
                if(room.countAvailableResource(request.bm) < request.mr){
                    if(Object.getOwnPropertyNames(room.memory.labs.labRequests).length == 0){
                        utility.logger.details('Automatically requesting boost mineral '+request.bm+' for creep '+creepName);
                        room.requestCompound(request.bm, LAB_MINERAL_CAPACITY);
                    }
                }else{ //time to boost
                    if(Game.time % 7 == 0 && room.roleCount('labManager') < 1){
                        let result = room.addToSpawnQueue({
                            mem: {role: 'labManager', spawnRoom: roomName},
                            body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
                            priority: spawnPriority.PRIORITY_LAB_MANAGER
                        });
                        if(result){
                            utility.logger.info('Spawning lab manager to boost creep: '+request.cn);
                        }
                    }
                }
            }
        }
    }
};


























