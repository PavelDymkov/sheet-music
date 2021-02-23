import { EventEmitter } from "eventemitter3";
import { not } from "logical-not";

import { Bar } from "./bar";
import { Note } from "./note";
import { NoteValue } from "./note-value";
import { Specifier } from "./specifiers/specifier";
import { Staff, Cursor as StaffCursor } from "./staff";
import { Fraction } from "./tools/fraction";

const staffs = Symbol();
const staffIndex = Symbol();
const bars = Symbol();
const specifiers = Symbol();

export class SheetMusic {
    static readonly Events = {
        Change: Symbol("change"),
        ChangeNote: Symbol("change note"),
        CursorMove: Symbol("cursor move"),
    };

    readonly events = new EventEmitter<symbol>();
    readonly cursor: Cursor;

    readonly [staffs]: Staff[] = [];
    readonly [bars]: Bar[][] = [];
    readonly [specifiers]: Specifier[][] = [];

    [staffIndex] = -1;

    constructor() {
        this.cursor = new Cursor();
        this.cursor[owner] = this;
    }

    @Event(SheetMusic.Events.Change)
    insertStaff(): void {
        this[staffs].splice(++this[staffIndex], 0, new Staff());
    }

    @Event(SheetMusic.Events.Change)
    removeStaff(): void {
        if (this[staffIndex] !== -1) {
            this[staffs].splice(this[staffIndex]--, 1);
        }
    }

    @StaffProcessor<NoteValue>(
        (staff, noteValue) => staff.insert(noteValue),
        (cursor, diff) => cursor.forward(diff),
    )
    @Event(SheetMusic.Events.Change)
    insert(noteValue: NoteValue): void {}

    @StaffProcessor<NoteValue>(
        (staff, nextNoteValue) => staff.changeNoteValue(nextNoteValue),
        (cursor, diff) => cursor.forward(diff),
    )
    @Event(SheetMusic.Events.Change)
    changeNoteValue(nextNoteValue: NoteValue): void {}

    @StaffProcessor(
        staff => staff.insertIrregularRhythm(),
        (cursor, diff) => cursor.forward(diff),
    )
    @Event(SheetMusic.Events.Change)
    insertIrregularRhythm(): void {}

    @StaffProcessor(
        staff => staff.remove(),
        (cursor, diff) => cursor.backward(diff),
    )
    @Event(SheetMusic.Events.Change)
    remove(): void {}

    @Event(SheetMusic.Events.ChangeNote)
    insertNote(note: Note): void {
        if (this[staffIndex] !== -1) {
            this[staffs][this[staffIndex]].insertNote(note);
        }
    }

    @Event(SheetMusic.Events.ChangeNote)
    removeNote(note: Note): void {
        if (this[staffIndex] !== -1) {
            this[staffs][this[staffIndex]].removeNote(note);
        }
    }

    bars({ offset = 0 }: { offset: number }): Generator {
        return barsIterator(this);
    }
}

function* barsIterator(sheetMusic: SheetMusic): Generator {}

const owner = Symbol();

export class Cursor {
    [owner]: SheetMusic;

    @Event(SheetMusic.Events.CursorMove)
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

    @Event(SheetMusic.Events.CursorMove)
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

    @Event(SheetMusic.Events.CursorMove)
    nextStaff(): void {
        const i = this[owner][staffIndex] + 1;

        if (this[owner][staffs][i]) this[owner][staffIndex] = i;
    }

    @Event(SheetMusic.Events.CursorMove)
    prevStaff(): void {
        const i = this[owner][staffIndex] - 1;

        if (this[owner][staffs][i]) this[owner][staffIndex] = i;
    }

    @Event(SheetMusic.Events.CursorMove)
    nextVoice(): void {
        not(this[owner][staffs][this[owner][staffIndex]].cursor.nextVoice()) &&
            this.nextStaff();
    }

    @Event(SheetMusic.Events.CursorMove)
    prevVoice(): void {
        not(this[owner][staffs][this[owner][staffIndex]].cursor.prevVoice()) &&
            this.prevStaff();
    }
}

function Event(type: symbol): MethodDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const origin = target[propertyKey] as Function;

        return {
            value(this: SheetMusic, args: any[]): void {
                origin.apply(this, args);

                this.events.emit(type);
            },
        } as TypedPropertyDescriptor<any>;
    };
}

function StaffProcessor<T = void>(
    staffHandler: (staff: Staff, arg: T) => Fraction,
    diffHandler: (cursor: StaffCursor, diff: Fraction) => void,
): MethodDecorator {
    return () => {
        return {
            value(this: SheetMusic, arg: T): void {
                const staff = this[staffs][this[staffIndex]];
                const diff = staffHandler(staff, arg);

                this[staffs].forEach(item => {
                    if (item !== staff) diffHandler(item.cursor, diff);
                });
            },
        } as TypedPropertyDescriptor<any>;
    };
}
