import { not } from "logical-not";

import { Note } from "./note";
import { NoteSet } from "./note-set";
import { NoteValue } from "./note-value";
import { Fraction } from "./tools/fraction";

const { floor, pow: power, log2 } = Math;

const item = Symbol("item");
const itemOffset = Symbol("offset");

export class Part {
    readonly cursor = new PartCursor(this);

    [item]: PartItem = new PartSpacer();
    [itemOffset] = Fraction.Zero; // absolute

    insertNoteSet(noteValue: NoteValue): Fraction {
        return insert.call(this, new PartNoteSet(noteValue));
    }

    changeNoteValue(nextNoteValue: NoteValue): Fraction {
        if (this[item] instanceof PartNoteSet) {
            const currentItem = this[item] as PartNoteSet;
            const prevNoteValue = currentItem.noteValue;

            if (nextNoteValue !== prevNoteValue) {
                currentItem[value] = currentItem[value].clone(nextNoteValue);

                updateParents(currentItem);

                const newSizeAbsolute = toAbsoluteSize(currentItem);
                const currentItemOffset = this[itemOffset];

                if (newSizeAbsolute.compare("<", currentItemOffset)) {
                    this[itemOffset] = newSizeAbsolute;

                    return currentItemOffset.subtract(newSizeAbsolute);
                }
            }
        }

        return Fraction.Zero;
    }

    insertTuplet(): Fraction {
        const instance = new PartTuplet();

        updateTuplet.call(instance);

        return insert.call(this, instance);
    }

    remove(): Fraction {
        if (this[item] instanceof PartSpacer) {
            return Fraction.Zero;
        } else {
            const prevSpacer = this[item][prev] as PartSpacer;
            const nextSpacer = this[item][next] as PartSpacer;

            const offset = this[itemOffset];

            this[itemOffset] = toAbsoluteSize(prevSpacer);

            unlink(this[item]);

            link(prevSpacer, nextSpacer);

            this[item] = nextSpacer;

            updateParents(this[item]);

            return offset;
        }
    }

    insertNote(note: Note): void {
        if (this[item] instanceof PartNoteSet)
            (this[item] as PartNoteSet)[value].insert(note);
    }

    removeNote(note: Note): void {
        if (this[item] instanceof PartNoteSet)
            (this[item] as PartNoteSet)[value].remove(note);
    }

    *iterate(): Generator<PartItem> {
        let currentItem: PartItem | null = this[item];

        do yield currentItem;
        while ((currentItem = currentItem[next]));
    }
}

function insert(this: Part, newItem: PartNoteSet | PartTuplet): Fraction {
    const newSpacer = new PartSpacer();

    let nextSpacer: PartSpacer;

    switch (this[item].constructor) {
        case PartSpacer:
            nextSpacer = this[item] as PartSpacer;

            setSizes: {
                const nextItemSize = nextSpacer[duration]
                    .subtract(toFraction(newItem))
                    .subtract(this[itemOffset]);

                nextSpacer[duration] = nextItemSize.compare(">", Fraction.Zero)
                    ? nextItemSize
                    : Fraction.Zero;

                newSpacer[duration] = this[itemOffset];
            }
            break;

        case PartNoteSet:
            nextSpacer = this[item][next] as PartSpacer;

            break;

        case PartTuplet:
            nextSpacer = (this[item] as PartTuplet)[children][0] as PartSpacer;
            break;
        default:
            return Fraction.Zero;
    }

    const prevItem = nextSpacer[prev];

    link(newItem, nextSpacer); //(!) set [parent] for newItem
    link(newSpacer, newItem); //(!) set [parent] for newSpacer
    link(prevItem, newSpacer);

    if (newItem[parent]) {
        const parentItem = newItem[parent] as PartTuplet;
        const i = parentItem[children].indexOf(nextSpacer);

        parentItem[children].splice(i, 0, newSpacer, newItem);
    }

    switch (newItem.constructor) {
        case PartTuplet:
            this[item] = (newItem as PartTuplet)[children][0];
            break;
        default:
            this[item] = newItem;

            updateParents(this[item]);
    }

    const delta =
        prevItem instanceof PartNoteSet
            ? toAbsoluteSize(prevItem).subtract(this[itemOffset])
            : Fraction.Zero;

    this[itemOffset] = Fraction.Zero;

    return delta;
}

export class PartCursor {
    get item(): PartItem {
        return this.part[item];
    }

    constructor(private part: Part) {}

    forward(delta: Fraction): void {
        if (delta.compare(">=", Fraction.Zero)) moveForward(this.part, delta);
        else moveBackward(this.part, delta.negative());
    }

    backward(delta: Fraction): void {
        if (delta.compare(">=", Fraction.Zero)) moveBackward(this.part, delta);
        else moveForward(this.part, delta.negative());
    }

    next(): Fraction {
        const delta = toAbsoluteSize(this.part[item]).subtract(
            this.part[itemOffset],
        );

        moveForward(this.part, delta);

        return delta;
    }

    prev(): Fraction {
        let delta = this.part[itemOffset];

        const prevItem = getPrev(this.part[item]);

        if (prevItem && not(prevItem instanceof PartTuplet)) {
            delta = delta.add(toAbsoluteSize(prevItem));
        }

        moveBackward(this.part, delta);

        return delta;
    }
}

function moveForward(part: Part, delta: Fraction): void {
    if (delta.compare("=", Fraction.Zero) && part[item] instanceof PartSpacer) {
        const spacer = part[item] as PartSpacer;

        if (spacer[duration].compare("=", Fraction.Zero)) {
            const nextItem = getNext(part[item]) as PartItem;

            if (nextItem) part[item] = nextItem;
        }
    }

    if (delta.compare(">", Fraction.Zero)) {
        const currentItem = part[item];
        const currentSize = toAbsoluteSize(currentItem);

        const nextItemOffset = part[itemOffset].add(delta);

        if (nextItemOffset.compare("<", currentSize)) {
            part[itemOffset] = nextItemOffset;
        } else {
            const nextItem = getNext(currentItem);

            if (nextItem) {
                part[itemOffset] = Fraction.Zero;
                part[item] = nextItem;

                moveForward(part, delta.subtract(currentSize));
            } else {
                part[itemOffset] = delta;

                if (part[itemOffset].compare(">", currentSize)) {
                    const spacer = currentItem as PartSpacer;

                    spacer[duration] = toRelativeSize(spacer, part[itemOffset]);
                }
            }
        }
    }
}

function moveBackward(part: Part, delta: Fraction): void {
    if (isZero(delta) && isZero(part[itemOffset])) {
        const prevItem = getPrev(part[item]);

        if (prevItem) {
            part[item] = prevItem;
            part[itemOffset] =
                prevItem instanceof PartTuplet
                    ? Fraction.Zero
                    : toAbsoluteSize(prevItem);
        }
    }

    if (delta.compare(">", Fraction.Zero)) {
        if (part[itemOffset].compare(">=", delta)) {
            part[itemOffset] = part[itemOffset].subtract(delta);
        } else {
            const prevItem = getPrev(part[item]);

            if (prevItem) {
                part[item] = prevItem;
                part[itemOffset] = toAbsoluteSize(prevItem);

                moveBackward(part, delta);
            } else {
                part[itemOffset] = Fraction.Zero;
            }
        }
    }
}

const next = Symbol("next");
const prev = Symbol("prev");
const parent = Symbol("parent");
const children = Symbol("children");

export abstract class PartItem {
    [next]: PartItem | null = null;
    [prev]: PartItem | null = null;
    [parent]: PartTuplet | null = null;

    get next(): PartItem | null {
        return this[next];
    }

    get prev(): PartItem | null {
        return this[prev];
    }

    get parent(): PartTuplet | null {
        return this[parent];
    }
}

function toFraction(item: PartItem): Fraction {
    switch (item.constructor) {
        case PartNoteSet:
            return (item as PartNoteSet).noteValue.size;
        case PartTuplet:
            return (item as PartTuplet).noteValue.size;
        case PartSpacer:
            return (item as PartSpacer)[duration];
    }

    return Fraction.Zero;
}

const value = Symbol("value");

export class PartNoteSet extends PartItem {
    [value]: NoteSet;

    constructor(noteValue: NoteValue) {
        super();

        this[value] = new NoteSet(noteValue);
    }

    get noteSet(): NoteSet {
        return this[value];
    }

    get noteValue(): NoteValue {
        return this[value].noteValue;
    }
}

export enum PartTupletState {
    Complete = "complete",
    Incomplete = "incomplete",
    Overflow = "overflow",
}

const index = Symbol("index");
const baseNoteValue = Symbol("baseNoteValue");
const factor = Symbol("factor");
const fillState = Symbol("fillState");
const autoSize = Symbol("autoSize");

export class PartTuplet extends PartItem {
    [children]: PartItem[] = [];

    [index] = 3;
    [baseNoteValue]: NoteValue;
    [factor]: Fraction;
    [autoSize] = true;
    [fillState]: PartTupletState;

    get children(): PartItem[] {
        return this[children].slice();
    }

    get index(): number {
        return this[index];
    }

    get baseNoteValue(): NoteValue {
        return this[baseNoteValue];
    }

    get autoSize(): boolean {
        return this[autoSize];
    }

    set autoSize(value: boolean) {
        this[autoSize] = value;

        updateTuplet.call(this);
    }

    get state(): PartTupletState {
        return this[fillState];
    }

    get noteValue(): NoteValue {
        return NoteValue.fromNumber(
            this[baseNoteValue].size.valueOf() * this[index],
        );
    }

    constructor() {
        super();

        this[children] = [new PartSpacer()];
        this[children][0][parent] = this;
    }

    setSize(noteValue: NoteValue): void {
        this[autoSize] = false;

        const { noteValue: base, factor } = noteValue.factoring();

        this[baseNoteValue] = base;
        this[index] = factor;

        updateTuplet.call(this);
    }

    *iterate(): Generator<PartItem> {
        let currentItem: PartItem | null = this[children][0];

        do yield currentItem;
        while ((currentItem = currentItem[next]));
    }
}

function updateTuplet(this: PartTuplet): void {
    if (this[autoSize]) updateTupletAuto.call(this);
    else updateTupletNotAuto.call(this);

    if (this[parent] instanceof PartTuplet)
        updateTuplet.call(this[parent] as PartTuplet);
}

function updateTupletAuto(this: PartTuplet): void {
    const noteValueSizeSet: Fraction[] = [];

    let noteValueSizeSum = Fraction.Zero;
    let lastSpacerSize = Fraction.Zero;

    this[children].slice(0, -1).forEach(child => {
        const size = toFraction(child);

        if (not(child instanceof PartSpacer)) {
            noteValueSizeSet.push(size);
        }

        lastSpacerSize = lastSpacerSize.add(size);
    });

    noteValueSizeSet.forEach(
        size => (noteValueSizeSum = noteValueSizeSum.add(size)),
    );

    if (noteValueSizeSum.compare("!=", Fraction.Zero)) {
        const baseNoteValueSize =
            Fraction.greatestCommonDivisor(noteValueSizeSet);

        this[index] = getTupletIndex(
            noteValueSizeSum.divide(baseNoteValueSize),
        );
        this[baseNoteValue] = NoteValue.fromNumber(baseNoteValueSize.valueOf());

        const numerator = power(2, floor(log2(this[index])));

        this[factor] = Fraction.create(numerator, this[index]);
        this[fillState] = PartTupletState.Incomplete;
    } else {
        this[index] = 3;
        this[baseNoteValue] = NoteValue.create();
        this[factor] = Fraction.create(1, 1);
        this[fillState] = PartTupletState.Incomplete;
    }

    if (this[children].length > 1) {
        const spacer = this.children[this.children.length - 1] as PartSpacer;

        spacer[duration] = this.noteValue.size.subtract(lastSpacerSize);

        this[fillState] = spacer[duration].compare("=", Fraction.Zero)
            ? PartTupletState.Complete
            : PartTupletState.Incomplete;
    }
}

function updateTupletNotAuto(this: PartTuplet): void {
    // я остановился на мысли, что вставка ноты в Tuplet может возвращать delta != Fraction.Zero
}

const three = Fraction.create(3, 1);

function getTupletIndex(source: Fraction): number {
    if (source.compare("<=", three)) return 3;

    let n = source.ceiling();

    while (true) {
        const exponent = log2(n);

        if (exponent !== floor(exponent)) return n;
        else n += 1;
    }
}

const duration = Symbol("note value");

export class PartSpacer extends PartItem {
    [duration] = Fraction.Zero;

    get duration(): Fraction {
        return this[duration];
    }
}

function link(prevItem: PartItem | null, nextItem: PartItem | null): void {
    if (prevItem && nextItem) {
        if (prevItem[parent]) nextItem[parent] = prevItem[parent];
        else if (nextItem[parent]) prevItem[parent] = nextItem[parent];
    }

    if (prevItem instanceof PartSpacer && nextItem instanceof PartSpacer) {
        const prevSpacer = prevItem as PartSpacer;
        const nextSpacer = nextItem as PartSpacer;

        nextSpacer[duration] = nextSpacer[duration].add(prevSpacer[duration]);

        const newPrevItem = prevSpacer[prev];

        unlink(prevSpacer);

        link(newPrevItem, nextSpacer);
    } else {
        if (prevItem) prevItem[next] = nextItem;
        if (nextItem) nextItem[prev] = prevItem;
    }
}

function unlink(it: PartItem): void {
    if (it[prev]) (it[prev] as PartItem)[next] = null;
    if (it[next]) (it[next] as PartItem)[prev] = null;

    it[next] = it[prev] = null;

    if (it[parent]) {
        const parentItem = it[parent] as PartTuplet;
        const i = parentItem[children].indexOf(it);

        parentItem[children].splice(i, 1);

        it[parent] = null;
    }
}

function getNext(item: PartItem | null): PartItem | null {
    if (item === null) return null;

    if (item instanceof PartTuplet) {
        const tuplet = item as PartTuplet;
        const firstChild = tuplet[children][0];

        return firstChild;
    }

    if (not(item[next]) && item[parent]) {
        return (item[parent] as PartItem)[next];
    }

    return item[next] as PartItem;
}

function getPrev(item: PartItem | null): PartItem | null {
    if (item === null) return null;

    if (item[prev] instanceof PartTuplet) {
        const tuplet = item[prev] as PartTuplet;
        const lastChild = tuplet[children][tuplet[children].length - 1];

        return lastChild;
    }

    if (not(item[prev]) && item[parent]) {
        return item[parent] as PartItem;
    }

    return item[prev] as PartItem;
}

function updateParents(from: PartItem): void {
    let tuplet = from as PartTuplet;

    while ((tuplet = tuplet[parent] as PartTuplet)) updateTuplet.call(tuplet);
}

function* iterateParents(
    currentItem: PartItem,
): Generator<PartTuplet, void, void> {
    while ((currentItem = currentItem[parent] as PartTuplet))
        yield currentItem as PartTuplet;
}

function toAbsoluteSize(item: PartItem, value?: Fraction): Fraction {
    if (not(value)) value = toFraction(item);

    for (let parent of iterateParents(item)) {
        value = value!.multiply(parent[factor]);
    }

    return value as Fraction;
}

function toRelativeSize(item: PartItem, value?: Fraction): Fraction {
    if (not(value)) value = toFraction(item);

    for (let parent of iterateParents(item)) {
        value = value!.divide(parent[factor]);
    }

    return value as Fraction;
}

function isZero(fraction: Fraction): boolean {
    return fraction.compare("=", Fraction.Zero);
}
