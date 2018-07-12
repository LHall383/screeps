module.exports = {
    run: function(){
        for(let spawnName in Game.spawns){
            let spawn = Game.spawns[spawnName];
            
            let nearCreeps = spawn.pos.findInRange(FIND_HOSTILE_CREEPS, 2, {filter:c=>{
                return !utility.isFriendlyUsername(c.owner.username) &&
                       (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(WORK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0);
            }});
            
            if((nearCreeps.length > 0 || spawn.hits < (spawn.hitsMax * .5)) && !spawn.room.controller.safeMode){
                utility.logger.warn(spawn.name+" in room "+spawn.room.name+" is being attacked, entering safe mode.");
                Game.notify(spawn.name+" in room "+spawn.room.name+" is being attacked, entering safe mode.");
                spawn.room.controller.activateSafeMode();
            }
        }
    }
};