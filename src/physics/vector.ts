export interface VectorLike {
    x: number;
    y: number;
}

export class Vector implements VectorLike {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number);
    constructor(vector: VectorLike);

    constructor(x: number | VectorLike = 0, y: number = 0) {
        if (typeof x === 'number') {
            this.x = x;
            this.y = y;
        } else {
            this.x = x.x;
            this.y = x.y;
        }
    }

    public add(num: number): this;
    public add(vector: VectorLike): this;

    public add(vector: number | VectorLike) {
        if (typeof vector === 'number') {
            this.x += vector;
            this.y += vector;
        } else {
            this.x += vector.x;
            this.y += vector.y;
        }

        return this;
    }

    public sub(num: number): this;
    public sub(vector: VectorLike): this;

    public sub(vector: number | VectorLike) {
        if (typeof vector === 'number') {
            this.x -= vector;
            this.y -= vector;
        } else {
            this.x -= vector.x;
            this.y -= vector.y;
        }

        return this;
    }

    public get mag(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public mult(num: number): this;
    public mult(vector: VectorLike): this;

    public mult(num: number | VectorLike) {
        if (typeof num === 'number') {
            this.x *= num;
            this.y *= num;
        } else {
            this.x *= num.x;
            this.y *= num.y;
        }

        return this;
    }

    public div(num: number): this;
    public div(vector: VectorLike): this;

    public div(num: number | VectorLike) {
        if (typeof num === 'number') {
            this.x /= num;
            this.y /= num;
        } else {
            this.x /= num.x;
            this.y /= num.y;
        }

        return this;
    }

    public normalize() {
        const mag = this.mag;

        if (mag !== 0) {
            this.div(mag);
        }

        return this;
    }

    public dot(vector: VectorLike): number {
        return this.x * vector.x + this.y * vector.y;
    }

    public addAngle(angle: number) {
        this.mult({x: Math.cos(angle), y: Math.sin(angle)});

        return this;
    }

    public rotate(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;

        this.x = x;
        this.y = y;

        return this;
    }

    public angleBetween(vector: VectorLike): number {
        const dot = this.dot(vector);
        const mags = this.mag * new Vector(vector).mag;

        if (mags === 0) return 0;

        return Math.acos(dot / mags);
    }

    public angle(vector: VectorLike = new Vector()): number {
        return Math.atan2(this.y - vector.y, this.x - vector.x);
    }

    public limit(max: number) {
        if (this.mag > max) {
            this.normalize();
            this.mult(max);
        }

        return this;
    }

    public setMag(newMag: number) {
        this.normalize();
        this.mult(newMag);

        return this;
    }

    public clone(): Vector {
        return new Vector(this);
    }

    static toCartesian(r: number, theta: number): Vector {
        return new Vector(r * Math.cos(theta), r * Math.sin(theta));
    }

    static addAngle(v: VectorLike, angle: number) {
        return new Vector(v.x * Math.cos(angle), v.y * Math.sin(angle));
    }

    static distance(a: VectorLike, b: VectorLike): number {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }

    static add(a: VectorLike, b: VectorLike): Vector {
        return new Vector(a.x + b.x, a.y + b.y);
    }

    static sub(a: VectorLike, b: VectorLike): Vector {
        return new Vector(a.x - b.x, a.y - b.y);
    }

    static mult(v: VectorLike, num: number) {
        return new Vector(v.x * num, v.y * num);
    }

    static div(v: VectorLike, num: number) {
        return new Vector(v.x / num, v.y / num);
    }

    static dot(a: VectorLike, b: VectorLike): number {
        return a.x * b.x + a.y * b.y;
    }

    static mag(v: VectorLike): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
}