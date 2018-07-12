module.exports = {
    run: function(){
        //set up trading memory
        if(!Memory.trading){
            Memory.trading = {};
        }
        if(!Memory.trading.bankAmount){
            Memory.trading.bankAmount = (Game.market.credits * .99);
        }
        if(!Memory.trading.taxRate){
            Memory.trading.taxRate = .05;
        }
        
        //set up room memory
        for(let roomName in Game.rooms){
            if(!Memory.rooms[roomName]){ //if rooms don't have memory yet, assign them a slot
                Memory.rooms[roomName] = {};
            }
            if(Game.rooms[roomName].controller && Game.rooms[roomName].controller.my && !Memory.rooms[roomName].spawnQueue){
                Memory.rooms[roomName].spawnQueue = [];
            }
        }
        
        //removing memory of dead creeps
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
        
        //adding towers to memory
        if(!Memory.towerIDs){
            Memory.towerIDs = [];
        }
        for(let structureID in Game.structures){
            let structure = Game.structures[structureID];
            if(structure.structureType == STRUCTURE_TOWER){
                if(!Memory.towerIDs.includes(structure.id)){
                    Memory.towerIDs.push(structure.id);
                    console.log('New tower found at ' + structure.pos + ', adding to memory towerId: ' + structure.id);
                }
            }
        }
        
        //adding labs to memory
        for(let roomName in Game.rooms){
            if(!Game.rooms[roomName].controller || !Game.rooms[roomName].controller.my || Game.rooms[roomName].controller.level < 6){
                continue;
            }
            if(!Memory.rooms[roomName].labs){
                Memory.rooms[roomName].labs = {};
            }
            if(!Memory.rooms[roomName].labs.masters){
                Memory.rooms[roomName].labs.masters = [];
            }else{ //verify that the ids are still good
                _.remove(Memory.rooms[roomName].labs.masters, id=>!Game.getObjectById(id));
            }
            if(!Memory.rooms[roomName].labs.slaves){
                Memory.rooms[roomName].labs.slaves = [];
            }else{ //verify that the ids are still good
                _.remove(Memory.rooms[roomName].labs.slaves, id=>!Game.getObjectById(id));
            }
            var labs = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LAB}).map(l => l.id);
            if(Memory.rooms[roomName].labs.masters.length + Memory.rooms[roomName].labs.slaves.length < labs.length){
                for(let i=0; i<labs.length; i++){
                    if(!Memory.rooms[roomName].labs.masters.includes(labs[i]) && !Memory.rooms[roomName].labs.slaves.includes(labs[i])){
                        if(Memory.rooms[roomName].labs.masters.length < 2){
                            Memory.rooms[roomName].labs.masters.push(labs[i]);
                        }else{
                            Memory.rooms[roomName].labs.slaves.push(labs[i]);
                        }
                    }
                }
            }
        }
        
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room || !room.controller || !room.controller.my){
                continue;
            }
            if(!Memory.rooms[roomName].base){
                Memory.rooms[roomName].base = {}
            }
            //set harvester and builder/upgrader sources, as well as containers... if no containers, put them into build queue
            //if this is already set, don't waste the CPU on recalculating
            if(!Memory.rooms[roomName].base.spawnSourceId || !Game.getObjectById(Memory.rooms[roomName].base.spawnSourceId) || !Memory.rooms[roomName].base.upgradeSourceId || !Game.getObjectById(Memory.rooms[roomName].base.upgradeSourceId)){
                let sources = room.find(FIND_SOURCES);
                if(sources.length == 1){
                    Memory.rooms[roomName].base.spawnSourceId = sources[0].id;
                    Memory.rooms[roomName].base.upgradeSourceId = sources[0].id;
                }else if(sources.length == 2){
                    let path0 = PathFinder.search(sources[0].pos, {pos: room.controller.pos, range: 3}, {roomCallback: utility.roomCallbackPreferRoadsAvoidObstaclesWithBuildQueue});
                    let path1 = PathFinder.search(sources[1].pos, {pos: room.controller.pos, range: 3}, {roomCallback: utility.roomCallbackPreferRoadsAvoidObstaclesWithBuildQueue});
                    let upgradeSource = path0.path.length < path1.path.length ? sources[0] : sources[1];
                    let spawnSource = path0.path.length < path1.path.length ? sources[1] : sources[0];
                    Memory.rooms[roomName].base.spawnSourceId = spawnSource.id;
                    Memory.rooms[roomName].base.upgradeSourceId = upgradeSource.id;
                }else{
                    utility.logger.warn('Auto Memory Writing found a room without 1 or 2 sources: '+roomName);
                    continue; //this shouldn't happen, because every owned room should have 1 or 2 sources
                }
            }
            //set harvester and builder/upgrader containers
            if(!Memory.rooms[roomName].base.spawnContainerId || !Game.getObjectById(Memory.rooms[roomName].base.spawnContainerId) || !Memory.rooms[roomName].base.upgradeContainerId || !Game.getObjectById(Memory.rooms[roomName].base.upgradeContainerId)){
                //by this point we can assume that Memory.rooms[roomName].base.spawnSourceId and Memory.rooms[roomName].base.upgradeSourceId are set
                let spawnSource = Game.getObjectById(Memory.rooms[roomName].base.spawnSourceId);
                let spawnContainer = spawnSource.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: (s) => {
                        return s.structureType == STRUCTURE_CONTAINER;
                    }
                });
                if(spawnContainer.length > 0){
                    Memory.rooms[roomName].base.spawnContainerId = spawnContainer[0].id;
                }else if(spawnContainer.length == 0 && room.controller.level >= 2 && Game.cpu.bucket > 500 && Memory.rooms[roomName].base.center){ //EXPENSIVE OPERATION
                    //container mining should begin at RCL 2... so plan containers, if there are no container construction sites around
                    let sites = spawnSource.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, {filter: (s)=>{return s.structureType == STRUCTURE_CONTAINER}});
                    if(!sites || sites.length < 1){
                        let center = new RoomPosition(Memory.rooms[roomName].base.center.x, Memory.rooms[roomName].base.center.y, roomName);
                        autoBasePlanning.planContainerAroundPosition(spawnSource.pos, planCloseToPos=center, planRoad=true);
                        autoBasePlanning.buildFromQueue(roomName); //to assure that the construction sites will be placed
                    }
                    Memory.rooms[roomName].base.spawnContainerId = undefined;
                }else{
                    Memory.rooms[roomName].base.spawnContainerId = undefined;
                }
                if(Memory.rooms[roomName].base.spawnSourceId != Memory.rooms[roomName].base.upgradeSourceId){
                    let upgradeSource = Game.getObjectById(Memory.rooms[roomName].base.upgradeSourceId);
                    let upgradeContainer = upgradeSource.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER;
                        }
                    });
                    if(upgradeContainer.length > 0){
                        Memory.rooms[roomName].base.upgradeContainerId = upgradeContainer[0].id;
                    }else if(upgradeContainer.length == 0 && room.controller.level >= 2 && Game.cpu.bucket > 500 && Memory.rooms[roomName].base.center){
                        let sites = upgradeSource.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, {filter: (s)=>{return s.structureType == STRUCTURE_CONTAINER}});
                        if(!sites || sites.length < 1){
                            let center = new RoomPosition(Memory.rooms[roomName].base.center.x, Memory.rooms[roomName].base.center.y, roomName);
                            autoBasePlanning.planContainerAroundPosition(upgradeSource.pos, planCloseToPos=center, planRoad=true);
                            autoBasePlanning.buildFromQueue(roomName); //to assure that the construction sites will be placed
                        }
                        Memory.rooms[roomName].base.upgradeContainerId = undefined;
                    }else{
                        Memory.rooms[roomName].base.upgradeContainerId = undefined;
                    }
                }
            }
            
            //discover links
            if(room.storage && (!Memory.rooms[roomName].base.homeLinkId || !Game.getObjectById(Memory.rooms[roomName].base.homeLinkId))){
                let links = room.storage.pos.findInRange(FIND_MY_STRUCTURES, RANGE_TO_HOME_LINK, {
                    filter: { structureType: STRUCTURE_LINK }
                });
                if(links && links.length > 0){
                    utility.logger.info("Adding link "+links[0]+" as home link of "+room);
                    Memory.rooms[roomName].base.homeLinkId = links[0].id;
                }
            }
            if(!Memory.rooms[roomName].base.upgradeLinkId || !Game.getObjectById(Memory.rooms[roomName].base.upgradeLinkId)){
                let links = room.controller.pos.findInRange(FIND_MY_STRUCTURES, RANGE_TO_UPGRADE_LINK, {
                    filter: { structureType: STRUCTURE_LINK }
                });
                if(links && links.length > 0){
                    utility.logger.info("Adding link "+links[0]+" as upgrade link of "+room);
                    Memory.rooms[roomName].base.upgradeLinkId = links[0].id;
                }
            }
        }
        
        //discover attack flags
        let attackFlags = _.filter(Game.flags, (f)=>{
            return f.color == COLOR_RED;
        });
        
        //discover distance mining flags
        let distanceMiningFlags = _.filter(Game.flags, (f)=>{
            return f.color == COLOR_PURPLE;
        });
        //sort so that the flags that are placed earlier will be maintained at a higher priority
        distanceMiningFlags.sort((a, b)=>{return a.name.localeCompare(b.name)});
        
        //discover power banks
        // Memory.rooms[roomName].powerBankInfo = {
        //     id: powerBanks[0].id,
        //     pos: powerBanks[0].pos,
        //     hits: powerBanks[0].hits,
        //     power: powerBanks[0].power,
        //     ticksToDecay: powerBanks[0].ticksToDecay
        // };
        // let bankInfo = _.reject(_.filter(Memory.rooms, 'powerBankInfo'), o=>o.powerBankInfo.ticksToDecay-o.ticksSinceSeen<=0);
        //let unclaimedBankInfo = _.reject(bankInfo, )
        
        //share information with proper rooms
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room.controller || !room.controller.my){
                continue;
            }
            //attack flags
            Memory.rooms[roomName].attackFlagNames = [];
            for(let flag of attackFlags){
                if(!flag){
                    continue; 
                }
                let roomDist = Game.map.findRoute(room.name, flag.pos.roomName).length;
                if(roomDist < ATTACK_ROOM_RANGE){
                    Memory.rooms[roomName].attackFlagNames.push(flag.name);
                }
            }
            //distance mining flags
            Memory.rooms[roomName].distanceMiningFlagNames = [];
            for(let flag of distanceMiningFlags){
                if(!flag){
                    continue;
                }
                if(flag.name.includes(roomName)){
                    Memory.rooms[roomName].distanceMiningFlagNames.push(flag.name);
                }
            }
            //power banks
            // if(!room.memory.powerBankDest){
            //     // let bestRoom = _.min(bankInfo, );
            // }
        }
        
        if(Game.time % 2 == 0){
            //look for expansion flags
            let expansionFlags = [];
            for(let flagName in Game.flags){
                let flag = Game.flags[flagName];
                if(flag.color == COLOR_WHITE){
                    expansionFlags.push(flag);
                }
            }
            
            for(let roomName in Game.rooms){
                if(Memory.rooms[roomName].expansionFlagName && !Game.flags[Memory.rooms[roomName].expansionFlagName]){
                    delete Memory.rooms[roomName].expansionFlagName;
                }else if(Memory.rooms[roomName].expansionFlagName){
                    _.remove(expansionFlags, flag=>flag.name===Memory.rooms[roomName].expansionFlagName);
                }
            }
            
            for(let flag of expansionFlags){
                //find closest room that contains a spawn and is greater than RCL 5
                var distances = [];
                for(let roomName in Game.rooms){
                    let room = Game.rooms[roomName];
                    let spawnsFound = room.find(FIND_MY_SPAWNS);
                    if(spawnsFound && spawnsFound.length > 0 && room.controller && room.controller.my && room.controller.level > 5 && !Memory.rooms[roomName].expansionFlagName){
                        //calculate distance
                        distances.push({dist: Game.map.findRoute(roomName, flag.pos.roomName, {routeCallback: utility.routeCallbackPreferFriendlyRoomsAndHighway}).length, roomName: roomName});
                    }
                }
                
                //pick roomName associated with lowest distance
                let closest = _.min(distances, 'dist');
                if(closest === Infinity){
                    utility.logger.warn('Expansion flag '+flag.name+' with no valid room nearby.')
                    continue;
                }
                
                //store the flag in the room's memory
                Memory.rooms[closest.roomName].expansionFlagName = flag.name;
                utility.logger.info('Adding new expansion flag '+flag.name+' to room '+closest.roomName);
            }
            
            //discover downgrade flags
            let downgradeFlags = _.filter(Game.flags, (f)=>{
                return f.color === COLOR_YELLOW;
            });
            
            for(let roomName in Game.rooms){
                if(Memory.rooms[roomName].downgradeFlagName && !Game.flags[Memory.rooms[roomName].downgradeFlagName]){
                    delete Memory.rooms[roomName].downgradeFlagName;
                }else if(Memory.rooms[roomName].downgradeFlagName){
                    _.remove(downgradeFlags, flag=>flag.name===Memory.rooms[roomName].downgradeFlagName);
                }
            }
            
            for(let flag of downgradeFlags){
                //find closest room that meets conditions
                var distances = [];
                for(let roomName in Game.rooms){
                    let room = Game.rooms[roomName];
                    let spawnsFound = room.find(FIND_MY_SPAWNS);
                    if(spawnsFound && spawnsFound.length > 0 && room.controller && room.controller.my && room.controller.level == 8 && !Memory.rooms[roomName].downgradeFlagName){
                        distances.push({dist: Game.map.findRoute(roomName, flag.pos.roomName, {routeCallback: utility.routeCallbackSafe}).length, roomName: roomName});
                    }
                }
                //pick roomName associated with lowest distance
                let closest = _.min(distances, 'dist');
                if(closest === Infinity){
                    utility.logger.warn('Downgrade flag '+flag.name+' with no valid room nearby.');
                    continue;
                }
                
                //store the flag in the room's memory
                Memory.rooms[closest.roomName].downgradeFlagName = flag.name;
                utility.logger.info('Adding new downgrade flag '+flag.name+' to room '+closest.roomName);
            }
            
        }
        
    }
};


