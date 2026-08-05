import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, Dumbbell, Calendar as CalendarIcon, User, Apple, Flame, Trophy,
  Zap, ChevronRight, ChevronLeft, Play, Check, Clock, TrendingUp, Award,
  Droplet, Target, ArrowLeft, X, Star, Plus, Minus, BarChart3, Heart,
  Shield, Info, Share, Download, Sparkles, Timer, Activity, Salad,
  Sun, Moon, Lock, CheckCircle2, ChevronDown, Menu, LogOut, Mail, KeyRound,
  Building2, HomeIcon, Coffee, UserPlus, LogIn, Eye, EyeOff, Users,
  ClipboardList, ShieldCheck, XCircle, Send, Edit3, Hourglass, RefreshCw,
  UserCog, MailX, Copy, Bookmark, MessageCircle, AlertTriangle, CheckCheck,
  LayoutDashboard, PlayCircle
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  signUp, signIn, signOut, getSessionProfile, updateOwnProgress, markSessionDone, completeOnboarding,
  listAllProfiles, setProfileStatus, assignLibraryProgram, assignCustomProgram,
  listTemplates, saveTemplate, deleteTemplate,
  listMessages, sendMessage, markMessagesRead,
} from "./lib/api.js";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid
} from "recharts";

/* ============================================================
   FONTS + GLOBAL KEYFRAMES
============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    html, body, #root { margin: 0; padding: 0; }
    html, body {
      background: #000000; overscroll-behavior-y: none;
      -webkit-user-select: none; user-select: none;
      -webkit-touch-callout: none;
    }
    input, textarea { -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; }
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    .ff-display { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif; font-weight: 700; letter-spacing: -0.022em; }
    .ff-body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Segoe UI', sans-serif; letter-spacing: -0.006em; }
    .ff-mono { font-family: 'SF Mono', 'SFMono-Regular', ui-monospace, 'JetBrains Mono', Menlo, monospace; }
    button { font-family: inherit; }
    button:active { transform: scale(0.97); }
    input, select, textarea { font-family: inherit; }
    .app-scroll { overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
    @keyframes fadeUp { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform: translateY(0);} }
    @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
    @keyframes pulseGlow { 0%,100%{ box-shadow: 0 0 0px rgba(0,113,227,0.0);} 50%{ box-shadow: 0 0 28px rgba(0,113,227,0.35);} }
    @keyframes popIn { 0%{ transform: scale(0.85); opacity:0;} 100%{ transform: scale(1); opacity:1;} }
    @keyframes overlayIn { from { opacity:0;} to { opacity:1;} }
    @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
    @keyframes softPulse { 0%,100%{ opacity:1;} 50%{ opacity:.55;} }
    .anim-fadeUp { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
    .anim-fadeIn { animation: fadeIn .35s ease both; }
    .anim-pop { animation: popIn .35s cubic-bezier(.34,1.56,.64,1) both; }
    .anim-spin { animation: spin 1s linear infinite; }
    .anim-softPulse { animation: softPulse 1.6s ease-in-out infinite; }
    .scrollbar-none::-webkit-scrollbar{ display:none; }
    .scrollbar-none{ -ms-overflow-style:none; scrollbar-width:none; }
  `}</style>
);

/* ============================================================
   THEME — inspiré du langage visuel Apple (SF Pro, gris Apple,
   bleu système, larges rayons, verre dépoli)
============================================================ */
const palette = (dark) => ({
  dark,
  bg: dark ? "#000000" : "#F5F5F7",
  bgGrad: dark
    ? "radial-gradient(120% 90% at 15% -10%, #1C1C1E 0%, #000000 55%)"
    : "radial-gradient(120% 90% at 15% -10%, #FFFFFF 0%, #F5F5F7 55%)",
  surface: dark ? "#1C1C1E" : "#FFFFFF",
  surface2: dark ? "#2C2C2E" : "#F0F0F2",
  border: dark ? "#38383A" : "#E5E5E7",
  text: dark ? "#F5F5F7" : "#1D1D1F",
  muted: dark ? "#98989D" : "#6E6E73",
  electric: dark ? "#0A84FF" : "#0071E3",
  electric2: dark ? "#64D2FF" : "#42A5F5",
  gradA: "linear-gradient(135deg,#0071E3 0%, #42A5F5 100%)",
  gradB: "linear-gradient(135deg,#012169 0%, #0071E3 55%, #42A5F5 100%)",
  success: dark ? "#30D158" : "#34C759",
  warning: "#FF9F0A",
  danger: "#FF3B30",
});

const Logo = ({ c, size = 34, style }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28, background: c.gradA,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    boxShadow: `0 ${size * 0.12}px ${size * 0.5}px rgba(0,113,227,0.35)`, ...style
  }}>
    <span className="ff-display" style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.36, letterSpacing: -0.5, lineHeight: 1 }}>N2K</span>
  </div>
);

/* ============================================================
   EXERCISE POOLS — séparés Salle (gym) / Maison (home)
============================================================ */
const WARMUP = [
  { name: "Rotation des bras", d: "45 sec", tips: "Amplitude complète, épaules relâchées." },
  { name: "Talons-fesses", d: "1 min", tips: "Rythme progressif, respiration régulière." },
  { name: "Montées de genoux", d: "1 min", tips: "Gainage actif, buste droit." },
  { name: "Vélo / rameur léger", d: "3 min", tips: "Cadence facile pour élever la fréquence cardiaque." },
  { name: "Cercles de hanches", d: "40 sec", tips: "Mobilise l'articulation en douceur." },
];
const COOLDOWN = [
  { name: "Étirement ischio-jambiers", d: "30 sec / jambe", tips: "Ne forcez jamais, respirez profondément." },
  { name: "Étirement quadriceps", d: "30 sec / jambe", tips: "Gardez les genoux alignés." },
  { name: "Étirement dorsaux", d: "45 sec", tips: "Dos rond, relâchez la nuque." },
  { name: "Respiration diaphragmatique", d: "1 min", tips: "Inspirez 4 sec, expirez 6 sec." },
];

const POOLS = {
  push: [
    { name: "Développé couché barre", sets: 4, reps: "8 reps", rest: 90, diff: "Difficile", tips: "Trajectoire stable, coudes à 75°.", safety: "Toujours avec un pareur proche du 1RM.", equip: "Barre + banc" },
    { name: "Développé incliné haltères", sets: 4, reps: "10 reps", rest: 75, diff: "Modéré", tips: "Contrôlez la descente.", safety: "Échauffez les épaules avant.", equip: "Haltères + banc incliné" },
    { name: "Écarté poulie vis-à-vis", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Légère flexion des coudes, contraction en fin de mouvement.", safety: "Amplitude progressive.", equip: "Poulies" },
    { name: "Développé militaire haltères", sets: 4, reps: "10 reps", rest: 75, diff: "Modéré", tips: "Poussez à la verticale sans cambrer.", safety: "Gainage abdominal actif.", equip: "Haltères" },
    { name: "Élévations latérales", sets: 3, reps: "14 reps", rest: 45, diff: "Facile", tips: "Coudes légèrement fléchis, montée jusqu'à l'épaule.", safety: "Charge légère, mouvement contrôlé.", equip: "Haltères" },
    { name: "Extension triceps poulie haute", sets: 3, reps: "12 reps", rest: 45, diff: "Facile", tips: "Coudes fixes le long du corps.", safety: "Ne verrouillez pas brutalement le coude.", equip: "Poulie" },
    { name: "Dips lestés", sets: 3, reps: "10 reps", rest: 75, diff: "Difficile", tips: "Buste légèrement penché en avant pour cibler les pectoraux.", safety: "Amplitude adaptée à la mobilité d'épaule.", equip: "Barres parallèles" },
  ],
  pull: [
    { name: "Tirage vertical poulie", sets: 4, reps: "10 reps", rest: 75, diff: "Modéré", tips: "Tirez la barre vers le haut du buste.", safety: "Évitez de vous pencher en arrière.", equip: "Poulie haute" },
    { name: "Rowing barre", sets: 4, reps: "10 reps", rest: 90, diff: "Difficile", tips: "Dos plat, tirez vers le nombril.", safety: "Charge progressive, gainage constant.", equip: "Barre" },
    { name: "Tirage horizontal poulie basse", sets: 4, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Rapprochez les omoplates en fin de mouvement.", safety: "Dos neutre, ne vous affalez pas.", equip: "Poulie basse" },
    { name: "Soulevé de terre", sets: 4, reps: "8 reps", rest: 120, diff: "Difficile", tips: "Dos plat, barre proche des tibias.", safety: "Technique prioritaire sur la charge.", equip: "Barre" },
    { name: "Tractions assistées", sets: 3, reps: "8 reps", rest: 90, diff: "Difficile", tips: "Montée jusqu'au menton au-dessus de la barre.", safety: "Utilisez l'assistance adaptée à votre niveau.", equip: "Machine à tractions" },
    { name: "Curl barre EZ", sets: 3, reps: "12 reps", rest: 45, diff: "Facile", tips: "Coudes fixes, pas d'élan.", safety: "Charge modérée pour préserver les poignets.", equip: "Barre EZ" },
    { name: "Face pull", sets: 3, reps: "15 reps", rest: 45, diff: "Facile", tips: "Tirez vers le visage, coudes hauts.", safety: "Excellent pour la santé des épaules.", equip: "Poulie + corde" },
  ],
  legs: [
    { name: "Squat barre", sets: 4, reps: "8 reps", rest: 120, diff: "Difficile", tips: "Genoux alignés sur les pieds, descente contrôlée.", safety: "Utilisez un cage/rack de sécurité.", equip: "Barre + rack" },
    { name: "Presse à cuisses", sets: 4, reps: "12 reps", rest: 90, diff: "Modéré", tips: "Amplitude complète, ne bloquez pas les genoux.", safety: "Dos plaqué au dossier.", equip: "Presse à cuisses" },
    { name: "Fentes marchées haltères", sets: 3, reps: "12 reps / jambe", rest: 75, diff: "Modéré", tips: "Pas long et contrôlé.", safety: "Genou avant au-dessus de la cheville.", equip: "Haltères" },
    { name: "Leg extension", sets: 3, reps: "14 reps", rest: 60, diff: "Facile", tips: "Contraction du quadriceps en haut du mouvement.", safety: "Mouvement lent, sans à-coup.", equip: "Machine leg extension" },
    { name: "Leg curl allongé", sets: 3, reps: "14 reps", rest: 60, diff: "Facile", tips: "Contraction des ischios en fin de mouvement.", safety: "Amplitude progressive.", equip: "Machine leg curl" },
    { name: "Hip thrust barre", sets: 4, reps: "12 reps", rest: 90, diff: "Modéré", tips: "Contractez les fessiers en haut.", safety: "Évitez l'hyperextension lombaire.", equip: "Barre + banc" },
    { name: "Mollets debout machine", sets: 4, reps: "16 reps", rest: 45, diff: "Facile", tips: "Amplitude complète, montée haute.", safety: "Mouvement contrôlé.", equip: "Machine mollets" },
  ],
  fullbodyGym: [
    { name: "Presse à cuisses", sets: 3, reps: "12 reps", rest: 75, diff: "Facile", tips: "Amplitude complète, rythme lent.", safety: "Dos plaqué au dossier.", equip: "Presse à cuisses" },
    { name: "Tirage poulie haute", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Tirez vers le haut du buste.", safety: "Ne vous penchez pas en arrière.", equip: "Poulie haute" },
    { name: "Développé machine convergente", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Poussée contrôlée, coudes stables.", safety: "Réglez le siège avant de commencer.", equip: "Machine développé" },
    { name: "Rowing assis machine", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Rapprochez les omoplates.", safety: "Gardez le dos droit.", equip: "Machine rowing" },
    { name: "Gainage planche", sets: 3, reps: "40 sec", rest: 30, diff: "Facile", tips: "Corps aligné tête-talons.", safety: "Évitez le creux lombaire." },
    { name: "Presse mollets", sets: 3, reps: "15 reps", rest: 45, diff: "Facile", tips: "Amplitude complète.", safety: "Mouvement contrôlé.", equip: "Presse à cuisses" },
  ],
  cardioGym: [
    { name: "Rameur", sets: 5, reps: "2 min / 1 min repos", rest: 60, diff: "Modéré", tips: "Poussez avec les jambes avant de tirer avec les bras.", safety: "Dos neutre tout au long du mouvement.", equip: "Rameur" },
    { name: "Tapis de course fractionné", sets: 6, reps: "1 min rapide / 1 min lent", rest: 0, diff: "Difficile", tips: "Augmentez la vitesse progressivement.", safety: "Tenez la rambarde seulement en urgence.", equip: "Tapis de course" },
    { name: "Vélo elliptique", sets: 1, reps: "20 min continues", rest: 0, diff: "Facile", tips: "Gardez une cadence stable.", safety: "Posture droite, regard devant.", equip: "Elliptique" },
    { name: "Assault bike sprints", sets: 8, reps: "20 sec", rest: 40, diff: "Difficile", tips: "Effort maximal sur chaque sprint.", safety: "Récupération complète entre les sprints.", equip: "Assault bike" },
    { name: "Vélo assis HIIT", sets: 6, reps: "30 sec", rest: 30, diff: "Modéré", tips: "Résistance modérée, cadence élevée.", safety: "Réglez la selle avant de commencer.", equip: "Vélo" },
  ],
  hiit: [
    { name: "Squat jump", sets: 5, reps: "20 sec / 10 repos", rest: 10, diff: "Difficile", tips: "Explosivité puis réception souple.", safety: "Genoux dans l'axe des pieds." },
    { name: "Burpees explosifs", sets: 5, reps: "20 sec", rest: 10, diff: "Difficile", tips: "Rythme maximal contrôlé.", safety: "Stoppez si la forme se dégrade." },
    { name: "Fentes sautées", sets: 5, reps: "20 sec", rest: 10, diff: "Difficile", tips: "Alternez les jambes en l'air.", safety: "Réception genou fléchi." },
    { name: "Mountain climbers rapides", sets: 5, reps: "20 sec", rest: 10, diff: "Modéré", tips: "Bassin stable.", safety: "Ne creusez pas le dos." },
    { name: "Kettlebell swings", sets: 5, reps: "20 sec", rest: 10, diff: "Difficile", tips: "Poussée des hanches, pas des bras.", safety: "Dos plat en permanence.", equip: "Kettlebell" },
  ],
  abs: [
    { name: "Crunchs", sets: 3, reps: "20 reps", rest: 30, diff: "Facile", tips: "Expirez en montant.", safety: "Ne tirez pas sur la nuque." },
    { name: "Gainage planche", sets: 3, reps: "45 sec", rest: 30, diff: "Modéré", tips: "Corps aligné tête-talons.", safety: "Évitez le creux lombaire." },
    { name: "Relevés de jambes", sets: 3, reps: "15 reps", rest: 30, diff: "Modéré", tips: "Mouvement lent et contrôlé.", safety: "Bas du dos plaqué au sol." },
    { name: "Russian twists", sets: 3, reps: "20 reps", rest: 30, diff: "Modéré", tips: "Rotation depuis le buste.", safety: "Talons au sol si besoin.", equip: "Disque ou haltère léger" },
    { name: "Gainage latéral", sets: 3, reps: "30 sec / côté", rest: 30, diff: "Modéré", tips: "Hanche haute, corps aligné.", safety: "Ne laissez pas tomber le bassin." },
    { name: "Poulie haute crunch", sets: 3, reps: "15 reps", rest: 30, diff: "Modéré", tips: "Enroulez le buste vers le bas.", safety: "Genoux au sol pour stabiliser.", equip: "Poulie" },
  ],
  home: [
    { name: "Pompes", sets: 4, reps: "12 reps", rest: 45, diff: "Modéré", tips: "Coudes à 45°, corps aligné.", safety: "Gainage abdominal actif." },
    { name: "Squats au poids du corps", sets: 4, reps: "18 reps", rest: 45, diff: "Facile", tips: "Descente lente, remontée dynamique.", safety: "Talons au sol." },
    { name: "Chaise murale", sets: 3, reps: "40 sec", rest: 45, diff: "Modéré", tips: "Cuisses parallèles au sol.", safety: "Dos plaqué au mur." },
    { name: "Fentes alternées", sets: 3, reps: "12 reps / jambe", rest: 45, diff: "Modéré", tips: "Pas contrôlé, buste droit.", safety: "Genou avant stable." },
    { name: "Pont fessier", sets: 3, reps: "15 reps", rest: 45, diff: "Facile", tips: "Contractez les fessiers en haut.", safety: "Évitez l'hyperextension lombaire." },
    { name: "Dips sur chaise", sets: 3, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Coudes proches du corps.", safety: "Ne descendez pas trop bas." },
    { name: "Superman", sets: 3, reps: "15 reps", rest: 30, diff: "Facile", tips: "Levez bras et jambes simultanément.", safety: "Mouvement lent et contrôlé." },
  ],
  cardio: [
    { name: "Jumping jacks", sets: 4, reps: "45 sec", rest: 20, diff: "Facile", tips: "Cadence régulière.", safety: "Amortissez la réception." },
    { name: "Corde à sauter", sets: 4, reps: "1 min", rest: 30, diff: "Modéré", tips: "Petits sauts, poignets souples.", safety: "Sol amorti recommandé.", equip: "Corde à sauter" },
    { name: "Mountain climbers", sets: 4, reps: "30 sec", rest: 30, diff: "Modéré", tips: "Hanches basses, rythme soutenu.", safety: "Poignets alignés sous les épaules." },
    { name: "Sprint sur place", sets: 5, reps: "30 sec", rest: 30, diff: "Difficile", tips: "Genoux hauts, bras actifs.", safety: "Échauffement complet obligatoire." },
    { name: "Burpees", sets: 4, reps: "12 reps", rest: 45, diff: "Difficile", tips: "Gainage constant du début à la fin.", safety: "Dos plat en position pompe." },
  ],
};

/* ============================================================
   PROGRAMS LIBRARY
============================================================ */
const FOCUS_LABEL = {
  push: "Push · Pecs / Épaules / Triceps",
  pull: "Pull · Dos / Biceps",
  legs: "Legs · Jambes complètes",
  upper: "Upper Body",
  lower: "Lower Body",
  fullbodyGym: "Full Body (Salle)",
  cardio: "Cardio",
  hiit: "HIIT",
  abs: "Abdominaux",
  home: "Full Body (Maison)",
  custom: "Séance coach",
  repos: "Repos",
};
const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const GYM_DAY_TYPES = ["push", "pull", "legs", "upper", "lower", "fullbodyGym", "cardio", "hiit", "abs", "repos"];
const HOME_DAY_TYPES = ["home", "cardio", "hiit", "abs", "repos"];

/* ============================================================
   BIBLIOTHÈQUE D'EXERCICES — pour le constructeur de séances du coach
   Organisée par catégorie musculaire, avec filtre Salle / Maison.
============================================================ */
const EXERCISE_CATEGORIES = [
  "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps",
  "Quadriceps", "Ischios & Fessiers", "Mollets", "Abdominaux", "Cardio", "Full Body / Maison",
];
let __exId = 0;
const ex = (cat, location, name, sets, reps, rest, diff, tips, safety, equip) => ({
  id: `ex${(++__exId).toString().padStart(3, "0")}`, cat, location, name, sets, reps, rest, diff, tips, safety, equip,
});
const EXERCISE_LIBRARY = [
  // --- Pectoraux ---
  ex("Pectoraux", "gym", "Développé couché barre", 4, "8 reps", 90, "Difficile", "Trajectoire stable, coudes à 75°.", "Toujours avec un pareur proche du 1RM.", "Barre + banc"),
  ex("Pectoraux", "gym", "Développé incliné haltères", 4, "10 reps", 75, "Modéré", "Contrôlez la descente.", "Échauffez les épaules avant.", "Haltères + banc incliné"),
  ex("Pectoraux", "gym", "Développé décliné machine", 3, "12 reps", 60, "Facile", "Amplitude complète.", "Réglez le siège avant de commencer.", "Machine développé décliné"),
  ex("Pectoraux", "gym", "Écarté poulie vis-à-vis", 3, "12 reps", 60, "Facile", "Légère flexion des coudes, contraction en fin de mouvement.", "Amplitude progressive.", "Poulies"),
  ex("Pectoraux", "gym", "Écarté haltères banc plat", 3, "12 reps", 60, "Modéré", "Coudes légèrement fléchis tout du long.", "Ne descendez pas trop bas si épaules sensibles.", "Haltères + banc"),
  ex("Pectoraux", "gym", "Pec deck (butterfly)", 3, "14 reps", 60, "Facile", "Contraction maximale au centre.", "Ne claquez pas les coudes.", "Machine pec deck"),
  ex("Pectoraux", "gym", "Dips lestés (pectoraux)", 3, "10 reps", 75, "Difficile", "Buste penché en avant pour cibler les pectoraux.", "Amplitude adaptée à la mobilité d'épaule.", "Barres parallèles"),
  ex("Pectoraux", "home", "Pompes", 4, "15 reps", 45, "Modéré", "Coudes à 45°, corps aligné.", "Gainage abdominal actif."),
  ex("Pectoraux", "home", "Pompes surélevées", 3, "15 reps", 45, "Facile", "Mains sur un support stable.", "Vérifiez la stabilité du support."),
  ex("Pectoraux", "home", "Pompes déclinées (pieds surélevés)", 3, "12 reps", 60, "Difficile", "Cible le haut des pectoraux.", "Gardez le dos plat."),
  // --- Dos ---
  ex("Dos", "gym", "Tirage vertical poulie", 4, "10 reps", 75, "Modéré", "Tirez la barre vers le haut du buste.", "Évitez de vous pencher en arrière.", "Poulie haute"),
  ex("Dos", "gym", "Rowing barre", 4, "10 reps", 90, "Difficile", "Dos plat, tirez vers le nombril.", "Charge progressive, gainage constant.", "Barre"),
  ex("Dos", "gym", "Tirage horizontal poulie basse", 4, "12 reps", 60, "Modéré", "Rapprochez les omoplates en fin de mouvement.", "Dos neutre, ne vous affalez pas.", "Poulie basse"),
  ex("Dos", "gym", "Soulevé de terre", 4, "8 reps", 120, "Difficile", "Dos plat, barre proche des tibias.", "Technique prioritaire sur la charge.", "Barre"),
  ex("Dos", "gym", "Tractions assistées", 3, "8 reps", 90, "Difficile", "Montée jusqu'au menton au-dessus de la barre.", "Utilisez l'assistance adaptée à votre niveau.", "Machine à tractions"),
  ex("Dos", "gym", "Rowing haltère unilatéral", 3, "12 reps / bras", 60, "Modéré", "Dos plat, tirez le coude vers la hanche.", "Appui stable sur le banc.", "Haltère + banc"),
  ex("Dos", "gym", "Tirage nuque poulie", 3, "12 reps", 60, "Modéré", "Amplitude modérée pour préserver les épaules.", "Charge légère si mobilité limitée.", "Poulie haute"),
  ex("Dos", "home", "Superman", 3, "15 reps", 30, "Facile", "Levez bras et jambes simultanément.", "Mouvement lent et contrôlé."),
  ex("Dos", "home", "Rowing élastique", 3, "15 reps", 45, "Facile", "Coudes proches du corps.", "Ancrez bien l'élastique.", "Élastique"),
  // --- Épaules ---
  ex("Épaules", "gym", "Développé militaire haltères", 4, "10 reps", 75, "Modéré", "Poussez à la verticale sans cambrer.", "Gainage abdominal actif.", "Haltères"),
  ex("Épaules", "gym", "Développé militaire barre", 4, "8 reps", 90, "Difficile", "Trajectoire verticale stricte.", "Échauffement des épaules obligatoire.", "Barre"),
  ex("Épaules", "gym", "Élévations latérales", 3, "14 reps", 45, "Facile", "Coudes légèrement fléchis, montée jusqu'à l'épaule.", "Charge légère, mouvement contrôlé.", "Haltères"),
  ex("Épaules", "gym", "Élévations frontales", 3, "12 reps", 45, "Facile", "Montée contrôlée jusqu'à hauteur d'épaule.", "Ne balancez pas le buste.", "Haltères"),
  ex("Épaules", "gym", "Oiseau (élévation arrière)", 3, "14 reps", 45, "Facile", "Buste penché, coudes légèrement fléchis.", "Charge très légère au départ.", "Haltères"),
  ex("Épaules", "gym", "Face pull", 3, "15 reps", 45, "Facile", "Tirez vers le visage, coudes hauts.", "Excellent pour la santé des épaules.", "Poulie + corde"),
  ex("Épaules", "gym", "Shrugs (trapèzes)", 3, "15 reps", 45, "Facile", "Montée verticale des épaules.", "Ne roulez pas les épaules.", "Haltères"),
  ex("Épaules", "home", "Pike push-up", 3, "10 reps", 60, "Difficile", "Hanches hautes, corps en V inversé.", "Progressez graduellement en amplitude."),
  // --- Biceps ---
  ex("Biceps", "gym", "Curl barre EZ", 3, "12 reps", 45, "Facile", "Coudes fixes, pas d'élan.", "Charge modérée pour préserver les poignets.", "Barre EZ"),
  ex("Biceps", "gym", "Curl haltères alterné", 3, "12 reps / bras", 45, "Facile", "Supination complète en fin de mouvement.", "Coudes proches du buste.", "Haltères"),
  ex("Biceps", "gym", "Curl marteau", 3, "12 reps", 45, "Facile", "Prise neutre tout du long.", "Mouvement lent et contrôlé.", "Haltères"),
  ex("Biceps", "gym", "Curl pupitre (banc Scott)", 3, "10 reps", 60, "Modéré", "Amplitude complète sans à-coup.", "Ne verrouillez pas le coude en extension.", "Banc Scott + barre EZ"),
  ex("Biceps", "gym", "Curl câble poulie basse", 3, "14 reps", 45, "Facile", "Tension constante grâce à la poulie.", "Coudes fixes.", "Poulie basse"),
  ex("Biceps", "home", "Curl élastique", 3, "15 reps", 45, "Facile", "Coudes fixes, pas d'élan.", "Ancrez bien l'élastique sous le pied.", "Élastique"),
  // --- Triceps ---
  ex("Triceps", "gym", "Extension triceps poulie haute", 3, "12 reps", 45, "Facile", "Coudes fixes le long du corps.", "Ne verrouillez pas brutalement le coude.", "Poulie"),
  ex("Triceps", "gym", "Développé couché prise serrée", 4, "10 reps", 75, "Modéré", "Coudes proches du corps.", "Charge modérée pour préserver les poignets.", "Barre + banc"),
  ex("Triceps", "gym", "Extension nuque haltère", 3, "12 reps", 45, "Facile", "Coudes fixes au-dessus de la tête.", "Mouvement lent et contrôlé.", "Haltère"),
  ex("Triceps", "gym", "Dips triceps (prise serrée)", 3, "10 reps", 60, "Modéré", "Buste vertical pour cibler les triceps.", "Amplitude adaptée à la mobilité.", "Barres parallèles"),
  ex("Triceps", "gym", "Kickback haltère", 3, "14 reps / bras", 45, "Facile", "Bras haut, extension complète du coude.", "Dos plat, appui sur le banc.", "Haltère + banc"),
  ex("Triceps", "home", "Dips sur chaise", 3, "12 reps", 60, "Modéré", "Coudes proches du corps.", "Ne descendez pas trop bas."),
  // --- Quadriceps ---
  ex("Quadriceps", "gym", "Squat barre", 4, "8 reps", 120, "Difficile", "Genoux alignés sur les pieds, descente contrôlée.", "Utilisez une cage/rack de sécurité.", "Barre + rack"),
  ex("Quadriceps", "gym", "Presse à cuisses", 4, "12 reps", 90, "Modéré", "Amplitude complète, ne bloquez pas les genoux.", "Dos plaqué au dossier.", "Presse à cuisses"),
  ex("Quadriceps", "gym", "Leg extension", 3, "14 reps", 60, "Facile", "Contraction du quadriceps en haut du mouvement.", "Mouvement lent, sans à-coup.", "Machine leg extension"),
  ex("Quadriceps", "gym", "Fentes marchées haltères", 3, "12 reps / jambe", 75, "Modéré", "Pas long et contrôlé.", "Genou avant au-dessus de la cheville.", "Haltères"),
  ex("Quadriceps", "gym", "Fentes bulgares", 3, "10 reps / jambe", 75, "Difficile", "Tronc légèrement penché en avant.", "Pied arrière stable sur le banc.", "Haltères + banc"),
  ex("Quadriceps", "gym", "Squat gobelet", 3, "14 reps", 60, "Facile", "Buste droit, descente jusqu'à parallèle.", "Bon exercice d'apprentissage du squat.", "Kettlebell/haltère"),
  ex("Quadriceps", "home", "Squats au poids du corps", 4, "20 reps", 45, "Facile", "Descente lente, remontée dynamique.", "Talons au sol."),
  ex("Quadriceps", "home", "Chaise murale", 3, "45 sec", 45, "Modéré", "Cuisses parallèles au sol.", "Dos plaqué au mur."),
  // --- Ischios & Fessiers ---
  ex("Ischios & Fessiers", "gym", "Soulevé de terre roumain", 4, "10 reps", 90, "Difficile", "Hanches reculent, dos plat.", "Barre proche des jambes tout du long.", "Barre"),
  ex("Ischios & Fessiers", "gym", "Leg curl allongé", 3, "14 reps", 60, "Facile", "Contraction des ischios en fin de mouvement.", "Amplitude progressive.", "Machine leg curl"),
  ex("Ischios & Fessiers", "gym", "Hip thrust barre", 4, "12 reps", 90, "Modéré", "Contractez les fessiers en haut.", "Évitez l'hyperextension lombaire.", "Barre + banc"),
  ex("Ischios & Fessiers", "gym", "Good morning", 3, "12 reps", 75, "Modéré", "Dos plat, flexion de hanche uniquement.", "Charge légère au départ.", "Barre"),
  ex("Ischios & Fessiers", "gym", "Abduction hanche machine", 3, "15 reps", 45, "Facile", "Mouvement contrôlé, pas d'à-coup.", "Réglez l'amplitude sur la machine.", "Machine abduction"),
  ex("Ischios & Fessiers", "home", "Pont fessier", 3, "18 reps", 45, "Facile", "Contractez les fessiers en haut.", "Évitez l'hyperextension lombaire."),
  ex("Ischios & Fessiers", "home", "Fentes arrière alternées", 3, "12 reps / jambe", 45, "Modéré", "Pas contrôlé, buste droit.", "Genou avant stable."),
  // --- Mollets ---
  ex("Mollets", "gym", "Mollets debout machine", 4, "16 reps", 45, "Facile", "Amplitude complète, montée haute.", "Mouvement contrôlé.", "Machine mollets"),
  ex("Mollets", "gym", "Mollets assis machine", 3, "16 reps", 45, "Facile", "Cible le muscle soléaire.", "Amplitude complète.", "Machine mollets assis"),
  ex("Mollets", "gym", "Presse mollets", 3, "15 reps", 45, "Facile", "Amplitude complète.", "Mouvement contrôlé.", "Presse à cuisses"),
  ex("Mollets", "home", "Montées sur pointe de pieds", 4, "20 reps", 30, "Facile", "Montée haute, descente lente.", "Appui sur un support si besoin d'équilibre."),
  // --- Abdominaux ---
  ex("Abdominaux", "gym", "Poulie haute crunch", 3, "15 reps", 30, "Modéré", "Enroulez le buste vers le bas.", "Genoux au sol pour stabiliser.", "Poulie"),
  ex("Abdominaux", "gym", "Relevés de jambes suspendu", 3, "12 reps", 45, "Difficile", "Mouvement contrôlé, pas d'élan.", "Prise ferme sur la barre.", "Barre de traction"),
  ex("Abdominaux", "both", "Crunchs", 3, "20 reps", 30, "Facile", "Expirez en montant.", "Ne tirez pas sur la nuque."),
  ex("Abdominaux", "both", "Gainage planche", 3, "45 sec", 30, "Modéré", "Corps aligné tête-talons.", "Évitez le creux lombaire."),
  ex("Abdominaux", "both", "Relevés de jambes au sol", 3, "15 reps", 30, "Modéré", "Mouvement lent et contrôlé.", "Bas du dos plaqué au sol."),
  ex("Abdominaux", "both", "Russian twists", 3, "20 reps", 30, "Modéré", "Rotation depuis le buste.", "Talons au sol si besoin.", "Disque ou haltère léger"),
  ex("Abdominaux", "both", "Gainage latéral", 3, "30 sec / côté", 30, "Modéré", "Hanche haute, corps aligné.", "Ne laissez pas tomber le bassin."),
  ex("Abdominaux", "both", "Mountain climbers (abdos)", 3, "30 sec", 30, "Modéré", "Hanches basses, rythme soutenu.", "Poignets alignés sous les épaules."),
  ex("Abdominaux", "both", "Crunchs bicyclette", 3, "20 reps", 30, "Modéré", "Coude vers le genou opposé.", "Mouvement lent pour bien cibler les obliques."),
  ex("Abdominaux", "both", "Hollow body hold", 3, "30 sec", 30, "Difficile", "Bas du dos plaqué au sol.", "Réduisez l'amplitude si le dos se cambre."),
  // --- Cardio ---
  ex("Cardio", "gym", "Rameur", 5, "2 min / 1 min repos", 60, "Modéré", "Poussez avec les jambes avant de tirer avec les bras.", "Dos neutre tout au long du mouvement.", "Rameur"),
  ex("Cardio", "gym", "Tapis de course fractionné", 6, "1 min rapide / 1 min lent", 0, "Difficile", "Augmentez la vitesse progressivement.", "Tenez la rambarde seulement en urgence.", "Tapis de course"),
  ex("Cardio", "gym", "Vélo elliptique", 1, "20 min", 0, "Facile", "Gardez une cadence stable.", "Posture droite, regard devant.", "Elliptique"),
  ex("Cardio", "gym", "Assault bike sprints", 8, "20 sec", 40, "Difficile", "Effort maximal sur chaque sprint.", "Récupération complète entre les sprints.", "Assault bike"),
  ex("Cardio", "gym", "Vélo assis HIIT", 6, "30 sec", 30, "Modéré", "Résistance modérée, cadence élevée.", "Réglez la selle avant de commencer.", "Vélo"),
  ex("Cardio", "both", "Corde à sauter", 4, "1 min", 30, "Modéré", "Petits sauts, poignets souples.", "Sol amorti recommandé.", "Corde à sauter"),
  ex("Cardio", "both", "Jumping jacks", 4, "45 sec", 20, "Facile", "Cadence régulière.", "Amortissez la réception."),
  ex("Cardio", "both", "Sprint sur place", 5, "30 sec", 30, "Difficile", "Genoux hauts, bras actifs.", "Échauffement complet obligatoire."),
  ex("Cardio", "both", "Burpees", 4, "12 reps", 45, "Difficile", "Gainage constant du début à la fin.", "Dos plat en position pompe."),
  // --- Full Body / Maison (bonus, HIIT bodyweight inclus) ---
  ex("Full Body / Maison", "home", "Squat jump", 5, "20 sec / 10 repos", 10, "Difficile", "Explosivité puis réception souple.", "Genoux dans l'axe des pieds."),
  ex("Full Body / Maison", "home", "Burpees explosifs", 5, "20 sec", 10, "Difficile", "Rythme maximal contrôlé.", "Stoppez si la forme se dégrade."),
  ex("Full Body / Maison", "home", "Fentes sautées", 5, "20 sec", 10, "Difficile", "Alternez les jambes en l'air.", "Réception genou fléchi."),
  ex("Full Body / Maison", "home", "Mountain climbers rapides", 5, "20 sec", 10, "Modéré", "Bassin stable.", "Ne creusez pas le dos."),
  ex("Full Body / Maison", "home", "Kettlebell swings", 5, "20 sec", 10, "Difficile", "Poussée des hanches, pas des bras.", "Dos plat en permanence.", "Kettlebell"),
  ex("Full Body / Maison", "home", "Pompes", 4, "15 reps", 45, "Modéré", "Coudes à 45°, corps aligné.", "Gainage abdominal actif."),
  ex("Full Body / Maison", "home", "Squats au poids du corps", 4, "20 reps", 45, "Facile", "Descente lente, remontée dynamique.", "Talons au sol."),
  ex("Full Body / Maison", "home", "Superman", 3, "15 reps", 30, "Facile", "Levez bras et jambes simultanément.", "Mouvement lent et contrôlé."),
  // --- Pectoraux (compléments) ---
  ex("Pectoraux", "gym", "Développé haltères prise neutre", 4, "10 reps", 75, "Modéré", "Paumes face à face, coudes bas.", "Charge légère au départ.", "Haltères + banc"),
  ex("Pectoraux", "gym", "Crossover à la poulie", 3, "14 reps", 45, "Facile", "Croisement des mains en fin de mouvement.", "Légère flexion des coudes.", "Poulies"),
  ex("Pectoraux", "gym", "Smith machine développé couché", 4, "10 reps", 75, "Modéré", "Trajectoire guidée, focus sur le muscle.", "Réglez les crochets de sécurité.", "Smith machine"),
  ex("Pectoraux", "gym", "Développé incliné à la Smith machine", 4, "10 reps", 75, "Modéré", "Banc réglé à 30-45°, trajectoire guidée pour isoler le haut des pectoraux.", "Réglez les crochets de sécurité avant de commencer.", "Smith machine"),
  ex("Pectoraux", "home", "Pompes diamant", 3, "10 reps", 60, "Difficile", "Mains rapprochées sous le sternum.", "Cible aussi les triceps."),
  // --- Dos (compléments) ---
  ex("Dos", "gym", "Pull-over haltère", 3, "12 reps", 60, "Modéré", "Étirement complet du grand dorsal.", "Bras légèrement fléchis.", "Haltère + banc"),
  ex("Dos", "gym", "Rowing T-bar", 4, "10 reps", 75, "Difficile", "Buste penché, tirez vers le bas du buste.", "Dos plat, gainage actif.", "Barre T"),
  ex("Dos", "gym", "Tirage unilatéral poulie basse", 3, "12 reps / bras", 60, "Modéré", "Rotation légère du buste autorisée.", "Ne tirez pas avec le bas du dos.", "Poulie basse"),
  ex("Dos", "home", "Tractions australiennes (table/barre basse)", 3, "10 reps", 60, "Modéré", "Corps gainé, tirez la poitrine vers la barre.", "Vérifiez la stabilité de l'appui."),
  // --- Épaules (compléments) ---
  ex("Épaules", "gym", "Arnold press", 4, "10 reps", 75, "Difficile", "Rotation des poignets en montant.", "Charge modérée pour maîtriser la rotation.", "Haltères"),
  ex("Épaules", "gym", "Élévations latérales à la poulie", 3, "14 reps / bras", 45, "Facile", "Tension constante sur tout le mouvement.", "Coude légèrement fléchi.", "Poulie basse"),
  ex("Épaules", "gym", "Développé Smith machine", 4, "10 reps", 75, "Modéré", "Trajectoire guidée et sécurisée.", "Réglez le banc à 85-90°.", "Smith machine"),
  ex("Épaules", "home", "Pompes piquées (pike push-up élevé)", 3, "8 reps", 60, "Difficile", "Pieds surélevés pour plus de charge sur les épaules.", "Progressez petit à petit en hauteur."),
  // --- Biceps (compléments) ---
  ex("Biceps", "gym", "Curl concentré", 3, "12 reps / bras", 45, "Facile", "Coude calé contre la cuisse.", "Mouvement lent et isolé.", "Haltère"),
  ex("Biceps", "gym", "Curl inversé (prise pronation)", 3, "12 reps", 45, "Modéré", "Travaille aussi les avant-bras.", "Charge plus légère qu'un curl classique.", "Barre EZ"),
  ex("Biceps", "gym", "Curl 21 (montée/descente partielle)", 3, "21 reps", 60, "Difficile", "7 reps basses, 7 hautes, 7 complètes.", "Charge légère, technique stricte.", "Barre EZ"),
  ex("Biceps", "home", "Curl sac à dos / bidons d'eau", 3, "15 reps", 45, "Facile", "Improvisez une charge à la maison.", "Adaptez le poids progressivement."),
  // --- Triceps (compléments) ---
  ex("Triceps", "gym", "Barre au front (skull crusher)", 3, "12 reps", 60, "Modéré", "Coudes fixes, descente vers le front.", "Charge légère pour préserver les coudes.", "Barre EZ + banc"),
  ex("Triceps", "gym", "Extension triceps corde (overhead)", 3, "14 reps", 45, "Facile", "Bras au-dessus de la tête, coudes fixes.", "Dos droit, gainage actif.", "Poulie + corde"),
  ex("Triceps", "home", "Pompes triceps (mains resserrées au sol)", 3, "12 reps", 45, "Modéré", "Coudes proches du corps.", "Genoux au sol si besoin de simplifier."),
  // --- Quadriceps (compléments) ---
  ex("Quadriceps", "gym", "Hack squat machine", 4, "10 reps", 90, "Difficile", "Dos plaqué au dossier, descente contrôlée.", "Ne bloquez pas les genoux en haut.", "Hack squat"),
  ex("Quadriceps", "gym", "Squat sumo haltère", 3, "14 reps", 60, "Modéré", "Pieds larges, pointes vers l'extérieur.", "Genoux dans l'axe des pieds.", "Haltère/Kettlebell"),
  ex("Quadriceps", "gym", "Step-up banc haltères", 3, "12 reps / jambe", 60, "Modéré", "Poussez avec le talon sur le banc.", "Banc stable et adapté à la hauteur.", "Haltères + banc"),
  ex("Quadriceps", "home", "Squat bulgare pied surélevé (maison)", 3, "10 reps / jambe", 60, "Difficile", "Pied arrière sur une chaise stable.", "Vérifiez la stabilité de l'appui."),
  // --- Ischios & Fessiers (compléments) ---
  ex("Ischios & Fessiers", "gym", "Kickback fessier poulie", 3, "14 reps / jambe", 45, "Facile", "Contraction du fessier en fin de mouvement.", "Bassin stable, pas de compensation lombaire.", "Poulie basse"),
  ex("Ischios & Fessiers", "gym", "Soulevé de terre jambes tendues haltères", 3, "12 reps", 75, "Modéré", "Légère flexion des genoux, dos plat.", "Charge modérée, priorité à la technique.", "Haltères"),
  ex("Ischios & Fessiers", "home", "Nordic curl assisté / glissade talons", 3, "10 reps", 60, "Difficile", "Fléchissez puis freinez la descente.", "Progressez en amplitude selon votre niveau."),
  // --- Mollets (compléments) ---
  ex("Mollets", "gym", "Mollets sur leg press (une jambe)", 3, "16 reps / jambe", 45, "Facile", "Amplitude complète, isolation unilatérale.", "Mouvement contrôlé.", "Presse à cuisses"),
  ex("Mollets", "home", "Sauts à la corde sur pointes", 3, "1 min", 30, "Modéré", "Petits sauts, atterrissage sur l'avant-pied.", "Sol amorti recommandé.", "Corde à sauter"),
  // --- Abdominaux (compléments) ---
  ex("Abdominaux", "both", "Dead bug", 3, "12 reps / côté", 30, "Facile", "Bas du dos plaqué au sol en permanence.", "Mouvement lent et contrôlé."),
  ex("Abdominaux", "both", "V-ups", 3, "15 reps", 30, "Difficile", "Touchez les pieds avec les mains en haut.", "Gardez le bas du dos protégé."),
  ex("Abdominaux", "gym", "Gainage lesté", 3, "40 sec", 30, "Difficile", "Disque posé sur le bas du dos.", "Ajoutez la charge progressivement.", "Disque de musculation"),
  ex("Abdominaux", "both", "Ciseaux (scissor kicks)", 3, "20 reps", 30, "Modéré", "Jambes tendues, mouvement contrôlé.", "Bas du dos plaqué au sol."),
  // --- Cardio (compléments) ---
  ex("Cardio", "gym", "Ski erg", 5, "2 min", 60, "Modéré", "Poussée depuis le haut du corps et le tronc.", "Gainage actif tout le mouvement.", "Ski erg"),
  ex("Cardio", "both", "Marche rapide inclinée", 1, "25 min", 0, "Facile", "Inclinaison 8-12%, allure soutenue.", "Bonnes chaussures recommandées.", "Tapis de course"),
  ex("Cardio", "both", "Battle ropes", 6, "30 sec", 30, "Difficile", "Vagues amples et rapides.", "Gainage actif, jambes fléchies.", "Cordes ondulatoires"),
  ex("Cardio", "both", "Box jumps", 5, "10 reps", 45, "Difficile", "Réception souple, genoux fléchis.", "Choisissez une hauteur adaptée à votre niveau.", "Plyo box"),
  // --- Full Body / Maison (compléments) ---
  ex("Full Body / Maison", "home", "Bear crawl", 3, "30 sec", 30, "Modéré", "Genoux proches du sol sans les toucher.", "Dos plat, gainage constant."),
  ex("Full Body / Maison", "home", "Fentes marchées poids du corps", 3, "16 reps", 45, "Modéré", "Pas long et contrôlé, buste droit.", "Genou avant stable."),
  ex("Full Body / Maison", "home", "Gainage dynamique (planche + touch épaule)", 3, "30 sec", 30, "Modéré", "Bassin stable, alternez les épaules.", "Écartez les pieds pour plus de stabilité."),
  ex("Full Body / Maison", "home", "Squat + presse militaire élastique", 3, "15 reps", 45, "Modéré", "Enchaînement squat puis poussée au-dessus de la tête.", "Élastique ancré sous les pieds.", "Élastique"),
];

const PROGRAMS = [
  { id: "ppl", name: "Push Pull Legs Intensif", cat: "Musculation", level: "Intermédiaire/Avancé", weeks: 10, location: "gym", icon: Dumbbell,
    goals: ["Développer la force sur les 3 groupes majeurs", "Optimiser le volume par séance", "Progresser en charge chaque semaine"],
    desc: "Le classique de la musculation : chaque groupe musculaire est travaillé une fois par cycle avec un volume optimal, puis on repart.",
    cycle: ["push", "pull", "legs", "repos", "push", "pull", "legs"] },
  { id: "upper-lower", name: "Upper Lower Performance", cat: "Musculation", level: "Intermédiaire", weeks: 8, location: "gym", icon: Shield,
    goals: ["Équilibrer haut et bas du corps", "Augmenter la fréquence d'entraînement par groupe", "Structurer 4 séances / semaine"],
    desc: "Alternance Upper / Lower avec jours de repos stratégiques pour une récupération optimale et une progression continue.",
    cycle: ["upper", "lower", "repos", "upper", "lower", "repos", "repos"] },
  { id: "prise-masse", name: "Prise de Masse Totale", cat: "Prise de masse", level: "Intermédiaire", weeks: 12, location: "gym", icon: TrendingUp,
    goals: ["Développer la force", "Gagner du volume musculaire", "Split complet sur 6 jours"],
    desc: "Un split PPL + Upper/Lower combiné sur 12 semaines, pensé pour maximiser l'hypertrophie avec des charges progressives.",
    cycle: ["push", "pull", "legs", "repos", "upper", "lower", "repos"] },
  { id: "avance", name: "Élite Avancé — PPL x2", cat: "Avancé", level: "Avancé", weeks: 10, location: "gym", icon: Trophy,
    goals: ["Repousser ses limites", "Maximiser la fréquence d'entraînement", "Préparation athlétique complète"],
    desc: "Deux cycles Push Pull Legs par semaine (6 jours), réservé aux pratiquants confirmés recherchant la performance maximale.",
    cycle: ["push", "pull", "legs", "push", "pull", "legs", "repos"] },
  { id: "renforcement", name: "Renforcement Musculaire Total", cat: "Renforcement musculaire", level: "Intermédiaire", weeks: 8, location: "gym", icon: Shield,
    goals: ["Renforcer les chaînes musculaires", "Améliorer la posture", "Prévenir les blessures"],
    desc: "Un travail complet du corps en alternance Upper/Lower, axé sur la force fonctionnelle et la stabilité articulaire.",
    cycle: ["upper", "lower", "repos", "upper", "lower", "repos", "repos"] },
  { id: "salle", name: "Salle de Sport Pro", cat: "Programme salle", level: "Intermédiaire/Avancé", weeks: 10, location: "gym", icon: Award,
    goals: ["Utiliser le plein potentiel du matériel", "Progresser en charge", "Structurer un split complet"],
    desc: "Programme complet pensé pour la salle de sport, entre machines guidées et charges libres, split Push Pull Legs.",
    cycle: ["push", "pull", "legs", "repos", "push", "pull", "repos"] },
  { id: "cardio", name: "Cardio Endurance", cat: "Cardio", level: "Tous niveaux", weeks: 6, location: "gym", icon: Activity,
    goals: ["Développer le souffle", "Améliorer l'endurance", "Renforcer le système cardio-vasculaire"],
    desc: "Des séances rythmées sur machines cardio (rameur, tapis, vélo) pour progresser en endurance semaine après semaine.",
    cycle: ["cardio", "repos", "cardio", "cardio", "repos", "cardio", "repos"] },
  { id: "hiit", name: "HIIT Explosif", cat: "HIIT", level: "Intermédiaire/Avancé", weeks: 6, location: "gym", icon: Zap,
    goals: ["Maximiser la dépense calorique", "Gagner en explosivité", "Optimiser le temps d'entraînement"],
    desc: "Des intervalles à haute intensité en format court et dense, pour des résultats rapides en salle.",
    cycle: ["hiit", "repos", "hiit", "cardio", "repos", "hiit", "repos"] },
  { id: "perte-poids", name: "Perte de Poids Express", cat: "Perte de poids", level: "Intermédiaire", weeks: 8, location: "gym", icon: Flame,
    goals: ["Brûler les graisses", "Améliorer le cardio", "Tonifier l'ensemble du corps"],
    desc: "Combine cardio machines, renforcement des jambes et HIIT pour maximiser la dépense calorique en salle.",
    cycle: ["cardio", "legs", "hiit", "repos", "upper", "cardio", "repos"] },
  { id: "abdos", name: "Abdos en Acier", cat: "Abdominaux", level: "Tous niveaux", weeks: 4, location: "gym", icon: Target,
    goals: ["Sculpter la sangle abdominale", "Renforcer le gainage", "Améliorer la posture"],
    desc: "Des séances courtes et ciblées, idéales à intégrer avant ou après un autre entraînement en salle.",
    cycle: ["abs", "abs", "repos", "abs", "abs", "repos", "abs"] },
  { id: "debutant", name: "Fondations Débutant", cat: "Débutant", level: "Débutant", weeks: 4, location: "gym", icon: Star,
    goals: ["Apprendre les machines de base", "Construire une routine", "Prévenir les blessures"],
    desc: "Prise en main des machines guidées en toute sécurité, avec explications détaillées à chaque séance.",
    cycle: ["fullbodyGym", "repos", "fullbodyGym", "repos", "fullbodyGym", "repos", "repos"] },
  { id: "remise-forme", name: "Remise en Forme Douce", cat: "Remise en forme", level: "Débutant", weeks: 6, location: "gym", icon: Heart,
    goals: ["Reprendre une activité en douceur", "Améliorer la mobilité", "Retrouver de l'énergie"],
    desc: "Idéal après une pause sportive : intensité progressive en salle, machines guidées, récupération respectée.",
    cycle: ["fullbodyGym", "repos", "cardio", "repos", "fullbodyGym", "repos", "repos"] },
  { id: "maison", name: "Maison Sans Matériel", cat: "Programme maison", level: "Débutant/Intermédiaire", weeks: 6, location: "home", icon: HomeIcon,
    goals: ["S'entraîner sans équipement", "Gagner en force fonctionnelle", "S'adapter à un petit espace"],
    desc: "Le seul programme 100% maison de N2Koaching : uniquement du poids du corps, efficace et progressif.",
    cycle: ["home", "repos", "cardio", "home", "repos", "abs", "repos"] },
];

function poolFor(program, dayType) {
  if (dayType === "cardio") return program.location === "home" ? POOLS.cardio : POOLS.cardioGym;
  return POOLS[dayType] || POOLS.fullbodyGym;
}

function pickN(pool, n, seed) {
  if (!pool.length) return [];
  const picks = [];
  for (let i = 0; i < Math.min(n, pool.length); i++) picks.push(pool[(seed + i) % pool.length]);
  return picks;
}

const byCat = (cat) => EXERCISE_LIBRARY.filter(e => e.cat === cat && e.location !== "home");
const NO_FLAT_BENCH = (e) => !/développé couché/i.test(e.name);
const SMITH_INCLINE = EXERCISE_LIBRARY.find(e => e.name === "Développé incliné à la Smith machine");

const MUSCLE_POOLS = {
  chest: byCat("Pectoraux").filter(NO_FLAT_BENCH).filter(e => e.name !== SMITH_INCLINE.name),
  shoulders: byCat("Épaules"),
  triceps: byCat("Triceps"),
  back: byCat("Dos"),
  biceps: byCat("Biceps"),
  legs: [...byCat("Quadriceps"), ...byCat("Ischios & Fessiers"), ...byCat("Mollets")],
};

// Push : toujours le développé incliné à la Smith machine (pas de développé couché classique),
// + 1 autre exo pecs, + 2 épaules + 2 triceps = 6 exercices
function buildPush(seed) {
  const chest = [SMITH_INCLINE, ...pickN(MUSCLE_POOLS.chest, 1, seed)];
  const shoulders = pickN(MUSCLE_POOLS.shoulders, 2, seed + 1);
  const triceps = pickN(MUSCLE_POOLS.triceps, 2, seed + 2);
  return [...chest, ...shoulders, ...triceps];
}
// Pull : 3 exercices dos + 3 exercices biceps = 6 exercices
function buildPull(seed) {
  return [...pickN(MUSCLE_POOLS.back, 3, seed), ...pickN(MUSCLE_POOLS.biceps, 3, seed + 1)];
}
// Legs : 6 exercices puisés dans quadriceps / ischios-fessiers / mollets
function buildLegs(seed) {
  return pickN(MUSCLE_POOLS.legs, 6, seed);
}
// Upper : 2 pecs (dont Smith incliné) + 2 dos + 1 épaule + 1 bras = 6 exercices
function buildUpper(seed) {
  const chest = [SMITH_INCLINE, ...pickN(MUSCLE_POOLS.chest, 1, seed)];
  const back = pickN(MUSCLE_POOLS.back, 2, seed + 1);
  const arm = pickN([...MUSCLE_POOLS.triceps, ...MUSCLE_POOLS.biceps], 1, seed + 2);
  const shoulder = pickN(MUSCLE_POOLS.shoulders, 1, seed + 3);
  return [...chest, ...back, ...shoulder, ...arm];
}

function buildDaySession(program, w, dayIdx) {
  if (program.custom && program.customSessions) {
    const day = program.customSessions[dayIdx % 7] || { rest: true };
    const dayLabel = DAY_NAMES[dayIdx % 7];
    if (day.rest || !day.exercises || day.exercises.length === 0) {
      return { rest: true, dayType: "repos", dayLabel, title: `Semaine ${w} · ${dayLabel} — Repos` };
    }
    const seed = dayIdx * 3;
    const warm = [WARMUP[seed % WARMUP.length], WARMUP[(seed + 2) % WARMUP.length]];
    const cool = [COOLDOWN[seed % COOLDOWN.length], COOLDOWN[(seed + 1) % COOLDOWN.length]];
    const estMain = day.exercises.reduce((acc, e) => acc + e.sets * 1.15, 0);
    const estTotal = Math.round(5 + estMain + 4);
    return {
      rest: false, dayType: "custom", dayLabel,
      title: `Semaine ${w} · ${dayLabel} — ${day.title || "Séance coach"}`,
      warm, main: day.exercises, cool, estTotal, difficulty: program.level,
    };
  }
  const dayType = program.cycle[dayIdx % program.cycle.length];
  if (dayType === "repos") {
    return { rest: true, dayType, dayLabel: DAY_NAMES[dayIdx % 7], title: `Semaine ${w} · ${DAY_NAMES[dayIdx % 7]} — Repos` };
  }
  const seed = w * 7 + dayIdx * 3;
  let picks;
  if (dayType === "push") picks = buildPush(seed);
  else if (dayType === "pull") picks = buildPull(seed);
  else if (dayType === "legs" || dayType === "lower") picks = buildLegs(seed);
  else if (dayType === "upper") picks = buildUpper(seed);
  else {
    const pool = poolFor(program, dayType);
    picks = [];
    for (let i = 0; i < Math.min(5, pool.length); i++) picks.push(pool[(seed + i) % pool.length]);
  }
  const warm = [WARMUP[seed % WARMUP.length], WARMUP[(seed + 2) % WARMUP.length]];
  const cool = [COOLDOWN[seed % COOLDOWN.length], COOLDOWN[(seed + 1) % COOLDOWN.length]];
  const estMain = picks.reduce((acc, e) => acc + e.sets * 1.15, 0);
  const estTotal = Math.round(5 + estMain + 4);
  return {
    rest: false, dayType, dayLabel: DAY_NAMES[dayIdx % 7],
    title: `Semaine ${w} · ${DAY_NAMES[dayIdx % 7]} — ${FOCUS_LABEL[dayType]}`,
    warm, main: picks, cool, estTotal, difficulty: program.level,
  };
}

/* ============================================================
   EXPORT PDF DU PROGRAMME (jsPDF, 100% côté client)
============================================================ */
function exportProgramToPDF(program) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 60;
  const lineH = 15;
  const maxW = pageW - marginX * 2;

  const ensureSpace = (needed) => {
    if (y + needed > 780) { doc.addPage(); y = 60; }
  };
  const heading = (text, size = 18) => {
    ensureSpace(size + 14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(size); doc.setTextColor(20, 20, 20);
    doc.text(text, marginX, y); y += size + 8;
  };
  const paragraph = (text, size = 10.5, color = [90, 90, 90]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach(l => { ensureSpace(lineH); doc.text(l, marginX, y); y += lineH; });
  };

  // En-tête
  doc.setFillColor(0, 113, 227);
  doc.rect(0, 0, pageW, 6, "F");
  heading("N2Koaching", 12);
  y -= 4;
  heading(program.name, 20);
  paragraph(`${program.level} · ${program.weeks} semaines · ${program.location === "home" ? "Maison" : "Salle de sport"}`, 11, [0, 113, 227]);
  y += 6;
  if (program.desc) { paragraph(program.desc); y += 6; }

  if (program.goals && program.goals.length) {
    heading("Objectifs", 13);
    program.goals.forEach(g => paragraph(`•  ${g}`));
    y += 6;
  }

  heading("Plan hebdomadaire", 13);
  const cycleLen = program.cycle ? program.cycle.length : 7;
  for (let di = 0; di < cycleLen; di++) {
    const sess = buildDaySession(program, 1, di);
    ensureSpace(30);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(20, 20, 20);
    doc.text(sess.dayLabel || DAY_NAMES[di % 7], marginX, y); y += 16;

    if (sess.rest) {
      paragraph("Jour de repos — récupération active conseillée.", 10.5, [140, 140, 140]);
      y += 10; continue;
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(0, 113, 227);
    ensureSpace(lineH);
    doc.text(`${sess.title.split(" — ")[1] || ""}  ·  ${sess.estTotal} min`, marginX, y); y += lineH + 2;

    sess.main.forEach((e, i) => {
      ensureSpace(lineH * 2);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(20, 20, 20);
      doc.text(`${i + 1}. ${e.name}`, marginX + 10, y); y += lineH;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(110, 110, 110);
      doc.text(`${e.sets} séries × ${e.reps} · repos ${e.rest}s${e.equip ? " · " + e.equip : ""}`, marginX + 10, y); y += lineH;
    });
    y += 8;
  }

  ensureSpace(40);
  y += 6;
  paragraph(`Ce plan hebdomadaire se répète sur les ${program.weeks} semaines du programme, avec une intensité progressive.`, 9.5, [140, 140, 140]);

  doc.save(`${program.name.replace(/[^a-z0-9]+/gi, "_")}.pdf`);
}


const QUOTES = [
  "La discipline, c'est se souvenir de ce que l'on veut.",
  "Chaque séance vous rapproche de la meilleure version de vous-même.",
  "La motivation vous lance, l'habitude vous fait tenir.",
  "Le corps atteint ce que l'esprit croit.",
  "Un jour ou jour un. À vous de choisir.",
  "La douleur d'aujourd'hui est la force de demain.",
  "Ne comptez pas les jours, faites que les jours comptent.",
  "Petit progrès reste progrès.",
  "Votre seule limite, c'est vous.",
  "Transpirez maintenant, brillez ensuite.",
];
const BADGES = [
  { id: "b1", name: "Premier pas", icon: Star, desc: "Terminer votre première séance", type: "sessions", target: 1 },
  { id: "b2", name: "Régularité", icon: Flame, desc: "7 jours de série consécutive", type: "streak", target: 7 },
  { id: "b3", name: "Endurant", icon: Activity, desc: "10 séances terminées", type: "sessions", target: 10 },
  { id: "b4", name: "Feu sacré", icon: Zap, desc: "14 jours de série consécutive", type: "streak", target: 14 },
  { id: "b5", name: "Guerrier", icon: Shield, desc: "25 séances terminées", type: "sessions", target: 25 },
  { id: "b6", name: "Légende", icon: Trophy, desc: "50 séances terminées", type: "sessions", target: 50 },
  { id: "b7", name: "Inarrêtable", icon: Award, desc: "30 jours de série consécutive", type: "streak", target: 30 },
  { id: "b8", name: "Élite XP", icon: Sparkles, desc: "Atteindre 5000 XP", type: "xp", target: 5000 },
];
const WEIGHT_HISTORY = [
  { s: "S1", kg: 78.4 }, { s: "S2", kg: 77.9 }, { s: "S3", kg: 77.6 }, { s: "S4", kg: 77.1 },
  { s: "S5", kg: 76.6 }, { s: "S6", kg: 76.3 }, { s: "S7", kg: 75.8 }, { s: "S8", kg: 75.4 },
];
const WEEKLY_SESSIONS = [
  { d: "Lun", n: 1 }, { d: "Mar", n: 1 }, { d: "Mer", n: 0 }, { d: "Jeu", n: 1 },
  { d: "Ven", n: 1 }, { d: "Sam", n: 0 }, { d: "Dim", n: 0 },
];
const TESTIMONIALS = [
  { name: "Camille D.", role: "Push Pull Legs Intensif", txt: "Le split PPL m'a permis de progresser en charge chaque semaine. Le suivi des séances me pousse à continuer chaque jour.", avatar: "C" },
  { name: "Yanis B.", role: "Programme Prise de Masse", txt: "La progression des charges est parfaitement dosée. J'ai gagné en force sans jamais me blesser.", avatar: "Y" },
  { name: "Sarah M.", role: "Maison Sans Matériel", txt: "Idéal les jours où je ne peux pas aller à la salle. Des séances courtes mais redoutablement efficaces.", avatar: "S" },
];
const MEALS = [
  { name: "Bowl protéiné poulet-quinoa", kcal: 480, p: 42, c: 45, f: 14, tag: "Post-training" },
  { name: "Saumon, patate douce, brocolis", kcal: 520, p: 38, c: 40, f: 20, tag: "Riche en oméga-3" },
  { name: "Omelette blanc d'œuf & avoine", kcal: 350, p: 30, c: 32, f: 9, tag: "Petit-déjeuner" },
  { name: "Salade de lentilles & feta", kcal: 410, p: 22, c: 46, f: 14, tag: "Végétarien" },
  { name: "Smoothie banane-avoine-whey", kcal: 320, p: 28, c: 38, f: 6, tag: "En-cas" },
  { name: "Wok de bœuf & légumes", kcal: 500, p: 40, c: 35, f: 18, tag: "Dîner" },
];

/* ============================================================
   HELPERS
============================================================ */
function levelFromXp(xp) { return Math.min(100, Math.floor(xp / 500) + 1); }
function xpForLevel(l) { return l * 500; }
function fmtMin(m) { const h = Math.floor(m / 60); const r = m % 60; return h ? `${h}h${r ? String(r).padStart(2, "0") : ""}` : `${r} min`; }
function resolveAssignedProgram(state) {
  if (state.customProgram) return { ...state.customProgram, icon: Sparkles, custom: true };
  if (state.assignedProgramId) { const p = PROGRAMS.find(p => p.id === state.assignedProgramId); if (p) return p; }
  return null;
}

/** Calcule la séance du jour à partir de la date de démarrage du programme.
 *  Sert de "widget maison" : carte prioritaire sur le dashboard + badge d'app. */
function computeTodaySession(state) {
  const program = resolveAssignedProgram(state);
  if (!program || !state.programStartAt) return null;
  const start = new Date(state.programStartAt); start.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysElapsed = Math.round((today - start) / 86400000);
  if (daysElapsed < 0) return null;
  const totalDays = program.weeks * 7;
  if (daysElapsed >= totalDays) return null;
  const week = Math.floor(daysElapsed / 7) + 1;
  const dayIdx = daysElapsed % 7;
  return { program, week, dayIdx, session: buildDaySession(program, week, dayIdx) };
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/);
  return m ? m[1] : null;
}
function youtubeSearchUrl(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " technique musculation")}`;
}
const VideoBlock = ({ c, videoUrl, exerciseName }) => {
  const vid = extractYouTubeId(videoUrl);
  if (vid) {
    return (
      <div style={{ borderRadius: 14, overflow: "hidden", marginTop: 4 }}>
        <iframe
          src={`https://www.youtube.com/embed/${vid}`}
          title={`Démonstration : ${exerciseName}`}
          style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <a href={youtubeSearchUrl(exerciseName)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.surface2, borderRadius: 12, padding: "10px 12px", color: c.electric2, fontSize: 12.5, fontWeight: 700 }}>
        <PlayCircle size={16} /> Rechercher une démonstration vidéo
      </div>
    </a>
  );
};


/* ============================================================
   UI PRIMITIVES
============================================================ */
const Ring = ({ pct, size = 64, stroke = 6, c, colorFrom, colorTo, children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (Math.min(100, pct) / 100) * circ;
  const gid = `g-${size}-${stroke}-${Math.round(Math.random() * 9999)}`;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom || c.electric} />
            <stop offset="100%" stopColor={colorTo || c.electric2} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={c.surface2} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#${gid})`} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

const Pill = ({ children, c, tone = "default" }) => {
  const styles = {
    default: { background: c.surface2, color: c.muted },
    electric: { background: "rgba(47,107,255,0.15)", color: c.electric2 },
    success: { background: "rgba(52,211,153,0.15)", color: c.success },
    warning: { background: "rgba(251,191,36,0.15)", color: c.warning },
    danger: { background: "rgba(251,113,133,0.15)", color: c.danger },
  };
  return (
    <span className="ff-body" style={{ ...styles[tone], fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const Card = ({ children, c, style, onClick, className }) => (
  <div className={className} onClick={onClick} style={{
    background: c.surface, border: `1px solid ${c.border}`, borderRadius: 20, padding: 18,
    cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

const IconBtn = ({ icon: Icon, onClick, c, size = 38, active }) => (
  <button onClick={onClick} style={{
    width: size, height: size, borderRadius: 12, border: `1px solid ${c.border}`,
    background: active ? c.gradA : c.surface2, display: "flex", alignItems: "center", justifyContent: "center",
    color: active ? "#fff" : c.text, cursor: "pointer", flexShrink: 0
  }}>
    <Icon size={17} />
  </button>
);

const PrimaryBtn = ({ children, onClick, c, style, full, icon: Icon, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="ff-body" style={{
    background: disabled ? c.surface2 : c.gradA, color: disabled ? c.muted : "#fff", border: "none", borderRadius: 14,
    padding: "14px 22px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, cursor: disabled ? "default" : "pointer", width: full ? "100%" : "auto",
    boxShadow: disabled ? "none" : "0 8px 24px rgba(47,107,255,0.35)", ...style
  }}>
    {Icon && <Icon size={17} />} {children}
  </button>
);

const SecondaryBtn = ({ children, onClick, c, style, full, icon: Icon }) => (
  <button onClick={onClick} className="ff-body" style={{
    background: c.surface2, color: c.text, border: `1px solid ${c.border}`, borderRadius: 14,
    padding: "12px 18px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, cursor: "pointer", width: full ? "100%" : "auto", ...style
  }}>
    {Icon && <Icon size={16} />} {children}
  </button>
);

const SectionTitle = ({ children, c, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
    <h3 className="ff-display" style={{ fontSize: 17, fontWeight: 700, color: c.text, margin: 0 }}>{children}</h3>
    {action}
  </div>
);

const inputStyle = (c) => ({
  width: "100%", background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 12,
  padding: "12px 14px", color: c.text, fontSize: 13.5, outline: "none",
});
const labelStyle = (c) => ({ fontSize: 11.5, color: c.muted, marginBottom: 6, fontWeight: 600 });

/* ============================================================
   TOAST / REWARD
============================================================ */
const RewardToast = ({ reward, c, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  if (!reward) return null;
  return (
    <div className="anim-pop" style={{
      position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 500,
      background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 50px rgba(0,0,0,0.35)", minWidth: 260
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Sparkles size={20} color="#fff" />
      </div>
      <div>
        <div className="ff-display" style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{reward.title}</div>
        <div className="ff-body" style={{ color: c.muted, fontSize: 12.5 }}>{reward.desc}</div>
      </div>
    </div>
  );
};

/* ============================================================
   AUTH SCREEN — compte persistant + validation coach
============================================================ */
const AuthScreen = ({ c, onAuthed }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setInfo("");
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      setError("Merci de remplir tous les champs."); return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères."); return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await signUp(email.trim(), password, name.trim());
        if (res && res.session) {
          onAuthed();
        } else {
          setInfo("Compte créé. Vérifiez votre email pour confirmer votre inscription, puis connectez-vous pour renseigner votre profil et suivre le statut de validation.");
          setMode("login");
          setPassword("");
        }
      } else {
        await signIn(email.trim(), password);
        onAuthed();
      }
    } catch (e) {
      const msg = e && e.message ? e.message : "Une erreur est survenue.";
      if (msg.includes("Invalid login")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("already registered") || msg.includes("already been registered")) setError("Un compte existe déjà avec cet email. Connectez-vous.");
      else setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 380, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo c={c} size={56} style={{ margin: "0 auto 14px" }} />
          <h1 className="ff-display" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
            {mode === "login" ? "Content de vous revoir" : "Créez votre compte"}
          </h1>
          <p style={{ color: c.muted, fontSize: 13, margin: 0 }}>
            {mode === "login" ? "Connectez-vous pour retrouver votre coaching." : "Votre inscription sera validée par votre coach avant l'accès complet."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, background: c.surface2, padding: 4, borderRadius: 12 }}>
          {[{ id: "login", l: "Connexion", icon: LogIn }, { id: "signup", l: "Créer un compte", icon: UserPlus }].map(t => (
            <button key={t.id} onClick={() => { setMode(t.id); setError(""); setInfo(""); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer",
              background: mode === t.id ? c.surface : "transparent", color: mode === t.id ? c.text : c.muted,
              fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}><t.icon size={14} /> {t.l}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <div>
              <div style={labelStyle(c)}>Prénom</div>
              <input style={inputStyle(c)} value={name} onChange={e => setName(e.target.value)} placeholder="Alex" />
            </div>
          )}
          <div>
            <div style={labelStyle(c)}>Email</div>
            <div style={{ position: "relative" }}>
              <Mail size={15} color={c.muted} style={{ position: "absolute", left: 13, top: 14 }} />
              <input style={{ ...inputStyle(c), paddingLeft: 38 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" type="email" autoComplete="email" />
            </div>
          </div>
          <div>
            <div style={labelStyle(c)}>Mot de passe</div>
            <div style={{ position: "relative" }}>
              <KeyRound size={15} color={c.muted} style={{ position: "absolute", left: 13, top: 14 }} />
              <input style={{ ...inputStyle(c), paddingLeft: 38, paddingRight: 40 }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPw ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", cursor: "pointer", color: c.muted }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10 }}>{error}</div>}
          {info && <div style={{ fontSize: 12, color: c.success, background: "rgba(48,209,88,0.1)", padding: "10px 12px", borderRadius: 10 }}>{info}</div>}

          <PrimaryBtn c={c} full onClick={submit} disabled={loading} icon={mode === "login" ? LogIn : UserPlus} style={{ marginTop: 6 }}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </PrimaryBtn>
        </div>

        <p style={{ fontSize: 10.5, color: c.muted, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Vos données sont hébergées sur Supabase. Aucun accès n'est possible sans validation de votre coach.
        </p>
      </div>
    </div>
  );
};

const Onboarding = ({ c, name, onComplete }) => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState("Perte de poids");
  const [sportLevel, setSportLevel] = useState("Débutant");
  const [saving, setSaving] = useState(false);
  const goals = ["Perte de poids", "Prise de masse", "Remise en forme", "Performance"];
  const levels = ["Débutant", "Intermédiaire", "Avancé"];

  const submit = async () => {
    setSaving(true);
    await onComplete({ weight, height, goal, sportLevel });
  };

  return (
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <Logo c={c} size={52} style={{ margin: "0 auto 16px" }} />
        <h1 className="ff-display" style={{ fontSize: 21, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>Bienvenue {name} 👋</h1>
        <p style={{ color: c.muted, fontSize: 13, textAlign: "center", marginBottom: 26 }}>Quelques infos pour démarrer votre suivi à zéro. Votre coach validera ensuite votre inscription.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle(c)}>Poids actuel (kg)</div>
              <input type="number" style={inputStyle(c)} value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
            <div>
              <div style={labelStyle(c)}>Taille (cm)</div>
              <input type="number" style={inputStyle(c)} value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <div style={labelStyle(c)}>Objectif principal</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {goals.map(g => (
                <button key={g} onClick={() => setGoal(g)} style={{
                  padding: "9px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${goal === g ? "transparent" : c.border}`, background: goal === g ? c.gradA : c.surface2, color: goal === g ? "#fff" : c.text
                }}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={labelStyle(c)}>Niveau sportif</div>
            <div style={{ display: "flex", gap: 8 }}>
              {levels.map(l => (
                <button key={l} onClick={() => setSportLevel(l)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${sportLevel === l ? "transparent" : c.border}`, background: sportLevel === l ? c.gradA : c.surface2, color: sportLevel === l ? "#fff" : c.text
                }}>{l}</button>
              ))}
            </div>
          </div>
          <PrimaryBtn c={c} full onClick={submit} disabled={saving} icon={Check} style={{ marginTop: 8 }}>
            {saving ? "Enregistrement..." : "Valider mon profil"}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PENDING / REJECTED SCREENS
============================================================ */
const PendingScreen = ({ c, onLogout, onResolved }) => {
  const [checking, setChecking] = useState(false);
  const refresh = async () => {
    setChecking(true);
    try {
      const profile = await getSessionProfile();
      if (profile && (profile.status === "approved" || profile.status === "rejected")) onResolved(profile);
    } catch (e) { /* rien de nouveau */ }
    setChecking(false);
  };
  return (
    <div className="ff-body anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
      <div style={{ width: 76, height: 76, borderRadius: 22, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Hourglass size={34} color={c.electric2} />
      </div>
      <h2 className="ff-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Inscription en attente</h2>
      <p style={{ color: c.muted, fontSize: 13.5, maxWidth: 320, lineHeight: 1.6, marginBottom: 26 }}>
        Votre compte a bien été créé. Votre coach doit valider votre inscription avant de vous donner accès à votre espace et à votre programme personnalisé.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
        <PrimaryBtn c={c} full icon={checking ? RefreshCw : RefreshCw} onClick={refresh}>
          {checking ? "Vérification..." : "Vérifier le statut"}
        </PrimaryBtn>
        <SecondaryBtn c={c} full icon={LogOut} onClick={onLogout}>Se déconnecter</SecondaryBtn>
      </div>
    </div>
  );
};

const RejectedScreen = ({ c, onLogout }) => (
  <div className="ff-body anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
    <div style={{ width: 76, height: 76, borderRadius: 22, background: "rgba(251,113,133,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
      <MailX size={34} color="#FB7185" />
    </div>
    <h2 className="ff-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Inscription non validée</h2>
    <p style={{ color: c.muted, fontSize: 13.5, maxWidth: 320, lineHeight: 1.6, marginBottom: 26 }}>
      Votre coach n'a pas validé cette inscription. Rapprochez-vous de lui directement pour plus d'informations.
    </p>
    <SecondaryBtn c={c} icon={LogOut} onClick={onLogout}>Retour à l'accueil</SecondaryBtn>
  </div>
);

/* ============================================================
   LANDING PAGE
============================================================ */
const Landing = ({ c, onStart, dark, setDark }) => {
  const [statVals, setStatVals] = useState({ a: 0, b: 0, d: 0 });
  useEffect(() => {
    const targets = { a: 42000, b: 980, d: 97 };
    const dur = 1400, steps = 40;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setStatVals({
        a: Math.round((targets.a * i) / steps),
        b: Math.round((targets.b * i) / steps),
        d: Math.round((targets.d * i) / steps),
      });
      if (i >= steps) clearInterval(iv);
    }, dur / steps);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="ff-body scrollbar-none app-scroll" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Logo c={c} size={32} />
          <span className="ff-display" style={{ fontWeight: 700, fontSize: 18 }}>N2Koaching</span>
        </div>
        <IconBtn icon={dark ? Sun : Moon} c={c} onClick={() => setDark(!dark)} />
      </div>

      <div style={{ padding: "40px 20px 10px", textAlign: "center" }} className="anim-fadeUp">
        <div style={{ display: "inline-block", marginBottom: 18 }}>
          <Pill c={c} tone="electric">● Coaching réel : inscription validée par un coach</Pill>
        </div>
        <h1 className="ff-display" style={{ fontSize: 40, lineHeight: 1.08, fontWeight: 700, margin: "0 0 14px" }}>
          Votre meilleure <br />
          <span style={{ background: c.gradA, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            version, chaque jour.
          </span>
        </h1>
        <p style={{ color: c.muted, fontSize: 15.5, maxWidth: 420, margin: "0 auto 26px", lineHeight: 1.6 }}>
          Des programmes premium (Push Pull Legs, Upper/Lower...), un vrai coach qui valide votre inscription et peut vous construire un programme sur-mesure.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <PrimaryBtn c={c} onClick={onStart} icon={Play} style={{ padding: "16px 32px", fontSize: 15, animation: "pulseGlow 2.4s infinite" }}>
            Commencer maintenant
          </PrimaryBtn>
          <span style={{ color: c.muted, fontSize: 12.5 }}>Compte gratuit · Validation par un coach</span>
        </div>
      </div>

      <div className="anim-fadeUp" style={{ padding: "34px 20px", animationDelay: ".1s" }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: Flame, v: statVals.a.toLocaleString("fr-FR"), l: "Séances réalisées" },
            { icon: TrendingUp, v: statVals.b.toLocaleString("fr-FR"), l: "Athlètes actifs" },
            { icon: Heart, v: statVals.d + "%", l: "Taux de satisfaction" },
          ].map((s, i) => (
            <Card key={i} c={c} style={{ width: 108, textAlign: "center", padding: "16px 8px" }}>
              <s.icon size={18} color={c.electric2} style={{ marginBottom: 6 }} />
              <div className="ff-mono" style={{ fontWeight: 700, fontSize: 17 }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: c.muted, marginTop: 2 }}>{s.l}</div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 20px 30px" }}>
        <SectionTitle c={c}>Pourquoi N2Koaching</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: UserCog, t: "Vrai coaching", d: "Votre inscription est validée par un coach, qui peut vous prescrire un programme." },
            { icon: Trophy, t: "Gamification", d: "XP, niveaux, badges et défis pour rester motivé." },
            { icon: Salad, t: "Nutrition intégrée", d: "Calculateur calorique et recettes fitness." },
            { icon: BarChart3, t: "Suivi précis", d: "Statistiques, calendrier et progression visuelle." },
          ].map((b, i) => (
            <Card key={i} c={c} style={{ padding: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(47,107,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <b.icon size={17} color={c.electric2} />
              </div>
              <div className="ff-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{b.t}</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>{b.d}</div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 0 30px" }}>
        <div style={{ padding: "0 20px" }}>
          <SectionTitle c={c}>Aperçu des programmes</SectionTitle>
        </div>
        <div className="scrollbar-none" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 20px 8px" }}>
          {PROGRAMS.slice(0, 6).map((p) => (
            <div key={p.id} style={{
              minWidth: 170, borderRadius: 18, padding: 16, background: c.gradB, flexShrink: 0,
              boxShadow: "0 10px 30px rgba(47,107,255,0.25)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <p.icon size={20} color="#fff" />
                {p.location === "home" ? <HomeIcon size={13} color="rgba(255,255,255,0.7)" /> : <Building2 size={13} color="rgba(255,255,255,0.7)" />}
              </div>
              <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5 }}>{p.weeks} sem · {p.cycle.filter(d => d !== "repos").length}x/sem</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 40px" }}>
        <SectionTitle c={c}>Ils ont transformé leur quotidien</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} c={c}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: c.muted }}>{t.role}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, k) => <Star key={k} size={11} fill={c.warning} color={c.warning} />)}
                </div>
              </div>
              <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.6, margin: 0 }}>« {t.txt} »</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 50px", textAlign: "center" }}>
        <PrimaryBtn c={c} onClick={onStart} full icon={Play}>Commencer maintenant</PrimaryBtn>
        <div style={{ marginTop: 14, fontSize: 11.5, color: c.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Download size={13} /> Installable comme une vraie application
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   INSTALL MODAL
============================================================ */
const InstallModal = ({ c, onClose }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
    <div className="anim-fadeUp" onClick={(e) => e.stopPropagation()} style={{ background: c.surface, width: "100%", borderRadius: "24px 24px 0 0", padding: 22, border: `1px solid ${c.border}` }}>
      <div style={{ width: 40, height: 4, background: c.border, borderRadius: 4, margin: "0 auto 18px" }} />
      <div className="ff-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Installer N2Koaching</div>
      <p style={{ fontSize: 13, color: c.muted, marginBottom: 16, lineHeight: 1.5 }}>
        Ajoutez N2Koaching à votre écran d'accueil pour un accès instantané, comme une vraie application.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card c={c} style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>📱 Sur iPhone (Safari)</div>
          <div style={{ fontSize: 12.5, color: c.muted }}>Appuyez sur <Share size={12} style={{ display: "inline", verticalAlign: "-2px" }} /> Partager → « Sur l'écran d'accueil ».</div>
        </Card>
        <Card c={c} style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🤖 Sur Android (Chrome)</div>
          <div style={{ fontSize: 12.5, color: c.muted }}>Menu ⋮ → « Ajouter à l'écran d'accueil » → Installer.</div>
        </Card>
      </div>
      <PrimaryBtn c={c} full style={{ marginTop: 16 }} onClick={onClose}>Compris</PrimaryBtn>
    </div>
  </div>
);

/* ============================================================
   TOP BAR + DRAWER NAV (menu 3 barres à gauche)
============================================================ */
const TopBar = ({ c, title, onBack, dark, setDark, onInstall, onMenu }) => (
  <div style={{ position: "sticky", top: 0, zIndex: 20, background: c.bg + "ee", backdropFilter: "blur(10px)", borderBottom: `1px solid ${c.border}`, padding: "calc(16px + max(env(safe-area-inset-top), 24px)) 18px 16px", display: "flex", alignItems: "center", gap: 10 }}>
    {onBack ? (
      <IconBtn icon={ArrowLeft} c={c} onClick={onBack} />
    ) : (
      <IconBtn icon={Menu} c={c} onClick={onMenu} />
    )}
    <span className="ff-display" style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>{title}</span>
    <IconBtn icon={Download} c={c} onClick={onInstall} />
    <IconBtn icon={dark ? Sun : Moon} c={c} onClick={() => setDark(!dark)} />
  </div>
);

const Drawer = ({ c, open, onClose, tab, setTab, profile, onLogout }) => {
  const items = [
    { id: "home", icon: Home, label: "Accueil" },
    { id: "programs", icon: Dumbbell, label: "Programmes" },
    { id: "calendar", icon: CalendarIcon, label: "Calendrier" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "nutrition", icon: Apple, label: "Nutrition" },
    { id: "profile", icon: User, label: "Profil" },
  ];
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 350, background: "rgba(0,0,0,0.55)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .25s",
        animation: open ? "overlayIn .25s ease" : "none"
      }} />
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 360, width: 270,
        background: c.surface, borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(-100%)", transition: "transform .28s cubic-bezier(.16,1,.3,1)",
        padding: "calc(22px + max(env(safe-area-inset-top), 24px)) 16px 22px", boxShadow: open ? "20px 0 60px rgba(0,0,0,0.3)" : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "0 6px" }}>
          <Logo c={c} size={32} />
          <span className="ff-display" style={{ fontWeight: 700, fontSize: 17, color: c.text }}>N2Koaching</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: c.muted }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, background: c.surface2, padding: 12, borderRadius: 14, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {profile.name.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div>
            <div style={{ fontSize: 10.5, color: c.muted }}>Niveau {profile.level}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {items.map((it) => {
            const active = tab === it.id;
            return (
              <button key={it.id} onClick={() => { setTab(it.id); onClose(); }} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderRadius: 12, border: "none",
                background: active ? "rgba(47,107,255,0.15)" : "transparent", color: active ? c.electric2 : c.text,
                cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 500, textAlign: "left"
              }}>
                <it.icon size={19} />{it.label}
                {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: c.electric2 }} />}
              </button>
            );
          })}
        </div>

        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderRadius: 12, border: `1px solid ${c.border}`,
          background: "transparent", color: c.danger, cursor: "pointer", fontSize: 13.5, fontWeight: 600, marginTop: 10
        }}>
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </>
  );
};

/* ============================================================
   DASHBOARD
============================================================ */
const Dashboard = ({ c, state, quote, openProgram, openSession, goTab }) => {
  const { xp, level, streak, sessionsCompleted, totalMinutes, calories, name } = state;
  const curLevelXp = xpForLevel(level - 1);
  const nextLevelXp = xpForLevel(level);
  const pct = ((xp - curLevelXp) / (nextLevelXp - curLevelXp)) * 100;
  const assigned = resolveAssignedProgram(state);
  const today = assigned ? computeTodaySession(state) : null;
  const featured = [PROGRAMS.find(p => p.id === "ppl"), PROGRAMS.find(p => p.id === "upper-lower"), PROGRAMS.find(p => p.id === "maison")];

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <Card c={c} style={{ background: c.gradB, border: "none", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Ring pct={pct} size={72} stroke={7} c={{ ...c, surface2: "rgba(255,255,255,0.2)" }} colorFrom="#fff" colorTo="#fff">
            <div style={{ textAlign: "center" }}>
              <div className="ff-mono" style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{level}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 8 }}>NIV.</div>
            </div>
          </Ring>
          <div style={{ flex: 1 }}>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}>Bon retour,</div>
            <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 19 }}>{name} 👋</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
                <Flame size={12} /> {streak} jours
              </span>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
                {xp.toLocaleString("fr-FR")} XP
              </span>
            </div>
          </div>
        </div>
      </Card>

      {assigned && today && (
        <Card c={c} style={{ marginBottom: 14, border: `1.5px solid ${c.electric}`, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <CalendarIcon size={13} color={c.electric2} />
            <span style={{ fontSize: 11, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4 }}>Votre séance</span>
          </div>
          {today.session.rest ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Coffee size={22} color={c.muted} />
                </div>
                <div className="ff-display" style={{ fontWeight: 700, fontSize: 16 }}>Jour de repos</div>
              </div>
              <p style={{ fontSize: 12.5, color: c.muted, margin: "8px 0 0 60px" }}>Profitez-en pour récupérer — votre prochaine séance vous attend demain.</p>
            </>
          ) : (
            <>
              <div className="ff-display" style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{FOCUS_LABEL[today.session.dayType] || today.session.title.split(" — ")[1]}</div>
              <div style={{ fontSize: 12.5, color: c.muted, marginBottom: 16 }}>{today.session.estTotal} min · {today.session.main.length} exercices</div>
              <PrimaryBtn c={c} full icon={Play} onClick={() => openSession(today.program, today.week, today.dayIdx)} style={{ padding: "15px 20px", fontSize: 14.5 }}>
                Lancer ma séance
              </PrimaryBtn>
            </>
          )}
          <button onClick={() => openProgram(assigned)} style={{ background: "none", border: "none", color: c.muted, fontSize: 11.5, cursor: "pointer", marginTop: 12, display: "block", margin: "12px auto 0" }}>
            Voir mon programme complet
          </button>
        </Card>
      )}
      {assigned && !today && (
        <Card c={c} onClick={() => openProgram(assigned)} style={{ marginBottom: 14, display: "flex", gap: 14, alignItems: "center", border: `1.5px solid ${c.electric}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UserCog size={20} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Pill c={c} tone="electric">Assigné par votre coach</Pill>
            <div className="ff-display" style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{assigned.name}</div>
          </div>
          <ChevronRight size={18} color={c.muted} />
        </Card>
      )}

      <Card c={c} style={{ marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
        <Sparkles size={18} color={c.electric2} style={{ flexShrink: 0 }} />
        <p className="ff-display" style={{ margin: 0, fontSize: 13, fontStyle: "italic", color: c.text, lineHeight: 1.5 }}>« {quote} »</p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { icon: Check, v: sessionsCompleted, l: "Séances réalisées", tone: c.success },
          { icon: Clock, v: fmtMin(totalMinutes), l: "Temps total", tone: c.electric2 },
          { icon: Flame, v: calories.toLocaleString("fr-FR"), l: "Kcal brûlées", tone: c.warning },
          { icon: Trophy, v: BADGES.filter(b => (b.type === "sessions" && sessionsCompleted >= b.target) || (b.type === "streak" && streak >= b.target) || (b.type === "xp" && xp >= b.target)).length + "/8", l: "Badges débloqués", tone: c.danger },
        ].map((s, i) => (
          <Card c={c} key={i} style={{ padding: 14 }}>
            <s.icon size={16} color={s.tone} style={{ marginBottom: 8 }} />
            <div className="ff-mono" style={{ fontWeight: 700, fontSize: 17 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      {!assigned && (
        <>
          <SectionTitle c={c} action={<button onClick={() => goTab("programs")} style={{ background: "none", border: "none", color: c.electric2, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>Tout voir <ChevronRight size={14} /></button>}>
            Programmes recommandés
          </SectionTitle>
          <div className="scrollbar-none" style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
            {featured.map((p) => (
              <div key={p.id} onClick={() => openProgram(p)} style={{ minWidth: 190, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: 16, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p.icon size={17} color="#fff" />
                  </div>
                  {p.location === "home" ? <HomeIcon size={14} color={c.muted} /> : <Building2 size={14} color={c.muted} />}
                </div>
                <div className="ff-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Pill c={c}>{p.weeks} sem</Pill>
                  <Pill c={c}>{p.level}</Pill>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle c={c}>Défis du jour</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {[
          { t: "Boire 2L d'eau", p: 62, icon: Droplet },
          { t: "1 séance terminée", p: 100, icon: Check },
          { t: "500 kcal brûlées", p: 74, icon: Flame },
        ].map((ch, i) => (
          <Card c={c} key={i} style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <ch.icon size={15} color={c.electric2} />
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{ch.t}</span>
              <span className="ff-mono" style={{ fontSize: 11.5, color: c.muted }}>{ch.p}%</span>
            </div>
            <div style={{ height: 6, background: c.surface2, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${ch.p}%`, background: c.gradA, borderRadius: 4 }} />
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle c={c}>Activité de la semaine</SectionTitle>
      <Card c={c} style={{ paddingTop: 16 }}>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={WEEKLY_SESSIONS}>
            <XAxis dataKey="d" tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="n" radius={[6, 6, 6, 6]} fill={c.electric} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

/* ============================================================
   PROGRAMS LIST
============================================================ */
const ProgramsList = ({ c, openProgram, state }) => {
  const [filter, setFilter] = useState("Tous");
  const [locFilter, setLocFilter] = useState("Tous");
  const assigned = resolveAssignedProgram(state);

  if (assigned) {
    const Icon = assigned.icon || Sparkles;
    return (
      <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
        <div style={{ textAlign: "center", padding: "20px 10px 24px" }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <UserCog size={24} color="#fff" />
          </div>
          <h2 className="ff-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Votre programme est géré par votre coach</h2>
          <p style={{ fontSize: 12.5, color: c.muted, maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
            Contactez-le via Messages si vous souhaitez un changement de programme.
          </p>
        </div>
        <Card c={c} onClick={() => openProgram(assigned)} style={{ display: "flex", gap: 14, alignItems: "center", border: `1.5px solid ${c.electric}` }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={22} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ff-display" style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{assigned.name}</div>
            <div style={{ fontSize: 12, color: c.muted, marginBottom: 6 }}>{assigned.weeks} semaines · {assigned.cycle.filter(d => d !== "repos").length}x/semaine · {assigned.level}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <Pill c={c} tone="electric">{assigned.cat}</Pill>
              <Pill c={c}>{assigned.location === "home" ? "🏠 Maison" : "🏋️ Salle"}</Pill>
            </div>
          </div>
          <ChevronRight size={18} color={c.muted} />
        </Card>
      </div>
    );
  }

  const cats = ["Tous", ...new Set(PROGRAMS.map(p => p.cat))];
  let shown = filter === "Tous" ? PROGRAMS : PROGRAMS.filter(p => p.cat === filter);
  if (locFilter !== "Tous") shown = shown.filter(p => p.location === locFilter);

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <Card c={c} style={{ marginBottom: 16, padding: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={16} color={c.electric2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>Aucun programme ne vous a encore été assigné — choisissez-en un librement, ou attendez que votre coach vous en configure un sur-mesure.</span>
      </Card>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ id: "Tous", l: "Tous", icon: null }, { id: "gym", l: "Salle", icon: Building2 }, { id: "home", l: "Maison", icon: HomeIcon }].map(f => (
          <button key={f.id} onClick={() => setLocFilter(f.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 12, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${locFilter === f.id ? "transparent" : c.border}`,
            background: locFilter === f.id ? c.gradA : c.surface, color: locFilter === f.id ? "#fff" : c.muted
          }}>{f.icon && <f.icon size={13} />}{f.l}</button>
        ))}
      </div>
      <div className="scrollbar-none" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {cats.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            flexShrink: 0, padding: "8px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${filter === cat ? "transparent" : c.border}`,
            background: filter === cat ? c.gradA : c.surface, color: filter === cat ? "#fff" : c.muted
          }}>{cat}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((p) => (
          <Card c={c} key={p.id} onClick={() => openProgram(p)} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <p.icon size={22} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ff-display" style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: c.muted, marginBottom: 6 }}>{p.weeks} semaines · {p.cycle.filter(d => d !== "repos").length}x/semaine · {p.level}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Pill c={c} tone="electric">{p.cat}</Pill>
                <Pill c={c}>{p.location === "home" ? "🏠 Maison" : "🏋️ Salle"}</Pill>
              </div>
            </div>
            <ChevronRight size={18} color={c.muted} />
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   PROGRAM DETAIL
============================================================ */
const ProgramDetail = ({ c, program, onBack, openSession }) => {
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const toggleWeek = (w) => setExpandedWeeks(exp => exp.includes(w) ? exp.filter(x => x !== w) : [...exp, w]);
  const perWeek = program.cycle.filter(d => d !== "repos").length;
  const Icon = program.icon || Sparkles;

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <div style={{ background: c.gradB, borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Icon size={26} color="#fff" />
          <div style={{ display: "flex", gap: 6 }}>
            {program.custom && <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>Sur-mesure</span>}
            <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
              {program.location === "home" ? <><HomeIcon size={12} /> Maison</> : <><Building2 size={12} /> Salle de sport</>}
            </span>
          </div>
        </div>
        <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 19, marginBottom: 8 }}>{program.name}</div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.6, margin: "0 0 12px" }}>{program.desc}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>{program.weeks} semaines</span>
          <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>{perWeek}x / semaine</span>
          <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>{program.level}</span>
        </div>
      </div>

      <SecondaryBtn c={c} full icon={Download} onClick={() => exportProgramToPDF(program)} style={{ marginBottom: 20 }}>
        Exporter le programme en PDF
      </SecondaryBtn>

      <SectionTitle c={c}>Objectifs visés</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {program.goals.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={13} color={c.success} />
            </div>
            <span style={{ fontSize: 13.5 }}>{g}</span>
          </div>
        ))}
      </div>

      <SectionTitle c={c}>Cycle hebdomadaire type</SectionTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }} className="scrollbar-none">
        {program.cycle.map((d, i) => (
          <div key={i} style={{
            minWidth: 62, textAlign: "center", padding: "10px 4px", borderRadius: 12, flexShrink: 0,
            background: d === "repos" ? c.surface2 : "rgba(47,107,255,0.15)", border: `1px solid ${c.border}`
          }}>
            <div style={{ fontSize: 9.5, color: c.muted, marginBottom: 4 }}>{DAY_NAMES[i % 7].slice(0, 3)}</div>
            {d === "repos" ? <Coffee size={14} color={c.muted} style={{ margin: "0 auto" }} /> : <div style={{ fontSize: 10, fontWeight: 700, color: c.electric2 }}>{FOCUS_LABEL[d].split(" ")[0].split("·")[0]}</div>}
          </div>
        ))}
      </div>

      <SectionTitle c={c}>Programme complet</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...Array(program.weeks)].map((_, wi) => {
          const w = wi + 1;
          const open = expandedWeeks.includes(w);
          return (
            <Card c={c} key={w} style={{ padding: 0, overflow: "hidden" }}>
              <div onClick={() => toggleWeek(w)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, cursor: "pointer" }}>
                <span className="ff-display" style={{ fontWeight: 700, fontSize: 13.5 }}>Semaine {w}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Pill c={c}>{perWeek} séances</Pill>
                  <ChevronDown size={16} color={c.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </div>
              </div>
              {open && (
                <div style={{ borderTop: `1px solid ${c.border}` }}>
                  {program.cycle.map((dayType, di) => {
                    const sess = buildDaySession(program, w, di);
                    if (sess.rest) {
                      return (
                        <div key={di} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: di === 0 ? "none" : `1px solid ${c.border}` }}>
                          <div style={{ width: 30, height: 30, borderRadius: 9, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Coffee size={13} color={c.muted} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.muted }}>{sess.dayLabel} — Jour de repos</div>
                            <div style={{ fontSize: 11, color: c.muted }}>Récupération active conseillée</div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={di} onClick={() => openSession(program, w, di)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: di === 0 ? "none" : `1px solid ${c.border}`, cursor: "pointer" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Play size={12} color={c.electric2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{sess.dayLabel} — {FOCUS_LABEL[sess.dayType]}</div>
                          <div style={{ fontSize: 11, color: c.muted }}>{sess.estTotal} min · {sess.main.length + 4} exercices</div>
                        </div>
                        <ChevronRight size={15} color={c.muted} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   SESSION DETAIL (+ écran repos)
============================================================ */
const RestTimer = ({ seconds, c, onDone }) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  const pct = ((seconds - remaining) / seconds) * 100;
  return (
    <div className="anim-fadeIn" style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(0,113,227,0.08)", borderRadius: 16, padding: 14, border: `1px solid ${c.electric}` }}>
      <Ring pct={pct} size={54} stroke={5} c={c}>
        <span className="ff-mono anim-softPulse" style={{ fontWeight: 700, fontSize: 16 }}>{remaining}</span>
      </Ring>
      <div style={{ flex: 1 }}>
        <div className="ff-display" style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Lock size={12} color={c.electric2} /> Repos obligatoire</div>
        <div style={{ fontSize: 11.5, color: c.muted, marginTop: 2 }}>La série suivante se débloque dans {remaining}s</div>
      </div>
    </div>
  );
};

const ExerciseLogger = ({ e, c, i, onExerciseDone }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [sets, setSets] = useState(() => Array.from({ length: e.sets }, () => ({ weight: "", reps: "", done: false })));
  const [phase, setPhase] = useState("input"); // input | resting | complete
  const [activeIdx, setActiveIdx] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const timeBased = /sec|min/.test(e.reps);

  const validateSet = () => {
    if (weight === "" || reps === "") return;
    setSets(s => s.map((row, idx) => idx === activeIdx ? { weight, reps, done: true } : row));
    setWeight(""); setReps("");
    if (activeIdx === e.sets - 1) {
      setPhase("complete");
      onExerciseDone(i - 1);
    } else {
      setActiveIdx(a => a + 1);
      setPhase("resting");
    }
  };
  const onRestDone = () => setPhase("input");

  return (
    <Card c={c} style={{ padding: 14, border: phase === "complete" ? `1.5px solid ${c.success}` : `1px solid ${c.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="ff-mono" style={{
          width: 26, height: 26, borderRadius: 8, background: phase === "complete" ? c.success : c.surface2,
          color: phase === "complete" ? "#fff" : c.text, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, flexShrink: 0
        }}>{phase === "complete" ? <Check size={13} /> : i}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.name}</div>
          <div style={{ fontSize: 11.5, color: c.muted, marginTop: 2 }}>
            {e.sets} séries × {e.reps} · repos {e.rest}s {e.equip ? `· ${e.equip}` : ""}
          </div>
        </div>
        <Pill c={c} tone={e.diff === "Difficile" ? "warning" : e.diff === "Modéré" ? "electric" : "success"}>{e.diff}</Pill>
        <button onClick={() => setInfoOpen(!infoOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: c.muted, flexShrink: 0, padding: 4 }}>
          <Info size={16} />
        </button>
      </div>

      {infoOpen && (e.tips || e.safety) && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
          {e.tips && <div style={{ display: "flex", gap: 8, fontSize: 12 }}><Info size={14} color={c.electric2} style={{ flexShrink: 0, marginTop: 1 }} /><span><b>Conseil technique :</b> {e.tips}</span></div>}
          {e.safety && <div style={{ display: "flex", gap: 8, fontSize: 12 }}><Shield size={14} color={c.warning} style={{ flexShrink: 0, marginTop: 1 }} /><span><b>Sécurité :</b> {e.safety}</span></div>}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {sets.map((row, idx) => {
          if (row.done) {
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: c.surface2, borderRadius: 12, padding: "9px 12px" }}>
                <CheckCircle2 size={15} color={c.success} />
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>Série {idx + 1}</span>
                <span className="ff-mono" style={{ marginLeft: "auto", fontSize: 12, color: c.muted }}>{row.weight} kg · {row.reps}{timeBased ? " s" : " reps"}</span>
              </div>
            );
          }
          if (idx === activeIdx && phase === "resting") return <RestTimer key={idx} seconds={e.rest} c={c} onDone={onRestDone} />;
          if (idx === activeIdx && phase === "input") {
            return (
              <div key={idx} className="anim-fadeIn" style={{ background: "rgba(0,113,227,0.08)", border: `1.5px solid ${c.electric}`, borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: c.electric2 }}>Série {idx + 1} sur {e.sets}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: c.muted, marginBottom: 4 }}>Charge (kg)</div>
                    <input type="number" inputMode="decimal" value={weight} onChange={ev => setWeight(ev.target.value)} placeholder="0"
                      style={{ width: "100%", background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: "9px 10px", color: c.text, fontSize: 14, fontWeight: 700, outline: "none" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: c.muted, marginBottom: 4 }}>{timeBased ? "Temps réalisé (sec)" : "Répétitions"}</div>
                    <input type="number" inputMode="numeric" value={reps} onChange={ev => setReps(ev.target.value)} placeholder="0"
                      style={{ width: "100%", background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: "9px 10px", color: c.text, fontSize: 14, fontWeight: 700, outline: "none" }} />
                  </div>
                </div>
                <PrimaryBtn c={c} full icon={Check} disabled={weight === "" || reps === ""} onClick={validateSet} style={{ padding: "10px 16px" }}>
                  Valider la série
                </PrimaryBtn>
              </div>
            );
          }
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: c.surface2, borderRadius: 12, padding: "9px 12px", opacity: 0.4 }}>
              <Lock size={13} color={c.muted} />
              <span style={{ fontSize: 12, color: c.muted }}>Série {idx + 1} verrouillée</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const MessageThread = ({ c, clientId, isAdmin, peerName }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const msgs = await listMessages(clientId);
      setMessages(msgs);
      if (isAdmin) markMessagesRead(clientId).catch(() => {});
    } catch (e) { /* réseau indisponible */ }
    setLoading(false);
  };
  useEffect(() => { setLoading(true); load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [clientId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim(); setText("");
    try { await sendMessage(clientId, content, isAdmin); await load(); } catch (e) { setText(content); }
    setSending(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbar-none" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 2px" }}>
        {loading && <div style={{ textAlign: "center", color: c.muted, fontSize: 12, padding: 20 }}>Chargement...</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", color: c.muted, fontSize: 12.5, padding: 30 }}>
            Aucun message pour l'instant.<br />{isAdmin ? `Écrivez à ${peerName}.` : "Écrivez à votre coach."}
          </div>
        )}
        {messages.map(m => {
          const mine = m.sender_is_admin === isAdmin;
          return (
            <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
              <div style={{ background: mine ? c.gradA : c.surface2, color: mine ? "#fff" : c.text, borderRadius: 16, padding: "10px 13px", fontSize: 13, lineHeight: 1.45, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4 }}>
                {m.content}
              </div>
              <div style={{ fontSize: 9.5, color: c.muted, marginTop: 3, textAlign: mine ? "right" : "left" }}>
                {new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input style={{ ...inputStyle(c), flex: 1 }} placeholder="Écrire un message..." value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} />
        <IconBtn icon={Send} c={c} active onClick={send} />
      </div>
    </div>
  );
};

const RestDayScreen = ({ c }) => (
  <div style={{ padding: "18px 18px 30px", textAlign: "center" }} className="anim-fadeIn">
    <div style={{ width: 72, height: 72, borderRadius: 20, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", margin: "40px auto 20px" }}>
      <Coffee size={32} color={c.electric2} />
    </div>
    <h2 className="ff-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>Jour de repos</h2>
    <p style={{ color: c.muted, fontSize: 13.5, maxWidth: 300, margin: "0 auto 24px", lineHeight: 1.6 }}>
      La récupération fait partie intégrante de la progression. Profitez-en pour de la marche légère, des étirements ou simplement du repos complet.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320, margin: "0 auto" }}>
      {["Hydratez-vous bien tout au long de la journée", "Visez 7 à 9h de sommeil cette nuit", "Étirements légers ou marche de 20 minutes si vous le souhaitez"].map((t, i) => (
        <Card c={c} key={i} style={{ display: "flex", gap: 10, padding: 12, textAlign: "left" }}>
          <Heart size={15} color={c.danger} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5 }}>{t}</span>
        </Card>
      ))}
    </div>
  </div>
);

/* ============================================================
   MODE FOCUS — un exercice plein écran à la fois, avec repos
   obligatoire plein écran entre les séries.
============================================================ */
const FocusExercise = ({ c, exercise, index, total, nextName, onExerciseDone, onContinue, onExitFocus }) => {
  const [sets, setSets] = useState(() => Array.from({ length: exercise.sets }, () => ({ weight: "", reps: "", done: false })));
  const [phase, setPhase] = useState("input"); // input | resting | done
  const [activeIdx, setActiveIdx] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [restRemaining, setRestRemaining] = useState(exercise.rest);
  const [infoOpen, setInfoOpen] = useState(false);
  const timeBased = /sec|min/.test(exercise.reps);

  useEffect(() => {
    if (phase !== "resting") return;
    if (restRemaining <= 0) { setPhase("input"); return; }
    const t = setTimeout(() => setRestRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, restRemaining]);

  const validate = () => {
    if (weight === "" || reps === "") return;
    setSets(s => s.map((row, i) => i === activeIdx ? { weight, reps, done: true } : row));
    setWeight(""); setReps("");
    if (activeIdx === exercise.sets - 1) {
      setPhase("done");
      onExerciseDone();
    } else {
      setActiveIdx(a => a + 1);
      setRestRemaining(exercise.rest);
      setPhase("resting");
    }
  };

  const restPct = ((exercise.rest - restRemaining) / exercise.rest) * 100;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: c.bg, backgroundImage: c.bgGrad, display: "flex", flexDirection: "column", padding: "calc(18px + max(env(safe-area-inset-top), 24px)) 20px calc(18px + env(safe-area-inset-bottom))" }} className="ff-body anim-fadeIn">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button onClick={onExitFocus} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${c.border}`, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: c.text }}>
          <X size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: c.surface2, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((index + (phase === "done" ? 1 : 0)) / total) * 100}%`, background: c.gradA, borderRadius: 4, transition: "width .4s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: c.muted, marginTop: 5 }}>Exercice {index + 1} / {total}</div>
        </div>
        <button onClick={() => setInfoOpen(!infoOpen)} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${c.border}`, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: c.electric2 }}>
          <Info size={18} />
        </button>
      </div>

      {infoOpen && (
        <Card c={c} style={{ marginBottom: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {exercise.tips && <div style={{ display: "flex", gap: 8, fontSize: 12.5 }}><Info size={14} color={c.electric2} style={{ flexShrink: 0, marginTop: 1 }} /><span><b>Conseil :</b> {exercise.tips}</span></div>}
          {exercise.safety && <div style={{ display: "flex", gap: 8, fontSize: 12.5 }}><Shield size={14} color={c.warning} style={{ flexShrink: 0, marginTop: 1 }} /><span><b>Sécurité :</b> {exercise.safety}</span></div>}
          <VideoBlock c={c} videoUrl={exercise.videoUrl} exerciseName={exercise.name} />
        </Card>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {phase !== "done" && (
          <>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: c.electric2, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
              {exercise.cat}{exercise.equip ? ` · ${exercise.equip}` : ""}
            </div>
            <h1 className="ff-display" style={{ fontSize: 25, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.15 }}>{exercise.name}</h1>
            <div style={{ fontSize: 13, color: c.muted, marginBottom: 28 }}>{exercise.sets} séries × {exercise.reps}</div>

            <div style={{ display: "flex", gap: 6, marginBottom: 30 }}>
              {sets.map((s, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: s.done ? c.success : i === activeIdx ? c.electric2 : c.surface2,
                  border: i === activeIdx && !s.done ? `2px solid ${c.electric2}` : "none"
                }} />
              ))}
            </div>
          </>
        )}

        {phase === "input" && (
          <div style={{ width: "100%", maxWidth: 340 }} className="anim-pop">
            <div className="ff-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: c.electric2 }}>Série {activeIdx + 1} sur {exercise.sets}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: c.muted, marginBottom: 8 }}>Charge (kg)</div>
                <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" autoFocus
                  style={{ width: "100%", textAlign: "center", background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "18px 10px", color: c.text, fontSize: 26, fontWeight: 700, outline: "none" }} className="ff-mono" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: c.muted, marginBottom: 8 }}>{timeBased ? "Temps (sec)" : "Répétitions"}</div>
                <input type="number" inputMode="numeric" value={reps} onChange={e => setReps(e.target.value)} placeholder="0"
                  style={{ width: "100%", textAlign: "center", background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "18px 10px", color: c.text, fontSize: 26, fontWeight: 700, outline: "none" }} className="ff-mono" />
              </div>
            </div>
            <PrimaryBtn c={c} full icon={Check} disabled={weight === "" || reps === ""} onClick={validate} style={{ padding: "16px 20px", fontSize: 15 }}>
              Valider la série
            </PrimaryBtn>
          </div>
        )}

        {phase === "resting" && (
          <div className="anim-pop">
            <Ring pct={restPct} size={220} stroke={14} c={c}>
              <div style={{ textAlign: "center" }}>
                <div className="ff-mono anim-softPulse" style={{ fontSize: 52, fontWeight: 700, color: c.text, lineHeight: 1 }}>{restRemaining}</div>
                <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>secondes</div>
              </div>
            </Ring>
            <div className="ff-display" style={{ fontSize: 17, fontWeight: 700, marginTop: 24, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <Lock size={16} color={c.electric2} /> Repos obligatoire
            </div>
            <div style={{ fontSize: 12.5, color: c.muted, marginTop: 6 }}>Série {activeIdx + 1} débloquée automatiquement</div>
          </div>
        )}

        {phase === "done" && (
          <div className="anim-pop" style={{ width: "100%", maxWidth: 340 }}>
            <div style={{ width: 78, height: 78, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={38} color="#fff" />
            </div>
            <h2 className="ff-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>{exercise.name} terminé</h2>
            <p style={{ fontSize: 13, color: c.muted, marginBottom: 30 }}>
              {nextName ? <>Prochain exercice : <b style={{ color: c.text }}>{nextName}</b></> : "Dernier exercice de la séance terminé 🎉"}
            </p>
            <PrimaryBtn c={c} full icon={nextName ? ChevronRight : CheckCircle2} onClick={onContinue} style={{ padding: "16px 20px", fontSize: 15 }}>
              {nextName ? "Exercice suivant" : "Terminer"}
            </PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
};

const FocusRunner = ({ c, exercises, startIndex, onMarkDone, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const exercise = exercises[idx];
  const isLast = idx === exercises.length - 1;

  return (
    <FocusExercise key={idx} c={c} exercise={exercise} index={idx} total={exercises.length}
      nextName={isLast ? null : exercises[idx + 1].name}
      onExerciseDone={() => onMarkDone(idx)}
      onContinue={() => { if (isLast) onClose(); else setIdx(idx + 1); }}
      onExitFocus={onClose} />
  );
};

const SessionDetail = ({ c, session, onComplete, completed }) => {
  const [doneMap, setDoneMap] = useState({});
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusStart, setFocusStart] = useState(0);
  if (session.rest) return <RestDayScreen c={c} />;
  const totalExercises = session.warm.length + session.main.length + session.cool.length;
  const doneCount = Object.keys(doneMap).length;
  const allLogged = doneCount >= session.main.length;
  const markDone = (idx) => setDoneMap(m => ({ ...m, [idx]: true }));

  return (
    <div style={{ padding: "18px 18px 110px" }} className="anim-fadeIn">
      <div style={{ background: c.gradB, borderRadius: 20, padding: 20, marginBottom: 18 }}>
        <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{session.title}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 12.5 }}><Clock size={14} /> {session.estTotal} min</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 12.5 }}><Target size={14} /> {totalExercises} exercices</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 12.5 }}><Activity size={14} /> {session.difficulty}</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 5 }}>
            <span>Progression de la séance</span><span className="ff-mono">{doneCount}/{session.main.length}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(doneCount / session.main.length) * 100}%`, background: "#fff", borderRadius: 4, transition: "width .4s ease" }} />
          </div>
        </div>
      </div>

      <SectionTitle c={c}>Échauffement</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {session.warm.map((w, i) => (
          <Card c={c} key={i} style={{ padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Timer size={15} color={c.electric2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: c.muted }}>{w.tips}</div>
            </div>
            <Pill c={c}>{w.d}</Pill>
          </Card>
        ))}
      </div>

      <SectionTitle c={c} action={<Pill c={c} tone={allLogged ? "success" : "electric"}>{doneCount}/{session.main.length} loggés</Pill>}>
        Exercices principaux
      </SectionTitle>
      <p style={{ fontSize: 11.5, color: c.muted, marginTop: -6, marginBottom: 12, lineHeight: 1.5 }}>
        Chaque exercice s'ouvre en plein écran, un à la fois, avec un repos obligatoire entre les séries.
      </p>
      <PrimaryBtn c={c} full icon={Play} style={{ marginBottom: 12 }} onClick={() => {
        const firstIncomplete = session.main.findIndex((_, i) => !doneMap[i]);
        setFocusStart(firstIncomplete === -1 ? 0 : firstIncomplete);
        setFocusOpen(true);
      }}>
        {doneCount === 0 ? "Démarrer les exercices" : doneCount < session.main.length ? `Reprendre (${doneCount}/${session.main.length})` : "Revoir les exercices"}
      </PrimaryBtn>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {session.main.map((e, i) => (
          <Card key={i} c={c} onClick={() => { setFocusStart(i); setFocusOpen(true); }} style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ff-mono" style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: doneMap[i] ? c.success : c.surface2, color: doneMap[i] ? "#fff" : c.text
            }}>{doneMap[i] ? <Check size={13} /> : i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: c.muted }}>{e.sets} séries × {e.reps}</div>
            </div>
            <ChevronRight size={16} color={c.muted} />
          </Card>
        ))}
      </div>
      {focusOpen && (
        <FocusRunner c={c} exercises={session.main} startIndex={focusStart}
          onMarkDone={(i) => markDone(i)} onClose={() => setFocusOpen(false)} />
      )}

      <SectionTitle c={c}>Retour au calme</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
        {session.cool.map((w, i) => (
          <Card c={c} key={i} style={{ padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Heart size={15} color={c.danger} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: c.muted }}>{w.tips}</div>
            </div>
            <Pill c={c}>{w.d}</Pill>
          </Card>
        ))}
      </div>

      <div style={{ position: "fixed", bottom: 18, left: 0, right: 0, padding: "0 18px", zIndex: 25 }}>
        {!allLogged && !completed && (
          <div style={{ textAlign: "center", fontSize: 11.5, color: c.muted, marginBottom: 8, background: c.bg, display: "inline-block", width: "100%" }}>
            Loggez les {session.main.length} exercices pour valider la séance
          </div>
        )}
        <PrimaryBtn c={c} full icon={completed ? CheckCircle2 : Play} onClick={onComplete} disabled={!allLogged && !completed}
          style={completed ? { background: c.success, boxShadow: "0 8px 24px rgba(52,199,89,0.35)" } : {}}>
          {completed ? "Séance terminée ✓" : "Terminer la séance"}
        </PrimaryBtn>
      </div>
    </div>
  );
};

/* ============================================================
   CALENDAR
============================================================ */
const Calendar = ({ c, history }) => {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const cells = [...Array(startOffset)].map(() => null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <SectionTitle c={c}>Statistiques</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Card c={c}><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>18</div><div style={{ fontSize: 11.5, color: c.muted }}>Séances ce mois-ci</div></Card>
        <Card c={c}><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>4/5</div><div style={{ fontSize: 11.5, color: c.muted }}>Séances cette semaine</div></Card>
      </div>

      <SectionTitle c={c}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</SectionTitle>
      <Card c={c}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10.5, color: c.muted, fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const state = history[day] || "none";
            const isToday = day === now.getDate();
            const bg = state === "done" ? c.gradA : state === "rest" ? c.surface2 : "transparent";
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: bg, border: isToday ? `1.5px solid ${c.electric2}` : state === "none" ? `1px solid ${c.border}` : "none",
                fontSize: 11.5, fontWeight: 600, color: state === "done" ? "#fff" : c.text
              }}>
                {state === "done" ? <Check size={12} /> : day}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: c.muted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: c.gradA }} /> Séance validée</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: c.surface2, border: `1px solid ${c.border}` }} /> Repos</div>
        </div>
      </Card>

      <SectionTitle c={c} action={null}>Historique récent</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { d: "Hier", t: "Push Pull Legs — Jour Push", m: 58, k: 420 },
          { d: "Il y a 2 jours", t: "Upper Lower — Jour Lower", m: 52, k: 390 },
          { d: "Il y a 4 jours", t: "Cardio Endurance — Rameur", m: 40, k: 380 },
        ].map((h, i) => (
          <Card c={c} key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={16} color={c.success} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{h.t}</div>
              <div style={{ fontSize: 11, color: c.muted }}>{h.d} · {h.m} min · {h.k} kcal</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   NUTRITION
============================================================ */
const Nutrition = ({ c, profile, water, setWater }) => {
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [age, setAge] = useState(28);
  const [activity, setActivity] = useState(1.55);
  const [gender, setGender] = useState("h");

  const bmr = gender === "h"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * activity);

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <SectionTitle c={c}>Hydratation du jour</SectionTitle>
      <Card c={c} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Ring pct={(water / 8) * 100} size={64} stroke={7} c={c}>
            <Droplet size={22} color={c.electric2} />
          </Ring>
          <div style={{ flex: 1 }}>
            <div className="ff-display" style={{ fontWeight: 700, fontSize: 15 }}>{water} / 8 verres</div>
            <div style={{ fontSize: 11.5, color: c.muted, marginBottom: 8 }}>≈ {(water * 0.25).toFixed(2)} L bus aujourd'hui</div>
            <div style={{ display: "flex", gap: 8 }}>
              <IconBtn icon={Minus} c={c} onClick={() => setWater(Math.max(0, water - 1))} size={32} />
              <IconBtn icon={Plus} c={c} onClick={() => setWater(Math.min(12, water + 1))} size={32} active />
            </div>
          </div>
        </div>
      </Card>

      <SectionTitle c={c}>Calculateur de besoins caloriques</SectionTitle>
      <Card c={c} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["h", "f"].map(g => (
            <button key={g} onClick={() => setGender(g)} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              border: `1px solid ${gender === g ? "transparent" : c.border}`, background: gender === g ? c.gradA : c.surface2, color: gender === g ? "#fff" : c.text
            }}>{g === "h" ? "Homme" : "Femme"}</button>
          ))}
        </div>
        {[
          { l: "Poids (kg)", v: weight, set: setWeight, min: 40, max: 150 },
          { l: "Taille (cm)", v: height, set: setHeight, min: 140, max: 210 },
          { l: "Âge", v: age, set: setAge, min: 14, max: 80 },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: c.muted, marginBottom: 4 }}>
              <span>{f.l}</span><span className="ff-mono" style={{ color: c.text, fontWeight: 700 }}>{f.v}</span>
            </div>
            <input type="range" min={f.min} max={f.max} value={f.v} onChange={(e) => f.set(Number(e.target.value))}
              style={{ width: "100%", accentColor: c.electric }} />
          </div>
        ))}
        <div style={{ marginTop: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: c.muted, marginBottom: 6 }}>Niveau d'activité</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ l: "Faible", v: 1.2 }, { l: "Modéré", v: 1.55 }, { l: "Élevé", v: 1.9 }].map(a => (
              <button key={a.v} onClick={() => setActivity(a.v)} style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${activity === a.v ? "transparent" : c.border}`, background: activity === a.v ? c.gradA : c.surface2, color: activity === a.v ? "#fff" : c.muted
              }}>{a.l}</button>
            ))}
          </div>
        </div>
        <div style={{ background: c.surface2, borderRadius: 14, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 11.5, color: c.muted, marginBottom: 4 }}>Besoin calorique estimé</div>
          <div className="ff-mono" style={{ fontWeight: 700, fontSize: 26, color: c.electric2 }}>{tdee.toLocaleString("fr-FR")} kcal/j</div>
        </div>
      </Card>

      <SectionTitle c={c}>Conseils nutritionnels</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {[
          "Répartissez vos protéines sur 3 à 4 prises par jour pour optimiser la récupération musculaire.",
          "Privilégiez les glucides complexes avant l'entraînement pour un niveau d'énergie stable.",
          "Ne négligez pas les graisses de qualité (oléagineux, poisson gras, huile d'olive).",
        ].map((tip, i) => (
          <Card c={c} key={i} style={{ display: "flex", gap: 10, padding: 12 }}>
            <Salad size={16} color={c.success} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>{tip}</span>
          </Card>
        ))}
      </div>

      <SectionTitle c={c}>Idées de repas fitness</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MEALS.map((m, i) => (
          <Card c={c} key={i} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
              <Pill c={c} tone="electric">{m.tag}</Pill>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: c.muted }}>
              <span className="ff-mono">{m.kcal} kcal</span>
              <span>P {m.p}g</span><span>G {m.c}g</span><span>L {m.f}g</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   PROFILE
============================================================ */
const Profile = ({ c, state, dark, setDark, accountEmail }) => {
  const { name, weight, height, goal, level, xp, sportLevel } = state;
  const badgesUnlocked = BADGES.map(b => ({
    ...b,
    unlocked: (b.type === "sessions" && state.sessionsCompleted >= b.target) ||
      (b.type === "streak" && state.streak >= b.target) ||
      (b.type === "xp" && xp >= b.target)
  }));

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 10px" }}>
          <Ring pct={((xp - xpForLevel(level - 1)) / (xpForLevel(level) - xpForLevel(level - 1))) * 100} size={88} stroke={5} c={c}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24 }}>
              {name.charAt(0)}
            </div>
          </Ring>
          <div style={{ position: "absolute", bottom: -2, right: -2, background: c.surface, border: `2px solid ${c.bg}`, borderRadius: 999, padding: "2px 8px", fontSize: 10.5, fontWeight: 700, color: c.electric2 }}>
            Niv. {level}
          </div>
        </div>
        <div className="ff-display" style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: c.muted }}>{sportLevel} · Objectif : {goal}</div>
        <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{accountEmail}</div>
      </div>

      <SectionTitle c={c}>Informations</SectionTitle>
      <Card c={c} style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { l: "Taille", v: height + " cm" }, { l: "Poids", v: weight + " kg" },
            { l: "Niveau sportif", v: sportLevel }, { l: "Objectif", v: goal },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 3 }}>{f.l}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{f.v}</div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle c={c}>Évolution du poids</SectionTitle>
      <Card c={c} style={{ marginBottom: 18, paddingTop: 16 }}>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={WEIGHT_HISTORY}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
            <XAxis dataKey="s" tick={{ fill: c.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12 }} />
            <Line type="monotone" dataKey="kg" stroke={c.electric2} strokeWidth={2.5} dot={{ r: 3, fill: c.electric2 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle c={c}>Badges & récompenses</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {badgesUnlocked.map((b) => (
          <div key={b.id} style={{ textAlign: "center" }}>
            <div style={{
              width: 54, height: 54, borderRadius: 16, margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center",
              background: b.unlocked ? c.gradA : c.surface2, border: `1px solid ${c.border}`, opacity: b.unlocked ? 1 : 0.5
            }}>
              {b.unlocked ? <b.icon size={22} color="#fff" /> : <Lock size={17} color={c.muted} />}
            </div>
            <div style={{ fontSize: 9.5, color: c.muted, lineHeight: 1.3 }}>{b.name}</div>
          </div>
        ))}
      </div>

      <SectionTitle c={c}>Préférences</SectionTitle>
      <Card c={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {dark ? <Moon size={17} color={c.electric2} /> : <Sun size={17} color={c.warning} />}
          <span style={{ fontSize: 13, fontWeight: 600 }}>Mode sombre</span>
        </div>
        <div onClick={() => setDark(!dark)} style={{ width: 44, height: 26, borderRadius: 999, background: dark ? c.gradA : c.surface2, position: "relative", cursor: "pointer", border: `1px solid ${c.border}` }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: dark ? 21 : 2, transition: "left .2s" }} />
        </div>
      </Card>
    </div>
  );
};

/* ============================================================
   L'accès admin est désormais déterminé automatiquement après une
   connexion réelle (colonne is_admin sur le profil Supabase) —
   plus besoin d'un code d'accès séparé.
============================================================ */

/* ============================================================
   ADMIN — PANEL
============================================================ */
const DayExercisePicker = ({ c, location, dayExercises, onAdd, onRemove, onUpdate }) => {
  const [catFilter, setCatFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [cName, setCName] = useState("");
  const [cCat, setCCat] = useState(EXERCISE_CATEGORIES[0]);
  const [cSets, setCSets] = useState(3);
  const [cReps, setCReps] = useState("12 reps");
  const [cRest, setCRest] = useState(60);
  const [cDiff, setCDiff] = useState("Modéré");
  const [cTips, setCTips] = useState("");
  const [cSafety, setCSafety] = useState("");
  const [cEquip, setCEquip] = useState("");
  const [cVideo, setCVideo] = useState("");

  const filtered = EXERCISE_LIBRARY.filter(e =>
    (e.location === location || e.location === "both") &&
    (catFilter === "Tous" || e.cat === catFilter) &&
    (!search || e.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addCustom = () => {
    if (!cName.trim()) return;
    onAdd({
      id: `custom-${Date.now()}`, cat: cCat, location, name: cName.trim(),
      sets: Number(cSets) || 3, reps: cReps.trim() || "12 reps", rest: Number(cRest) || 60,
      diff: cDiff, tips: cTips.trim(), safety: cSafety.trim(), equip: cEquip.trim() || undefined,
      videoUrl: cVideo.trim() || undefined,
    });
    setCName(""); setCTips(""); setCSafety(""); setCEquip(""); setCVideo(""); setCSets(3); setCReps("12 reps"); setCRest(60);
    setShowCustom(false);
  };

  return (
    <div style={{ marginTop: 10, padding: 12, background: c.surface2, borderRadius: 14 }}>
      <input style={{ ...inputStyle(c), marginBottom: 8, padding: "9px 10px", fontSize: 12.5 }} placeholder="Rechercher un exercice..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="scrollbar-none" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 2 }}>
        {["Tous", ...EXERCISE_CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={{
            flexShrink: 0, padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${catFilter === cat ? "transparent" : c.border}`,
            background: catFilter === cat ? c.gradA : c.surface, color: catFilter === cat ? "#fff" : c.muted
          }}>{cat}</button>
        ))}
      </div>

      <button onClick={() => setShowCustom(!showCustom)} style={{
        display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${c.electric}`,
        borderRadius: 10, padding: "8px 10px", width: "100%", cursor: "pointer", color: c.electric2,
        fontSize: 12, fontWeight: 700, marginBottom: 10, justifyContent: "center"
      }}>
        <Plus size={14} /> {showCustom ? "Annuler" : "Créer un exercice personnalisé"}
      </button>

      {showCustom && (
        <div className="anim-fadeIn" style={{ background: c.surface, borderRadius: 12, padding: 10, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <input style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12.5 }} placeholder="Nom de l'exercice" value={cName} onChange={e => setCName(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12 }} value={cCat} onChange={e => setCCat(e.target.value)}>
              {EXERCISE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12 }} value={cDiff} onChange={e => setCDiff(e.target.value)}>
              <option>Facile</option><option>Modéré</option><option>Difficile</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div><div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Séries</div>
              <input type="number" min={1} style={{ ...inputStyle(c), padding: "8px 8px", fontSize: 12 }} value={cSets} onChange={e => setCSets(e.target.value)} /></div>
            <div><div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Reps / temps</div>
              <input style={{ ...inputStyle(c), padding: "8px 8px", fontSize: 12 }} value={cReps} onChange={e => setCReps(e.target.value)} /></div>
            <div><div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Repos (s)</div>
              <input type="number" min={0} style={{ ...inputStyle(c), padding: "8px 8px", fontSize: 12 }} value={cRest} onChange={e => setCRest(e.target.value)} /></div>
          </div>
          <input style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12 }} placeholder="Matériel (optionnel)" value={cEquip} onChange={e => setCEquip(e.target.value)} />
          <textarea style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12, minHeight: 44, resize: "vertical" }} placeholder="Conseil technique (optionnel)" value={cTips} onChange={e => setCTips(e.target.value)} />
          <textarea style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12, minHeight: 44, resize: "vertical" }} placeholder="Consigne de sécurité (optionnel)" value={cSafety} onChange={e => setCSafety(e.target.value)} />
          <input style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12 }} placeholder="Lien vidéo YouTube (optionnel)" value={cVideo} onChange={e => setCVideo(e.target.value)} />
          <PrimaryBtn c={c} full icon={Plus} disabled={!cName.trim()} onClick={addCustom} style={{ padding: "9px 14px" }}>Ajouter à la séance</PrimaryBtn>
        </div>
      )}

      <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {filtered.length === 0 && <div style={{ fontSize: 12, color: c.muted, textAlign: "center", padding: 12 }}>Aucun exercice trouvé.</div>}
        {filtered.map(libEx => (
          <div key={libEx.id} style={{ display: "flex", alignItems: "center", gap: 8, background: c.surface, borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{libEx.name}</div>
              <div style={{ fontSize: 10.5, color: c.muted }}>{libEx.cat} · {libEx.sets}×{libEx.reps}</div>
            </div>
            <button onClick={() => onAdd(libEx)} style={{ width: 28, height: 28, borderRadius: 9, border: "none", background: c.gradA, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Plus size={14} />
            </button>
          </div>
        ))}
      </div>

      <div style={labelStyle(c)}>Exercices de la séance ({dayExercises.length})</div>
      {dayExercises.length === 0 && <div style={{ fontSize: 12, color: c.muted, marginBottom: 4 }}>Aucun exercice ajouté pour l'instant.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dayExercises.map((e, idx) => (
          <div key={idx} style={{ background: c.surface, borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>{idx + 1}. {e.name}</span>
              <button onClick={() => onRemove(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: c.danger }}><X size={15} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <div>
                <div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Séries</div>
                <input type="number" min={1} value={e.sets} onChange={ev => onUpdate(idx, "sets", Number(ev.target.value) || 1)}
                  style={{ width: "100%", background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 8px", color: c.text, fontSize: 12 }} />
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Reps / temps</div>
                <input value={e.reps} onChange={ev => onUpdate(idx, "reps", ev.target.value)}
                  style={{ width: "100%", background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 8px", color: c.text, fontSize: 12 }} />
              </div>
              <div>
                <div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Repos (s)</div>
                <input type="number" min={0} value={e.rest} onChange={ev => onUpdate(idx, "rest", Number(ev.target.value) || 0)}
                  style={{ width: "100%", background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 8px", color: c.text, fontSize: 12 }} />
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 9.5, color: c.muted, marginBottom: 2 }}>Lien vidéo YouTube (optionnel)</div>
              <input value={e.videoUrl || ""} onChange={ev => onUpdate(idx, "videoUrl", ev.target.value)} placeholder="https://youtube.com/watch?v=..."
                style={{ width: "100%", background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 8px", color: c.text, fontSize: 11.5 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgramBuilder = ({ c, client, onSave, onCancel, templates, otherClients, onSaveTemplate, onDeleteTemplate }) => {
  const existing = client.customProgram;
  const [name, setName] = useState(existing?.name || `Programme de ${client.name}`);
  const [level, setLevel] = useState(existing?.level || "Intermédiaire");
  const [weeks, setWeeks] = useState(existing?.weeks || 8);
  const [location, setLocation] = useState(existing?.location || "gym");
  const [desc, setDesc] = useState(existing?.desc || "");
  const [goals, setGoals] = useState((existing?.goals || ["Objectif personnalisé"]).join(", "));
  const [days, setDays] = useState(() =>
    existing?.customSessions
      ? existing.customSessions.map(d => ({ rest: !!d.rest, title: d.title || "", exercises: d.exercises || [] }))
      : Array.from({ length: 7 }, () => ({ rest: true, title: "", exercises: [] }))
  );
  const [openDay, setOpenDay] = useState(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const loadProgramData = (data) => {
    setName(data.name || name); setLevel(data.level || level); setWeeks(data.weeks || weeks);
    setLocation(data.location || location); setDesc(data.desc || ""); setGoals((data.goals || []).join(", "));
    setDays(data.customSessions ? data.customSessions.map(d => ({ rest: !!d.rest, title: d.title || "", exercises: d.exercises || [] })) : days);
  };

  const toggleRest = (i) => setDays(ds => ds.map((d, di) => di === i ? { ...d, rest: !d.rest, title: d.rest && !d.title ? "Séance" : d.title } : d));
  const setTitle = (i, val) => setDays(ds => ds.map((d, di) => di === i ? { ...d, title: val } : d));
  const addExercise = (i, libEx) => setDays(ds => ds.map((d, di) => di === i ? { ...d, exercises: [...d.exercises, { ...libEx }] } : d));
  const removeExercise = (i, exIdx) => setDays(ds => ds.map((d, di) => di === i ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) } : d));
  const updateExercise = (i, exIdx, field, val) => setDays(ds => ds.map((d, di) => di !== i ? d : { ...d, exercises: d.exercises.map((e, ei) => ei === exIdx ? { ...e, [field]: val } : e) }));

  const totalSessions = days.filter(d => !d.rest && d.exercises.length > 0).length;

  const buildProgramData = () => ({
    name, cat: "Sur-mesure", level, weeks: Number(weeks) || 8, location, desc,
    goals: goals.split(",").map(g => g.trim()).filter(Boolean),
    cycle: days.map(d => (d.rest || d.exercises.length === 0) ? "repos" : "custom"),
    customSessions: days, custom: true,
  });

  const save = () => onSave(buildProgramData());
  const saveAsTemplate = () => {
    if (!templateName.trim()) return;
    onSaveTemplate(templateName.trim(), buildProgramData());
    setTemplateName(""); setShowSaveTemplate(false);
  };

  return (
    <Card c={c} style={{ marginBottom: 14 }}>
      <div className="ff-display" style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Programme sur-mesure — {totalSessions} séance(s)/semaine</div>

      {(otherClients.length > 0 || templates.length > 0) && (
        <div style={{ background: c.surface2, borderRadius: 12, padding: 10, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.muted, display: "flex", alignItems: "center", gap: 5 }}><Copy size={13} /> Réutiliser un programme existant</div>
          {otherClients.length > 0 && (
            <select style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12 }} defaultValue="" onChange={e => {
              const src = otherClients.find(o => o.id === e.target.value);
              if (src && src.customProgram) loadProgramData(src.customProgram);
              e.target.value = "";
            }}>
              <option value="" disabled>Copier depuis un autre client...</option>
              {otherClients.map(o => <option key={o.id} value={o.id}>{o.name} — {o.customProgram.name}</option>)}
            </select>
          )}
          {templates.length > 0 && (
            <select style={{ ...inputStyle(c), padding: "8px 10px", fontSize: 12 }} defaultValue="" onChange={e => {
              const t = templates.find(t => t.id === e.target.value);
              if (t) loadProgramData(t.data);
              e.target.value = "";
            }}>
              <option value="" disabled>Charger un modèle enregistré...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div><div style={labelStyle(c)}>Nom du programme</div><input style={inputStyle(c)} value={name} onChange={e => setName(e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={labelStyle(c)}>Lieu</div>
            <select style={inputStyle(c)} value={location} onChange={e => setLocation(e.target.value)}>
              <option value="gym">Salle de sport</option>
              <option value="home">Maison</option>
            </select>
          </div>
          <div>
            <div style={labelStyle(c)}>Niveau</div>
            <select style={inputStyle(c)} value={level} onChange={e => setLevel(e.target.value)}>
              <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
            </select>
          </div>
        </div>
        <div><div style={labelStyle(c)}>Durée (semaines)</div><input type="number" min={1} max={20} style={inputStyle(c)} value={weeks} onChange={e => setWeeks(e.target.value)} /></div>
        <div><div style={labelStyle(c)}>Objectifs (séparés par des virgules)</div><input style={inputStyle(c)} value={goals} onChange={e => setGoals(e.target.value)} /></div>
        <div><div style={labelStyle(c)}>Description</div><textarea style={{ ...inputStyle(c), minHeight: 60, resize: "vertical" }} value={desc} onChange={e => setDesc(e.target.value)} /></div>

        <div style={labelStyle(c)}>Plan hebdomadaire (identique chaque semaine)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {days.map((d, i) => (
            <div key={i} style={{ border: `1px solid ${c.border}`, borderRadius: 12, padding: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 60, fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>{DAY_NAMES[i]}</span>
                <button onClick={() => toggleRest(i)} style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, cursor: "pointer", border: "none",
                  background: d.rest ? c.surface2 : "rgba(0,113,227,0.15)", color: d.rest ? c.muted : c.electric2, flexShrink: 0
                }}>{d.rest ? "Repos" : "Séance"}</button>
                {!d.rest && (
                  <input value={d.title} onChange={e => setTitle(i, e.target.value)} placeholder="Titre (ex : Push)"
                    style={{ flex: 1, minWidth: 0, background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 8, padding: "6px 9px", color: c.text, fontSize: 12 }} />
                )}
                {!d.rest && (
                  <button onClick={() => setOpenDay(openDay === i ? null : i)} style={{ background: "none", border: "none", cursor: "pointer", color: c.electric2, flexShrink: 0, display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700 }}>
                    {d.exercises.length} ex. <ChevronDown size={13} style={{ transform: openDay === i ? "rotate(180deg)" : "none" }} />
                  </button>
                )}
              </div>
              {!d.rest && openDay === i && (
                <DayExercisePicker c={c} location={location} dayExercises={d.exercises}
                  onAdd={(libEx) => addExercise(i, libEx)}
                  onRemove={(exIdx) => removeExercise(i, exIdx)}
                  onUpdate={(exIdx, field, val) => updateExercise(i, exIdx, field, val)} />
              )}
            </div>
          ))}
        </div>

        {showSaveTemplate ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle(c), flex: 1 }} placeholder="Nom du modèle (ex : PPL Débutant)" value={templateName} onChange={e => setTemplateName(e.target.value)} />
            <SecondaryBtn c={c} icon={X} onClick={() => setShowSaveTemplate(false)} />
            <PrimaryBtn c={c} icon={Check} disabled={!templateName.trim()} onClick={saveAsTemplate}>OK</PrimaryBtn>
          </div>
        ) : (
          <SecondaryBtn c={c} full icon={Bookmark} onClick={() => setShowSaveTemplate(true)}>Enregistrer comme modèle réutilisable</SecondaryBtn>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <SecondaryBtn c={c} full onClick={onCancel}>Annuler</SecondaryBtn>
          <PrimaryBtn c={c} full icon={Send} disabled={totalSessions === 0} onClick={save}>Assigner ce programme</PrimaryBtn>
        </div>
      </div>
    </Card>
  );
};

function fmtRelative(dateStr) {
  if (!dateStr) return "Jamais";
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 0) return "Aujourd'hui";
  return `Il y a ${days} j`;
}

const ClientRow = ({ c, client, onApprove, onReject, onAssignLibrary, onOpenBuilder, editing, onCloseBuilder, onSaveCustom, templates, otherClients, onSaveTemplate }) => {
  const assigned = resolveAssignedProgram(client);
  const [showChat, setShowChat] = useState(false);
  return (
    <Card c={c} style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {client.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{client.name}</div>
          <div style={{ fontSize: 11, color: c.muted }}>{client.email}</div>
        </div>
        {client.status === "pending" && <Pill c={c} tone="warning">En attente</Pill>}
        {client.status === "approved" && <Pill c={c} tone="success">Actif</Pill>}
        {client.status === "rejected" && <Pill c={c} tone="danger">Refusé</Pill>}
      </div>

      {client.status === "pending" && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <SecondaryBtn c={c} full icon={XCircle} onClick={() => onReject(client)} style={{ color: c.danger }}>Refuser</SecondaryBtn>
          <PrimaryBtn c={c} full icon={ShieldCheck} onClick={() => onApprove(client)}>Valider</PrimaryBtn>
        </div>
      )}

      {client.status === "approved" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11.5, color: c.muted, marginBottom: 8 }}>
            Programme actuel : <b style={{ color: c.text }}>{assigned ? assigned.name : "Aucun (bibliothèque libre)"}</b>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: (editing || showChat) ? 12 : 0 }}>
            <select style={{ ...inputStyle(c), flex: 1, padding: "9px 10px", fontSize: 12.5 }} value={client.assignedProgramId || ""} onChange={e => onAssignLibrary(client, e.target.value)}>
              <option value="">— Assigner depuis la bibliothèque —</option>
              {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <SecondaryBtn c={c} icon={Edit3} onClick={() => { onOpenBuilder(client); setShowChat(false); }}>{editing ? "Fermer" : "Sur-mesure"}</SecondaryBtn>
            <SecondaryBtn c={c} icon={MessageCircle} onClick={() => { setShowChat(!showChat); if (editing) onCloseBuilder(); }} />
          </div>
          {editing && <ProgramBuilder c={c} client={client} onCancel={onCloseBuilder} onSave={(prog) => onSaveCustom(client, prog)}
            templates={templates} otherClients={otherClients} onSaveTemplate={onSaveTemplate} />}
          {showChat && (
            <div style={{ height: 340, background: c.surface2, borderRadius: 14, padding: 12 }}>
              <MessageThread c={c} clientId={client.id} isAdmin={true} peerName={client.name} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const OverviewTab = ({ c, clients }) => {
  const today = clients.filter(a => fmtRelative(a.lastSessionAt) === "Aujourd'hui").length;
  const inactive = clients.filter(a => {
    if (!a.lastSessionAt) return true;
    const days = Math.floor((Date.now() - new Date(a.lastSessionAt).getTime()) / 86400000);
    return days >= 5;
  });
  const sorted = [...clients].sort((a, b) => new Date(b.lastSessionAt || 0) - new Date(a.lastSessionAt || 0));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <Card c={c}><CheckCheck size={16} color={c.success} style={{ marginBottom: 8 }} /><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>{today}</div><div style={{ fontSize: 11, color: c.muted }}>Séance loggée aujourd'hui</div></Card>
        <Card c={c}><AlertTriangle size={16} color={c.danger} style={{ marginBottom: 8 }} /><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>{inactive.length}</div><div style={{ fontSize: 11, color: c.muted }}>Inactifs 5j+</div></Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(a => {
          const days = a.lastSessionAt ? Math.floor((Date.now() - new Date(a.lastSessionAt).getTime()) / 86400000) : null;
          const dropping = days === null || days >= 5;
          return (
            <Card c={c} key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {a.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{a.streak} jours de série · {a.sessionsCompleted} séances au total</div>
              </div>
              <Pill c={c} tone={dropping ? "danger" : "success"}>{fmtRelative(a.lastSessionAt)}</Pill>
            </Card>
          );
        })}
        {sorted.length === 0 && <div style={{ textAlign: "center", padding: 30, color: c.muted, fontSize: 13 }}>Aucun client actif pour le moment.</div>}
      </div>
    </div>
  );
};

const AdminPanel = ({ c, onExit }) => {
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tabAdmin, setTabAdmin] = useState("pending");
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const [accs, tpls] = await Promise.all([listAllProfiles(), listTemplates().catch(() => [])]);
      setAccounts(accs); setTemplates(tpls);
    } catch (e) { setErr(e.message || "Impossible de charger les comptes."); setAccounts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (client) => {
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, status: "approved" } : a));
    try { await setProfileStatus(client.id, "approved"); } catch (e) { setErr(e.message); load(); }
  };
  const reject = async (client) => {
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, status: "rejected" } : a));
    try { await setProfileStatus(client.id, "rejected"); } catch (e) { setErr(e.message); load(); }
  };
  const assignLibrary = async (client, id) => {
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, assignedProgramId: id || null, customProgram: null } : a));
    try { await assignLibraryProgram(client.id, id || null); } catch (e) { setErr(e.message); load(); }
  };
  const saveCustom = async (client, prog) => {
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, customProgram: prog, assignedProgramId: null } : a));
    setEditingId(null);
    try { await assignCustomProgram(client.id, prog); } catch (e) { setErr(e.message); load(); }
  };
  const handleSaveTemplate = async (name, data) => {
    try { await saveTemplate(name, data); const tpls = await listTemplates(); setTemplates(tpls); } catch (e) { setErr(e.message); }
  };

  const pending = accounts.filter(a => a.status === "pending");
  const clients = accounts.filter(a => a.status !== "pending");
  const approvedClients = accounts.filter(a => a.status === "approved");

  return (
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: c.bg + "ee", backdropFilter: "blur(10px)", borderBottom: `1px solid ${c.border}`, padding: "calc(16px + max(env(safe-area-inset-top), 24px)) 18px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <Logo c={c} size={30} />
        <span className="ff-display" style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>Espace coach</span>
        <IconBtn icon={RefreshCw} c={c} onClick={load} />
      </div>

      <div style={{ padding: 18 }}>
        <SecondaryBtn c={c} full icon={LogOut} onClick={onExit} style={{ marginBottom: 16, color: c.danger }}>Déconnexion</SecondaryBtn>
        {err && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10, marginBottom: 14 }}>{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          <Card c={c}><Users size={16} color={c.electric2} style={{ marginBottom: 8 }} /><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>{clients.length}</div><div style={{ fontSize: 11, color: c.muted }}>Clients actifs</div></Card>
          <Card c={c}><ClipboardList size={16} color={c.warning} style={{ marginBottom: 8 }} /><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>{pending.length}</div><div style={{ fontSize: 11, color: c.muted }}>En attente</div></Card>
        </div>

        <div className="scrollbar-none" style={{ display: "flex", gap: 8, marginBottom: 16, background: c.surface2, padding: 4, borderRadius: 12, overflowX: "auto" }}>
          {[
            { id: "pending", l: `À valider (${pending.length})`, icon: ClipboardList },
            { id: "clients", l: `Clients (${clients.length})`, icon: Users },
            { id: "overview", l: "Vue d'ensemble", icon: LayoutDashboard },
          ].map(t => (
            <button key={t.id} onClick={() => setTabAdmin(t.id)} style={{
              flex: "1 0 auto", padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer",
              background: tabAdmin === t.id ? c.surface : "transparent", color: tabAdmin === t.id ? c.text : c.muted,
              fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap"
            }}><t.icon size={13} />{t.l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: c.muted }}><RefreshCw className="anim-spin" size={20} style={{ margin: "0 auto 8px" }} /><div style={{ fontSize: 12.5 }}>Chargement des comptes...</div></div>
        ) : (
          <>
            {tabAdmin === "pending" && (
              pending.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: c.muted, fontSize: 13 }}>Aucune inscription en attente.</div>
              ) : pending.map(client => (
                <ClientRow key={client.id} c={c} client={client} onApprove={approve} onReject={reject}
                  onAssignLibrary={assignLibrary} onOpenBuilder={() => {}} editing={false} onCloseBuilder={() => {}} onSaveCustom={() => {}}
                  templates={templates} otherClients={[]} onSaveTemplate={handleSaveTemplate} />
              ))
            )}
            {tabAdmin === "clients" && (
              clients.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: c.muted, fontSize: 13 }}>Aucun client validé pour le moment.</div>
              ) : clients.map(client => (
                <ClientRow key={client.id} c={c} client={client} onApprove={approve} onReject={reject}
                  onAssignLibrary={assignLibrary}
                  editing={editingId === client.id}
                  onOpenBuilder={() => setEditingId(editingId === client.id ? null : client.id)}
                  onCloseBuilder={() => setEditingId(null)}
                  onSaveCustom={saveCustom}
                  templates={templates}
                  otherClients={approvedClients.filter(o => o.id !== client.id && o.customProgram)}
                  onSaveTemplate={handleSaveTemplate} />
              ))
            )}
            {tabAdmin === "overview" && <OverviewTab c={c} clients={approvedClients} />}
          </>
        )}

        <p style={{ fontSize: 10.5, color: c.muted, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Les comptes marqués « Refusé » restent bloqués tant que le statut n'est pas changé ici — ils ne peuvent pas accéder à l'application.
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN APP
============================================================ */
export default function App() {
  const [dark, setDark] = useState(true);
  const c = useMemo(() => palette(dark), [dark]);

  useEffect(() => {
    document.documentElement.style.background = c.bg;
    document.body.style.background = c.bg;
  }, [c.bg]);

  const [screen, setScreen] = useState("boot"); // boot | landing | auth | onboarding | pending | rejected | app | admin
  const [accountEmail, setAccountEmail] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [tab, setTab] = useState("home");
  const [view, setView] = useState({ screen: "tab" }); // tab | programDetail | session
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [reward, setReward] = useState(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [water, setWater] = useState(3);
  const [completedSessions, setCompletedSessions] = useState({});
  const [state, setState] = useState({
    name: "Athlète", weight: 75, height: 175, goal: "Perte de poids", sportLevel: "Débutant",
    xp: 0, level: 1, streak: 0, sessionsCompleted: 0, totalMinutes: 0, calories: 0,
    status: "pending", assignedProgramId: null, customProgram: null,
  });
  const saveTimer = useRef(null);

  const history = useMemo(() => {
    const h = {}; const today = new Date().getDate();
    for (let d = 1; d <= today; d++) { if ((d + today) % 3 !== 0) h[d] = "done"; else if (d % 7 === 0) h[d] = "rest"; }
    return h;
  }, []);

  const applyProfile = (profile) => {
    setState({
      name: profile.name, weight: profile.weight, height: profile.height, goal: profile.goal, sportLevel: profile.sportLevel,
      xp: profile.xp, level: levelFromXp(profile.xp), streak: profile.streak, sessionsCompleted: profile.sessionsCompleted,
      totalMinutes: profile.totalMinutes, calories: profile.calories,
      status: profile.status || "pending",
      assignedProgramId: profile.assignedProgramId || null,
      customProgram: profile.customProgram || null,
      programStartAt: profile.programStartAt || null,
    });
    setCompletedSessions(profile.completedSessions || {});
    setWater(profile.water ?? 3);
    setDark(profile.dark ?? true);
    setAccountEmail(profile.email);
    setProfileId(profile.id);
  };

  const routeProfile = (profile) => {
    applyProfile(profile);
    if (!profile.onboarded) { setScreen("onboarding"); return; }
    if (profile.isAdmin) { setScreen("admin"); return; }
    if (profile.status === "approved") setScreen("app");
    else if (profile.status === "rejected") setScreen("rejected");
    else setScreen("pending");
  };

  // Restaure une session Supabase existante au chargement de la page
  useEffect(() => {
    (async () => {
      try {
        const profile = await getSessionProfile();
        if (profile) routeProfile(profile);
        else setScreen("landing");
      } catch (e) { setScreen("landing"); }
    })();
  }, []);

  const handleAuthed = async () => {
    try {
      const profile = await getSessionProfile();
      if (profile) routeProfile(profile);
    } catch (e) { /* reste sur l'écran de connexion */ }
  };

  const handleOnboardingComplete = async (fields) => {
    setState(s => ({ ...s, ...fields }));
    if (profileId) {
      try { await completeOnboarding(profileId, fields); } catch (e) { /* la sauvegarde périodique réessaiera pour le reste */ }
    }
    try {
      const profile = await getSessionProfile();
      if (profile) routeProfile(profile);
      else setScreen("pending");
    } catch (e) { setScreen("pending"); }
  };

  const handlePendingResolved = (profile) => routeProfile(profile);

  // Sauvegarde automatique (debounce) — uniquement les champs de progression du client,
  // jamais status / assignedProgramId / customProgram (gérés par le coach, protégés côté DB)
  useEffect(() => {
    if (!profileId || screen !== "app") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateOwnProgress(profileId, {
        name: state.name, weight: state.weight, height: state.height, goal: state.goal, sportLevel: state.sportLevel,
        xp: state.xp, streak: state.streak, sessionsCompleted: state.sessionsCompleted,
        totalMinutes: state.totalMinutes, calories: state.calories,
        completedSessions, water, dark,
      }).catch(() => { /* réseau indisponible, on continue en mémoire */ });
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [state, completedSessions, water, dark, profileId, screen]);

  const openProgram = (p) => setView({ screen: "programDetail", program: p });
  const openSession = (program, w, dayIdx) => setView({ screen: "session", program, w, dayIdx, session: buildDaySession(program, w, dayIdx) });
  const goTab = (t) => { setTab(t); setView({ screen: "tab" }); };
  const logout = async () => {
    setDrawerOpen(false);
    try { await signOut(); } catch (e) { /* ignore */ }
    setAccountEmail(null); setProfileId(null);
    setScreen("landing"); setView({ screen: "tab" }); setTab("home");
  };

  const handleComplete = () => {
    const key = `${view.program.id || view.program.name}-${view.w}-${view.dayIdx}`;
    if (completedSessions[key]) return;
    setCompletedSessions(cs => ({ ...cs, [key]: true }));
    const gainedXp = 120;
    setState(s => {
      const newXp = s.xp + gainedXp;
      return { ...s, xp: newXp, level: levelFromXp(newXp), streak: s.streak + 1, sessionsCompleted: s.sessionsCompleted + 1, totalMinutes: s.totalMinutes + view.session.estTotal, calories: s.calories + 340 };
    });
    setReward({ title: `+${gainedXp} XP gagnés !`, desc: "Séance validée — continuez sur votre lancée 🔥" });
    if (profileId) markSessionDone(profileId).catch(() => {});
  };

  if (screen === "boot") {
    return <><GlobalStyle /><div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Logo c={c} size={56} style={{ opacity: 0.6 }} /></div></>;
  }
  if (screen === "landing") {
    return <><GlobalStyle /><Landing c={c} dark={dark} setDark={setDark} onStart={() => setScreen("auth")} /></>;
  }
  if (screen === "auth") {
    return <><GlobalStyle /><AuthScreen c={c} onAuthed={handleAuthed} /></>;
  }
  if (screen === "onboarding") {
    return <><GlobalStyle /><Onboarding c={c} name={state.name} onComplete={handleOnboardingComplete} /></>;
  }
  if (screen === "admin") {
    return <><GlobalStyle /><AdminPanel c={c} onExit={logout} /></>;
  }
  if (screen === "pending") {
    return <><GlobalStyle /><PendingScreen c={c} onLogout={logout} onResolved={handlePendingResolved} /></>;
  }
  if (screen === "rejected") {
    return <><GlobalStyle /><RejectedScreen c={c} onLogout={logout} /></>;
  }

  let content;
  let title = { home: "Accueil", programs: "Programmes", calendar: "Calendrier", messages: "Messages", nutrition: "Nutrition", profile: "Profil" }[tab];
  let onBack = null;

  if (view.screen === "programDetail") {
    title = view.program.name; onBack = () => setView({ screen: "tab" });
    content = <ProgramDetail c={c} program={view.program} onBack={onBack} openSession={openSession} />;
  } else if (view.screen === "session") {
    title = view.session.rest ? "Repos" : "Séance"; onBack = () => setView({ screen: "programDetail", program: view.program });
    const key = `${view.program.id || view.program.name}-${view.w}-${view.dayIdx}`;
    content = <SessionDetail key={key} c={c} session={view.session} onComplete={handleComplete} completed={!!completedSessions[key]} />;
  } else if (tab === "home") {
    content = <Dashboard c={c} state={state} quote={quote} openProgram={openProgram} openSession={openSession} goTab={goTab} />;
  } else if (tab === "programs") {
    content = <ProgramsList c={c} openProgram={openProgram} state={state} />;
  } else if (tab === "calendar") {
    content = <Calendar c={c} history={history} />;
  } else if (tab === "messages") {
    content = <div style={{ padding: 18, height: "calc(100vh - 130px)" }}><MessageThread c={c} clientId={profileId} isAdmin={false} peerName="votre coach" /></div>;
  } else if (tab === "nutrition") {
    content = <Nutrition c={c} profile={state} water={water} setWater={setWater} />;
  } else if (tab === "profile") {
    content = <Profile c={c} state={state} dark={dark} setDark={setDark} accountEmail={accountEmail} />;
  }

  return (
    <>
      <GlobalStyle />
      <div className="ff-body scrollbar-none" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column" }}>
        <TopBar c={c} title={title} onBack={onBack} dark={dark} setDark={setDark} onInstall={() => setShowInstall(true)} onMenu={() => setDrawerOpen(true)} />
        <div className="app-scroll" style={{ flex: 1, overflowY: "auto" }}>{content}</div>
      </div>
      <Drawer c={c} open={drawerOpen} onClose={() => setDrawerOpen(false)} tab={tab} setTab={goTab} profile={state} onLogout={logout} />
      {showInstall && <InstallModal c={c} onClose={() => setShowInstall(false)} />}
      {reward && <RewardToast reward={reward} c={c} onClose={() => setReward(null)} />}
    </>
  );
}
