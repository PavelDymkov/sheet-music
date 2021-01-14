import { Scale } from "../scale";
import { Step } from "../step";

import { scaleToSteps } from "./scale-to-steps";

export function scaleToMajorOrMinor(scale: Scale): Scale.Major | Scale.Minor {
    const [i1, i2, i3] = scaleToSteps(scale);

    return i1 + i2 + i3 === Step.Tone + Step.Semitone
        ? Scale.Minor
        : Scale.Major;
}
