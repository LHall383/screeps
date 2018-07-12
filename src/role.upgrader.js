module.exports = function(){
    Creep.prototype.runRoleUpgrader = function() {
        if(!this.memory.shouldReplace && this.memory.role == 'upgrader' && this.ticksToLive < this.body.length * CREEP_SPAWN_TIME){
            this.memory.shouldReplace = true;
        }
        
        if(!this.memory.working && _.sum(this.carry) >= (this.carryCapacity * .75)){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        if((this.memory.role == 'upgrader' || this.memory.role.includes('extraUpgrader')) && this.ticksToLive > (CREEP_LIFE_TIME * .85) && this.room.memory.labs){
            let mineralRequired = _.size(_.filter(this.body, b=>{
                return b.type == WORK && b.boost == undefined;
            })) * LAB_BOOST_MINERAL;
            if(mineralRequired > 0){
                if(!this.room.memory.labs.boostRequests){
                    this.room.memory.labs.boostRequests={};
                }
                this.room.memory.labs.boostRequests[this.name] = {cn: this.name, mr: mineralRequired, bm: RESOURCE_CATALYZED_GHODIUM_ACID};
            }
        }
        
        if(this.memory.boostReady){
            let boostableParts = _.size(_.filter(this.body, b=>{ return b.type == WORK && b.boost == undefined; }));
            let mineralRequired = boostableParts * LAB_BOOST_MINERAL;
                
            let labs = this.room.find(FIND_MY_STRUCTURES, {filter: s=>{
                return s.structureType == STRUCTURE_LAB && s.mineralType == RESOURCE_CATALYZED_GHODIUM_ACID && s.mineralAmount >= mineralRequired;
            }});
            
            if(boostableParts <= 0 && this.room.memory.labs && this.room.memory.labs.boostRequests && this.room.memory.labs.boostRequests[this.name]){
                delete this.room.memory.labs.boostRequests[this.name];
            }
            
            if(labs.length > 0 && mineralRequired > 0){
                let result = labs[0].boostCreep(this);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(labs[0]);
                }
                return;
            }else{
                delete this.memory.boostReady;
            }
        }
        
        if(!this.memory.working){
            if(this.room.memory.base && this.room.memory.base.upgradeLinkId){
                var linkSrc = Game.getObjectById(this.room.memory.base.upgradeLinkId);
            }
            
            if(linkSrc && linkSrc.energy > 0 && this.pos.getRangeTo(linkSrc) < 6){
                let result = this.withdraw(linkSrc, RESOURCE_ENERGY);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(linkSrc);
                }
            }else if(!this.obtainEnergy(this.memory.containerId)){
                if(!this.obtainEnergy(this.memory.srcID)){
                    var source = this.pos.findClosestByRange(FIND_SOURCES);
                    if(this.harvest(source) == ERR_NOT_IN_RANGE){
                        this.moveTo(source);
                    }
                }
            }
        }else{
            if(this.memory.upgradeRoom && this.room.name != this.memory.upgradeRoom){
                this.moveToRoom(this.memory.upgradeRoom);
            }else{
                this.moveToUpgrade(this.room.controller);
            }
        }
	  }
};
