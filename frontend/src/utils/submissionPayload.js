/**
 * Multi-file submissions use JSON:
 * { "v": 1, "files": { "solution.py": "..." }, "entry": "solution.py" }
 * Legacy submissions are raw source text.
 */
export function parseSubmittedPayload(submitted_file) {
  if (submitted_file == null || submitted_file === "") {
    return { mode: "single", content: "", files: null, entry: null };
  }
  const raw = String(submitted_file).trim();
  if (!raw.startsWith("{")) {
    return { mode: "single", content: submitted_file, files: null, entry: null };
  }
  try {
    const d = JSON.parse(raw);
    if (
      d &&
      typeof d.files === "object" &&
      d.files !== null &&
      !Array.isArray(d.files)
    ) {
      const names = Object.keys(d.files);
      if (names.length) {
        const entryRaw = d.entry;
        const entry =
          entryRaw != null && String(entryRaw).trim() !== ""
            ? String(entryRaw).trim()
            : null;
        return { mode: "multi", content: null, files: d.files, v: d.v, entry };
      }
    }
  } catch {
    /* treat as single-file source that happens to start with "{" */
  }
  return { mode: "single", content: submitted_file, files: null, entry: null };
}

/**
 * Sort file tabs: inferred or explicit entry first, then alphabetical.
 * @param {Record<string, string>} filesMap
 * @param {boolean} isPython
 * @param {string | null} entryHint — Python: filename; Java: class name (no .java)
 */
export function orderedSubmissionFilenames(filesMap, isPython, entryHint = null) {
  if (!filesMap || typeof filesMap !== "object") return [];
  const names = Object.keys(filesMap);
  const defaultEntryPy = "main.py";
  const defaultEntryJava = "Main.java";

  let primary = null;
  if (entryHint) {
    if (isPython && filesMap[entryHint]) primary = entryHint;
    if (!isPython && filesMap[`${entryHint}.java`])
      primary = `${entryHint}.java`;
  }
  if (!primary && isPython) {
    const pys = names.filter((n) => n.toLowerCase().endsWith(".py"));
    if (pys.length === 1) primary = pys[0];
    if (!primary && names.includes(defaultEntryPy)) primary = defaultEntryPy;
  }
  if (!primary && !isPython) {
    const javas = names.filter((n) => n.toLowerCase().endsWith(".java"));
    if (javas.length === 1) primary = javas[0];
    if (!primary && names.includes(defaultEntryJava)) primary = defaultEntryJava;
  }
  if (!primary && names.length) {
    primary = [...names].sort((a, b) => a.localeCompare(b))[0];
  }

  const rest = names
    .filter((n) => n !== primary)
    .sort((a, b) => a.localeCompare(b));
  return primary ? [primary, ...rest] : rest;
}

/** Code string to send to interactive terminal (single-file or entry slice of multi). */
export function playgroundSourceFromPayload(parsed, isPython) {
  if (!parsed || parsed.mode === "single") return parsed?.content ?? "";
  const files = parsed.files;
  if (!files) return "";
  if (parsed.entry) {
    if (isPython && files[parsed.entry]) return files[parsed.entry];
    if (!isPython && files[`${parsed.entry}.java`])
      return files[`${parsed.entry}.java`];
  }
  const keys = Object.keys(files);
  if (isPython) {
    const pys = keys.filter((k) => k.toLowerCase().endsWith(".py"));
    if (pys.length === 1) return files[pys[0]] ?? "";
  } else {
    const javas = keys.filter((k) => k.toLowerCase().endsWith(".java"));
    if (javas.length === 1) return files[javas[0]] ?? "";
  }
  if (isPython && files["main.py"]) return files["main.py"];
  if (!isPython && files["Main.java"]) return files["Main.java"];
  return keys.length ? files[[...keys].sort((a, b) => a.localeCompare(b))[0]] : "";
}

/**
 * Socket `entry` for multi-file runs: Python = exact .py filename; Java = class name (no .java).
 * Returns null for synthetic single-tab labels like submission.py (single-file payload).
 */
export function runtimeEntryFromTabFilename(filename, isPython) {
  if (!filename || typeof filename !== "string") return null;
  if (isPython) {
    return filename.toLowerCase().endsWith(".py") ? filename : null;
  }
  if (filename.toLowerCase().endsWith(".java")) {
    return filename.replace(/\.java$/i, "");
  }
  return null;
}
