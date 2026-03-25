export function normalizeArticleContent(input: unknown): string {
  if (input == null) return ''
  if (typeof input !== 'string') return String(input)

  let s = input

  const keyPos = s.indexOf('"content":')
  // Heuristic: if content is wrapped like an (even invalid) JSON object:
  // { "content": "..." }
  // where JSON.parse may fail due to unescaped newlines inside the string,
  // we extract the `"content": "<...>"` value by substring indices (no JSON.parse).
  if (keyPos >= 0) {
    const afterKey = keyPos + '"content":'.length
    const startQuote = s.indexOf('"', afterKey)
    if (startQuote >= 0) {
      const bracePos = s.lastIndexOf('}')
      if (bracePos >= 0) {
        const endQuote = s.lastIndexOf('"', bracePos - 1)
        if (endQuote > startQuote) s = s.slice(startQuote + 1, endQuote)
      } else {
        // Some model outputs are truncated and miss the closing `}` / `"`:
        // in that case, just drop the prefix and keep the remainder.
        s = s.slice(startQuote + 1)
        // If the remainder starts/ends with a quote, strip the trailing one.
        if (s.endsWith('"')) s = s.slice(0, -1)
      }
    }
  }

  // Some models return content wrapped one or more times, for example:
  // 1) "{\"content\":\"<p>...</p>\"}"
  // 2) "\"{\\n \\\"content\\\": \\\"<p>...</p>\\\"}\""
  // So we repeatedly unwrap up to a few times.
  for (let i = 0; i < 3; i++) {
    const trimmed = s.trim()
    let changed = false

    // Case 1: JSON object as a string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed.content === 'string') {
          s = parsed.content
          changed = true
        } else if (typeof parsed === 'string') {
          s = parsed
          changed = true
        }
      } catch {
        // ignore
      }
    }

    if (changed) continue

    // Case 2: JSON string as a string
    if (trimmed.startsWith('\"') && trimmed.endsWith('\"')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === 'string') {
          s = parsed
          changed = true
        }
      } catch {
        // ignore
      }
    }

    if (!changed) break
  }

  // Convert escaped newlines produced by double-escaping: "\\n" -> "\n"
  // Also handle double backslash variants: "\\\\n" -> "\n"
  s = s.replaceAll('\\\\r\\\\n', '\n')
  s = s.replaceAll('\\\\n', '\n')
  s = s.replaceAll('\\r\\n', '\n')
  s = s.replaceAll('\\n', '\n')

  // Optional: tabs
  s = s.replaceAll('\\\\t', '\t')
  s = s.replaceAll('\\t', '\t')

  return s
}

