import { EventEmitter } from "eventemitter3";
import { not } from "logical-not";

import { Bar } from "./bar";
import { Specifier } from "./specifiers/specifier";
import { Staff } from "./staff";

const staffs = Symbol();
const staffIndex = Symbol();
const bars = Symbol();
const specifiers = Symbol();

export class SheetMusic {
    static readonly Events = {
        change: Symbol(),
    };

    readonly cursor: Cursor;
    readonly bars = createBarsIterator(this);
    readonly events = new EventEmitter();

    readonly [staffs]: Staff[] = [];
    readonly [bars]: Bar[][] = [];
    readonly [specifiers]: Specifier[][] = [];

    [staffIndex] = -1;

    constructor() {
        this.cursor = new Cursor();
        this.cursor[owner] = this;
    }

    insertStaff(): void {
        this[staffs].splice(++this[staffIndex], 0, new Staff());
    }

    removeStaff(): void {
        if (this[staffIndex] !== -1) {
            this[staffs].splice(this[staffIndex]--, 1);
        }
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

function createBarsIterator(sheetMusic: SheetMusic) {
    return {
        *[Symbol.iterator]() {
            let i = 0;

            while (i < sheetMusic[bars].length) yield sheetMusic[bars][i++];
        },
    };
}

function emitChanges(sheetMusic: SheetMusic, index: number) {
    sheetMusic.events.emit(SheetMusic.Events.change, {
        index,
        changedBars: function* () {
            for (let bars of sheetMusic.bars) {
                yield bars;
            }
        },
    });
}
