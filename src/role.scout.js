module.exports = function(){
    Creep.prototype.runRoleScout = function(){
        if(this.memory.scoutRoom){
            if(this.room.name != this.memory.scoutRoom){
                if(this.memory.scoutPos){
                    this.moveToRoom(this.memory.scoutRoom, (new RoomPosition(this.memory.scoutPos.x, this.memory.scoutPos.y, this.memory.scoutPos.roomName)));
                }else{
                    this.moveToRoom(this.memory.scoutRoom);
                }
            }else{
                this.memory._move = undefined;
                if(this.memory.scoutPos){
                    this.moveTo(new RoomPosition(this.memory.scoutPos.x, this.memory.scoutPos.y, this.memory.scoutPos.roomName));
                }else{
                    this.moveTo(new RoomPosition(25, 25, this.room.name));
                }
                if(this.room.find(FIND_MY_CREEPS).length > 1){ //if, there's another creep here already, scouting is useless
                    utility.logger.details('Scout in room '+this.room.name+' with existing creep: '+this.name);
                    this.suicide();
                }
            }
        }
    }
};