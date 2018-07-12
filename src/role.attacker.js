module.exports = function(){
    Creep.prototype.runRoleAttacker = function(){
        this.say('⚔️', true);
        
        let targetPos;
        if(this.memory.flagName && Game.flags[this.memory.flagName]){
            targetPos = Game.flags[this.memory.flagName].pos;
        }else if(this.memory.targetRoom){
            targetPos = new RoomPosition(25, 25, this.memory.targetRoom);
        }else{
            utility.logger.warn('Attacker '+this.name+' with no target position');
            return;
        }
        
        if(Memory.rooms[targetPos.roomName] && Memory.rooms[targetPos.roomName].hos){
            targetPos = new RoomPosition(Memory.rooms[targetPos.roomName].hos.pos[0].x, Memory.rooms[targetPos.roomName].hos.pos[0].y, targetPos.roomName);
        }
        
        if(this.room.name !== targetPos.roomName){
            this.moveToRoomSafe(targetPos.roomName, targetPos);
        }else if(this.room.name === targetPos.roomName){
            //find targets
            let tower = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (s) => {
                    return s.structureType == STRUCTURE_TOWER && s.energy > 10;
                }
            });
            let creep = this.pos.findClosestHostile();
            let spawn = this.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
            let struct = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: (s) => {
                    return s.structureType != STRUCTURE_CONTROLLER;
                }
            });
            let site = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
            
            var target;
            if(spawn){
                target = spawn;
            }else if(tower){
                target = tower;
            }else if(creep){
                target = creep;
            }else if(struct){
                target = struct;
            }else if(site){
                this.moveTo(site);
                return;
            }
            
            //attempt to move, if not possible, destroy wall
            if(target){
                let result = this.attack(target);
                this.rangedAttack(target);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(target, {ignoreDestructibleStructures: false});
                }
            }else{
                this.moveTo(targetPos, {range: 3});
            }
        }
    }
};
