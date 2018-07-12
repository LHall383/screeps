module.exports = function(){
    Creep.prototype.runRoleTransporter = function() {
        if(!this.memory.working && this.carryTotal() == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carryTotal() == 0){
            this.memory.working = false;
        }
        
        if((!this.memory.srcID && !this.memory.srcIDs) || !this.memory.destID || !this.memory.resourceType){
            this.say('bad mem');
            return;
        }
        
        if(!this.memory.working){
            if(this.memory.srcIDs){
                for(let srcID of this.memory.srcIDs){
                    var checkThis = Game.getObjectById(srcID);
                    if(checkThis){
                        var src = checkThis;
                    }
                    if(((checkThis.store && checkThis.store[this.memory.resourceType]) || (checkThis.mineralType && checkThis.mineralType == this.memory.resourceType))){
                        break;
                    }
                }
            }else if(this.memory.srcID){
                var src = Game.getObjectById(this.memory.srcID);
            }
            
            if(!src){
                this.say('bad srcID');
                // if(this.memory.srcIDs && this.carryTotal() >= 50){
                //     this.memory.working = true;
                // }
            }
            if(this.pos.roomName != src.pos.roomName){
                this.moveToRoom(src.pos.roomName, src.pos, {routeCallback: utility.routeCallbackSafe});
            }else{
                let result = this.withdraw(src, this.memory.resourceType);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(src);
                }
                // else if(result == ERR_NOT_ENOUGH_RESOURCES){
                //     this.memory.working = true;
                // }
            }
        }else{
            let dest = Game.getObjectById(this.memory.destID);
            if(!dest){
                this.say('bad destID');
            }
            if(this.pos.roomName != dest.pos.roomName){
                this.moveToRoom(dest.pos.roomName, dest.pos, {routeCallback: utility.routeCallbackSafe});
            }else{
                let result = this.transfer(dest, this.memory.resourceType);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(dest);
                }
                // else if(result == ERR_INVALID_TARGET){
                //     this.memory.working = false;
                // }
            }
        }
	}
};
