module.exports = function(){
    Room.prototype.isHighway = function(roomName){
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        return (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
    }
    
    Room.prototype.isLair = function(roomName){
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        return (parsed[1] % 10 === 4 || parsed[1] % 10 === 5 || parsed[1] % 10 === 6) &&
               (parsed[2] % 10 === 4 || parsed[2] % 10 === 5 || parsed[2] % 10 === 6) &&
               !(parsed[1] % 10 === 5 && parsed[2] % 10 === 5);
    }
    
    Room.prototype.hasFriendlyOwner = function(roomName){
        return Memory.rooms[roomName] && (utility.isFriendlyUsername(Memory.rooms[roomName].own) || utility.isFriendlyUsername(Memory.rooms[roomName].res));
    }
    
    Room.prototype.hasHostileOwner = function(roomName){
        return Memory.rooms[roomName] && ((Memory.rooms[roomName].own && !utility.isFriendlyUsername(Memory.rooms[roomName].own)) || (Memory.rooms[roomName].res && !utility.isFriendlyUsername(Memory.rooms[roomName].res)));
    }
    
    Room.prototype.goalDefenseHits = function(){
        if(!this.controller || !this.controller.level){
            return 0;
        }
        let max = MAX_REPAIR_PERCENTAGE * (RAMPART_HITS_MAX[this.controller.level] || 300000);
        let defenseLevel = this.storage ? this.controller.level * (this.storage.store.energy / MAX_STORAGE_ENERGY) : this.controller.level * .75;
        return Math.round(max * ( 1 / ( 1 + Math.pow(Math.E, 4 - defenseLevel) ) ));
    }
    
    Room.prototype.getRouteTo = function(otherRoomName, opts){
        return Game.map.findRoute(this.name, otherRoomName, opts);
    }
    
    Room.prototype.findHostileCreeps = function(){
        return this.find(FIND_HOSTILE_CREEPS, {
            filter: (c) => {
                return !utility.isFriendlyUsername(c.owner.username);
            }
        });
    }
    
    Room.prototype.addToBuildQueue = function(obj){
        if(!Memory.rooms[this.name].buildQueue){
            Memory.rooms[this.name].buildQueue = [];
        }
        if(!obj.x || !obj.y || !obj.structureType || obj.priority == undefined){
            return false; //improper params
        }
        if(!RoomPosition.prototype.isValidPos(obj.x, obj.y) || (Game.map.getTerrainAt(obj.x, obj.y, this.name) == 'wall' && obj.structureType != STRUCTURE_EXTRACTOR)){
            return false; //don't allow structures in impossible locations
        }
        let currentStructures = (new RoomPosition(obj.x, obj.y, this.name)).lookFor(LOOK_STRUCTURES);
        if(_.filter(currentStructures, (s)=>{return s.structureType == obj.structureType;}).length > 0){
            return false; //don't add if the structure already exists in that spot
        }
        let isWalkable = !OBSTACLE_OBJECT_TYPES.includes(obj.structureType);
        let isRoad = obj.structureType == STRUCTURE_ROAD;
        let isRampart = obj.structureType == STRUCTURE_RAMPART;
        if(!isRampart && _.some(currentStructures, s=>OBSTACLE_OBJECT_TYPES.includes(s.structureType))){
            return false; //don't place anything but ramparts on an existing structure that is not walkable
        }
        for(let ind in Memory.rooms[this.name].buildQueue){
            let site = Memory.rooms[this.name].buildQueue[ind];
            if(obj.x == site.x && obj.y == site.y){ //dont put things on top of each other
                if(site.structureType == obj.structureType){ //especially not the same things
                    return false;
                }
                //ok if (one is a rampart) or (both structures are walkable and one is a road) 
                let bothWalkable = !OBSTACLE_OBJECT_TYPES.includes(site.structureType) && isWalkable;
                let oneRoad = site.structureType == STRUCTURE_ROAD || isRoad;
                let oneRampart = site.structureType == STRUCTURE_RAMPART || isRampart;
                if(oneRampart || (bothWalkable && oneRoad)){
                    //should be ok!
                }else{
                    return false; //not cool
                }
            }
        }
        Memory.rooms[this.name].buildQueue.push(obj);
        return true;
    }
    
    Room.prototype.removeFromBuildQueue = function(obj){
        if(!Memory.rooms[this.name].buildQueue){
            Memory.rooms[this.name].buildQueue = [];
            return true;
        }
        for(let i=0; i<Memory.rooms[this.name].buildQueue.length; i++){
            if(Memory.rooms[this.name].buildQueue[i].x == obj.x && Memory.rooms[this.name].buildQueue[i].y == obj.y && Memory.rooms[this.name].buildQueue[i].structureType == obj.structureType){
                var ind = i;
                break;
            }
        }
        if(ind != undefined && ind != null){
            Memory.rooms[this.name].buildQueue.splice(ind, 1);
            return true;
        }else{
            return false;
        }
    }
    
    Room.prototype.removeStructureTypeFromBuildQueue = function(structureType){
        if(!Memory.rooms[this.name].buildQueue){
            Memory.rooms[this.name].buildQueue = [];
            return 0;
        }
        let removed = _.remove(Memory.rooms[this.name].buildQueue, b=>b.structureType == structureType);
        return removed.length || 0;
    }
    
    Room.prototype.cleanBuildQueue = function(){
        if(!Memory.rooms[this.name].buildQueue){
            Memory.rooms[this.name].buildQueue = [];
            return 0;
        }
        let removed = _.remove(Memory.rooms[this.name].buildQueue, b=>{
            return (new RoomPosition(b.x, b.y, this.name)).lookFor(LOOK_STRUCTURES, {filter: s=>s.structureType==b.structureType}).length > 0;
        });
        return removed.length || 0;
    }
    
    Room.prototype.getBaseCenter = function(){
        if(this.memory.base && this.memory.base.center){
            return new RoomPosition(this.memory.base.center.x, this.memory.base.center.y, this.name);
        }else if(this.controller && this.controller.my && this.storage){
            return this.storage.pos;
        }
    }
    
    Room.prototype.destroyAllBuildings = function(){
        this.find(FIND_STRUCTURES).forEach(s=>{
            s.destroy();
        });
    }
    
    Room.prototype.clearBase = function(){
        if(this.memory.base){
            delete this.memory.base;
        }
        if(this.memory.buildQueue){
            delete this.memory.buildQueue;
        }
        autoBasePlanning.removeAllConstructionSites(this.name);
    }
    
    Room.prototype.destroyAllHostileBuildings = function(){
        this.find(FIND_HOSTILE_STRUCTURES).forEach(s=>{
            s.destroy();
        });
    }
    
    Room.prototype.addToSpawnQueue = function(obj){
        if(!obj.mem || !obj.body || obj.priority == undefined || obj.body.length <= 0){
            return false;
        }
        if(!Memory.rooms[this.name].spawnQueue){
            Memory.rooms[this.name].spawnQueue = [];
        }
        for(let request of Memory.rooms[this.name].spawnQueue){
            if(request.mem.role == obj.mem.role){
                return false;
            }
        }
        Memory.rooms[this.name].spawnQueue.push(obj);
        return true;
    }
    
    Room.prototype.removeFromSpawnQueue = function(obj){
        if(!Memory.rooms[this.name].spawnQueue){
            Memory.rooms[this.name].spawnQueue = [];
            return;
        }
        for(let i=0; i<Memory.rooms[this.name].spawnQueue.length; i++){
            if(JSON.stringify(Memory.rooms[this.name].spawnQueue[i]) == JSON.stringify(obj)){
                var ind = i;
                break;
            }
        }
        if(ind != undefined && ind != null){
            Memory.rooms[this.name].spawnQueue.splice(ind, 1);
        }
    }
    
    Room.prototype.generateBody = function(baseParts, maxParts, method = 'stacked'){
        let baseCost = this.calculateCreepCost(baseParts);
        let maxPossible = Math.floor(this.energyCapacityAvailable / baseCost);
        let max = maxPossible > maxParts ? maxParts : maxPossible;
        if(max > Math.floor(50 / baseParts.length)){
            max = Math.floor(50 / baseParts.length);
        }
        
        var body = [];
        if(method == 'stacked'){
            for(let i=0; i<baseParts.length; i++){
                for(let j=0; j<max; j++){
                    body.push(baseParts[i]);
                }
            }
        }else if(method == 'sequential'){
            for(let i=0; i<max; i++){
                for(let j=0; j<baseParts.length; j++){
                    body.push(baseParts[j]);
                }
            }
        }
        return body;
    }
    
    Room.prototype.generateMinerBody = function(){
        if(this.energyCapacityAvailable >= 750){
            return [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
        }else{
            return [WORK, WORK, WORK, WORK, WORK, MOVE];
        }
    }
    
    Room.prototype.calculateCreepCost = function(body){
        let cost = 0;
        for(let part of body){
            cost += BODYPART_COST[part];
        }
        return cost;
    }
    
    Room.prototype.roleCount = function(role){
        if(!Memory.rooms[this.name].creepRoleCounts){
            return 0; 
        }else{
            return Memory.rooms[this.name].creepRoleCounts[role] || 0;
        }
    }
    
    Room.prototype.scaleMin = function(minimum){
        let newMin = (((6 - (this.energyCapacityAvailable / 200)) / 2) + .1) * minimum;
        
        if(newMin < minimum){
            return minimum;
        }else{
            return newMin;
        }
    }
    
    Room.prototype.requestCompound = function(compound, amountNeeded){ //this currently only works for one top-level request at a time
        if(!this.memory.labs){
            this.memory.labs = {};
        }
        if(!this.memory.labs.labRequests){
            this.memory.labs.labRequests = {};
        }
        utility.logger.details('Generating request for '+amountNeeded+' '+compound+' in room '+this.name);
        this.memory.labs.labRequests[compound] = amountNeeded;
        let topLevelReactants = utility.getReactants(compound);
        if(topLevelReactants.length != 2){ //maybe make this function work for base minerals later
            return false;
        }
        let requiredReactants = {};
        requiredReactants[topLevelReactants[0]] = amountNeeded;
        requiredReactants[topLevelReactants[1]] = amountNeeded;
        while(Object.getOwnPropertyNames(requiredReactants).length > 0){
            let resource = Object.getOwnPropertyNames(requiredReactants)[0];
            let requestAmount = requiredReactants[resource];
            
            requestAmount -= this.countAvailableResource(resource);
            
            if(requestAmount > 0){
                requestAmount *= 1.02; //scale up by 2% because some compound may be lost in the process
                if(requestAmount % 5 != 0){ //round up to the nearest 5
                    requestAmount += 5 - (requestAmount % 5);
                }
                Memory.rooms[this.name].labs.labRequests[resource] = requestAmount;
                if(utility.isResourceCompound(resource)){
                    reactants = utility.getReactants(resource);
                    if(requiredReactants[reactants[0]]){
                        requiredReactants[reactants[0]] += requestAmount;
                    }else{
                        requiredReactants[reactants[0]] = requestAmount;
                    }
                    if(requiredReactants[reactants[1]]){
                        requiredReactants[reactants[1]] += requestAmount;
                    }else{
                        requiredReactants[reactants[1]] = requestAmount;
                    }
                }
            }
            delete requiredReactants[resource];
        }
        utility.logger.details('Generation complete, final request result:\n'+JSON.stringify(this.memory.labs.labRequests));
        return true;
    }
    
    Room.prototype.getCurrentRequest = function(){
        // let startCpu = Game.cpu.getUsed();
        if(!this.memory.labs || !this.memory.labs.labRequests){
            return false;
        }
        
        this.memory.labs.labRequests = _.omit(this.memory.labs.labRequests, val => val <= 0);
        let keys = Object.getOwnPropertyNames(this.memory.labs.labRequests);
        
        for(let resource in this.memory.labs.labRequests){
            let requestAmount = this.memory.labs.labRequests[resource];
            
            //split into components
            let component = utility.getReactants(resource);
            if(!component || component.length != 2){
                continue;
            }
            
            let amount0 = this.countAvailableResource(component[0]);
            let amount1 = this.countAvailableResource(component[1]);
            if(amount0 < requestAmount || amount1 < requestAmount){
                if(amount0 < requestAmount && !keys.includes(component[0])){
                    this.requestCompound(component[0], requestAmount);
                }
                if(amount1 < requestAmount && !keys.includes(component[1])){
                    this.requestCompound(component[1], requestAmount);
                }
                continue;
            }
            
            // console.log(Game.cpu.getUsed()-startCpu);
            return {resourceType: resource, requestAmount: requestAmount};
        }
        
        return false;
    }
    
    Room.prototype.getCurrentBoostRequest = function(){
        if(!this.memory.labs || !this.memory.labs.boostRequests){
            return false;
        }
        
        this.memory.labs.boostRequests = _.omit(this.memory.labs.boostRequests, r=>!Game.creeps[r.cn]);
        
        for(let creepName in this.memory.labs.boostRequests){
            if(this.countAvailableResource(this.memory.labs.boostRequests[creepName].bm) >= this.memory.labs.boostRequests[creepName].mr){
                return this.memory.labs.boostRequests[creepName];
            }
        }
        
        return false;
    }
    
    Room.prototype.countAvailableResource = function(resourceType){
        let sum = 0;
        sum += _.sum(this.find(FIND_STRUCTURES, {
            filter: s=>{
                return s.store != undefined && s.store[resourceType] != undefined;
            }
        }), s=>s.store[resourceType]);
        
        sum += _.sum(this.find(FIND_MY_STRUCTURES, {
            filter: s=>{
                return s.structureType == STRUCTURE_LAB && s.mineralType == resourceType;
            }
        }), s=>s.mineralAmount);
        
        sum += _.sum(this.find(FIND_MY_CREEPS, {
            filter: c=>{
                return c.carry[resourceType] > 0;
            }
        }), c=>c.carry[resourceType]);
        
        return sum;
    }
    
    Room.prototype.runLinks = function(){
        if(!this.memory.base || !this.memory.base.homeLinkId || !this.memory.base.upgradeLinkId){
            return false;
        }
        let homeLink = Game.getObjectById(this.memory.base.homeLinkId);
        let upgradeLink = Game.getObjectById(this.memory.base.upgradeLinkId);
        if(homeLink && homeLink.energy > 0 && upgradeLink && upgradeLink.energy < (upgradeLink.energyCapacity * .9)){
            homeLink.transferEnergy(upgradeLink);
        }
    }
};














