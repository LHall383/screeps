module.exports = function(){
    Creep.prototype.runRoleMiner = function() {
        if(this.ticksToLive < (this.body.length * CREEP_SPAWN_TIME)){
            this.memory.shouldReplace = true;
        }
        
        var dest = Game.getObjectById(this.memory.destID);
        var inPosition = true;
        if(!this.pos.isEqualTo(dest.pos) && !this.spawning){
            this.moveTo(dest.pos);
            let blockerCreep = dest.pos.lookFor(LOOK_CREEPS);
            if(blockerCreep && blockerCreep.length > 0){
                blockerCreep[0].move(Game.time % 8 + 1);
                blockerCreep[0].say('moving out');
            }
            inPosition = false;
        }
        
        if(inPosition){
            var src = Game.getObjectById(this.memory.srcID);
            if(src){
                this.harvest(src);
            }
        }
	}
};
