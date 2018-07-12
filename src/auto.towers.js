module.exports = {
    run: function(towerIds){
        for(let tower of _.filter(Game.structures, s=>{return s.structureType == STRUCTURE_TOWER})){
            let closestHostile = tower.pos.findClosestHostile();
            if(closestHostile) {
                tower.attack(closestHostile);
            } else if(tower.energy > 350){
                // var harvesters = _.filter(Game.creeps, {memory: 'harvester'});
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
                            return structure.hits < 1000;
                        }else{
                            return structure.hits < structure.hitsMax;
                        }
                    }
                });
                if(closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }
};