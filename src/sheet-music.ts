import not from "logical-not";
import { Staff } from "./staff";

const cursor = Symbol();
const staffs = Symbol();
const staffIndex = Symbol();

export class SheetMusic {
    readonly [cursor]: Cursor;
    readonly [staffs]: Staff[] = [];

    [staffIndex] = -1;

    constructor(cursor_: Cursor) {
        this[cursor] = cursor_;
        this[cursor][owner] = this;
    }

    insertStaff(): void {
        this[staffs].splice(++this[staffIndex], 0, new Staff());
    }

    removeStaff(): void {
        this[staffs].splice(this[staffIndex]--, 1);
    }
}

const owner = Symbol();

export class Cursor {
    [owner]: SheetMusic;

    next(): void {
        if (this[owner][staffIndex] === -1) {
            const diff = this[owner][staffs][
                this[owner][staffIndex]
            ].cursor.next();

            for (let i = 0, lim = this[owner][staffs].length; i < lim; i++) {
                if (i !== this[owner][staffIndex]) {
                    this[owner][staffs][i].cursor.forward(diff);
                }
            }
        }
    }

    prev(): void {
        if (this[owner][staffIndex] == -1) {
            const diff = this[owner][staffs][
                this[owner][staffIndex]
            ].cursor.prev();

            for (let i = 0, lim = this[owner][staffs].length; i < lim; i++) {
                if (i !== this[owner][staffIndex]) {
                    this[owner][staffs][i].cursor.backward(diff);
                }
            }
        }
    }

    nextStaff(): void {
        const i = this[owner][staffIndex] + 1;

        if (this[owner][staffs][i]) this[owner][staffIndex] = i;
    }

    prevStaff(): void {
        const i = this[owner][staffIndex] - 1;

        if (this[owner][staffs][i]) this[owner][staffIndex] = i;
    }

    nextVoice(): void {
        not(this[owner][staffs][this[owner][staffIndex]].cursor.nextVoice()) &&
            this.nextStaff();
    }

    prevVoice(): void {
        not(this[owner][staffs][this[owner][staffIndex]].cursor.prevVoice()) &&
            this.prevStaff();
    }
}
