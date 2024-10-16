export class Reader {
    offset = 0;

    textDecoder = new TextDecoder();

    constructor(buffer) {
        if (buffer instanceof Uint8Array) {
            this.dataView = new DataView(buffer.buffer);
        } else {
            this.dataView = new DataView(buffer);
        }
    }

    readString() {
        const length = this.readUint();
        if (length < 0 || this.offset + length > this.dataView.byteLength) {
            throw new Error('Invalid string length or out of bounds');
        }

        const stringBytes = new Uint8Array(this.dataView.buffer, this.offset, length);
        this.offset += length;

        return this.textDecoder.decode(stringBytes);
    }

    readInt() {
        if (this.offset + 4 > this.dataView.byteLength) {
            throw new Error('Out of bounds while reading number');
        }

        const value = this.dataView.getInt32(this.offset, true);
        this.offset += 4;

        return value;
    }

    readUint() {
        if (this.offset + 2 > this.dataView.byteLength) {
            throw new Error('Out of bounds while reading number');
        }

        const value = this.dataView.getUint16(this.offset, true);
        this.offset += 2;

        return value;
    }

    readFloat() {
        if (this.offset + 4 > this.dataView.byteLength) {
            throw new Error('Out of bounds while reading float');
        }

        const value = this.dataView.getFloat32(this.offset, true);
        this.offset += 4;

        return value;
    }

    readBoolean() {
        if (this.offset + 1 > this.dataView.byteLength) {
            throw new Error('Out of bounds while reading boolean');
        }

        const value = this.dataView.getUint8(this.offset);
        this.offset += 1;

        return value !== 0;
    }
}

export class Writer {
    offset = 0;
    writeQueue = [];

    textEncoder = new TextEncoder();

    constructor() {}

    writeString(value) {
        const encoded = this.textEncoder.encode(value);
        const offset = this.offset;

        this.writeQueue.push(() => {
            this.dataView.setUint16(offset, encoded.length, true);

            for (let i = 0; i < encoded.length; i++) {
                this.dataView.setUint8(offset + i + 2, encoded[i]);
            }
        });

        this.offset += encoded.length + 2;

        return this;
    }

    writeInt(value) {
        const offset = this.offset;

        this.writeQueue.push(() => {
            this.dataView.setInt32(offset, value, true);
        });

        this.offset += 4;

        return this;
    }

    writeUint(value) {
        const offset = this.offset;

        this.writeQueue.push(() => {
            this.dataView.setUint16(offset, value, true);
        });

        this.offset += 2;

        return this;
    }

    writeFloat(value) {
        const offset = this.offset;

        this.writeQueue.push(() => {
            this.dataView.setFloat32(offset, value, true);
        });

        this.offset += 4;

        return this;
    }

    writeBoolean(value) {
        const offset = this.offset;

        this.writeQueue.push(() => {
            this.dataView.setUint8(offset, value ? 1 : 0);
        });

        this.offset += 1;

        return this;
    }

    make() {
        this.dataView = new DataView(new ArrayBuffer(this.offset));

        for (const task of this.writeQueue) task();

        return new Uint8Array(this.dataView.buffer, 0, this.offset);
    }

    reset() {
        this.writeQueue = [];
        this.offset;

        return this;
    }
}
