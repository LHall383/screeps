module.exports = function(){
    Creep.prototype.runRoleLabManager = function() {
        if(!this.memory.working && this.carryTotal() == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carryTotal() == 0){
            this.memory.working = false;
        }
        
        //selected request should be stored in memory
        let currentRequest = this.room.getCurrentRequest(); // {resourceType: resource, requestAmount: requestAmount}
        let currentBoostRequest = this.room.getCurrentBoostRequest();
        var requestedMem = {};
        
        if(this.room.memory.labs && !currentRequest && currentBoostRequest){ //boost creeps
            // console.log(JSON.stringify(currentBoostRequest));
            let labIds = _(this.room.memory.labs.masters).concat(this.room.memory.labs.slaves).value();
            for(let id of labIds){
                let lab = Game.getObjectById(id);
                if(lab.mineralAmount == 0 || lab.mineralType == currentBoostRequest.bm){
                    requestedMem = {srcID: this.room.terminal.id, srcIDs: undefined, destID: id, resourceType: currentBoostRequest.bm};
                    break;
                }
            }
            // console.log(JSON.stringify(requestedMem))
            let goalLab = Game.getObjectById(requestedMem.destID);
            if(goalLab && goalLab.mineralAmount >= currentBoostRequest.mr){ //TELL CREEP THAT LAB IS READY
                let creep = Game.creeps[currentBoostRequest.cn];
                if(creep && !creep.memory.boostReady){
                    creep.memory.boostReady = true;
                    utility.logger.info(this.name+' notifying creep '+creep.name+' that labs are ready for boosting');
                }
            }else if(!goalLab){
                let labIds = _(this.room.memory.labs.masters).concat(this.room.memory.labs.slaves).value();
                for(let id of labIds){
                    let lab = Game.getObjectById(id);
                    if(lab.mineralAmount > 0){
                        requestedMem = {srcID: id, srcIDs: undefined, destID: this.room.terminal.id, resourceType: lab.mineralType};
                        break;
                    }
                }
            }
        }else if(this.room.memory.labs && this.room.memory.labs.slaves && this.room.memory.labs.masters && this.room.memory.labs.masters.length == 2 && currentRequest){
            let requestAmount = currentRequest.requestAmount;
            let component = utility.getReactants(currentRequest.resourceType);
            
            let master0 = Game.getObjectById(this.room.memory.labs.masters[0]);
            let master1 = Game.getObjectById(this.room.memory.labs.masters[1]);
            //empty master0 and master1 if they have the wrong minerals
            let shouldEmpty0 = master0.mineralType != null && master0.mineralType != component[0];
            let shouldEmpty1 = master1.mineralType != null && master1.mineralType != component[1];
            
            //get component[0] into master0 and component[1] into master1
            let fillAmount = requestAmount > master0.mineralCapacity ? master0.mineralCapacity : requestAmount;
            let shouldFill0 = (master0.mineralType != component[0] && master0.mineralAmount == 0) || (master0.mineralType == component[0] && master0.mineralAmount <= (fillAmount-this.carryCapacity) && master0.mineralAmount < master0.mineralCapacity);
            let shouldFill1 = (master1.mineralType != component[1] && master1.mineralAmount == 0) || (master1.mineralType == component[1] && master1.mineralAmount <= (fillAmount-this.carryCapacity) && master1.mineralAmount < master1.mineralCapacity);
            
            if(shouldEmpty0){
                requestedMem = {srcID: master0.id, srcIDs: undefined, destID: this.room.terminal.id, resourceType: master0.mineralType};
            }else if(shouldEmpty1){
                requestedMem = {srcID: master1.id, srcIDs: undefined, destID: this.room.terminal.id, resourceType: master1.mineralType};
            }else{
                //push all slaves to array with priorities
                let targets = [];
                for(let slaveId of this.room.memory.labs.slaves){
                    let slave = Game.getObjectById(slaveId);
                    if(slave.mineralAmount > 0){
                        let priority = slave.mineralType == currentRequest.resourceType ? slave.mineralCapacity-slave.mineralAmount : -10; //higher priority if it will prevent reactions
                        targets.push({id: slaveId, resourceType: slave.mineralType, priority: priority, method: 'empty'});
                    }
                }
                //push filling of masters to array with priorities
                if(shouldFill0){
                    targets.push({id: master0.id, resourceType: component[0], priority: master0.mineralAmount, method: 'fill'});
                }
                if(shouldFill1){
                    targets.push({id: master1.id, resourceType: component[1], priority: master1.mineralAmount, method: 'fill'});
                }
                
                targets.sort((a, b)=>{return a.priority - b.priority;});
                if(targets.length > 0){
                    if(targets[0].method == 'fill'){
                        requestedMem = {srcID: this.room.terminal.id, srcIDs: undefined, destID: targets[0].id, resourceType: targets[0].resourceType};
                    }else if(targets[0].method == 'empty'){
                        requestedMem = {srcID: targets[0].id, srcIDs: undefined, destID: this.room.terminal.id, resourceType: targets[0].resourceType};
                    }
                }
            }
        }else if(this.room.memory.labs){ //no requests, clear all the minerals out of slave and master labs
            let labIds = _(this.room.memory.labs.masters).concat(this.room.memory.labs.slaves).value();
            for(let id of labIds){
                let lab = Game.getObjectById(id);
                if(lab.mineralAmount > 0){
                    requestedMem = {srcID: id, srcIDs: undefined, destID: this.room.terminal.id, resourceType: lab.mineralType};
                    break;
                }
            }
        }
        
        //set memory, if safe to do so
        requestedMem.role = 'labManager';
        requestedMem.spawnRoom = this.room.name;
        if(_.sum(this.carry) == 0 || this.carry[requestedMem.resourceType] == _.sum(this.carry)){
            requestedMem.working = this.memory.working;
            this.memory = requestedMem;
        }else{
            this.moveToTransfer(this.room.terminal);
            return;
        }
        
        if((!this.memory.srcID && !this.memory.srcIDs) || !this.memory.destID || !this.memory.resourceType){
            this.say('🛑');
            // this.moveTo(new RoomPosition(25, 25, this.room.name));
            return;
        }
        
        if(!this.memory.working){
            if(this.memory.srcIDs){
                for(let srcID of this.memory.srcIDs){
                    var checkThis = Game.getObjectById(srcID);
                    if(checkThis){
                        var src = checkThis
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
            }
            if(this.pos.roomName != src.pos.roomName){
                this.moveToRoom(src.pos.roomName, src.pos);
            }else{
                let result = this.withdraw(src, this.memory.resourceType);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(src);
                }else if(result == ERR_NOT_ENOUGH_RESOURCES){
                    this.memory.working = true;
                }
            }
        }else{
            let dest = Game.getObjectById(this.memory.destID);
            if(!dest){
                this.say('bad destID');
            }
            if(this.pos.roomName != dest.pos.roomName){
                this.moveToRoom(dest.pos.roomName, dest.pos);
            }else{
                let result = this.transfer(dest, this.memory.resourceType);
                if(result == ERR_NOT_IN_RANGE){
                    this.moveTo(dest);
                }else if(result == ERR_INVALID_TARGET){
                    this.memory.working = false;
                }
            }
        }
    }
}