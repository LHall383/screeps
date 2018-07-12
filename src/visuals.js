module.exports = {
    turnOnRoomVisuals: function(roomName){
        if(!Memory.visuals) Memory.visuals = {};
        if(!Memory.visuals.activeRooms) Memory.visuals.activeRooms = [];
        
        if(!_.includes(Memory.visuals.activeRooms, roomName)){
            Memory.visuals.activeRooms.push(roomName);
            return true;
        }
        return false;
    },
    
    turnOffRoomVisuals: function(roomName){
        if(!Memory.visuals || !Memory.visuals.activeRooms){
            return false;
        }
        
        return _.remove(Memory.visuals.activeRooms, rn=>rn===roomName).length > 0;
    },
    
    shouldVisualize: function(roomName){
        return _.includes(Memory.visuals.activeRooms, roomName);
    }
};