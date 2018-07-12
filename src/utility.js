module.exports = {
    getReactants: function(compound){
        let reactants = [];
        for(let reactant of Object.getOwnPropertyNames(REACTIONS)){
            if(_.includes(REACTIONS[reactant], compound)){
                reactants.push(reactant);
            }
        }
        return reactants;
    },
    
    isResourceCompound: function(resource){
        return utility.getReactants(resource).length == 2;
    },
    
    isFriendlyUsername: function(username){
        return username == 'luketheduke' || username == 'MrWayFarOut' || username == 'Baldinater' || username == 'Phuneus' || username == 'Doc360';
    },
    
    routeCallbackPreferFriendlyRoomsAndHighway: function(roomName, fromRoomName){
        if(Room.prototype.isHighway(roomName) || Room.prototype.hasFriendlyOwner(roomName)){
            return 1;
        }else if(Room.prototype.hasHostileOwner(roomName)){
            return 12;
        }else if(Room.prototype.isLair(roomName)){
            return 5;
        }else{
            return 2;
        }
    },
    
    routeCallbackSafe: function(roomName, fromRoomName) {
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        let isHighway = (parsed[1] % 10 === 0) || 
                        (parsed[2] % 10 === 0);
        let isMyRoom = Game.rooms[roomName] &&
            Game.rooms[roomName].controller &&
            Game.rooms[roomName].controller.my;
        if (isHighway || isMyRoom) {
            return 1;
        } else {
            return 2.5;
        }
    },
    
    roomCallbackPreferRoadsAvoidObstacles: function(roomName){
        const ROAD_COST = 1;
        const PLAIN_COST = 2;
        const SWAMP_COST = 5;
        const OBSTACLE_COST = 255;
        let costs = new PathFinder.CostMatrix();
        
        for(let x=0; x<50; x++){
            for(let y=0; y<50; y++){
                let terrain = Game.map.getTerrainAt(x, y, roomName);
                if(terrain == 'plain'){
                    costs.set(x, y, PLAIN_COST);
                }else if(terrain == 'swamp'){
                    costs.set(x, y, SWAMP_COST);
                }else{
                    costs.set(x, y, OBSTACLE_COST);
                }
            }
        }
        
        if(Game.rooms[roomName]){
            Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function(s){
                if(s.structureType == STRUCTURE_ROAD){
                    costs.set(s.pos.x, s.pos.y, ROAD_COST);
                }else if(OBSTACLE_OBJECT_TYPES.includes(s.structureType)){
                    costs.set(s.pos.x, s.pos.y, OBSTACLE_COST);
                }
            });
        }
        
        return costs;
    },
    
    roomCallbackPreferRoadsAvoidObstaclesWithBuildQueue: function(roomName){
        const ROAD_COST = 1;
        // const WALKABLE_TERRAIN_COST = 2;
        const OBSTACLE_COST = 255;
        let costs = new PathFinder.CostMatrix();
        
        if(Memory.rooms[roomName] && Memory.rooms[roomName].buildQueue && Memory.rooms[roomName].buildQueue.length > 0){
            Memory.rooms[roomName].buildQueue.forEach(function(s){
                if(s.structureType == STRUCTURE_ROAD){
                    costs.set(s.x, s.y, ROAD_COST);
                }else if(OBSTACLE_OBJECT_TYPES.includes(s.structureType)){
                    costs.set(s.x, s.y, OBSTACLE_COST);
                }
            });
        }
        
        if(Game.rooms[roomName]){
            Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function(s){
                if(s.structureType == STRUCTURE_ROAD){
                    costs.set(s.pos.x, s.pos.y, ROAD_COST);
                }else if(OBSTACLE_OBJECT_TYPES.includes(s.structureType)){
                    costs.set(s.pos.x, s.pos.y, OBSTACLE_COST);
                }
            });
            Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES).forEach(function(site){
                if(site.structureType == STRUCTURE_ROAD){
                    costs.set(site.pos.x, site.pos.y, ROAD_COST);
                }else if(OBSTACLE_OBJECT_TYPES.includes(site.structureType)){
                    costs.set(site.pos.x, site.pos.y, OBSTACLE_COST);
                }
            });
        }
        
        return costs;
    },
    
    logger: class Logger {
        static setLogLevel(logLevel){
            global.CURRENT_LOG_LEVEL = logLevel;  
        }
        
        static debug(message){
            if(CURRENT_LOG_LEVEL >= LOG_LEVEL_DEBUG){
                console.log('<font style="color:DeepSkyBlue">[DEBUG] '+message+'</font>');
            }
        }
        
        static details(message){
            if(CURRENT_LOG_LEVEL >= LOG_LEVEL_DETAILS){
                console.log('<font style="color:DarkGray">[DETAILS] '+message+'</font>');
            }
        }
        
        static info(message){
            if(CURRENT_LOG_LEVEL >= LOG_LEVEL_INFO){
                console.log('<font style="color:ForestGreen">[INFO] '+message+'</font>');
            }
        }
        
        static warn(message){
            if(CURRENT_LOG_LEVEL >= LOG_LEVEL_WARN){
                console.log('<font style="color:Orange">[WARN] '+message+'</font>')
            }
        }
        
        static error(message){
            if(CURRENT_LOG_LEVEL >= LOG_LEVEL_ERROR){
                console.log('<font style="color:Crimson">[ERROR] '+message+'</font>')
            }
        }
    },
    
    PriorityQueue: class PriorityQueue {
        constructor(comparator = (a, b) => a > b, arr) {
            this.top = 0;
            this.parent = i => ((i + 1) >>> 1) - 1;
            this.left = i => (i << 1) + 1;
            this.right = i => (i + 1) << 1;
            this._heap = [];
            this._comparator = comparator;
            arr.forEach(v => this.push(v));
        }
        size() {
            return this._heap.length;
        }
        isEmpty() {
            return this.size() == 0;
        }
        peek() {
            return this._heap[this.top];
        }
        push(...values) {
            values.forEach(value => {
                this._heap.push(value);
                this._siftUp();
            });
            return this.size();
        }
        pop() {
            const poppedValue = this.peek();
            const bottom = this.size() - 1;
            if (bottom > this.top) {
                this._swap(this.top, bottom);
            }
            this._heap.pop();
            this._siftDown();
            return poppedValue;
        }
        replace(value) {
            const replacedValue = this.peek();
            this._heap[this.top] = value;
            this._siftDown();
            return replacedValue;
        }
        _greater(i, j) {
            return this._comparator(this._heap[i], this._heap[j]);
        }
        _swap(i, j) {
            [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
        }
        _siftUp() {
            let node = this.size() - 1;
            while (node > this.top && this._greater(node, this.parent(node))) {
                this._swap(node, this.parent(node));
                node = this.parent(node);
            }
        }
        _siftDown() {
            let node = this.top;
            while ( (this.left(node) < this.size() && this._greater(this.left(node), node)) || (this.right(node) < this.size() && this._greater(this.right(node), node)) ) {
                let maxChild = (this.right(node) < this.size() && this._greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
                this._swap(node, maxChild);
                node = maxChild;
            }
        }
    }

};

