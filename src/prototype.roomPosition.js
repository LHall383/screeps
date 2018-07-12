module.exports = function(){
    RoomPosition.prototype.findClosestHostile = function(){
        return this.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: (c) => {
                return !utility.isFriendlyUsername(c.owner.username);
            }
        });
    }
    
    RoomPosition.prototype.getRouteTo = function(otherRoomName, opts){
        return Game.map.findRoute(this.roomName, otherRoomName, opts);
    }
    
    RoomPosition.prototype.isValidPos = function(x, y){
        return x >= 0 && x <= 49 && y >= 0 && y <= 49;
    }
    
    RoomPosition.prototype.isObstructed = function(countCreeps = false, checkBuildQueue = true){
        if(!this.isValidPos(this.x, this.y)){
            return false;
        }
        //check terrain and non-walkable structures
        let obstructionCount = 0;
        let unobstructed = [];
        for(let xOffset=-1; xOffset<=1; xOffset++){
            for(let yOffset=-1; yOffset<=1; yOffset++){
                if(xOffset == 0 && yOffset == 0){ //don't count the space itself
                    continue;
                }
                let position = new RoomPosition(this.x+xOffset, this.y+yOffset, this.roomName);
                if(!this.isValidPos(position.x, position.y)){ //off the map, so we consider it obstructed
                    obstructionCount++;
                    continue;
                }
                if(Game.map.getTerrainAt(position) == 'wall' || _.intersection(_.map(position.lookFor(LOOK_STRUCTURES), s=>s.structureType), OBSTACLE_OBJECT_TYPES).length > 0){
                    obstructionCount++; //found a wall or a non-walkable structure at this location
                    continue;
                }
                if(countCreeps && position.lookFor(LOOK_CREEPS).length > 0){
                    obstructionCount++; //found a creep in the way
                    continue;
                }
                unobstructed.push({x: position.x, y: position.y});
            }
        }
        //check build queue against unobstructed positions
        if(checkBuildQueue && Memory.rooms[this.roomName] && Memory.rooms[this.roomName].buildQueue && Memory.rooms[this.roomName].buildQueue.length > 0){
            for(let site of Memory.rooms[this.roomName].buildQueue){
                if(!_.includes(OBSTACLE_OBJECT_TYPES, site.structureType)){
                    continue; //the structure is walkable, skip
                }
                let spliceInd = null;
                for(let i=0; i<unobstructed.length; i++){
                    if(site.x == unobstructed[i].x && site.y == unobstructed[i].y){
                        obstructionCount++;
                        spliceInd = i;
                        break;
                    }
                }
                if(spliceInd != null){
                    unobstructed.splice(spliceInd, 1);
                    if(unobstructed.length <= 0){
                        break;
                    }
                }
            }
        }
        return obstructionCount >= 8;
    }
};