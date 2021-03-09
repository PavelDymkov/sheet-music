import { Clef } from "./clef";
import { Note } from "./note";
import { NoteValue } from "./note-value";
import { Part, Cursor as PartCursor } from "./part";
import { Fraction } from "./tools/fraction";

const main = Symbol();
const extra = Symbol();
const voice = Symbol();
const dependent = Symbol();

export class Staff {
    readonly cursor = Object.assign(new Cursor(), { [staff]: this }) as Cursor;

    [main]: Part = new Part();
    [extra]: Part = new Part();

    [voice]: Part = this[main];
    [dependent]: Part = this[extra];

    constructor(readonly clef: Clef) {}

    @SideEffect(dependentCursorForward)
    insert(noteValue: NoteValue): Fraction {
        return this[voice].insert(noteValue);
    }

    @SideEffect(dependentCursorForward)
    changeNoteValue(nextNoteValue: NoteValue): Fraction {
        return this[voice].changeNoteValue(nextNoteValue);
    }

    @SideEffect(dependentCursorForward)
    insertIrregularRhythm(): Fraction {
        return this[voice].insertIrregularRhythm();
    }

    @SideEffect(dependentCursorBackward)
    remove(): Fraction {
        return this[voice].remove();
    }

    insertNote(note: Note): void {
        this[voice].insertNote(note);
    }

    removeNote(note: Note): void {
        this[voice].removeNote(note);
    }
}

const staff = Symbol();

export class Cursor {
    [staff]: Staff;

    forward(delta: Fraction): void {
        this[staff][main].cursor.forward(delta);
        this[staff][extra].cursor.forward(delta);
    }

    backward(delta: Fraction): void {
        this[staff][main].cursor.backward(delta);
        this[staff][extra].cursor.backward(delta);
    }

    @SideEffect(dependentCursorForward)
    next(): Fraction {
        return this[staff][voice].cursor.next();
    }

    @SideEffect(dependentCursorBackward)
    prev(): Fraction {
        return this[staff][voice].cursor.prev();
    }

    nextVoice(): boolean {
        if (this[staff][voice] === this[staff][main]) {
            this[staff][voice] = this[staff][extra];
            this[staff][dependent] = this[staff][main];

            return true;
        }

        return false;
    }
    prevVoice(): boolean {
        if (this[staff][voice] === this[staff][extra]) {
            this[staff][voice] = this[staff][main];
            this[staff][dependent] = this[staff][extra];

            return true;
        }

        return false;
    }
}

function SideEffect(
    action: (cursor: PartCursor, diff: Fraction) => void,
): MethodDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const origin = target[propertyKey] as (
            this: Staff | Cursor,
            ...args: any[]
        ) => Fraction;

        return {
            value(this: Staff | Cursor, ...args: any[]): Fraction {
                const diff = origin.apply(this, args);

                switch (true) {
                    case this instanceof Staff:
                        action((this as Staff)[dependent].cursor, diff);
                        break;
                    case this instanceof Cursor:
                        action((this as Cursor)[staff][dependent].cursor, diff);
                        break;
                }

                return diff;
            },
        } as TypedPropertyDescriptor<any>;
    };
}

function dependentCursorForward(cursor: PartCursor, diff: Fraction) {
    cursor.forward(diff);
}

function dependentCursorBackward(cursor: PartCursor, diff: Fraction) {
    cursor.backward(diff);
}
