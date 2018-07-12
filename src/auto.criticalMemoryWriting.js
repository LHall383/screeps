module.exports = {
    run: function(){
        for(let roomName in Game.rooms){
            if(!Memory.rooms[roomName]){
                Memory.rooms[roomName] = {};
            }
            
            Memory.rooms[roomName].tss = 0; //ticks since seen
            
            let room = Game.rooms[roomName];
            let enemies = room.findHostileCreeps();
            if(enemies && enemies.length > 0){
                Memory.rooms[roomName].hos = {};
                Memory.rooms[roomName].hos.pos = enemies.map(e=>{return {x: e.pos.x, y: e.pos.y};});
                Memory.rooms[roomName].hos.num = enemies.length;
                Memory.rooms[roomName].hos.inv = _.every(enemies, e=>e.owner.username=='Invader');
                Memory.rooms[roomName].hos.atk = _.sum(enemies, e=>e.getActiveBodyparts(ATTACK));
                Memory.rooms[roomName].hos.rngatk = _.sum(enemies, e=>e.getActiveBodyparts(RANGED_ATTACK));
            }else{
                delete Memory.rooms[roomName].hos;
            }
            
            if(room.controller && room.controller.owner){
                Memory.rooms[roomName].own = room.controller.owner.username;
            }else{
                delete Memory.rooms[roomName].own;
            }
            
            if(room.controller && room.controller.reservation){
                Memory.rooms[roomName].res = room.controller.reservation.username;
            }else{
                delete Memory.rooms[roomName].res;
            }
            
            let powerBanks = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: s=>{
                    return s.structureType == STRUCTURE_POWER_BANK;
                }
            });
            if(powerBanks && powerBanks.length > 0){
                Memory.rooms[roomName].powerBankInfo = {
                    id: powerBanks[0].id,
                    pos: powerBanks[0].pos,
                    hits: powerBanks[0].hits,
                    power: powerBanks[0].power,
                    ticksToDecay: powerBanks[0].ticksToDecay
                };
            }else{
                delete Memory.rooms[roomName].powerBankInfo;
            }
        }
        
        for(let roomName in Memory.rooms){
            Memory.rooms[roomName].tss++;
            // if(Memory.rooms[roomName].powerBankId){
            //     let powerBank = Game.getObjectById(Memory.rooms[roomName].powerBankId);
            //     if(powerBank){
            //         Memory.powerBanks[powerBank.id] = {
            //             tick: Game.time,
            //             powerAmount: powerBank.power,
            //             position: powerBank.pos
            //         };
            //     }
            // }
        }
    }
};