module.exports = function(){
    Creep.prototype.runRolePowerHauler = function(){
        if(this.room.name !== this.memory.spawnRoom){
            this.moveToRoom(this.memory.spawnRoom);
            return;
        }
        
        let target = Game.getObjectById(this.memory._tID);
        if(!target || target.structureType !== STRUCTURE_POWER_SPAWN){
            target = this.room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_POWER_SPAWN})[0];
            this.memory._tID = target.id;
        }
        
        if(target && target.power <= (target.powerCapacity - this.carryCapacity)){
            if(this.room.terminal && this.room.terminal.store[RESOURCE_POWER] && _.sum(this.carry) === 0){
                let result = this.withdraw(this.room.terminal, RESOURCE_POWER);
                if(result === ERR_NOT_IN_RANGE) this.moveTo(this.room.terminal);
            }else if(this.carry[RESOURCE_POWER]){
                let result = this.transfer(target, RESOURCE_POWER);
                if(result === ERR_NOT_IN_RANGE) this.moveTo(target);
            }
        }else{
            // this.say('💤');
        }
    }
}