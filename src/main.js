//constants
require('global.constants')();

//utility functions and classes
global.utility = require('utility');
global.visuals = require('visuals');

//enums
global.spawnPriority = require('enum.spawnPriority').set();
global.buildPriority = require('enum.buildPriority').set();

//auto modules
global.autoBasePlanning = require('auto.basePlanning');
global.autoSpawning = require('auto.spawning');
global.autoCriticalMemoryWriting = require('auto.criticalMemoryWriting');
global.autoDefense = require('auto.defense');
global.autoLabs = require('auto.labs');
global.autoMemoryWriting = require('auto.memoryWriting');
global.autoTowers = require('auto.towers');
global.autoTrading = require('auto.trading');
global.autoScouting = require('auto.scouting');

//manager modules
global.managerRoomMaintenance = require('manager.roomMaintenance');
global.managerPowerProcessing = require('manager.powerProcessing');

//prototype additions
require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room')();
require('prototype.roomPosition')();

//creep roles
require('role.baseHauler')();
require('role.builder')();
require('role.harvester')();
require('role.miner')();
require('role.mover')();
require('role.transporter')();
require('role.upgrader')();
require('role.repairer')();
require('role.defender')();
require('role.reserver')();
require('role.distanceMiner')();
require('role.attacker')();
require('role.healer')();
require('role.labManager')();
require('role.claimer')();
require('role.distanceBuilder')();
require('role.extractor')();
require('role.scavenger')();
require('role.distanceHauler')();
require('role.colonizer')();
require('role.scout')();
require('role.planner')();
require('role.dismantler')();
require('role.healerRanger')();
require('role.controllerAttacker')();
require('role.powerHauler')();

module.exports.loop = function () {
    // console.log('<font style="color:Crimson"> Red Text! </font>');
    // \uD83E\uDD8D
    // Game.rooms.E42N7.addToSpawnQueue({mem: {role: 'healerRanger', flagName: 'get_double_fukt'}, body: Game.rooms.E42N7.generateBody([TOUGH, MOVE, MOVE, HEAL], 12), priority: 300})
    
    // Game.rooms.E41N5.addToSpawnQueue({mem: {role: 'dismantler', targetRoom: 'E41N4'}, body: Game.rooms.E41N5.generateBody([WORK, MOVE], maxParts=25), priority: 300})
    
    // var startCpu = Game.cpu.getUsed();
    // let extensions = Game.rooms['E41N5'].find(FIND_MY_STRUCTURES, {filter: s=>s.structureType==STRUCTURE_EXTENSION});
    // let counts = new PathFinder.CostMatrix();
    // extensions.forEach(e=>{
    //     counts.set(e.pos.x-1, e.pos.y, counts.get(e.pos.x-1, e.pos.y)+1);
    //     counts.set(e.pos.x+1, e.pos.y, counts.get(e.pos.x+1, e.pos.y)+1);
    //     counts.set(e.pos.x, e.pos.y-1, counts.get(e.pos.x, e.pos.y-1)+1);
    //     counts.set(e.pos.x, e.pos.y+1, counts.get(e.pos.x, e.pos.y+1)+1);
    // });
    // for(let x=2; x<=47; x++){ 
    //     for(let y=2; y<=47; y++){
    //         if(counts.get(x, y) >= 2) Game.rooms['E41N5'].visual.circle(x, y);
    //     }
    // }
    // console.log('CPU spent on test:', Game.cpu.getUsed() - startCpu);
    
    try{
        autoCriticalMemoryWriting.run();
    }catch(e){
        utility.logger.error('AutoCriticalMemoryWriting threw error: ['+e+']');
    }
    
    try{
        autoTowers.run();
    }catch(e){
        utility.logger.error('AutoTowers threw error: ['+e+']');
    }
    
    try{
        autoDefense.run();
    }catch(e){
        utility.logger.error('AutoDefense threw error: ['+e+']');
    }

    for(let name in Game.creeps) {
        try{
            var startCpu = Game.cpu.getUsed();
            var creep = Game.creeps[name];
            
            if(creep.memory._sqdId){
                continue;
            }
            
            if(!creep.memory.role){
                console.log('Creep: ' + creep.name + ' has no role!');
                continue;
            }
            
            if(creep.memory.role.includes('baseHauler')){
                creep.runRoleBaseHauler();
            }else if(creep.memory.role.includes('healerRanger')){
                creep.runRoleHealerRanger();
            }else if(creep.memory.role.includes('miner')){
                creep.runRoleMiner();
            }else if(creep.memory.role.includes('repairer')){
                creep.runRoleRepairer();
            }else if(creep.memory.role.includes('transporter')){
                creep.runRoleTransporter();
            }else if(creep.memory.role.includes('harvester')){
                creep.runRoleHarvester();
            }else if(creep.memory.role.includes('distanceBuilder')){
                creep.runRoleDistanceBuilder();
            }else if(creep.memory.role.includes('builder')){
                creep.runRoleBuilder();
            }else if(creep.memory.role.includes('extraUpgrader') || creep.memory.role.includes('upgrader')){
                creep.runRoleUpgrader();
            }else if(creep.memory.role.includes('attacker')){
                creep.runRoleAttacker();
            }else if(creep.memory.role.includes('defender')){
                creep.runRoleDefender();
            }else if(creep.memory.role.includes('healer')){
                creep.runRoleHealer();
            }else if(creep.memory.role.includes('claimer')){
                creep.runRoleClaimer();
            }else if(creep.memory.role.includes('distanceMiner')){
                creep.runRoleDistanceMiner();
            }else if(creep.memory.role.includes('extractor')){
                creep.runRoleExtractor();
            }else if(creep.memory.role.includes('scavenger')){
                creep.runRoleScavenger();
            }else if(creep.memory.role.includes('distanceMover') || creep.memory.role.includes('mover')){
                creep.runRoleMover();
            }else if(creep.memory.role.includes('distanceHauler')){
                creep.runRoleDistanceHauler();
            }else if(creep.memory.role.includes('colonizer')){
                creep.runRoleColonizer();
            }else if(creep.memory.role.includes('scout')){
                creep.runRoleScout();
            }else if(creep.memory.role.includes('planner')){
                creep.runRolePlanner();
            }else if(creep.memory.role.includes('reserver')){
                creep.runRoleReserver();
            }else if(creep.memory.role.includes('labManager')){
                creep.runRoleLabManager();
            }else if(creep.memory.role.includes('dismantler')){
                creep.runRoleDismantler();
            }else if(creep.memory.role.includes('controllerAttacker')){
                creep.runRoleControllerAttacker();
            }else if(creep.memory.role.includes('powerHauler')){
                creep.runRolePowerHauler();
            }else{
                utility.logger.warn('Creep: ' + creep.name + '\'s role: `' + creep.memory.role + '`, does not match any known role');
            }
            
        }catch(e){
            utility.logger.error('Creep: ' + creep.name + ' of role '+creep.memory.role+' threw error: ['+e+']');
        }finally{
            let endCpu = Game.cpu.getUsed();
            if(creep && visuals.shouldVisualize(creep.room.name)){
                let message = (endCpu-startCpu).toFixed(3);
                creep.room.visual.text(message, creep.pos, {color: '#000000', stroke: '#ffffff'});
            }
        }
    }
    
    try{
        if(Game.time % 7 == 0){
            autoSpawning.update();
        }else if(Game.time % 7 == 1){
            autoSpawning.spawnFromQueue();
        }
    }catch(e){
        utility.logger.error('Auto Spawning threw error: ['+e+']');
    }
    
    try{
        if(Game.time % 19 === 0){
            utility.logger.info('Running room maintenence');
            managerRoomMaintenance.run();
        }
    }catch(e){
        utility.logger.error('Room Maintenance Manager threw error: ['+e+']');
    }
    
    try{
        autoLabs.runReactions(); //labs have a variable cooldown, so we may as well try it every tick
        autoLabs.runBoosts();
    }catch(e){
        utility.logger.error('Auto Labs threw error: ['+e+']');
    }
    
    try{
        if(Game.time % 11 == 0){ //terminals have a 10 tick cooldown
            autoTrading.shareMinerals();
            autoTrading.trade();
            autoTrading.shareEnergy();
        }
    }catch(e){
        utility.logger.error('Auto Trading threw error: ['+e+']');
    }
    
    try{
        if(Game.time % 31 == 0){
            utility.logger.info('Auto memory writing');
            autoMemoryWriting.run();
        }
    }catch(e){
        utility.logger.error('Memory Writing threw error: ['+e+']');
    }
    
    // try{
    //     // if(Game.time % 19 == 0){
    //     //     utility.logger.info('Running room maintenence');
    //     //     for(let roomName in Game.rooms){
    //     //         let room = Game.rooms[roomName];
    //     //         room.manageBuildings();
    //     //     }
    //     // }
    // }catch(e){
    //     utility.logger.error('Manage Buildings threw error: ['+e+']');
    // }
    
    try{
        autoScouting.runObservers();
    }catch(e){
        utility.logger.error('Auto Scouting threw error: ['+e+']');
    }
    
    try{
        managerPowerProcessing.powerProcessing();
    }catch(e){
        utility.logger.error(`Power Processing threw error: [${e}]`);
    }
    
}











