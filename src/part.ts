import { not } from "logical-not";

import { NoteSet } from "./note-set";
import { NoteValue } from "./note-value";

const position = Symbol("position");
const item = Symbol("item");
const itemPosition = Symbol("itemPosition");

export class Part {
    readonly cursor = new PartCursor(this);

    [position] = 0;
    [item] = new PartItem();
    [itemPosition] = 0;

    get item(): NoteSet | null {
        return this[item][noteSet] || null;
    }

    insert(noteValue: NoteValue) {
        const newItemNotes = new PartItem(noteValue);
        const newItemSpacer = new PartItem();

        let nextItem: PartItem;

        if (this[item].isSpacer) {
            nextItem = this[item];

            const delta = this[position] - this[itemPosition];

            newItemSpacer[spacer] = NoteValue.fromNumber(delta);
            nextItem[spacer] = NoteValue.fromNumber(
                nextItem[spacer].size - (delta + noteValue.size),
            );

            this[itemPosition] = this[position];
        } else {
            nextItem = this[item][next] as PartItem;

            this[position] = this[itemPosition] =
                this[itemPosition] + this[item][noteSet].value.size;
        }

        const prevItem = nextItem[prev];

        nextItem[spacer].shrink(noteValue);

        link(prevItem, newItemSpacer);
        link(newItemSpacer, newItemNotes);
        link(newItemNotes, nextItem);

        return (this[item] = newItemNotes);
    }

    remove(): void {
        if (not(this[item].isSpacer)) {
            const nextItem = this[item][next];
            const prevItem = this[item][prev];

            unlink(this[item]);

            this[item] = prevItem as PartItem;
            this[position] = this[itemPosition];
            this[itemPosition] -= this[item][spacer].size;

            link(prevItem, nextItem);
        }
    }

    expand(noteValue: NoteValue): NoteValue {
        if (this[item].isSpacer) {
            this[item][spacer] = NoteValue.fromNumber(
                this[item][spacer].size + noteValue.size,
            );

            return noteValue;
        } else {
            const restSize =
                noteValue.size - (this[position] - this[itemPosition]);

            if (restSize > 0) {
                const restNoteValues = NoteValue.fromNumber(restSize);
                const nextItem = this[item][next] as PartItem;

                nextItem[spacer] = NoteValue.fromNumber(
                    nextItem[spacer].size + restNoteValues.size,
                );

                return restNoteValues;
            }
        }

        return NoteValue.fromNumber(0);
    }

    shrink(noteValue: NoteValue): NoteValue {
        if (this[item].isSpacer) {
            this[item][spacer] = NoteValue.fromNumber(
                this[item][spacer].size + noteValue.size,
            );

            return noteValue;
        } else {
            const restSize =
                noteValue.size - (this[position] - this[itemPosition]);

            if (restSize > 0) {
                const restNoteValues = NoteValue.fromNumber(restSize);
                const prevItem = this[item][prev] as PartItem;

                prevItem[spacer] = NoteValue.fromNumber(
                    prevItem[spacer].size + restNoteValues.size,
                );

                return restNoteValues;
            }
        }

        return NoteValue.fromNumber(0);
    }
}

function link(prevItem: PartItem | null, nextItem: PartItem | null): void {
    if (prevItem?.isSpacer && nextItem?.isSpacer) {
        prevItem[spacer] = NoteValue.fromNumber(
            prevItem[spacer].size + nextItem[spacer].size,
        );

        link(prevItem, nextItem[next]);
        unlink(nextItem);
    } else {
        if (prevItem) prevItem[next] = nextItem;
        if (nextItem) nextItem[prev] = prevItem;
    }
}

function unlink(item: PartItem): void {
    if (item[prev]) (item[prev] as PartItem)[next] = null;
    if (item[next]) (item[next] as PartItem)[prev] = null;

    item[next] = item[prev] = null;
}

const next = Symbol("next");
const prev = Symbol("prev");
const noteSet = Symbol("noteSet");
const spacer = Symbol("spacer");

class PartItem {
    [next]: PartItem | null = null;
    [prev]: PartItem | null = null;

    [noteSet]: NoteSet;
    [spacer]: NoteValue;

    get isSpacer(): boolean {
        return Boolean(this[spacer]);
    }

    get value(): NoteValue {
        return this[spacer] || this[noteSet].value;
    }

    constructor(noteValue?: NoteValue) {
        if (noteValue) {
            this[noteSet] = new NoteSet(noteValue);
        } else {
            this[spacer] = NoteValue.fromNumber(0);
        }
    }
}

export class PartCursor {
    constructor(private part: Part) {}

    forward(noteValue: NoteValue): void {
        moveForward(this.part, noteValue.size);
    }

    backward(noteValue: NoteValue): void {
        moveBackward(this.part, noteValue.size);
    }

    next(): NoteValue {
        const { part } = this;

        const currentSize = part[item][spacer].size;
        const delta = currentSize - (part[position] - part[itemPosition]);

        moveForward(part, delta);

        return NoteValue.fromNumber(delta);
    }

    prev(): NoteValue {
        const { part } = this;

        const delta = part[position] - part[itemPosition];

        moveBackward(part, delta);

        return NoteValue.fromNumber(delta);
    }
}

function moveForward(part: Part, delta: number): void {
    if (
        delta === 0 &&
        part[item].isSpacer &&
        part[item][spacer].size === 0 &&
        part[item][next]
    ) {
        part[item] = part[item][next] as PartItem;
    }

    if (delta > 0) {
        const currentItem = part[item];
        const nextItem = currentItem[next];
        const nextPosition = part[itemPosition] + currentItem.value.size;

        if (part[position] + delta < nextPosition) {
            part[position] += delta;
        } else if (nextItem) {
            part[position] = part[itemPosition] = nextPosition;
            part[item] = nextItem;

            delta = Math.max(delta - (nextPosition - part[position]), delta);

            moveForward(part, delta);
        } else {
            part[position] = part[itemPosition] + part[item][spacer].size;
        }
    }
}

function moveBackward(part: Part, delta: number, didJump = false): void {
    if (
        delta === 0 &&
        part[item].isSpacer &&
        part[item][spacer].size === 0 &&
        part[item][prev]
    ) {
        part[item] = part[item][prev] as PartItem;
    }

    if (delta > 0) {
        const prevItem = part[item][prev];

        if (part[position] - delta >= part[itemPosition]) {
            part[position] -= delta;

            if (
                part[position] === part[itemPosition] &&
                prevItem &&
                not(didJump)
            ) {
                part[itemPosition] -= prevItem.value.size;
                part[item] = prevItem;
            }
        } else if (prevItem) {
            const currentDecrease = part[position] - part[itemPosition];

            delta -= currentDecrease;

            part[position] -= currentDecrease;
            part[itemPosition] -= prevItem.value.size;
            part[item] = prevItem;

            moveBackward(part, delta, true);
        } else {
            part[position] = part[itemPosition] = 0;
        }
    }
}
