import { Fraction } from "./tools/fraction";
import { Clef } from "./clef";
import { NoteValue } from "./note-value";
import { Note } from "./note";
import { Part, PartCursor as PartCursor } from "./part";

const voices = Symbol();
const voice = Symbol();
const offset = Symbol();

export class Staff {
    readonly cursor = Object.assign(new Cursor(), { [staff]: this }) as Cursor;

    [voices] = [new Part()];
    [voice]: Part;

    [offset]: Fraction;

    constructor(readonly clef: Clef, initialOffset: Fraction) {
        this[offset] = initialOffset;

        this.addVoice();
    }

    addVoice(): void {
        const part = new Part();

        part.cursor.forward(this[offset]);

        this[voices].push(part);
    }

    @SideEffect(dependentCursorForward)
    insertNoteSet(noteValue: NoteValue): Fraction {
        return this[voice].insertNoteSet(noteValue);
    }

    @SideEffect(dependentCursorForward)
    insertTuplet(): Fraction {
        return this[voice].insertTuplet();
    }

    @SideEffect(dependentCursorBackward)
    remove(): Fraction {
        return this[voice].remove();
    }

    toggleNote(note: Note): void {
        this[voice].toggleNote(note);
    }
}

const staff = Symbol();

export class Cursor {
    [staff]: Staff;

    forward(delta: Fraction): void {
        this[staff][voices].forEach(part => part.cursor.forward(delta));
    }

    backward(delta: Fraction): void {
        this[staff][voices].forEach(part => part.cursor.backward(delta));
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
        const i = this[staff][voices].indexOf(this[staff][voice]);

        if (i + 1 < this[staff][voices].length) {
            this[staff][voice] = this[staff][voices][i + 1];

            return true;
        }

        return false;
    }
    prevVoice(): boolean {
        const i = this[staff][voices].indexOf(this[staff][voice]);

        if (i > 0) {
            this[staff][voice] = this[staff][voices][i - 1];

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

                const staffItem =
                    this instanceof Staff
                        ? (this as Staff)
                        : (this as Cursor)[staff];
                const current = staffItem[voice];

                staffItem[voices].forEach(item => {
                    if (item !== current) action(item.cursor, diff);
                });

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
