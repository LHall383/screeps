module.exports = {
    set: function(){
        const spawnPriority = {
            PRIORITY_EMERGENCY: 0,
            PRIORITY_DEFENDER: 10,
            PRIORITY_MINER: 20,
            PRIORITY_BASE_HAULER: 30,
            PRIORITY_HARVESTER: 30,
            PRIORITY_UPGRADER: 40,
            PRIORITY_BUILDER: 50,
            PRIORITY_SCAVENGER: 60,
            PRIORITY_EXTRACTOR: 70,
            PRIORITY_LAB_MANAGER: 80,
            PRIORITY_DISTANCE_DEFENDER_BASE: 130, //save all the way up to 299 for these
            PRIORITY_DISTANCE_SCOUT_BASE: 131,
            PRIORITY_DISTANCE_MINER_BASE: 132,
            PRIORITY_DISTANCE_HAULER_BASE: 133,
            PRIORITY_DISTANCE_RESERVER_BASE: 134,
            PRIORITY_DISTANCE_ROOM_INCREMENT: 10, //each distance harvest flag should increment the above base priorities by this amount
            PRIORITY_DISTANCE_BUILDER: 135,
            PRIORITY_EXPANSION_DEFENDER: 300,
            PRIORITY_EXPANSION_CLAIMER: 310,
            PRIORITY_EXPANSION_COLONIZER: 320,
            PRIORITY_ATTACKER: 330,
            PRIORITY_FILL_NUKER: 340,
            PRIORITY_SCOUT: 350,
            PRIORITY_ATTACK_CONTROLLER: 360,
            PRIORITY_PROCESS_POWER: 370
        }
        if(Object.freeze){
            Object.freeze(spawnPriority);
        }
        return spawnPriority;
    }
};