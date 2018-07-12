module.exports = function(){
    Creep.prototype.carryTotal = function(){
        let sum = 0;
        for(let resourceType in this.carry){
            sum += this.carry[resourceType];
        }
        return sum;
    }
    
    Creep.prototype.attackClosest = function(ignoreStruct = false){
        var enemy = this.findClosestHostile();
        if(enemy){
            if(this.attack(enemy) == ERR_NOT_IN_RANGE){
                this.moveTo(enemy, {ignoreDestructibleStructures: ignoreStruct});
            }
            return true;
        }else{
            return false;
        }
    }
    
    Creep.prototype.findClosestHostile = function(){
        return this.pos.findClosestHostile();
    }
    
    //Looks at the property creep.memory.path, if none exists or it has a length of 1 or less, this will return false
    Creep.prototype.moveByPathMemory = function(){
        if(this.memory.path && this.memory.path.length > 1){
            this.move(this.memory.path.shift().direction);
        }else if(this.memory.path){
            delete this.memory.path;
            return false;
        }else{
            return false;
        }
    }
    
    Creep.prototype.moveToRoomSafe = function(roomName, targetPos){
        return this.moveToRoom(roomName, targetPos, {routeCallback: utility.routeCallbackPreferFriendlyRoomsAndHighway});
    }
    
    Creep.prototype.moveToRoom = function(roomName, targetPos = undefined, opts = undefined){
        if(!targetPos){
            targetPos = {x: 25, y: 25, roomName: roomName};
        }else {
            if(!targetPos.x){
                targetPos.x = 25;
            }
            if(!targetPos.y){
                targetPos.y = 25;
            }
            if(!targetPos.roomName){
                targetPos.roomName = roomName;
            }
            
        }
        if(!opts){
            opts = {};
        }
        
        if(this.room.name == roomName){
            this.moveTo(new RoomPosition(targetPos.x, targetPos.y, targetPos.roomName));
            return false;
        }
        
        // maybe only delete the route from memory if the creep has changed rooms at least 2 times in the last 5 ticks
        if(this.memory._prevRoom && this.memory._prevRoom.length > 2){ //this may cause more issues than it fixed, look into this later
            var roomSwitchCount = 0;
            for(let i=1; i<this.memory._prevRoom.length; i++){
                if(this.memory._prevRoom[i] != this.memory._prevRoom[i-1]){
                    roomSwitchCount++;
                }
            }
            if(roomSwitchCount > 3){
                delete this.memory._route;
            }
        }
        
        if(!this.memory._route || this.memory._route.length < 1){
            if(opts.routeCallback){
                var route = Game.map.findRoute(this.pos.roomName, roomName, {routeCallback: opts.routeCallback});
                this.memory._route = route;
            }else{
                var route = Game.map.findRoute(this.pos.roomName, roomName);
                this.memory._route = route;
            }
        }else{
            if(this.memory._route[0].room == this.room.name){
                this.memory._route.shift();
            }
            var route = this.memory._route;
            
        }
        
        if(!route || route.length == 0){
            return false;
        }else if(route.length == 1){
            this.moveTo(new RoomPosition(targetPos.x, targetPos.y, targetPos.roomName));
        }else{
            // let exit = this.pos.findClosestByPath(route[0].exit);
            // this.moveTo(exit);
            // if(Game.rooms[route[0].room]){
            //     let exits = Game.rooms[route[0].room].find(route[0].exit);
            //     var target = exits[0];
            // }else{
                var target = new RoomPosition(25, 25, route[0].room);
            // }
            
            this.moveTo(target);
        }
        if(!this.memory._prevRoom){
            this.memory._prevRoom = [];
        }
        this.memory._prevRoom.push(this.room.name);
        if(this.memory._prevRoom.length > 5){
            this.memory._prevRoom.shift();
        }
        
        return true;
    }
    
    Creep.prototype.moveToBuild = function(site){
        if(this.build(site) == ERR_NOT_IN_RANGE) {
            this.moveTo(site);
        }
    }
    
    Creep.prototype.moveToHarvest = function(target){
        if(target){
            if(this.harvest(target) == ERR_NOT_IN_RANGE){
                this.moveTo(target);
            }
        }
    }
    
    Creep.prototype.moveToRepair = function(target){
        if(this.repair(target) == ERR_NOT_IN_RANGE){
            this.moveTo(target);
        }
    }
    
    Creep.prototype.moveToTransfer = function(target){
        if(target){
            for(let resourceType in this.carry){
                var result = this.transfer(target, resourceType);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(target);
                }
            }
            return true;
        }else{
            return false;
        }
    }
    
    Creep.prototype.moveToUpgrade = function(controller){
        if(this.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(controller, {range: 3});
        }
    }
    
    Creep.prototype.moveToWithdraw = function(source){
        try{
            if(this.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(source);
            }
        }catch(err){
            utility.logger.error('Error in creep.moveToWithdraw');
        }
    }
    
    Creep.prototype.obtainEnergy = function(sourceId){
        var source = Game.getObjectById(sourceId);
        if(source){
            if(source.structureType){
                if(source.store && source.store.energy > 0){
                    let result = this.withdraw(source, RESOURCE_ENERGY);
                    if(result == ERR_NOT_IN_RANGE){
                        this.moveTo(source);
                    }else if(result == ERR_NOT_ENOUGH_RESOURCES){
                        return false;
                    }
                    if(source.store.energy == 0){
                        return false;
                    }else{
                        return true;
                    }
                }else{
                    var droppedEnergy = source.pos.lookFor(LOOK_ENERGY);
                    if(droppedEnergy.length > 0){
                        if(this.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE){
                            this.moveTo(droppedEnergy[0]);
                        }
                    }else{
                        return false;
                    }
                }
            }else if(!source.structureType){
                let result = this.harvest(source);
                if(result == ERR_NOT_IN_RANGE) {
                    this.moveTo(source);
                }else if(result == ERR_NOT_ENOUGH_RESOURCES){
                    this.say('im out!');
                    return false;
                }
            }else{
                return false;
            }
            return true;
        }else{
            return false;
        }
    }
    
    Creep.prototype.attemptBoost = function(resourceType, partToBoost){
        const mineralPerPart = 30;
        if(!this.room.storage || !this.room.storage.store[resourceType] || this.room.storage.store[resourceType] < mineralPerPart){
            return false;
        }
        
        let needBoost = 0;
        for(let part of this.body){
            if(part.type == partToBoost && !part.boost){
                needBoost++;
            }
        }
        if(needBoost <= 0){
            return false;
        }
        
        let labs = Memory.rooms[this.room.name].labs;
        var boosting = false;
        if(labs && labs.masters && (!labs.labRequests || JSON.stringify(labs.labRequests) == '{}')){
            for(let id of labs.masters){
                var master = Game.getObjectById(id);
                if(!master.mineralType || (master.mineralType == resourceType && master.mineralAmount < needBoost * mineralPerPart)){ //fill lab
                    if(this.carry[resourceType]){
                        this.moveToTransfer(master);
                    }else{
                        let mineralNeeded = (needBoost * mineralPerPart) - master.mineralAmount;
                        mineralNeeded = mineralNeeded > (this.carryCapacity - this.carryTotal()) ? (this.carryCapacity - this.carryTotal()) : mineralNeeded;
                        if(mineralNeeded > this.room.storage.store[resourceType]){
                            return false;
                        }
                        let result = this.withdraw(this.room.storage, resourceType, mineralNeeded);
                        if(result == ERR_NOT_IN_RANGE){
                            this.moveTo(this.room.storage);
                        }
                    }
                    boosting = true;
                }else if(master.mineralType == resourceType && master.mineralAmount >= needBoost * mineralPerPart){ //get boosted
                    this.moveTo(master);
                    master.boostCreep(this, needBoost);
                    boosting = true;
                }else{
                    continue;
                }
            }
        }
        return boosting;
    }
    
    Creep.prototype.switchRole = function(requestedRole){
        if(!this.memory.spawnRoom){
            return false;
        }
        if(!Memory.rooms[this.memory.spawnRoom].creepRoleCounts){
            Memory.rooms[this.memory.spawnRoom].creepRoleCounts = {};
        }else{
            Memory.rooms[this.memory.spawnRoom].creepRoleCounts[this.memory.role]--;
            if(Memory.rooms[this.memory.spawnRoom].creepRoleCounts[this.memory.role] <= 0){
                Memory.rooms[this.memory.spawnRoom].creepRoleCounts[this.memory.role] = undefined;
            }
        }
        this.memory.role = requestedRole;
        if(!Memory.rooms[room.name].creepRoleCounts[this.memory.role]){
            Memory.rooms[room.name].creepRoleCounts[this.memory.role] = 1;
        }else{
            Memory.rooms[room.name].creepRoleCounts[this.memory.role]++;
        }
        return true;
    }
};
