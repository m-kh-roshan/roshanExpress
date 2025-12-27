import { finished, Readable } from "stream";
import fs from "fs";
import { NoDataFileError } from "./errors/file.error";

export interface UploadedFile {
    fieldname: string;
    filename: string;
    mimeType: string;
    size: number;

    isInMemory(): boolean;

    buffer?: Buffer | undefined;
    tempPath?: string | undefined;

    createReadStream(): NodeJS.ReadableStream;

    consume<T>(fn: (stream: NodeJS.ReadableStream) => Promise<T>): Promise<T>;
}

export class InternalUploadedFile implements UploadedFile {
    size = 0;
    buffer?: Buffer | undefined;
    tempPath?: string | undefined;
    consumed =  false;

    constructor (
        public fieldname: string,
        public filename: string,
        public mimeType: string
    ){}

    isInMemory(): boolean {
        return !!this.buffer;
    }

    createReadStream() {
        if (this.buffer) {
            return Readable.from(this.buffer);
        }
        if (this.tempPath) {
            return fs.createReadStream(this.tempPath);
        }

        throw new NoDataFileError();
    }

    async consume<T>(fn: (stream: NodeJS.ReadableStream) => Promise<T>) {
        this.consumed = true;
        try {
            return await fn(this.createReadStream());
        } finally {
            await this.cleanup();
        }
    }

    async cleanup() {
        if (this.tempPath) {
            await fs.promises.unlink(this.tempPath).catch(() => {});
            this.tempPath = undefined;
        }
        this.buffer = undefined;
    }

}