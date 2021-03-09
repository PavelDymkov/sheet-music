import { SheetMusic } from "../../sheet-music";
import { Renderer } from "../abstract-renderer";

const token = Symbol();

const svg = Symbol();

export class RendererSVG extends Renderer {
    static create(
        sheetMusic: SheetMusic,
        svgElement: SVGSVGElement,
    ): RendererSVG {
        return Object.assign(new RendererSVG(sheetMusic, token), {
            [svg]: svgElement,
        });
    }

    [svg]: SVGSVGElement;

    private constructor(sheetMusic: SheetMusic, _: symbol) {
        if (_ !== token) throw new Error("Illigal constructor");

        super(sheetMusic);
    }
}
