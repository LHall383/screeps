module.exports = {
    runObservers: function() {
        for(let observer of _.filter(Game.structures, s=>{return s.structureType == STRUCTURE_OBSERVER;})){
            //check memory of rooms in range to see if we need to scan them again
            let parsed = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(observer.pos.roomName);
            let observerX = parseInt(parsed[2]);
            if(parsed[1] == 'W'){
                observerX *= -1;
            }
            let observerY = parseInt(parsed[4]);
            if(parsed[3] == 'S'){
                observerY *= -1;
            }
            
            for(let x=observerX-OBSERVER_RANGE; x<=observerX+OBSERVER_RANGE; x++){
                for(let y=observerY-OBSERVER_RANGE; y<=observerY+OBSERVER_RANGE; y++){
                    let scanRoom = '';
                    if(x < 0){
                        scanRoom += 'W';
                        scanRoom += x * -1;
                    }else{
                        scanRoom += 'E';
                        scanRoom += x;
                    }
                    if(y < 0){
                        scanRoom += 'S';
                        scanRoom += y * -1;
                    }else{
                        scanRoom += 'N';
                        scanRoom += y;
                    }
                    if((!Memory.rooms[scanRoom] || Memory.rooms[scanRoom].tss > TICKS_BETWEEN_SCANS)){
                        let result = observer.observeRoom(scanRoom);
                        if(result == OK){
                            // console.log('Scanned room '+scanRoom);
                        }
                    }
                }
            }
        }
    }
};