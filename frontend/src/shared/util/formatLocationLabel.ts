/**
 * Regex function to format db location names
 * Turns DB labels like:
 *  - "parc_lafontaine"
 *  - "south-side trail"
 *  - "montreal, qc"
 * into:
 *  - "Parc Lafontaine"
 *  - "South Side Trail"
 *  - "Montreal, QC"
 */
export function formatLocationLabel(raw: string): string {
    const s = (raw ?? '').trim();
    if (!s) return '';

    // Normalize separators to spaces, keep commas
    const normalized = s
        .replace(/[_\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Title-case words but keep small words lower unless first
    const small = new Set(['and', 'or', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'a', 'an']);

    const words = normalized.split(' ');
    const titled = words.map((w, i) => {
        // keep punctuation attached (e.g. "qc," -> "qc,")
        const m = w.match(/^([a-z0-9]+)([.,)]*)$/i);
        const core = m ? m[1] : w;
        const punct = m ? m[2] : '';

        // preserve acronyms / province codes
        if (/^[a-z]{2,3}$/i.test(core) && core.length <= 3) {
            return core.toUpperCase() + punct;
        }

        const lower = core.toLowerCase();
        if (i !== 0 && small.has(lower)) {
            return lower + punct;
        }

        // title case
        return lower.charAt(0).toUpperCase() + lower.slice(1) + punct;
    });

    return titled.join(' ');
}
