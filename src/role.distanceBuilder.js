module.exports = function(){
    Creep.prototype.runRoleDistanceBuilder = function() {
        if(!this.memory.working && this.carry.energy == this.carryCapacity){
            this.memory.working = true;
        }else if(this.memory.working && this.carry.energy == 0){
            this.memory.working = false;
        }
        
        if(!this.memory.working) {
            if(this.memory.energyRoom && this.room.name != this.memory.energyRoom){
                this.moveToRoom(this.memory.energyRoom);
            }else{
                if(!this.obtainEnergy(this.memory.containerId)){
                    if(!this.obtainEnergy(this.memory.srcID)){
                        var source = this.pos.findClosestByRange(FIND_SOURCES);
                        if(this.harvest(source) == ERR_NOT_IN_RANGE){
                            this.moveTo(source);
                        }
                    }
                }
            }
        }else{
            if(this.memory.buildRooms){
                let criticalRepairs = [];
                let sites = [];
                let repairs = [];
                for(let buildRoomName of this.memory.buildRooms){
                    if(!Game.rooms[buildRoomName] || Memory.rooms[buildRoomName].hos){
                        continue; //can't see into room or shouldn't go into room
                    }
                    let addedRoomScore = this.room.name === buildRoomName ? 0 : Game.map.findRoute(this.room.name, buildRoomName) * DISTANCE_BUILDER_PRIORITY_ROOM_SCALING || DISTANCE_BUILDER_PRIORITY_ROOM_SCALING;
                    Game.rooms[buildRoomName].find(FIND_MY_CONSTRUCTION_SITES, {filter: s=>s.structureType==STRUCTURE_ROAD}).forEach(site=>{
                        let distScore = this.room.name === buildRoomName ? this.pos.getRangeTo(site) : 0;
                        sites.push({target: site, priority: DISTANCE_BUILDER_PRIORITY_CONSTRUCTION+addedRoomScore+distScore});
                    });
                    let minHitsPercentage = this.room.name === buildRoomName ? 1.0 : .8;
                    Game.rooms[buildRoomName].find(FIND_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_ROAD}).forEach(road=>{
                        if(road.hits < road.hitsMax * .2){
                            let distScore = this.room.name === buildRoomName ? this.pos.getRangeTo(road) : 0;
                            criticalRepairs.push({target: road, priority: DISTANCE_BUILDER_PRIORITY_CRITICAL_REPAIRS+addedRoomScore+distScore});
                        }else if(road.hits < road.hitsMax * minHitsPercentage){
                            let distScore = this.room.name == buildRoomName ? this.pos.getRangeTo(road) : 0;
                            let hitRatio = Math.pow(road.hits / road.hitsMax, 2);
                            repairs.push({target: road, priority: DISTANCE_BUILDER_PRIORITY_REPAIRS+addedRoomScore+(distScore*hitRatio)});
                        }
                    })
                }
                if(criticalRepairs.length > 0){
                    let best = _.min(criticalRepairs, 'priority');
                    this.repair(best.target);
                    this.moveTo(best.target);
                }else if(sites.length > 0){
                    let best = _.min(sites, 'priority');
                    this.build(best.target);
                    this.moveTo(best.target);
                }else if(repairs.length > 0){
                    let best = _.min(repairs, 'priority');
                    this.repair(best.target);
                    this.moveTo(best.target);
                }else{ //nothing to maintain in build rooms
                    if(this.room.name != this.memory.spawnRoom){
                        this.moveToRoom(this.memory.spawnRoom);
                    }else{
                        this.runRoleUpgrader();
                        return;
                    }
                }
                
            }
        }
        
    }
};