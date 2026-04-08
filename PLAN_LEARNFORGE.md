# LearnForge — Plan Complet du Projet

> Document de référence stratégique, technique et business
> Mis à jour : Avril 2026

---

## VISION GLOBALE

LearnForge est une plateforme de création, d'hébergement et de suivi de formations en ligne. Elle s'adresse aux formateurs indépendants, professeurs, coachs et entreprises qui souhaitent créer des cours interactifs sans compétences techniques.

**Positionnement :** Un outil simple, puissant et abordable — entre le PowerPoint amateur et Teachable/Thinkific trop complexes et trop chers.

---

## ÉTAT ACTUEL DU PROJET

### Ce qui existe

| Composant | État | Description |
|---|---|---|
| Outil (CourseBuilder) | Fonctionnel | App React sans backend, tout en mémoire |
| Site vitrine | Existant | Page de présentation statique |
| Export JSON | Fonctionnel | Seul moyen de sauvegarder |
| Backend | Inexistant | À créer entièrement |
| Base de données | Inexistante | À créer |
| Authentification | Inexistante | À créer |
| Paiements | Inexistants | À créer |

### Types de slides déjà disponibles dans l'outil
- Texte, Image, Vidéo, Code exécutable (JS/Python/HTML/CSS)
- Quiz, Vrai/Faux, Texte à trous, Carte à retourner (flip), Révélation

### Problèmes connus à corriger
1. Retry quiz cassé (réponse précédente reste en mémoire)
2. Aperçu code non synchronisé en temps réel
3. Nom codé en dur dans le certificat ("Jean Dupont")
4. Champ "explication" manquant sur les slides Vrai/Faux

---

## FONCTIONNALITÉS FUTURES PLANIFIÉES

---

### 1. CLASSE VIRTUELLE

**Concept :** Un espace partagé entre un formateur et ses apprenants. Le formateur peut créer des sessions, surveiller la progression en temps réel, et analyser les résultats.

#### Fonctionnalités détaillées

**Côté formateur :**
- Créer une classe et y inviter des apprenants (lien ou code d'accès)
- Tableau de suivi : voir la progression de chaque apprenant (% completion, quiz réussis, temps passé)
- Exporter les résultats (CSV/PDF)
- Commenter les formations ou envoyer des messages aux apprenants
- Voir les statistiques agrégées : taux de completion, questions les plus ratées, etc.
- Mode "live" : diffuser une formation en temps réel et voir les apprenants suivre en direct

**Côté apprenant :**
- Rejoindre une classe via code ou lien
- Voir les formations assignées par le formateur
- Progression sauvegardée automatiquement
- Notifications (nouvelle formation assignée, délai à respecter, etc.)

**Architecture technique nécessaire :**
- Système de rôles (admin / formateur / apprenant)
- Base de données des inscriptions (classe ↔ apprenant ↔ formation)
- Table de progression par utilisateur et par slide
- WebSockets pour le mode live (optionnel, phase 2)
- API de reporting

---

### 2. BIBLIOTHÈQUE DE FORMATIONS

**Concept :** Un catalogue public (ou semi-public) où les formateurs publient leurs formations. Les apprenants peuvent les découvrir, les acheter ou s'y inscrire gratuitement.

#### Fonctionnalités détaillées

**Catalogue public :**
- Filtrage par catégorie (développement, marketing, design, langues, etc.)
- Filtrage par prix (gratuit / payant / abonnement)
- Filtrage par niveau (débutant, intermédiaire, avancé)
- Filtrage par langue
- Tri par popularité, date, note
- Moteur de recherche full-text
- Fiches formation : description, aperçu, formateur, avis, durée estimée

**Pour les formateurs :**
- Publier/dépublier une formation
- Choisir le modèle économique : gratuit, prix fixe, prix libre, abonnement
- Configurer un accès partiel gratuit (avant-première) pour inciter à l'achat
- Ajouter des tags, catégories, prérequis
- Voir les statistiques de la formation publiée (vues, inscriptions, revenus)

**Pour les apprenants :**
- S'inscrire gratuitement ou payer pour accéder
- Ajouter à une liste de favoris
- Laisser une note et un avis après completion
- Accéder aux formations achetées à tout moment

**Architecture technique nécessaire :**
- Système de publication avec modération (optionnel)
- Base de données formations + métadonnées
- Intégration paiement (Stripe ou autre)
- Système de reviews/notes
- Moteur de recherche (Algolia ou ElasticSearch ou simple SQL LIKE)
- CDN pour les médias (images, vidéos)

---

### 3. EXPORTATEUR HTML

**Concept :** Permettre à un formateur d'exporter sa formation en un fichier HTML autonome, qui peut être intégré dans n'importe quel site web ou système informatique sans dépendre de LearnForge.

#### Fonctionnalités détaillées

- Générer un fichier HTML complet et auto-contenu (CSS + JS inline)
- La formation fonctionne offline (pas besoin de connexion internet)
- Options d'export :
  - SCORM 1.2 / SCORM 2004 (pour intégration dans des LMS comme Moodle)
  - HTML standalone (fichier unique)
  - ZIP avec assets séparés (pour hébergement sur serveur)
- Personnalisation de l'export :
  - Choisir les couleurs/logo de l'entreprise cliente
  - Ajouter ou retirer le certificat
  - Activer/désactiver certains types de slides

**Cas d'usage :**
- Entreprise qui veut intégrer une formation dans son intranet
- École qui veut mettre une formation sur son LMS
- Formateur qui veut envoyer la formation par email (zip)

**Architecture technique nécessaire :**
- Générateur HTML côté serveur (Node.js ou Python)
- Template de rendu sans dépendances externes
- Support SCORM (spec complexe, à faire en phase avancée)

---

### 4. TABLEAU DE BORD

**Concept :** L'espace central de chaque utilisateur. Différent selon le rôle (formateur ou apprenant).

> Note : Cette partie sera développée en détail après la finalisation de l'outil.

#### Tableau de bord Formateur

**Section "Mes formations" :**
- Liste des formations créées (titre, date, statut : brouillon / publié / archivé)
- Accès rapide à l'éditeur
- Statistiques par formation (apprenants, taux de completion, revenus)
- Actions : dupliquer, archiver, supprimer, exporter

**Section "Mes classes" :**
- Créer et gérer des classes
- Liste des apprenants par classe
- Suivi de progression en temps réel

**Section "Revenus" :**
- Historique des transactions
- Graphique des revenus mensuels
- Solde disponible + bouton retrait (via virement ou PayPal)

**Section "Profil" :**
- Photo, bio, liens réseaux sociaux
- Page publique de formateur (liste de ses formations publiées)

#### Tableau de bord Apprenant

**Section "Mes formations" :**
- Formations en cours (avec % de progression)
- Formations terminées (avec certificats téléchargeables)
- Formations achetées/sauvegardées

**Section "Mes classes" :**
- Classes dont il est membre
- Formations assignées par ses formateurs

**Section "Profil" :**
- Modifier son profil
- Historique de ses achats
- Paramètres de notifications

---

## INFRASTRUCTURE TECHNIQUE

---

### BACKEND

**Stack recommandée (à valider selon tes compétences) :**

**Option A — Node.js + Express (le plus proche de ce que tu fais déjà en React) :**
- Framework : Express.js ou Fastify
- ORM : Prisma (excellent avec TypeScript)
- Base de données : PostgreSQL (robuste, gratuit, scalable)
- Authentification : NextAuth ou Auth.js + JWT
- Upload fichiers : Multer + stockage S3 (ou Cloudflare R2, moins cher)

**Option B — Next.js fullstack (simplifie l'architecture) :**
- Frontend + Backend dans le même projet
- API Routes intégrées
- Facilement déployable sur Vercel
- Recommandé si tu veux avancer vite

**Option C — Backend as a Service (le plus rapide à mettre en place) :**
- Supabase (PostgreSQL + Auth + Storage tout-en-un, gratuit jusqu'à un certain volume)
- Ou Firebase (Google, NoSQL, moins adapté aux formations structurées)
- Recommandé pour démarrer vite et valider le produit

**Ma recommandation :** Commencer avec **Supabase** pour valider rapidement, puis migrer vers une architecture custom si le volume le justifie.

---

### AUTHENTIFICATION

- Email/mot de passe (obligatoire)
- Google OAuth (très demandé)
- Magic Link (connexion sans mot de passe via email)
- Gestion des rôles : admin, formateur, apprenant
- Reset de mot de passe
- Vérification email à l'inscription

---

### PAIEMENTS

**Stripe** est le choix évident pour la France :
- Paiements par carte (CB, Visa, Mastercard)
- Virements SEPA
- Abonnements récurrents (Stripe Subscriptions)
- Marketplace (Stripe Connect) pour les paiements aux formateurs
- Gestion TVA automatique (Stripe Tax) — important pour la conformité française/européenne

**Modèles économiques à prévoir :**
- Achat à l'unité (one-time payment)
- Abonnement mensuel/annuel (accès à tout le catalogue)
- Modèle commission (tu prends X% sur les ventes des formateurs)
- Plan "formateur pro" (abonnement mensuel pour accéder aux fonctionnalités avancées)

---

### HÉBERGEMENT

**Recommandations par composant :**

| Composant | Option recommandée | Alternative |
|---|---|---|
| Frontend | Vercel (gratuit, CDN mondial) | Netlify |
| Backend API | Railway ou Render | VPS Hetzner (plus de contrôle) |
| Base de données | Supabase (managed PostgreSQL) | PlanetScale |
| Fichiers/médias | Cloudflare R2 (très bon rapport qualité/prix) | AWS S3 |
| Emails transactionnels | Resend ou Brevo (ex-Sendinblue, français) | SendGrid |
| Domaine | OVH (français, fiable) | Namecheap |

**Estimation coûts hébergement mensuel (démarrage) :**
- Phase 0-100 utilisateurs : ~20-40€/mois
- Phase 100-1000 utilisateurs : ~80-150€/mois
- Phase 1000+ utilisateurs : à affiner selon la consommation réelle

---

## BUSINESS & ADMINISTRATIF

---

### STATUT JURIDIQUE

**Options pour un entrepreneur solo en France :**

**1. Micro-entreprise (auto-entrepreneur)**
- Le plus simple à créer (en ligne en 15 minutes)
- Charges proportionnelles au CA (pas de ventes = pas de charges)
- Plafond CA : 77 700€/an pour les services (si dépasse, bascule vers régime normal)
- TVA : non collectée jusqu'à ~37 500€ de CA annuel (franchise en base)
- Inconvénient : charges sociales élevées (~22% sur le CA), pas d'optimisation fiscale

**2. SASU (Société par Actions Simplifiée Unipersonnelle)**
- Statut de président assimilé salarié (protection sociale complète)
- Plus de flexibilité fiscale (impôt sur les sociétés : 15% jusqu'à 42 500€, puis 25%)
- Possibilité de se rémunérer en dividendes (moins chargé que le salaire)
- Inconvénient : plus complexe à gérer, comptabilité obligatoire, coûts de création ~500-1000€

**3. EURL (Entreprise Unipersonnelle à Responsabilité Limitée)**
- Similaire à la SASU mais gérant non-salarié (TNS)
- Charges sociales moins élevées sur les dividendes
- Bonne option si tu veux optimiser les charges dès le départ

**Ma recommandation :**
- Si tu débutes et n'es pas sûr de la rentabilité → **Micro-entreprise** (zéro risque)
- Si tu as déjà de la visibilité et vises 30k€+ de CA la première année → **SASU**

---

### PLAN COMPTABLE & FINANCES

**Charges prévisionnelles :**

| Poste | Estimation mensuelle |
|---|---|
| Hébergement + infrastructure | 40-150€ |
| Stripe (frais de transaction) | ~1.4% + 0.25€ par transaction |
| Outils marketing (email, analytics) | 20-50€ |
| Comptable (optionnel micro-entreprise) | 0-100€ |
| Domaine(s) | ~2€/mois |
| **Total estimé (démarrage)** | **~80-300€/mois** |

**Compte bancaire professionnel :**
- Obligatoire en société (SASU/EURL)
- Recommandé en micro-entreprise pour séparer pro et perso
- Options : Qonto, Shine, Propulse by CA (tous adaptés aux indépendants)

**Comptabilité :**
- Micro-entreprise : tu peux gérer seul avec un tableur ou un outil comme Indy
- SASU : expert-comptable obligatoire ou quasi-obligatoire, coût ~1200-3000€/an
- Outil recommandé : Indy (ex-Georges) — fait pour les indépendants français

---

### ADMINISTRATIF

**Étapes de création :**
1. Choisir le statut juridique
2. Déclarer sur le site de l'INPI (guichet unique) ou via Legalstart/Indy
3. Ouvrir un compte bancaire pro
4. S'immatriculer à la TVA si nécessaire
5. Rédiger les CGU, CGV, et Politique de confidentialité (RGPD obligatoire)
6. Déclarer le traitement de données à la CNIL si collecte de données personnelles

**Documents légaux à créer :**
- CGU (Conditions Générales d'Utilisation)
- CGV (Conditions Générales de Vente)
- Politique de confidentialité (RGPD)
- Mentions légales sur le site
- Contrat formateur (si tu accueilles des formateurs tiers)

**RGPD — Points critiques :**
- Consentement aux cookies obligatoire (bannière conforme)
- Droit à l'oubli : permettre à un utilisateur de supprimer son compte et ses données
- Hébergement des données en Europe si possible (Supabase a des régions EU)
- Ne pas transférer de données hors UE sans garanties

---

## MARKETING & ACQUISITION

---

### SEO (Référencement naturel)

**Stratégie de contenu :**
- Blog sur les thématiques : "comment créer une formation en ligne", "outil de e-learning", "formateur indépendant"
- Pages optimisées par mots-clés : "créer cours en ligne gratuit", "logiciel formation e-learning France"
- Comparatifs avec les concurrents (Teachable, Thinkific, Podia, Kajabi)
- Tutoriels vidéo (YouTube → trafic organique)

**SEO Technique :**
- Site rapide (Core Web Vitals)
- Schema.org pour les formations (rich snippets)
- Sitemap XML
- Meta descriptions optimisées

**Mots-clés cibles (exemples) :**
- "créer formation en ligne" — Fort volume, forte concurrence
- "logiciel cours en ligne formateur" — Volume moyen, concurrence moyenne
- "outil e-learning gratuit" — Bon pour l'acquisition gratuite
- "LearnForge" — Marque propre (à construire)

---

### PROSPECTION & VENTES

**Cibles prioritaires :**

1. **Formateurs indépendants** (coaching, développement personnel, langues)
   - Présents sur LinkedIn, Instagram, YouTube
   - Douleur : les outils existants sont trop chers ou trop complexes

2. **Professeurs particuliers** (maths, sciences, prépa)
   - Cherchent à digitaliser leurs cours
   - Sensibles au prix (offre freemium efficace)

3. **Entreprises avec besoin de formation interne**
   - Formation onboarding, process interne
   - Budget plus important, décision plus longue

4. **Organismes de formation** (OPCO, Qualiopi)
   - Volume important mais processus d'achat long
   - À cibler en phase avancée

**Canaux d'acquisition :**

| Canal | Priorité | Coût | Délai |
|---|---|---|---|
| LinkedIn (contenu + outreach) | Haute | Gratuit | 1-3 mois |
| SEO / Blog | Haute | Temps | 3-6 mois |
| YouTube (tutoriels) | Moyenne | Temps | 3-12 mois |
| Partenariats (coachs, formateurs influents) | Haute | Commissions | 1-2 mois |
| Google Ads | Moyenne | Budget | Immédiat |
| ProductHunt / Indie Hackers | Basse | Gratuit | 1 mois |
| Cold email B2B | Basse | Temps | 1-3 mois |

**Stratégie Freemium recommandée :**
- Gratuit : créer jusqu'à 2 formations, 20 apprenants max, pas de paiements
- Pro (19-39€/mois) : formations illimitées, 200 apprenants, domaine personnalisé
- Business (79-149€/mois) : apprenants illimités, classes, analytics avancés, export SCORM

---

## ROADMAP — PHASES DE DÉVELOPPEMENT

---

### PHASE 0 — Stabilisation (Actuelle, 1-2 mois)

**Objectif : Corriger les bugs et préparer le terrain**

- [ ] Corriger le bug retry quiz
- [ ] Synchroniser l'aperçu code en temps réel
- [ ] Ajouter le champ explication aux slides Vrai/Faux
- [ ] Rendre le nom du certificat modifiable
- [ ] Améliorer le site vitrine
- [ ] Créer les pages légales (CGU, CGV, RGPD)
- [ ] Choisir et créer le statut juridique
- [ ] Ouvrir le compte bancaire pro

---

### PHASE 1 — Backend & Auth (2-4 mois)

**Objectif : Transformer l'outil local en plateforme en ligne**

- [ ] Mettre en place Supabase (base de données + auth)
- [ ] Authentification (email/password + Google OAuth)
- [ ] Sauvegarde des formations en base de données (fini le tout-mémoire)
- [ ] Interface de gestion de compte basique
- [ ] Déploiement en production (Vercel + Supabase)
- [ ] Système de domaine personnalisé + HTTPS

---

### PHASE 2 — Tableau de bord (2-3 mois)

**Objectif : Donner aux utilisateurs un espace personnel complet**

- [ ] Tableau de bord formateur (mes formations, stats)
- [ ] Tableau de bord apprenant (formations suivies, progression)
- [ ] Système de progression sauvegardé côté serveur
- [ ] Profil public du formateur
- [ ] Gestion des rôles (formateur / apprenant)

---

### PHASE 3 — Bibliothèque & Paiements (3-4 mois)

**Objectif : Monétiser la plateforme**

- [ ] Catalogue public de formations
- [ ] Intégration Stripe (paiements, abonnements)
- [ ] Système d'inscription formateur (création de compte pro)
- [ ] Pages de vente des formations
- [ ] Système d'avis et de notes
- [ ] Dashboard revenus pour les formateurs

---

### PHASE 4 — Classe Virtuelle (3-4 mois)

**Objectif : Mode collaboratif formateur ↔ apprenants**

- [ ] Création et gestion de classes
- [ ] Invitation des apprenants (lien / code)
- [ ] Tableau de suivi formateur (progression par apprenant)
- [ ] Notifications in-app et email
- [ ] Export des résultats (CSV/PDF)

---

### PHASE 5 — Export HTML & SCORM (2-3 mois)

**Objectif : Permettre l'intégration dans des systèmes tiers**

- [ ] Générateur HTML standalone (export en 1 clic)
- [ ] Export SCORM 1.2 (compatibilité Moodle et autres LMS)
- [ ] Personnalisation de l'export (logo, couleurs)
- [ ] Documentation technique pour les intégrations

---

### PHASE 6 — Growth & Scale (en continu)

**Objectif : Croissance et amélioration continue**

- [ ] SEO et content marketing
- [ ] Programme d'affiliation pour les formateurs
- [ ] Application mobile (React Native)
- [ ] API publique pour les développeurs
- [ ] Intégrations tierces (Zapier, HubSpot, Slack)
- [ ] Support multilingue (EN, ES, DE prioritaires)

---

## ANALYSE SWOT

| Forces | Faiblesses |
|---|---|
| Outil déjà fonctionnel et complet | Pas de backend, pas de persistance |
| Types de slides très riches (10 types) | Projet solo, ressources limitées |
| Design clean et moderne | Pas de notoriété |
| Coût de départ faible | Concurrence établie |

| Opportunités | Menaces |
|---|---|
| Marché e-learning en forte croissance | Teachable, Kajabi, Notion, Canva |
| Manque d'outils simples en français | Changements algorithmiques SEO |
| Apprenants de + en + autonomes | Évolutions légales (RGPD, Qualiopi) |
| Formation professionnelle = budget OPCO | Risque technique si solo |

---

## CONCURRENTS À SURVEILLER

| Concurrent | Forces | Faiblesses | Ton avantage |
|---|---|---|---|
| Teachable | Connu, complet | Cher (39$/mois min), en anglais | Prix, langue française |
| Thinkific | Bon pour les formateurs | Complexe, cher | Simplicité |
| Podia | Simple | Peu d'interactivité | Types de slides riches |
| Kajabi | Tout-en-un | Très cher (149$/mois) | Prix |
| Notion | Flexible | Pas fait pour les formations | Interactivité, quiz, progression |
| Canva | Design facile | Pas de LMS | Fonctionnalités pédagogiques |

---

## PROCHAINES ACTIONS IMMÉDIATES

1. **Cette semaine :** Corriger les 4 bugs connus de l'outil
2. **Ce mois-ci :** Décider du statut juridique et le créer
3. **Ce mois-ci :** Choisir la stack backend (Supabase recommandé)
4. **Dans 2 mois :** Lancer la beta avec 5-10 formateurs pilotes
5. **Dans 3 mois :** Première version avec authentification et sauvegarde en ligne

---

*Document vivant — à mettre à jour régulièrement au fil de l'avancement du projet.*
