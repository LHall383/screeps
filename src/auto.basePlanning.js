module.exports = {
    createBasePlan: function(roomName){
        let room = Game.rooms[roomName];
        if(!room){
            return false;
        }
        if(Memory.rooms[roomName].base && Memory.rooms[roomName].base.center){
            return false;
        }
        
        //define building types
        const buildingName = {};
        buildingName['-'] = STRUCTURE_ROAD;
        buildingName['x'] = STRUCTURE_EXTENSION;
        buildingName['L'] = STRUCTURE_LAB;
        buildingName['l'] = STRUCTURE_LINK;
        buildingName['T'] = STRUCTURE_TOWER;
        buildingName['t'] = STRUCTURE_TERMINAL;
        buildingName['S'] = STRUCTURE_SPAWN;
        buildingName['s'] = STRUCTURE_STORAGE;
        buildingName['o'] = STRUCTURE_OBSERVER;
        buildingName['N'] = STRUCTURE_NUKER;
        buildingName['P'] = STRUCTURE_POWER_SPAWN;
        
        //define static base layouts
        const corePriorityIncrease = [
            [0, 0, 0, 0, 0, 0, 0],
            [3, 0, 0, 0, 0, 0, 4],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 2],
            [1, 0, 0, 5, 0, 0, 2],
            [0, 0, 0, 0, 0, 0, 0]
        ];
        const coreLayout = [
            ['-','-','N','S','P','-','-'],
            ['T','-','-','T','-','-','T'],
            ['x','-','-','-','-','-','x'],
            ['-','o','-','s','-','l','-'],
            ['S','-','-','-','-','-','S'],
            ['T','-','-','T','-','-','T'],
            ['-','-','-','t','-','-','-']
        ];
        const coreY = coreLayout.length;
        const coreX = coreLayout[0].length;
        const coreCenterY = 3;
        const coreCenterX = 3;
        
        const labPriorityIncrease = [
            [9, 2, 9, 9, 9],
            [3, 9, 0, 9, 8],
            [4, 9, 1, 9, 7],
            [9, 5, 9, 6, 9]
        ];
        const labLayout = [
            ['-','L','-','L','-'],
            ['L','-','L','-','L'],
            ['L','-','L','-','L'],
            ['-','L','-','L','-']
        ];
        const labY = labLayout.length;
        const labX = labLayout[0].length;
        const labCenterY = 1;
        const labCenterX = 2;
        const offsetFromCoreX = 0;
        const offsetFromCoreY = 5;
        
        //find sources
        let sources = room.find(FIND_SOURCES);
        let path0 = PathFinder.search(sources[0].pos, {pos: room.controller.pos});
        let path1 = PathFinder.search(sources[1].pos, {pos: room.controller.pos});
        let upgradeSource = path0.path.length < path1.path.length ? sources[0] : sources[1];
        let spawnSource = path0.path.length < path1.path.length ? sources[1] : sources[0];
        
        //use a cost matrix to denote 'impossible' locations, sort of an abuse of the CostMatrix data structure
        const AVOID_SOURCE_RANGE = 1;
        const COST_OBSTRUCTED = 255;
        const COST_OK = 1;
        const COST_SWAMP = 2;
        let buildCosts = new PathFinder.CostMatrix();
        for(let x=1; x<49; x++){
            for(let y=1; y<49; y++){
                let terrain = Game.map.getTerrainAt(x, y, roomName);
                if(terrain == 'wall' || spawnSource.pos.getRangeTo(x, y) <= AVOID_SOURCE_RANGE || upgradeSource.pos.getRangeTo(x, y) <= AVOID_SOURCE_RANGE){
                    buildCosts.set(x, y, COST_OBSTRUCTED);
                }else if(terrain == 'swamp'){
                    buildCosts.set(x, y, COST_SWAMP);
                }else{
                    buildCosts.set(x, y, COST_OK);
                }
            }
        }
        
        //find all possible locations and give each a score
        let baseOptions = [];
        for(let i=1; i<(49-coreX); i++){
            for(let j=1; j<(49-coreY); j++){ 
                var canSettle = true; //check to see if the area is viable for core
                let terrainScore = 0;
                for(let x=i; x<i+coreX; x++){
                    for(let y=j; y<j+coreY; y++){
                        if(buildCosts.get(x, y) >= COST_OBSTRUCTED){
                            canSettle = false;
                            break;
                        }
                        terrainScore += buildCosts.get(x, y);
                    }
                    if(!canSettle){
                        break;
                    }
                }
                if(canSettle){ //calculate a *score* for the base, determined by a few factors (lower score is better!)
                    let baseCenter = new RoomPosition(i+coreCenterX, j+coreCenterY, roomName);
                    let closestExit = baseCenter.findClosestByRange(FIND_EXIT);
                    let rangeFromExit = baseCenter.getRangeTo(closestExit);
                    let rangeFromSpawnSource = baseCenter.getRangeTo(spawnSource);
                    let rangeFromUpgradeSource = baseCenter.getRangeTo(upgradeSource);
                    let rangeFromController = baseCenter.getRangeTo(room.controller);
                    let rangeFromMinerals = baseCenter.getRangeTo(room.find(FIND_MINERALS)[0]);
                    
                    let canPlaceLabs = true;
                    for(let x=baseCenter.X+offsetFromCoreX-labCenterX; x<baseCenter.X+offsetFromCoreX-labCenterX+labX; x++){
                        for(let y=baseCenter.Y+offsetFromCoreY-labCenterY; x<baseCenter.Y+offsetFromCoreY-labCenterY+labY; y++){
                            if(buildCosts.get(x, y) >= COST_OBSTRUCTED){
                                canPlaceLabs = false;
                                break;
                            }
                        }
                    }
                    
                    let score = ((25-rangeFromExit)*.10)+(rangeFromSpawnSource*.20)+(rangeFromUpgradeSource*.20)+(rangeFromController*.20)+(rangeFromMinerals*.15)+(terrainScore*.05);
                    if(!canPlaceLabs){
                        score = score * 2; //don't want to have to find another place for our labs cause that's a pain
                    }
                    
                    baseOptions.push({score: score, x: baseCenter.x, y: baseCenter.y, canPlaceLabs: canPlaceLabs});
                }
            }
        }
        
        //find best (lowest) score and keep that as the base center
        baseOptions.sort((a, b)=>{return a.score - b.score;});
        // console.log(baseOptions[0].canPlaceLabs);
        Memory.rooms[roomName].base = {};
        let center = new RoomPosition(baseOptions[0].x, baseOptions[0].y, roomName);
        Memory.rooms[roomName].base.center = center;
        Memory.rooms[roomName].base.spawnSourceId = spawnSource.id;
        Memory.rooms[roomName].base.upgradeSourceId = upgradeSource.id;
        
        //add core to build queue
        for(let x=0; x<coreX; x++){
            for(let y=0; y<coreY; y++){
                if(buildingName[coreLayout[y][x]]){
                    room.addToBuildQueue({
                        x: x+center.x-coreCenterX, 
                        y: y+center.y-coreCenterY, 
                        structureType: buildingName[coreLayout[y][x]], 
                        priority: buildPriority[buildingName[coreLayout[y][x]]]+corePriorityIncrease[y][x]
                    });
                    buildCosts.set(x+center.x-coreCenterX, y+center.y-coreCenterY, COST_OBSTRUCTED); //update build costs
                }
            }
        }
        
        //add labs
        if(baseOptions[0].canPlaceLabs){
            for(let x=0; x<labX; x++){
                for(let y=0; y<labY; y++){
                    room.addToBuildQueue({
                        x: x+center.x+offsetFromCoreX-labCenterX, 
                        y: y+center.y+offsetFromCoreY-labCenterY, 
                        structureType: buildingName[labLayout[y][x]], 
                        priority: buildPriority[buildingName[labLayout[y][x]]]+labPriorityIncrease[y][x]
                    });
                    buildCosts.set(x+center.x+offsetFromCoreX-labCenterX, y+center.y+offsetFromCoreY-labCenterY, COST_OBSTRUCTED); //update build costs
                }
            }
        }
        
        //find all possible locations for extensions, and give them each a score, then order by score
        let possibleExtensions = [];
        for(let y = center.y % 2; y < 49; y++){
            for(let x = (center.x % 2)+(1-(y % 2)); x < 49; x+=2){
                if(buildCosts.get(x, y) < COST_OBSTRUCTED){
                    let dist = spawnSource.pos.findPathTo(x, y, {plainCost: 1, swampCost: 1, ignoreCreeps: true}).length;
                    dist += upgradeSource.pos.findPathTo(x, y, {plainCost: 1, swampCost: 1, ignoreCreeps: true}).length;
                    dist *= .35;
                    dist += center.findPathTo(x, y, {plainCost: 1, swampCost: 1, ignoreCreeps: true}).length;
                    possibleExtensions.push({x: x, y: y, score: dist});
                }
            }
        }
        possibleExtensions.sort((a, b)=>{return a.score - b.score;});
        
        //push those with the highest scores to the build queue
        for(let i=0; i<possibleExtensions.length && i<60; i++){
            room.addToBuildQueue({
                x: possibleExtensions[i].x,
                y: possibleExtensions[i].y,
                structureType: STRUCTURE_EXTENSION,
                priority: buildPriority[STRUCTURE_EXTENSION]+i
            });
            buildCosts.set(possibleExtensions[i].x, possibleExtensions[i].y, COST_OBSTRUCTED);
        }
        
        return true;
    },
    
    visualizeCachedPaths: function(roomName){
        if(!Memory.rooms[roomName] || !Memory.rooms[roomName].cachedPaths){
            return false;
        }
        for(let pathToRoomName in Game.rooms[roomName].memory.cachedPaths){ 
            let paths = Game.rooms[roomName].memory.cachedPaths[pathToRoomName]; 
            paths.forEach(path=>path.forEach(position=>{
                Game.rooms[roomName].visual.circle(position.x, position.y);
            }));
        }
    },
    
    visualizeBuildQueue: function(roomName){
        if(!Memory.rooms[roomName].buildQueue || Memory.rooms[roomName].buildQueue.length < 1){
            return false;
        }
        let visualizer = new RoomVisual(roomName);
        for(let i=0; i<Memory.rooms[roomName].buildQueue.length; i++){
            let site = Memory.rooms[roomName].buildQueue[i];
            if(site.structureType == STRUCTURE_ROAD){
                var col = '#ffffff';
            }else if(site.structureType == STRUCTURE_SPAWN){
                var col = '#00ff00';
            }else if(site.structureType == STRUCTURE_EXTENSION){
                var col = '#ffff00';
            }else if(site.structureType == STRUCTURE_TOWER){
                var col = '#ff0000';
            }else if(site.structureType == STRUCTURE_LAB){
                var col = '#0000ff';
            }else if(site.structureType == STRUCTURE_CONTAINER){
                var col = '#ff00ff';
            }else if(site.structureType == STRUCTURE_RAMPART){
                var col = '#77ff77';
            }else{
                var col = '#000000';
            }
            visualizer.circle(site.x, site.y, {fill: col, opacity: 1.0});
        }
        return true;
    },
    
    buildFromQueue: function(roomName){
        if(!Memory.rooms[roomName] || !Memory.rooms[roomName].buildQueue || Memory.rooms[roomName].buildQueue.length < 1){
            return false;
        }
        let room = Game.rooms[roomName];
        if(!room){
            return false;
        }
        //create new priority queue and add build sites
        let queue = new utility.PriorityQueue((a, b) =>  a.priority < b.priority, Memory.rooms[roomName].buildQueue);
        
        //count number of current construction sites and buildings of each type
        let sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        let buildings = room.find(FIND_MY_STRUCTURES);
        let counts = _.countBy(sites.concat(buildings), 'structureType');
        let numSites = sites.length;
        
        while(!queue.isEmpty() && (!numSites || numSites <= 3)){
            let site = queue.pop();
            if(!site.x || !site.y || !site.structureType){
                continue; //improper data
            }
            if(counts[site.structureType] >= CONTROLLER_STRUCTURES[site.structureType][room.controller.level]){
                continue; //already have the maximum number of that structure type
            }
            let result = room.createConstructionSite(site.x, site.y, site.structureType);
            if(result == OK){
                room.removeFromBuildQueue(site);
                if(!counts[site.structureType]){
                    counts[site.structureType] = 0;
                }
                counts[site.structureType]++;
                numSites++;
                utility.logger.details('Building new '+site.structureType+' from build queue at ('+site.x+', '+site.y+') in room '+roomName);
            }
        }
        
        return true;
    },
    
    removeAllConstructionSites: function(roomName){
        let room = Game.rooms[roomName];
        if(!room){
            return false;
        }
        let sites = room.find(FIND_MY_CONSTRUCTION_SITES);
        for(let site of sites){
            site.remove();
        }
        return true;
    },
    
    planContainerAroundPosition: function(position, planCloseToPos, planRoad=true){
        // console.log('hello');
        //look through all the spaces around the 'position' and find which is closest to 'planCloseToPos'
        let locations = [];
        for(let xOffset=-1; xOffset<=1; xOffset++){
            for(let yOffset=-1; yOffset<=1; yOffset++){
                if(xOffset == 0 && yOffset == 0){
                    continue;
                }
                let p = new RoomPosition(position.x+xOffset, position.y+yOffset, position.roomName);
                if(Game.map.getTerrainAt(p) == 'wall' || p.isObstructed()){
                    continue;
                }
                locations.push(p);
            }
        }
        // console.log(planCloseToPos);
        let bestLocation = planCloseToPos.findClosestByPath(locations);
        if(bestLocation){ //push container to build queue and then plan path to it
            console.log('Planning container at position: '+bestLocation);
            if(Game.rooms[bestLocation.roomName]){
                Game.rooms[bestLocation.roomName].addToBuildQueue({x: bestLocation.x, y: bestLocation.y, structureType: STRUCTURE_CONTAINER, priority: buildPriority[STRUCTURE_CONTAINER]});
            }
            if(planRoad){
                autoBasePlanning.planRoad(planCloseToPos, bestLocation, range=1);
            }
        }
    },
    
    planContainerAtPosition: function(position, planRoad=false, roadFromPos=undefined){
        if(position){ //push container to build queue and then plan path to it
            console.log('Planning container at position: '+position);
            if(Game.rooms[position.roomName]){
                Game.rooms[position.roomName].addToBuildQueue({x: position.x, y: position.y, structureType: STRUCTURE_CONTAINER, priority: buildPriority[STRUCTURE_CONTAINER]});
            }
            if(planRoad){
                autoBasePlanning.planRoad(roadFromPos, position, range=1);
            }
        }
    },
    
    planRoad: function(from, to, range=0){
        let result = PathFinder.search(from, {pos: to, range: range}, {roomCallback: utility.roomCallbackPreferRoadsAvoidObstaclesWithBuildQueue, plainCost: 2, swampCost: 4, maxOps: 20000});
        
        if(result && result.path && result.path.length > 0){
            for(let i=0; i<result.path.length; i++){
                let step = result.path[i];
                if(Game.rooms[step.roomName]){
                    Game.rooms[step.roomName].addToBuildQueue({x: step.x, y: step.y, structureType: STRUCTURE_ROAD, priority: buildPriority[STRUCTURE_ROAD]+i+1});
                }
            }
        }
    }
};






