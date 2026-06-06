/**
 * A robust utility to clean and fix messy/non-standard JSON strings.
 */
export const cleanAndFixJson = (input: string): string => {
  let cleaned = input.trim();

  // 1. Smart Extraction: If the input looks like a JS code block (e.g., const data = {...}),
  // try to extract only the part inside the outermost { } or [ ].
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const startIdx = (firstBrace !== -1 && firstBracket !== -1) 
    ? Math.min(firstBrace, firstBracket) 
    : Math.max(firstBrace, firstBracket);

  if (startIdx !== -1) {
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);
    
    if (endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
  }

  try {
    // Attempt standard parse first
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // 2. Structural Fixes (Regex based)
    try {
      let fixed = cleaned
        // Replace single quotes with double quotes
        .replace(/'/g, '"')
        // Add quotes to unquoted keys (e.g., { name: "val" } -> { "name": "val" })
        .replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')
        // Remove trailing commas before closing braces/brackets
        .replace(/,\s*([}\]])/g, '$1')
        // Remove comments (single line // and multi-line /* */)
        .replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

      const parsedFixed = JSON.parse(fixed);
      return JSON.stringify(parsedFixed, null, 2);
    } catch (innerError) {
      // If regex failed, return original trimmed string for user to see the error
      return cleaned;
    }
  }
};
