class Vector {
    constructor(options){
        this.x = options.x || 0;
        this.y = options.y || 0;

        this.saveX = options.x || 0;
        this.saveY = options.y || 0;

        this.accelX = options.accelX || 0;
        this.accelY = options.accelY || 0;

        this.maxX = options.maxX || Infinity;
        this.maxY = options.maxY || Infinity;

        this.startXTime = new Date().getTime();
        this.startYTime = new Date().getTime();
    }

    addVector(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.accelX += vector.accelX;
        this.accelY += vector.accelY;

        this.maxX = (this.maxX < vector.maxX) ? vector.maxX : this.maxX;
        this.maxY = (this.maxY < vector.maxY) ? vector.maxY : this.maxY;
    }

    getCurrentVector() {
        const currentTime = new Date().getTime(),
            timeXDiff = (currentTime - this.startXTime)/1000,
            timeYDiff = (currentTime - this.startYTime)/1000;

        return new Vector({
            x: this.x + this.accelX * timeXDiff,
            y: this.y + this.accelY * timeYDiff
        });
    }

    reset(param) {
        this.resetTime(param);
        this.resetVector(param);
    }

    resetTime(param) {
        param == 'x' && this.resetXTime();
        param == 'y' && this.resetYTime();
        !param && (this.resetXTime(), this.resetYTime());
    }

    resetXTime() {
        this.startXTime = new Date().getTime();
    }

    resetYTime() {
        this.startYTime = new Date().getTime();
    }

    resetVector(param) {
        param == 'x' && this.resetXVector();
        param == 'y' && this.resetYVector();
        !param && (this.resetXVector(), this.resetYVector());
    }

    resetXVector() {
        this.x = this.saveX;
    }

    resetYVector() {
        this.y = this.saveY;
    }
}

class VectorSource {
    constructor(vector) {
        this.vector = vector;
        this.enabled = true;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

class ComplexVector {
    constructor() {
        this.vectorSources = {};
    }

    addVectorSource(vectorName, vector) {
        if (this.vectorSources[vectorName]) {
            throw new Error('Such vector source already settled');
        }

        vector.reset();
        this.vectorSources[vectorName] = new VectorSource(vector);
    }

    removeVectorSource(vectorName) {
        if (!this.vectorSources[vectorName]) {
            throw new Error('No such vector source');
        }

        delete this.vectorSources[vectorName];
    }

    enableVector(vectorName) {
        this.vectorSources[vectorName].enable();
    }

    disableVector(vectorName) {
        this.vectorSources[vectorName].disable();
        this.vectorSources[vectorName].vector.reset();
    }

    getTotalVector() {
        var totalVector = new Vector({
            x: 0,
            y: 0
        });

        Object.values(this.vectorSources).forEach( vectorSource => {
            if (!vectorSource.enabled) {
                return null;
            }

            const vector = vectorSource.vector.getCurrentVector();
            totalVector.addVector(vector);
        });

        return totalVector;
    }

    getVectorFromSource(vectorName) {
        if (!this.vectorSources[vectorName]) {
            throw new Error("No such vector or vector source");
        }

        return this.vectorSources[vectorName].vector;
    }
}

const g = new Vector({
    x: 10,
    y: 0,
    accelX: 0,
    accelY: 10
});

const movingVector = new Vector({
    x: 10,
    y: 10
});

const complexVector = new ComplexVector();
complexVector.addVectorSource('gravity', g);
complexVector.addVectorSource('moving', movingVector);

console.log(complexVector);

// totalVector.addVectorSource('vectorName', vector: Vector);
// totalVector.enableVector('vectorName');
// totalVector.disableVector('vectorName');
