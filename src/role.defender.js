module.exports = function(){
    Creep.prototype.runRoleDefender = function(){
        this.attackClosest();
        // this.heal(this);
    }
};
