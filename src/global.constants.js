module.exports = function(){
    //logging levels
    global.LOG_LEVEL_ERROR = 0;
    global.LOG_LEVEL_WARN = 1;
    global.LOG_LEVEL_INFO = 2;
    global.LOG_LEVEL_DETAILS = 3;
    global.LOG_LEVEL_DEBUG = 4;
    global.CURRENT_LOG_LEVEL = LOG_LEVEL_DETAILS;
    
    //automated scouting
    global.TICKS_BETWEEN_SCANS = 1000;
    
    //constants for automated construction
    global.CRITICAL_STUCTURES = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN, STRUCTURE_OBSERVER];
    global.MAX_REPAIR_PERCENTAGE = 1/3;                         //100,000,000 at 300M max
    
    //energy amounts in storage before spawning certain creeps or doing certain actions
    global.ENERGY_BEFORE_UPGRADING = STORAGE_CAPACITY * .005;       //  5,000
    global.ENERGY_BEFORE_BUILDING = STORAGE_CAPACITY * .02;         // 20,000
    global.ENERGY_BEFORE_FORTIFYING = STORAGE_CAPACITY * .05;       // 50,000
    global.ENERGY_BEFORE_LARGE_UPGRADING = STORAGE_CAPACITY * .06;  // 60,000
    global.ENERGY_BEFORE_FILLING_NUKER = STORAGE_CAPACITY * .08;    // 80,000
    global.ENERGY_BEFORE_SECOND_UPGRADER = STORAGE_CAPACITY * .10;  //100,000
    global.ENERGY_BEFORE_THIRD_UPGRADER = STORAGE_CAPACITY * .30;   //300,000
    global.ENERGY_BEFORE_POWER_PROCESSING = STORAGE_CAPACITY * .50; //500,000
    global.ENERGY_BEFORE_PREFER_STORAGE = STORAGE_CAPACITY * .80;   //800,000
    global.MAX_STORAGE_ENERGY = STORAGE_CAPACITY * .90;             //900,000
    
    //amounts to store in terminal
    global.TARGET_TERMINAL_ENERGY = TERMINAL_CAPACITY * .10;        // 30,000
    global.TARGET_TERMINAL_MINERAL = TERMINAL_CAPACITY * .10;       // 30,000
    global.MINERAL_BEFORE_SELLING = TERMINAL_CAPACITY * .20;        // 60,000
    global.ENERGY_BEFORE_TERMINAL_WITHDRAW = TERMINAL_CAPACITY*.15; // 45,000
    global.ENERGY_SHARING_LIMIT = TERMINAL_CAPACITY * .20;          // 60,000
    global.ENERGY_BEFORE_SHARING = TERMINAL_CAPACITY * (7/30);      // 70,000
    global.ENERGY_BEFORE_SELLING = TERMINAL_CAPACITY * (1/3);       //100,000
    
    //constants for trading
    global.MIN_ENERGY_PER_SHARE = 2500;
    global.MIN_AMOUNT_PER_TRADE = 1000;
    global.MIN_MINERAL_SELL_PRICE = 0.05;
    global.MAX_MINERAL_BUY_PRICE = 0.3;

    //constants for distance mining
    global.MIN_DISTANCE_MINE_RESERVE_TICKS = 500;
    
    //priorities for distance builders
    global.DISTANCE_BUILDER_PRIORITY_CRITICAL_REPAIRS = 0;
    global.DISTANCE_BUILDER_PRIORITY_CONSTRUCTION = 1000;
    global.DISTANCE_BUILDER_PRIORITY_REPAIRS = 2000;
    global.DISTANCE_BUILDER_PRIORITY_ROOM_SCALING = 100;
    
    //distances from link to target source or destination
    global.RANGE_TO_HOME_LINK = 2;
    global.RANGE_TO_UPGRADE_LINK = 2;
    
    //room ranges
    global.ATTACK_ROOM_RANGE = 11;
};