module.exports = function(){
    Creep.prototype.runRoleHealer = function(){
        let targetPos;
        if(this.memory.flagName && Game.flags[this.memory.flagName]){
            targetPos = Game.flags[this.memory.flagName].pos;
        }
        
        if(!targetPos){
            utility.logger.warn('Healer with no target position');
            return;
        }
        
        if(this.room.name != targetPos.roomName){
            this.moveToRoom(targetPos.roomName, targetPos);
        }else{
            let targets = this.room.find(FIND_MY_CREEPS, {filter: c=>c.hits<c.hitsMax}).map(c=>{
                let rangeTo = this.pos.getRangeTo(c.pos);
                let multiplier = rangeTo === 0 ? .25 : rangeTo;
                return {target: c, hitRatio: (c.hits / c.hitsMax) * multiplier};
            });
            let lowest = _.min(targets, 'hitRatio');
            
            if(lowest !== Infinity){
                let rangeTo = this.pos.getRangeTo(lowest.target);
                if(rangeTo <= 1){
                    this.heal(lowest.target);
                }else if(rangeTo <= 3){
                    this.rangedHeal(lowest.target);
                    this.moveTo(lowest.target);
                }else{
                    this.moveTo(lowest.target);
                }
            }else{
                if(this.pos.getRangeTo(targetPos) > 5){
                    this.moveTo(targetPos);    
                }
            }
        }
    }
};