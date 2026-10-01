export const MAX_CONTEXT_BYTES = 24_000;
export const byteSize = (text: string) => new TextEncoder().encode(text).length;

/** Exact paragraph deduplication only. Never summarize, truncate or alter code. */
export function packContext(source: string, deduplicate = true) {
  const originalBytes = byteSize(source);
  // Repeated code or indentation can carry meaning; leave fenced text intact.
  if (!deduplicate || source.includes("```") || source.includes("~~~")) {
    return { text: source, originalBytes, packedBytes: originalBytes, removed: 0, protectedCode: /```|~~~/.test(source) };
  }
  const seen = new Set<string>();
  let removed = 0;
  const text = source.split(/(\r?\n[\t ]*\r?\n)/).reduce((result: string[], block, index, blocks) => {
    if (index % 2 || !block) return result;
    if (seen.has(block)) { removed++; return result; }
    seen.add(block);
    if (result.length) result.push(blocks[index - 1] ?? "\n\n");
    result.push(block);
    return result;
  }, []).join("");
  // No edits when nothing was duplicated, including original trailing spacing.
  const packed = removed ? text : source;
  return { text: packed, originalBytes, packedBytes: byteSize(packed), removed, protectedCode: false };
}
