import { ok } from "assert";

import { Fraction } from "../../package/tools/fraction";

export function delta(actual: Fraction, expected: Fraction): void {
    ok(actual.compare("=", expected));
}
