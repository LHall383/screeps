module.exports = {
    update: function(){
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room.controller || !room.controller.my){
                continue;
            }
            
            //count creeps that were spawned in this room by their roles
            Memory.rooms[roomName].creepRoleCounts = _.countBy(_.filter(Game.creeps, (c)=>{return c.memory.spawnRoom == roomName && !c.memory.shouldReplace && !c.memory._rep;}), (c)=>{return c.memory.role});
            
            //check memory for cached base information
            if(!Memory.rooms[roomName].base){
                Memory.rooms[roomName].base = {};
            }
            let baseInfo = Memory.rooms[roomName].base;
            
            //failsafe to restore room
            if(room.find(FIND_MY_CREEPS).length == 0){
                Memory.rooms[roomName].spawnQueue = [];
                if(baseInfo.spawnContainerId){
                    room.addToSpawnQueue({
                        mem: {role: 'harvester-last-hope', srcID: baseInfo.spawnSourceId, containerId: baseInfo.spawnContainerId, spawnRoom: roomName},
                        body: [WORK, CARRY, MOVE],
                        priority: spawnPriority.PRIORITY_EMERGENCY
                    });
                }else{
                    room.addToSpawnQueue({
                        mem: {role: 'harvester-last-hope', srcID: baseInfo.spawnSourceId, spawnRoom: roomName},
                        body: [WORK, WORK, CARRY, MOVE],
                        priority: spawnPriority.PRIORITY_EMERGENCY
                    });
                }
            }
            
            //miners
            if(baseInfo.spawnContainerId && baseInfo.upgradeContainerId && baseInfo.spawnContainerId == baseInfo.upgradeContainerId && room.roleCount('miner1') < 1){
                room.addToSpawnQueue({
                    mem: {role: 'miner1', srcID: baseInfo.spawnSourceId, destID: baseInfo.spawnContainerId, spawnRoom: roomName},
                    body: room.generateMinerBody(),
                    priority: spawnPriority.PRIORITY_MINER
                });
            }else if(baseInfo.spawnContainerId || baseInfo.upgradeContainerId){
                if(baseInfo.spawnContainerId && room.roleCount('miner1') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'miner1', srcID: baseInfo.spawnSourceId, destID: baseInfo.spawnContainerId, spawnRoom: roomName},
                        body: room.generateMinerBody(),
                        priority: spawnPriority.PRIORITY_MINER
                    });
                }
                if(baseInfo.upgradeContainerId && room.roleCount('miner2') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'miner2', srcID: baseInfo.upgradeSourceId, destID: baseInfo.upgradeContainerId, spawnRoom: roomName},
                        body: room.generateMinerBody(),
                        priority: spawnPriority.PRIORITY_MINER
                    });
                }
            }
            
            //basic economy
            if(CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][room.controller.level] >= 1 && room.storage && baseInfo.spawnContainerId && baseInfo.upgradeContainerId){ //start spawning with hauler
                if(room.roleCount('baseHauler') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'baseHauler', spawnRoom: roomName},
                        body: room.generateBody([CARRY, CARRY, MOVE], maxParts=16, method='stacked'),
                        priority: spawnPriority.PRIORITY_BASE_HAULER
                    });
                }
                if(room.storage.store.energy >= ENERGY_BEFORE_UPGRADING && room.roleCount('upgrader') < 1){
                    let parts = room.storage.store.energy >= ENERGY_BEFORE_LARGE_UPGRADING ? 15 : 5;
                    room.addToSpawnQueue({
                        mem: {role: 'upgrader', containerId: room.storage.id, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], parts, method='stacked'),
                        priority: spawnPriority.PRIORITY_UPGRADER
                    });
                }
                if(room.storage.store.energy >= ENERGY_BEFORE_BUILDING && room.find(FIND_MY_CONSTRUCTION_SITES).length > 0 && room.roleCount('builder') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'builder', containerId: room.storage.id, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, CARRY, CARRY, MOVE, MOVE], 8, method='stacked'),
                        priority: spawnPriority.PRIORITY_BUILDER
                    });
                }
            }else{
                if(room.roleCount('harvester') < 2){
                    room.addToSpawnQueue({
                        mem: {role: 'harvester', srcID: baseInfo.spawnSourceId, containerId: baseInfo.spawnContainerId, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], maxParts=5, method='stacked'),
                        priority: spawnPriority.PRIORITY_HARVESTER
                    });
                }
                if(room.roleCount('upgrader') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'upgrader', srcID: baseInfo.upgradeSourceId, containerId: baseInfo.upgradeContainerId, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], maxParts=5, method='stacked'),
                        priority: spawnPriority.PRIORITY_UPGRADER
                    });
                }
                if(room.roleCount('builder') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'builder', srcID: baseInfo.upgradeSourceId, containerId: baseInfo.upgradeContainerId, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], maxParts=5, method='stacked'),
                        priority: spawnPriority.PRIORITY_BUILDER
                    });
                }
            }
            
            //defense
            let enemies = room.findHostileCreeps();
            if(enemies && enemies.length > 1 && room.roleCount('defender') < 1){
                room.addToSpawnQueue({
                    mem: {role: 'defender', spawnRoom: roomName},
                    body: room.generateBody([TOUGH, MOVE, MOVE, ATTACK], maxParts=10),
                    priority: spawnPriority.PRIORITY_DEFENDER
                });
            }
            
            //extra upgraders
            if(room.controller.level < 8){
                if(room.storage && room.storage.store.energy > ENERGY_BEFORE_SECOND_UPGRADER && room.roleCount('extraUpgrader') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'extraUpgrader', srcID: room.storage.id, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], maxParts=16),
                        priority: spawnPriority.PRIORITY_UPGRADER
                    });
                }
                if(room.storage && room.storage.store.energy > ENERGY_BEFORE_THIRD_UPGRADER && room.roleCount('extraUpgrader2') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'extraUpgrader2', srcID: room.storage.id, spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], maxParts=16),
                        priority: spawnPriority.PRIORITY_UPGRADER
                    });
                }
            }
            
            //extractor
            if(room.controller.level >= 6 && room.terminal){
                let extractors = room.find(FIND_MY_STRUCTURES, {filter: (s)=>{return s.structureType == STRUCTURE_EXTRACTOR}});
                if(extractors && extractors.length > 0){
                    let mineralSource = extractors[0].pos.lookFor(LOOK_MINERALS);
                    if(mineralSource && mineralSource.length > 0 && mineralSource[0].mineralAmount > 0 && room.roleCount('extractor') < 1){
                        room.addToSpawnQueue({
                            mem: {role: 'extractor', destID: room.terminal.id, srcID: mineralSource[0].id, spawnRoom: roomName},
                            body: room.generateBody([WORK, WORK, WORK, CARRY, MOVE, MOVE], maxParts=4),
                            priority: spawnPriority.PRIORITY_EXTRACTOR
                        });
                    }
                }
            }
            
            //repairer
            let goalHits = room.goalDefenseHits();
            let repairs = room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) &&
                           (s.hits < goalHits);
                }
            });
            if(repairs && repairs.length > 0 && room.storage && room.storage.store.energy >= ENERGY_BEFORE_FORTIFYING && room.roleCount('repairer') < 1){
                let result = room.addToSpawnQueue({
                    mem: {role: 'repairer', containerId: room.storage.id, goalHits: goalHits, spawnRoom: roomName},
                    body: room.generateBody([WORK, CARRY, CARRY, MOVE, MOVE, MOVE], maxParts=8, method='stacked'),
                    priority: spawnPriority.PRIORITY_BUILDER
                });
            }
            
            //scavenger
            if(/*(room.storage && room.storage.store.energy > 40000) ||*/ (room.storage && _.sum(room.find(FIND_DROPPED_RESOURCES), (resource) => {return resource.amount}) > 1000) || 
               _.sum(room.find(FIND_DROPPED_RESOURCES, {filter: (r)=>{return r.resourceType == RESOURCE_ENERGY;}}), (resource) => {return resource.amount}) > 1000){
                if(room.roleCount('scavenger') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'scavenger', spawnRoom: roomName},
                        body: room.generateBody([WORK, CARRY, MOVE], maxParts=5, method='stacked'),
                        priority: spawnPriority.PRIORITY_SCAVENGER
                    });
                }
            }
            
            //attacking
            for(let flagName of Memory.rooms[roomName].attackFlagNames || {}){
                let flag = Game.flags[flagName];
                if(!flag){
                    continue;
                }
                if(room.roleCount('attacker_'+flagName) < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'attacker_'+flagName, flagName: flagName, spawnRoom: roomName},
                        body: room.generateBody([TOUGH, MOVE, MOVE, ATTACK], maxParts=12, method='stacked'),
                        priority: spawnPriority.PRIORITY_ATTACKER
                    });
                }
                // if(room.roleCount('healerRanger_'+flagName) < 1){
                //     room.addToSpawnQueue({
                //         mem: {role: 'healerRanger_'+flagName, flagName: flagName, spawnRoom: roomName},
                //         body: room.generateBody([TOUGH, MOVE, MOVE, RANGED_ATTACK, MOVE, HEAL], maxParts=5, method='stacked'),
                //         priority: spawnPriority.PRIORITY_ATTACKER
                //     });
                // }
                // if(room.roleCount('healer_'+flagName) < 1){
                //     room.addToSpawnQueue({
                //         mem: {role: 'healer_'+flagName, flagName: flagName, spawnRoom: roomName},
                //         body: room.generateBody([TOUGH, MOVE, MOVE, HEAL], maxParts=12, methood='stacked'),
                //         priority: spawnPriority.PRIORITY_ATTACKER
                //     });
                // }
                if(room.roleCount('dismantler_'+flagName) < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'dismantler_'+flagName, flagName: flagName, spawnRoom: roomName},
                        body: room.generateBody([TOUGH, WORK, MOVE, WORK, MOVE, MOVE], maxParts=8, method='stacked'),
                        priority: spawnPriority.PRIORITY_ATTACKER
                    });
                }
            }
            
            //expansion
            if(Memory.rooms[roomName].expansionFlagName){
                let flag = Game.flags[Memory.rooms[roomName].expansionFlagName];
                if(flag){
                    if(flag.room && flag.room.controller && flag.room.controller.my){ //own the room, send colonizers to build spawn
                        if(room.roleCount('harvesterBootstrapper') + room.roleCount('colonizer') < (5-flag.room.controller.level)){
                            room.addToSpawnQueue({
                                mem: {role: 'colonizer', flagName: flag.name, spawnRoom: roomName}, 
                                body: room.generateBody([WORK, CARRY, MOVE, MOVE], maxParts=10), 
                                priority: spawnPriority.PRIORITY_EXPANSION_COLONIZER
                            });
                        }
                    }else{ //not yet claimed, send claimer and attacker to clear and defend
                        if(room.roleCount('claimer') < 1){
                            room.addToSpawnQueue({
                                mem: {role: 'claimer', flagName: flag.name, spawnRoom: roomName},
                                body: [MOVE, CLAIM],
                                priority: spawnPriority.PRIORITY_EXPANSION_CLAIMER
                            });
                        }
                    }
                    // if(Memory.rooms[flag.pos.roomName].hos){
                    //     if(room.roleCount('attacker_'+flag.pos.roomName) < 1){
                    //         room.addToSpawnQueue({
                    //             mem: {role: 'attacker_'+flag.pos.roomName, flagName: flag.name, spawnRoom: roomName},
                    //             body: room.generateBody([TOUGH, MOVE, MOVE, ATTACK, RANGED_ATTACK, MOVE], maxParts=8),
                    //             priority: spawnPriority.PRIORITY_EXPANSION_DEFENDER
                    //         });
                    //     }
                    // }
                }else{
                    delete Memory.rooms[roomName].expansionFlagName;
                }
            }
            
            //distance mining
            if(room.storage && Memory.rooms[roomName].distanceMiningFlagNames){
                let needsDistanceBuilder = false;
                let removed = _.remove(Memory.rooms[roomName].distanceMiningFlagNames, flagName=>!Game.flags[flagName]);
                if(removed.length > 0) utility.logger.warn('Removed distance mining flag names '+removed+' from room '+roomName);
                for(let i=0; i<Memory.rooms[roomName].distanceMiningFlagNames.length; i++){
                    let flag = Game.flags[Memory.rooms[roomName].distanceMiningFlagNames[i]];
                    if(!Memory.rooms[flag.pos.roomName]){
                        Memory.rooms[flag.pos.roomName] = {};
                    }
                    if(Memory.rooms[flag.pos.roomName].hos){ //spawn defender
                        if(room.roleCount('attacker_'+flag.pos.roomName) < 1){
                            room.addToSpawnQueue({
                                mem: {role: 'attacker_'+flag.pos.roomName, flagName: flag.name, spawnRoom: roomName},
                                body: room.generateBody([TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, ATTACK], maxParts=4),
                                priority: spawnPriority.PRIORITY_DISTANCE_DEFENDER_BASE+(i*spawnPriority.PRIORITY_DISTANCE_ROOM_INCREMENT)
                            });
                        }
                    }else if(!flag.room){ //spawn scout to obtain vision of room
                        if(room.roleCount('scout_'+flag.pos.roomName) < 1){
                            room.addToSpawnQueue({
                                mem: {role: 'scout_'+flag.pos.roomName, scoutRoom: flag.pos.roomName, scoutPos: flag.pos, spawnRoom: roomName},
                                body: [MOVE], 
                                priority: spawnPriority.PRIORITY_DISTANCE_SCOUT_BASE+(i*spawnPriority.PRIORITY_DISTANCE_ROOM_INCREMENT)
                            });
                        }
                    }else{ //room is safe and we can see it... spawn miner and hauler, check if reserver or builder is neccessary
                        if(room.roleCount('distanceMiner_'+flag.name) < 1){
                            room.addToSpawnQueue({
                                mem: {role: 'distanceMiner_'+flag.name, flagName: flag.name, spawnRoom: roomName},
                                body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], //this is sort of a magic number, define as const or use function somehow
                                priority: spawnPriority.PRIORITY_DISTANCE_MINER_BASE+(i*spawnPriority.PRIORITY_DISTANCE_ROOM_INCREMENT)
                            });
                        }
                        if(room.roleCount('distanceHauler_'+flag.name) < 1){
                            room.addToSpawnQueue({
                                mem: {role: 'distanceHauler_'+flag.name, flagName: flag.name, spawnRoom: roomName},
                                body: room.generateBody([CARRY, CARRY, MOVE], maxParts=12, method='sequential'),
                                priority: spawnPriority.PRIORITY_DISTANCE_HAULER_BASE+(i*spawnPriority.PRIORITY_DISTANCE_ROOM_INCREMENT)
                            });
                        }
                        if(flag.room.controller && (flag.room.controller.reservation == undefined || flag.room.controller.reservation.ticksToEnd < MIN_DISTANCE_MINE_RESERVE_TICKS) && room.roleCount('reserver_'+flag.pos.roomName) < 1){
                            room.addToSpawnQueue({
                                mem: {role: 'reserver_'+flag.pos.roomName, flagName: flag.name, spawnRoom: roomName},
                                body: room.generateBody([MOVE, CLAIM], maxParts=3),
                                priority: spawnPriority.PRIORITY_DISTANCE_RESERVER_BASE+(i*spawnPriority.PRIORITY_DISTANCE_ROOM_INCREMENT)
                            });
                        }
                        //check if this room needs a distance builder
                        let construction = flag.room.find(FIND_MY_CONSTRUCTION_SITES);
                        let criticalRepairs = flag.room.find(FIND_STRUCTURES, {filter: (s)=>{return s.structureType == STRUCTURE_ROAD && s.hits < (s.hitsMax*.5);}}); 
                        if(construction.length > 0 || criticalRepairs.length > 0){
                            needsDistanceBuilder = true;
                        }
                    }
                }
                if(needsDistanceBuilder && room.roleCount('distanceBuilder') < 1){
                    let distanceMiningRoomNames = _.uniq(Memory.rooms[roomName].distanceMiningFlagNames.map(flagName=>Game.flags[flagName].pos.roomName));
                    room.addToSpawnQueue({
                        mem: {role: 'distanceBuilder', buildRooms: distanceMiningRoomNames, energyRoom: roomName, srcID: room.storage.id, spawnRoom: roomName}, //this relies on storage
                        body: room.generateBody([WORK, CARRY, CARRY, CARRY, MOVE, MOVE], maxParts=6),
                        priority: spawnPriority.PRIORITY_DISTANCE_BUILDER
                    });
                }
            }
            
            //scouting
            //Game.rooms.E49N16.addToSpawnQueue({mem: {role: 'scout', scoutRoom: 'E47N17'}, body: [MOVE], priority: 0})
            //room.addToSpawnQueue({mem: {role: 'scout', scoutRoom: 'E46N14'}, body: [MOVE], priority: 99);
            
            //mineral cleanup
            if(room.storage && room.terminal && _.sum(room.storage.store) > room.storage.store.energy && _.sum(room.terminal.store) < room.terminal.storeCapacity && room.roleCount('mover') < 1){
                room.addToSpawnQueue({
                    mem: {role: 'mover', spawnRoom: roomName},
                    body: room.generateBody([CARRY, CARRY, MOVE], maxParts=4),
                    priority: spawnPriority.PRIORITY_LAB_MANAGER
                });
            }
            
            //downgrading controllers
            if(room.memory.downgradeFlagName && Game.flags[room.memory.downgradeFlagName]){
                let flag = Game.flags[room.memory.downgradeFlagName];
                let attackRoom = Game.rooms[flag.pos.roomName];
                if(attackRoom && attackRoom.controller && attackRoom.controller && (!attackRoom.controller.upgradeBlocked || attackRoom.controller.upgradeBlocked < 200) && room.roleCount('controllerAttacker') < 1){
                    room.addToSpawnQueue({
                        mem: {role: 'controllerAttacker', flagName: flag.name, spawnRoom: roomName},
                        body: room.generateBody([MOVE, CLAIM], maxParts = 25),
                        priority: spawnPriority.PRIORITY_ATTACK_CONTROLLER
                    });
                }
            }
        }
        return true;
    },
    
    spawnFromQueue: function(){
        for(let spawnName in Game.spawns){
            let spawn = Game.spawns[spawnName];
            let room = Game.rooms[spawn.pos.roomName];
            if(!Memory.rooms[spawn.pos.roomName].spawnQueue || Memory.rooms[spawn.pos.roomName].spawnQueue.length == 0){
                continue;
            }
            
            //create new priority queue and add spawns
            let queue = new utility.PriorityQueue((a, b) =>  a.priority < b.priority, Memory.rooms[spawn.pos.roomName].spawnQueue);
            
            //create name!
            let name = spawn.createCreepName();
            
            //attempt to spawn the highest priority creep
            let creep = queue.peek();
            let result = spawn.spawnCreep(creep.body, name, {memory: creep.mem});
            if(result == OK){
                room.removeFromSpawnQueue(queue.pop());
                utility.logger.details(spawn.name+' in '+room.name+' spawning new creep '+name+', role: '+creep.mem.role);
            }
        }
    },
    
    spawnFromRoomQueue: function(roomName){
        // _.filter(Game.creeps, (c)=>{return c.memory.spawnRoom == roomName && !c.memory.shouldReplace;})
        let spawns = _.filter(Game.spawns, (s)=>{return s.pos.roomName == roomName;});
        for(let spawn of spawns){
            let room = Game.rooms[spawn.pos.roomName];
            if(spawn.memory.hasTriedSpawn || !Memory.rooms[spawn.pos.roomName].spawnQueue || Memory.rooms[spawn.pos.roomName].spawnQueue.length == 0){
                continue;
            }
            
            //create new priority queue and add spawns
            let queue = new utility.PriorityQueue((a, b) =>  a.priority < b.priority, Memory.rooms[spawn.pos.roomName].spawnQueue);
            
            //create name!
            let name = spawn.createCreepName();
            
            //attempt to spawn the highest priority creep
            let creep = queue.peek();
            let result = spawn.spawnCreep(creep.body, name, {memory: creep.mem});
            if(result == OK){
                room.removeFromSpawnQueue(queue.pop());
                utility.logger.details(spawn.name+' in '+room.name+' spawning new creep '+name+', role: '+creep.mem.role);
            }
        }
    }
}
