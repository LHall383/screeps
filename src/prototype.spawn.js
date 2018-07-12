module.exports = function(){
    // StructureSpawn.prototype.spawnMyCreep = function(memory, minimum, body){
    //     if(this.memory.hasTriedSpawn){
    //         return -100; //this spawn already has a spawn request
    //     }
        
    //     var count = _.sum(Game.creeps, (c) => {
    //         return c.memory.spawnRoom == this.room.name && c.memory.role == memory.role;
    //     });
        
    //     if(count < minimum){
    //         var val = this.createCreep(body, undefined, JSON.parse(JSON.stringify(memory)));
    //         this.memory.hasTriedSpawn = true;
    //         if(!(val < 0)){
    //             console.log(this.name + ' in '+this.room.name+' spawning new creep ' + val + ', role: ' + memory.role);
    //         }
    //         return val;
    //     }else{
    //         return -101; //Already enough creeps of that type from this spawn
    //     }
    // }
    
    // StructureSpawn.prototype.spawnMinerCreep = function(memory, minimum){
    //     if(this.room.energyCapacityAvailable >= 750){
    //         return this.spawnMyCreep(memory, minimum, [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE]);
    //     }else{
    //         return this.spawnMyCreep(memory, minimum, [WORK, WORK, WORK, WORK, WORK, MOVE]);
    //     }
        
    // }
    
    // StructureSpawn.prototype.spawnAttackCreep = function(memory, minimum, maxParts=5){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 350);
    //     parts > maxParts ? parts = maxParts : parts = parts;
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(TOUGH);
    //         body.push(TOUGH);
    //         body.push(TOUGH);
    //         body.push(TOUGH);
    //     }
    //     for(let i=0; i<parts; i++){
    //         body.push(MOVE);
    //         body.push(MOVE);
    //         body.push(MOVE);
    //         body.push(ATTACK);
    //         body.push(ATTACK);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnHealerCreep = function(memory, minimum){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 330);
    //     parts > 4 ? parts = 4 : parts = parts;
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(TOUGH);
    //         body.push(TOUGH);
    //         body.push(TOUGH);
    //     }
    //     for(let i=0; i<parts; i++){
    //         body.push(MOVE);
    //         body.push(MOVE);
    //     }
    //     for(let i=0; i<parts; i++){
    //         body.push(HEAL);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnDefenderCreep = function(memory, minimum){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 340);
    //     parts > 3 ? parts = 3 : parts = parts;
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(TOUGH);
    //         body.push(TOUGH);
    //     }
    //     for(let i=0; i<parts; i++){
    //         body.push(MOVE);
    //         body.push(MOVE);
    //         body.push(RANGED_ATTACK);
    //         body.push(ATTACK);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnBalancedCreep = function(memory, minimum, maxParts=5){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 200);
    //     parts > maxParts ? parts = maxParts : parts = parts;
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(WORK);
    //     }
    //     for(let i=0; i<parts; i++){
    //         body.push(CARRY);
    //     }
    //     for(let i=0; i<parts; i++){
    //         body.push(MOVE);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnFastBalancedCreep = function(memory, minimum, maxParts=6){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 250);
    //     parts > maxParts ? parts = maxParts : parts = parts;
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(WORK);
    //         body.push(CARRY);
    //         body.push(MOVE);
    //         body.push(MOVE);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnMoverCreep = function(memory, minimum, maxParts=10){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 100);
    //     parts > maxParts ? parts = maxParts : parts = parts;
        
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(CARRY);
    //         body.push(CARRY);
    //         body.push(MOVE);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnFastMoverCreep = function(memory, minimum, maxParts=10){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 100);
    //     parts > maxParts ? parts = maxParts : parts = parts;
        
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(CARRY);
    //         body.push(MOVE);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.spawnWorkerCreep = function(memory, minimum, maxParts=3){
    //     var parts = Math.floor(this.room.energyCapacityAvailable / 450);
    //     parts > maxParts ? parts = maxParts : parts = parts;
        
    //     var body = [];
    //     for(let i=0; i<parts; i++){
    //         body.push(WORK);
    //         body.push(WORK);
    //         body.push(WORK);
    //         body.push(CARRY);
    //         body.push(MOVE);
    //         body.push(MOVE);
    //     }
    //     return this.spawnMyCreep(memory, minimum, body);
    // }
    
    // StructureSpawn.prototype.conditionalSpawnScavengerCreep = function(count){
    //     if(this.room.storage && this.room.storage.store.energy > 40000){
    //         return this.spawnBalancedCreep({role: 'scavenger', spawnRoom: this.room.name}, count);
    //     }
        
    //     var droppedResources = this.room.find(FIND_DROPPED_RESOURCES);
    //     if(droppedResources.length > 0){
    //         let sum = 0;
    //         for(let i=0; i<droppedResources.length; i++){
    //             sum += droppedResources[i].amount;
    //         }
    //         if(sum > 1000){
    //             return this.spawnBalancedCreep({role: 'scavenger', spawnRoom: this.room.name}, count);
    //         }
    //     }
    // }
    
    // StructureSpawn.prototype.conditionalSpawnExtractorCreep = function(count){
    //     if(this.room.controller.level > 5){
    //         if(this.room.storage || this.room.terminal){
    //             var extractors = this.room.find(FIND_MY_STRUCTURES, {
    //                 filter: (s) => {
    //                     return s.structureType == STRUCTURE_EXTRACTOR;
    //                 }
    //             });
    //             if(extractors && extractors.length > 0){
    //                 var mineralSource = extractors[0].pos.lookFor(LOOK_MINERALS);
    //                 if(mineralSource && mineralSource.length > 0 && mineralSource[0].mineralAmount > 0){
    //                     if(this.room.storage){
    //                         return this.spawnWorkerCreep({role: 'extractor', destID: this.room.storage.id, srcID: mineralSource[0].id, spawnRoom: this.room.name}, count, 5);
    //                     }else{
    //                         return this.spawnWorkerCreep({role: 'extractor', destID: this.room.terminal.id, srcID: mineralSource[0].id, spawnRoom: this.room.name}, count, 5);
    //                     }
    //                 }else{//no minerals left on this extractor's deposit
    //                 }
    //             }else{//no extractor on the minerals
    //             }
    //         }else{//nowhere to store minerals
    //         }
    //     }else{//RCL not high enough
    //     }
    // }
    
    // StructureSpawn.prototype.conditionalSpawnRepairerCreep = function(memory, count, wallMinHits, wallMaxHits, rampartMinHits, rampartMaxHits){
    //     var ramparts = this.room.find(FIND_MY_STRUCTURES, {
    //         filter: (s) => {
    //             return s.structureType == STRUCTURE_RAMPART && s.hits < rampartMinHits;
    //         }
    //     });
    //     if(ramparts && ramparts.length > 0){
    //         // console.log(this.name + ' found ' + ramparts.length + ' ramparts' + wallMinHits + ' ' + wallMaxHits);
    //         return this.spawnBalancedCreep(memory, count);
    //     }else{
    //         var walls = this.room.find(FIND_STRUCTURES, {
    //             filter: (s) => {
    //                 return s.structureType == STRUCTURE_WALL && s.hits < wallMinHits;
    //             }
    //         });
    //         // console.log(this.name + ' ' + walls)
    //         if(walls && walls.length > 0){
    //             // console.log(this.name + ' found ' + walls.length + ' walls ' + wallMinHits + ' ' + wallMaxHits);
    //             return this.spawnBalancedCreep(memory, count);
    //         }else{
    //             //no repairer creeps needed
    //             return -102;
    //         }
    //     }
    // }
    
    StructureSpawn.prototype.scaleMin = function(minimum){
        var newMin = (((6 - (this.room.energyCapacityAvailable / 200)) / 2) + .1) * minimum;
        
        if(newMin < minimum){
            return minimum;
        }else{
            return newMin;
        }
    }
    
    StructureSpawn.prototype.createCreepName = function(){
        let vowels = 'aeiou';
        let consonants = 'bcdfghjklmnpqrstvwxyz';
        
        do{
            var name = '';
            for(let i=0; i<5; i++){
                if(i == 0){
                    name = name.concat(consonants[Math.floor(Math.random()*consonants.length)].toUpperCase());
                    continue;
                }
                if(i%2 == 0){
                    name = name.concat(consonants[Math.floor(Math.random()*consonants.length)]);
                }else{
                    name = name.concat(vowels[Math.floor(Math.random()*vowels.length)]);
                }
            }
        }while(Game.creeps[name]);
        
        return name;
    }
};





