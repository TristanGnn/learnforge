# Explications du projet LearnForge (MakeCourses)

> Ce fichier est destiné à être lu par une IA pour qu'elle puisse expliquer le projet à son créateur.
> Le créateur a tout fait en "vibe coding" (coder sans forcément comprendre ce qu'on fait).
> Explique les choses simplement, sans jargon technique inutile.

---

## C'est quoi ce projet ?

C'est une application web qui permet de **créer des formations en ligne**.
On peut créer des modules, ajouter des slides de différents types, et les apprenants peuvent les suivre.

L'application tourne entièrement dans le navigateur. Il n'y a pas de serveur, pas de base de données.
Tout est en mémoire : si on recharge la page, tout est perdu (sauf si on exporte en JSON).

---

## Comment lancer le projet ?

```bash
cd /home/frank/projets/learnforge
npm run dev
```

Ça ouvre l'app sur http://localhost:5173

---

## La pile technique (ce qui fait tourner l'app)

### React
C'est la bibliothèque principale. Elle permet de construire l'interface avec des "composants"
(des morceaux d'interface réutilisables). React gère aussi ce qu'on appelle le "state" :
les données qui changent en temps réel (ex: la slide sélectionnée, le contenu d'un champ...).

Les hooks React utilisés dans le projet :
- `useState` → stocker une valeur qui peut changer (ex: le mode "edit" ou "preview")
- `useEffect` → exécuter du code quand quelque chose change (ex: scroller vers une slide)
- `useRef` → accéder directement à un élément HTML (ex: un textarea pour le redimensionner)
- `useCallback` → mémoriser une fonction pour éviter de la recréer à chaque rendu

### Vite
C'est l'outil qui fait tourner le projet en développement (`npm run dev`).
Il transforme le code JSX (la syntaxe React) en JavaScript que le navigateur comprend.
Il gère aussi le rechargement automatique quand on modifie un fichier.

### JSX
C'est la syntaxe utilisée dans les fichiers `.jsx`. Ça ressemble à du HTML mais c'est du JavaScript.
Exemple : `<button onClick={...}>Cliquer</button>` — c'est du JSX, pas du HTML.

---

## La structure des fichiers

```
learnforge/
├── src/
│   ├── main.jsx          → Point d'entrée : monte l'app React dans la page HTML
│   ├── App.jsx           → Composant racine minimal, retourne juste <CourseBuilder />
│   ├── CourseBuilder.jsx → TOUTE l'application est ici (~1800 lignes)
│   ├── index.css         → Reset CSS minimal (margin: 0 sur le body)
│   └── App.css           → #root en pleine hauteur (100vh)
├── public/
│   └── pyodide-worker.js → Worker pour exécuter du Python dans le navigateur
├── index.html            → Page HTML de base, contient <div id="root">
├── package.json          → Liste des dépendances et scripts npm
├── vite.config.js        → Configuration de Vite
├── CLAUDE.md             → Instructions pour l'IA qui aide sur le projet
└── EXPLICATIONS.md       → Ce fichier
```

Le choix de tout mettre dans un seul fichier (`CourseBuilder.jsx`) est voulu.
C'est plus simple à gérer pour un projet solo, même si ça devient long.

---

## Comment l'app est organisée en interne (CourseBuilder.jsx)

### Les données (le "state")

Tout ce que l'app sait à un instant T est stocké dans des variables `useState` :

- `course` → la formation complète (titre, modules, slides)
- `activeModuleIdx` → quel module est sélectionné dans l'éditeur
- `activeSlideIdx` → quelle slide est sélectionnée dans l'éditeur
- `mode` → est-on en mode "edit", "preview" ou "certificate" ?
- `quizAnswers` → les réponses données aux quiz par l'apprenant
- `flippedCards` → quelles cartes à retourner ont été retournées
- `scrollPercents` → jusqu'où l'apprenant a scrollé dans chaque module

### La structure d'une formation

```
course = {
  title: "Nom de la formation",
  description: "...",
  modules: [
    {
      id: "abc1234",     ← identifiant unique généré par uid()
      title: "Module 1",
      slides: [
        { id: "xyz5678", type: "text", title: "...", content: "..." },
        { id: "...", type: "quiz", ... },
        ...
      ]
    }
  ]
}
```

### Les types de slides disponibles

| Type | Ce que c'est |
|---|---|
| `text` | Un bloc de texte simple |
| `image` | Une image ou vidéo avec description |
| `quiz` | Question à choix multiples (une ou plusieurs bonnes réponses) |
| `flip` | Carte qu'on retourne (recto/verso) |
| `code` | Bloc de code exécutable (JS, Python, HTML, CSS) |
| `separator` | Séparation visuelle entre sections |
| `fillblank` | Texte à trous : l'apprenant complète les mots manquants |
| `truefalse` | Question Vrai ou Faux |
| `reveal` | Image qui glisse et révèle un texte caché |

### Les 3 modes de l'application

**Mode "edit"** (éditeur) :
- Colonne gauche : liste des modules et slides (sidebar)
- Colonne centrale : formulaire pour modifier la slide sélectionnée
- Colonne droite : aperçu en direct de toutes les slides du module

**Mode "preview"** (apprenant) :
- Vue de toutes les slides d'un module sur une seule page
- Les quiz, cartes et textes à trous sont interactifs
- Une barre de progression est calculée en temps réel

**Mode "certificate"** :
- Aperçu du certificat de réussite
- Le nom "Jean Dupont" est actuellement codé en dur (pas encore modifiable)

---

## La progression de l'apprenant

Pour chaque module, la progression est calculée comme ça :

- **40%** vient du scroll (a-t-il lu jusqu'en bas ?)
- **30%** vient des cartes flip (a-t-il retourné toutes les cartes ?)
- **30%** vient des quiz (a-t-il répondu correctement à tous les quiz ?)

Si le module n'a ni carte flip ni quiz, la progression = 100% basée sur le scroll uniquement.

---

## Les composants réutilisables

### AutoTextarea
Un champ de texte qui grandit automatiquement en hauteur selon ce qu'on tape.
Utilisé partout dans les éditeurs de slides.
Supporte aussi la touche Tab pour indenter (utile pour le code).

### FileUrlInput
Un champ pour entrer une URL d'image/vidéo OU importer un fichier depuis son ordinateur.
Le fichier importé est converti en base64 (une longue chaîne de texte) pour être stocké sans serveur.

### HighlightTextarea
Un textarea spécial utilisé dans l'éditeur "Texte à trous".
Il surligne en violet les mots déjà définis comme trous, directement dans le champ de saisie.
Technique : un div invisible en dessous contient le texte surligné, le textarea transparent est par-dessus.

---

## L'exécution de code (slides "code")

Pour les slides de type "code", l'apprenant peut exécuter du vrai code :

**JavaScript / HTML / CSS** :
Exécuté dans une iframe isolée (sandbox). Le code ne peut pas accéder au reste de la page.
Les `console.log()` sont interceptés et affichés dans une console intégrée.

**Python** :
Exécuté via Pyodide — c'est Python qui tourne entièrement dans le navigateur grâce à WebAssembly.
Ça nécessite de télécharger ~10 Mo au premier lancement.
Le fichier `/public/pyodide-worker.js` gère ça dans un Web Worker (thread séparé).

---

## Les styles

Pas de CSS externe, pas de Tailwind, pas de bibliothèque de composants.
Tout est en "inline styles" React (des objets JavaScript passés directement aux éléments).

L'objet `S` (défini à la fin de CourseBuilder.jsx) contient les styles réutilisables :
- `S.input` → style d'un champ de saisie
- `S.btnPri` → bouton violet principal
- `S.btnSec` → bouton gris secondaire
- `S.pCard` → carte d'aperçu (fond sombre, coins arrondis)
- etc.

---

## L'export JSON

Le bouton "Exporter JSON" dans le header copie toute la formation dans le presse-papier.
Ce JSON peut être réimporté ou sauvegardé dans un fichier texte.
C'est le seul moyen de sauvegarder le travail (pas de base de données).

---

## Les problèmes connus du projet

1. **Retry quiz cassé** : après une mauvaise réponse, cliquer "Réessayer" ne remet pas vraiment le quiz à zéro. La réponse précédente reste en mémoire dans le composant parent.

2. **Code preview désynchronisé** : si on modifie le code d'une slide dans l'éditeur, l'aperçu en direct ne se met pas à jour automatiquement.

3. **Champ "explication" manquant** : les slides Vrai/Faux ont prévu un champ `explanation` (explication affichée après la réponse) mais il n'est ni dans l'éditeur ni dans l'aperçu.

4. **Nom hardcodé dans le certificat** : le nom "Jean Dupont" est écrit directement dans le code. Il n'y a pas de champ pour que l'apprenant entre son vrai nom.

5. **Tout sur un seul fichier** : ça fonctionne bien pour l'instant mais si le projet grossit encore, ça deviendra difficile à maintenir.

---

## Ce que ce projet ne fait PAS (et c'est normal)

- Pas de sauvegarde automatique (tout disparaît au rechargement)
- Pas de compte utilisateur
- Pas de partage en ligne de formations
- Pas d'historique des modifications
- Pas de collaboration multi-utilisateurs

C'est un outil de création locale, pensé pour être simple et sans infrastructure serveur.
