export namespace Protocol {
    export class Reader {
        public dataView: DataView;
        public offset: number = 0;

        private textDecoder: TextDecoder = new TextDecoder();

        constructor(buffer: ArrayBuffer | Uint8Array) {
            if (buffer instanceof Uint8Array) {
                this.dataView = new DataView(buffer.buffer);
            } else {
                this.dataView = new DataView(buffer);
            }
        }

        readString(): string {
            const length = this.readUint();
            if (length < 0 || this.offset + length > this.dataView.byteLength) {
                throw new Error('Invalid string length or out of bounds');
            }

            const stringBytes = new Uint8Array(this.dataView.buffer, this.offset, length);
            this.offset += length;

            return this.textDecoder.decode(stringBytes);
        }

        readInt(): number {
            if (this.offset + 4 > this.dataView.byteLength) {
                throw new Error('Out of bounds while reading number');
            }

            const value = this.dataView.getInt32(this.offset, true);
            this.offset += 4;

            return value;
        }

        readUint(): number {
            if (this.offset + 2 > this.dataView.byteLength) {
                throw new Error('Out of bounds while reading number');
            }

            const value = this.dataView.getUint16(this.offset, true);
            this.offset += 2;

            return value;
        }

        readFloat(): number {
            if (this.offset + 4 > this.dataView.byteLength) {
                throw new Error('Out of bounds while reading float');
            }

            const value = this.dataView.getFloat32(this.offset, true);
            this.offset += 4;

            return value;
        }

        readBoolean(): boolean {
            if (this.offset + 1 > this.dataView.byteLength) {
                throw new Error('Out of bounds while reading boolean');
            }

            const value = this.dataView.getUint8(this.offset);
            this.offset += 1;

            return value !== 0;
        }
    }

    export class Writer {
        public offset: number = 0;
        private writeQueue: (() => void)[] = [];
        private dataView!: DataView;

        private textEncoder: TextEncoder = new TextEncoder();

        constructor() {}

        writeString(value: string): this {
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

        writeInt(value: number): this {
            const offset = this.offset;

            this.writeQueue.push(() => {
                this.dataView.setInt32(offset, value, true);
            });

            this.offset += 4;

            return this;
        }

        writeUint(value: number): this {
            const offset = this.offset;

            this.writeQueue.push(() => {
                this.dataView.setUint16(offset, value, true);
            });

            this.offset += 2;

            return this;
        }

        writeFloat(value: number): this {
            const offset = this.offset;

            this.writeQueue.push(() => {
                this.dataView.setFloat32(offset, value, true);
            });

            this.offset += 4;

            return this;
        }

        writeBoolean(value: boolean): this {
            const offset = this.offset;

            this.writeQueue.push(() => {
                this.dataView.setUint8(offset, value ? 1 : 0);
            });

            this.offset += 1;

            return this;
        }

        make(): Uint8Array {
            this.dataView = new DataView(new ArrayBuffer(this.offset));

            for (const task of this.writeQueue) task();

            return new Uint8Array(this.dataView.buffer, 0, this.offset);
        }

        reset(): this {
            this.writeQueue = [];
            this.offset;

            return this;
        }
    }
}
