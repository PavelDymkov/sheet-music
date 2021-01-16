import { Part } from "./part";

const main = Symbol();
const extra = Symbol();
const voice = Symbol();

export class Staff {
    readonly cursor = new StaffCursor(this);

    [main]: Part = new Part();
    [extra]: Part = new Part();

    [voice]: Part = this[main];
}

export class StaffCursor {
    constructor(private staff: Staff) {}

    // insert
    // remove

    next(): void {}
    prev(): void {}

    nextVoice(): boolean {
        if (this.staff[voice] === this.staff[main]) {
            this.staff[voice] = this.staff[extra];

            return true;
        }

        return false;
    }
    prevVoice(): boolean {
        if (this.staff[voice] === this.staff[extra]) {
            this.staff[voice] = this.staff[main];

            return true;
        }

        return false;
    }
}
