module.exports = function(){
    Creep.prototype.runRoleDismantler = function(){
        if(!this.memory.targetRoom && !this.memory.flagName){
            this.say('No room!');
            return;
        }
        
        let targetPos;
        if(this.memory.flagName && Game.flags[this.memory.flagName]){
            targetPos = Game.flags[this.memory.flagName].pos;
        }else if(this.memory.targetRoom){
            targetPos = new RoomPosition(25, 25, this.memory.targetRoom);
        }
        // let targetRoom = this.memory.targetRoom ? this.memory.targetRoom : Game.flags[this.memory.flagName].pos.roomName;
        
        if(this.hits < this.hitsMax) this.heal(this);
        
        if(this.room.name != targetPos.roomName){
            this.moveToRoomSafe(targetPos.roomName, targetPos);
        }else if(this.room.name == targetPos.roomName){
            let filledTower = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_TOWER && s.energy > 10});
            let spawn = this.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
            let tower = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_TOWER});
            
            var target;
            if(filledTower){
                target = filledTower;
            }else if(spawn){
                target = spawn;
            }else if(tower){
                target = tower;
            }
            
            if(target){
                let dismantleResult = this.dismantle(target);
                if(dismantleResult == ERR_NOT_IN_RANGE){
                    let result = PathFinder.search(this.pos, target.pos, {roomCallback: (rn)=>{
                        if(!Game.rooms[rn]){
                            return false;
                        }
                        
                        let costs = new PathFinder.CostMatrix();
                        
                        Game.rooms[rn].find(FIND_STRUCTURES).forEach(s=>{
                            if(OBSTACLE_OBJECT_TYPES.includes(s.structureType) || (s.structureType == STRUCTURE_RAMPART && !s.my)){
                                costs.set(s.pos.x, s.pos.y, 255);
                            }
                        });
                        
                        return costs;
                    }});
                    
                    // utility.logger.info(JSON.stringify(result));
                    
                    if(result.incomplete){
                        let blocker = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_RAMPART || s.structureType==STRUCTURE_WALL});
                        let err = this.dismantle(blocker);
                        if(err == ERR_NOT_IN_RANGE){
                            this.moveTo(blocker);
                        }
                    }else{
                        this.moveByPath(result.path);   
                    }
                }
            }else{
                this.moveTo(targetPos);
            }
        }
    }
};
