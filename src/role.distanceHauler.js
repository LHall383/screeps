module.exports = function(){
    Creep.prototype.runRoleDistanceHauler = function(){
        if(!this.memory.working && this.carry.energy == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        let sourcePos;
        if(this.memory.flagName && Game.flags[this.memory.flagName]){
            sourcePos = Game.flags[this.memory.flagName].pos;
        }else{
            utility.logger.warn(this.memory.role+' '+this.name+' has no source room.');
            return false;
        }
        let destRoom;
        if(this.memory.spawnRoom){
            destRoom = this.memory.spawnRoom;
        }else{
            utility.logger.warn(this.memory.role+' '+this.name+' has no dest room.');
            return false;
        }
        
        if(!this.memory.working){
            if(Memory.rooms[sourcePos.roomName].hos && Memory.rooms[sourcePos.roomName].hos.rngatk + Memory.rooms[sourcePos.roomName].hos.atk > 0){
                this.say('retreat!');
                this.moveToRoom(this.memory.spawnRoom);
                return;
            }
            if(sourcePos.roomName != this.room.name){
                this.moveToRoom(sourcePos.roomName, sourcePos);
            }else{
                if(!this.memory.srcID){
                    let containers = sourcePos.findInRange(FIND_STRUCTURES, 2, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER &&
                                   s.store[RESOURCE_ENERGY] > 0;
                        }
                    });
                    if(containers && containers.length > 0){
                        this.memory.srcID = containers[0].id;
                    }
                }
                if(!this.obtainEnergy(this.memory.srcID)){
                    this.say('no energy');
                    if(this.carry.energy >= (this.carryCapacity * .5)){
                        this.memory.working = true;
                        return;
                    }
                    let otherSource = this.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => {
                            return (s.energy && s.energy > 0) ||
                                   (s.store && s.store[RESOURCE_ENERGY] > 0);
                        }
                    });
                    if(otherSource){
                        this.moveToWithdraw(otherSource);
                    }
                }
            }
        }else{
            if(this.room.name != destRoom){
                this.moveToRoom(destRoom);
            }else{
                let targets = [];
                this.room.find(FIND_MY_STRUCTURES).forEach(s=>{
                    if(((s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN || s.id == Memory.rooms[this.memory.spawnRoom].base.homeLinkId) && s.energy < s.energyCapacity) || 
                        (s.structureType == STRUCTURE_TOWER && s.energy < (s.energyCapacity * 0.95))){
                        targets.push({target: s, score: 0+this.pos.getRangeTo(s)});
                    }else if(s.structureType == STRUCTURE_LAB && s.energy < s.energyCapacity){
                        targets.push({target: s, score: 100+this.pos.getRangeTo(s)});
                    }else if(s.structureType == STRUCTURE_NUKER && s.energy < s.energyCapacity){
                        targets.push({target: s, score: 200+this.pos.getRangeTo(s)});
                    }else if(s.structureType == STRUCTURE_POWER_SPAWN && s.energy < s.energyCapacity){
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
                
                if(this.room.storage && _.sum(this.room.storage.store) < this.room.storage.storeCapacity){
                    this.say('Storing!');
                    this.moveToTransfer(this.room.storage);
                }else{
                    this.say('Overflow');
                    this.moveToTransfer(this.room.terminal);
                }
            }
        }
    }
};