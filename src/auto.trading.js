module.exports = {
    trade: function(){
        const energyPerTransaction = 10000;
        const energyMinPrice = 0.02;
        
        //for each room that I have a terminal in
        for(let roomName in Game.rooms){
            let room = Game.rooms[roomName];
            if(!room || !room.terminal || !room.terminal.my){
                continue;
            }
            
            for(let resourceName in room.terminal.store){
                if(resourceName == RESOURCE_ENERGY){
                    var minPrice = energyMinPrice;
                    var sellThreshold = ENERGY_BEFORE_SELLING;
                }else{
                    var minPrice = MIN_MINERAL_SELL_PRICE;
                    var sellThreshold = MINERAL_BEFORE_SELLING;
                }
                if(room.terminal.store[resourceName] > sellThreshold && room.terminal.store[RESOURCE_ENERGY] >= energyPerTransaction){
                    //attempt to sell resource
                    // console.log('Attempting to sell '+resourceName+' from '+roomName)
                    let deals = Game.market.getAllOrders((order) => {
                        return order.type == ORDER_BUY && 
                               order.resourceType == resourceName &&
                               order.price > minPrice &&
                               order.amount > 0;
                    });
                    if(deals && deals.length > 0){
                        deals.sort((a, b) => {
                            return b.price - a.price;
                        });
                        let lowestToCheck = deals.length;
                        let nearestRoomInd = 0;
                        for(let i=0; i<lowestToCheck; i++){
                            // console.log(deals[i].price);
                            // console.log(deals[i].roomName);
                            if(Game.map.getRoomLinearDistance(roomName, deals[i].roomName, true) < Game.map.getRoomLinearDistance(roomName, deals[nearestRoomInd].roomName, true)){
                                nearestRoomInd = i;
                            }
                        }
                        let distanceBetweenRooms = Game.map.getRoomLinearDistance(room.name, deals[nearestRoomInd].roomName, true);
                        let ratio = ( 1 - Math.exp(-distanceBetweenRooms/30) );
                        let maxAmount = Math.min(Math.floor(energyPerTransaction / ratio), deals[nearestRoomInd].amount);
                        let amountToSell = maxAmount > 10000 ? 10000 : maxAmount;
                        let message = 'Selling '+amountToSell+' '+resourceName+' at a price of '+deals[nearestRoomInd].price+' to room '+deals[nearestRoomInd].roomName+' at an energy cost of '+Game.market.calcTransactionCost(amountToSell, roomName, deals[nearestRoomInd].roomName)+' from room '+roomName;
                        // console.log(message);
                        //Game.notify(message);
                        let result = Game.market.deal(deals[nearestRoomInd].id, amountToSell, roomName);
                        utility.logger.details(message+'\nDeal came back with return '+result);
                        if(result == OK){
                            Memory.trading.bankAmount += (amountToSell * deals[nearestRoomInd].price * Memory.trading.taxRate);
                            utility.logger.info('Added '+(amountToSell * deals[nearestRoomInd].price * Memory.trading.taxRate)+' to the bank, new balance: '+Memory.trading.bankAmount);
                        }
                    }else{
                        utility.logger.details('There were only '+deals.length+' deal(s) for '+resourceName+' selling from '+roomName+' above '+minPrice+', and none were tried');
                    }
                }
            }
        }
    },
    
    shareMinerals: function(){
        for(let terminal of _.filter(Game.structures, s=>{return s.structureType == STRUCTURE_TERMINAL})){
            if(!terminal.room.memory.labs || !terminal.room.memory.labs.labRequests){
                continue;
            }
            
            let baseMineralRequests = {};
            for(let mineral in terminal.room.memory.labs.labRequests){
                if(!utility.isResourceCompound(mineral)){
                    baseMineralRequests[mineral] = terminal.room.memory.labs.labRequests[mineral];
                }
            }
            if(JSON.stringify(baseMineralRequests) == '{}'){
                continue;
            }
            
            for(let sourceTerminal of _.filter(Game.structures, s=>{return s.structureType == STRUCTURE_TERMINAL})){
                if(sourceTerminal.cooldown > 0 || sourceTerminal.id == terminal.id){
                    continue;
                }
                for(let baseMineral in baseMineralRequests){
                    let amountToShare = baseMineralRequests[baseMineral] < MIN_AMOUNT_PER_TRADE ? MIN_AMOUNT_PER_TRADE : baseMineralRequests[baseMineral];
                    if(!sourceTerminal.store[baseMineral] || sourceTerminal.store[baseMineral] < (TARGET_TERMINAL_MINERAL+amountToShare)){
                        continue;
                    }
                    // if(sourceTerminal.store[baseMineral] - amountToShare < TARGET_TERMINAL_MINERAL && sourceTerminal.store[baseMineral] > (TARGET_TERMINAL_MINERAL+MIN_AMOUNT_PER_TRADE)){
                    //     amountToShare = sourceTerminal.store[baseMineral] - TARGET_TERMINAL_MINERAL;
                    // }
                    let result = sourceTerminal.send(baseMineral, amountToShare, terminal.pos.roomName);
                    if(result == OK){
                        utility.logger.info(sourceTerminal.pos.roomName+' sharing '+amountToShare+' '+baseMineral+' to room '+terminal.pos.roomName);
                        terminal.room.memory.labs.labRequests[baseMineral] -= amountToShare;
                        if(terminal.room.memory.labs.labRequests[baseMineral] <= 0){
                            delete terminal.room.memory.labs.labRequests[baseMineral];
                        }
                        delete baseMineralRequests[baseMineral];
                        break;
                    }
                }
            }
            
            for(let baseMineral in baseMineralRequests){
                // console.log(terminal.pos.roomName+' is looking for '+baseMineralRequests[baseMineral]+' '+baseMineral+' on the market');
                let deals = Game.market.getAllOrders(o=>{
                    return o.type == ORDER_SELL &&
                           o.resourceType == baseMineral &&
                           o.price <= MAX_MINERAL_BUY_PRICE;
                });
                
                let comparator = (o) => {
                    return o.price * Game.map.getRoomLinearDistance(o.roomName, terminal.pos.roomName);
                }
                let bestDeal = _.min(deals, comparator);
                
                let amountToDeal = Math.min(baseMineralRequests[baseMineral], bestDeal.amount);
                let costOfDeal = bestDeal.price * amountToDeal;
                if(Game.market.credits - costOfDeal >= Memory.trading.bankAmount){
                    let result = Game.market.deal(bestDeal.id, amountToDeal, terminal.pos.roomName);
                    if(result == OK){
                        console.log(terminal.pos.roomName+' purchased '+amountToDeal+' '+bestDeal.resourceType+' from '+bestDeal.roomName+' at a price of '+bestDeal.price);
                        Memory.rooms[terminal.pos.roomName].labs.labRequests[baseMineral] -= amountToDeal;
                        if(Memory.rooms[terminal.pos.roomName].labs.labRequests[baseMineral] <= 0){
                            delete Memory.rooms[terminal.pos.roomName].labs.labRequests[baseMineral];
                        }
                        break;
                    }
                }
            }
        }
    },
    
    shareEnergy: function(){
        let terminals = _.filter(Game.structures, s=>{return s.structureType == STRUCTURE_TERMINAL});
        
        let destinations = [];
        for(let destTerminal of terminals){
            if(destTerminal.store.energy < (ENERGY_SHARING_LIMIT - MIN_ENERGY_PER_SHARE)){
                destinations.push({target: destTerminal, score: (ENERGY_SHARING_LIMIT-destTerminal.store.energy)/destTerminal.room.controller.level});
            }
        }
        
        let bestDest = _.max(destinations, 'score');
        if(!bestDest.target){
            return;
        }
        
        let sources = [];
        for(let sourceTerminal of terminals){
            if(sourceTerminal.store.energy >= (ENERGY_BEFORE_SHARING + MIN_ENERGY_PER_SHARE)){
                sources.push({target: sourceTerminal, score: (sourceTerminal.store.energy-ENERGY_BEFORE_SHARING)*sourceTerminal.room.controller.level/Game.map.getRoomLinearDistance(bestDest.target.pos.roomName, sourceTerminal.pos.roomName, true)});
            }
        }
        
        let bestSource = _.max(sources, 'score');
        if(!bestSource.target){
            return;
        }
        
        let amountToTransfer = Math.min(ENERGY_SHARING_LIMIT-bestDest.target.store.energy, bestSource.target.store.energy-ENERGY_BEFORE_SHARING);
        let result = bestSource.target.send(RESOURCE_ENERGY, amountToTransfer, bestDest.target.pos.roomName);
        if(result === OK){
            utility.logger.info('Room '+bestSource.target.pos.roomName+' sharing '+amountToTransfer+' energy to room '+bestDest.target.pos.roomName);
        }
    }
};












