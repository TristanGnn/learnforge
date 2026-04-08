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
  CourseBuilder.jsx → Fichier principal de l'application (~1950 lignes)
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
| `quiz` | `title`, `questionImage`, `question`, `options[]`, `correct` (number[]), `multiAnswer` (bool), `wrongMessage` |
| `flip` | `title`, `frontImage`, `frontContent`, `backTitle`, `backText`, `backImage` |
| `video` | `title`, `videoUrl`, `content` |
| `code` | `title`, `language`, `code`, `content` |
| `separator` | `title`, `content` |
| `fillblank` | `title`, `segments[]`, `wordBank` (bool) |
| `truefalse` | `title`, `statement`, `correct` (boolean), `explanation` |
| `reveal` | `title`, `leftText`, `rightText`, `imageUrl` |

#### Segments (fillblank)
```js
// Texte normal
{ type: "text", text: string }

// Trou à remplir
{ type: "blank", id: string, word: string, alternatives: string[], trapWords: string[] }
```
- `alternatives` — réponses acceptées (insensible à la casse). La première est le mot du texte.
- `trapWords` — mots pièges affichés dans la banque de mots mais jamais corrects. Uniquement pertinent si `wordBank: true`.
- `mergeAdjacentText()` fusionne les segments texte adjacents après modification.

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
- **`FileUrlInput`** — Champ combinant une saisie d'URL et un bouton "Importer" (icône `FolderOpen`) pour charger un fichier local en base64. Props : `value`, `onChange`, `accept` (ex: `"image/*"`), `placeholder`. Affiche automatiquement un bouton `X` (icône) à droite quand `value` est non vide pour effacer la valeur.
- **`Icons`** — Objet de composants SVG inline. Liste complète :
  `Plus`, `Trash`, `Eye`, `Edit`, `ChevronDown`, `ChevronLeft`, `ChevronRight`,
  `Copy`, `ArrowUp`, `ArrowDown`, `Check`, `Award`, `Flip`, `GripVertical`,
  `FileText`, `ImageIcon`, `HelpCircle`, `Terminal`, `MinusIcon`, `PencilLine`,
  `ScaleIcon`, `Sparkles`, `X`, `FolderOpen`, `CheckCircle`, `XCircle`,
  `AlertTriangle`, `InfoIcon`, `RotateCcw`, `Play`, `Square`, `GraduationCap`, `ScrollText`

### Éditeurs de slides (mode edit)
Un éditeur par type de slide. Tous reçoivent `{ slide, onChange }` :
- `TextSlideEditor`
- `ImageSlideEditor`
- `FlipCardEditor`
- `QuizSlideEditor` — gestion dynamique des options (ajouter/supprimer/réordonner)
- `VideoSlideEditor`
- `CodeSlideEditor`
- `SeparatorSlideEditor`
- `FillBlankSlideEditor` — deux modes : saisie du texte brut → mode interactif où cliquer un mot crée un trou (blank), cliquer un trou le supprime. Gère les alternatives et les mots pièges par trou. Toggle "Banque de mots" active le mode word bank en preview.
- `TrueFalseSlideEditor`
- `RevealSlideEditor`

Le mapping éditeur ↔ type est dans `editorMap` dans `CourseBuilder`.

### Previews de slides
- **`PreviewSlide`** — Dispatcher qui choisit le bon rendu selon `slide.type`. Props : `slide`, `onAnswer`, `answered`, `flippedCards`, `onFlipCard`
- **`FlipCard`** — Carte 3D CSS (rotateY 180°), animation `cubic-bezier`. Les deux faces suivent le même layout : titre en haut → image (`flex:1`, `objectFit:cover`) → texte en bas. Si pas d'image : titre + texte seuls. Si recto vide : icône `Icons.Flip` en placeholder (opacité 0.2, pas d'emoji).
- **`ImageSlidePreview`** — Composant dédié pour les slides image. Détecte le ratio naturel via `onLoad` (`naturalWidth/naturalHeight`). Portrait (ratio < 0.85) : conteneur centré 55% max 320px, `objectFit:cover`, maxHeight 580. Paysage/carré : pleine largeur, `objectFit:contain`, maxHeight 400.
- **`VideoSlidePreview`** — Composant dédié pour les slides vidéo. Même logique adaptative via `onLoadedMetadata` (`videoWidth/videoHeight`). Uniquement pour les `data:` URL (fichiers importés) — les URLs externes affichent juste le lien texte.
- **`FillBlankPreview`** — Deux modes selon `slide.wordBank` :
  - **Saisie libre** : inputs inline dans le texte, vérification insensible à la casse, score, bouton réessayer.
  - **Banque de mots** : pool de tokens mélangés (mots corrects + alternatives + pièges), drag-and-drop ou clic pour placer dans les slots, swap entre slots, vérification groupée.
- **`TrueFalsePreview`** — Énoncé + boutons Vrai/Faux, affiche l'explication après réponse.
- **`RevealPreview`** — Texte gauche fixe + image droite qui coulisse à gauche au clic, révèle texte droit caché.

### Modals et overlays
- **`AddSlideModal`** — Modal (backdrop blur) pour choisir le type de slide à ajouter. Grille 2 colonnes des 10 types.
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
dragOver                // { type: "module", mi } | { type: "slide", mi, si } | null — cible drag en cours
editingSlideTitle       // { mi, si } | null — slide dont le titre est en cours d'édition inline
// Preview mode
previewModuleIdx        // Module affiché en mode preview
quizAnswers             // { [slideId]: answerIndex }
flippedCards            // { [slideId]: boolean }
visitedFlips            // Set<slideId> — cartes vues (irréversible pour la progression)
scrollPercents          // { [moduleIdx]: 0-1 } — scroll max atteint par module
// Refs
scrollRef               // Ref sur le conteneur scroll du mode preview
previewSlideRefs        // { [slideIdx]: DOMElement } — refs des slides dans le panneau live
dragRef                 // useRef — { type, mi, si? } — source du drag en cours (pas de re-render)
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
Fonctions : `updateSlide`, `addModule`, `addSlide`, `deleteSlide`, `deleteModule`, `moveSlide`, `reorderSlides`, `reorderModules`, `duplicateSlide`, `updateModuleTitle`

- **`reorderModules(fromIdx, toIdx)`** — déplace un module par drag-and-drop, met à jour `activeModuleIdx`
- **`reorderSlides(mi, fromIdx, toIdx)`** — déplace une slide dans son module, met à jour `activeSlideIdx`

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
> `S` est défini après les composants dans le fichier mais est accessible car les composants sont appelés au render, pas à la définition.

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
- **Zéro emoji** — ne jamais utiliser d'emojis dans l'interface. Toujours utiliser un composant SVG de l'objet `Icons`. Si l'icône n'existe pas encore, l'ajouter à `Icons` avant de l'utiliser.

---

## Sidebar — interactions

### Drag-and-drop (HTML5 natif, pas de lib)

- **Modules** : chaque module est `draggable`. Glisser un module sur un autre les échange via `reorderModules`. Un contour violet (`#7c3aed88`) indique la cible pendant le survol. Un drag de module ne peut pas se déposer sur une slide (types vérifiés dans `onDragOver`).
- **Slides** : chaque slide est `draggable` et peut être réordonnée au sein de son module via `reorderSlides`. Le cross-module n'est pas supporté.
- L'état de la source est stocké dans `dragRef` (useRef, pas de re-render). L'état de la cible visuelle est dans `dragOver` (useState).
- Chaque item affiche une icône `Icons.GripVertical` à gauche comme indicateur visuel de déplaçabilité.
- L'input du titre de module a `onMouseDown stopPropagation` pour ne pas déclencher le drag lors de la saisie.

### Édition inline du titre de slide (double-clic)

- Double-cliquer sur une slide dans la sidebar active `editingSlideTitle = { mi, si }`.
- Le `<span>` du titre est remplacé par un `<input>` avec `autoFocus`, stylé `S.input`.
- Confirmation : **Entrée** ou clic ailleurs (`onBlur`). Annulation : **Échap**.
- La mise à jour se fait directement sur `course` (spread immutable), sans passer par `updateSlide`.

---

## Composants UI partagés — détails

### FileUrlInput
URL + bouton "Importer" (`Icons.FolderOpen`). Bouton `Icons.X` rouge apparaît quand `value` est non vide.

### AutoTextarea
Textarea auto-resize (`scrollHeight`). Remplace tous les `<input>` dans les éditeurs.

### HighlightTextarea
Textarea avec surbrillance de mots (backdrop div + textarea transparent superposé). Intégré dans `FillBlankSlideEditor` (branche `editingText`).

Technique :
- `<div>` backdrop (`position:absolute`, `pointer-events:none`) avec `<mark>` sur les mots-trous (`background:#7c3aed55, color:transparent`)
- `<textarea>` transparent par-dessus (`background:transparent, color:#e2e8f0, z-index:1`)
- Auto-resize + scroll sync entre les deux couches
- Props : `highlightWords={blanks.map(b => b.word)}`

---

## FillBlankSlideEditor — mots pièges et banque de mots

### Mode banque de mots (`slide.wordBank: true`)

- Les slots deviennent des drop zones visuelles (pill pointillée)
- Pool de tokens mélangés sous le texte ("Mots disponibles")
- L'apprenant clique ou glisse-dépose les tokens dans les slots
- Un token peut être swap entre deux slots

### Pool de tokens (ordre dans `shuffleCache`)
1. `blank.word` de chaque trou
2. Alternatives supplémentaires de chaque trou (différentes du mot principal)
3. `blank.trapWords` de chaque trou — dans la banque mais jamais corrects

Le pool est mélangé (Fisher-Yates) et mis en cache jusqu'au prochain `setShuffleSeed`.

### Fonctions internes
- `updateAlternatives(blankId, alts)` — met à jour les réponses acceptées
- `updateTrapWords(blankId, traps)` — met à jour les mots pièges
- `makeBlank(segIdx, word, before, after)` — transforme un mot en trou
- `removeBlank(blankId)` — reconvertit le trou en texte
- `applyText()` — reconcilie le `draftText` avec les trous existants

---

## Affichage adaptatif image & vidéo

`ImageSlidePreview` et `VideoSlidePreview` détectent le ratio naturel du média au chargement :
- **Portrait** (ratio < 0.85) : conteneur centré 55% max 320px, hauteur max 580px
- **Paysage / carré** (ratio ≥ 0.85) : pleine largeur, hauteur max 400px

---

## Carte à retourner (flip) — structure complète

```js
{
  type: "flip",
  title: string,        // titre recto
  frontImage: string,   // image recto (URL ou base64)
  frontContent: string, // texte/description recto
  backTitle: string,    // titre verso
  backImage: string,    // image verso
  backText: string,     // texte verso
}
```
Layout des deux faces : **titre → image (flex:1) → texte**. Si pas d'image, le texte s'affiche seul sous le titre. Si recto entièrement vide : icône `Icons.Flip` en placeholder (opacité 0.2).

L'éditeur est divisé en deux sections colorées : **Recto** (violet) et **Verso** (bleu).

---

## QuizSlideEditor — comportement

- Champ `questionImage` (via `FileUrlInput`) entre titre et question
- Toggle "Plusieurs réponses" (`multiAnswer`) entre question et liste des options
- En mode réponse unique : sélection radio-like, même style visuel que multi
- Bouton vérifier → si réponses manquantes en mode multi : affiche `(N restant)`
- En cas d'erreur : message rouge (`wrongMessage` ou générique) + bouton "Réessayer"
- Pas d'affichage de la bonne réponse sur erreur

---

## RevealSlideEditor / RevealPreview

- Texte gauche fixe + image droite qui coulisse à gauche au clic → révèle texte droit
- Re-clic → animation inverse
- Texte indicatif "Cliquez pour révéler →" en bas
- Pas de barre de séparation entre zones

---

## TrueFalseSlideEditor / TrueFalsePreview

- Champs : `statement`, `correct` (true/false), `explanation` (optionnelle, montrée après réponse)

---

## Note environnement

La traduction automatique du navigateur (Google Translate, DeepL, etc.) peut interférer avec le rendu. Vérifier qu'elle est désactivée avant de diagnostiquer un bug visuel.
