module.exports = function(){
    Creep.prototype.runRoleClaimer = function(){
        if(this.memory.flagName){
            let flag = Game.flags[this.memory.flagName];
            if(this.room.name != flag.pos.roomName){
                this.moveToRoomSafe(flag.pos.roomName, flag.pos);
            }else{
                let result = this.claimController(this.room.controller);
                // console.log(result);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(this.room.controller);
                }else if(result == ERR_INVALID_TARGET){
                    this.attackController(this.room.controller);
                    this.moveTo(this.room.controller);
                }
                
                if(this.room.find(FIND_HOSTILE_STRUCTURES).length > 0 || this.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).length > 0){
                    this.room.destroyAllHostileBuildings();
                    this.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).forEach(s=>s.remove());
                }else if(!Memory.rooms[this.room.name] || !Memory.rooms[this.room.name].base){
                    autoBasePlanning.createBasePlan(this.room.name);
                }
            }
        }
    }
};
