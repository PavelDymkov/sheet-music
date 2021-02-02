import { Part, IrregularRhythm, Item, Node, Spacer } from "./part";

export function view(part: Part): void {
    const [nodeKey] = Object.getOwnPropertySymbols(part);

    const curentNode = (part as any)[nodeKey] as Node;
    const firstNode = getFirstNode(curentNode);

    iterate(getTopLevelItems(firstNode), "", curentNode);
}

function getFirstNode(node: Node): Node {
    if (node.prev) return getFirstNode(node.prev);
    if (node.parent) return getFirstNode(node.parent);

    return node;
}

function getTopLevelItems(node: Node): Node[] {
    return node.next ? [node].concat(getTopLevelItems(node.next)) : [node];
}

function iterate(items: Node[], offset: string, currentNode: Node): void {
    items.forEach(node => {
        const prefix = (node === currentNode ? "> " : "  ") + offset;

        switch (node.constructor) {
            case Item:
                log(`note   (${toNoteValue(node as Item)})`);
                break;
            case Spacer:
                log(`spacer (${(node as Spacer).value.valueOf()})`);
                break;
            case IrregularRhythm:
                scope: {
                    const tuplet = node as IrregularRhythm;
                    const size = toNoteValue(node as Item);

                    log(`tuplet (${tuplet.index} = ${size})`);

                    iterate(tuplet.children, offset + "    ", currentNode);
                }
                break;
        }

        function log(message: string): void {
            console.log(`${prefix}${message}`);
        }
    });
}

function toNoteValue(node: Item): string {
    const value = node.value.size.valueOf();

    switch (value) {
        case 16:
            return "Eight";
        case 32:
            return "Quarter";
        case 64:
            return "Half";
        default:
            return `${value}`;
    }
}
