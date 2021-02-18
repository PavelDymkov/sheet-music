import { not } from "logical-not";

import { Note } from "./note";
import { NoteValue } from "./note-value";
import { Fraction } from "./tools/fraction";

const { floor, pow: power, log2 } = Math;

const node = Symbol("node");
const nodeOffset = Symbol("offset");

export class Part {
    readonly cursor = new Cursor(this);

    [node]: Node = new Spacer();
    [nodeOffset] = Fraction.Zero; // absolute

    insert(noteValue: NoteValue): Fraction {
        return insert.call(this, new Item(noteValue));
    }

    changeNoteValue(nextNoteValue: NoteValue): Fraction {
        if (this[node] instanceof Item) {
            const itemNode = this[node] as Item;
            const prevNoteValue = itemNode[value];

            if (nextNoteValue !== prevNoteValue) {
                itemNode[value] = nextNoteValue;

                updateParents(itemNode);

                const newSizeAbsolute = toAbsoluteSize(itemNode);
                const currentNodeOffset = this[nodeOffset];

                if (newSizeAbsolute.compare("<", currentNodeOffset)) {
                    this[nodeOffset] = newSizeAbsolute;

                    return currentNodeOffset.subtract(newSizeAbsolute);
                }
            }
        }

        return Fraction.Zero;
    }

    insertIrregularRhythm(): Fraction {
        return insert.call(this, new IrregularRhythm());
    }

    remove(): Fraction {
        if (this[node] instanceof Spacer) {
            return Fraction.Zero;
        } else {
            const prevSpacer = this[node][prev] as Spacer;
            const nextSpacer = this[node][next] as Spacer;

            const offset = this[nodeOffset];

            this[nodeOffset] = toAbsoluteSize(prevSpacer);

            unlink(this[node]);

            link(prevSpacer, nextSpacer);

            this[node] = nextSpacer;

            updateParents(this[node]);

            return offset;
        }
    }

    insertNote(note: Note): void {}

    removeNote(note: Note): void {}

    *iterate(): Generator<Node> {
        let currentNode: Node | null = this[node];

        do yield currentNode;
        while ((currentNode = currentNode[next]));
    }
}

function insert(this: Part, newNode: Item | IrregularRhythm): Fraction {
    const newSpacer = new Spacer();

    let nextItem: Spacer;
    let delta: Fraction;

    switch (this[node].constructor) {
        case Spacer:
            nextItem = this[node] as Spacer;

            setSizes: {
                const nextItemSize = nextItem[value]
                    .subtract(toFraction(newNode))
                    .subtract(this[nodeOffset]);

                nextItem[value] = nextItemSize.compare(">", Fraction.Zero)
                    ? nextItemSize
                    : Fraction.Zero;

                newSpacer[value] = this[nodeOffset];
            }

            delta = Fraction.Zero;
            break;

        case Item:
            nextItem = this[node][next] as Spacer;

            delta = toAbsoluteSize(this[node]).subtract(this[nodeOffset]);
            break;

        case IrregularRhythm:
            nextItem = (this[node] as IrregularRhythm)[children][0] as Spacer;

            delta = Fraction.Zero;
            break;
        default:
            return Fraction.Zero;
    }

    const prevItem = nextItem[prev];

    link(newNode, nextItem); //(!) set [parent] for newNode
    link(newSpacer, newNode); //(!) set [parent] for newSpacer
    link(prevItem, newSpacer);

    if (newNode[parent]) {
        const parentNode = newNode[parent] as IrregularRhythm;
        const i = parentNode[children].indexOf(nextItem);

        parentNode[children].splice(i, 0, newSpacer, newNode);
    }

    switch (newNode.constructor) {
        case IrregularRhythm:
            this[node] = (newNode as IrregularRhythm)[children][0];
            break;
        default:
            this[node] = newNode;

            updateParents(this[node]);
    }

    this[nodeOffset] = Fraction.Zero;

    return delta;
}

export class Cursor {
    get node(): Node {
        return this.part[node];
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
        const delta = toAbsoluteSize(this.part[node]).subtract(
            this.part[nodeOffset],
        );

        moveForward(this.part, delta);

        return delta;
    }

    prev(): Fraction {
        let delta = this.part[nodeOffset];

        const prevNode = getPrev(this.part[node]);

        if (prevNode && not(prevNode instanceof IrregularRhythm)) {
            delta = delta.add(toAbsoluteSize(prevNode));
        }

        moveBackward(this.part, delta);

        return delta;
    }
}

function moveForward(part: Part, delta: Fraction): void {
    if (delta.compare("=", Fraction.Zero) && part[node] instanceof Spacer) {
        const spacer = part[node] as Spacer;

        if (spacer[value].compare("=", Fraction.Zero)) {
            const nextNode = getNext(part[node]) as Node;

            if (nextNode) {
                part[node] = nextNode;
            }
        }
    }

    if (delta.compare(">", Fraction.Zero)) {
        const currentNode = part[node];
        const currentSize = toAbsoluteSize(currentNode);

        const nextNodeOffset = part[nodeOffset].add(delta);

        if (nextNodeOffset.compare("<", currentSize)) {
            part[nodeOffset] = nextNodeOffset;
        } else {
            const nextNode = getNext(currentNode);

            if (nextNode) {
                part[nodeOffset] = Fraction.Zero;
                part[node] = nextNode;

                moveForward(part, delta.subtract(currentSize));
            } else {
                part[nodeOffset] = delta;

                if (part[nodeOffset].compare(">", currentSize)) {
                    const spacer = currentNode as Spacer;

                    spacer[value] = toRelativeSize(spacer, part[nodeOffset]);
                }
            }
        }
    }
}

function moveBackward(part: Part, delta: Fraction): void {
    if (isZero(delta) && isZero(part[nodeOffset])) {
        const prevNode = getPrev(part[node]);

        if (prevNode) {
            part[node] = prevNode;
            part[nodeOffset] =
                prevNode instanceof IrregularRhythm
                    ? Fraction.Zero
                    : toFraction(prevNode);
        }
    }

    if (delta.compare(">", Fraction.Zero)) {
        if (part[nodeOffset].compare(">=", delta)) {
            part[nodeOffset] = part[nodeOffset].subtract(delta);
        } else {
            const prevNode = getPrev(part[node]);

            if (prevNode) {
                part[node] = prevNode;
                part[nodeOffset] = toFraction(prevNode);

                moveBackward(part, delta);
            } else {
                part[nodeOffset] = Fraction.Zero;
            }
        }
    }
}

const next = Symbol("next");
const prev = Symbol("prev");
const parent = Symbol("parent");
const children = Symbol("children");

export abstract class Node {
    [next]: Node | null = null;
    [prev]: Node | null = null;
    [parent]: IrregularRhythm | null = null;

    get next(): Node | null {
        return this[next];
    }

    get prev(): Node | null {
        return this[prev];
    }

    get parent(): IrregularRhythm | null {
        return this[parent];
    }
}

function toFraction(node: Node): Fraction {
    switch (node.constructor) {
        case Item:
            return (node as Item)[value].size;
        case IrregularRhythm:
            return (node as IrregularRhythm).value.size;
        case Spacer:
            return (node as Spacer)[value];
    }

    return Fraction.Zero;
}

const value = Symbol("value");

export class Item extends Node {
    [value]: NoteValue;

    constructor(duration: NoteValue) {
        super();

        this[value] = duration;
    }

    get value(): NoteValue {
        return this[value];
    }
}

const index = Symbol("index");
const factor = Symbol("factor");

export class IrregularRhythm extends Node {
    [children]: Node[] = [];

    [index] = 3;
    [factor]: Fraction;
    [value] = NoteValue.fromNumber(0);

    get children(): Node[] {
        return this[children].slice();
    }

    get index(): number {
        return this[index];
    }

    get value(): NoteValue {
        return this[value];
    }

    constructor() {
        super();

        this[children] = [new Spacer()];
        this[children][0][parent] = this;
    }

    *iterate(): Generator<Node> {
        let currentNode: Node | null = this[children][0];

        do yield currentNode;
        while ((currentNode = currentNode[next]));
    }
}

function updateIrregularRhythm(this: IrregularRhythm): void {
    let noteValueSizeMax = Fraction.Zero;
    let noteValueSizeSum = Fraction.Zero;

    this[children].slice(0, -1).forEach(child => {
        const size = toFraction(child);

        if (not(child instanceof Spacer)) {
            noteValueSizeMax = noteValueSizeMax.max(size);
        }

        noteValueSizeSum = noteValueSizeSum.add(size);
    });

    if (noteValueSizeMax.compare("!=", Fraction.Zero)) {
        const noteQuantity = getIrregularRhythmNoteQuantity(
            noteValueSizeSum.divide(noteValueSizeMax),
        );
        const numerator = power(2, floor(log2(noteQuantity)));

        this[index] = noteQuantity;
        this[factor] = Fraction.create(numerator, noteQuantity);
        this[value] = NoteValue.fromNumber(
            noteValueSizeMax
                .multiply(Fraction.create(this[index], 1))
                .multiply(this[factor])
                .valueOf(),
        );
    } else {
        this[index] = 3;
        this[factor] = Fraction.create(1, 1);
        this[value] = NoteValue.fromNumber(0);
    }

    const lastChild = this.children[this.children.length - 1] as Spacer;

    lastChild[value] = this[value].size
        .divide(this[factor])
        .subtract(noteValueSizeSum);

    if (this[parent] instanceof IrregularRhythm)
        updateIrregularRhythm.call(this[parent] as IrregularRhythm);
}

const three = Fraction.create(3, 1);

function getIrregularRhythmNoteQuantity(source: Fraction): number {
    if (source.compare("<=", three)) return 3;

    let n = source.ceiling();

    while (true) {
        const exponent = log2(n);

        if (exponent !== floor(exponent)) return n;
        else n += 1;
    }
}

export class Spacer extends Node {
    [value] = Fraction.Zero;

    get value(): Fraction {
        return this[value];
    }
}

function link(prevNode: Node | null, nextNode: Node | null): void {
    if (prevNode && nextNode) {
        if (prevNode[parent]) nextNode[parent] = prevNode[parent];
        else if (nextNode[parent]) prevNode[parent] = nextNode[parent];
    }

    if (prevNode instanceof Spacer && nextNode instanceof Spacer) {
        const prevSpacer = prevNode as Spacer;
        const nextSpacer = nextNode as Spacer;

        nextSpacer[value] = nextSpacer[value].add(prevSpacer[value]);

        const prevItem = prevSpacer[prev];

        unlink(prevSpacer);

        link(prevItem, nextSpacer);
    } else {
        if (prevNode) prevNode[next] = nextNode;
        if (nextNode) nextNode[prev] = prevNode;
    }
}

function unlink(it: Node): void {
    if (it[prev]) (it[prev] as Node)[next] = null;
    if (it[next]) (it[next] as Node)[prev] = null;

    it[next] = it[prev] = null;

    if (it[parent]) {
        const parentNode = it[parent] as IrregularRhythm;
        const i = parentNode[children].indexOf(it);

        parentNode[children].splice(i, 1);

        it[parent] = null;
    }
}

function getNext(node: Node | null): Node | null {
    if (node === null) return null;

    if (node instanceof IrregularRhythm) {
        const irregularRhythm = node as IrregularRhythm;
        const firstChild = irregularRhythm[children][0];

        return firstChild;
    }

    if (not(node[next]) && node[parent]) {
        return (node[parent] as Node)[next];
    }

    return node[next] as Node;
}

function getPrev(node: Node | null): Node | null {
    if (node === null) return null;

    if (node[prev] instanceof IrregularRhythm) {
        const irregularRhythm = node[prev] as IrregularRhythm;
        const lastChild =
            irregularRhythm[children][irregularRhythm[children].length - 1];

        return lastChild;
    }

    if (not(node[prev]) && node[parent]) {
        return node[parent] as Node;
    }

    return node[prev] as Node;
}

function updateParents(from: Node): void {
    let irregularRhythm = from as IrregularRhythm;

    while ((irregularRhythm = irregularRhythm[parent] as IrregularRhythm))
        updateIrregularRhythm.call(irregularRhythm);
}

function* iterateParents(
    currentNode: Node,
): Generator<IrregularRhythm, void, void> {
    while ((currentNode = currentNode[parent] as IrregularRhythm))
        yield currentNode as IrregularRhythm;
}

function toAbsoluteSize(node: Node, value?: Fraction): Fraction {
    if (not(value)) value = toFraction(node);

    for (let parent of iterateParents(node)) {
        value = value!.multiply(parent[factor]);
    }

    return value as Fraction;
}

function toRelativeSize(node: Node, value?: Fraction): Fraction {
    if (not(value)) value = toFraction(node);

    for (let parent of iterateParents(node)) {
        value = value!.divide(parent[factor]);
    }

    return value as Fraction;
}

function isZero(fraction: Fraction): boolean {
    return fraction.compare("=", Fraction.Zero);
}
