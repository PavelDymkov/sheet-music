import { NoteValue } from "./note-value";
import { Part } from "./part";

const main = Symbol();
const extra = Symbol();
const voice = Symbol();
const dependent = Symbol();

export class Staff {
    readonly cursor = new StaffCursor(this);

    [main]: Part = new Part();
    [extra]: Part = new Part();

    [voice]: Part = this[main];
    [dependent]: Part = this[extra];

    insert(noteValue: NoteValue): NoteValue {
        const diff = this[voice].insert(noteValue);

        this[dependent].cursor.forward(diff);

        return diff;
    }

    remove(): NoteValue {
        const diff = this[voice].remove();

        this[dependent].cursor.backward(diff);

        return diff;
    }
}

export class StaffCursor {
    constructor(private staff: Staff) {}

    forward(noteValue: NoteValue): void {
        this.staff[main].cursor.forward(noteValue);
        this.staff[extra].cursor.forward(noteValue);
    }

    backward(noteValue: NoteValue): void {
        this.staff[main].cursor.backward(noteValue);
        this.staff[extra].cursor.backward(noteValue);
    }

    next(): NoteValue {
        const diff = this.staff[voice].cursor.next();

        this.staff[dependent].cursor.forward(diff);

        return diff;
    }

    prev(): NoteValue {
        const diff = this.staff[voice].cursor.prev();

        this.staff[dependent].cursor.backward(diff);

        return diff;
    }

    nextVoice(): boolean {
        if (this.staff[voice] === this.staff[main]) {
            this.staff[voice] = this.staff[extra];
            this.staff[dependent] = this.staff[main];

            return true;
        }

        return false;
    }
    prevVoice(): boolean {
        if (this.staff[voice] === this.staff[extra]) {
            this.staff[voice] = this.staff[main];
            this.staff[dependent] = this.staff[extra];

            return true;
        }

        return false;
    }
}
