const cursor = Symbol();

export class SheetMusic {
    readonly [cursor]: Cursor;

    constructor(cursor_: Cursor) {
        this[cursor] = cursor_;
        this[cursor][owner] = this;
    }

    insertStaff(): void {}
    removeStaff(): void {}
}

const owner = Symbol();

export class Cursor {
    [owner]: SheetMusic;

    next(): void {}
    prev(): void {}

    nextStaff(): void {}
    prevStaff(): void {}

    nextVoice(): void {}
    prevVoice(): void {}
}
