module.exports = {
    set: function(){
        const buildPriority = {};
        buildPriority[STRUCTURE_SPAWN] = 1; //reserve 1-3 for all spawns
        buildPriority[STRUCTURE_EXTENSION] = 5;  //reserve 5-65 for all extensions
        buildPriority[STRUCTURE_CONTAINER] = 70; //reserve 70-74 for containers (if order matters)
        buildPriority[STRUCTURE_TOWER] = 80; //reserve 80-85 for all towers
        buildPriority[STRUCTURE_STORAGE] = 90;
        buildPriority[STRUCTURE_TERMINAL] = 100;
        buildPriority[STRUCTURE_LAB] = 110; //reserve 110-115 for all labs
        buildPriority[STRUCTURE_LINK] = 120;
        buildPriority[STRUCTURE_ROAD] = 130; //reserve up to 999 for these (helps with planning paths that should be constructed sequentially)
        buildPriority[STRUCTURE_EXTRACTOR] = 1000;
        buildPriority[STRUCTURE_WALL] = 1010; //leave up to 1999
        buildPriority[STRUCTURE_RAMPART] = 2000; //leave up to 2499
        buildPriority[STRUCTURE_OBSERVER] = 2500;
        buildPriority[STRUCTURE_POWER_SPAWN] = 2510;
        buildPriority[STRUCTURE_NUKER] = 2520;
        
        if(Object.freeze){
            Object.freeze(buildPriority);
        }
        return buildPriority;
    }
};