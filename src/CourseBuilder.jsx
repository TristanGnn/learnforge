import { useState, useCallback, useRef, useEffect } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const uid = () => Math.random().toString(36).slice(2, 9);

function mergeAdjacentText(segs) {
  const result = [];
  for (const seg of segs) {
    if (seg.type === "text" && result.length > 0 && result[result.length - 1].type === "text") {
      result[result.length - 1] = { type: "text", text: result[result.length - 1].text + seg.text };
    } else {
      result.push({ ...seg });
    }
  }
  return result;
}

const SLIDE_TYPES = [
  { id: "text", label: "Texte", icon: "FileText", desc: "Contenu texte riche" },
  { id: "image", label: "Image / Vidéo", icon: "ImageIcon", desc: "Image ou vidéo avec description" },
  { id: "quiz", label: "Quiz QCM", icon: "HelpCircle", desc: "Question à choix multiples" },
  { id: "flip", label: "Carte à retourner", icon: "Flip", desc: "Recto image/titre, verso texte" },
  { id: "code", label: "Code", icon: "Terminal", desc: "Bloc de code interactif" },
  { id: "separator", label: "Séparateur", icon: "MinusIcon", desc: "Séparation visuelle" },
  { id: "fillblank", label: "Texte à trous", icon: "PencilLine", desc: "Compléter les mots manquants" },
  { id: "truefalse", label: "Vrai ou Faux", icon: "ScaleIcon", desc: "Question vrai ou faux" },
  { id: "reveal", label: "Révélation", icon: "Sparkles", desc: "Image qui glisse et révèle un texte" },
];

const DEFAULT_COURSE = {
  title: "Ma Formation",
  description: "Description de la formation",
  modules: [
    {
      id: uid(),
      title: "Module 1 : Introduction",
      slides: [
        { id: uid(), type: "separator", title: "Bienvenue dans la formation", content: "Découvrez les bases et préparez-vous à apprendre" },
        { id: uid(), type: "text", title: "Présentation", content: "Bienvenue dans cette formation ! Vous allez apprendre les fondamentaux étape par étape.\n\nChaque module contient des leçons, des cartes interactives et des quiz pour valider vos connaissances." },
        { id: uid(), type: "flip", title: "Concept clé #1", frontImage: "", backText: "Ceci est l'explication détaillée du concept. Vous pouvez ajouter autant de texte que nécessaire pour bien comprendre.", backImage: "" },
        { id: uid(), type: "quiz", title: "Quiz de bienvenue", question: "Êtes-vous prêt à commencer cette formation ?", options: ["Oui, allons-y !", "Je suis super motivé !", "Absolument !"], correct: 0 },
      ],
    },
    {
      id: uid(),
      title: "Module 2 : Approfondissement",
      slides: [
        { id: uid(), type: "text", title: "Aller plus loin", content: "Dans ce module, nous allons approfondir les concepts vus précédemment." },
      ],
    },
  ],
};

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  ArrowUp: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Award: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Flip: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  // — types de slides
  FileText: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  ImageIcon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  HelpCircle: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Terminal: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  MinusIcon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  PencilLine: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  ScaleIcon: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M6 21h12"/><path d="M3 6l9-3 9 3"/><path d="M3 6l4.5 9a4.5 4.5 0 0 0 9 0L21 6"/></svg>,
  Sparkles: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3v3"/><path d="M3.5 4.5h3"/><path d="M19 18v3"/><path d="M17.5 19.5h3"/></svg>,
  // — actions
  X: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  FolderOpen: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  CheckCircle: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  ChevronLeft: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  AlertTriangle: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  InfoIcon: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  RotateCcw: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Play: ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Square: ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  GraduationCap: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  ScrollText: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 3H4.5"/><path d="M15 8h-5"/><path d="M15 12h-5"/></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   AUTO RESIZE TEXTAREA
   ═══════════════════════════════════════════════════════════════ */

function AutoTextarea({ value, onChange, placeholder, style, minHeight, tabEnabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = Math.max(minHeight || 0, ref.current.scrollHeight) + "px";
  }, [value, minHeight]);

  const handleKeyDown = !tabEnabled ? undefined : (e) => {
    const ta = ref.current;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const val   = value || "";

    if (e.key === "Tab") {
      e.preventDefault();
      const indent = "    ";
      const newValue = val.slice(0, start) + indent + val.slice(end);
      onChange({ target: { value: newValue } });
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + indent.length; });
    } else if (e.key === "Backspace" && start === end) {
      // Supprime le tab entier si le curseur est précédé d'espaces multiples de 4
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const beforeCursor = val.slice(lineStart, start);
      if (beforeCursor.length > 0 && /^ +$/.test(beforeCursor)) {
        e.preventDefault();
        const deleteCount = beforeCursor.length % 4 === 0 ? 4 : beforeCursor.length % 4;
        const newValue = val.slice(0, start - deleteCount) + val.slice(start);
        onChange({ target: { value: newValue } });
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start - deleteCount; });
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Récupère l'indentation de la ligne courante
      const lineStart = val.lastIndexOf("\n", start - 1) + 1;
      const line = val.slice(lineStart, start);
      const indent = line.match(/^(\s*)/)[1];
      const insertion = "\n" + indent;
      const newValue = val.slice(0, start) + insertion + val.slice(end);
      onChange({ target: { value: newValue } });
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + insertion.length; });
    }
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value || ""}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      style={{ ...style, resize: "none", overflow: "hidden" }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILE URL INPUT (URL manuelle ou import depuis le PC)
   ═══════════════════════════════════════════════════════════════ */

function FileUrlInput({ value, onChange, accept, placeholder }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        style={{ ...S.input, flex: 1 }}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "https://..."}
      />
      <input type="file" accept={accept} ref={fileRef} style={{ display: "none" }} onChange={handleFile} />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          title="Effacer"
          style={{ width: 38, height: 38, borderRadius: "50%", background: "#1a0a0a", border: "1.5px solid #ef4444", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0, transition: "background 0.15s, transform 0.15s", alignSelf: "center" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ef444433"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1a0a0a"; e.currentTarget.style.transform = "scale(1)"; }}
        ><Icons.X size={14} /></button>
      )}
      <button
        type="button"
        onClick={() => fileRef.current.click()}
        style={{ ...S.btnSec, whiteSpace: "nowrap", flexShrink: 0, padding: "10px 14px" }}
      >
        <Icons.FolderOpen size={14} /> Importer
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SLIDE EDITORS
   ═══════════════════════════════════════════════════════════════ */

function TextSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre de la slide</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre..." />
      <label style={S.label}>Contenu</label>
      <AutoTextarea style={{ ...S.input, lineHeight: 1.7 }} minHeight={200} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} placeholder="Écrivez votre contenu ici..." />
    </div>
  );
}

function ImageSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Image ou Vidéo</label>
      <FileUrlInput value={slide.imageUrl} onChange={v => onChange({ ...slide, imageUrl: v })} accept="image/*,video/*" placeholder="https://..." />
      <label style={S.label}>Description</label>
      <AutoTextarea style={S.input} minHeight={100} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

function FlipCardEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#7c3aed10", border: "1px solid #7c3aed33", borderRadius: 12, padding: 14 }}>
        <p style={{ color: "#a78bfa", fontSize: 13, margin: 0 }}>🔄 Carte à retourner — Recto : titre + image · Verso : texte explicatif + image optionnelle</p>
      </div>
      <div style={{ background: "#7c3aed0d", border: "1px solid #7c3aed33", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, textTransform: "uppercase" }}>Recto</span>
        <label style={S.label}>Titre</label>
        <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre visible sur le recto..." />
        <label style={S.label}>Image (optionnel)</label>
        <FileUrlInput value={slide.frontImage} onChange={v => onChange({ ...slide, frontImage: v })} accept="image/*" placeholder="https://..." />
        <label style={S.label}>Description (optionnel)</label>
        <AutoTextarea style={S.input} minHeight={80} value={slide.frontContent || ""} onChange={e => onChange({ ...slide, frontContent: e.target.value })} placeholder="Texte au recto..." />
      </div>
      <div style={{ background: "#3b82f60d", border: "1px solid #3b82f633", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", letterSpacing: 1, textTransform: "uppercase" }}>Verso</span>
        <label style={S.label}>Titre (optionnel)</label>
        <AutoTextarea style={S.input} value={slide.backTitle || ""} onChange={e => onChange({ ...slide, backTitle: e.target.value })} placeholder="Titre au verso..." />
        <label style={S.label}>Image (optionnel)</label>
        <FileUrlInput value={slide.backImage} onChange={v => onChange({ ...slide, backImage: v })} accept="image/*" placeholder="https://..." />
        <label style={S.label}>Texte explicatif</label>
        <AutoTextarea style={S.input} minHeight={120} value={slide.backText || ""} onChange={e => onChange({ ...slide, backText: e.target.value })} placeholder="Explication détaillée au verso..." />
      </div>
    </div>
  );
}

function QuizSlideEditor({ slide, onChange }) {
  const options = slide.options || ["", ""];
  const correct = Array.isArray(slide.correct) ? slide.correct : [slide.correct ?? 0];
  const toggleCorrect = (i) => {
    if (!slide.multiAnswer) {
      onChange({ ...slide, correct: [i] });
    } else {
      const next = correct.includes(i) ? correct.filter(x => x !== i) : [...correct, i];
      onChange({ ...slide, correct: next.length ? next : [i] });
    }
  };
  const addOption = () => onChange({ ...slide, options: [...options, ""] });
  const removeOption = (i) => {
    const n = options.filter((_, idx) => idx !== i);
    const nextCorrect = correct.filter(x => x !== i).map(x => x > i ? x - 1 : x);
    onChange({ ...slide, options: n, correct: nextCorrect.length ? nextCorrect : [0] });
  };
  const updateOption = (i, val) => { const n = [...options]; n[i] = val; onChange({ ...slide, options: n }); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre du quiz</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Image (optionnel)</label>
      <FileUrlInput value={slide.questionImage} onChange={v => onChange({ ...slide, questionImage: v })} accept="image/*" placeholder="https://..." />
      <label style={S.label}>Question</label>
      <AutoTextarea style={S.input} minHeight={80} value={slide.question || ""} onChange={e => onChange({ ...slide, question: e.target.value })} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 16px" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Plusieurs réponses</span>
          {slide.multiAnswer && <span style={{ fontSize: 12, color: "#7c3aed99", marginLeft: 10 }}>({correct.length} réponse{correct.length > 1 ? "s" : ""} attendue{correct.length > 1 ? "s" : ""})</span>}
        </div>
        <div onClick={() => onChange({ ...slide, multiAnswer: !slide.multiAnswer })} style={{ width: 44, height: 24, borderRadius: 12, background: slide.multiAnswer ? "#7c3aed" : "#2a2a3e", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: slide.multiAnswer ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      <label style={S.label}>Réponses</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => toggleCorrect(i)} style={{ width: 32, height: 32, borderRadius: 8, border: correct.includes(i) ? "2px solid #22c55e" : "2px solid #2a2a3e", background: correct.includes(i) ? "#22c55e" : "#1e1e2e", color: correct.includes(i) ? "#fff" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {correct.includes(i) && <Icons.Check />}
          </button>
          <AutoTextarea style={{ ...S.input, flex: 1 }} value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Réponse ${i + 1}`} />
          {options.length > 2 && <button onClick={() => removeOption(i)} style={{ ...S.btnIcon, color: "#ef4444" }}><Icons.Trash /></button>}
        </div>
      ))}
      <button onClick={addOption} style={{ ...S.btnSec, alignSelf: "flex-start" }}><Icons.Plus /> Ajouter une réponse</button>
      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Cochez toutes les bonnes réponses</p>
      <label style={S.label}>Message si mauvaise réponse</label>
      <AutoTextarea style={S.input} value={slide.wrongMessage || ""} onChange={e => onChange({ ...slide, wrongMessage: e.target.value })} placeholder="Mauvaise réponse." />
    </div>
  );
}


const CODE_LANGUAGES = [
  "Bash", "C", "C#", "C++", "CSS", "Go", "HTML", "Java",
  "JavaScript", "JSON", "Kotlin", "Lua", "PHP", "Python",
  "Ruby", "Rust", "SQL", "Swift", "TypeScript", "XML", "YAML",
];

function CodeSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Langage</label>
      <select
        value={slide.language || ""}
        onChange={e => onChange({ ...slide, language: e.target.value })}
        style={{ ...S.input, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
      >
        <option value="">— Choisir un langage —</option>
        {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#12121e", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 16px" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Modification autorisée</span>
          <span style={{ fontSize: 12, color: "#475569", marginLeft: 10 }}>L'apprenant peut éditer le code</span>
        </div>
        <div onClick={() => onChange({ ...slide, editable: !slide.editable })} style={{ width: 44, height: 24, borderRadius: 12, background: slide.editable ? "#7c3aed" : "#2a2a3e", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: slide.editable ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      <label style={S.label}>Code {(slide.language || "").toLowerCase() === "css" ? "CSS" : ""}</label>
      <AutoTextarea tabEnabled style={{ ...S.input, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} minHeight={180} value={slide.code || ""} onChange={e => onChange({ ...slide, code: e.target.value })} />
      {(slide.language || "").toLowerCase() === "css" && (
        <>
          <label style={S.label}>HTML à styliser</label>
          <div style={{ background: "#7c3aed10", border: "1px solid #7c3aed33", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ color: "#a78bfa", fontSize: 12, margin: 0 }}>Ce HTML sera affiché dans l'aperçu avec votre CSS appliqué dessus. Laissez vide pour utiliser des éléments de démonstration par défaut.</p>
          </div>
          <AutoTextarea tabEnabled style={{ ...S.input, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} minHeight={120} value={slide.htmlContext || ""} onChange={e => onChange({ ...slide, htmlContext: e.target.value })} placeholder={"<h1>Mon titre</h1>\n<p>Mon paragraphe</p>"} />
        </>
      )}
      <label style={S.label}>Explication</label>
      <AutoTextarea style={S.input} minHeight={80} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

function SeparatorSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre de section</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Sous-titre</label>
      <AutoTextarea style={S.input} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

function RevealSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#7c3aed10", border: "1px solid #7c3aed33", borderRadius: 12, padding: 14 }}>
        <p style={{ color: "#a78bfa", fontSize: 13, margin: 0 }}>🎭 Au départ : texte à gauche + image à droite. Au clic : l'image glisse à gauche et révèle le texte caché à droite.</p>
      </div>
      <label style={S.label}>Titre</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre..." />
      <label style={S.label}>Texte gauche (visible au départ)</label>
      <AutoTextarea style={S.input} minHeight={100} value={slide.leftText || ""} onChange={e => onChange({ ...slide, leftText: e.target.value })} placeholder="Texte visible à gauche..." />
      <label style={S.label}>Image</label>
      <FileUrlInput value={slide.imageUrl} onChange={v => onChange({ ...slide, imageUrl: v })} accept="image/*" placeholder="https://..." />
      <label style={S.label}>Texte révélé (droite)</label>
      <AutoTextarea style={S.input} minHeight={100} value={slide.rightText || ""} onChange={e => onChange({ ...slide, rightText: e.target.value })} placeholder="Texte révélé après le glissement..." />
    </div>
  );
}

function TrueFalseSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre</label>
      <AutoTextarea style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre..." />
      <label style={S.label}>Image (optionnel)</label>
      <FileUrlInput value={slide.questionImage} onChange={v => onChange({ ...slide, questionImage: v })} accept="image/*" placeholder="https://..." />
      <label style={S.label}>Question</label>
      <AutoTextarea style={S.input} minHeight={80} value={slide.question || ""} onChange={e => onChange({ ...slide, question: e.target.value })} placeholder="Énoncé de la question..." />
      <label style={S.label}>Bonne réponse</label>
      <div style={{ display: "flex", gap: 10 }}>
        {[true, false].map(val => (
          <button key={String(val)} onClick={() => onChange({ ...slide, correct: val })} style={{ flex: 1, padding: "12px", borderRadius: 10, border: slide.correct === val ? `2px solid ${val ? "#22c55e" : "#ef4444"}` : "2px solid #2a2a3e", background: slide.correct === val ? (val ? "#22c55e18" : "#ef444418") : "#1e1e2e", color: slide.correct === val ? (val ? "#4ade80" : "#f87171") : "#64748b", cursor: "pointer", fontWeight: 600, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{val ? <Icons.Check /> : <Icons.X size={16} />}{val ? "Vrai" : "Faux"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HighlightTextarea({ value, onChange, highlightWords, style, minHeight, placeholder }) {
  const textareaRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    const h = Math.max(minHeight || 0, textareaRef.current.scrollHeight) + "px";
    textareaRef.current.style.height = h;
    if (backdropRef.current) backdropRef.current.style.height = h;
  }, [value, minHeight]);

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current)
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  const buildHtml = () => {
    let text = (value || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const words = [...(highlightWords || [])].sort((a, b) => b.length - a.length);
    for (const word of words) {
      const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(
        new RegExp(esc, "g"),
        `<mark style="background:#7c3aed55;color:transparent;border-radius:3px">$&</mark>`
      );
    }
    return text.replace(/\n/g, "<br>") + "<br>";
  };

  const shared = { fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.8, padding: "12px 14px", boxSizing: "border-box", whiteSpace: "pre-wrap", wordWrap: "break-word", width: "100%", borderRadius: 10 };

  return (
    <div style={{ position: "relative" }}>
      <div ref={backdropRef} style={{ ...shared, position: "absolute", top: 0, left: 0, right: 0, background: "#0c0c14", border: "2px solid transparent", color: "transparent", pointerEvents: "none", overflow: "hidden", zIndex: 0 }} dangerouslySetInnerHTML={{ __html: buildHtml() }} />
      <textarea ref={textareaRef} rows={1} value={value || ""} onChange={onChange} onScroll={handleScroll} placeholder={placeholder} style={{ ...shared, ...style, position: "relative", background: "transparent", color: "#e2e8f0", caretColor: "#e2e8f0", zIndex: 1, resize: "none", overflow: "hidden", display: "block", outline: "none" }} />
    </div>
  );
}

function FillBlankSlideEditor({ slide, onChange }) {
  const segments = slide.segments && slide.segments.length > 0
    ? slide.segments
    : [{ type: "text", text: "" }];

  const plainText = segments.map(s => s.type === "text" ? s.text : s.word).join("");
  const [editingText, setEditingText] = useState(false);
  const [draftText, setDraftText] = useState(plainText);

  const hasBlanks = segments.some(s => s.type === "blank");

  const applyText = () => {
    const existingBlanks = segments.filter(s => s.type === "blank");
    let newSegments = [{ type: "text", text: draftText }];
    for (const blank of existingBlanks) {
      let found = false;
      const updated = [];
      for (const seg of newSegments) {
        if (seg.type !== "text" || found) { updated.push(seg); continue; }
        const idx = seg.text.indexOf(blank.word);
        if (idx === -1) { updated.push(seg); continue; }
        found = true;
        const before = seg.text.slice(0, idx);
        const after = seg.text.slice(idx + blank.word.length);
        if (before) updated.push({ type: "text", text: before });
        updated.push({ ...blank });
        if (after) updated.push({ type: "text", text: after });
      }
      if (found) newSegments = updated;
    }
    onChange({ ...slide, segments: mergeAdjacentText(newSegments) });
    setEditingText(false);
  };

  const makeBlank = (segIdx, word, before, after) => {
    const newSegs = [];
    if (before) newSegs.push({ type: "text", text: before });
    newSegs.push({ type: "blank", id: uid(), word, alternatives: [word] });
    if (after) newSegs.push({ type: "text", text: after });
    const updated = [...segments];
    updated.splice(segIdx, 1, ...newSegs);
    onChange({ ...slide, segments: mergeAdjacentText(updated) });
  };

  const removeBlank = (blankId) => {
    const updated = segments.map(s =>
      s.type === "blank" && s.id === blankId ? { type: "text", text: s.word } : s
    );
    onChange({ ...slide, segments: mergeAdjacentText(updated) });
  };

  const updateAlternatives = (blankId, alts) => {
    onChange({
      ...slide,
      segments: segments.map(s => s.type === "blank" && s.id === blankId ? { ...s, alternatives: alts } : s),
    });
  };

  const blanks = segments.filter(s => s.type === "blank");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={S.label}>Titre de la slide</label>
        <AutoTextarea style={{ ...S.input, marginTop: 8 }} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre..." />
      </div>

      {editingText || !hasBlanks && !plainText ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={S.label}>Texte</label>
          <HighlightTextarea
            style={{ border: "2px solid #2a2a3e" }}
            minHeight={160}
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            highlightWords={blanks.map(b => b.word)}
            placeholder="Écrivez votre texte ici..."
          />
          <button onClick={applyText} style={{ ...S.btnPri, alignSelf: "flex-start" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Confirmer <Icons.ChevronRight size={13} /> marquer les trous</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#7c3aed10", border: "1px solid #7c3aed33", borderRadius: 12, padding: 14 }}>
            <p style={{ color: "#a78bfa", fontSize: 13, margin: 0 }}>
              <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><Icons.PencilLine size={13} /></span><strong>Cliquez</strong> sur un mot pour le transformer en trou · Cliquez sur un trou (violet) pour l'enlever
            </p>
          </div>

          <div style={{ background: "#0c0c14", border: "2px solid #1e1e2e", borderRadius: 12, padding: "18px 20px", fontSize: 16, lineHeight: 2.4, color: "#e2e8f0", userSelect: "none" }}>
            {segments.map((seg, si) => {
              if (seg.type === "blank") {
                return (
                  <span
                    key={seg.id}
                    onClick={() => removeBlank(seg.id)}
                    title="Cliquer pour enlever le trou"
                    style={{ display: "inline-block", background: "#7c3aed33", border: "2px solid #7c3aed66", color: "#c4b5fd", borderRadius: 8, padding: "1px 10px", margin: "0 2px", cursor: "pointer", fontWeight: 600 }}
                  >
                    {seg.word}
                  </span>
                );
              }
              let charPos = 0;
              const tokens = seg.text.match(/(\s+|\S+)/g) || [];
              return tokens.map((token, ti) => {
                const start = charPos;
                charPos += token.length;
                if (/^\s+$/.test(token)) return <span key={`${si}-${ti}`}>{token}</span>;
                const before = seg.text.slice(0, start);
                const after = seg.text.slice(start + token.length);
                return (
                  <span
                    key={`${si}-${ti}`}
                    onClick={() => makeBlank(si, token, before, after)}
                    title="Cliquer pour créer un trou"
                    style={{ borderRadius: 4, padding: "2px 1px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#7c3aed22"; e.currentTarget.style.color = "#c4b5fd"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e2e8f0"; }}
                  >
                    {token}
                  </span>
                );
              });
            })}
          </div>

          <button
            onClick={() => { setDraftText(plainText); setEditingText(true); }}
            style={{ ...S.btnSec, alignSelf: "flex-start", fontSize: 12 }}
          >
            ✎ Modifier le texte
          </button>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Désactivez la traduction automatique du navigateur pour éviter tout comportement inattendu.</p>

          {blanks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
              <label style={S.label}>Réponses acceptées par trou</label>
              {blanks.map((blank) => (
                <div key={blank.id} style={{ background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 10px" }}>
                    Trou : <strong style={{ color: "#c4b5fd" }}>"{blank.word}"</strong>
                    <span style={{ color: "#475569", fontSize: 12, marginLeft: 8 }}>insensible à la casse</span>
                  </p>
                  {blank.alternatives.map((alt, ai) => (
                    <div key={ai} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <AutoTextarea
                          style={{ ...S.input, flex: 1 }}
                          value={alt}
                          onChange={e => {
                            const alts = [...blank.alternatives];
                            alts[ai] = e.target.value;
                            updateAlternatives(blank.id, alts);
                          }}
                          placeholder="Réponse acceptée..."
                        />
                      {blank.alternatives.length > 1 && (
                        <button
                          onClick={() => updateAlternatives(blank.id, blank.alternatives.filter((_, i) => i !== ai))}
                          style={{ ...S.btnIcon, color: "#ef4444" }}
                        >
                          <Icons.Trash />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => updateAlternatives(blank.id, [...blank.alternatives, ""])}
                    style={{ ...S.btnSec, fontSize: 12, padding: "6px 12px" }}
                  >
                    <Icons.Plus /> Ajouter une réponse alternative
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREVIEW COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FlipCard({ slide, flipped, onFlip }) {
  const faceStyle = (bg, border) => ({
    position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
    background: bg, borderRadius: 18, border,
    display: "flex", flexDirection: "column", padding: "16px 24px 16px", gap: 10, overflow: "hidden",
  });
  return (
    <div onClick={onFlip} style={{ perspective: 1200, cursor: "pointer", margin: "8px 0" }}>
      <div style={{
        position: "relative", width: "100%", height: 340,
        transition: "transform 0.65s cubic-bezier(.4,.2,.2,1)",
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
      }}>
        {/* Front */}
        <div style={faceStyle("linear-gradient(135deg, #1a1030, #12121e)", "2px solid #7c3aed33")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{slide.title || "Titre de la carte"}</h3>
            <span style={{ fontSize: 11, color: "#7c3aed99", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 10 }}><Icons.Flip /> Retourner</span>
          </div>
          {slide.frontImage && (
            <div style={{ flex: 1, minHeight: 0, borderRadius: 12, overflow: "hidden" }}>
              <img src={slide.frontImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
          )}
          {slide.frontContent && (
            <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0, flexShrink: 0 }}>{slide.frontContent}</p>
          )}
          {!slide.frontImage && !slide.frontContent && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.3 }}>🔄</div>
          )}
        </div>
        {/* Back */}
        <div style={{ ...faceStyle("linear-gradient(135deg, #0f1a2e, #12121e)", "2px solid #3b82f633"), transform: "rotateY(180deg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{slide.backTitle || ""}</h3>
            <span style={{ fontSize: 11, color: "#3b82f699", display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 10 }}><Icons.Flip /> Retourner</span>
          </div>
          {slide.backImage && (
            <div style={{ flex: 1, minHeight: 0, borderRadius: 12, overflow: "hidden" }}>
              <img src={slide.backImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
            </div>
          )}
          {slide.backText && (
            <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0, flexShrink: 0 }}>{slide.backText}</p>
          )}
          {!slide.backImage && !slide.backText && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>Verso vide</div>
          )}
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Icons.Check /> Carte consultée</span>
        </div>
      </div>
    </div>
  );
}

function FillBlankPreview({ slide }) {
  const segments = slide.segments || [];
  const blanks = segments.filter(s => s.type === "blank");
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const isBlankCorrect = (blank) => {
    const answer = (answers[blank.id] || "").trim().toLowerCase();
    return blank.alternatives.some(alt => alt.toLowerCase() === answer);
  };

  const allCorrect = blanks.length > 0 && blanks.every(isBlankCorrect);
  const score = blanks.length > 0 ? blanks.filter(isBlankCorrect).length : 0;

  return (
    <div style={S.pCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ background: "#7c3aed22", color: "#a78bfa", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>TEXTE À TROUS</span>
        <h2 style={{ ...S.pTitle, margin: 0 }}>{slide.title}</h2>
      </div>
      <div style={{ fontSize: 16, lineHeight: 2.6, color: "#e2e8f0" }}>
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.text}</span>;
          const answer = answers[seg.id] || "";
          const correct = checked && isBlankCorrect(seg);
          const wrong = checked && !correct;
          return (
            <span key={seg.id} style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", margin: "0 3px" }}>
              <input
                value={answer}
                onChange={e => { if (!checked) setAnswers(p => ({ ...p, [seg.id]: e.target.value })); }}
                style={{
                  width: Math.max(80, seg.word.length * 12 + 20),
                  background: correct ? "#22c55e14" : wrong ? "#ef444414" : "#0c0c14",
                  border: `2px solid ${correct ? "#22c55e88" : wrong ? "#ef444488" : "#7c3aed55"}`,
                  borderRadius: 8,
                  color: correct ? "#4ade80" : wrong ? "#f87171" : "#e2e8f0",
                  padding: "3px 10px",
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "center",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                placeholder="..."
              />
              {wrong && <span style={{ fontSize: 12, color: "#22c55e", marginLeft: 5, fontWeight: 600 }}>({seg.word})</span>}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={blanks.length === 0}
            style={{ ...S.btnPri, opacity: blanks.length === 0 ? 0.4 : 1 }}
          >
            Vérifier les réponses
          </button>
        ) : (
          <>
            <div style={{
              padding: "10px 16px", borderRadius: 10,
              background: allCorrect ? "#22c55e10" : "#ef444410",
              color: allCorrect ? "#4ade80" : "#f87171",
              fontSize: 14, fontWeight: 500,
            }}>
              <span className={allCorrect ? "lf-icon-success" : "lf-icon-error"} style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}>
                {allCorrect ? <Icons.CheckCircle size={16} /> : <Icons.XCircle size={16} />}
              </span>
              {allCorrect
                ? "Parfait ! Toutes les réponses sont correctes."
                : `${score} / ${blanks.length} correcte${score > 1 ? "s" : ""}`}
            </div>
            <button onClick={() => { setAnswers({}); setChecked(false); }} style={S.btnSec}>
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RevealPreview({ slide }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={S.pCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ background: "#7c3aed22", color: "#a78bfa", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>RÉVÉLATION</span>
        <h2 style={{ ...S.pTitle, margin: 0 }}>{slide.title}</h2>
      </div>

      <div style={{ position: "relative", overflow: "hidden", borderRadius: 14, height: 300, background: "#0a0a14", cursor: "pointer" }} onClick={() => setRevealed(r => !r)}>

        {/* Texte gauche — toujours présent, l'image coulisse dessus */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", display: "flex", alignItems: "center", padding: "0 28px", zIndex: 1 }}>
          <p style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{slide.leftText || "…"}</p>
        </div>

        {/* Texte droite — révélé quand l'image part */}
        <div style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", display: "flex", alignItems: "center", padding: "0 28px", zIndex: 1, opacity: revealed ? 1 : 0, transition: revealed ? "opacity 0.5s ease 0.35s" : "opacity 0.15s ease 0s" }}>
          <p style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{slide.rightText || "…"}</p>
        </div>

        {/* Image — part vers la gauche au clic */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", zIndex: 2, transform: revealed ? "translateX(-100%)" : "translateX(0%)", transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)" }}>
          {slide.imageUrl
            ? <img src={slide.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
            : <div style={{ width: "100%", height: "100%", background: "#1e1e2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>Image</div>
          }
        </div>

      </div>

      {/* Hint en dessous de la zone */}
      <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "#7c3aed99" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {revealed
            ? <><Icons.ChevronLeft size={12} /> Cliquez pour refermer</>
            : <>Cliquez pour révéler <Icons.ChevronRight size={12} /></>}
        </span>
      </div>
    </div>
  );
}

function TrueFalsePreview({ slide, onAnswer, answered }) {
  const show = answered !== undefined;
  return (
    <div style={S.pCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ background: "#7c3aed22", color: "#a78bfa", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>VRAI OU FAUX</span>
        <h2 style={{ ...S.pTitle, margin: 0 }}>{slide.title}</h2>
      </div>
      {slide.questionImage && (
        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, background: "#0a0a14", display: "flex", justifyContent: "center" }}>
          <img src={slide.questionImage} alt="" style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}
      <p style={{ fontSize: 17, color: "#e2e8f0", marginBottom: 28, lineHeight: 1.6, fontWeight: 500 }}>{slide.question}</p>
      <div style={{ display: "flex", gap: 16 }}>
        {[true, false].map(val => {
          const isCorrect = val === slide.correct;
          const wasSelected = answered === val;
          let bg = "#0c0c14", border = "2px solid #1e1e2e", color = "#e2e8f0";
          if (show && isCorrect)              { bg = "#22c55e14"; border = "2px solid #22c55e55"; color = "#4ade80"; }
          else if (show && wasSelected)       { bg = "#ef444414"; border = "2px solid #ef444455"; color = "#f87171"; }
          return (
            <button key={String(val)} onClick={() => !show && onAnswer(val)} style={{ flex: 1, padding: "28px 16px", borderRadius: 14, border, background: bg, color, cursor: show ? "default" : "pointer", fontSize: 22, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
              <span style={{ display: "flex" }}>{val ? <Icons.Check /> : <Icons.X size={16} />}</span>
              {val ? "Vrai" : "Faux"}
            </button>
          );
        })}
      </div>
      {show && (
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: answered === slide.correct ? "#22c55e10" : "#ef444410", color: answered === slide.correct ? "#4ade80" : "#f87171", fontSize: 14, fontWeight: 500 }}>
          <span className={answered === slide.correct ? "lf-icon-success" : "lf-icon-error"} style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}>
            {answered === slide.correct ? <Icons.CheckCircle size={16} /> : <Icons.XCircle size={16} />}
          </span>
          {answered === slide.correct ? "Bonne réponse !" : `Mauvaise réponse. La bonne réponse était : ${slide.correct ? "Vrai" : "Faux"}`}
        </div>
      )}
    </div>
  );
}

function QuizPreview({ slide, onAnswer, answered }) {
  const correct = Array.isArray(slide.correct) ? slide.correct : [slide.correct ?? 0];
  const multiAnswer = slide.multiAnswer || false;
  const [selected, setSelected] = useState(new Set());
  const [localAnswered, setLocalAnswered] = useState(undefined);
  const effectiveAnswered = localAnswered !== undefined ? localAnswered : answered;
  const submitted = effectiveAnswered !== undefined;
  const remaining = multiAnswer && !submitted ? Math.max(0, correct.length - selected.size) : 0;

  const toggle = (i) => {
    if (submitted) return;
    if (!multiAnswer) {
      setSelected(new Set([i]));
    } else {
      setSelected(prev => {
        const n = new Set(prev);
        if (n.has(i)) { n.delete(i); }
        else if (n.size < correct.length) { n.add(i); }
        return n;
      });
    }
  };

  const submit = () => {
    const ans = [...selected].sort((a, b) => a - b);
    setLocalAnswered(ans);
    onAnswer(ans);
  };

  const retry = () => { setSelected(new Set()); setLocalAnswered(undefined); onAnswer(undefined); };

  const isSelected = (i) => submitted ? (Array.isArray(effectiveAnswered) ? effectiveAnswered.includes(i) : effectiveAnswered === i) : selected.has(i);
  const isCorrect = (i) => correct.includes(i);
  const allCorrect = submitted && (() => {
    const ans = Array.isArray(effectiveAnswered) ? effectiveAnswered : [effectiveAnswered];
    return ans.length === correct.length && correct.every(i => ans.includes(i));
  })();

  return (
    <div style={S.pCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ background: "#7c3aed22", color: "#a78bfa", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>QUIZ</span>
        <h2 style={{ ...S.pTitle, margin: 0 }}>{slide.title}</h2>
      </div>
      {slide.questionImage && (
        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, background: "#0a0a14", display: "flex", justifyContent: "center" }}>
          <img src={slide.questionImage} alt="" style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}
      <p style={{ fontSize: 17, color: "#e2e8f0", marginBottom: multiAnswer ? 8 : 24, lineHeight: 1.6, fontWeight: 500 }}>{slide.question}</p>
      {multiAnswer && !submitted && (
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Plusieurs bonnes réponses — sélectionnez tout ce qui s'applique</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(slide.options || []).map((opt, i) => {
          const sel = isSelected(i), cor = isCorrect(i);
          let bg = "#0c0c14", bdr = "2px solid #1e1e2e", clr = "#e2e8f0";
          if (submitted && allCorrect && cor){ bg = "#22c55e14"; bdr = "2px solid #22c55e55"; clr = "#4ade80"; }
          else if (submitted && sel && !cor){ bg = "#ef444414"; bdr = "2px solid #ef444455"; clr = "#f87171"; }
          else if (!submitted && sel)       { bg = "#7c3aed18"; bdr = "2px solid #7c3aed55"; clr = "#c4b5fd"; }
          return (
            <button key={i} onClick={() => toggle(i)} style={{ background: bg, border: bdr, color: clr, padding: "14px 18px", borderRadius: 12, cursor: submitted ? "default" : "pointer", textAlign: "left", fontSize: 15, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: (submitted && allCorrect && cor) ? "#22c55e33" : (!submitted && sel) ? "#7c3aed33" : "#1a1a2e", border: !submitted ? (sel ? "2px solid #7c3aed" : "2px solid #2a2a3e") : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                {(submitted && allCorrect && cor) || (!submitted && sel) ? <Icons.Check /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button onClick={submit} disabled={selected.size === 0 || remaining > 0} style={{ ...S.btnPri, marginTop: 16, opacity: (selected.size === 0 || remaining > 0) ? 0.5 : 1 }}>
          {remaining > 0 ? `Vérifier (${remaining} restant${remaining > 1 ? "s" : ""})` : "Vérifier"}
        </button>
      ) : allCorrect ? (
        <div className="lf-msg-in" style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#22c55e10", color: "#4ade80", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="lf-icon-success" style={{ display: "flex" }}><Icons.CheckCircle size={16} /></span>
          Bonne réponse !
        </div>
      ) : (
        <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 10, background: "#ef444410", border: "1px solid #ef444422", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <span style={{ flex: 1, minWidth: 160, color: "#f87171", fontSize: 14, fontWeight: 500, lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span className="lf-icon-error" style={{ display: "flex", flexShrink: 0, marginTop: 2 }}><Icons.XCircle size={16} /></span>
            {slide.wrongMessage || "Mauvaise réponse."}
          </span>
          <button onClick={retry} style={{ ...S.btnSec, flexShrink: 0, marginLeft: "auto", fontSize: 13, border: "1px solid #ef444433", color: "#f87171", background: "#ef444410", display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.RotateCcw size={13} /> Réessayer
          </button>
        </div>
      )}
    </div>
  );
}

function ImageSlidePreview({ slide }) {
  const [ratio, setRatio] = useState(null);
  const url = slide.imageUrl || "";
  const isVideo = url.startsWith("data:video/") || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

  const onLoadImg = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) setRatio(naturalWidth / naturalHeight);
  };
  const onLoadVid = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoWidth && videoHeight) setRatio(videoWidth / videoHeight);
  };
  const portrait = ratio !== null && ratio < 0.85;

  return (
    <div style={S.pCard}>
      <h2 style={S.pTitle}>{slide.title}</h2>
      {url ? (
        <div style={{
          borderRadius: 12, overflow: "hidden", margin: "16px auto", background: "#0a0a14",
          display: "flex", justifyContent: "center", alignItems: "center",
          ...(portrait ? { width: "55%", maxWidth: 320 } : {}),
        }}>
          {isVideo ? (
            <video
              src={url}
              controls
              onLoadedMetadata={onLoadVid}
              style={{ width: "100%", maxHeight: portrait ? 580 : 400, display: "block" }}
            />
          ) : (
            <img
              src={url}
              alt={slide.title}
              onLoad={onLoadImg}
              style={{ width: "100%", maxHeight: portrait ? 580 : 400, objectFit: portrait ? "cover" : "contain", display: "block" }}
              onError={e => { e.target.style.display = "none"; }}
            />
          )}
        </div>
      ) : (
        <div style={{ height: 200, background: "#0a0a14", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 14, margin: "16px 0" }}>Aucun média</div>
      )}
      {slide.content && <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>{slide.content}</p>}
    </div>
  );
}

/* ─── Exécution sécurisée ──────────────────────────────────────
   JS/HTML → iframe sandbox="allow-scripts" (sans allow-same-origin)
             + CSP bloquant tout réseau
   Python  → Web Worker + Pyodide (WebAssembly)
             Timeout 10s, arrêt manuel
   ─────────────────────────────────────────────────────────── */

const EXEC_JS_LANGS   = ["javascript", "js", "jsx", "typescript", "ts", "tsx", "node"];
const EXEC_HTML_LANGS = ["html", "css"];

// HTML injecté dans l'iframe JS — le code utilisateur est envoyé
// via postMessage APRÈS le chargement (jamais embarqué dans le srcdoc).
// Cela évite tout risque d'injection via </script> dans le code.
const JS_IFRAME_HTML = [
  "<!DOCTYPE html><html>",
  "<head>",
  "<meta http-equiv=\"Content-Security-Policy\"",
  " content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';\">",
  "</head><body><script>(function(){",
  "function fmt(v){",
  "  if(v===null)return'null';",
  "  if(v===undefined)return'undefined';",
  "  if(typeof v==='object'){try{return JSON.stringify(v,null,2)}catch(e){return String(v)}}",
  "  return String(v)",
  "}",
  "function send(t,m){parent.postMessage({t:t,m:m},'*')}",
  "console.log   =function(){send('log',  [].slice.call(arguments).map(fmt).join(' '))};",
  "console.error =function(){send('error',[].slice.call(arguments).map(fmt).join(' '))};",
  "console.warn  =function(){send('warn', [].slice.call(arguments).map(fmt).join(' '))};",
  "console.info  =function(){send('info', [].slice.call(arguments).map(fmt).join(' '))};",
  "window.onerror=function(msg){send('error',String(msg));return true};",
  "window.addEventListener('unhandledrejection',function(e){",
  "  send('error',e.reason&&e.reason.message?e.reason.message:String(e.reason))",
  "});",
  "window.addEventListener('message',function(e){",
  "  if(!e.data||e.data.type!=='run')return;",
  "  try{",
  "    var r=(function(){return eval(e.data.code)})();",
  "    if(r!==undefined)send('return',String(r))",
  "  }catch(err){send('error',err.message)}",
  "  send('done','')",
  "});",
  "send('ready','')",
  "})()</sc"+"ript></body></html>",
].join("");

function CodeSlidePreview({ slide }) {
  const lang = (slide.language || "").toLowerCase().trim();
  const execMode = EXEC_JS_LANGS.includes(lang) ? "js"
    : EXEC_HTML_LANGS.includes(lang) ? "html"
    : lang === "python" ? "python"
    : null;

  const [logs, setLogs]           = useState([]);
  const [running, setRunning]     = useState(false);
  const [hasRun, setHasRun]       = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);
  const [pyStatus, setPyStatus]   = useState("idle"); // idle | loading | ready
  const [userCode, setUserCode]   = useState(slide.code || "");

  const cleanupRef = useRef(null); // annule l'iframe JS en cours
  const workerRef  = useRef(null); // Web Worker Python
  const timerRef   = useRef(null); // timeout

  useEffect(() => () => {
    if (cleanupRef.current) cleanupRef.current();
    if (workerRef.current)  workerRef.current.terminate();
    if (timerRef.current)   clearTimeout(timerRef.current);
  }, []);

  const addLog = (log) => setLogs(prev => [...prev, log]);

  /* ── JS : iframe sandboxée ──────────────────────────────── */
  const runJS = () => {
    setRunning(true); setLogs([]); setHasRun(true);

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts"); // ← JAMAIS allow-same-origin
    iframe.style.cssText = "display:none;position:absolute;top:-9999px;left:-9999px";
    iframe.srcdoc = JS_IFRAME_HTML;
    document.body.appendChild(iframe);

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      clearTimeout(timerRef.current);
      window.removeEventListener("message", handler);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      setRunning(false);
      cleanupRef.current = null;
    };
    cleanupRef.current = cleanup;

    const handler = (e) => {
      if (e.source !== iframe.contentWindow) return; // filtre par référence de fenêtre
      const { t, m } = e.data || {};
      if (t === "ready") {
        // On envoie le code APRÈS chargement, jamais embarqué dans le srcdoc
        iframe.contentWindow.postMessage({ type: "run", code: userCode }, "*");
      } else if (t === "done") {
        cleanup();
      } else if (t) {
        addLog({ type: t, text: m });
      }
    };

    window.addEventListener("message", handler);
    timerRef.current = setTimeout(() => {
      addLog({ type: "error", text: "⏱ Timeout — exécution interrompue après 10 secondes" });
      cleanup();
    }, 10000);
  };

  /* ── HTML/CSS : iframe sandboxée visible ────────────────── */
  const runHTML = () => {
    setHasRun(true);
    const csp = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' data:; img-src data: blob:;";
    let content;
    if (lang === "css") {
      const body = slide.htmlContext
        ? slide.htmlContext
        : "<h1>Titre</h1><p>Paragraphe de démonstration.</p><button>Bouton</button><ul><li>Élément 1</li><li>Élément 2</li></ul>";
      content = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>body{font-family:sans-serif;margin:16px;color:#333}${userCode}</style></head><body>${body}</body></html>`;
    } else {
      content = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body style="font-family:sans-serif;margin:0;padding:16px;color:#333">${userCode}</body></html>`;
    }
    setHtmlContent(content);
  };

  /* ── Python : Web Worker + Pyodide (WASM) ───────────────── */
  const runPython = () => {
    setRunning(true); setLogs([]); setHasRun(true);

    // Recréer un worker propre à chaque exécution
    if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }

    const worker = new Worker("/pyodide-worker.js");
    workerRef.current = worker;
    setPyStatus("loading");

    worker.onmessage = (e) => {
      const { type, text } = e.data || {};
      if      (type === "ready")  { setPyStatus("ready"); }
      else if (type === "stdout") { addLog({ type: "log",   text }); }
      else if (type === "stderr") { addLog({ type: "error", text }); }
      else if (type === "error")  { addLog({ type: "error", text }); clearTimeout(timerRef.current); setRunning(false); }
      else if (type === "done")   { clearTimeout(timerRef.current); setPyStatus("ready"); setRunning(false); }
    };
    worker.onerror = (e) => {
      addLog({ type: "error", text: e.message || "Erreur Worker" });
      clearTimeout(timerRef.current); setRunning(false); setPyStatus("idle");
    };

    worker.postMessage({ code: userCode });

    timerRef.current = setTimeout(() => {
      worker.terminate(); workerRef.current = null;
      addLog({ type: "error", text: "⏱ Timeout — exécution interrompue après 10 secondes" });
      setPyStatus("idle"); setRunning(false);
    }, 10000);
  };

  /* ── Contrôles ──────────────────────────────────────────── */
  const run = () => {
    if (execMode === "js")     runJS();
    else if (execMode === "html")   runHTML();
    else if (execMode === "python") runPython();
  };

  const stop = () => {
    if (cleanupRef.current) cleanupRef.current();
    if (workerRef.current)  { workerRef.current.terminate(); workerRef.current = null; clearTimeout(timerRef.current); setRunning(false); setPyStatus("idle"); }
    addLog({ type: "warn", text: "Exécution arrêtée manuellement" });
  };

  const reset = () => { setLogs([]); setHasRun(false); setHtmlContent(null); };

  /* ── Helpers affichage ──────────────────────────────────── */
  const typeColor  = { error: "#f87171", warn: "#fbbf24", return: "#a78bfa", info: "#60a5fa" };
  const TypeIcon = ({ type }) => {
    if (type === "error")  return <Icons.X size={12} />;
    if (type === "warn")   return <Icons.AlertTriangle size={12} />;
    if (type === "return") return <Icons.ChevronLeft size={12} />;
    if (type === "info")   return <Icons.InfoIcon size={12} />;
    return <span style={{ fontSize: 10 }}>›</span>;
  };

  const showConsole = (execMode === "js" || execMode === "python") && hasRun;
  const showHtml    = execMode === "html" && hasRun && htmlContent;
  const showOutput  = showConsole || showHtml;

  return (
    <div style={S.pCard}>
      <h2 style={S.pTitle}>{slide.title}</h2>
      {slide.content && <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>{slide.content}</p>}

      <div style={{ borderRadius: 12, border: "1px solid #1e1e2e", overflow: "hidden" }}>

        {/* Barre titre */}
        <div style={{ background: "#0c0c18", padding: "9px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid #1e1e2e", gap: 8 }}>
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
          </div>
          {slide.language && (
            <span style={{ fontSize: 11, color: "#7c3aed", fontFamily: "'JetBrains Mono', monospace", marginLeft: 4, fontWeight: 600, textTransform: "uppercase" }}>
              {slide.language}
            </span>
          )}
        </div>

        {/* Code */}
        {slide.editable ? (
          <AutoTextarea
            tabEnabled
            value={userCode}
            onChange={e => setUserCode(e.target.value)}
            style={{ background: "#07070f", padding: "18px 20px", margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, borderBottom: "1px solid #1e1e2e", border: "none", borderBottom: "1px solid #1e1e2e", borderRadius: 0, width: "100%", caretColor: "#e2e8f0" }}
            minHeight={60}
          />
        ) : (
          <pre style={{ background: "#07070f", padding: "18px 20px", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, borderBottom: "1px solid #1e1e2e" }}>
            {slide.code || "// ..."}
          </pre>
        )}

        {/* Barre console/rendu + boutons */}
        {execMode && (
          <div style={{ background: "#0c0c18", padding: "6px 12px 6px 16px", borderBottom: showOutput ? "1px solid #1e1e2e" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>
                {execMode === "html" ? "rendu" : "console"}
              </span>
              {running && execMode === "python" && pyStatus === "loading" && (
                <span style={{ fontSize: 10, color: "#475569", fontStyle: "italic" }}>chargement Python (~10 Mo)…</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {slide.editable && userCode !== (slide.code || "") && (
                <button onClick={() => { setUserCode(slide.code || ""); setLogs([]); setHasRun(false); setHtmlContent(null); }} style={{ ...S.btnSec, padding: "3px 10px", fontSize: 11, color: "#f87171", border: "1px solid #ef444433", display: "inline-flex", alignItems: "center", gap: 5 }}><Icons.RotateCcw size={11} /> Réinitialiser</button>
              )}
              {hasRun && !running && (
                <button onClick={reset} style={{ ...S.btnSec, padding: "3px 10px", fontSize: 11 }}>Effacer</button>
              )}
              {running ? (
                <button onClick={stop} style={{ ...S.btnSec, padding: "3px 12px", fontSize: 11, color: "#ef4444", border: "1px solid #ef444433", display: "inline-flex", alignItems: "center", gap: 5 }}><Icons.Square size={10} /> Stop</button>
              ) : (
                <button onClick={run} style={{ ...S.btnPri, padding: "3px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}><Icons.Play size={10} /> Exécuter</button>
              )}
            </div>
          </div>
        )}

        {/* Rendu HTML/CSS */}
        {showHtml && (
          <iframe
            sandbox="allow-scripts"
            srcdoc={htmlContent}
            style={{ width: "100%", minHeight: 200, border: "none", background: "#fff", display: "block" }}
          />
        )}

        {/* Sortie console JS/Python */}
        {showConsole && (
          <div style={{ background: "#07070f", minHeight: 64, maxHeight: 240, overflow: "auto", padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.8 }}>
            {logs.length === 0 ? (
              <span style={{ color: "#1e2a3a" }}>{running ? "Exécution…" : "Aucune sortie"}</span>
            ) : (
              logs.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 8, color: typeColor[line.type] || "#e2e8f0", fontStyle: line.type === "return" ? "italic" : "normal" }}>
                  <span style={{ opacity: 0.5, userSelect: "none", flexShrink: 0, display: "flex", alignItems: "center" }}><TypeIcon type={line.type} /></span>
                  <pre style={{ margin: 0, fontFamily: "inherit", fontSize: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line.text}</pre>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function PreviewSlide({ slide, onAnswer, answered, flippedCards, onFlipCard }) {
  if (slide.type === "text") {
    return (
      <div style={S.pCard}>
        <h2 style={S.pTitle}>{slide.title}</h2>
        <div style={S.pContent}>
          {(slide.content || "").split("\n").map((line, i) => (
            <p key={i} style={{ margin: "0 0 12px 0", lineHeight: 1.8 }}>{line || "\u00A0"}</p>
          ))}
        </div>
      </div>
    );
  }
  if (slide.type === "image") {
    return <ImageSlidePreview slide={slide} />;
  }
  if (slide.type === "flip") {
    return <FlipCard slide={slide} flipped={!!flippedCards[slide.id]} onFlip={() => onFlipCard(slide.id)} />;
  }
  if (slide.type === "quiz") {
    return <QuizPreview slide={slide} onAnswer={onAnswer} answered={answered} />;
  }
  if (slide.type === "code") {
    return <CodeSlidePreview slide={slide} />;
  }
  if (slide.type === "fillblank") {
    return <FillBlankPreview slide={slide} />;
  }
  if (slide.type === "separator") {
    return (
      <div style={{ textAlign: "center", padding: "48px 40px" }}>
        <div style={{ width: 60, height: 3, background: "linear-gradient(90deg, #7c3aed, #3b82f6)", borderRadius: 4, margin: "0 auto 24px" }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: "0 0 12px" }}>{slide.title}</h1>
        {slide.content && <p style={{ color: "#64748b", fontSize: 16 }}>{slide.content}</p>}
      </div>
    );
  }
  if (slide.type === "truefalse") {
    return <TrueFalsePreview slide={slide} onAnswer={onAnswer} answered={answered} />;
  }
  if (slide.type === "reveal") {
    return <RevealPreview slide={slide} />;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   ADD SLIDE MODAL
   ═══════════════════════════════════════════════════════════════ */

function AddSlideModal({ onAdd, onClose }) {
  const getLayout = () => {
    const w = window.innerWidth;
    if (w < 480) return { cols: 1, width: "90vw" };
    if (w < 900) return { cols: 2, width: 520 };
    return { cols: 3, width: 760 };
  };
  const [layout, setLayout] = useState(getLayout);
  useEffect(() => {
    const update = () => setLayout(getLayout());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#16161e", borderRadius: 20, padding: 32, width: layout.width, maxWidth: "90vw", border: "1px solid #2a2a3e", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <h3 style={{ margin: "0 0 8px", color: "#f1f5f9", fontSize: 20, fontWeight: 700 }}>Ajouter un élément</h3>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Choisissez le type de contenu</p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, gridAutoRows: 96, gap: 10 }}>
          {SLIDE_TYPES.map(type => (
            <button key={type.id} onClick={() => { onAdd(type.id); onClose(); }} style={{ background: "#1e1e2e", border: "2px solid #2a2a3e", borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 4, height: "100%" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#7c3aed10"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.background = "#1e1e2e"; }}>
              <span style={{ display: "flex", color: "#a78bfa" }}>{(() => { const Ic = Icons[type.icon] || Icons.FileText; return <Ic size={22} />; })()}</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>{type.label}</span>
              <span style={{ color: "#64748b", fontSize: 12, fontFamily: "'DM Sans', sans-serif", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{type.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CERTIFICATE
   ═══════════════════════════════════════════════════════════════ */

function CertificatePreview({ courseName, studentName }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #1a1025 0%, #0f172a 50%, #0a1628 100%)", borderRadius: 20, padding: 48, textAlign: "center", border: "2px solid #7c3aed33", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #7c3aed15, transparent)" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, #3b82f615, transparent)" }} />
      <div style={{ color: "#7c3aed", marginBottom: 16 }}><Icons.Award /></div>
      <h2 style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", letterSpacing: 4, textTransform: "uppercase", margin: "0 0 16px" }}>Certificat de réussite</h2>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 12px" }}>Ce certificat est décerné à</p>
      <h1 style={{ fontSize: 28, color: "#f1f5f9", fontWeight: 700, margin: "0 0 16px", fontStyle: "italic" }}>{studentName || "Nom"}</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px" }}>Pour avoir complété avec succès</p>
      <h3 style={{ fontSize: 18, color: "#e2e8f0", fontWeight: 600, margin: "0 0 24px" }}>{courseName}</h3>
      <div style={{ width: 80, height: 2, background: "linear-gradient(90deg, #7c3aed, #3b82f6)", margin: "0 auto 16px", borderRadius: 4 }} />
      <p style={{ color: "#475569", fontSize: 12 }}>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */

export default function CourseBuilder() {
  const [course, setCourse] = useState(DEFAULT_COURSE);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [mode, setMode] = useState("edit");
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [expandedModules, setExpandedModules] = useState({ 0: true });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // Live panel state (edit mode)
  const [liveFlips, setLiveFlips] = useState({});
  const [liveAnswers, setLiveAnswers] = useState({});

  // Preview state
  const [previewModuleIdx, setPreviewModuleIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [visitedFlips, setVisitedFlips] = useState(new Set()); // irréversible : IDs des cartes vues au moins une fois
  const [scrollPercents, setScrollPercents] = useState({});  // { moduleIdx: 0-1 }
  const scrollRef = useRef(null);
  const previewSlideRefs = useRef({});

  useEffect(() => {
    const el = previewSlideRefs.current[activeSlideIdx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSlideIdx, activeModuleIdx]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const activeModule = course.modules[activeModuleIdx];
  const activeSlide = activeModule?.slides?.[activeSlideIdx];
  const previewModule = course.modules[previewModuleIdx];

  /* ─── PROGRESS ──────────────────────────────────────────────
     Par module courant : scroll(40%) + flip cards vues(30%) + quiz corrects(30%)
  */
  const computeProgress = useCallback((moduleIdx = previewModuleIdx) => {
    const mod = course.modules[moduleIdx];
    if (!mod) return 0;

    let totalFlips = 0, doneFlips = 0;
    let totalQuizzes = 0, correctQuizzes = 0;

    mod.slides.forEach(slide => {
      if (slide.type === "flip") {
        totalFlips++;
        if (visitedFlips.has(slide.id)) doneFlips++;
      }
      if (slide.type === "quiz" || slide.type === "truefalse") {
        totalQuizzes++;
        const ans = quizAnswers[slide.id];
        if (ans !== undefined) {
          const correct = Array.isArray(slide.correct) ? slide.correct : [slide.correct ?? 0];
          const ansArr = Array.isArray(ans) ? ans : [ans];
          if (ansArr.length === correct.length && correct.every(i => ansArr.includes(i))) correctQuizzes++;
        }
      }
    });

    const scrollRatio = scrollPercents[moduleIdx] || 0;

    const hasInteractables = (totalFlips + totalQuizzes) > 0;
    let pct;
    if (!hasInteractables) {
      pct = scrollRatio * 100;
    } else {
      const flipRatio = totalFlips > 0 ? doneFlips / totalFlips : 1;
      const quizRatio = totalQuizzes > 0 ? correctQuizzes / totalQuizzes : 1;
      pct = (scrollRatio * 0.4 + flipRatio * 0.3 + quizRatio * 0.3) * 100;
    }
    return Math.min(100, Math.round(pct));
  }, [course, previewModuleIdx, quizAnswers, visitedFlips, scrollPercents]);

  const progress = computeProgress();

  // Track scroll per module
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollable = el.scrollHeight - el.clientHeight;
    const pct = scrollable <= 0 ? 1 : Math.min(1, el.scrollTop / scrollable);
    setScrollPercents(prev => {
      const old = prev[previewModuleIdx] || 0;
      // Only store max scroll reached
      if (pct > old) return { ...prev, [previewModuleIdx]: pct };
      return prev;
    });
  }, [previewModuleIdx]);

  useEffect(() => {
    if (mode === "preview" && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [previewModuleIdx, mode]);

  /* ─── COURSE MUTATIONS ──────────────────────────────────────── */
  const updateSlide = (newSlide) => {
    const c = { ...course, modules: [...course.modules] };
    c.modules[activeModuleIdx] = { ...activeModule, slides: [...activeModule.slides] };
    c.modules[activeModuleIdx].slides[activeSlideIdx] = newSlide;
    setCourse(c);
  };

  const addModule = () => {
    const m = { id: uid(), title: `Module ${course.modules.length + 1} : Nouveau module`, slides: [] };
    const c = { ...course, modules: [...course.modules, m] };
    setCourse(c);
    const idx = c.modules.length - 1;
    setActiveModuleIdx(idx);
    setActiveSlideIdx(0);
    setExpandedModules(p => ({ ...p, [idx]: true }));
    showToast("Module ajouté");
  };

  const addSlide = (type) => {
    const base = { id: uid(), type, title: "" };
    if (type === "quiz") { base.question = ""; base.options = ["", ""]; base.correct = [0]; base.multiAnswer = false; base.wrongMessage = ""; }
    if (type === "code") { base.code = ""; base.language = ""; }
    if (type === "flip") { base.frontImage = ""; base.backText = ""; base.backImage = ""; }
    if (type === "fillblank") { base.segments = [{ type: "text", text: "" }]; }
    if (type === "truefalse") { base.question = ""; base.questionImage = ""; base.correct = true; }
    if (type === "reveal") { base.leftText = ""; base.imageUrl = ""; base.rightText = ""; }
    const c = { ...course, modules: [...course.modules] };
    c.modules[activeModuleIdx] = { ...activeModule, slides: [...activeModule.slides, base] };
    setCourse(c);
    setActiveSlideIdx(c.modules[activeModuleIdx].slides.length - 1);
    showToast("Slide ajoutée");
  };

  const deleteSlide = (mi, si) => {
    const c = { ...course, modules: [...course.modules] };
    c.modules[mi] = { ...course.modules[mi], slides: course.modules[mi].slides.filter((_, i) => i !== si) };
    setCourse(c);
    if (mi === activeModuleIdx && si <= activeSlideIdx && activeSlideIdx > 0) setActiveSlideIdx(activeSlideIdx - 1);
    showToast("Slide supprimée");
  };

  const deleteModule = (mi) => {
    if (course.modules.length <= 1) return;
    setCourse({ ...course, modules: course.modules.filter((_, i) => i !== mi) });
    if (mi <= activeModuleIdx) setActiveModuleIdx(Math.max(0, activeModuleIdx - 1));
    showToast("Module supprimé");
  };

  const moveSlide = (mi, si, dir) => {
    const n = si + dir;
    if (n < 0 || n >= course.modules[mi].slides.length) return;
    const c = { ...course, modules: [...course.modules] };
    const slides = [...course.modules[mi].slides];
    [slides[si], slides[n]] = [slides[n], slides[si]];
    c.modules[mi] = { ...course.modules[mi], slides };
    setCourse(c);
    if (mi === activeModuleIdx && si === activeSlideIdx) setActiveSlideIdx(n);
  };

  const duplicateSlide = (mi, si) => {
    const c = { ...course, modules: [...course.modules] };
    const slides = [...course.modules[mi].slides];
    slides.splice(si + 1, 0, { ...slides[si], id: uid() });
    c.modules[mi] = { ...course.modules[mi], slides };
    setCourse(c);
    showToast("Slide dupliquée");
  };

  const updateModuleTitle = (mi, title) => {
    const c = { ...course, modules: [...course.modules] };
    c.modules[mi] = { ...course.modules[mi], title };
    setCourse(c);
  };

  const toggleModule = (idx) => setExpandedModules(p => ({ ...p, [idx]: !p[idx] }));

  const totalSlides = course.modules.reduce((a, m) => a + m.slides.length, 0);
  const totalQuizzes = course.modules.reduce((a, m) => a + m.slides.filter(s => s.type === "quiz").length, 0);

  const SlideIcon = ({ type }) => {
    const t = SLIDE_TYPES.find(s => s.id === type);
    const Ic = Icons[t?.icon] || Icons.FileText;
    return <span style={{ display: "flex", color: "#7c3aed" }}><Ic size={14} /></span>;
  };

  const editorMap = { text: TextSlideEditor, image: ImageSlideEditor, flip: FlipCardEditor, quiz: QuizSlideEditor, code: CodeSlideEditor, separator: SeparatorSlideEditor, fillblank: FillBlankSlideEditor, truefalse: TrueFalseSlideEditor, reveal: RevealSlideEditor };
  const EditorComponent = activeSlide ? editorMap[activeSlide.type] : null;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0c0c14", color: "#e2e8f0", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 4px; }
        input:focus, textarea:focus { outline: none; border-color: #7c3aed !important; box-shadow: 0 0 0 3px #7c3aed22; }
        button { font-family: 'DM Sans', sans-serif; }
        @keyframes lf-pop {
          0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          65%  { transform: scale(1.15) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes lf-shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-4px) rotate(-4deg); }
          40%     { transform: translateX(4px) rotate(4deg); }
          60%     { transform: translateX(-2px); }
          80%     { transform: translateX(2px); }
        }
        @keyframes lf-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lf-icon-success { animation: lf-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        .lf-icon-error   { animation: lf-shake 0.4s ease both; }
        .lf-msg-in       { animation: lf-fade-up 0.25s ease both; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#7c3aed", color: "#fff", padding: "10px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>{toast}</div>
      )}

      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <header style={{ background: "#12121e", borderBottom: "1px solid #1e1e2e", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
            <input value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} style={{ background: "transparent", border: "none", color: "#f1f5f9", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", width: 220 }} />
          </div>
          <div style={{ display: "flex", gap: 4, background: "#1a1a2a", borderRadius: 10, padding: 3 }}>
            {[["edit", "Éditeur", <Icons.Edit />], ["preview", "Aperçu", <Icons.Eye />], ["certificate", "Certificat", <Icons.Award />]].map(([m, label, icon]) => (
              <button key={m} onClick={() => { setMode(m); if (m === "preview") { setPreviewModuleIdx(0); setQuizAnswers({}); setFlippedCards({}); setScrollPercents({}); setVisitedFlips(new Set()); } }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, background: mode === m ? "#7c3aed" : "transparent", color: mode === m ? "#fff" : "#64748b", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>{icon}{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>{course.modules.length} module{course.modules.length > 1 ? "s" : ""} · {totalSlides} slides · {totalQuizzes} quiz</span>
          <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(course, null, 2)); showToast("JSON copié !"); }} style={{ ...S.btnSec, fontSize: 12, padding: "6px 12px" }}>Exporter JSON</button>
        </div>
      </header>

      {/* ═══ BODY ═════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ─── SIDEBAR ──────────────────────────────────────────── */}
        {mode === "edit" && (
          <aside style={{ width: sidebarCollapsed ? 48 : 280, background: "#12121e", borderRight: "1px solid #1e1e2e", display: "flex", flexDirection: "column", transition: "width 0.3s ease", flexShrink: 0, overflow: "hidden" }}>
            {!sidebarCollapsed && (
              <>
                <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase" }}>Structure</span>
                  <button onClick={addModule} style={S.btnIcon} title="Ajouter un module"><Icons.Plus /></button>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "0 8px 16px" }}>
                  {course.modules.map((mod, mi) => (
                    <div key={mod.id} style={{ marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 8px", borderRadius: 10, cursor: "pointer", background: activeModuleIdx === mi ? "#1e1e2e" : "transparent" }} onClick={() => { toggleModule(mi); setActiveModuleIdx(mi); if (mod.slides.length) setActiveSlideIdx(0); }}>
                        <span style={{ color: "#64748b", transition: "transform 0.2s", transform: expandedModules[mi] ? "rotate(0)" : "rotate(-90deg)" }}><Icons.ChevronDown /></span>
                        <input value={mod.title} onChange={e => { e.stopPropagation(); updateModuleTitle(mi, e.target.value); }} onClick={e => e.stopPropagation()} style={{ background: "transparent", border: "none", color: "#e2e8f0", fontSize: 13, fontWeight: 600, flex: 1, fontFamily: "'DM Sans', sans-serif", minWidth: 0 }} />
                        {course.modules.length > 1 && <button onClick={e => { e.stopPropagation(); deleteModule(mi); }} style={{ ...S.btnIcon, opacity: 0.4 }}><Icons.Trash /></button>}
                      </div>
                      {expandedModules[mi] && (
                        <div style={{ marginLeft: 12, borderLeft: "2px solid #1e1e2e", paddingLeft: 8 }}>
                          {mod.slides.map((slide, si) => (
                            <div key={slide.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 8px", borderRadius: 8, cursor: "pointer", background: activeModuleIdx === mi && activeSlideIdx === si ? "#7c3aed18" : "transparent", borderLeft: activeModuleIdx === mi && activeSlideIdx === si ? "2px solid #7c3aed" : "2px solid transparent", marginLeft: -2 }} onClick={() => { setActiveModuleIdx(mi); setActiveSlideIdx(si); }}>
                              <SlideIcon type={slide.type} />
                              <span style={{ fontSize: 12, color: activeModuleIdx === mi && activeSlideIdx === si ? "#c4b5fd" : "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slide.title || SLIDE_TYPES.find(t => t.id === slide.type)?.label}</span>
                              <div style={{ display: "flex", gap: 1, opacity: 0.5 }}>
                                <button onClick={e => { e.stopPropagation(); moveSlide(mi, si, -1); }} style={S.btnMicro}><Icons.ArrowUp /></button>
                                <button onClick={e => { e.stopPropagation(); moveSlide(mi, si, 1); }} style={S.btnMicro}><Icons.ArrowDown /></button>
                                <button onClick={e => { e.stopPropagation(); duplicateSlide(mi, si); }} style={S.btnMicro}><Icons.Copy /></button>
                                <button onClick={e => { e.stopPropagation(); deleteSlide(mi, si); }} style={{ ...S.btnMicro, color: "#ef4444" }}><Icons.Trash /></button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => { setActiveModuleIdx(mi); setShowAddSlide(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px", borderRadius: 8, border: "none", background: "transparent", color: "#7c3aed", cursor: "pointer", fontSize: 12, fontWeight: 500, width: "100%", fontFamily: "'DM Sans', sans-serif" }} onMouseEnter={e => e.currentTarget.style.background = "#7c3aed10"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Icons.Plus /> Ajouter une slide
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ padding: 12, border: "none", background: "#1a1a2a", color: "#64748b", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderTop: "1px solid #1e1e2e", marginTop: "auto" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {sidebarCollapsed ? <Icons.ChevronRight size={14} /> : <><Icons.ChevronLeft size={14} /> Réduire</>}
              </span>
            </button>
          </aside>
        )}

        {/* ─── EDITOR ───────────────────────────────────────────── */}
        {mode === "edit" && (
          <main style={{ width: 460, flexShrink: 0, overflow: "auto", padding: "28px 24px" }}>
            {activeSlide ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <SlideIcon type={activeSlide.type} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#7c3aed15", padding: "4px 12px", borderRadius: 20 }}>{SLIDE_TYPES.find(t => t.id === activeSlide.type)?.label}</span>
                  <span style={{ fontSize: 12, color: "#475569" }}>Module {activeModuleIdx + 1} · Slide {activeSlideIdx + 1}/{activeModule.slides.length}</span>
                </div>
                <div style={{ background: "#12121e", borderRadius: 16, padding: 32, border: "1px solid #1e1e2e" }}>
                  {EditorComponent && <EditorComponent slide={activeSlide} onChange={updateSlide} />}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569" }}>
                <div style={{ color: "#2a2a4a", marginBottom: 16 }}><Icons.FileText size={48} /></div>
                <p style={{ fontSize: 16, fontWeight: 500 }}>Aucune slide sélectionnée</p>
                <button onClick={() => setShowAddSlide(true)} style={{ ...S.btnPri, marginTop: 20 }}><Icons.Plus /> Ajouter une slide</button>
              </div>
            )}
          </main>
        )}

        {/* ─── LIVE PREVIEW PANEL ───────────────────────────────── */}
        {mode === "edit" && (
          <aside style={{ flex: 1, minWidth: 0, borderLeft: "1px solid #1e1e2e", background: "#0a0a12", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e2e", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>Aperçu en direct</span>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
              <div style={{ maxWidth: 860, margin: "0 auto" }}>
                {activeModule.slides.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#2a2a3e", fontSize: 13, paddingTop: 60 }}>Aucune slide dans ce module</div>
                ) : activeModule.slides.map((slide, si) => {
                  const isActive = si === activeSlideIdx;
                  return (
                    <div
                      key={slide.id}
                      ref={el => { previewSlideRefs.current[si] = el; }}
                      onClick={() => !isActive && setActiveSlideIdx(si)}
                      style={{
                        marginBottom: 32,
                        opacity: isActive ? 1 : 0.25,
                        transform: isActive ? "scale(1)" : "scale(0.97)",
                        transformOrigin: "top center",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        cursor: isActive ? "default" : "pointer",
                        borderRadius: 16,
                        boxShadow: isActive ? "0 0 0 2px #7c3aed55, 0 8px 40px rgba(124,58,237,0.15)" : "none",
                      }}
                    >
                      <PreviewSlide
                        slide={slide}
                        onAnswer={(ans) => setLiveAnswers(p => ({ ...p, [slide.id]: ans }))}
                        answered={liveAnswers[slide.id]}
                        flippedCards={liveFlips}
                        onFlipCard={(id) => setLiveFlips(p => ({ ...p, [id]: !p[id] }))}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* ─── PREVIEW ──────────────────────────────────────────── */}
        {mode === "preview" && (
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Top: module tabs + progress */}
            <div style={{ background: "#12121e", borderBottom: "1px solid #1e1e2e", padding: "12px 24px", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
                {course.modules.map((mod, mi) => (
                  <button key={mod.id} onClick={() => setPreviewModuleIdx(mi)} style={{
                    padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: previewModuleIdx === mi ? "#7c3aed" : "#1e1e2e",
                    color: previewModuleIdx === mi ? "#fff" : "#94a3b8",
                    whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                  }}>
                    {computeProgress(mi) >= 100 && mi !== previewModuleIdx && <span style={{ marginRight: 4, display: "inline-flex", verticalAlign: "middle" }}><Icons.Check /></span>}
                    {mod.title}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, minWidth: 75 }}>Progression</span>
                <div style={{ flex: 1, height: 8, background: "#1e1e2e", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: progress >= 100 ? "linear-gradient(90deg, #22c55e, #10b981)" : "linear-gradient(90deg, #7c3aed, #3b82f6)", borderRadius: 6, transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 12, color: progress >= 100 ? "#22c55e" : "#7c3aed", fontWeight: 700, minWidth: 38 }}>{progress}%</span>
              </div>
            </div>

            {/* Scrollable: ALL slides of current module on same page */}
            <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflow: "auto", padding: "32px 24px" }}>
              <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", letterSpacing: 2, textTransform: "uppercase" }}>Module {previewModuleIdx + 1} / {course.modules.length}</span>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "8px 0 0" }}>{previewModule.title}</h1>
                </div>

                {previewModule.slides.map((slide) => (
                  <div key={slide.id} style={{ marginBottom: 32 }}>
                    <PreviewSlide
                      slide={slide}
                      onAnswer={(i) => setQuizAnswers(p => ({ ...p, [slide.id]: i }))}
                      answered={quizAnswers[slide.id]}
                      flippedCards={flippedCards}
                      onFlipCard={(id) => {
                        setFlippedCards(p => ({ ...p, [id]: !p[id] }));
                        setVisitedFlips(p => new Set([...p, id]));
                      }}
                    />
                  </div>
                ))}

                {previewModule.slides.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
                    <p>Ce module est vide</p>
                  </div>
                )}
                <div style={{ height: 60 }} />
              </div>
            </div>

            {/* Bottom: module navigation */}
            <div style={{ background: "#12121e", borderTop: "1px solid #1e1e2e", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => setPreviewModuleIdx(Math.max(0, previewModuleIdx - 1))} disabled={previewModuleIdx === 0} style={{ ...S.btnSec, opacity: previewModuleIdx === 0 ? 0.3 : 1, cursor: previewModuleIdx === 0 ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icons.ChevronLeft size={14} /> Module précédent
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {course.modules.map((_, i) => (
                  <div key={i} style={{ width: i === previewModuleIdx ? 24 : 10, height: 10, borderRadius: 6, background: i === previewModuleIdx ? "#7c3aed" : i < previewModuleIdx ? "#7c3aed66" : "#2a2a3e", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setPreviewModuleIdx(i)} />
                ))}
              </div>
              {previewModuleIdx < course.modules.length - 1 ? (
                <button onClick={() => setPreviewModuleIdx(previewModuleIdx + 1)} style={{ ...S.btnPri, display: "inline-flex", alignItems: "center", gap: 6 }}>Module suivant <Icons.ChevronRight size={14} /></button>
              ) : (
                <button onClick={() => setMode("certificate")} style={{ ...S.btnPri, background: progress >= 100 ? "linear-gradient(135deg, #22c55e, #10b981)" : "#7c3aed" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {progress >= 100
                      ? <><Icons.GraduationCap size={16} /> Obtenir le certificat</>
                      : <>Voir le certificat <Icons.ChevronRight size={14} /></>}
                  </span>
                </button>
              )}
            </div>
          </main>
        )}

        {/* ─── CERTIFICATE ──────────────────────────────────────── */}
        {mode === "certificate" && (
          <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
            <div style={{ width: "100%", maxWidth: 600 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Aperçu du certificat</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Généré automatiquement à la fin de la formation.</p>
              <CertificatePreview courseName={course.title} studentName="Jean Dupont" />
              <div style={{ marginTop: 24, padding: 20, background: "#12121e", borderRadius: 14, border: "1px solid #1e1e2e" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Conditions d'obtention</span>
                <div style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8 }}>
                  <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#7c3aed", display: "flex" }}><Icons.ScrollText size={15} /></span> Scroller 100% du contenu de chaque module</p>
                  <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#7c3aed", display: "flex" }}><Icons.Flip /></span> Retourner toutes les cartes interactives</p>
                  <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#7c3aed", display: "flex" }}><Icons.CheckCircle size={15} /></span> Répondre correctement à tous les quiz</p>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {showAddSlide && <AddSlideModal onAdd={addSlide} onClose={() => setShowAddSlide(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const S = {
  label: { fontSize: 12, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" },
  input: { background: "#0c0c14", border: "2px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s", width: "100%" },
  btnPri: { background: "#7c3aed", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
  btnSec: { background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#94a3b8", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
  btnIcon: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" },
  btnMicro: { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 2, borderRadius: 4, display: "flex", alignItems: "center" },
  pCard: { background: "#12121e", borderRadius: 16, padding: 32, border: "1px solid #1e1e2e" },
  pTitle: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 },
  pContent: { color: "#cbd5e1", fontSize: 15, lineHeight: 1.8 },
};
