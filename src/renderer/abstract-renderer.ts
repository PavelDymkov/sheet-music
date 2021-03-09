import { SheetMusic } from "../sheet-music";

const constroller = Symbol();

export abstract class Renderer {
    [constroller]: SheetMusic;

    protected constructor(sheetMusic: SheetMusic) {
        this[constroller] = sheetMusic;
    }
}
