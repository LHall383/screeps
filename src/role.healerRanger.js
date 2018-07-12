module.exports = function(){
    Creep.prototype.runRoleHealerRanger = function(){
        this.say('🏹', true);
        
        var targetPos;
        if(this.memory.flagName && Game.flags[this.memory.flagName]){
            targetPos = Game.flags[this.memory.flagName].pos;
        }else if(this.memory.targetRoom){
            targetPos = new RoomPosition(25, 25, this.memory.targetRoom);
        }
        
        if(targetPos && this.room.name != targetPos.roomName){
            this.moveToRoom(targetPos.roomName, targetPos);
        }else if(targetPos && this.room.name == targetPos.roomName){
            //find enemy
            let enemy = this.pos.findClosestHostile();
            let isAttacking = false;
            let isMoving = false;
            let isHealing = false;
            // console.log(enemy);
            if(enemy){
                if(this.pos.getRangeTo(enemy) <= 3){
                    this.rangedAttack(enemy);
                    isAttacking = true;
                }else{
                    this.moveTo(enemy);
                    isMoving = true;
                }
            }
            
            //find heal target
            if(this.hits < this.hitsMax){
                this.heal(this);
            }else{
                let targets = this.pos.findInRange(FIND_CREEPS, 1, {
                    filter: c=>{
                        return c.hits < c.hitsMax && utility.isFriendlyUsername(c.owner.username);
                    }
                });
                
                let target = _.min(targets, c=>{
                    return c.hits / c.hitsMax;
                });
                
                if(target !== Infinity){
                    this.heal(target);
                    isHealing = true;
                }else if(!isAttacking){
                    let targets = this.pos.findInRange(FIND_CREEPS, 3, {
                        filter: c=>{
                            return c.hits < c.hitsMax && utility.isFriendlyUsername(c.owner.username);
                        }
                    });
                    
                    let target = _.min(targets, c=>{
                        return c.hits / c.hitsMax;
                    });
                    this.rangedHeal(target);
                }
            }
            
            if(!isHealing && !isMoving && !isAttacking){
                this.moveTo(targetPos);
            }
        }
    }
};