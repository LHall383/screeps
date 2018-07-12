module.exports = {
    powerProcessing: function(){
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room.controller || !room.controller.my || room.controller.level < 8){
                continue;
            }
            
            let powerSpawn = room.find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_POWER_SPAWN})[0];
            
            if(!powerSpawn){
                continue;
            }
            
            if(powerSpawn.power > 0 && powerSpawn.energy >= POWER_SPAWN_ENERGY_RATIO){
                powerSpawn.processPower();
            }
            
            if(Game.time % 7 == 0 && powerSpawn.power < powerSpawn.powerCapacity && room.storage && room.storage.store.energy >= ENERGY_BEFORE_POWER_PROCESSING && 
                                     room.terminal && room.terminal.store[RESOURCE_POWER] > 0 && room.roleCount('powerHauler') < 1){
                room.addToSpawnQueue({mem: {role: 'powerHauler', spawnRoom: room.name}, body: [CARRY, MOVE], priority: spawnPriority.PRIORITY_PROCESS_POWER});
            }
        }
    },
    
};