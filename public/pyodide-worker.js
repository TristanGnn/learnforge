/* ================================================================
   LEARNFORGE — Python Web Worker (Pyodide)
   Sécurité : pas d'accès DOM, pas de cookies, pas de localStorage.
   Communication uniquement via postMessage.
   ================================================================ */

let pyodide = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
  pyodide = await loadPyodide();
  return pyodide;
}

self.onmessage = async (e) => {
  const { code } = e.data || {};
  if (typeof code !== "string") return;

  try {
    const py = await ensurePyodide();

    self.postMessage({ type: "ready" });

    py.setStdout({ batched: (text) => self.postMessage({ type: "stdout", text }) });
    py.setStderr({ batched: (text) => self.postMessage({ type: "stderr", text }) });

    await py.runPythonAsync(code);

    self.postMessage({ type: "done" });
  } catch (err) {
    self.postMessage({ type: "error", text: err.message });
  }
};
