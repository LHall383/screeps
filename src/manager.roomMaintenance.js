module.exports = {
    run: function(){
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            try{
                room.runLinks();
            }catch(e){
                utility.logger.error('Auto Link threw error: ['+e+']');
            }
            
            let nuker = room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_NUKER}})[0];
            if(nuker && nuker.ghodium < nuker.ghodiumCapacity && room.memory.labs && room.terminal){
                let amountAvailable = room.countAvailableResource(RESOURCE_GHODIUM);
                let amountNeeded = nuker.ghodiumCapacity - nuker.ghodium - amountAvailable;
                if(amountNeeded > 0){
                    if(!room.memory.labs.labRequests){
                        room.memory.labs.labRequests = {};
                    }
                    if(!room.memory.labs.labRequests[RESOURCE_GHODIUM]){
                        room.requestCompound(RESOURCE_GHODIUM, amountNeeded);
                    }
                }else{
                    //add to spawn queue
                    if(Game.time % 7 == 0 && room.roleCount('transporter-nukerFiller') < 1 && (room.terminal.store[RESOURCE_GHODIUM] || 0) >= (nuker.ghodiumCapacity - nuker.ghodium)){
                        room.addToSpawnQueue({
                            mem: {role: 'transporter-nukerFiller', srcID: room.terminal.id, destID: nuker.id, resourceType: RESOURCE_GHODIUM, spawnRoom: roomName},
                            body: room.generateBody([CARRY, CARRY, MOVE], maxParts = 2),
                            priority: spawnPriority.PRIORITY_FILL_NUKER
                        });
                    }
                }
            }
            
            //contains objects of the format {x: p.x, y: p.y, structureType: STRUCTURE_RAMPART}
            if(room.memory.maintainList){
                let buildCosts = new PathFinder.CostMatrix();
                room.memory.maintainList.forEach(s=>{
                    buildCosts.set(s.x, s.y, 255);
                });
                //add ramparts on top of critical structures
                room.find(FIND_MY_STRUCTURES, {filter: s=>{
                    return _.includes(CRITICAL_STUCTURES, s.structureType);
                }}).forEach(s=>{
                    if(buildCosts.get(s.pos.x, s.pos.y) < 255){
                        room.memory.maintainList.push({x: s.pos.x, y: s.pos.y, structureType: STRUCTURE_RAMPART});
                    }
                });
            }
            
            //count current structures
            let buildingCount = room.find(FIND_STRUCTURES).length;
            
            //clean build queue
            room.cleanBuildQueue();
            
            let center = room.getBaseCenter();
            
            //plan road to the controller, TODO: plan link if it's "far" (anything more than 5 tiles)
            if(center && room.controller && room.controller.level >= 2){ 
                autoBasePlanning.planRoad(center, room.controller.pos, range=3);
            }
            
            //plan extractor and a road to it
            if(center && room.controller && room.controller.level >= 6 && room.find(FIND_MY_STRUCTURES, {filter: s=>{return s.structureType === STRUCTURE_EXTRACTOR;}}).length <= 0){
                let mineral = room.find(FIND_MINERALS)[0];
                room.addToBuildQueue({x: mineral.pos.x, y: mineral.pos.y, structureType: STRUCTURE_EXTRACTOR, priority: buildPriority[STRUCTURE_EXTRACTOR]});
                autoBasePlanning.planRoad(center, mineral.pos, range=1);
            }
            
            //plan roads in places that have 2 neighboring extensions
            let extensions = room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_EXTENSION});
            let counts = new PathFinder.CostMatrix();
            extensions.forEach(e=>{
                counts.set(e.pos.x-1, e.pos.y, counts.get(e.pos.x-1, e.pos.y)+1);
                counts.set(e.pos.x+1, e.pos.y, counts.get(e.pos.x+1, e.pos.y)+1);
                counts.set(e.pos.x, e.pos.y-1, counts.get(e.pos.x, e.pos.y-1)+1);
                counts.set(e.pos.x, e.pos.y+1, counts.get(e.pos.x, e.pos.y+1)+1);
            });
            for(let x=2; x<=47; x++){ 
                for(let y=2; y<=47; y++){
                    if(counts.get(x, y) >= 2){
                        room.addToBuildQueue({
                            x: x, y: y,
                            structureType: STRUCTURE_ROAD,
                            priority: buildPriority[STRUCTURE_ROAD]+100
                        });
                    }
                }
            }
            
            //cache paths from base center to each exit
            if(center && (!room.memory.cachedPaths || room.memory.currentBuildingCount != buildingCount)){
                utility.logger.info('Caching new paths for room '+room.name);
                room.memory.cachedPaths = {};
                let exits = Game.map.describeExits(room.name);
                for(let exitDirection in exits){
                    let tileArr = room.find(parseInt(exitDirection));
                    //split into exit sections
                    let sections = [];
                    let lastSlice = 0;
                    for(let i=0; i<tileArr.length-1; i++){
                        if(!tileArr[i].isNearTo(tileArr[i+1])){
                            sections.push(_.slice(tileArr, lastSlice, i+1));
                            lastSlice = i+1;
                        }
                    }
                    sections.push(_.slice(tileArr, lastSlice, tileArr.length));
                    //plan a path from the base center to each exit section
                    let paths = [];
                    for(let section of sections){
                        let result = PathFinder.search(center, section, {roomCallback: utility.roomCallbackPreferRoadsAvoidObstacles, maxRooms: 1});
                        if(!result.incomplete){
                            paths.push(result.path);
                        }
                    }
                    room.memory.cachedPaths[exits[exitDirection]] = paths;
                }
            }
            
            //add walls and ramparts to the maintenance list
            if(center && room.controller.level >= 4 && room.memory.cachedPaths && !room.memory.maintainList){
                utility.logger.info('Creating wall and rampart maintenance list for room '+room.name);
                room.memory.maintainList = [];
                let costs = new PathFinder.CostMatrix();
                let wallPositions = [];
                for(let x=0; x<50; x++){
                    for(let y=0; y<50; y++){
                        let position = new RoomPosition(x, y, room.name);
                        if(position.findInRange(FIND_EXIT, 2).length > 0 && position.findInRange(FIND_EXIT, 1) == 0 && Game.map.getTerrainAt(position) != 'wall'){
                            costs.set(x, y, 255);
                            wallPositions.push(position);
                        }
                    }
                }
                _.remove(wallPositions, p=>{
                    return PathFinder.search(p, center, {roomCallback: (roomName)=>{return costs;}}).incomplete;
                });
                
                let pathTiles = [];
                for(let destRoomName in room.memory.cachedPaths){ 
                    let paths = room.memory.cachedPaths[destRoomName]; 
                    paths.forEach(path=>path.forEach(position=>{
                        pathTiles.push(position);
                    }));
                }
                let rampartPositions = _.remove(wallPositions, p=>{
                    return _.some(pathTiles, pathTile=>p.isNearTo(pathTile.x, pathTile.y));
                });
                
                wallPositions.forEach(p=>{
                    room.memory.maintainList.push({x: p.x, y: p.y, structureType: STRUCTURE_WALL});
                });
                rampartPositions.forEach(p=>{
                    room.memory.maintainList.push({x: p.x, y: p.y, structureType: STRUCTURE_RAMPART});
                });
            }
            
            //add walls and ramparts to build queue that we are maintaining but do not yet exist
            if(room.memory.maintainList){
                for(let i=0; i<room.memory.maintainList.length; i++){
                    let building = room.memory.maintainList[i];
                    let position = new RoomPosition(building.x, building.y, room.name);
                    let structureList = position.lookFor(LOOK_STRUCTURES);
                    let containsWall = _.filter(structureList, s=>{s.structureType == STRUCTURE_WALL;}).length > 0;
                    let containsSameStructure = _.filter(structureList, s=>{return s.structureType==building.structureType;}).length > 0;
                    if(!containsWall && !containsSameStructure){
                        room.addToBuildQueue({
                            x: building.x,
                            y: building.y,
                            structureType: building.structureType,
                            priority: buildPriority[building.structureType]+i
                        });
                    }
                }
            }
            
            autoBasePlanning.buildFromQueue(room.name); //always build what we can from the queue
            
            room.memory.currentBuildingCount = buildingCount;
            
        }//end foreach room
    }
};