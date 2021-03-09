import { EventEmitter } from "eventemitter3";
import { not } from "logical-not";

import { Bar } from "./bar";
import { Clef } from "./clef";
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
        ChangeBars: Symbol("change bars"),
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

    @Event(SheetMusic.Events.ChangeBars)
    insertStaff(clef: Clef): void {
        this[staffs].splice(++this[staffIndex], 0, new Staff(clef));
    }

    @Event(SheetMusic.Events.ChangeBars)
    removeStaff(): void {
        if (this[staffIndex] !== -1) {
            this[staffs].splice(this[staffIndex]--, 1);
        }
    }

    @StaffProcessing<NoteValue>(
        (staff, noteValue) => staff.insert(noteValue),
        (cursor, diff) => cursor.forward(diff),
    )
    @Event(SheetMusic.Events.ChangeBars)
    insert(noteValue: NoteValue): void {}

    @StaffProcessing<NoteValue>(
        (staff, nextNoteValue) => staff.changeNoteValue(nextNoteValue),
        (cursor, diff) => cursor.forward(diff),
    )
    @Event(SheetMusic.Events.ChangeBars)
    changeNoteValue(nextNoteValue: NoteValue): void {}

    @StaffProcessing(
        staff => staff.insertIrregularRhythm(),
        (cursor, diff) => cursor.forward(diff),
    )
    @Event(SheetMusic.Events.ChangeBars)
    insertIrregularRhythm(): void {}

    @StaffProcessing(
        staff => staff.remove(),
        (cursor, diff) => cursor.backward(diff),
    )
    @Event(SheetMusic.Events.ChangeBars)
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

    @Event(SheetMusic.Events.ChangeBars)
    insertSpecifier(specifier: Specifier): void {}

    @Event(SheetMusic.Events.ChangeBars)
    removeSpecifier(Type: typeof Specifier): void {}

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
    type EventDispatched = (this: SheetMusic, ...args: any[]) => void;

    return (
        target: any,
        propertyKey: string | symbol,
    ): TypedPropertyDescriptor<any> => {
        const origin = target[propertyKey] as EventDispatched;

        return {
            value(this: SheetMusic, ...args: any[]): void {
                origin.apply(this, args);

                this.events.emit(type);
            },
        };
    };
}

function StaffProcessing<Argument = void>(
    staffHandler: (staff: Staff, arg: Argument) => Fraction,
    diffHandler: (staffCursor: StaffCursor, diff: Fraction) => void,
): MethodDecorator {
    return (): TypedPropertyDescriptor<any> => ({
        value(this: SheetMusic, arg: Argument): void {
            const staff = this[staffs][this[staffIndex]];
            const diff = staffHandler(staff, arg);

            this[staffs].forEach(item => {
                if (item !== staff) diffHandler(item.cursor, diff);
            });
        },
    });
}
