module.exports = function(){
    Creep.prototype.runRoleReserver = function(){
        if(this.memory.flagName){
            let flag = Game.flags[this.memory.flagName];
            if(Memory.rooms[flag.pos.roomName].hos){
                this.say('retreat!');
                this.moveToRoom(this.memory.spawnRoom);
                return;
            }
            
            if(flag && this.room.name != flag.pos.roomName){
                if(flag.room && flag.room.controller){
                    this.moveToRoom(flag.pos.roomName, flag.room.controller.pos);
                }else{
                    this.moveToRoom(flag.pos.roomName);
                }
            }else{
                if(this.room.controller){
                    let result = this.reserveController(this.room.controller);
                    if(result === ERR_NOT_IN_RANGE){
                        this.moveTo(this.room.controller);
                    }else if(result === OK && (!this.room.controller.sign || !utility.isFriendlyUsername(this.room.controller.sign.username))){
                        this.signController(this.room.controller, '\uD83E\uDD8D');
                    }
                }else{
                    utility.logger.warn('Reserver '+this.name+' attempting to reserve room with no controller!');
                }
            }
        }
    }
};
