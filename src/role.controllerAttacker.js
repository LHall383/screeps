module.exports = function(){
    Creep.prototype.runRoleControllerAttacker = function() {
        let targetPos;
        if(this.memory.flagName){
            let flag = Game.flags[this.memory.flagName];
            if(flag) targetPos = flag.pos;
        }
        
        
        if(targetPos && this.room.name != targetPos.roomName){
            this.moveToRoom(targetPos.roomName, targetPos);
        }else if(targetPos){
            let result = this.attackController(this.room.controller);
            
            if(result == ERR_NOT_IN_RANGE){
                this.moveTo(this.room.controller);
            }
        }
        
    }
};