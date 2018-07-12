module.exports = function(){
    Creep.prototype.runRoleBaseHauler = function(){
        if(this.ticksToLive < (20 + (this.body.length * CREEP_SPAWN_TIME))){
            this.memory.shouldReplace = true;
        }
        
        if(!this.memory.working && _.sum(this.carry) == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && _.sum(this.carry) == 0){
            this.memory.working = false;
        }
        
        if(!this.memory.working) {
            let containers = this.room.find(FIND_STRUCTURES, {
                filter: { structureType: STRUCTURE_CONTAINER }
            }).map(c=>{return {target: c, priority: c.store.energy};});
            
            let best = _.max(containers, 'priority');
            if(best && best.priority > (this.carryCapacity * .5)){
                let result = this.withdraw(best.target, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) this.moveTo(best.target);
                return true;
            }
            
            if((!this.room.storage || this.room.storage.store.energy < ENERGY_BEFORE_PREFER_STORAGE) && this.room.terminal && this.room.terminal.store.energy > ENERGY_BEFORE_TERMINAL_WITHDRAW){
                let result = this.withdraw(this.room.terminal, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) this.moveTo(this.room.terminal);
                return true;
            }
            
            if(this.room.storage){
                let result = this.withdraw(this.room.storage, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) this.moveTo(this.room.storage);
                return true;
            }
            
            if(_.sum(this.carry) != 0){
                this.memory.working = true;
                return true;
            }
        } else {
            let targets = [];
            this.room.find(FIND_MY_STRUCTURES).forEach(s=>{
                if((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy < s.energyCapacity){
                    targets.push({target: s, score: 0+this.pos.getRangeTo(s)});
                }else if(s.structureType == STRUCTURE_TOWER && s.energy < (s.energyCapacity * 0.9)){
                    targets.push({target: s, score: 100+this.pos.getRangeTo(s)});
                }else if(s.structureType == STRUCTURE_LAB && s.energy < s.energyCapacity){
                    targets.push({target: s, score: 200+this.pos.getRangeTo(s)});
                }else if(s.structureType == STRUCTURE_LINK && s.energy < s.energyCapacity && this.room.memory.base && this.room.memory.base.homeLinkId == s.id){
                    targets.push({target: s, score: 300+this.pos.getRangeTo(s)});
                }
            });
            
            if(targets.length > 1){
                let best = _.min(targets, 'score');
                let result = this.transfer(best.target, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(best.target);
                }else if(result == OK){
                    let nextBest = _.min(targets, t=>{return t.target.id==best.target.id ? Infinity : t.score;});
                    if(this.pos.getRangeTo(nextBest.target) > 1){
                        this.moveTo(nextBest.target);
                    }
                }
                return true;
            }else if(targets.length == 1){
                let result = this.transfer(targets[0].target, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE) this.moveTo(targets[0].target);
                return true;
            }
            
            if(this.room.storage && _.sum(this.room.storage.store) < MAX_STORAGE_ENERGY){
                this.moveToTransfer(this.room.storage);
                return true;
            }
            
            if(this.room.terminal){
                this.moveToTransfer(this.room.terminal);
                return true;
            }
        }
    }
};
