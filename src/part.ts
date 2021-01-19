import { not } from "logical-not";

import { Tuplet } from "./tuplet";
import { NoteValue } from "./note-value";

const position = Symbol("position");
const item = Symbol("item");
const itemPosition = Symbol("itemPosition");

export class Part {
    readonly cursor = new PartCursor(this);

    [position] = 0;
    [item] = new PartItem();
    [itemPosition] = 0;

    get item(): Tuplet | null {
        return this[item][tuplet] || null;
    }

    insert(noteValue: NoteValue): NoteValue {
        const prevPosition = this[position];

        const newItem = new PartItem(noteValue);
        const newItemSpacer = new PartItem();

        let nextItem: PartItem;

        if (this[item].isSpacer) {
            nextItem = this[item];

            const delta = this[position] - this[itemPosition];

            nextItem[spacer] = NoteValue.fromNumber(
                nextItem[spacer].size - (delta + noteValue.size),
            );
            newItemSpacer[spacer] = NoteValue.fromNumber(delta);

            this[itemPosition] = this[position];
        } else {
            nextItem = this[item][next] as PartItem;

            this[position] = this[itemPosition] =
                this[itemPosition] + this[item][tuplet].value.size;
        }

        const prevItem = nextItem[prev];

        nextItem[spacer] = nextItem[spacer].shrink(noteValue);

        link(prevItem, newItemSpacer);
        link(newItemSpacer, newItem);
        link(newItem, nextItem);

        this[item] = newItem;

        return NoteValue.fromNumber(this[position] - prevPosition);
    }

    remove(): NoteValue {
        if (not(this[item].isSpacer)) {
            const prevPosition = this[position];

            const nextItem = this[item][next];
            const prevItem = this[item][prev];

            unlink(this[item]);

            this[item] = prevItem as PartItem;
            this[position] = this[itemPosition];
            this[itemPosition] -= this[item][spacer].size;

            link(prevItem, nextItem);

            return NoteValue.fromNumber(this[position] - prevPosition);
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
const tuplet = Symbol("tuplet");
const spacer = Symbol("spacer");

class PartItem {
    [next]: PartItem | null = null;
    [prev]: PartItem | null = null;

    [tuplet]: Tuplet;
    [spacer]: NoteValue;

    get isSpacer(): boolean {
        return Boolean(this[spacer]);
    }

    get value(): NoteValue {
        return this[spacer] || this[tuplet].value;
    }

    constructor(noteValue?: NoteValue) {
        if (noteValue) {
            this[tuplet] = new Tuplet(noteValue);
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

        const prevPosition = part[position];
        const currentSize = part[item][spacer].size;
        const delta = currentSize - (part[position] - part[itemPosition]);

        moveForward(part, delta);

        return NoteValue.fromNumber(part[position] - prevPosition);
    }

    prev(): NoteValue {
        const { part } = this;

        const prevPosition = part[position];
        const delta = part[position] - part[itemPosition];

        moveBackward(part, delta);

        return NoteValue.fromNumber(part[position] - prevPosition);
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
            const nextDelta = delta - (nextPosition - part[position]);

            delta = nextDelta >= 0 ? nextDelta : delta;

            part[position] = part[itemPosition] = nextPosition;
            part[item] = nextItem;

            moveForward(part, delta);
        } else {
            part[item][spacer] = part[item][spacer].expand(
                NoteValue.fromNumber(delta - currentItem.value.size),
            );
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
