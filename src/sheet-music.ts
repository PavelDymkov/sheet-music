import { not } from "logical-not";

import { Specifier } from "./specifiers/specifier";
import { Fraction } from "./tools/fraction";
import { Bar } from "./bar";
import { Clef } from "./clef";
import { NoteValue } from "./note-value";
import { Note } from "./note";
import { Staff, Cursor as StaffCursor } from "./staff";

const staffs = Symbol();
const staffIndex = Symbol();
const bars = Symbol();
const specifiers = Symbol();
const offset = Symbol();

export class SheetMusic {
    readonly cursor = new Cursor();

    readonly [staffs]: Staff[] = [];
    readonly [bars]: Bar[][] = [];
    readonly [specifiers]: Specifier[][] = [];

    [staffIndex] = -1;
    [offset] = Fraction.Zero;

    constructor() {
        this.cursor[owner] = this;
    }

    insertStaff(clef: Clef): void {
        this[staffs].splice(
            ++this[staffIndex],
            0,
            new Staff(clef, this[offset]),
        );
    }

    removeStaff(): void {
        if (this[staffIndex] !== -1) {
            this[staffs].splice(this[staffIndex]--, 1);
        }
    }

    @StaffProcessing<NoteValue>(
        (staff, noteValue) => staff.insertNoteSet(noteValue),
        (cursor, diff) => cursor.forward(diff),
    )
    insertNoteSet(noteValue: NoteValue): void {}

    @StaffProcessing(
        staff => staff.insertTuplet(),
        (cursor, diff) => cursor.forward(diff),
    )
    insertTuplet(): void {}

    @StaffProcessing(
        staff => staff.remove(),
        (cursor, diff) => cursor.backward(diff),
    )
    remove(): void {}

    toogleNote(note: Note): void {
        if (this[staffIndex] !== -1) {
            this[staffs][this[staffIndex]].toggleNote(note);
        }
    }

    insertSpecifier(specifier: Specifier): void {}

    removeSpecifier(Type: typeof Specifier): void {}

    bars({ offset = 0 }: { offset: number }): Generator {
        return barsIterator(this);
    }
}

function* barsIterator(sheetMusic: SheetMusic): Generator {}

const owner = Symbol();

export class Cursor {
    [owner]: SheetMusic;

    next(): void {
        if (this[owner][staffIndex] === -1) {
            const diff =
                this[owner][staffs][this[owner][staffIndex]].cursor.next();

            for (let i = 0, lim = this[owner][staffs].length; i < lim; i++) {
                if (i !== this[owner][staffIndex]) {
                    this[owner][staffs][i].cursor.forward(diff);
                }
            }
        }
    }

    prev(): void {
        if (this[owner][staffIndex] == -1) {
            const diff =
                this[owner][staffs][this[owner][staffIndex]].cursor.prev();

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

function StaffProcessing<Argument = void>(
    staffHandler: (staff: Staff, arg: Argument) => Fraction,
    diffHandler: (staffCursor: StaffCursor, diff: Fraction) => void,
): MethodDecorator {
    return (): TypedPropertyDescriptor<any> => ({
        value(this: SheetMusic, arg: Argument): void {
            const staff = this[staffs][this[staffIndex]];
            const diff = staffHandler(staff, arg);

            this[offset] = this[offset].add(diff);

            this[staffs].forEach(item => {
                if (item !== staff) diffHandler(item.cursor, diff);
            });
        },
    });
}
