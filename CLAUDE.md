# LearnForge — Documentation IA

## Stack technique

- **React 19** (hooks uniquement, pas de classes)
- **Vite 7** (bundler + dev server, `npm run dev`)
- **Zéro dépendance UI** — tout est en inline styles React (pas de Tailwind, pas de MUI, pas de styled-components)
- **Zéro backend** — tout tourne en mémoire dans le state React, aucun appel API
- **Fonts** : DM Sans (UI) + JetBrains Mono (code) chargées via Google Fonts dans une constante CSS injectée par `<style>`

## Structure des fichiers

```
src/
  main.jsx          → Point d'entrée React, monte <App /> dans #root
  App.jsx           → Wrapper minimal, retourne <CourseBuilder />
  CourseBuilder.jsx → Fichier principal de l'application (~1100 lignes)
  index.css         → Reset minimal du body (margin: 0)
  App.css           → #root en width:100% height:100vh overflow:hidden
```

> De nouveaux fichiers peuvent être créés si c'est justifié (composant complexe, logique réutilisable, etc.). Continuer à tout mettre dans `CourseBuilder.jsx` reste tout à fait valide — ce n'est pas parce que d'autres fichiers sont autorisés qu'il faut obligatoirement les créer.

## Architecture de données

```js
course = {
  title: string,
  description: string,
  modules: [
    {
      id: string,        // uid() = Math.random().toString(36).slice(2,9)
      title: string,
      slides: [Slide]
    }
  ]
}
```

### Types de slides

| type | Champs spécifiques |
|---|---|
| `text` | `title`, `content` |
| `image` | `title`, `imageUrl`, `content` |
| `quiz` | `title`, `question`, `options[]`, `correct` (index) |
| `flip` | `title`, `frontImage`, `frontContent`, `backTitle`, `backText`, `backImage` |
| `video` | `title`, `videoUrl`, `content` |
| `code` | `title`, `language`, `code`, `content` |
| `separator` | `title`, `content` |
| `fillblank` | `title`, `segments[]` |

#### Segments (fillblank)
```js
// Texte normal
{ type: "text", text: string }

// Trou à remplir
{ type: "blank", id: string, word: string, alternatives: string[] }
```
`alternatives` = liste de réponses acceptées (insensible à la casse). `mergeAdjacentText()` fusionne les segments texte adjacents après modification.

### Images et vidéos
Les champs `imageUrl`, `frontImage`, `backImage`, `videoUrl` acceptent :
- Une URL HTTP(S) externe
- Un Data URL base64 (généré par `FileReader.readAsDataURL()` via le composant `FileUrlInput`)

## Composants

### Utilitaires
- **`uid()`** — Génère un identifiant aléatoire court (7 chars)
- **`mergeAdjacentText(segs)`** — Fusionne les segments texte consécutifs dans un fillblank

### UI partagés
- **`AutoTextarea`** — Textarea qui grandit automatiquement en hauteur selon le contenu. Remplace tous les `<input>` et `<textarea>` des éditeurs. Props : `value`, `onChange`, `placeholder`, `style`, `minHeight`. Utilise `useRef` + `useEffect` sur `scrollHeight`.
- **`FileUrlInput`** — Champ combinant une saisie d'URL et un bouton "📁 Importer" pour charger un fichier local en base64. Props : `value`, `onChange`, `accept` (ex: `"image/*"`), `placeholder`. Affiche automatiquement un bouton ✕ rouge à droite quand `value` est non vide pour effacer la valeur.
- **`Icons`** — Objet de composants SVG inline : `Plus`, `Trash`, `Eye`, `Edit`, `ChevronDown`, `Copy`, `ArrowUp`, `ArrowDown`, `Check`, `Award`, `Flip`

### Éditeurs de slides (mode edit)
Un éditeur par type de slide. Tous reçoivent `{ slide, onChange }` :
- `TextSlideEditor`
- `ImageSlideEditor`
- `FlipCardEditor`
- `QuizSlideEditor` — gestion dynamique des options (ajouter/supprimer/réordonner)
- `VideoSlideEditor`
- `CodeSlideEditor`
- `SeparatorSlideEditor`
- `FillBlankSlideEditor` — deux modes : saisie du texte brut → mode interactif où cliquer un mot crée un trou (blank), cliquer un trou le supprime. Gère les alternatives de réponse par trou.

Le mapping éditeur ↔ type est dans `editorMap` dans `CourseBuilder`.

### Previews de slides
- **`PreviewSlide`** — Dispatcher qui choisit le bon rendu selon `slide.type`. Props : `slide`, `onAnswer`, `answered`, `flippedCards`, `onFlipCard`
- **`FlipCard`** — Carte 3D CSS (rotateY 180°), animation `cubic-bezier`. Les deux faces suivent le même layout : titre en haut → image (`flex:1`, `objectFit:cover`) → texte en bas. Si pas d'image : titre + texte seuls. Nouveaux champs : `frontContent` (texte recto), `backTitle` (titre verso).
- **`ImageSlidePreview`** — Composant dédié pour les slides image. Détecte le ratio naturel via `onLoad` (`naturalWidth/naturalHeight`). Portrait (ratio < 0.85) : conteneur centré 55% max 320px, `objectFit:cover`, maxHeight 580. Paysage/carré : pleine largeur, `objectFit:contain`, maxHeight 400.
- **`VideoSlidePreview`** — Composant dédié pour les slides vidéo. Même logique adaptative via `onLoadedMetadata` (`videoWidth/videoHeight`). Uniquement pour les `data:` URL (fichiers importés) — les URLs externes affichent juste le lien texte.
- **`FillBlankPreview`** — Inputs inline dans le texte, vérification des réponses, score, bouton réessayer.

### Modals et overlays
- **`AddSlideModal`** — Modal (backdrop blur) pour choisir le type de slide à ajouter. Grille 2 colonnes des 8 types.
- **`CertificatePreview`** — Affichage du certificat de réussite avec date automatique.

### Composant principal
**`CourseBuilder`** — Composant racine exporté par défaut. Contient tout le state et toute la logique.

## State de CourseBuilder

```js
// Données
course                  // Structure complète de la formation
// Navigation éditeur
activeModuleIdx         // Index du module sélectionné
activeSlideIdx          // Index de la slide sélectionnée
// UI
mode                    // "edit" | "preview" | "certificate"
showAddSlide            // boolean — modal d'ajout visible
expandedModules         // { [idx]: boolean } — modules dépliés dans sidebar
sidebarCollapsed        // boolean
toast                   // string | null — message toast temporaire (2s)
// Preview mode
previewModuleIdx        // Module affiché en mode preview
quizAnswers             // { [slideId]: answerIndex }
flippedCards            // { [slideId]: boolean }
visitedFlips            // Set<slideId> — cartes vues (irréversible pour la progression)
scrollPercents          // { [moduleIdx]: 0-1 } — scroll max atteint par module
// Refs
scrollRef               // Ref sur le conteneur scroll du mode preview
previewSlideRefs        // { [slideIdx]: DOMElement } — refs des slides dans le panneau live
```

## Layout (mode edit)

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (56px) — titre formation + tabs + export JSON   │
├──────────┬─────────────────────┬────────────────────────┤
│ SIDEBAR  │  ÉDITEUR            │  APERÇU EN DIRECT      │
│ 280px    │  460px fixe         │  flex:1 (tout le reste)│
│ (48 si   │  flexShrink:0       │                        │
│ réduite) │  scroll interne     │  Toutes les slides du  │
│          │                     │  module empilées.      │
│ Modules  │  Formulaire de la   │  Slide active = 100%   │
│ + slides │  slide sélectionnée │  opacité + halo violet │
│          │  (AutoTextarea pour │  Autres = 25% opacité  │
│          │  tous les champs)   │  + scale(0.97)         │
│          │                     │  Scroll auto sur active│
└──────────┴─────────────────────┴────────────────────────┘
```

## Layout (mode preview)

Panneau unique `flex:1`. Structure verticale :
1. Tabs des modules + barre de progression
2. Zone scroll : toutes les slides du module courant (`previewModule.slides.map(...)`)
3. Barre de navigation bas : module précédent / suivant / certificat

## Calcul de progression

Par module, 3 composantes :
- **40%** — Ratio de scroll (`scrollHeight` max atteint)
- **30%** — Cartes flip vues (`visitedFlips.has(id)`) — irréversible
- **30%** — Quiz corrects (`quizAnswers[id] === slide.correct`)

Si le module n'a ni flip ni quiz → progression = scroll uniquement (100%).

## Mutations du course (immutabilité)

Toutes les mutations spread le state :
```js
// Pattern standard
const c = { ...course, modules: [...course.modules] };
c.modules[mi] = { ...course.modules[mi], slides: [...] };
setCourse(c);
```
Fonctions : `updateSlide`, `addModule`, `addSlide`, `deleteSlide`, `deleteModule`, `moveSlide`, `duplicateSlide`, `updateModuleTitle`

## Styles

Objet `S` défini en bas du fichier (accessible par tous les composants car évalué au runtime) :
```js
S.label     // Label uppercase petit
S.input     // Champ de saisie sombre (utilisé par AutoTextarea et FileUrlInput)
S.btnPri    // Bouton primaire violet #7c3aed
S.btnSec    // Bouton secondaire sombre
S.btnIcon   // Bouton icône transparent
S.btnMicro  // Bouton micro (sidebar)
S.pCard     // Card de preview (#12121e, borderRadius 16)
S.pTitle    // Titre dans une pCard
S.pContent  // Texte dans une pCard
```
> ⚠️ `S` est défini après les composants dans le fichier mais est accessible car les composants sont appelés au render, pas à la définition.

## Commandes

```bash
npm run dev      # Dev server (Vite HMR)
npm run build    # Build production
npm run preview  # Preview du build
npm run lint     # ESLint
```

## Conventions importantes

- **Pas de router** — app single-page, navigation par state `mode`
- **Pas de store externe** — tout dans le state local de `CourseBuilder`
- **Pas de CSS externe** — uniquement inline styles React + l'objet `S`
- **Export JSON** — `navigator.clipboard.writeText(JSON.stringify(course))` pour exporter la formation
- **IDs** — toujours générés avec `uid()`, jamais d'index comme clé stable
- **Fonts Google** — injectées via la constante `FONTS` dans un `<style>` tag, pas via `index.html`

---

## Nouveautés récentes (à connaître)

### Nouveaux types de slides (10 types au total)

| type | Champs spécifiques |
|---|---|
| `truefalse` | `title`, `statement`, `correct` (boolean), `explanation` |
| `reveal` | `title`, `leftText`, `rightText`, `imageUrl` |
| `quiz` | `title`, `questionImage`, `question`, `options[]`, `correct` (number[]), `multiAnswer` (bool), `wrongMessage` |

**Note** : `quiz.correct` est maintenant un `number[]` (tableau), même en mode réponse unique. Le champ `multiAnswer: boolean` contrôle l'UX (radio vs checkbox). `wrongMessage` est un message d'erreur personnalisable par le créateur.

### QuizSlideEditor — améliorations

- Champ `questionImage` (via `FileUrlInput`) entre titre et question
- Toggle "Plusieurs réponses" (on/off horizontal) entre question et liste des options
- En mode réponse unique : la sélection d'une option désélectionne l'autre (radio-like), même style visuel que multi
- Bouton vérifier → si réponses manquantes en mode multi : affiche `(N restant)`
- En cas d'erreur : message rouge + bouton "Réessayer" (en bas à droite si message long)
- Pas d'affichage de la bonne réponse sur erreur

### RevealSlideEditor / RevealPreview

- Slide avec animation : texte gauche fixe + image droite qui coulisse vers la gauche au clic
- Quand l'image coulisse, elle révèle un texte droit caché dessous
- Re-clic → animation inverse (image revient de gauche à droite)
- Texte indicatif "Cliquez pour révéler →" en bas, sous la zone
- Pas de barre de séparation entre les deux zones — utiliser `background` transparent pour le séparateur

### TrueFalseSlideEditor / TrueFalsePreview

- Slide avec un énoncé et deux boutons Vrai / Faux
- Champs : `statement` (l'énoncé), `correct` (true/false), `explanation` (optionnelle, montrée après réponse)

### Composants UI partagés ajoutés

- **`FileUrlInput`** — URL + bouton "📁 Importer" (FileReader base64). Utilisé partout où il y a image/vidéo.
- **`AutoTextarea`** — Textarea auto-resize (scrollHeight). Remplace tous les `<input>` dans les éditeurs.
- **`HighlightTextarea`** — Textarea avec surbrillance de mots (backdrop div + textarea transparent superposé). **Voir section échec ci-dessous.**

---

## HighlightTextarea dans FillBlankSlideEditor

### Fonctionnement

Le composant `HighlightTextarea` est intégré dans `FillBlankSlideEditor` (branche `editingText`). Il remplace `AutoTextarea` pour la saisie du `draftText` et surligne en mauve les mots déjà définis comme trous, directement dans la zone d'édition.

Technique utilisée (backdrop overlay) :
- Un `<div>` backdrop (position:absolute, pointer-events:none) contient le texte avec `<mark>` sur les mots blancs (`background:#7c3aed55, color:transparent`)
- Un `<textarea>` transparent par-dessus (`background:transparent, color:#e2e8f0, z-index:1`)
- Auto-resize + scroll sync entre les deux couches
- Les mots sont passés via `highlightWords={blanks.map(b => b.word)}`
- Si une lettre du mot est supprimée, le mot ne correspond plus → la surbrillance disparaît et le trou est naturellement retiré à l'`applyText()`

### Comportement attendu

- En mode édition du texte (`editingText = true`), les mots-trous existants apparaissent surlignés en mauve dans le textarea
- Supprimer un seul caractère d'un mot surligné le désactive immédiatement (plus de correspondance exacte)
- Confirmer le texte (`applyText`) re-applique les trous existants sur les mots encore présents

---

### Affichage adaptatif image & vidéo

Les slides `image` et `video` utilisent des composants dédiés (`ImageSlidePreview`, `VideoSlidePreview`) qui détectent le ratio naturel du média au chargement :
- **Portrait** (ratio < 0.85) : conteneur centré 55% max 320px, hauteur max 580px
- **Paysage / carré** (ratio ≥ 0.85) : pleine largeur, hauteur max 400px

### Carte à retourner (flip) — champs mis à jour

Structure complète d'une slide `flip` :
```js
{
  type: "flip",
  title: string,        // titre recto
  frontImage: string,   // image recto (URL ou base64)
  frontContent: string, // texte/description recto (nouveau)
  backTitle: string,    // titre verso (nouveau)
  backImage: string,    // image verso
  backText: string,     // texte verso
}
```
Layout des deux faces : **titre → image (flex:1) → texte**. Si pas d'image, le texte s'affiche seul sous le titre.

L'éditeur est divisé en deux sections colorées : **Recto** (violet) et **Verso** (bleu), chacune avec Titre / Image / Texte dans cet ordre.

---

## ⚠️ Note environnement

La traduction automatique du navigateur (Google Translate, DeepL extension, etc.) peut interférer avec le rendu de l'application et provoquer des comportements visuels inattendus. Si un composant semble cassé sans raison apparente, vérifier que la traduction automatique est bien désactivée sur la page avant de diagnostiquer un bug.
