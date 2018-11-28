class Canvas {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.body = document.body;

        const dimensionalSize = this.getBodyDimensions()
        this.width = dimensionalSize[0];
        this.height = dimensionalSize[1];
    }

    resizeToBody() {
        const dimensionalSize = this.getBodyDimensions();
        this.defineNewSize(dimensionalSize[0], dimensionalSize[1]);
    }

    defineNewSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    getBodyDimensions() {
        const width = this.body.offsetWidth - 20;
        const height = this.body.offsetHeight - 20;

        return [width, height];
    }

    clear() {
        this.ctx.clearRect(0,0, this.width, this.height);
    }
}

class Render {
    constructor() {
        this.toRender = [];
    }

    addToRender(tile) {
        this.toRender.push(tile);
    }

    render() {
        canvas.clear();
        this.toRender.forEach( tile => tile.render());
        requestAnimationFrame(this.render.bind(this));
    }
}

class Camera {
    constructor() {
        this.position = new Position(0,0);
        this.offsetPostion = new Position(0,0);
    }

    attachToPosition(position) {
        this.position = position;
    }

    setOffsetPosition(x, y) {
        this.offsetPostion.x = x;
        this.offsetPostion.y = y;
    }

    getCameraPosition() {
        const x = this.position.x + this.offsetPostion.x;
        const y = this.position.y + this.offsetPostion.y;

        return new Position(x, y);
    }
}

class Size {
    constructor(width, height) {
        this.width = width || 10;
        this.height = height || 10;
    }
}

class Position {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
}

class Player {
    constructor(x, y, width, height, centralized) {
        this.position = new Position(x, y);
        this.size = new Size(width, height);
        this.centralized = centralized || false;
        this.movingForce = new Force(0, 0);
        // this.totalForce = new Force(0, 0);
        this.extraForces = [];
        this.gravity = new Acceleration(0, 20);
    }

    handleNotification(event) {
        const type = event.type;
        const data = event.data;

        type == 'keydown' && this.handleKeydownCode(event.data);
        type == 'keyup' && this.handleKeyupCode(event.data);
    }

    handleKeydownCode(keyCode) {
        keyCode == 87 && (this.forward = true); 
        keyCode == 83 && (this.back = true); 
        keyCode == 65 && (this.left = true); 
        keyCode == 68 && (this.right = true); 
    }

    handleKeyupCode(keyCode) {
        keyCode == 87 && (this.forward = false); 
        keyCode == 83 && (this.back = false); 
        keyCode == 65 && (this.left = false); 
        keyCode == 68 && (this.right = false); 
    }
 
    recountPosition() {
        const totalForce = this.getTotalForce();
        this.recountTotalForce(totalForce);
        this.addDifferPosition(totalForce.x, totalForce.y);
    }

    getTotalForce() {
        const totalForce = new Force();
        this.setMovingForce();

        totalForce.add(this.movingForce);
        totalForce.add(this.getAccelerationForce());
        this.extraForces.forEach( extraForce => totalForce.add(extraForce));

        return totalForce;
    }

    recountTotalForce(totalForce) {
        const collideTiles = this.getCollidedTiles(totalForce);
        var maxXReduce = 0,
            maxYReduce = 0;
        
        if (!collideTiles.length) {
            return null;
        }

        collideTiles.forEach( tile => {
            const axesCollision = this.checkCollision(totalForce, tile);
            const collisionOnX = axesCollision[0],
                collisionOnY = axesCollision[1];
            
            if (!collisionOnX && !collisionOnY) {
                return null;
            }

            const intersectArea = tile.getIntersectArea(this, totalForce);
            const width = intersectArea.size.width,
                height = intersectArea.size.height;

            if (collisionOnX) {
                Math.abs(maxXReduce) > Math.abs(width) || (maxXReduce = width);
                this.resetAccelerationXForces();
            }

            if (collisionOnY) {
                Math.abs(maxYReduce) > Math.abs(height) || (maxYReduce = height);
                this.resetAccelerationYForces();
            }
        });

        totalForce.x -= maxXReduce;
        totalForce.y -= maxYReduce;
    }

    addDifferPosition(dx, dy) {
        this.position.x += dx;
        this.position.y += dy;
    }

    getCollidedTiles(totalForce) {
        const x = this.position.x + totalForce.x;
        const y = this.position.y + totalForce.y;
        const rightX = x + this.size.width;
        const bottomY = y + this.size.height;

        return GameObjects.filter( tile => rightX > tile.position.x && x < tile.position.x + tile.size.width
            && bottomY > tile.position.y && y < tile.position.y + tile.size.height);
    }

    checkCollision(totalForce, tile) {
        const currentX = this.position.x,
            currentY = this.position.y,
            currentRightX = this.position.x + this.size.width,
            currentBottomY = this.position.y + this.size.height;
        const x = this.position.x + totalForce.x;
        const y = this.position.y + totalForce.y;
        const rightX = x + this.size.width;
        const bottomY = y + this.size.height;

        return [
            currentBottomY > tile.position.y && currentY < tile.position.y + tile.size.height && 
            rightX > tile.position.x && x < tile.position.x + tile.size.width,

            bottomY > tile.position.y && y < tile.position.y + tile.size.height && 
            currentRightX > tile.position.x && currentX < tile.position.x + tile.size.width,
        ];
    }

    setMovingForce() {
        this.forward && (this.movingForce.setY(-10)); 
        this.back && (this.movingForce.setY(10)); 
        this.left && (this.movingForce.setX(-10)); 
        this.right && (this.movingForce.setX(10));
        
        (!this.back && !this.forward) && (this.movingForce.setY(0)); 
        (!this.right && !this.left) && (this.movingForce.setX(0)); 
    }

    resetAccelerationXForces() {
        this.gravity.resetXTime();
    }

    resetAccelerationYForces() {
        this.gravity.resetYTime();
    }

    getAccelerationForce() {
        return this.gravity.getCurrentForce();
    }

    render() {
        this.recountPosition();

        var x = this.position.x,
            y = this.position.y,
            width = this.size.width,
            height = this.size.height,
            cameraPosition = camera.getCameraPosition();

        //this.centralized && (x += canvas.width/2 + this.size.width / 2, y += canvas.height/2 + this.size.height / 2);

        // debugger;

        ctx.fillStyle = '#ff8888';
        ctx.fillRect(x - cameraPosition.x, y - cameraPosition.y, width, height);
        ctx.fillStyle = 0;
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.position = new Position(x, y);
        this.size = new Size(width, height);
    }

    getIntersectArea(tile, totalForce) {
        const tilePosition = new Position(tile.position.x + totalForce.x, tile.position.y + totalForce.y),
            tileSize = tile.size,
            directionX = totalForce.x / Math.abs(totalForce.x) || 1,
            directionY = totalForce.y / Math.abs(totalForce.y) || 1;


        var width = 0,
            height = 0,
            x = 0,
            y = 0;

        if (tilePosition.x - this.position.x < 0 && 
            tilePosition.x + tileSize.width - this.position.x > 0) {
            width = directionX * (tilePosition.x + tileSize.width - this.position.x);
            x = this.position.x;
        }  

        if (tilePosition.x - this.position.x > 0 && 
            tilePosition.x + tileSize.width - this.position.x - this.size.width < 0) {
            width = directionX * (tileSize.width);
            x = tilePosition.x;

        }

        if (tilePosition.x - this.position.x > 0 && 
            tilePosition.x + tileSize.width - this.position.x - this.size.width > 0 &&
            tilePosition.x - this.position.x - this.size.width < 0) {
            width = directionX * (this.position.x + this.size.width - tilePosition.x);
            x = tilePosition.x;
        }

        if (tilePosition.x - this.position.x < 0 && 
            tilePosition.x + tileSize.width - this.position.x - this.size.width > 0) {
            width = directionX * (this.size.width);
            x = this.position.x;
        }

        //########## HEIGHT COUNT ###########//

        if (tilePosition.y - this.position.y < 0 && 
            tilePosition.y + tileSize.height - this.position.y > 0) {
            height = directionY * (tilePosition.y + tileSize.height - this.position.y);
            y = this.position.y;
        }  

        if (tilePosition.y - this.position.y > 0 && 
            tilePosition.y + tileSize.height - this.position.y - this.size.height < 0) {
            height = directionY * (tileSize.height);
            y = tilePosition.y;
        }

        if (tilePosition.y - this.position.y > 0 && 
            tilePosition.y + tileSize.height - this.position.y - this.size.height > 0 &&
            tilePosition.y - this.position.y - this.size.height < 0) {
            height = directionY * (this.position.y + this.size.height - tilePosition.y);
            y = tilePosition.y;
        }

        if (tilePosition.y - this.position.y < 0 && 
            tilePosition.y + tileSize.height - this.position.y - this.size.height > 0) {
            height = directionY * (this.size.height);
            y = this.position.y;
        }

        return new Area(x, y, width, height);        
    }

    render() {
        const x = this.position.x,
            y = this.position.y,
            width = this.size.width,
            height = this.size.height,
            cameraPosition = camera.getCameraPosition();

        // debugger;

        ctx.fillStyle = '#ff44ff';
        ctx.fillRect(x - cameraPosition.x, y - cameraPosition.y, width, height);
        ctx.fillStyle = 0;
    }
}

// class Vector {

// }

class Area {
    constructor(x, y, width, height) {
        this.position = new Position(x, y);
        this.size = new Size(width, height);
    }
}

class Force extends Position {
    constructor(x, y) {
        super(x, y);
    }

    add(forse) {
        this.x += forse.x;
        this.y += forse.y;
    }

    set(x, y) {
        this.setX(x);
        this.setY(y);
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    addToX(x) {
        this.x += x;
    }

    addToY(y) {
        this.y += y;
    }
}

class Acceleration extends Position {
    constructor(x, y) {
        super(x, y);

        this.startXTime = new Date().getTime();
        this.startYTime = new Date().getTime();
    }

    getCurrentForce() {
        const expiredXInterval = (new Date().getTime() - this.startXTime)/1000;
        const expiredYInterval = (new Date().getTime() - this.startYTime)/1000;
        const x = Math.round(this.x * expiredXInterval),
            y = Math.round(this.y * expiredYInterval);
        const currentForce = new Force(x, y);

        // debugger;

        return currentForce;
    }

    resetXTime() {
        this.startXTime = new Date().getTime();
    }

    resetYTime() {
        this.startYTime = new Date().getTime();
    }
}

class UI {
    constructor() {
        this.events = {};
        this.setLiseners();
    }

    setLiseners() {
        document.addEventListener('keydown', this.checkEvent.bind(this));
        document.addEventListener('keyup', this.checkEvent.bind(this));
    }

    checkEvent(e) {
        if (e.type == 'keydown') {
            this.notify('keydown', e.keyCode);

            return null;
        }

        if (e.type == 'keyup') {
            this.notify('keyup', e.keyCode);

            return null;
        }
    }

    subscribe(type, handler) {
        this.events[type] = this.events[type] || [];
        this.events[type].push(handler);
    }

    notify(type, data) {
        this.events[type] && 
        this.events[type].forEach( handler => {
            handler({
                type: type,
                data: data
            });
        });
    }
}