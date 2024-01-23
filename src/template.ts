const escapeCharacters: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
};

const regexp = new RegExp(Object.keys(escapeCharacters).join("|"), "g");

/**
 * The simplest possible HTML template function as a tagged template function.
 */
export function html(fragments: TemplateStringsArray, ...expr: unknown[]) {
    let result = "";
    for (let i = 0; i < fragments.length; i++) {
        result += fragments[i];
        if (expr[i] !== undefined) {
            result += new String(expr[i]).replace(
                regexp,
                (it) => escapeCharacters[it]
            );
        }
    }
    return result;
}
