import { useState, useCallback, useRef, useEffect } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const uid = () => Math.random().toString(36).slice(2, 9);

const SLIDE_TYPES = [
  { id: "text", label: "Texte", icon: "📝", desc: "Contenu texte riche" },
  { id: "image", label: "Image + Texte", icon: "🖼️", desc: "Image avec description" },
  { id: "quiz", label: "Quiz QCM", icon: "❓", desc: "Question à choix multiples" },
  { id: "flip", label: "Carte à retourner", icon: "🔄", desc: "Recto image/titre, verso texte" },
  { id: "video", label: "Vidéo", icon: "🎬", desc: "Vidéo embarquée" },
  { id: "code", label: "Code", icon: "💻", desc: "Bloc de code interactif" },
  { id: "separator", label: "Séparateur", icon: "➖", desc: "Séparation visuelle" },
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
};

/* ═══════════════════════════════════════════════════════════════
   SLIDE EDITORS
   ═══════════════════════════════════════════════════════════════ */

function TextSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre de la slide</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre..." />
      <label style={S.label}>Contenu</label>
      <textarea style={{ ...S.input, minHeight: 200, resize: "vertical", lineHeight: 1.7 }} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} placeholder="Écrivez votre contenu ici..." />
    </div>
  );
}

function ImageSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>URL de l'image</label>
      <input style={S.input} value={slide.imageUrl || ""} onChange={e => onChange({ ...slide, imageUrl: e.target.value })} placeholder="https://..." />
      <label style={S.label}>Description</label>
      <textarea style={{ ...S.input, minHeight: 100, resize: "vertical" }} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

function FlipCardEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#7c3aed10", border: "1px solid #7c3aed33", borderRadius: 12, padding: 14 }}>
        <p style={{ color: "#a78bfa", fontSize: 13, margin: 0 }}>🔄 Carte à retourner — Recto : titre + image · Verso : texte explicatif + image optionnelle</p>
      </div>
      <label style={S.label}>Titre (recto)</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} placeholder="Titre visible sur le recto..." />
      <label style={S.label}>Image recto (URL, optionnel)</label>
      <input style={S.input} value={slide.frontImage || ""} onChange={e => onChange({ ...slide, frontImage: e.target.value })} placeholder="https://..." />
      <label style={S.label}>Texte explicatif (verso)</label>
      <textarea style={{ ...S.input, minHeight: 120, resize: "vertical" }} value={slide.backText || ""} onChange={e => onChange({ ...slide, backText: e.target.value })} placeholder="Explication détaillée au verso..." />
      <label style={S.label}>Image verso (URL, optionnel)</label>
      <input style={S.input} value={slide.backImage || ""} onChange={e => onChange({ ...slide, backImage: e.target.value })} placeholder="https://..." />
    </div>
  );
}

function QuizSlideEditor({ slide, onChange }) {
  const options = slide.options || ["", ""];
  const addOption = () => onChange({ ...slide, options: [...options, ""] });
  const removeOption = (i) => {
    const n = options.filter((_, idx) => idx !== i);
    onChange({ ...slide, options: n, correct: slide.correct === i ? 0 : slide.correct > i ? slide.correct - 1 : slide.correct });
  };
  const updateOption = (i, val) => { const n = [...options]; n[i] = val; onChange({ ...slide, options: n }); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre du quiz</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Question</label>
      <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} value={slide.question || ""} onChange={e => onChange({ ...slide, question: e.target.value })} />
      <label style={S.label}>Réponses</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => onChange({ ...slide, correct: i })} style={{ width: 32, height: 32, borderRadius: 8, border: slide.correct === i ? "2px solid #22c55e" : "2px solid #2a2a3e", background: slide.correct === i ? "#22c55e" : "#1e1e2e", color: slide.correct === i ? "#fff" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {slide.correct === i && <Icons.Check />}
          </button>
          <input style={{ ...S.input, flex: 1 }} value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Réponse ${i + 1}`} />
          {options.length > 2 && <button onClick={() => removeOption(i)} style={{ ...S.btnIcon, color: "#ef4444" }}><Icons.Trash /></button>}
        </div>
      ))}
      <button onClick={addOption} style={{ ...S.btnSec, alignSelf: "flex-start" }}><Icons.Plus /> Ajouter une réponse</button>
      <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Cliquez sur le cercle pour marquer la bonne réponse</p>
    </div>
  );
}

function VideoSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>URL vidéo</label>
      <input style={S.input} value={slide.videoUrl || ""} onChange={e => onChange({ ...slide, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
      <label style={S.label}>Description</label>
      <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

function CodeSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Langage</label>
      <input style={S.input} value={slide.language || ""} onChange={e => onChange({ ...slide, language: e.target.value })} placeholder="python, javascript..." />
      <label style={S.label}>Code</label>
      <textarea style={{ ...S.input, minHeight: 180, resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} value={slide.code || ""} onChange={e => onChange({ ...slide, code: e.target.value })} />
      <label style={S.label}>Explication</label>
      <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

function SeparatorSlideEditor({ slide, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={S.label}>Titre de section</label>
      <input style={S.input} value={slide.title || ""} onChange={e => onChange({ ...slide, title: e.target.value })} />
      <label style={S.label}>Sous-titre</label>
      <input style={S.input} value={slide.content || ""} onChange={e => onChange({ ...slide, content: e.target.value })} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREVIEW COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FlipCard({ slide, flipped, onFlip }) {
  return (
    <div onClick={onFlip} style={{ perspective: 1200, cursor: "pointer", margin: "8px 0" }}>
      <div style={{
        position: "relative", width: "100%", height: 300,
        transition: "transform 0.65s cubic-bezier(.4,.2,.2,1)",
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
      }}>
        {/* Front */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          background: "linear-gradient(135deg, #1a1030, #12121e)", borderRadius: 18, border: "2px solid #7c3aed33",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16,
        }}>
          <div style={{ position: "absolute", top: 14, right: 16, fontSize: 11, color: "#7c3aed99", display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Flip /> Cliquez pour retourner
          </div>
          {slide.frontImage ? (
            <img src={slide.frontImage} alt="" style={{ maxWidth: "70%", maxHeight: 140, borderRadius: 12, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div style={{ fontSize: 48, opacity: 0.6 }}>🔄</div>
          )}
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", textAlign: "center", margin: 0 }}>{slide.title || "Titre de la carte"}</h3>
        </div>
        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: "linear-gradient(135deg, #0f1a2e, #12121e)", borderRadius: 18, border: "2px solid #3b82f633",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16,
          overflow: "auto",
        }}>
          <div style={{ position: "absolute", top: 14, right: 16, fontSize: 11, color: "#3b82f699", display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Flip /> Retourner
          </div>
          {slide.backImage && (
            <img src={slide.backImage} alt="" style={{ maxWidth: "70%", maxHeight: 120, borderRadius: 12, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          )}
          <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.8, textAlign: "center", margin: 0 }}>{slide.backText || "Explication..."}</p>
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>✓ Carte consultée</span>
        </div>
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
    return (
      <div style={S.pCard}>
        <h2 style={S.pTitle}>{slide.title}</h2>
        {slide.imageUrl ? (
          <div style={{ borderRadius: 12, overflow: "hidden", margin: "16px 0", background: "#0a0a14", display: "flex", justifyContent: "center" }}>
            <img src={slide.imageUrl} alt={slide.title} style={{ maxWidth: "100%", maxHeight: 350 }} onError={e => { e.target.style.display = "none"; }} />
          </div>
        ) : (
          <div style={{ height: 200, background: "#0a0a14", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 14, margin: "16px 0" }}>Aucune image</div>
        )}
        <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>{slide.content}</p>
      </div>
    );
  }
  if (slide.type === "flip") {
    return <FlipCard slide={slide} flipped={!!flippedCards[slide.id]} onFlip={() => onFlipCard(slide.id)} />;
  }
  if (slide.type === "quiz") {
    return (
      <div style={S.pCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ background: "#7c3aed22", color: "#a78bfa", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>QUIZ</span>
          <h2 style={{ ...S.pTitle, margin: 0 }}>{slide.title}</h2>
        </div>
        <p style={{ fontSize: 17, color: "#e2e8f0", marginBottom: 24, lineHeight: 1.6, fontWeight: 500 }}>{slide.question}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(slide.options || []).map((opt, i) => {
            const isCorrect = i === slide.correct;
            const wasSelected = answered === i;
            const show = answered !== undefined;
            let bg = "#0c0c14", bdr = "2px solid #1e1e2e", clr = "#e2e8f0";
            if (show && isCorrect) { bg = "#22c55e14"; bdr = "2px solid #22c55e55"; clr = "#4ade80"; }
            else if (show && wasSelected && !isCorrect) { bg = "#ef444414"; bdr = "2px solid #ef444455"; clr = "#f87171"; }
            return (
              <button key={i} onClick={() => !show && onAnswer(i)} style={{ background: bg, border: bdr, color: clr, padding: "14px 18px", borderRadius: 12, cursor: show ? "default" : "pointer", textAlign: "left", fontSize: 15, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12, fontFamily: "'DM Sans', sans-serif" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: show && isCorrect ? "#22c55e33" : "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {show && isCorrect ? "✓" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {answered !== undefined && (
          <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: answered === slide.correct ? "#22c55e10" : "#ef444410", color: answered === slide.correct ? "#4ade80" : "#f87171", fontSize: 14, fontWeight: 500 }}>
            {answered === slide.correct ? "✅ Bonne réponse !" : `❌ Mauvaise réponse. La bonne réponse était : ${slide.options[slide.correct]}`}
          </div>
        )}
      </div>
    );
  }
  if (slide.type === "video") {
    return (
      <div style={S.pCard}>
        <h2 style={S.pTitle}>{slide.title}</h2>
        <div style={{ background: "#0a0a14", borderRadius: 12, height: 280, display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0", color: "#475569" }}>
          {slide.videoUrl ? `🎬 ${slide.videoUrl}` : "Aucune vidéo"}
        </div>
        {slide.content && <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>{slide.content}</p>}
      </div>
    );
  }
  if (slide.type === "code") {
    return (
      <div style={S.pCard}>
        <h2 style={S.pTitle}>{slide.title}</h2>
        {slide.language && <span style={{ fontSize: 11, color: "#7c3aed", background: "#7c3aed18", padding: "3px 10px", borderRadius: 12, fontWeight: 600, textTransform: "uppercase" }}>{slide.language}</span>}
        <pre style={{ background: "#0a0a14", borderRadius: 12, padding: 20, margin: "16px 0", overflow: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, border: "1px solid #1e1e2e" }}>{slide.code || "// ..."}</pre>
        {slide.content && <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>{slide.content}</p>}
      </div>
    );
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
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   ADD SLIDE MODAL
   ═══════════════════════════════════════════════════════════════ */

function AddSlideModal({ onAdd, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#16161e", borderRadius: 20, padding: 32, width: 520, maxWidth: "90vw", border: "1px solid #2a2a3e", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <h3 style={{ margin: "0 0 8px", color: "#f1f5f9", fontSize: 20, fontWeight: 700 }}>Ajouter un élément</h3>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Choisissez le type de contenu</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SLIDE_TYPES.map(type => (
            <button key={type.id} onClick={() => { onAdd(type.id); onClose(); }} style={{ background: "#1e1e2e", border: "2px solid #2a2a3e", borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 4 }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#7c3aed10"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.background = "#1e1e2e"; }}>
              <span style={{ fontSize: 24 }}>{type.icon}</span>
              <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>{type.label}</span>
              <span style={{ color: "#64748b", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{type.desc}</span>
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

  // Preview state
  const [previewModuleIdx, setPreviewModuleIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [scrollPercents, setScrollPercents] = useState({});  // { moduleIdx: 0-1 }
  const scrollRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const activeModule = course.modules[activeModuleIdx];
  const activeSlide = activeModule?.slides?.[activeSlideIdx];
  const previewModule = course.modules[previewModuleIdx];

  /* ─── PROGRESS ──────────────────────────────────────────────
     Weighted: scroll(40%) + flipped cards(30%) + correct quizzes(30%)
  */
  const computeProgress = useCallback(() => {
    // Count interactable items across ALL modules
    let totalFlips = 0, doneFlips = 0;
    let totalQuizzes = 0, correctQuizzes = 0;
    const totalModules = course.modules.length;

    course.modules.forEach(mod => {
      mod.slides.forEach(slide => {
        if (slide.type === "flip") {
          totalFlips++;
          if (flippedCards[slide.id]) doneFlips++;
        }
        if (slide.type === "quiz") {
          totalQuizzes++;
          if (quizAnswers[slide.id] !== undefined && quizAnswers[slide.id] === slide.correct) correctQuizzes++;
        }
      });
    });

    // Scroll progress: average of all module scroll %
    let scrollSum = 0;
    for (let i = 0; i < totalModules; i++) {
      scrollSum += (scrollPercents[i] || 0);
    }
    const scrollRatio = totalModules > 0 ? scrollSum / totalModules : 0;

    // Weighted combination
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
  }, [course, quizAnswers, flippedCards, scrollPercents]);

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
    if (type === "quiz") { base.question = ""; base.options = ["", ""]; base.correct = 0; }
    if (type === "code") { base.code = ""; base.language = ""; }
    if (type === "flip") { base.frontImage = ""; base.backText = ""; base.backImage = ""; }
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
    return <span style={{ fontSize: 14 }}>{t?.icon || "📄"}</span>;
  };

  const editorMap = { text: TextSlideEditor, image: ImageSlideEditor, flip: FlipCardEditor, quiz: QuizSlideEditor, video: VideoSlideEditor, code: CodeSlideEditor, separator: SeparatorSlideEditor };
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
              <button key={m} onClick={() => { setMode(m); if (m === "preview") { setPreviewModuleIdx(0); setQuizAnswers({}); setFlippedCards({}); setScrollPercents({}); } }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, background: mode === m ? "#7c3aed" : "transparent", color: mode === m ? "#fff" : "#64748b", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>{icon}{label}</button>
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
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ padding: 12, border: "none", background: "#1a1a2a", color: "#64748b", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", borderTop: "1px solid #1e1e2e" }}>
              {sidebarCollapsed ? "→" : "← Réduire"}
            </button>
          </aside>
        )}

        {/* ─── EDITOR ───────────────────────────────────────────── */}
        {mode === "edit" && (
          <main style={{ flex: 1, overflow: "auto", padding: 32, display: "flex", justifyContent: "center" }}>
            {activeSlide ? (
              <div style={{ width: "100%", maxWidth: 720 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <SlideIcon type={activeSlide.type} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "#7c3aed15", padding: "4px 12px", borderRadius: 20 }}>{SLIDE_TYPES.find(t => t.id === activeSlide.type)?.label}</span>
                  <span style={{ fontSize: 12, color: "#475569" }}>Module {activeModuleIdx + 1} · Slide {activeSlideIdx + 1}/{activeModule.slides.length}</span>
                </div>
                <div style={{ background: "#12121e", borderRadius: 16, padding: 32, border: "1px solid #1e1e2e" }}>
                  {EditorComponent && <EditorComponent slide={activeSlide} onChange={updateSlide} />}
                </div>
                <div style={{ marginTop: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, display: "block" }}>Aperçu en direct</span>
                  <div style={{ background: "#0a0a12", borderRadius: 16, padding: 24, border: "1px solid #1e1e2e", transform: "scale(0.85)", transformOrigin: "top left", width: "117.6%" }}>
                    <PreviewSlide slide={activeSlide} onAnswer={() => {}} answered={undefined} flippedCards={{}} onFlipCard={() => {}} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <p style={{ fontSize: 16, fontWeight: 500 }}>Aucune slide sélectionnée</p>
                <button onClick={() => setShowAddSlide(true)} style={{ ...S.btnPri, marginTop: 20 }}><Icons.Plus /> Ajouter une slide</button>
              </div>
            )}
          </main>
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
                    {(scrollPercents[mi] || 0) >= 0.9 && mi !== previewModuleIdx && <span style={{ marginRight: 4 }}>✓</span>}
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
                      onFlipCard={(id) => setFlippedCards(p => ({ ...p, [id]: !p[id] }))}
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
              <button onClick={() => setPreviewModuleIdx(Math.max(0, previewModuleIdx - 1))} disabled={previewModuleIdx === 0} style={{ ...S.btnSec, opacity: previewModuleIdx === 0 ? 0.3 : 1, cursor: previewModuleIdx === 0 ? "default" : "pointer" }}>
                ← Module précédent
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {course.modules.map((_, i) => (
                  <div key={i} style={{ width: i === previewModuleIdx ? 24 : 10, height: 10, borderRadius: 6, background: i === previewModuleIdx ? "#7c3aed" : i < previewModuleIdx ? "#7c3aed66" : "#2a2a3e", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setPreviewModuleIdx(i)} />
                ))}
              </div>
              {previewModuleIdx < course.modules.length - 1 ? (
                <button onClick={() => setPreviewModuleIdx(previewModuleIdx + 1)} style={S.btnPri}>Module suivant →</button>
              ) : (
                <button onClick={() => setMode("certificate")} style={{ ...S.btnPri, background: progress >= 100 ? "linear-gradient(135deg, #22c55e, #10b981)" : "#7c3aed" }}>
                  {progress >= 100 ? "🎓 Obtenir le certificat" : "Voir le certificat →"}
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
                  <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#7c3aed" }}>📜</span> Scroller 100% du contenu de chaque module</p>
                  <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#7c3aed" }}>🔄</span> Retourner toutes les cartes interactives</p>
                  <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#7c3aed" }}>✅</span> Répondre correctement à tous les quiz</p>
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
