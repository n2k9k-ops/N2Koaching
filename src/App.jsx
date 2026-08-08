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
  LayoutDashboard, PlayCircle, Camera, RotateCcw, Mic, Search, FileText, ChevronUp
} from "lucide-react";
import { supabase } from "./lib/supabaseClient.js";
import { analyzeProgramWithAI, getStoredApiKey, storeApiKey, clearApiKey } from "./lib/aiAnalysis.js";
import {
  signUp, signIn, signOut, getSessionProfile, updateOwnProgress, markSessionDone, completeOnboarding,
  listAllProfiles, setProfileStatus, assignLibraryProgram, assignCustomProgram, revokeAccess, restoreAccess,
  listTemplates, saveTemplate, deleteTemplate,
  listMessages, sendMessage, markMessagesRead, uploadMessageAttachment,
  logWeight, listWeightLogs, uploadExercisePhoto, updateStreakFreezeUsedAt,
  uploadProgressPhoto, createProgressPhoto, listProgressPhotos, replyToProgressPhoto,
  approveWithDuration, renewAccess, submitSessionFeedback, listSessionFeedback, broadcastMessage,
  logExerciseSet, getLastExercisePerformance, getSessionExerciseLogs, listLoggedExerciseNames, getExerciseHistory,
  listCustomExercises, createCustomExercise,
  sendPasswordReset, updatePassword,
  createCheckoutSession, createBillingPortalSession,
  uploadAvatar, updateAvatarUrl,
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
    @keyframes blobFloat1 { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(26px,34px) scale(1.08);} }
    @keyframes blobFloat2 { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(-22px,-30px) scale(1.06);} }
    @keyframes blobFloat3 { 0%,100%{ transform: translate(0,0);} 50%{ transform: translate(18px,-24px);} }
    .blob1 { animation: blobFloat1 13s ease-in-out infinite; }
    .blob2 { animation: blobFloat2 16s ease-in-out infinite; }
    .blob3 { animation: blobFloat3 11s ease-in-out infinite; }
    @keyframes stepSlideIn { from { opacity:0; transform: translateX(18px);} to { opacity:1; transform: translateX(0);} }
    .anim-stepSlide { animation: stepSlideIn .38s cubic-bezier(.22,1,.36,1) both; }
    @keyframes burstScale { 0%{ transform: scale(0.3); opacity:0;} 60%{ transform: scale(1.12); opacity:1;} 100%{ transform: scale(1); opacity:1;} }
    .anim-burst { animation: burstScale .5s cubic-bezier(.34,1.56,.64,1) both; }
    @keyframes ringExpand { 0%{ transform: scale(0.6); opacity:.9;} 100%{ transform: scale(2.2); opacity:0;} }
    .anim-ringExpand { animation: ringExpand 1s ease-out both; }
    input[type=range].premium-slider {
      -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 4px;
      background: linear-gradient(90deg, #0071E3, #42A5F5); outline: none; cursor: pointer;
    }
    input[type=range].premium-slider::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none; width: 30px; height: 30px; border-radius: 50%;
      background: #fff; border: 4px solid #0071E3; box-shadow: 0 3px 10px rgba(0,0,0,0.35); cursor: pointer;
    }
    input[type=range].premium-slider::-moz-range-thumb {
      width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 4px solid #0071E3;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35); cursor: pointer;
    }
    input[type=range].premium-slider::-moz-range-track { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #0071E3, #42A5F5); }
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
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5C11 4.5 9.5 5.8 9.5 8.2C9.5 9.6 10.2 10.4 11 10.4C12 10.4 12.6 9.6 12.6 8.6C13.8 9.6 15.5 11.4 15.5 14C15.5 17.6 12.9 20.5 9.5 20.5C6.1 20.5 3.5 17.9 3.5 14.3C3.5 12.7 4.1 11.3 5 10.2C5.3 11.6 6.3 12.5 7.4 12.5C6.9 11.4 6.7 10.2 7.1 8.9C7.7 6.9 9.3 5.2 12 2.5Z" fill="#fff" />
      <path d="M11.5 20.2C13.4 20.2 14.9 18.6 14.9 16.5C14.9 14.8 13.9 13.6 12.8 12.7C12.9 13.6 12.5 14.3 11.8 14.3C11.2 14.3 10.8 13.9 10.8 13.2C9.9 13.9 9 15 9 16.5C9 18.6 9.9 20.2 11.5 20.2Z" fill="#FF9F0A" />
    </svg>
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
  street: [
    { name: "Tractions strictes", sets: 4, reps: "8 reps", rest: 90, diff: "Difficile", tips: "Amplitude complète, menton au-dessus de la barre.", safety: "Échauffez bien les épaules avant.", equip: "Barre de traction" },
    { name: "Dips sur barres parallèles", sets: 4, reps: "10 reps", rest: 90, diff: "Difficile", tips: "Buste légèrement penché en avant.", safety: "Amplitude adaptée à votre mobilité d'épaule.", equip: "Barres parallèles" },
    { name: "Muscle-up (strict ou assisté)", sets: 3, reps: "5 reps", rest: 120, diff: "Difficile", tips: "Transition explosive traction → dips.", safety: "Maîtrisez d'abord tractions et dips séparément.", equip: "Barre de traction" },
    { name: "Pompes archer", sets: 3, reps: "8 reps / côté", rest: 75, diff: "Difficile", tips: "Un bras tendu sur le côté, l'autre travaille.", safety: "Progressez graduellement en amplitude." },
    { name: "Squats pistol", sets: 3, reps: "6 reps / jambe", rest: 90, diff: "Difficile", tips: "Bras tendus devant pour l'équilibre.", safety: "Aidez-vous d'un support au besoin." },
    { name: "L-sit sur barres parallèles", sets: 3, reps: "20 sec", rest: 60, diff: "Difficile", tips: "Jambes tendues, gainage maximal.", safety: "Progressez avec les genoux repliés d'abord.", equip: "Barres parallèles" },
    { name: "Row australien", sets: 4, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Corps aligné, tirez la poitrine vers la barre.", safety: "Réglez la hauteur selon votre niveau.", equip: "Barre basse ou anneaux" },
    { name: "Front lever tuck (progression)", sets: 3, reps: "15 sec", rest: 90, diff: "Difficile", tips: "Genoux repliés vers la poitrine, corps à l'horizontale.", safety: "Progression exigeante, avancez petit à petit.", equip: "Barre de traction" },
  ],
  // --- 5/3/1 Force Athlétique (méthode Wendler) : 1 mouvement principal lourd + accessoires ---
  force531Squat: [
    { name: "Squat barre", sets: 5, reps: "5 reps (charge ~75-85% du 1RM)", rest: 180, diff: "Difficile", tips: "Mouvement principal de la séance. Progression sur 3 semaines (léger/moyen/lourd) puis semaine de deload — ajustez les charges avec votre coach.", safety: "Toujours avec un rack de sécurité ou un pareur proche du maximum.", equip: "Barre + rack" },
    { name: "Presse à cuisses", sets: 3, reps: "10 reps", rest: 90, diff: "Modéré", tips: "Accessoire : volume pour les quadriceps.", safety: "Amplitude complète sans décoller le bas du dos.", equip: "Presse à cuisses" },
    { name: "Leg curl allongé", sets: 3, reps: "10 reps", rest: 75, diff: "Modéré", tips: "Contraction complète des ischios.", safety: "Mouvement contrôlé, pas d'à-coup.", equip: "Machine leg curl" },
    { name: "Gainage lesté", sets: 3, reps: "40 sec", rest: 45, diff: "Modéré", tips: "Ajoutez un disque sur le dos une fois le corps de base maîtrisé.", safety: "Dos plat, pas de creux lombaire." },
    { name: "Mollets debout machine", sets: 4, reps: "12 reps", rest: 45, diff: "Facile", tips: "Amplitude complète, pause en haut.", safety: "Mouvement contrôlé sans rebond.", equip: "Machine mollets" },
  ],
  force531Bench: [
    { name: "Développé couché barre", sets: 5, reps: "5 reps (charge ~75-85% du 1RM)", rest: 180, diff: "Difficile", tips: "Mouvement principal de la séance. Suivez la même logique de progression que le squat.", safety: "Toujours avec un pareur proche du maximum.", equip: "Barre + banc" },
    { name: "Rowing barre", sets: 4, reps: "8 reps", rest: 90, diff: "Modéré", tips: "Équilibre l'effort poussée/tirage sur la séance.", safety: "Dos plat, tirez vers le nombril.", equip: "Barre" },
    { name: "Développé militaire haltères", sets: 3, reps: "10 reps", rest: 75, diff: "Modéré", tips: "Volume complémentaire pour les épaules.", safety: "Gainage actif, évitez de cambrer.", equip: "Haltères" },
    { name: "Dips lestés (pectoraux)", sets: 3, reps: "8 reps", rest: 75, diff: "Difficile", tips: "Ajoutez du lest une fois 12 reps au poids du corps atteintes.", safety: "Amplitude adaptée à votre mobilité d'épaule." },
    { name: "Curl barre EZ", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Finisher biceps, coudes fixes.", safety: "Pas d'élan avec le dos.", equip: "Barre EZ" },
  ],
  force531Deadlift: [
    { name: "Soulevé de terre", sets: 5, reps: "5 reps (charge ~75-85% du 1RM)", rest: 180, diff: "Difficile", tips: "Mouvement principal de la séance. Technique prioritaire sur la charge à tout moment.", safety: "Dos plat, barre proche des tibias tout du long.", equip: "Barre" },
    { name: "Tirage horizontal poulie basse", sets: 3, reps: "10 reps", rest: 75, diff: "Modéré", tips: "Volume de dos complémentaire, plus léger que le mouvement principal.", safety: "Ne vous penchez pas en arrière.", equip: "Poulie basse" },
    { name: "Hip thrust barre", sets: 3, reps: "10 reps", rest: 90, diff: "Modéré", tips: "Contraction fessière maximale en haut.", safety: "Barre bien callée sur les hanches, coussin recommandé.", equip: "Barre" },
    { name: "Face pull", sets: 3, reps: "15 reps", rest: 45, diff: "Facile", tips: "Santé des épaules, tirez vers le visage.", safety: "Coudes hauts, mouvement contrôlé.", equip: "Poulie + corde" },
    { name: "Gainage planche", sets: 3, reps: "45 sec", rest: 30, diff: "Facile", tips: "Corps aligné tête-talons.", safety: "Évitez le creux lombaire." },
  ],
  force531OHP: [
    { name: "Développé militaire barre", sets: 5, reps: "5 reps (charge ~75-85% du 1RM)", rest: 180, diff: "Difficile", tips: "Mouvement principal de la séance. Même logique de progression que les 3 autres jours.", safety: "Gainage abdominal actif, ne cambrez pas le bas du dos.", equip: "Barre" },
    { name: "Tractions assistées", sets: 4, reps: "8 reps", rest: 90, diff: "Modéré", tips: "Volume de dos, réduisez l'assistance progressivement.", safety: "Amplitude complète sans à-coup.", equip: "Machine assistance" },
    { name: "Élévations latérales", sets: 3, reps: "15 reps", rest: 45, diff: "Facile", tips: "Légère flexion des coudes, montée jusqu'aux épaules.", safety: "Charge légère, priorité à la forme.", equip: "Haltères" },
    { name: "Rowing haltère unilatéral", sets: 3, reps: "10 reps / bras", rest: 60, diff: "Modéré", tips: "Dos plat, tirez le coude vers la hanche.", safety: "Appui stable sur le banc.", equip: "Haltère + banc" },
    { name: "Extension triceps poulie haute", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Coudes fixes le long du corps.", safety: "Amplitude complète sans balancer.", equip: "Poulie haute" },
  ],
  // --- PHUL (Power Hypertrophy Upper Lower) : jours force lourds + jours hypertrophie volume ---
  hyperUpperPower: [
    { name: "Développé couché barre", sets: 4, reps: "5 reps", rest: 150, diff: "Difficile", tips: "Jour force : charge lourde, faible volume.", safety: "Toujours avec un pareur proche du maximum.", equip: "Barre + banc" },
    { name: "Rowing barre", sets: 4, reps: "5 reps", rest: 150, diff: "Difficile", tips: "Équilibre l'effort poussée/tirage à charge lourde.", safety: "Dos plat tout du long.", equip: "Barre" },
    { name: "Développé militaire haltères", sets: 3, reps: "6 reps", rest: 90, diff: "Modéré", tips: "Charge lourde contrôlée.", safety: "Gainage actif.", equip: "Haltères" },
    { name: "Tractions strictes", sets: 3, reps: "6 reps", rest: 90, diff: "Difficile", tips: "Ajoutez du lest si 8+ reps strictes sont acquises.", safety: "Amplitude complète.", equip: "Barre de traction" },
    { name: "Curl barre EZ", sets: 3, reps: "8 reps", rest: 60, diff: "Modéré", tips: "Charge modérément lourde, forme stricte.", safety: "Pas d'élan.", equip: "Barre EZ" },
    { name: "Extension triceps poulie haute", sets: 3, reps: "8 reps", rest: 60, diff: "Modéré", tips: "Charge modérément lourde.", safety: "Coudes fixes.", equip: "Poulie haute" },
  ],
  hyperLowerPower: [
    { name: "Squat barre", sets: 4, reps: "5 reps", rest: 150, diff: "Difficile", tips: "Jour force : charge lourde, faible volume.", safety: "Rack de sécurité obligatoire.", equip: "Barre + rack" },
    { name: "Soulevé de terre roumain", sets: 3, reps: "6 reps", rest: 120, diff: "Difficile", tips: "Charnière de hanche, jambes semi-tendues.", safety: "Dos neutre, ne arrondissez jamais.", equip: "Barre" },
    { name: "Presse à cuisses", sets: 3, reps: "8 reps", rest: 90, diff: "Modéré", tips: "Charge lourde, amplitude complète.", safety: "Bas du dos plaqué au dossier.", equip: "Presse à cuisses" },
    { name: "Mollets debout machine", sets: 4, reps: "8 reps", rest: 60, diff: "Modéré", tips: "Charge lourde, pause en haut.", safety: "Amplitude complète.", equip: "Machine mollets" },
    { name: "Gainage lesté", sets: 3, reps: "40 sec", rest: 45, diff: "Modéré", tips: "Ajoutez du lest progressivement.", safety: "Dos plat." },
  ],
  hyperUpperHyper: [
    { name: "Développé incliné haltères", sets: 4, reps: "12 reps", rest: 75, diff: "Modéré", tips: "Jour hypertrophie : volume élevé, charge modérée.", safety: "Contrôlez la descente.", equip: "Haltères + banc incliné" },
    { name: "Écarté haltères banc plat", sets: 3, reps: "15 reps", rest: 60, diff: "Facile", tips: "Isolation pectoraux, légère flexion des coudes.", safety: "Amplitude sans douleur d'épaule.", equip: "Haltères + banc" },
    { name: "Tirage horizontal poulie basse", sets: 4, reps: "12 reps", rest: 75, diff: "Modéré", tips: "Volume de dos, rapprochez les omoplates.", safety: "Ne vous penchez pas en arrière.", equip: "Poulie basse" },
    { name: "Curl haltères alterné", sets: 3, reps: "12 reps", rest: 60, diff: "Facile", tips: "Alternance stricte, pas d'élan.", safety: "Coudes fixes.", equip: "Haltères" },
    { name: "Extension triceps corde (overhead)", sets: 3, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Étirement complet en haut.", safety: "Dos neutre.", equip: "Poulie + corde" },
    { name: "Élévations latérales", sets: 3, reps: "15 reps", rest: 45, diff: "Facile", tips: "Finisher épaules, charge légère.", safety: "Priorité à la forme.", equip: "Haltères" },
  ],
  hyperLowerHyper: [
    { name: "Squat gobelet", sets: 4, reps: "12 reps", rest: 75, diff: "Modéré", tips: "Jour hypertrophie : volume élevé, charge modérée.", safety: "Genoux dans l'axe des pieds.", equip: "Kettlebell/haltère" },
    { name: "Leg curl allongé", sets: 4, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Contraction complète des ischios.", safety: "Mouvement contrôlé.", equip: "Machine leg curl" },
    { name: "Fentes marchées haltères", sets: 3, reps: "12 reps / jambe", rest: 60, diff: "Modéré", tips: "Pas long, buste droit.", safety: "Genou avant stable.", equip: "Haltères" },
    { name: "Presse mollets", sets: 4, reps: "15 reps", rest: 45, diff: "Facile", tips: "Amplitude complète, pause en haut.", safety: "Mouvement contrôlé.", equip: "Presse à cuisses" },
    { name: "Relevés de jambes suspendu", sets: 3, reps: "15 reps", rest: 45, diff: "Modéré", tips: "Finisher abdominaux/fléchisseurs de hanche.", safety: "Évitez le balancement.", equip: "Barre de traction" },
  ],
  // --- Full Body Métabolique (perte de poids en préservant la masse musculaire) ---
  metabolicFullBody: [
    { name: "Squat gobelet", sets: 4, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Mouvement composé pour préserver la masse musculaire en déficit calorique.", safety: "Genoux dans l'axe des pieds.", equip: "Kettlebell/haltère" },
    { name: "Développé couché haltères prise neutre", sets: 4, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Repos court volontairement pour maintenir un effet métabolique.", safety: "Contrôlez la descente.", equip: "Haltères + banc" },
    { name: "Rowing haltère unilatéral", sets: 3, reps: "12 reps / bras", rest: 60, diff: "Modéré", tips: "Dos plat, tirez le coude vers la hanche.", safety: "Appui stable sur le banc.", equip: "Haltère + banc" },
    { name: "Soulevé de terre roumain haltères", sets: 3, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Charnière de hanche, jambes semi-tendues.", safety: "Dos neutre, ne arrondissez jamais.", equip: "Haltères" },
    { name: "Développé militaire haltères", sets: 3, reps: "12 reps", rest: 60, diff: "Modéré", tips: "Enchaîné rapidement pour garder la fréquence cardiaque élevée.", safety: "Gainage actif.", equip: "Haltères" },
    { name: "Gainage dynamique (planche + touch épaule)", sets: 3, reps: "40 sec", rest: 30, diff: "Modéré", tips: "Finisher qui maintient la dépense calorique jusqu'à la fin.", safety: "Bassin stable, pas de rotation excessive." },
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
  street: "Street Workout",
  force531Squat: "5/3/1 · Squat",
  force531Bench: "5/3/1 · Bench",
  force531Deadlift: "5/3/1 · Deadlift",
  force531OHP: "5/3/1 · Overhead Press",
  hyperUpperPower: "PHUL · Upper Power",
  hyperLowerPower: "PHUL · Lower Power",
  hyperUpperHyper: "PHUL · Upper Hypertrophie",
  hyperLowerHyper: "PHUL · Lower Hypertrophie",
  metabolicFullBody: "Full Body Métabolique",
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
  "Quadriceps", "Ischios & Fessiers", "Mollets", "Abdominaux", "Cardio", "Full Body / Maison", "Street Workout",
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
  // --- Street Workout ---
  ex("Street Workout", "home", "Tractions strictes", 4, "8 reps", 90, "Difficile", "Amplitude complète, menton au-dessus de la barre.", "Échauffez bien les épaules avant.", "Barre de traction"),
  ex("Street Workout", "home", "Dips sur barres parallèles", 4, "10 reps", 90, "Difficile", "Buste légèrement penché en avant.", "Amplitude adaptée à votre mobilité d'épaule.", "Barres parallèles"),
  ex("Street Workout", "home", "Muscle-up (strict ou assisté)", 3, "5 reps", 120, "Difficile", "Transition explosive traction → dips.", "Maîtrisez d'abord tractions et dips séparément.", "Barre de traction"),
  ex("Street Workout", "home", "Pompes archer", 3, "8 reps / côté", 75, "Difficile", "Un bras tendu sur le côté, l'autre travaille.", "Progressez graduellement en amplitude."),
  ex("Street Workout", "home", "Squats pistol", 3, "6 reps / jambe", 90, "Difficile", "Bras tendus devant pour l'équilibre.", "Aidez-vous d'un support au besoin."),
  ex("Street Workout", "home", "L-sit sur barres parallèles", 3, "20 sec", 60, "Difficile", "Jambes tendues, gainage maximal.", "Progressez avec les genoux repliés d'abord.", "Barres parallèles"),
  ex("Street Workout", "home", "Row australien", 4, "12 reps", 60, "Modéré", "Corps aligné, tirez la poitrine vers la barre.", "Réglez la hauteur selon votre niveau.", "Barre basse ou anneaux"),
  ex("Street Workout", "home", "Handstand push-up contre mur", 3, "6 reps", 90, "Difficile", "Descente contrôlée, tête entre les bras.", "Progressez avec un support avant de tenter sans mur."),
  ex("Street Workout", "home", "Front lever tuck (progression)", 3, "15 sec", 90, "Difficile", "Genoux repliés vers la poitrine, corps à l'horizontale.", "Progression exigeante, avancez petit à petit.", "Barre de traction"),
  ex("Street Workout", "home", "Human flag (progression négatifs)", 3, "3 reps / côté", 120, "Difficile", "Descente lente et contrôlée depuis la position haute.", "Nécessite un bon niveau de gainage préalable.", "Poteau ou barre verticale"),
  ex("Street Workout", "home", "Tractions australiennes lestées", 3, "12 reps", 60, "Modéré", "Corps gainé, tirez la poitrine vers la barre.", "Ajoutez une charge progressivement.", "Barre basse"),
  // --- Exercices complémentaires identifiés (bibliothèque étendue) ---
  ex("Dos", "gym", "Rowing Pendlay", 4, "6 reps", 100, "Difficile", "Barre reposée au sol entre chaque répétition, tirez explosivement.", "Dos plat tout du long, ne cambrez pas.", "Barre"),
  ex("Dos", "gym", "Soulevé de terre sumo", 4, "6 reps", 120, "Difficile", "Pieds larges, prise resserrée entre les jambes.", "Genoux alignés avec les pieds, dos neutre.", "Barre"),
  ex("Dos", "gym", "Épaulé (clean) barre", 3, "5 reps", 150, "Difficile", "Tirage explosif puis réception en position haute.", "Technique olympique exigeante, apprenez avec un coach avant de charger.", "Barre"),
  ex("Dos", "gym", "Épaulé-jeté barre", 3, "3 reps", 180, "Difficile", "Enchaînement clean puis poussée explosive au-dessus de la tête.", "Mouvement technique, maîtrisez le clean seul d'abord.", "Barre"),
  ex("Dos", "gym", "Tractions prise supination (chin-up)", 4, "8 reps", 90, "Difficile", "Prise mains vers vous, sollicite davantage les biceps.", "Amplitude complète, évitez de vous balancer.", "Barre de traction"),
  ex("Pectoraux", "gym", "Développé au sol (floor press) barre", 4, "8 reps", 90, "Modéré", "Amplitude réduite par le sol, bon pour les triceps.", "Coudes ne touchent pas violemment le sol.", "Barre"),
  ex("Pectoraux", "gym", "Développé incliné à la poulie", 4, "12 reps", 75, "Modéré", "Tension constante du début à la fin du mouvement.", "Réglez le banc à 30-45°.", "Poulie"),
  ex("Ischios & Fessiers", "gym", "Adduction hanche machine", 3, "15 reps", 45, "Facile", "Mouvement contrôlé, pas d'à-coup.", "Réglez l'amplitude sur la machine.", "Machine adduction"),
  ex("Quadriceps", "gym", "Squat overhead barre", 3, "6 reps", 120, "Difficile", "Barre tenue à bout de bras au-dessus de la tête tout du long.", "Nécessite une bonne mobilité d'épaules, technique avant charge.", "Barre"),
  ex("Full Body / Maison", "gym", "Turkish get-up kettlebell", 3, "5 reps / côté", 90, "Difficile", "Séquence lente et contrôlée du sol à la position debout.", "Apprenez le mouvement à vide avant d'ajouter du poids.", "Kettlebell"),
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
  { id: "street-fondations", name: "Street Workout Fondations", cat: "Street Workout", level: "Débutant", weeks: 6, location: "home", icon: Award,
    goals: ["Maîtriser les mouvements de base (tractions, dips)", "Construire une force fonctionnelle", "Préparer les figures avancées"],
    desc: "L'entrée dans la callisthénie : tractions, dips et gainage sur barre, pour construire des bases solides avant les figures techniques.",
    cycle: ["street", "repos", "street", "abs", "repos", "street", "repos"] },
  { id: "street-performance", name: "Street Workout Performance", cat: "Street Workout", level: "Avancé", weeks: 8, location: "home", icon: Trophy,
    goals: ["Progresser vers le muscle-up et le front lever", "Développer une force relative élevée", "Maîtriser les figures statiques"],
    desc: "Programme exigeant pour pratiquants confirmés : muscle-up, L-sit, front lever et human flag en progression.",
    cycle: ["street", "street", "repos", "street", "abs", "street", "repos"] },
  { id: "531-strength", name: "5/3/1 Force Athlétique", cat: "Force", level: "Avancé", weeks: 12, location: "gym", icon: Dumbbell,
    goals: ["Développer un force maximale sur les 4 mouvements de base", "Progression par cycles de 4 semaines (léger/moyen/lourd/deload)", "Construire une base de force durable"],
    desc: "Basé sur la méthode 5/3/1 de Jim Wendler, référence du powerlifting : un mouvement principal lourd par séance (squat, développé couché, soulevé de terre, développé militaire), accompagné d'un travail d'accessoires ciblé. Nécessite un suivi rigoureux des charges — travaillez les pourcentages avec votre coach.",
    cycle: ["force531Squat", "repos", "force531Bench", "repos", "force531Deadlift", "repos", "force531OHP"] },
  { id: "phul-hypertrophy", name: "PHUL Hypertrophie", cat: "Hypertrophie", level: "Intermédiaire/Avancé", weeks: 10, location: "gym", icon: TrendingUp,
    goals: ["Maximiser la prise de muscle avec un volume d'entraînement élevé", "Combiner force (charges lourdes) et hypertrophie (volume)", "Fréquence 2x/semaine par groupe musculaire"],
    desc: "Basé sur la méthode PHUL (Power Hypertrophy Upper Lower), plébiscitée pour l'hypertrophie : deux séances \"force\" à charge lourde et faible volume, deux séances \"hypertrophie\" à charge modérée et volume élevé. Chaque groupe musculaire est travaillé deux fois par semaine, un rythme reconnu comme efficace pour la prise de masse.",
    cycle: ["hyperUpperPower", "hyperLowerPower", "repos", "hyperUpperHyper", "hyperLowerHyper", "repos", "repos"] },
  { id: "metabolic-fatloss", name: "Full Body Métabolique", cat: "Perte de poids", level: "Intermédiaire", weeks: 8, location: "gym", icon: Flame,
    goals: ["Perdre du gras en préservant la masse musculaire", "Maintenir un métabolisme actif via des mouvements composés", "Alterner renforcement et conditionnement"],
    desc: "Approche moderne de la perte de poids : contrairement au \"cardio seul\", ce programme garde des mouvements composés lourds (squat, développé, rowing, soulevé de terre) à repos courts pour préserver le muscle pendant le déficit calorique, alternés avec des séances de conditionnement HIIT pour maximiser la dépense énergétique.",
    cycle: ["metabolicFullBody", "hiit", "repos", "metabolicFullBody", "hiit", "repos", "repos"] },
];

/** Trouve un exercice de remplacement dans la même catégorie musculaire
 *  (ex: "machine indisponible"), en évitant les doublons avec la séance en cours. */
function findSubstitute(exercise, currentList) {
  const usedNames = new Set(currentList.map(e => e.name));
  const candidates = EXERCISE_LIBRARY.filter(e =>
    e.cat === exercise.cat && e.name !== exercise.name && !usedNames.has(e.name) &&
    (e.location === exercise.location || e.location === "both" || exercise.location === "both")
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Analyse gratuite et locale d'un programme, basée sur des repères réels de
 *  science du sport (volume hebdomadaire par groupe musculaire, équilibre
 *  push/pull, récupération, ordre des exercices, adéquation reps/objectif).
 *  Aucune clé API, aucun appel réseau — tout se calcule dans le navigateur. */
/** Répartition anatomique fine par exercice, basée sur la biomécanique réelle
 *  (quel chef musculaire un mouvement sollicite préférentiellement). Sert à
 *  détecter les angles de travail manquants au sein d'un même groupe. */
const SUB_MUSCLE_RULES = {
  "Biceps": [
    { name: "Chef long (pic du biceps)", keywords: ["incliné", "araignée", "spider", "curl allongé"] },
    { name: "Chef court", keywords: ["pupitre", "preacher", "concentré", "scott"] },
    { name: "Brachial (épaisseur du bras)", keywords: ["marteau", "hammer", "neutre"] },
  ],
  "Triceps": [
    { name: "Chef long (le plus gros des 3)", keywords: ["nuque", "overhead", "au-dessus", "barre au front", "skull", "français"] },
    { name: "Chef latéral", keywords: ["poulie", "pushdown", "corde"] },
    { name: "Chef médial", keywords: ["dips", "serré", "close"] },
  ],
  "Dos": [
    { name: "Grand dorsal (largeur du dos)", keywords: ["traction", "tirage vertical", "pulldown", "lat"] },
    { name: "Trapèzes / milieu du dos", keywords: ["shrug", "rowing", "row", "face pull"] },
    { name: "Érecteurs spinaux (bas du dos)", keywords: ["soulevé de terre", "extension lombaire", "hyperextension", "back extension"] },
  ],
  "Épaules": [
    { name: "Deltoïde antérieur (avant)", keywords: ["militaire", "développé épaules", "frontale", "overhead press", "arnold"] },
    { name: "Deltoïde latéral (largeur)", keywords: ["latérale", "lateral raise"] },
    { name: "Deltoïde postérieur (arrière)", keywords: ["oiseau", "face pull", "arrière", "rear delt"] },
  ],
  "Pectoraux": [
    { name: "Faisceau supérieur (haut des pecs)", keywords: ["incliné"] },
    { name: "Faisceau sternal (milieu/bas)", keywords: ["décliné", "plat", "flat", "pec deck", "écarté"] },
  ],
  "Quadriceps": [
    { name: "Ensemble des vastes", keywords: ["squat", "presse", "leg press", "fente", "hack", "pistol", "bulgare"] },
    { name: "Droit fémoral (isolé, genou)", keywords: ["extension", "leg extension"] },
  ],
  "Ischios & Fessiers": [
    { name: "Ischio-jambiers", keywords: ["leg curl", "roumain", "romanian", "curl ischio", "nordic"] },
    { name: "Grand fessier", keywords: ["hip thrust", "pont fessier", "glute bridge", "squat", "fente", "soulevé de terre"] },
  ],
  "Mollets": [
    { name: "Gastrocnémien (jumeaux, genou tendu)", keywords: ["debout", "standing", "presse"] },
    { name: "Soléaire (genou fléchi)", keywords: ["assis", "seated"] },
  ],
  "Abdominaux": [
    { name: "Grand droit (\"tablettes\")", keywords: ["crunch", "relevé", "leg raise", "genou"] },
    { name: "Obliques (côtés)", keywords: ["rotation", "oblique", "twist", "côté", "russian"] },
    { name: "Gainage profond (transverse)", keywords: ["planche", "plank", "gainage"] },
  ],
};

const INJURY_RISK_MAP = [
  { zone: "genou", keywords: ["genou", "genoux", "knee"], riskyExercises: ["squat profond", "pistol", "fente sautée", "leg extension", "squat"] },
  { zone: "épaule", keywords: ["épaule", "epaule", "shoulder"], riskyExercises: ["développé militaire", "développé nuque", "élévation latérale", "dips", "overhead", "arnold"] },
  { zone: "dos / lombaires", keywords: ["dos", "lombaire", "lombalgie", "back"], riskyExercises: ["soulevé de terre", "rowing barre", "extension lombaire", "good morning"] },
  { zone: "poignet", keywords: ["poignet", "wrist"], riskyExercises: ["développé couché barre", "pompes", "planche", "squat overhead"] },
  { zone: "cheville", keywords: ["cheville", "ankle"], riskyExercises: ["squat", "fente", "mollets", "sauté", "box jump"] },
  { zone: "coude", keywords: ["coude", "elbow", "épicondylite", "tennis elbow"], riskyExercises: ["extension triceps", "curl", "dips", "développé couché"] },
  { zone: "hanche", keywords: ["hanche", "hip"], riskyExercises: ["squat", "fente", "hip thrust", "soulevé de terre"] },
];

/** Choisit le jour le plus pertinent où ajouter un exercice d'une catégorie
 *  donnée : en priorité un jour qui travaille déjà des catégories liées,
 *  sinon le jour actif le moins chargé. Retourne l'index (0-6) ou null. */
function pickTargetDayIndex(customSessions, cat) {
  const active = customSessions.map((d, i) => ({ d, i })).filter(x => !x.d.rest && x.d.exercises && x.d.exercises.length > 0);
  if (active.length === 0) return null;
  const related = active.find(x => x.d.exercises.some(e => e.cat === cat));
  if (related) return related.i;
  active.sort((a, b) => a.d.exercises.length - b.d.exercises.length);
  return active[0].i;
}

/** Propose un exercice concret de la bibliothèque pour combler un manque
 *  détecté (catégorie manquante, ou angle précis via des mots-clés). */
function suggestExercise(cat, location, existingNames, keywordFilter) {
  let candidates = EXERCISE_LIBRARY.filter(e => e.cat === cat && (e.location === location || e.location === "both") && !existingNames.has(e.name));
  if (keywordFilter && keywordFilter.length > 0) {
    const filtered = candidates.filter(e => keywordFilter.some(k => e.name.toLowerCase().includes(k)));
    if (filtered.length > 0) candidates = filtered;
  }
  return candidates[0] || null;
}

function analyzeProgramLocally(program, client) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  let score = 10;
  const level = client?.sportLevel || "Intermédiaire";
  const isBeginner = level === "Débutant";
  const isAdvanced = level === "Avancé";

  const days = (program.customSessions || []).filter(d => !d.rest && d.exercises && d.exercises.length > 0);
  const restDays = 7 - days.length;
  const fixes = [];
  const existingNames = new Set(days.flatMap(d => d.exercises.map(e => e.name)));

  // --- Croisement avec les blessures signalées à l'inscription ---
  if (client?.injuries && client.injuries.trim()) {
    const injuryText = client.injuries.toLowerCase();
    const allExercises = days.flatMap(d => d.exercises);
    INJURY_RISK_MAP.forEach(risk => {
      if (!risk.keywords.some(k => injuryText.includes(k))) return;
      const flagged = allExercises.filter(e => risk.riskyExercises.some(r => e.name.toLowerCase().includes(r)));
      if (flagged.length > 0) {
        const uniqueNames = [...new Set(flagged.map(e => e.name))];
        weaknesses.push(`⚠️ ${client.name || "Ce client"} a signalé une gêne au niveau "${risk.zone}" (blessure déclarée : "${client.injuries}"). Le programme contient : ${uniqueNames.join(", ")} — à valider avec le client avant de maintenir ces exercices tels quels, ou à adapter (charge réduite, amplitude limitée, variante).`);
        score -= 1;
      }
    });
  }

  // --- Volume hebdomadaire par groupe musculaire (nb de séries) ---
  const volumeByCategory = {};
  days.forEach(d => d.exercises.forEach(e => {
    volumeByCategory[e.cat] = (volumeByCategory[e.cat] || 0) + (Number(e.sets) || 0);
  }));

  const MAJOR_GROUPS = ["Pectoraux", "Dos", "Épaules", "Quadriceps", "Ischios & Fessiers"];
  const ALL_MUSCLE_GROUPS = ["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Quadriceps", "Ischios & Fessiers", "Mollets", "Abdominaux"];

  // --- Répartition complète du volume par muscle (pour la visualisation) ---
  const totalVolume = ALL_MUSCLE_GROUPS.reduce((sum, cat) => sum + (volumeByCategory[cat] || 0), 0);
  const muscleBreakdown = ALL_MUSCLE_GROUPS.map(cat => ({
    cat, sets: volumeByCategory[cat] || 0,
    pct: totalVolume > 0 ? Math.round(((volumeByCategory[cat] || 0) / totalVolume) * 100) : 0,
  }));
  const untouchedMuscles = muscleBreakdown.filter(m => m.sets === 0).map(m => m.cat);
  if (untouchedMuscles.length > 0 && days.length >= 3) {
    weaknesses.push(`Aucun volume détecté sur : ${untouchedMuscles.join(", ")}. À vérifier que c'est intentionnel (spécialisation, contre-indication) plutôt qu'un oubli.`);
    score -= untouchedMuscles.length >= 3 ? 1 : 0.5;
    untouchedMuscles.forEach(cat => {
      const targetDay = pickTargetDayIndex(program.customSessions, cat);
      const exercise = suggestExercise(cat, program.location, existingNames);
      if (targetDay !== null && exercise) {
        fixes.push({ id: `add-${cat}`, label: `Ajouter "${exercise.name}" (${cat})`, type: "add", dayIndex: targetDay, exercise });
        existingNames.add(exercise.name);
      }
    });
  }

  // --- Détail anatomique fin : quels chefs musculaires sont réellement couverts ---
  // Pour un débutant, la variété d'angles compte moins qu'un volume total cohérent —
  // on affiche quand même le détail, mais on ne pénalise/recommande que pour
  // intermédiaire et avancé, où l'optimisation fine a plus de sens.
  const subMuscleDetail = [];
  ALL_MUSCLE_GROUPS.forEach(cat => {
    const rules = SUB_MUSCLE_RULES[cat];
    if (!rules || (volumeByCategory[cat] || 0) === 0) return;
    const exercisesInCat = days.flatMap(d => d.exercises.filter(e => e.cat === cat));
    const covered = rules.map(rule => {
      const hit = exercisesInCat.some(e => rule.keywords.some(k => e.name.toLowerCase().includes(k)));
      return { name: rule.name, covered: hit };
    });
    subMuscleDetail.push({ cat, subMuscles: covered });
    const missing = covered.filter(s => !s.covered);
    if (missing.length > 0 && missing.length < rules.length && !isBeginner) {
      recommendations.push(`${cat} : aucun exercice ne cible spécifiquement "${missing.map(m => m.name).join(", ")}" — ajouter un mouvement dans cet angle pour un développement complet, pas seulement un volume total suffisant.`);
      missing.forEach(sm => {
        const rule = rules.find(r => r.name === sm.name);
        const targetDay = pickTargetDayIndex(program.customSessions, cat);
        const exercise = suggestExercise(cat, program.location, existingNames, rule?.keywords);
        if (targetDay !== null && exercise) {
          fixes.push({ id: `add-angle-${cat}-${sm.name}`, label: `Ajouter "${exercise.name}" (${sm.name})`, type: "add", dayIndex: targetDay, exercise });
          existingNames.add(exercise.name);
        }
      });
    }
  });

  // Repères de volume ajustés au niveau : un débutant a un seuil minimum efficace (MEV)
  // plus bas, un pratiquant avancé tolère (et a souvent besoin) de plus de volume.
  const lowThreshold = isBeginner ? 5 : isAdvanced ? 10 : 8;
  const highThreshold = isBeginner ? 20 : isAdvanced ? 30 : 26;
  const lowVolume = [];
  const highVolume = [];
  MAJOR_GROUPS.forEach(cat => {
    const v = volumeByCategory[cat] || 0;
    if (v === 0) return; // catégorie pas du tout travaillée, pas forcément un problème selon le programme
    if (v < lowThreshold) lowVolume.push({ cat, v });
    if (v > highThreshold) highVolume.push({ cat, v });
  });
  if (lowVolume.length > 0) {
    weaknesses.push(`Volume potentiellement insuffisant pour un niveau ${level.toLowerCase()} : ${lowVolume.map(x => `${x.cat} (${x.v} séries/semaine)`).join(", ")}. Repère indicatif pour ce niveau : au moins ${lowThreshold} séries/semaine/groupe.`);
    score -= 1;
  }
  if (highVolume.length > 0) {
    weaknesses.push(`Volume potentiellement excessif pour un niveau ${level.toLowerCase()} : ${highVolume.map(x => `${x.cat} (${x.v} séries/semaine)`).join(", ")}. Au-delà de ~${highThreshold} séries/semaine par groupe à ce niveau, le risque de non-récupération augmente sans gain supplémentaire garanti.`);
    score -= 1;
  }
  if (lowVolume.length === 0 && highVolume.length === 0 && Object.keys(volumeByCategory).length > 0) {
    strengths.push(`Le volume hebdomadaire par groupe musculaire est cohérent avec un niveau ${level.toLowerCase()} (ni insuffisant, ni excessif).`);
  }

  // --- Fatigue cumulée : plusieurs mouvements lourds sur la même chaîne le même jour ---
  const HEAVY_LOWER_HINTS = ["squat", "soulevé de terre", "presse à cuisses lourde", "hip thrust barre"];
  days.forEach(d => {
    const heavyLowerCount = d.exercises.filter(e => HEAVY_LOWER_HINTS.some(h => e.name.toLowerCase().includes(h)) && (Number(e.sets) || 0) >= 3).length;
    if (heavyLowerCount >= 2) {
      weaknesses.push(`${d.title || "Une séance"} combine plusieurs mouvements lourds sollicitant fortement la même chaîne (squat + soulevé de terre par exemple) — la fatigue cumulée sur la charnière de hanche et le bas du dos peut compromettre la technique sur le second mouvement.`);
      recommendations.push("Séparer les mouvements les plus lourds sur des jours différents, ou réduire le volume de l'un des deux quand ils sont sur la même séance.");
      score -= 0.5;
    }
  });

  // --- Équilibre push/pull ---
  const pushVolume = (volumeByCategory["Pectoraux"] || 0) + (volumeByCategory["Épaules"] || 0) + (volumeByCategory["Triceps"] || 0);
  const pullVolume = (volumeByCategory["Dos"] || 0) + (volumeByCategory["Biceps"] || 0);
  if (pushVolume > 0 && pullVolume > 0) {
    const ratio = pushVolume / pullVolume;
    if (ratio > 1.5) {
      weaknesses.push(`Déséquilibre poussée/tirage : ${pushVolume} séries de poussée contre ${pullVolume} de tirage. Un excès de volume en poussée par rapport au tirage est un facteur de risque connu pour la posture (épaules enroulées) et les douleurs d'épaule.`);
      recommendations.push("Rééquilibrer en ajoutant du volume de tirage (rowing, tractions, tirage vertical) ou en réduisant légèrement le volume de poussée.");
      score -= 1;
    } else if (ratio < 0.6) {
      weaknesses.push(`Le volume de tirage (${pullVolume} séries) dépasse largement celui de poussée (${pushVolume} séries) — à vérifier que ce déséquilibre est intentionnel.`);
      score -= 0.5;
    } else {
      strengths.push("Bon équilibre entre volume de poussée et de tirage — un facteur protecteur pour la santé des épaules à long terme.");
    }
  }

  // --- Récupération / répartition des séances ---
  let maxConsecutive = 0, current = 0;
  (program.customSessions || []).forEach(d => {
    if (d.rest || !d.exercises || d.exercises.length === 0) { current = 0; }
    else { current++; maxConsecutive = Math.max(maxConsecutive, current); }
  });
  if (maxConsecutive >= 5) {
    weaknesses.push(`${maxConsecutive} jours d'entraînement consécutifs sans repos dans le cycle. Un enchaînement aussi long augmente le risque de fatigue accumulée, surtout pour un pratiquant non avancé.`);
    recommendations.push("Intercaler au moins un jour de repos tous les 3-4 jours d'entraînement.");
    score -= 1;
  } else if (restDays >= 1) {
    strengths.push(`Répartition raisonnable avec ${restDays} jour${restDays > 1 ? "s" : ""} de repos dans la semaine, sans enchaînement excessif.`);
  }
  if (restDays === 0) {
    weaknesses.push("Aucun jour de repos complet dans le cycle hebdomadaire — un minimum d'un jour de récupération complète par semaine est généralement recommandé.");
    score -= 1;
  }

  // --- Ordre des exercices (polyarticulaires avant isolation) ---
  const ISOLATION_HINTS = ["curl", "extension", "élévation", "écarté", "mollet", "leg curl", "leg extension"];
  let orderIssues = 0;
  days.forEach(d => {
    let seenIsolation = false;
    d.exercises.forEach(e => {
      const isIsolation = ISOLATION_HINTS.some(h => e.name.toLowerCase().includes(h));
      if (isIsolation) seenIsolation = true;
      else if (seenIsolation && !isIsolation) orderIssues++;
    });
  });
  if (orderIssues > 0) {
    weaknesses.push("Dans certaines séances, des exercices polyarticulaires (squat, développé, tirage...) apparaissent après des exercices d'isolation — l'ordre inverse est généralement recommandé pour préserver la force et la technique sur les mouvements les plus exigeants.");
    recommendations.push("Placer systématiquement les mouvements polyarticulaires en début de séance, les isolations en fin de séance.");
    score -= 0.5;
  } else {
    strengths.push("Bon ordre des exercices : les mouvements polyarticulaires précèdent les exercices d'isolation dans les séances.");
  }

  // --- Équilibre jambes vs haut du corps (le classique "on saute le jour de jambes") ---
  const legVolume = (volumeByCategory["Quadriceps"] || 0) + (volumeByCategory["Ischios & Fessiers"] || 0) + (volumeByCategory["Mollets"] || 0);
  const upperVolume = (volumeByCategory["Pectoraux"] || 0) + (volumeByCategory["Dos"] || 0) + (volumeByCategory["Épaules"] || 0) + (volumeByCategory["Biceps"] || 0) + (volumeByCategory["Triceps"] || 0);
  if (upperVolume > 0 && legVolume === 0) {
    weaknesses.push("Aucun volume détecté sur les jambes (quadriceps, ischios, mollets) alors que le haut du corps est bien travaillé — le classique \"jour de jambes sauté\", à corriger pour un développement équilibré et éviter les déséquilibres de force.");
    recommendations.push("Ajouter au moins une séance ciblant les jambes (squat, soulevé de terre roumain, fentes, presse à cuisses).");
    score -= 1.5;
  } else if (upperVolume > 0 && legVolume > 0 && legVolume < upperVolume * 0.35) {
    weaknesses.push(`Le volume jambes (${legVolume} séries) est nettement inférieur à celui du haut du corps (${upperVolume} séries) — un ratio très déséquilibré en faveur du haut du corps.`);
    score -= 0.5;
  } else if (legVolume > 0) {
    strengths.push("Les jambes sont travaillées avec un volume cohérent par rapport au haut du corps — pas de \"jour de jambes sauté\".");
  }

  // --- Fréquence par groupe musculaire (1x vs 2x+/semaine) ---
  const daysPerCategory = {};
  days.forEach(d => {
    const catsThisDay = new Set(d.exercises.map(e => e.cat));
    catsThisDay.forEach(cat => { daysPerCategory[cat] = (daysPerCategory[cat] || 0) + 1; });
  });
  const onceWeekly = MAJOR_GROUPS.filter(cat => daysPerCategory[cat] === 1);
  if (onceWeekly.length >= 2 && days.length >= 4) {
    recommendations.push(`${onceWeekly.join(", ")} ne sont travaillés qu'une seule fois par semaine. À volume hebdomadaire égal, répartir ce travail sur 2 séances par semaine est généralement associé à de meilleurs résultats en hypertrophie qu'une séance unique très chargée.`);
    score -= 0.5;
  }

  // --- Présence de travail des abdominaux/gainage ---
  if (!volumeByCategory["Abdominaux"] && days.length >= 3) {
    weaknesses.push("Aucun travail spécifique des abdominaux/gainage détecté dans le programme.");
    recommendations.push("Ajouter 1 à 2 exercices de gainage ou d'abdominaux, même en fin de séance.");
    score -= 0.5;
  } else if (volumeByCategory["Abdominaux"]) {
    strengths.push("Le programme inclut un travail dédié des abdominaux/gainage.");
  }

  // --- Variété des mouvements dans les groupes les plus travaillés ---
  const namesByCategory = {};
  days.forEach(d => d.exercises.forEach(e => {
    if (!namesByCategory[e.cat]) namesByCategory[e.cat] = new Set();
    namesByCategory[e.cat].add(e.name);
  }));
  const monotone = MAJOR_GROUPS.filter(cat => (volumeByCategory[cat] || 0) >= 12 && (namesByCategory[cat]?.size || 0) <= 1);
  if (monotone.length > 0) {
    weaknesses.push(`${monotone.join(", ")} : volume élevé concentré sur un seul et même exercice, sans variation d'angle ou de mouvement. Varier les exercices au sein d'un groupe musculaire aide à solliciter l'ensemble des fibres et à limiter la monotonie.`);
    score -= 0.5;
  }

  // --- Doublons d'exercices au sein d'une même séance (souvent une erreur de saisie) ---
  let duplicateFound = false;
  (program.customSessions || []).forEach((d, dayIdx) => {
    if (d.rest || !d.exercises) return;
    const seen = new Map();
    d.exercises.forEach((e, exIdx) => {
      if (seen.has(e.name)) {
        duplicateFound = true;
        fixes.push({ id: `dup-${dayIdx}-${exIdx}`, label: `Supprimer le doublon "${e.name}" (${d.title || "séance"})`, type: "removeDuplicate", dayIndex: dayIdx, exerciseIndex: exIdx });
      }
      seen.set(e.name, exIdx);
    });
  });
  if (duplicateFound) {
    weaknesses.push("Un même exercice apparaît deux fois dans une même séance — probablement une erreur de saisie à vérifier.");
    score -= 0.5;
  }

  // --- Volume total par séance (trop de séries en une seule session) ---
  const heavySessions = days.filter(d => d.exercises.reduce((s, e) => s + (Number(e.sets) || 0), 0) > 28);
  if (heavySessions.length > 0) {
    weaknesses.push(`${heavySessions.length} séance${heavySessions.length > 1 ? "s dépassent" : " dépasse"} 28 séries au total en une seule session — au-delà de ce volume, la qualité d'exécution et l'intensité par série tendent à chuter (fatigue accumulée).`);
    recommendations.push("Répartir le volume sur davantage de séances dans la semaine plutôt que de le concentrer.");
    score -= 0.5;
  }

  // --- Présence de travail unilatéral (utile pour corriger les asymétries) ---
  const UNILATERAL_HINTS = ["unilatéral", "un bras", "une jambe", "alterné", "bulgare", "pistol"];
  const hasUnilateral = days.some(d => d.exercises.some(e => UNILATERAL_HINTS.some(h => e.name.toLowerCase().includes(h))));
  if (!hasUnilateral && days.length >= 3) {
    recommendations.push(`Aucun exercice unilatéral détecté (un bras / une jambe à la fois)${isAdvanced ? " — à ce niveau, c'est souvent le principal levier restant pour corriger des asymétries fines" : ""} — en ajouter permettrait de corriger d'éventuelles asymétries de force entre les côtés.`);
  } else if (hasUnilateral) {
    strengths.push("Le programme inclut du travail unilatéral, utile pour corriger les asymétries de force entre les côtés.");
  }

  // --- Adéquation reps / objectif du programme ---
  const goalText = (program.goals || []).join(" ").toLowerCase() + " " + (program.name || "").toLowerCase();
  const allReps = days.flatMap(d => d.exercises.map(e => parseInt(e.reps) || null)).filter(Boolean);
  const avgReps = allReps.length ? allReps.reduce((a, b) => a + b, 0) / allReps.length : null;
  if (avgReps !== null) {
    const wantsStrength = /force|strength|531|powerlifting/.test(goalText);
    const wantsHypertrophy = /hypertrophie|masse|volume/.test(goalText);
    if (wantsStrength && avgReps > 8) {
      weaknesses.push(`Objectif orienté force, mais la moyenne de répétitions du programme (~${avgReps.toFixed(1)}) est plutôt haute pour ce but — un travail en force bénéficie généralement de plages plus basses (3-6 reps) sur les mouvements principaux.`);
      score -= 0.5;
    } else if (wantsHypertrophy && (avgReps < 6 || avgReps > 20)) {
      weaknesses.push(`Objectif hypertrophie, mais la moyenne de répétitions (~${avgReps.toFixed(1)}) sort de la plage habituellement la plus efficace (6-20 reps par série).`);
      score -= 0.5;
    } else {
      strengths.push(`Les plages de répétitions (moyenne ~${avgReps.toFixed(1)}) sont cohérentes avec l'objectif annoncé du programme.`);
    }
  }

  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  if (strengths.length === 0) strengths.push("Structure de base cohérente, sans signal d'alerte majeur détecté.");
  if (weaknesses.length === 0) weaknesses.push("Aucun point faible majeur détecté par cette analyse automatique.");
  if (recommendations.length === 0) recommendations.push("Continuer à suivre la progression de charge et ajuster selon le ressenti du client.");

  return { score, strengths, weaknesses, recommendations, daysTrained: days.length, restDays, muscleBreakdown, subMuscleDetail, fixes };
}

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
async function exportProgramToPDF(program) {
  const { jsPDF } = await import("jspdf");
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

function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function computeDailyStats(completedSessions) {
  const today = new Date();
  let sessionsToday = 0, caloriesToday = 0;
  Object.values(completedSessions).forEach(entry => {
    if (!entry || !entry.completedAt) return;
    if (isSameDay(new Date(entry.completedAt), today)) { sessionsToday++; caloriesToday += entry.calories || 0; }
  });
  return { sessionsToday, caloriesToday };
}
function computeWeeklyActivity(completedSessions) {
  const now = new Date();
  const offset = (now.getDay() + 6) % 7; // lundi = 0
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - offset);
  const counts = [0, 0, 0, 0, 0, 0, 0];
  Object.values(completedSessions).forEach(entry => {
    if (!entry || !entry.completedAt) return;
    const d = new Date(entry.completedAt); d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) counts[diff]++;
  });
  return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => ({ d, n: counts[i] }));
}
function computeCalendarHistory(completedSessions, year, month) {
  const history = {};
  Object.values(completedSessions).forEach(entry => {
    if (!entry || !entry.completedAt) return;
    const d = new Date(entry.completedAt);
    if (d.getFullYear() === year && d.getMonth() === month) history[d.getDate()] = "done";
  });
  return history;
}

function computeWeeklyPoints(completedSessions) {
  const now = new Date();
  const offset = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - offset);
  let xp = 0, sessions = 0, calories = 0, minutes = 0;
  Object.values(completedSessions).forEach(entry => {
    if (!entry || !entry.completedAt) return;
    const d = new Date(entry.completedAt);
    if (d >= monday) { xp += entry.xp || 0; sessions++; calories += entry.calories || 0; minutes += entry.minutes || 0; }
  });
  const daysLeft = 7 - offset - 1;
  return { xp, sessions, calories, minutes, daysLeft: Math.max(0, daysLeft) };
}

/** Calcule une vraie série de jours consécutifs (pas juste un compteur qui monte
 *  indéfiniment) à partir des dates réelles de séances loggées, avec un "gel"
 *  gratuit par mois calendaire qui comble un jour manqué sans casser la série. */
function computeRealStreak(completedSessions, freezeUsedAt) {
  const dates = new Set();
  Object.values(completedSessions).forEach(entry => {
    if (entry && entry.completedAt) dates.add(new Date(entry.completedAt).toDateString());
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const freezeAvailable = !freezeUsedAt ||
    (new Date(freezeUsedAt).getMonth() !== today.getMonth() || new Date(freezeUsedAt).getFullYear() !== today.getFullYear());

  let streak = 0;
  let usedFreeze = false;
  const cursor = new Date(today);
  let guard = 0;
  while (guard < 400) {
    guard++;
    const isToday = cursor.getTime() === today.getTime();
    if (dates.has(cursor.toDateString())) {
      streak++;
    } else if (isToday) {
      // La journée n'est pas terminée, on ne casse pas la série pour ça.
    } else if (freezeAvailable && !usedFreeze) {
      usedFreeze = true; // Gel mensuel consommé pour combler ce trou.
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, freezeAvailable, usedFreeze };
}

function getSupplementSuggestions(goal) {
  const common = [
    { name: "Vitamine D", why: "Souvent déficiente, notamment en cas de faible exposition au soleil. Joue un rôle dans la santé osseuse et immunitaire." },
    { name: "Oméga-3 (EPA/DHA)", why: "Soutien de la récupération et de la santé cardiovasculaire, notamment si peu de poisson gras au menu." },
  ];
  const byGoal = {
    "Perte de poids": [
      { name: "Whey protéine", why: "Aide à atteindre l'apport en protéines tout en restant en déficit calorique, pour préserver la masse musculaire." },
      { name: "Fibres / psyllium", why: "Peut aider la satiété en période de restriction calorique." },
    ],
    "Prise de masse": [
      { name: "Whey ou gainer", why: "Facilite l'atteinte d'un surplus calorique et d'un apport protéique élevé." },
      { name: "Créatine monohydrate", why: "Le supplément le plus étudié pour la force et le volume musculaire." },
    ],
    "Recomposition": [
      { name: "Whey protéine", why: "Soutient la récupération et le maintien musculaire pendant les phases de recomposition." },
      { name: "Créatine monohydrate", why: "Peut soutenir la force pendant que la composition corporelle évolue." },
    ],
    "Performance": [
      { name: "Créatine monohydrate", why: "Bénéfices bien documentés sur la force et la puissance." },
      { name: "Caféine", why: "Peut soutenir l'énergie et la concentration avant l'effort, à dose raisonnable." },
    ],
  };
  return [...(byGoal[goal] || byGoal["Recomposition"]), ...common];
}

const APP_VERSION = "2026.08.06p";
const PATCH_NOTES = [
  {
    version: "2026.08.06p",
    date: "6 août 2026",
    items: [
      "Refonte \"séances d'abord\" : les séances d'un programme sont maintenant de grandes cartes remontées en haut de l'écran, plus une petite ligne noyée dans des semaines repliées.",
      "La carte \"Votre séance\" du tableau de bord est devenue le vrai point focal de l'écran d'accueil (dégradé plein, gros bouton blanc).",
    ],
  },
  {
    version: "2026.08.06o",
    date: "6 août 2026",
    items: [
      "Refonte visuelle du panneau d'analyse de programme : anneau de score, onglets Résumé/Muscles/Suggestions au lieu d'un mur de texte, cartes colorées cohérentes avec le reste de l'app.",
    ],
  },
  {
    version: "2026.08.06n",
    date: "6 août 2026",
    items: [
      "Possibilité d'annuler toutes les corrections appliquées après une analyse et revenir exactement à la séance d'avant.",
    ],
  },
  {
    version: "2026.08.06m",
    date: "6 août 2026",
    items: [
      "L'analyse de programme propose maintenant des corrections en un clic : \"Appliquer\" ajoute directement l'exercice suggéré à la bonne séance, ou supprime un doublon détecté.",
    ],
  },
  {
    version: "2026.08.06l",
    date: "6 août 2026",
    items: [
      "Analyse de programme croisée avec les blessures signalées à l'inscription du client — alerte si un exercice risque de solliciter une zone sensible.",
      "Seuils de volume adaptés au niveau du client (débutant/intermédiaire/avancé) au lieu d'un repère unique.",
      "Détection de la fatigue cumulée quand plusieurs mouvements lourds de la même chaîne sont sur la même séance (ex : squat + soulevé de terre).",
    ],
  },
  {
    version: "2026.08.06k",
    date: "6 août 2026",
    items: [
      "Analyse gratuite du programme : détail anatomique fin par muscle (ex : chef long/court du biceps, brachial, deltoïde antérieur/latéral/postérieur...) avec recommandations d'angles de travail manquants.",
    ],
  },
  {
    version: "2026.08.06j",
    date: "6 août 2026",
    items: [
      "Analyse gratuite du programme : nouvelle répartition visuelle du volume par muscle (barres, séries/semaine), avec détection explicite des muscles non travaillés.",
    ],
  },
  {
    version: "2026.08.06i",
    date: "6 août 2026",
    items: [
      "Analyse gratuite du programme largement enrichie : équilibre jambes/haut du corps, fréquence par groupe musculaire, présence d'abdominaux, variété des mouvements, doublons, volume par séance, travail unilatéral.",
    ],
  },
  {
    version: "2026.08.06h",
    date: "6 août 2026",
    items: [
      "Analyse de programme gratuite et instantanée : volume par groupe musculaire, équilibre poussée/tirage, récupération, ordre des exercices — sans clé API, sans coût.",
      "L'analyse IA avec clé API personnelle reste disponible en option pour aller plus loin.",
    ],
  },
  {
    version: "2026.08.06g",
    date: "6 août 2026",
    items: [
      "Tableau de bord client épuré : place à l'essentiel (lancer sa séance), le reste déplacé vers Profil et Calendrier.",
      "Analyse IA d'un programme sur-mesure pour le coach (nécessite ta propre clé API, voir le README).",
    ],
  },
  {
    version: "2026.08.06f",
    date: "6 août 2026",
    items: [
      "Réorganiser l'ordre des exercices d'une séance (coach en construisant un programme, client avant de démarrer).",
      "\"Machine indisponible ?\" en plein exercice : remplace par un équivalent et remet l'original plus tard dans la séance.",
    ],
  },
  {
    version: "2026.08.06e",
    date: "6 août 2026",
    items: [
      "Gestion des clients redesignée : fini les boutons empilés sur chaque fiche, place à une vraie fiche client dédiée avec onglets (Dossier, Programme, Messages, Photos, Ressenti, Charges).",
      "Liste des clients épurée, un tap ouvre la fiche complète.",
    ],
  },
  {
    version: "2026.08.06d",
    date: "6 août 2026",
    items: [
      "Fix : panneau d'installation et \"Quoi de neuf\" illisibles (texte noir sur fond noir).",
      "Police cohérente partout : tous les menus déroulants remplacés par un composant maison (plus de police du téléphone qui détonne).",
      "La séance se valide automatiquement à la fin du dernier exercice, direct vers le ressenti.",
      "Dossier client complet côté coach : infos personnelles, compte, programme et progression en un seul endroit.",
    ],
  },
  {
    version: "2026.08.06c",
    date: "6 août 2026",
    items: [
      "Navigation de l'espace coach en menu latéral, comme côté client.",
      "Recherche, filtres (actifs/expirés/révoqués) et tri des clients dans l'espace coach.",
    ],
  },
  {
    version: "2026.08.06b",
    date: "6 août 2026",
    items: [
      "3 nouveaux programmes pro dans la bibliothèque : 5/3/1 Force Athlétique, PHUL Hypertrophie, Full Body Métabolique.",
      "Notes vocales dans la messagerie coach ↔ client.",
      "Pièces jointes et accusés de lecture dans les messages.",
    ],
  },
  {
    version: "2026.08.06",
    date: "6 août 2026",
    items: [
      "Calendrier multi-clients pour le coach : qui s'est entraîné quel jour, en un coup d'œil.",
      "Vraie courbe de progression par exercice (charge dans le temps + 1RM estimé), côté client et côté coach.",
      "Rappel de pesée juste après chaque séance.",
    ],
  },
];

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
/** Passez à true une fois Stripe configuré (voir README) pour afficher
 *  la section abonnement côté client. Reste à false par défaut pour ne
 *  rien casser tant que le backend Stripe n'est pas branché. */
const SUBSCRIPTION_ENABLED = false;

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
const PhotoViewer = ({ url, onClose }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.92)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(16px + max(env(safe-area-inset-top), 24px)) 16px 16px"
  }} className="anim-fadeIn">
    <button onClick={onClose} style={{
      position: "absolute", top: "calc(16px + max(env(safe-area-inset-top), 24px))", right: 16, width: 40, height: 40, borderRadius: "50%",
      background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
    }}>
      <X size={20} />
    </button>
    <img src={url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12 }} />
  </div>
);

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


const PhotoUploadField = ({ c, value, onChange, label = "Photo de l'exercice (optionnel)" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const url = await uploadExercisePhoto(file);
      onChange(url);
    } catch (err) { setError("Envoi impossible."); }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div style={{ fontSize: 9.5, color: c.muted, marginBottom: 4 }}>{label}</div>
      {value ? (
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
          <img src={value} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
          <button onClick={() => onChange("")} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current && inputRef.current.click()} disabled={uploading} style={{
          width: "100%", padding: "12px", borderRadius: 10, border: `1px dashed ${c.border}`, background: c.surface2,
          color: c.muted, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
        }}>
          <Camera size={14} /> {uploading ? "Envoi..." : "Ajouter une photo"}
        </button>
      )}
      {error && <div style={{ fontSize: 10.5, color: c.danger, marginTop: 4 }}>{error}</div>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
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

const CustomSelect = ({ c, value, onChange, options, placeholder, style }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="ff-body" style={{
        ...inputStyle(c), display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", ...style
      }}>
        <span style={{ color: selected ? c.text : c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected ? selected.label : (placeholder || "Choisir...")}</span>
        <ChevronDown size={15} color={c.muted} style={{ flexShrink: 0, marginLeft: 6 }} />
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} className="ff-body anim-fadeUp" style={{
            width: "100%", maxHeight: "70vh", overflowY: "auto", background: c.surface, color: c.text,
            borderRadius: "24px 24px 0 0", padding: "18px 16px calc(18px + env(safe-area-inset-bottom))"
          }}>
            <div style={{ width: 40, height: 4, background: c.border, borderRadius: 4, margin: "0 auto 16px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {options.map(o => (
                <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 12px", borderRadius: 12, border: "none",
                  background: o.value === value ? "rgba(0,113,227,0.1)" : "transparent", color: o.value === value ? c.electric2 : c.text,
                  fontSize: 14, fontWeight: o.value === value ? 700 : 500, cursor: "pointer", textAlign: "left"
                }}>
                  {o.label}
                  {o.value === value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const IconBtn = ({ icon: Icon, onClick, c, size = 38, active, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: size, height: size, borderRadius: 12, border: `1px solid ${c.border}`,
    background: active ? c.gradA : c.surface2, display: "flex", alignItems: "center", justifyContent: "center",
    color: active ? "#fff" : c.text, cursor: disabled ? "default" : "pointer", flexShrink: 0, opacity: disabled ? 0.5 : 1
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
const AnimatedBlobs = ({ c }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
    <div className="blob1" style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: c.gradA, opacity: c.dark ? 0.28 : 0.22, filter: "blur(75px)", top: -90, left: -90 }} />
    <div className="blob2" style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: c.electric2, opacity: c.dark ? 0.22 : 0.18, filter: "blur(75px)", bottom: -70, right: -70 }} />
    <div className="blob3" style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: c.electric, opacity: c.dark ? 0.16 : 0.12, filter: "blur(60px)", top: "40%", right: "10%" }} />
  </div>
);

const AuthScreen = ({ c, onAuthed }) => {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setInfo("");

    if (mode === "forgot") {
      if (!email.trim()) { setError("Renseignez votre email."); return; }
      setLoading(true);
      try {
        await sendPasswordReset(email.trim());
        setInfo("Un email de réinitialisation a été envoyé si ce compte existe. Vérifiez votre boîte de réception.");
      } catch (e) { setError(e && e.message ? e.message : "Une erreur est survenue."); }
      setLoading(false);
      return;
    }

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
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ position: "relative", minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, overflow: "hidden" }}>
      <AnimatedBlobs c={c} />
      <div className="anim-fadeUp" style={{
        position: "relative", zIndex: 1, maxWidth: 380, margin: "0 auto", width: "100%",
        background: c.dark ? "rgba(20,22,30,0.55)" : "rgba(255,255,255,0.6)", backdropFilter: "blur(24px)",
        border: `1px solid ${c.border}`, borderRadius: 28, padding: 28, boxShadow: c.dark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 20px 60px rgba(0,0,0,0.08)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <Logo c={c} size={54} style={{ margin: "0 auto 14px" }} />
          <h1 className="ff-display" style={{ fontSize: 21, fontWeight: 700, margin: "0 0 6px" }}>
            {mode === "login" ? "Content de vous revoir" : mode === "signup" ? "Créez votre compte" : "Mot de passe oublié"}
          </h1>
          <p style={{ color: c.muted, fontSize: 12.5, margin: 0 }}>
            {mode === "login" ? "Connectez-vous pour retrouver votre coaching." : mode === "signup" ? "Votre inscription sera validée par votre coach avant l'accès complet." : "Recevez un lien pour réinitialiser votre mot de passe."}
          </p>
        </div>

        {mode !== "forgot" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 22, background: c.surface2, padding: 4, borderRadius: 12, position: "relative" }}>
            <div style={{
              position: "absolute", top: 4, bottom: 4, width: "calc(50% - 4px)", borderRadius: 9, background: c.gradA,
              transform: mode === "signup" ? "translateX(calc(100% + 8px))" : "translateX(0)", transition: "transform .28s cubic-bezier(.22,1,.36,1)"
            }} />
            {[{ id: "login", l: "Connexion", icon: LogIn }, { id: "signup", l: "Créer un compte", icon: UserPlus }].map(t => (
              <button key={t.id} onClick={() => { setMode(t.id); setError(""); setInfo(""); }} style={{
                flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer", position: "relative", zIndex: 1,
                background: "transparent", color: mode === t.id ? "#fff" : c.muted,
                fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "color .2s"
              }}><t.icon size={14} /> {t.l}</button>
            ))}
          </div>
        )}

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
          {mode !== "forgot" && (
            <div>
              <div style={labelStyle(c)}>Mot de passe</div>
              <div style={{ position: "relative" }}>
                <KeyRound size={15} color={c.muted} style={{ position: "absolute", left: 13, top: 14 }} />
                <input style={{ ...inputStyle(c), paddingLeft: 38, paddingRight: 40 }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPw ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", cursor: "pointer", color: c.muted }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === "login" && (
                <button onClick={() => { setMode("forgot"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: c.electric2, fontSize: 11.5, cursor: "pointer", marginTop: 8, padding: 0 }}>
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          )}

          {error && <div className="anim-fadeIn" style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10 }}>{error}</div>}
          {info && <div className="anim-fadeIn" style={{ fontSize: 12, color: c.success, background: "rgba(48,209,88,0.1)", padding: "10px 12px", borderRadius: 10 }}>{info}</div>}

          <PrimaryBtn c={c} full onClick={submit} disabled={loading} icon={mode === "login" ? LogIn : mode === "signup" ? UserPlus : Mail} style={{ marginTop: 6 }}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
          </PrimaryBtn>

          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: c.muted, fontSize: 12, cursor: "pointer", textAlign: "center" }}>
              ← Retour à la connexion
            </button>
          )}
        </div>

        <p style={{ fontSize: 10.5, color: c.muted, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Vos données sont hébergées sur Supabase. Aucun accès n'est possible sans validation de votre coach.
        </p>
      </div>
    </div>
  );
};

const NumberDial = ({ c, value, setValue, min, max, unit, step = 1 }) => (
  <div style={{ textAlign: "center", width: "100%" }}>
    <div style={{ marginBottom: 30 }}>
      <span className="ff-mono" style={{ fontSize: 64, fontWeight: 700, color: c.text, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 20, color: c.muted, marginLeft: 8, fontWeight: 600 }}>{unit}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={() => setValue(Math.max(min, value - step))} style={{
        width: 46, height: 46, borderRadius: "50%", border: `1.5px solid ${c.border}`, background: c.surface2,
        color: c.text, fontSize: 22, fontWeight: 700, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center"
      }}>−</button>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => setValue(Number(e.target.value))}
        className="premium-slider" style={{ flex: 1 }} />
      <button onClick={() => setValue(Math.min(max, value + step))} style={{
        width: 46, height: 46, borderRadius: "50%", border: "none", background: c.gradA,
        color: "#fff", fontSize: 22, fontWeight: 700, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center"
      }}>+</button>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: c.muted, marginTop: 8, padding: "0 4px" }}>
      <span>{min}{unit}</span><span>{max}{unit}</span>
    </div>
  </div>
);

const FrequencyPicker = ({ c, value, setValue }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", width: "100%" }}>
    {[2, 3, 4, 5, 6].map(n => (
      <button key={n} onClick={() => setValue(n)} style={{
        width: "28%", minWidth: 88, padding: "20px 0", borderRadius: 18, cursor: "pointer",
        border: `2px solid ${value === n ? "transparent" : c.border}`,
        background: value === n ? c.gradA : c.surface2, color: value === n ? "#fff" : c.text,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        boxShadow: value === n ? "0 8px 20px rgba(0,113,227,0.35)" : "none", transition: "all .15s"
      }}>
        <span className="ff-mono" style={{ fontSize: 24, fontWeight: 700 }}>{n}×</span>
        <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>/ semaine</span>
      </button>
    ))}
  </div>
);

const CardPicker = ({ c, value, setValue, options, columns = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns},1fr)`, gap: 10, width: "100%" }}>
    {options.map(opt => (
      <button key={opt.value} onClick={() => setValue(opt.value)} style={{
        padding: "18px 10px", borderRadius: 16, cursor: "pointer",
        border: `2px solid ${value === opt.value ? "transparent" : c.border}`,
        background: value === opt.value ? c.gradA : c.surface2, color: value === opt.value ? "#fff" : c.text,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        boxShadow: value === opt.value ? "0 8px 20px rgba(0,113,227,0.35)" : "none", transition: "all .15s"
      }}>
        {opt.icon && <opt.icon size={22} />}
        <span style={{ fontSize: 12.5, fontWeight: 700, textAlign: "center" }}>{opt.label}</span>
      </button>
    ))}
  </div>
);

const Onboarding = ({ c, name, onComplete }) => {
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("homme");
  const [goal, setGoal] = useState("Perte de poids");
  const [frequency, setFrequency] = useState(3);
  const [injuries, setInjuries] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { title: "Quel est votre poids ?", subtitle: "Ça nous permet de calculer vos besoins caloriques.", content: <NumberDial c={c} value={weight} setValue={setWeight} min={35} max={180} unit="kg" /> },
    { title: "Quelle est votre taille ?", subtitle: "Utile pour affiner le calcul de vos besoins.", content: <NumberDial c={c} value={height} setValue={setHeight} min={130} max={220} unit="cm" /> },
    { title: "Quel âge avez-vous ?", subtitle: "Pour adapter l'intensité recommandée de vos séances.", content: <NumberDial c={c} value={age} setValue={setAge} min={14} max={90} unit="ans" /> },
    {
      title: "Vous êtes...", subtitle: "Pour un calcul plus précis de vos besoins caloriques.",
      content: <CardPicker c={c} value={gender} setValue={setGender} columns={2} options={[
        { value: "homme", label: "Homme" }, { value: "femme", label: "Femme" },
      ]} />
    },
    {
      title: "Quel est votre objectif principal ?", subtitle: "Votre programme et vos conseils seront adaptés en conséquence.",
      content: <CardPicker c={c} value={goal} setValue={setGoal} columns={2} options={[
        { value: "Perte de poids", label: "Perte de poids", icon: Flame },
        { value: "Prise de masse", label: "Prise de masse", icon: Dumbbell },
        { value: "Recomposition", label: "Recomposition", icon: Activity },
        { value: "Performance", label: "Performance", icon: Trophy },
      ]} />
    },
    { title: "À quelle fréquence voulez-vous vous entraîner ?", subtitle: "Le nombre de séances par semaine que vous visez.", content: <FrequencyPicker c={c} value={frequency} setValue={setFrequency} /> },
    {
      title: "Blessures ou limitations ?", subtitle: "Optionnel — votre coach en tiendra compte pour votre programme.",
      content: (
        <textarea value={injuries} onChange={e => setInjuries(e.target.value)} placeholder="Ex : douleur au genou droit, épaule sensible..."
          style={{ ...inputStyle(c), minHeight: 90, resize: "vertical", textAlign: "left" }} />
      )
    },
  ];
  const isLast = step === steps.length - 1;
  const [celebrating, setCelebrating] = useState(false);

  const next = () => {
    if (!isLast) { setStep(s => s + 1); return; }
    setError("");
    setCelebrating(true);
    setTimeout(async () => {
      setSaving(true);
      try {
        await onComplete({ weight, height, age, gender, goal, trainingFrequency: frequency, injuries: injuries.trim() });
      } catch (e) {
        setCelebrating(false);
        setSaving(false);
        setError(e && e.message ? e.message : "Une erreur est survenue, réessayez.");
      }
    }, 750);
  };

  if (celebrating) {
    return (
      <div className="ff-body anim-fadeIn" style={{ position: "relative", minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <AnimatedBlobs c={c} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 22px" }}>
            <div className="anim-ringExpand" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${c.electric2}` }} />
            <div className="anim-burst" style={{ width: 100, height: 100, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px rgba(0,113,227,0.4)" }}>
              <Check size={46} color="#fff" strokeWidth={3} />
            </div>
          </div>
          <h2 className="ff-display anim-fadeUp" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Profil créé !</h2>
          <p className="anim-fadeUp" style={{ color: c.muted, fontSize: 13 }}>Un instant, on vous emmène vers votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ position: "relative", minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", overflowX: "hidden" }}>
      <AnimatedBlobs c={c} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 380, margin: "0 auto", width: "100%" }}>
        <Logo c={c} size={44} style={{ margin: "0 auto 14px" }} />
        {step === 0 && <p style={{ color: c.muted, fontSize: 13, textAlign: "center", marginBottom: 4 }}>Bienvenue {name} 👋</p>}

        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 26, marginTop: 12, flexWrap: "wrap" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i <= step ? c.electric : c.surface2, transition: "all .25s" }} />
          ))}
        </div>

        <div key={step} className="anim-stepSlide" style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 className="ff-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{steps[step].title}</h1>
          <p style={{ color: c.muted, fontSize: 12.5, marginBottom: 26 }}>{steps[step].subtitle}</p>
          {steps[step].content}
        </div>

        {error && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10, marginBottom: 14, textAlign: "center" }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && <SecondaryBtn c={c} onClick={() => setStep(s => s - 1)} icon={ChevronLeft} style={{ flex: "0 0 auto" }} />}
          <PrimaryBtn c={c} full onClick={next} disabled={saving} icon={isLast ? Check : ChevronRight}>
            {saving ? "Enregistrement..." : isLast ? "Valider mon profil" : "Suivant"}
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

const RevokedScreen = ({ c, onLogout, reason }) => (
  <div className="ff-body anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
    <div style={{ width: 76, height: 76, borderRadius: 22, background: "rgba(255,59,48,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
      <Lock size={34} color="#FF3B30" />
    </div>
    <h2 className="ff-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Accès révoqué</h2>
    <p style={{ color: c.muted, fontSize: 13.5, maxWidth: 320, lineHeight: 1.6, marginBottom: reason ? 14 : 26 }}>
      Votre accès à N2Koaching a été révoqué par votre coach.
    </p>
    {reason && (
      <div style={{ background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 14, padding: 16, maxWidth: 320, marginBottom: 26 }}>
        <div style={{ fontSize: 10.5, color: c.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 }}>Motif indiqué</div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{reason}</div>
      </div>
    )}
    <SecondaryBtn c={c} icon={LogOut} onClick={onLogout}>Retour à l'accueil</SecondaryBtn>
  </div>
);

const ResetPasswordScreen = ({ c, onDone }) => {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (pw.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (pw !== pw2) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setSaving(true);
    try {
      await updatePassword(pw);
      onDone();
    } catch (e) { setError(e && e.message ? e.message : "Une erreur est survenue."); setSaving(false); }
  };

  return (
    <div className="ff-body anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 360, margin: "0 auto", width: "100%" }}>
        <Logo c={c} size={48} style={{ margin: "0 auto 16px" }} />
        <h1 className="ff-display" style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>Nouveau mot de passe</h1>
        <p style={{ color: c.muted, fontSize: 12.5, textAlign: "center", marginBottom: 24 }}>Choisissez un nouveau mot de passe pour votre compte.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <input style={{ ...inputStyle(c), paddingRight: 40 }} type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="Nouveau mot de passe" />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", cursor: "pointer", color: c.muted }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input style={inputStyle(c)} type={showPw ? "text" : "password"} value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Confirmer le mot de passe" />
          {error && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10 }}>{error}</div>}
          <PrimaryBtn c={c} full onClick={submit} disabled={saving} icon={Check}>{saving ? "Enregistrement..." : "Valider"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
};

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
    <div className="ff-body scrollbar-none app-scroll" style={{ position: "relative", minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 520, overflow: "hidden", zIndex: 0 }}>
        <AnimatedBlobs c={c} />
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Logo c={c} size={32} />
          <span className="ff-display" style={{ fontWeight: 700, fontSize: 18 }}>N2Koaching</span>
        </div>
        <IconBtn icon={dark ? Sun : Moon} c={c} onClick={() => setDark(!dark)} />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "40px 20px 10px", textAlign: "center" }} className="anim-fadeUp">
        <div style={{ display: "inline-block", marginBottom: 18 }}>
          <Pill c={c} tone="electric">● Coaching réel : inscription validée par un coach</Pill>
        </div>
        <h1 className="ff-display" style={{ fontSize: 42, lineHeight: 1.06, fontWeight: 700, margin: "0 0 14px", letterSpacing: -0.5 }}>
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

      <div className="anim-fadeUp" style={{ position: "relative", zIndex: 1, padding: "34px 20px", animationDelay: ".1s" }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: Flame, v: statVals.a.toLocaleString("fr-FR"), l: "Séances réalisées" },
            { icon: TrendingUp, v: statVals.b.toLocaleString("fr-FR"), l: "Athlètes actifs" },
            { icon: Heart, v: statVals.d + "%", l: "Taux de satisfaction" },
          ].map((s, i) => (
            <Card key={i} c={c} style={{ width: 108, textAlign: "center", padding: "18px 8px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(0,113,227,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <s.icon size={16} color={c.electric2} />
              </div>
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
const InstallPrompt = ({ c, onContinue }) => {
  const [platform, setPlatform] = useState(null); // null | "ios" | "android"

  return (
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ position: "relative", minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", overflowX: "hidden" }}>
      <AnimatedBlobs c={c} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 380, margin: "0 auto", width: "100%" }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Download size={26} color="#fff" />
        </div>
        <h1 className="ff-display" style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Installez l'application</h1>
        <p style={{ color: c.muted, fontSize: 13, textAlign: "center", marginBottom: 26, lineHeight: 1.5 }}>
          Ajoutez N2Koaching à votre écran d'accueil pour un accès instantané, comme une vraie app — plus rapide, en plein écran, sans passer par le navigateur.
        </p>

        {!platform && (
          <div className="anim-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => setPlatform("ios")} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18,
              border: `1.5px solid ${c.border}`, background: c.surface, cursor: "pointer", textAlign: "left"
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 384 512" fill={c.text}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>iPhone / iPad</div>
                <div style={{ fontSize: 11.5, color: c.muted }}>Safari</div>
              </div>
              <ChevronRight size={18} color={c.muted} />
            </button>
            <button onClick={() => setPlatform("android")} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18,
              border: `1.5px solid ${c.border}`, background: c.surface, cursor: "pointer", textAlign: "left"
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#34C759" d="M6 20h36v14a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V20Z" /><path d="M12 20V13a12 12 0 0 1 24 0v7" stroke="#34C759" strokeWidth="4" fill="none" /><circle cx="17" cy="26" r="2" fill="#fff" /><circle cx="31" cy="26" r="2" fill="#fff" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Android</div>
                <div style={{ fontSize: 11.5, color: c.muted }}>Chrome</div>
              </div>
              <ChevronRight size={18} color={c.muted} />
            </button>
            <button onClick={onContinue} style={{ background: "none", border: "none", color: c.muted, fontSize: 12.5, cursor: "pointer", marginTop: 8 }}>
              Passer cette étape
            </button>
          </div>
        )}

        {platform === "ios" && (
          <div className="anim-stepSlide">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { n: 1, t: "Ouvrez ce site dans Safari", d: "L'installation ne fonctionne que depuis le navigateur Safari sur iPhone/iPad." },
                { n: 2, t: "Appuyez sur le bouton Partager", d: "L'icône carrée avec une flèche vers le haut, en bas de l'écran." },
                { n: 3, t: "Choisissez « Sur l'écran d'accueil »", d: "Faites défiler la liste des options si besoin." },
                { n: 4, t: "Appuyez sur « Ajouter »", d: "L'icône N2Koaching apparaît alors sur votre écran d'accueil." },
              ].map(s => (
                <Card c={c} key={s.n} style={{ display: "flex", gap: 12, padding: 14 }}>
                  <div className="ff-mono" style={{ width: 26, height: 26, borderRadius: "50%", background: c.gradA, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{s.t}</div>
                    <div style={{ fontSize: 11.5, color: c.muted, lineHeight: 1.4 }}>{s.d}</div>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <SecondaryBtn c={c} onClick={() => setPlatform(null)} icon={ChevronLeft} style={{ flex: "0 0 auto" }} />
              <PrimaryBtn c={c} full icon={Check} onClick={onContinue}>C'est fait, continuer</PrimaryBtn>
            </div>
          </div>
        )}

        {platform === "android" && (
          <div className="anim-stepSlide">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { n: 1, t: "Ouvrez ce site dans Chrome", d: "L'installation fonctionne aussi depuis certains autres navigateurs Android." },
                { n: 2, t: "Appuyez sur le menu ⋮", d: "Les trois points verticaux en haut à droite de l'écran." },
                { n: 3, t: "Choisissez « Ajouter à l'écran d'accueil »", d: "Ou directement « Installer l'application » si la bannière apparaît." },
                { n: 4, t: "Confirmez « Installer »", d: "L'icône N2Koaching apparaît alors sur votre écran d'accueil." },
              ].map(s => (
                <Card c={c} key={s.n} style={{ display: "flex", gap: 12, padding: 14 }}>
                  <div className="ff-mono" style={{ width: 26, height: 26, borderRadius: "50%", background: c.gradA, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{s.t}</div>
                    <div style={{ fontSize: 11.5, color: c.muted, lineHeight: 1.4 }}>{s.d}</div>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <SecondaryBtn c={c} onClick={() => setPlatform(null)} icon={ChevronLeft} style={{ flex: "0 0 auto" }} />
              <PrimaryBtn c={c} full icon={Check} onClick={onContinue}>C'est fait, continuer</PrimaryBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WhatsNewModal = ({ c, onClose }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="anim-fadeUp" style={{
      width: "100%", background: c.surface, color: c.text, borderRadius: "24px 24px 0 0",
      padding: "22px 20px calc(22px + env(safe-area-inset-bottom))", maxHeight: "78vh", display: "flex", flexDirection: "column"
    }}>
      <div style={{ width: 40, height: 4, background: c.border, borderRadius: 2, margin: "0 auto 20px", flexShrink: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexShrink: 0 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <h2 className="ff-display" style={{ fontSize: 17, fontWeight: 700, margin: 0, color: c.text }}>Quoi de neuf</h2>
          <p style={{ fontSize: 11, color: c.muted, margin: "2px 0 0" }}>Dernières nouveautés de l'app</p>
        </div>
      </div>

      <div className="scrollbar-none" style={{ overflowY: "auto", marginBottom: 18 }}>
        {PATCH_NOTES.slice(0, 3).map((note, ni) => (
          <div key={note.version} style={{ marginBottom: ni < 2 ? 18 : 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>{note.date}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {note.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <CheckCircle2 size={15} color={c.success} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: c.text }}>{item}</span>
                </div>
              ))}
            </div>
            {ni < Math.min(2, PATCH_NOTES.length - 1) && <div style={{ height: 1, background: c.border, marginTop: 18 }} />}
          </div>
        ))}
      </div>
      <PrimaryBtn c={c} full onClick={onClose} style={{ flexShrink: 0 }}>Compris</PrimaryBtn>
    </div>
  </div>
);

const InstallModal = ({ c, onClose }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
    <div className="anim-fadeUp" onClick={(e) => e.stopPropagation()} style={{ background: c.surface, color: c.text, width: "100%", borderRadius: "24px 24px 0 0", padding: "22px 20px calc(22px + env(safe-area-inset-bottom))", border: `1px solid ${c.border}` }}>
      <div style={{ width: 40, height: 4, background: c.border, borderRadius: 4, margin: "0 auto 18px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Download size={22} color="#fff" />
        </div>
        <div>
          <div className="ff-display" style={{ fontWeight: 700, fontSize: 16, color: c.text }}>Installer N2Koaching</div>
          <p style={{ fontSize: 11.5, color: c.muted, margin: "2px 0 0", lineHeight: 1.4 }}>Un accès instantané, comme une vraie application.</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card c={c} style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 384 512" fill={c.text}><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, color: c.text }}>iPhone / iPad (Safari)</div>
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>Appuyez sur <Share size={12} style={{ display: "inline", verticalAlign: "-2px" }} /> Partager, puis « Sur l'écran d'accueil ».</div>
          </div>
        </Card>
        <Card c={c} style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#34C759" d="M6 20h36v14a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V20Z" /><path d="M12 20V13a12 12 0 0 1 24 0v7" stroke="#34C759" strokeWidth="4" fill="none" /><circle cx="17" cy="26" r="2" fill="#fff" /><circle cx="31" cy="26" r="2" fill="#fff" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, color: c.text }}>Android (Chrome)</div>
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>Menu ⋮ en haut à droite, puis « Ajouter à l'écran d'accueil ».</div>
          </div>
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
    { id: "photos", icon: Camera, label: "Photos" },
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
const Dashboard = ({ c, state, quote, openProgram, openSession, goTab, completedSessions }) => {
  const { xp, level, name } = state;
  const curLevelXp = xpForLevel(level - 1);
  const nextLevelXp = xpForLevel(level);
  const pct = ((xp - curLevelXp) / (nextLevelXp - curLevelXp)) * 100;
  const assigned = resolveAssignedProgram(state);
  const today = assigned ? computeTodaySession(state) : null;
  const streakInfo = computeRealStreak(completedSessions, state.streakFreezeUsedAt);
  const featured = [PROGRAMS.find(p => p.id === "ppl"), PROGRAMS.find(p => p.id === "upper-lower"), PROGRAMS.find(p => p.id === "maison")];
  const daysUntilExpiry = state.accessExpiresAt ? Math.ceil((new Date(state.accessExpiresAt) - new Date()) / 86400000) : null;
  const expirySoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      {expirySoon && (
        <Card c={c} style={{ marginBottom: 14, background: "rgba(255,159,10,0.12)", border: `1px solid ${c.warning}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,159,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Hourglass size={17} color={c.warning} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>
              {daysUntilExpiry === 0 ? "Votre accès expire aujourd'hui" : `Votre accès expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? "s" : ""}`}
            </div>
            <div style={{ fontSize: 11, color: c.muted }}>Le {new Date(state.accessExpiresAt).toLocaleDateString("fr-FR")} — contactez votre coach pour le renouveler.</div>
          </div>
        </Card>
      )}
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
                <Flame size={12} /> {streakInfo.streak} jours{streakInfo.freezeAvailable ? " · 🧊" : ""}
              </span>
              <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
                {xp.toLocaleString("fr-FR")} XP
              </span>
            </div>
          </div>
        </div>
      </Card>

      {assigned && today && (
        <div style={{
          marginBottom: 16, borderRadius: 26, padding: 24, position: "relative", overflow: "hidden",
          background: today.session.rest ? c.surface : c.gradA, border: today.session.rest ? `1.5px solid ${c.border}` : "none"
        }}>
          {!today.session.rest && <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, position: "relative" }}>
            <CalendarIcon size={13} color={today.session.rest ? c.electric2 : "#fff"} />
            <span style={{ fontSize: 11, fontWeight: 700, color: today.session.rest ? c.electric2 : "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 0.6 }}>Votre séance</span>
          </div>
          {today.session.rest ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Coffee size={26} color={c.muted} />
                </div>
                <div className="ff-display" style={{ fontWeight: 700, fontSize: 19 }}>Jour de repos</div>
              </div>
              <p style={{ fontSize: 13, color: c.muted, margin: "10px 0 0 70px" }}>Profitez-en pour récupérer — votre prochaine séance vous attend demain.</p>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <div className="ff-display" style={{ fontWeight: 700, fontSize: 26, lineHeight: 1.15, color: "#fff", marginBottom: 8 }}>
                {today.session.dayType === "custom" ? today.session.title.split(" — ")[1] : FOCUS_LABEL[today.session.dayType]}
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 22, fontWeight: 600 }}>~{today.session.estTotal} min (estimé) · {today.session.main.length} exercices</div>
              <button onClick={() => openSession(today.program, today.week, today.dayIdx)} style={{
                width: "100%", background: "#fff", color: c.electric, border: "none", borderRadius: 18, padding: "18px 22px",
                fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
              }}>
                <Play size={19} fill={c.electric} /> Lancer ma séance
              </button>
            </div>
          )}
          <button onClick={() => openProgram(assigned)} style={{
            background: "none", border: "none", cursor: "pointer", marginTop: 14, display: "block", margin: "14px auto 0",
            color: today.session.rest ? c.muted : "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600
          }}>
            Voir mon programme complet
          </button>
        </div>
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

      {!assigned && (
        <>
          <SectionTitle c={c} action={<button onClick={() => goTab("programs")} style={{ background: "none", border: "none", color: c.electric2, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>Tout voir <ChevronRight size={14} /></button>}>
            Programmes recommandés
          </SectionTitle>
          <div className="scrollbar-none" style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 4, paddingBottom: 4 }}>
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
const ProgramDetail = ({ c, program, onBack, openSession, completedSessions, openReview }) => {
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const toggleWeek = (w) => setExpandedWeeks(exp => exp.includes(w) ? exp.filter(x => x !== w) : [...exp, w]);
  const perWeek = program.cycle.filter(d => d !== "repos").length;
  const Icon = program.icon || Sparkles;

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <div style={{ background: c.gradB, borderRadius: 20, padding: 20, marginBottom: 20 }}>
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>{program.weeks} semaines</span>
          <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>{perWeek}x / semaine</span>
          <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999 }}>{program.level}</span>
        </div>
      </div>

      <SectionTitle c={c}>Vos séances</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {[...Array(program.weeks)].map((_, wi) => {
          const w = wi + 1;
          const open = expandedWeeks.includes(w);
          return (
            <div key={w}>
              <div onClick={() => toggleWeek(w)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: open ? 10 : 0, padding: "4px 2px" }}>
                <span className="ff-display" style={{ fontWeight: 700, fontSize: 15 }}>Semaine {w}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11.5, color: c.muted, fontWeight: 600 }}>{perWeek} séances</span>
                  <ChevronDown size={18} color={c.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </div>
              </div>
              {open && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {program.cycle.map((dayType, di) => {
                    const sess = buildDaySession(program, w, di);
                    if (sess.rest) {
                      return (
                        <Card key={di} c={c} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, opacity: 0.7 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 15, background: c.surface2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Coffee size={22} color={c.muted} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="ff-display" style={{ fontSize: 15, fontWeight: 700, color: c.muted }}>{sess.dayLabel} — Repos</div>
                            <div style={{ fontSize: 12, color: c.muted }}>Récupération active conseillée</div>
                          </div>
                        </Card>
                      );
                    }
                    const dayKey = `${program.id || program.name}-${w}-${di}`;
                    const isDone = !!completedSessions[dayKey];
                    return (
                      <Card key={di} onClick={() => isDone ? openReview(program, w, di, dayKey) : openSession(program, w, di)}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, border: isDone ? `1.5px solid ${c.success}` : `1.5px solid ${c.electric}` }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          background: isDone ? c.success : c.gradA
                        }}>
                          {isDone ? <Check size={22} color="#fff" /> : <Play size={20} color="#fff" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>{sess.dayLabel}</div>
                          <div className="ff-display" style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sess.dayType === "custom" ? sess.title.split(" — ")[1] : FOCUS_LABEL[sess.dayType]}
                          </div>
                          <div style={{ fontSize: 12, color: c.muted }}>{isDone ? "Terminée · voir mes performances" : `~${sess.estTotal} min (estimé) · ${sess.main.length + 4} exercices`}</div>
                        </div>
                        <ChevronRight size={20} color={c.muted} style={{ flexShrink: 0 }} />
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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

      <p style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.6, marginBottom: 20 }}>{program.desc}</p>

      <SectionTitle c={c}>Cycle hebdomadaire type</SectionTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }} className="scrollbar-none">
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
  const [uploading, setUploading] = useState(false);
  const [zoomUrl, setZoomUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const load = async () => {
    try {
      const msgs = await listMessages(clientId);
      setMessages(msgs);
      markMessagesRead(clientId, isAdmin).catch(() => {});
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

  const handleAttach = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMessageAttachment(file, clientId);
      await sendMessage(clientId, text.trim() || null, isAdmin, url, "image");
      setText("");
      await load();
    } catch (err) { /* échec silencieux, réessayer possible */ }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    setRecordError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        setUploading(true);
        try {
          const file = new File([blob], `note-vocale-${Date.now()}.webm`, { type: "audio/webm" });
          const url = await uploadMessageAttachment(file, clientId);
          await sendMessage(clientId, null, isAdmin, url, "audio");
          await load();
        } catch (err) { /* échec silencieux */ }
        setUploading(false);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      setRecordError("Micro indisponible ou refusé.");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Dernier message envoyé par "moi" dans le fil — c'est le seul sur lequel on affiche l'accusé de lecture
  let lastMineIdx = -1;
  messages.forEach((m, i) => { if (m.sender_is_admin === isAdmin) lastMineIdx = i; });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbar-none" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 2px" }}>
        {loading && <div style={{ textAlign: "center", color: c.muted, fontSize: 12, padding: 20 }}>Chargement...</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", color: c.muted, fontSize: 12.5, padding: 30 }}>
            Aucun message pour l'instant.<br />{isAdmin ? `Écrivez à ${peerName}.` : "Écrivez à votre coach."}
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.sender_is_admin === isAdmin;
          return (
            <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
              {m.attachment_url && m.attachment_type === "audio" && (
                <audio controls src={m.attachment_url} style={{ width: 220, height: 34, marginBottom: m.content ? 4 : 0 }} />
              )}
              {m.attachment_url && m.attachment_type !== "audio" && (
                <img src={m.attachment_url} alt="" onClick={() => setZoomUrl(m.attachment_url)}
                  style={{ maxWidth: 200, maxHeight: 200, borderRadius: 14, display: "block", marginBottom: m.content ? 4 : 0, cursor: "pointer", objectFit: "cover" }} />
              )}
              {m.content && (
                <div style={{ background: mine ? c.gradA : c.surface2, color: mine ? "#fff" : c.text, borderRadius: 16, padding: "10px 13px", fontSize: 13, lineHeight: 1.45, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4 }}>
                  {m.content}
                </div>
              )}
              <div style={{ fontSize: 9.5, color: c.muted, marginTop: 3, textAlign: mine ? "right" : "left" }}>
                {new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                {mine && i === lastMineIdx && <span> · {m.read ? "Vu" : "Envoyé"}</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {recordError && <div style={{ fontSize: 11, color: c.danger, textAlign: "center", marginTop: 6 }}>{recordError}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <IconBtn icon={Camera} c={c} onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={recording || uploading} />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAttach} style={{ display: "none" }} />
        {recording ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,59,48,0.1)", borderRadius: 14, padding: "10px 14px" }}>
            <div className="anim-softPulse" style={{ width: 8, height: 8, borderRadius: "50%", background: c.danger }} />
            <span style={{ fontSize: 12.5, color: c.danger, fontWeight: 600 }}>Enregistrement en cours...</span>
          </div>
        ) : (
          <input style={{ ...inputStyle(c), flex: 1 }} placeholder={uploading ? "Envoi..." : "Écrire un message..."} value={text} disabled={uploading}
            onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} />
        )}
        <IconBtn icon={Mic} c={c} active={recording} onClick={recording ? stopRecording : startRecording} disabled={uploading} />
        {!recording && <IconBtn icon={Send} c={c} active onClick={send} disabled={uploading} />}
      </div>
      {zoomUrl && <PhotoViewer url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </div>
  );
};

const SessionPerformanceView = ({ c, session, profileId, sessionKey }) => {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId || !sessionKey) { setLoading(false); return; }
    getSessionExerciseLogs(profileId, sessionKey).then(setLogs).catch(() => setLogs({})).finally(() => setLoading(false));
  }, [profileId, sessionKey]);

  if (session.rest) return <RestDayScreen c={c} />;

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <div style={{ background: c.gradB, borderRadius: 20, padding: 20, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <CheckCircle2 size={16} color="#fff" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 0.4 }}>Séance terminée</span>
        </div>
        <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>{session.title}</div>
      </div>

      <SectionTitle c={c}>Vos performances</SectionTitle>
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: c.muted, fontSize: 12.5 }}>Chargement...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {session.main.map((e, i) => {
            const setsLogged = (logs && logs[e.name]) || [];
            return (
              <Card c={c} key={i} style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>{i + 1}. {e.name}</div>
                {setsLogged.length === 0 ? (
                  <div style={{ fontSize: 11.5, color: c.muted }}>Aucune série loggée pour cet exercice.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {setsLogged.map((s, si) => (
                      <div key={si} style={{ display: "flex", alignItems: "center", gap: 10, background: c.surface2, borderRadius: 10, padding: "8px 12px" }}>
                        <CheckCircle2 size={13} color={c.success} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>Série {si + 1}</span>
                        <span className="ff-mono" style={{ marginLeft: "auto", fontSize: 12, color: c.muted }}>{s.weight ?? "—"} kg × {s.reps}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ScaleSlider = ({ c, value, setValue, leftLabel, rightLabel, gradFrom, gradTo }) => (
  <div>
    <div style={{ textAlign: "center", marginBottom: 10 }}>
      <span className="ff-mono" style={{ fontSize: 40, fontWeight: 700, color: c.text }}>{value}</span>
      <span style={{ fontSize: 14, color: c.muted }}>/10</span>
    </div>
    <input type="range" min={1} max={10} value={value} onChange={e => setValue(Number(e.target.value))}
      className="premium-slider" style={{ width: "100%", background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: c.muted, marginTop: 6 }}>
      <span>{leftLabel}</span><span>{rightLabel}</span>
    </div>
  </div>
);

const SessionFeedbackForm = ({ c, onSubmit, onSkip }) => {
  const [rpe, setRpe] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [soreness, setSoreness] = useState("Légères");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await onSubmit({ rpe, energy, soreness, comment: comment.trim() });
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, background: c.bg, backgroundImage: c.bgGrad, color: c.text, overflowY: "auto", display: "flex", alignItems: "center" }} className="ff-body anim-fadeIn scrollbar-none">
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%", padding: "calc(24px + max(env(safe-area-inset-top), 24px)) 24px calc(24px + env(safe-area-inset-bottom))" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <CheckCircle2 size={28} color="#fff" />
          </div>
          <h1 className="ff-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Séance terminée !</h1>
          <p style={{ color: c.muted, fontSize: 12.5 }}>Quelques infos rapides pour votre coach — 20 secondes.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>À quel point c'était difficile ?</div>
            <ScaleSlider c={c} value={rpe} setValue={setRpe} leftLabel="Très facile" rightLabel="Épuisant" gradFrom="#34C759" gradTo="#FF3B30" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Votre niveau d'énergie après ?</div>
            <ScaleSlider c={c} value={energy} setValue={setEnergy} leftLabel="Vidé" rightLabel="Plein d'énergie" gradFrom="#FF3B30" gradTo="#34C759" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>Courbatures attendues ?</div>
            <CardPicker c={c} value={soreness} setValue={setSoreness} columns={2} options={[
              { value: "Aucune", label: "Aucune" }, { value: "Légères", label: "Légères" },
              { value: "Modérées", label: "Modérées" }, { value: "Fortes", label: "Fortes" },
            ]} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: c.muted, marginBottom: 8 }}>Un commentaire pour votre coach ? (optionnel)</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ex : douleur légère à l'épaule droite sur le développé..."
              style={{ ...inputStyle(c), minHeight: 70, resize: "vertical" }} />
          </div>

          <PrimaryBtn c={c} full icon={Check} disabled={saving} onClick={submit}>{saving ? "Envoi..." : "Envoyer à mon coach"}</PrimaryBtn>
          <button onClick={onSkip} style={{ background: "none", border: "none", color: c.muted, fontSize: 12, cursor: "pointer" }}>Passer cette fois</button>
        </div>
      </div>
    </div>
  );
};

const WeightReminderPrompt = ({ c, currentWeight, onLog, onSkip }) => {
  const [val, setVal] = useState(currentWeight || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (val === "" || isNaN(Number(val))) return;
    setSaving(true);
    await onLog(Number(val));
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="ff-body anim-fadeIn">
      <div style={{ maxWidth: 340, width: "100%", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <TrendingUp size={26} color="#fff" />
        </div>
        <h1 className="ff-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>Petit rappel</h1>
        <p style={{ color: c.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          N'oubliez pas de vous peser aujourd'hui pour garder un suivi précis de votre progression.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input type="number" inputMode="decimal" value={val} onChange={e => setVal(e.target.value)} placeholder="Poids (kg)" autoFocus
            style={{ flex: 1, textAlign: "center", background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: "14px 10px", color: c.text, fontSize: 20, fontWeight: 700, outline: "none" }} className="ff-mono" />
        </div>
        <PrimaryBtn c={c} full icon={Check} disabled={val === "" || saving} onClick={submit} style={{ marginBottom: 10 }}>
          {saving ? "Enregistrement..." : "Enregistrer mon poids"}
        </PrimaryBtn>
        <button onClick={onSkip} style={{ background: "none", border: "none", color: c.muted, fontSize: 12.5, cursor: "pointer" }}>Plus tard</button>
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
const FocusExercise = ({ c, exercise, index, total, nextName, onExerciseDone, onContinue, onExitFocus, onSubstitute, profileId, sessionKey }) => {
  const [sets, setSets] = useState(() => Array.from({ length: exercise.sets }, () => ({ weight: "", reps: "", done: false })));
  const [phase, setPhase] = useState("input"); // input | resting | done
  const [activeIdx, setActiveIdx] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [restRemaining, setRestRemaining] = useState(exercise.rest);
  const [infoOpen, setInfoOpen] = useState(false);
  const [lastTime, setLastTime] = useState(null);
  const timeBased = /sec|min/.test(exercise.reps);

  useEffect(() => {
    if (!profileId) return;
    getLastExercisePerformance(profileId, exercise.name).then(setLastTime).catch(() => {});
  }, [profileId, exercise.name]);

  useEffect(() => {
    if (phase !== "resting") return;
    if (restRemaining <= 0) {
      setPhase("input");
      try { if (navigator.vibrate) navigator.vibrate([180, 80, 180]); } catch (e) { /* API indisponible (iOS Safari notamment) */ }
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.16, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(); osc.stop(ctx.currentTime + 0.35);
      } catch (e) { /* audio indisponible */ }
      return;
    }
    const t = setTimeout(() => setRestRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, restRemaining]);

  const validate = () => {
    if (weight === "" || reps === "") return;
    setSets(s => s.map((row, i) => i === activeIdx ? { weight, reps, done: true } : row));
    if (profileId && sessionKey) {
      logExerciseSet(profileId, sessionKey, exercise.name, activeIdx, Number(weight) || null, reps).catch(() => {});
    }
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

  const skipRest = () => setPhase("input");

  const undoLastSet = () => {
    const prevIdx = activeIdx - 1;
    if (prevIdx < 0) return;
    const prevSet = sets[prevIdx];
    setSets(s => s.map((row, i) => i === prevIdx ? { weight: "", reps: "", done: false } : row));
    setActiveIdx(prevIdx);
    setWeight(String(prevSet.weight ?? "")); setReps(String(prevSet.reps ?? ""));
    setPhase("input");
  };

  const restPct = ((exercise.rest - restRemaining) / exercise.rest) * 100;
  const lastTimeForSet = lastTime && lastTime[activeIdx];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: c.bg, backgroundImage: c.bgGrad, color: c.text, display: "flex", flexDirection: "column", padding: "calc(18px + max(env(safe-area-inset-top), 24px)) 20px calc(18px + env(safe-area-inset-bottom))" }} className="ff-body anim-fadeIn">
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
          {exercise.photoUrl && (
            <img src={exercise.photoUrl} alt={exercise.name} style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, display: "block" }} />
          )}
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
            <div style={{ fontSize: 13, color: c.muted, marginBottom: lastTimeForSet ? 10 : 28 }}>{exercise.sets} séries × {exercise.reps}</div>
            {lastTimeForSet && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: c.surface2, borderRadius: 999, padding: "6px 14px", marginBottom: 26 }}>
                <TrendingUp size={13} color={c.electric2} />
                <span style={{ fontSize: 12, color: c.muted }}>Dernière fois : <b style={{ color: c.text }} className="ff-mono">{lastTimeForSet.weight ?? "—"} kg × {lastTimeForSet.reps}</b></span>
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {sets.map((s, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: s.done ? c.success : i === activeIdx ? c.electric2 : c.surface2,
                  border: i === activeIdx && !s.done ? `2px solid ${c.electric2}` : "none"
                }} />
              ))}
            </div>
            {onSubstitute && (
              <button onClick={onSubstitute} style={{ background: "none", border: "none", color: c.muted, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, marginBottom: 26 }}>
                <RotateCcw size={12} /> Machine indisponible ? Remplacer cet exercice
              </button>
            )}
          </>
        )}

        {phase === "input" && (
          <div style={{ width: "100%", maxWidth: 340 }} className="anim-pop">
            <div className="ff-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: c.electric2 }}>Série {activeIdx + 1} sur {exercise.sets}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: c.muted, marginBottom: 8 }}>Charge (kg)</div>
                <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder={lastTimeForSet ? String(lastTimeForSet.weight ?? "0") : "0"} autoFocus
                  style={{ width: "100%", textAlign: "center", background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "18px 10px", color: c.text, fontSize: 26, fontWeight: 700, outline: "none" }} className="ff-mono" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: c.muted, marginBottom: 8 }}>{timeBased ? "Temps (sec)" : "Répétitions"}</div>
                <input type="number" inputMode="numeric" value={reps} onChange={e => setReps(e.target.value)} placeholder={lastTimeForSet ? String(lastTimeForSet.reps ?? "0") : "0"}
                  style={{ width: "100%", textAlign: "center", background: c.surface, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "18px 10px", color: c.text, fontSize: 26, fontWeight: 700, outline: "none" }} className="ff-mono" />
              </div>
            </div>
            <PrimaryBtn c={c} full icon={Check} disabled={weight === "" || reps === ""} onClick={validate} style={{ padding: "16px 20px", fontSize: 15 }}>
              Valider la série
            </PrimaryBtn>
          </div>
        )}

        {phase === "resting" && (
          <div className="anim-pop" style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Ring pct={restPct} size={220} stroke={14} c={c}>
              <div style={{ textAlign: "center" }}>
                <div className="ff-mono anim-softPulse" style={{ fontSize: 52, fontWeight: 700, color: c.text, lineHeight: 1 }}>{restRemaining}</div>
                <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>secondes</div>
              </div>
            </Ring>
            <div className="ff-display" style={{ fontSize: 17, fontWeight: 700, marginTop: 24, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <Timer size={16} color={c.electric2} /> Temps de repos
            </div>
            <div style={{ fontSize: 12.5, color: c.muted, marginTop: 6, marginBottom: 20, textAlign: "center" }}>Série {activeIdx + 1} débloquée automatiquement</div>
            <SecondaryBtn c={c} full icon={ChevronRight} onClick={skipRest}>Passer le repos</SecondaryBtn>
            <button onClick={undoLastSet} style={{ background: "none", border: "none", color: c.muted, fontSize: 11.5, cursor: "pointer", marginTop: 12, display: "flex", alignItems: "center", gap: 5, justifyContent: "center", width: "100%" }}>
              <RotateCcw size={12} /> Annuler la dernière série
            </button>
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

const FocusRunner = ({ c, exercises: initialExercises, startIndex, onMarkDone, onClose, profileId, sessionKey, onAllDone }) => {
  const [exercises, setExercises] = useState(initialExercises);
  const [reserve, setReserve] = useState([]);
  const [idx, setIdx] = useState(startIndex);
  const exercise = exercises[idx];

  const substitute = () => {
    const alt = findSubstitute(exercise, [...exercises, ...reserve]);
    if (!alt) return;
    setExercises(list => list.map((e, i) => (i === idx ? alt : e)));
    setReserve(r => [...r, exercise]);
  };

  const goNext = () => {
    if (idx + 1 < exercises.length) { setIdx(idx + 1); return; }
    if (reserve.length > 0) {
      setExercises(list => [...list, ...reserve]);
      setReserve([]);
      setIdx(idx + 1);
      return;
    }
    onAllDone();
    onClose();
  };

  const nextName = idx + 1 < exercises.length ? exercises[idx + 1].name : (reserve.length > 0 ? reserve[0].name : null);

  return (
    <FocusExercise key={`${idx}-${exercise.name}`} c={c} exercise={exercise} index={idx} total={exercises.length + reserve.length}
      nextName={nextName}
      onExerciseDone={() => onMarkDone(idx)}
      onContinue={goNext}
      onSubstitute={substitute}
      onExitFocus={onClose} profileId={profileId} sessionKey={sessionKey} />
  );
};

const SessionDetail = ({ c, session, onComplete, completed, profileId, sessionKey }) => {
  const [doneMap, setDoneMap] = useState({});
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusStart, setFocusStart] = useState(0);
  const [orderedMain, setOrderedMain] = useState(session.main);
  const startedAtRef = useRef(null);
  if (session.rest) return <RestDayScreen c={c} />;
  const totalExercises = session.warm.length + session.main.length + session.cool.length;
  const doneCount = Object.keys(doneMap).length;
  const allLogged = doneCount >= session.main.length;
  const markDone = (idx) => setDoneMap(m => ({ ...m, [idx]: true }));
  const moveExercise = (from, to) => setOrderedMain(list => {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });
  const finishSession = () => {
    if (completed) return;
    const elapsed = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000)) : null;
    onComplete(elapsed);
  };

  return (
    <div style={{ padding: "18px 18px 110px" }} className="anim-fadeIn">
      <div style={{ background: c.gradB, borderRadius: 20, padding: 20, marginBottom: 18 }}>
        <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{session.title}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 12.5 }}><Clock size={14} /> ~{session.estTotal} min estimé</div>
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
        Chaque exercice s'ouvre en plein écran, un à la fois, avec un temps de repos entre les séries (possibilité de le passer).
      </p>
      <PrimaryBtn c={c} full icon={Play} style={{ marginBottom: 12 }} onClick={() => {
        const firstIncomplete = orderedMain.findIndex((_, i) => !doneMap[i]);
        setFocusStart(firstIncomplete === -1 ? 0 : firstIncomplete);
        setFocusOpen(true);
        if (!startedAtRef.current) startedAtRef.current = Date.now();
      }}>
        {doneCount === 0 ? "Démarrer les exercices" : doneCount < session.main.length ? `Reprendre (${doneCount}/${session.main.length})` : "Revoir les exercices"}
      </PrimaryBtn>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {orderedMain.map((e, i) => (
          <Card key={e.name} c={c} onClick={() => { setFocusStart(i); setFocusOpen(true); if (!startedAtRef.current) startedAtRef.current = Date.now(); }} style={{ padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
            {doneCount === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }} onClick={e2 => e2.stopPropagation()}>
                <button onClick={() => i > 0 && moveExercise(i, i - 1)} disabled={i === 0} style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", color: i === 0 ? c.border : c.muted, padding: 0, lineHeight: 0 }}><ChevronUp size={14} /></button>
                <button onClick={() => i < orderedMain.length - 1 && moveExercise(i, i + 1)} disabled={i === orderedMain.length - 1} style={{ background: "none", border: "none", cursor: i === orderedMain.length - 1 ? "default" : "pointer", color: i === orderedMain.length - 1 ? c.border : c.muted, padding: 0, lineHeight: 0 }}><ChevronDown size={14} /></button>
              </div>
            )}
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
        <FocusRunner c={c} exercises={orderedMain} startIndex={focusStart}
          onMarkDone={(i) => markDone(i)} onClose={() => setFocusOpen(false)} onAllDone={finishSession} profileId={profileId} sessionKey={sessionKey} />
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
        <PrimaryBtn c={c} full icon={completed ? CheckCircle2 : Play} onClick={finishSession} disabled={!allLogged && !completed}
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
function fmtRelativeDay(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((new Date(now).setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

const Calendar = ({ c, completedSessions }) => {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const cells = [...Array(startOffset)].map(() => null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

  const entries = Object.values(completedSessions).filter(e => e && e.completedAt);
  const history = computeCalendarHistory(completedSessions, year, month);
  const sessionsThisMonth = entries.filter(e => { const d = new Date(e.completedAt); return d.getFullYear() === year && d.getMonth() === month; }).length;

  const weekOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - weekOffset);
  const sessionsThisWeek = entries.filter(e => { const d = new Date(e.completedAt); d.setHours(0, 0, 0, 0); return d >= monday; }).length;

  const recent = [...entries].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 8);
  const weeklyActivity = computeWeeklyActivity(completedSessions);

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <SectionTitle c={c}>Statistiques</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Card c={c}><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>{sessionsThisMonth}</div><div style={{ fontSize: 11.5, color: c.muted }}>Séances ce mois-ci</div></Card>
        <Card c={c}><div className="ff-mono" style={{ fontWeight: 700, fontSize: 20 }}>{sessionsThisWeek}</div><div style={{ fontSize: 11.5, color: c.muted }}>Séances cette semaine</div></Card>
      </div>

      <SectionTitle c={c}>Activité de la semaine</SectionTitle>
      <Card c={c} style={{ paddingTop: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyActivity}>
            <XAxis dataKey="d" tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v} séance${v > 1 ? "s" : ""}`, ""]} />
            <Bar dataKey="n" radius={[6, 6, 6, 6]} fill={c.electric} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

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
            const bg = state === "done" ? c.gradA : "transparent";
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
        </div>
      </Card>

      <SectionTitle c={c} action={null}>Historique récent</SectionTitle>
      {recent.length === 0 ? (
        <Card c={c} style={{ textAlign: "center", padding: 24, color: c.muted, fontSize: 12.5 }}>
          Aucune séance loggée pour l'instant — elle apparaîtra ici dès que vous en terminez une.
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recent.map((h, i) => (
            <Card c={c} key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={16} color={c.success} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title || "Séance"}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{fmtRelativeDay(h.completedAt)} · {h.minutes} min · {h.calories} kcal</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   NUTRITION
============================================================ */
const ProgressPhotos = ({ c, profileId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [pendingUrl, setPendingUrl] = useState("");
  const [error, setError] = useState("");
  const [zoomUrl, setZoomUrl] = useState(null);
  const fileInputRef = useRef(null);

  const load = () => {
    if (!profileId) { setLoading(false); return; }
    setLoading(true);
    listProgressPhotos(profileId).then(setPhotos).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [profileId]);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !profileId) return;
    setUploading(true); setError("");
    try {
      const url = await uploadProgressPhoto(file, profileId);
      setPendingUrl(url);
    } catch (err) { setError("Envoi impossible."); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!pendingUrl || !profileId) return;
    setUploading(true);
    try {
      await createProgressPhoto(profileId, pendingUrl, note.trim());
      setPendingUrl(""); setNote("");
      load();
    } catch (e) { setError("Enregistrement impossible."); }
    setUploading(false);
  };

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <SectionTitle c={c}>Envoyer une photo à votre coach</SectionTitle>
      <Card c={c} style={{ marginBottom: 20 }}>
        {pendingUrl ? (
          <div style={{ marginBottom: 12 }}>
            <img src={pendingUrl} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 12, display: "block" }} />
          </div>
        ) : (
          <button onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={uploading} style={{
            width: "100%", padding: "22px", borderRadius: 14, border: `1.5px dashed ${c.border}`, background: c.surface2,
            color: c.muted, fontSize: 12.5, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 12
          }}>
            <Camera size={22} color={c.electric2} />
            {uploading ? "Envoi..." : "Choisir une photo"}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note pour votre coach (optionnel) — ex : Semaine 3, -1kg"
          style={{ ...inputStyle(c), minHeight: 60, resize: "vertical", marginBottom: 12 }} />
        {error && <div style={{ fontSize: 12, color: c.danger, marginBottom: 10 }}>{error}</div>}
        <PrimaryBtn c={c} full icon={Check} disabled={!pendingUrl || uploading} onClick={submit}>
          {uploading ? "Envoi..." : "Envoyer au coach"}
        </PrimaryBtn>
      </Card>

      <SectionTitle c={c}>Historique</SectionTitle>
      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: c.muted, fontSize: 12.5 }}>Chargement...</div>
      ) : photos.length === 0 ? (
        <Card c={c} style={{ textAlign: "center", padding: 24, color: c.muted, fontSize: 12.5 }}>
          Aucune photo envoyée pour l'instant.
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {photos.map(p => (
            <Card c={c} key={p.id} style={{ padding: 14 }}>
              <img src={p.photoUrl} alt="" onClick={() => setZoomUrl(p.photoUrl)} style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 12, display: "block", marginBottom: 10, cursor: "pointer" }} />
              <div style={{ fontSize: 11, color: c.muted, marginBottom: p.note ? 6 : 0 }}>
                {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
              {p.note && <p style={{ fontSize: 13, margin: "0 0 10px" }}>{p.note}</p>}
              {p.coachReply && (
                <div style={{ background: "rgba(0,113,227,0.08)", borderRadius: 12, padding: 12, marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <UserCog size={12} color={c.electric2} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: c.electric2, textTransform: "uppercase" }}>Réponse du coach</span>
                  </div>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{p.coachReply}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      {zoomUrl && <PhotoViewer url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </div>
  );
};

const Nutrition = ({ c, profile, water, setWater }) => {
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [age, setAge] = useState(profile.age || 28);
  const [activity, setActivity] = useState(1.55);
  const [gender, setGender] = useState(profile.gender === "femme" ? "f" : "h");

  const bmr = gender === "h"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * activity);
  const supplements = getSupplementSuggestions(profile.goal);

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

      <SectionTitle c={c}>Compléments suggérés pour votre objectif</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {supplements.map((s, i) => (
          <Card c={c} key={i} style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(0,113,227,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={13} color={c.electric2} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</span>
            </div>
            <p style={{ fontSize: 12, color: c.muted, margin: "0 0 0 34px", lineHeight: 1.5 }}>{s.why}</p>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, background: "rgba(255,159,10,0.1)", borderRadius: 12, padding: 12, marginBottom: 20 }}>
        <AlertTriangle size={15} color={c.warning} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: c.muted, margin: 0, lineHeight: 1.5 }}>
          Information générale à visée éducative, pas un avis médical personnalisé. Demandez conseil à un médecin ou un·e diététicien·ne avant de démarrer une complémentation, en particulier en cas de traitement médical, de grossesse ou d'allaitement.
        </p>
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
const SubscriptionSection = ({ c, status }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const active = status === "active";

  const goCheckout = async () => {
    setLoading(true); setError("");
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch (e) { setError(e && e.message ? e.message : "Impossible de démarrer le paiement."); setLoading(false); }
  };
  const goPortal = async () => {
    setLoading(true); setError("");
    try {
      const url = await createBillingPortalSession();
      window.location.href = url;
    } catch (e) { setError(e && e.message ? e.message : "Impossible d'ouvrir le portail."); setLoading(false); }
  };

  return (
    <>
      <SectionTitle c={c}>Abonnement</SectionTitle>
      <Card c={c} style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Pill c={c} tone={active ? "success" : "warning"}>{active ? "Actif" : status === "past_due" ? "Paiement en retard" : status === "canceled" ? "Résilié" : "Inactif"}</Pill>
        </div>
        {error && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10, marginBottom: 10 }}>{error}</div>}
        {active ? (
          <SecondaryBtn c={c} full icon={UserCog} onClick={goPortal} disabled={loading}>{loading ? "Ouverture..." : "Gérer mon abonnement"}</SecondaryBtn>
        ) : (
          <PrimaryBtn c={c} full icon={Zap} onClick={goCheckout} disabled={loading}>{loading ? "Redirection..." : "S'abonner"}</PrimaryBtn>
        )}
      </Card>
    </>
  );
};


const Profile = ({ c, state, dark, setDark, accountEmail, profileId, onWeightLogged, onAvatarChanged, completedSessions }) => {
  const { name, weight, height, goal, level, xp, sportLevel, avatarUrl, sessionsCompleted, totalMinutes, calories } = state;
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logVal, setLogVal] = useState(weight);
  const [logging, setLogging] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const profileDaysUntilExpiry = state.accessExpiresAt ? Math.ceil((new Date(state.accessExpiresAt) - new Date()) / 86400000) : null;
  const profileExpirySoon = profileDaysUntilExpiry !== null && profileDaysUntilExpiry >= 0 && profileDaysUntilExpiry <= 7;
  const weeklyPoints = computeWeeklyPoints(completedSessions || {});

  useEffect(() => {
    if (!profileId) { setLoadingLogs(false); return; }
    listWeightLogs(profileId).then(setLogs).catch(() => {}).finally(() => setLoadingLogs(false));
  }, [profileId]);

  const chartData = logs.map(l => ({
    s: new Date(l.loggedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    kg: l.weight,
  }));

  const submitLog = async () => {
    if (!profileId || logVal === "" || isNaN(Number(logVal))) return;
    setLogging(true);
    try {
      await logWeight(profileId, Number(logVal));
      setLogs(ls => [...ls, { weight: Number(logVal), loggedAt: new Date().toISOString() }]);
      onWeightLogged(Number(logVal));
      setShowLogForm(false);
    } catch (e) { /* réessaiera manuellement */ }
    setLogging(false);
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !profileId) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file, profileId);
      await updateAvatarUrl(profileId, url);
      onAvatarChanged(url);
    } catch (err) { /* réessaiera */ }
    setAvatarUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const streakInfo = computeRealStreak(completedSessions || {}, state.streakFreezeUsedAt);
  const badgesUnlocked = BADGES.map(b => ({
    ...b,
    unlocked: (b.type === "sessions" && state.sessionsCompleted >= b.target) ||
      (b.type === "streak" && streakInfo.streak >= b.target) ||
      (b.type === "xp" && xp >= b.target)
  }));

  return (
    <div style={{ padding: "18px 18px 30px" }} className="anim-fadeIn">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 10px" }}>
          <Ring pct={((xp - xpForLevel(level - 1)) / (xpForLevel(level) - xpForLevel(level - 1))) * 100} size={88} stroke={5} c={c}>
            {avatarUrl ? (
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden" }}>
                <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ) : (
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24 }}>
                {name.charAt(0)}
              </div>
            )}
          </Ring>
          <button onClick={() => avatarInputRef.current && avatarInputRef.current.click()} disabled={avatarUploading} style={{
            position: "absolute", bottom: -2, right: -2, width: 30, height: 30, borderRadius: "50%", background: c.gradA,
            border: `2.5px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}>
            <Camera size={13} color="#fff" />
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: "none" }} />
        </div>
        <div className="ff-display" style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: c.muted }}>Niveau {level} · {sportLevel} · Objectif : {goal}</div>
        <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{accountEmail}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { icon: Check, v: sessionsCompleted, l: "Séances réalisées", tone: c.success },
          { icon: Clock, v: fmtMin(totalMinutes), l: "Temps total", tone: c.electric2 },
          { icon: Flame, v: calories.toLocaleString("fr-FR"), l: "Kcal brûlées", tone: c.warning },
          { icon: Trophy, v: BADGES.filter(b => (b.type === "sessions" && sessionsCompleted >= b.target) || (b.type === "streak" && computeRealStreak(completedSessions || {}, state.streakFreezeUsedAt).streak >= b.target) || (b.type === "xp" && xp >= b.target)).length + "/8", l: "Badges débloqués", tone: c.danger },
        ].map((s, i) => (
          <Card c={c} key={i} style={{ padding: 14 }}>
            <s.icon size={16} color={s.tone} style={{ marginBottom: 8 }} />
            <div className="ff-mono" style={{ fontWeight: 700, fontSize: 17 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card c={c} style={{ marginBottom: 18, background: c.gradB, border: "none", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Sparkles size={14} color="#fff" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 0.5 }}>Points de la semaine</span>
        </div>
        <div className="ff-mono" style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 10 }}>
          {weeklyPoints.xp.toLocaleString("fr-FR")} <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.75 }}>XP</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{weeklyPoints.sessions}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>séances</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{fmtMin(weeklyPoints.minutes)}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>temps total</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{weeklyPoints.calories.toLocaleString("fr-FR")}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>kcal</div>
          </div>
        </div>
      </Card>

      <SectionTitle c={c}>Informations</SectionTitle>
      <Card c={c} style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { l: "Taille", v: height + " cm" }, { l: "Poids", v: weight + " kg" },
            { l: "Âge", v: state.age ? state.age + " ans" : "—" }, { l: "Genre", v: state.gender === "femme" ? "Femme" : state.gender === "homme" ? "Homme" : "—" },
            { l: "Niveau sportif", v: sportLevel }, { l: "Objectif", v: goal },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 3 }}>{f.l}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{f.v}</div>
            </div>
          ))}
        </div>
        {state.injuries && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 11, color: c.muted, marginBottom: 4 }}>Blessures / limitations signalées</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{state.injuries}</div>
          </div>
        )}
      </Card>

      <SectionTitle c={c}>Abonnement</SectionTitle>
      <Card c={c} style={{
        marginBottom: 18, display: "flex", alignItems: "center", gap: 12,
        borderColor: profileExpirySoon ? c.warning : c.border
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: profileExpirySoon ? "rgba(255,159,10,0.15)" : "rgba(0,113,227,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Hourglass size={17} color={profileExpirySoon ? c.warning : c.electric2} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {state.accessExpiresAt
              ? `${profileExpirySoon ? "Expire bientôt" : "Valide"} jusqu'au ${new Date(state.accessExpiresAt).toLocaleDateString("fr-FR")}`
              : "Accès illimité"}
          </div>
          {profileExpirySoon && <div style={{ fontSize: 11, color: c.muted }}>Contactez votre coach pour renouveler.</div>}
        </div>
      </Card>

      <SectionTitle c={c} action={<button onClick={() => { setLogVal(weight); setShowLogForm(!showLogForm); }} style={{ background: "none", border: "none", color: c.electric2, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Plus size={13} /> Enregistrer</button>}>
        Évolution du poids
      </SectionTitle>
      {showLogForm && (
        <Card c={c} className="anim-fadeIn" style={{ marginBottom: 10, display: "flex", gap: 10, alignItems: "center", padding: 14 }}>
          <input type="number" value={logVal} onChange={e => setLogVal(e.target.value)} style={{ ...inputStyle(c), flex: 1 }} placeholder="Poids (kg)" />
          <PrimaryBtn c={c} icon={Check} disabled={logging} onClick={submitLog} style={{ padding: "11px 16px" }}>{logging ? "..." : "OK"}</PrimaryBtn>
        </Card>
      )}
      <Card c={c} style={{ marginBottom: 18, paddingTop: 16 }}>
        {loadingLogs ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: c.muted, fontSize: 12 }}>Chargement...</div>
        ) : chartData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: c.muted, fontSize: 12.5, lineHeight: 1.6 }}>
            Pas encore de données.<br />Enregistrez votre poids pour voir apparaître votre courbe de progression.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
              <XAxis dataKey="s" tick={{ fill: c.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="kg" stroke={c.electric2} strokeWidth={2.5} dot={{ r: 3, fill: c.electric2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card c={c} style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,159,10,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Flame size={19} color={c.warning} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{streakInfo.streak} jour{streakInfo.streak > 1 ? "s" : ""} de série</div>
          <div style={{ fontSize: 11, color: c.muted }}>{streakInfo.freezeAvailable ? "🧊 1 gel disponible ce mois-ci" : "Gel déjà utilisé ce mois-ci"}</div>
        </div>
      </Card>

      <SectionTitle c={c}>Progression par exercice</SectionTitle>
      <Card c={c} style={{ marginBottom: 18 }}>
        <ExerciseProgressChart c={c} profileId={profileId} />
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

      {SUBSCRIPTION_ENABLED && <SubscriptionSection c={c} status={state.subscriptionStatus} />}

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
const DayExercisePicker = ({ c, location, dayExercises, onAdd, onRemove, onUpdate, onMove }) => {
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
  const [cPhoto, setCPhoto] = useState("");
  const [cSaving, setCSaving] = useState(false);
  const [customLibrary, setCustomLibrary] = useState([]);

  useEffect(() => {
    listCustomExercises().then(setCustomLibrary).catch(() => {});
  }, []);

  const fullLibrary = [...EXERCISE_LIBRARY, ...customLibrary];
  const filtered = fullLibrary.filter(e =>
    (e.location === location || e.location === "both") &&
    (catFilter === "Tous" || e.cat === catFilter) &&
    (!search || e.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addCustom = async () => {
    if (!cName.trim() || cSaving) return;
    setCSaving(true);
    const fields = {
      name: cName.trim(), cat: cCat, location,
      sets: Number(cSets) || 3, reps: cReps.trim() || "12 reps", rest: Number(cRest) || 60,
      diff: cDiff, tips: cTips.trim(), safety: cSafety.trim(), equip: cEquip.trim() || undefined,
      videoUrl: cVideo.trim() || undefined, photoUrl: cPhoto || undefined,
    };
    try {
      const created = await createCustomExercise(fields);
      setCustomLibrary(lib => [created, ...lib]);
      onAdd(created);
    } catch (e) {
      // Le backend n'a pas pu sauvegarder l'exercice dans la bibliothèque partagée —
      // on l'ajoute quand même à cette séance pour ne pas bloquer le coach.
      onAdd({ id: `custom-${Date.now()}`, ...fields });
    }
    setCName(""); setCTips(""); setCSafety(""); setCEquip(""); setCVideo(""); setCPhoto(""); setCSets(3); setCReps("12 reps"); setCRest(60);
    setShowCustom(false);
    setCSaving(false);
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
            <CustomSelect c={c} value={cCat} onChange={setCCat} style={{ padding: "8px 10px", fontSize: 12 }}
              options={EXERCISE_CATEGORIES.map(cat => ({ value: cat, label: cat }))} />
            <CustomSelect c={c} value={cDiff} onChange={setCDiff} style={{ padding: "8px 10px", fontSize: 12 }}
              options={[{ value: "Facile", label: "Facile" }, { value: "Modéré", label: "Modéré" }, { value: "Difficile", label: "Difficile" }]} />
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
          <PhotoUploadField c={c} value={cPhoto} onChange={setCPhoto} />
          <PrimaryBtn c={c} full icon={Plus} disabled={!cName.trim() || cSaving} onClick={addCustom} style={{ padding: "9px 14px" }}>{cSaving ? "Enregistrement..." : "Ajouter à la séance"}</PrimaryBtn>
        </div>
      )}

      <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {filtered.length === 0 && <div style={{ fontSize: 12, color: c.muted, textAlign: "center", padding: 12 }}>Aucun exercice trouvé.</div>}
        {filtered.map(libEx => (
          <div key={libEx.id} style={{ display: "flex", alignItems: "center", gap: 8, background: c.surface, borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {libEx.name}
                {typeof libEx.id === "string" && libEx.id.startsWith("custom-") && <Pill c={c} tone="electric">Perso</Pill>}
              </div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                <button onClick={() => idx > 0 && onMove(idx, idx - 1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? c.border : c.muted, padding: 0, lineHeight: 0 }}><ChevronUp size={14} /></button>
                <button onClick={() => idx < dayExercises.length - 1 && onMove(idx, idx + 1)} disabled={idx === dayExercises.length - 1} style={{ background: "none", border: "none", cursor: idx === dayExercises.length - 1 ? "default" : "pointer", color: idx === dayExercises.length - 1 ? c.border : c.muted, padding: 0, lineHeight: 0 }}><ChevronDown size={14} /></button>
              </div>
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
            <div style={{ marginTop: 8 }}>
              <PhotoUploadField c={c} value={e.photoUrl || ""} onChange={(url) => onUpdate(idx, "photoUrl", url)} label="Photo de l'exercice (optionnel)" />
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
  const [aiApiKey, setAiApiKey] = useState(getStoredApiKey());
  const [showAiKeyForm, setShowAiKeyForm] = useState(false);
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");
  const [showAiSection, setShowAiSection] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState(null);
  const [appliedFixIds, setAppliedFixIds] = useState(new Set());
  const [daysBeforeFixes, setDaysBeforeFixes] = useState(null);
  const [analysisView, setAnalysisView] = useState("summary");

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
  const moveExercise = (i, fromIdx, toIdx) => setDays(ds => ds.map((d, di) => {
    if (di !== i) return d;
    const next = [...d.exercises];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    return { ...d, exercises: next };
  }));

  const totalSessions = days.filter(d => !d.rest && d.exercises.length > 0).length;

  const buildProgramData = () => ({
    name, cat: "Sur-mesure", level, weeks: Number(weeks) || 8, location, desc,
    goals: goals.split(",").map(g => g.trim()).filter(Boolean),
    cycle: days.map(d => (d.rest || d.exercises.length === 0) ? "repos" : "custom"),
    customSessions: days, custom: true,
  });

  const applyFix = (fix) => {
    if (!daysBeforeFixes) setDaysBeforeFixes(days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) })));
    if (fix.type === "add") addExercise(fix.dayIndex, fix.exercise);
    else if (fix.type === "removeDuplicate") removeExercise(fix.dayIndex, fix.exerciseIndex);
    setAppliedFixIds(s => new Set([...s, fix.id]));
  };

  const undoFixes = () => {
    if (!daysBeforeFixes) return;
    setDays(daysBeforeFixes);
    setDaysBeforeFixes(null);
    setAppliedFixIds(new Set());
    setLocalAnalysis(null);
  };

  const runAiAnalysis = async () => {
    setAiError(""); setAiResult(""); setAiAnalyzing(true);
    try {
      const result = await analyzeProgramWithAI(buildProgramData(), aiApiKey);
      setAiResult(result);
    } catch (e) {
      setAiError(e && e.message ? e.message : "Analyse impossible.");
    }
    setAiAnalyzing(false);
  };

  const saveAiKey = () => {
    if (!aiKeyInput.trim()) return;
    storeApiKey(aiKeyInput.trim());
    setAiApiKey(aiKeyInput.trim());
    setShowAiKeyForm(false);
    setAiKeyInput("");
  };

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
            <CustomSelect c={c} value="" placeholder="Copier depuis un autre client..." style={{ padding: "8px 10px", fontSize: 12 }}
              onChange={(v) => { const src = otherClients.find(o => o.id === v); if (src && src.customProgram) loadProgramData(src.customProgram); }}
              options={otherClients.map(o => ({ value: o.id, label: `${o.name} — ${o.customProgram.name}` }))} />
          )}
          {templates.length > 0 && (
            <CustomSelect c={c} value="" placeholder="Charger un modèle enregistré..." style={{ padding: "8px 10px", fontSize: 12 }}
              onChange={(v) => { const t = templates.find(t => t.id === v); if (t) loadProgramData(t.data); }}
              options={templates.map(t => ({ value: t.id, label: t.name }))} />
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div><div style={labelStyle(c)}>Nom du programme</div><input style={inputStyle(c)} value={name} onChange={e => setName(e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={labelStyle(c)}>Lieu</div>
            <CustomSelect c={c} value={location} onChange={setLocation} options={[{ value: "gym", label: "Salle de sport" }, { value: "home", label: "Maison" }]} />
          </div>
          <div>
            <div style={labelStyle(c)}>Niveau</div>
            <CustomSelect c={c} value={level} onChange={setLevel} options={[{ value: "Débutant", label: "Débutant" }, { value: "Intermédiaire", label: "Intermédiaire" }, { value: "Avancé", label: "Avancé" }]} />
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
                  onUpdate={(exIdx, field, val) => updateExercise(i, exIdx, field, val)}
                  onMove={(fromIdx, toIdx) => moveExercise(i, fromIdx, toIdx)} />
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

        <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={15} color={c.electric2} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Analyse du programme (gratuite)</span>
          </div>
          <PrimaryBtn c={c} full icon={Sparkles} disabled={totalSessions === 0} onClick={() => { setLocalAnalysis(analyzeProgramLocally(buildProgramData(), client)); setAppliedFixIds(new Set()); }} style={{ marginBottom: daysBeforeFixes ? 8 : (localAnalysis ? 12 : 0) }}>
            Analyser ce programme
          </PrimaryBtn>

          {daysBeforeFixes && (
            <SecondaryBtn c={c} full icon={RotateCcw} onClick={undoFixes} style={{ marginBottom: 12, color: c.danger }}>
              Annuler les modifications appliquées
            </SecondaryBtn>
          )}

          {localAnalysis && (
            <Card c={c} style={{ marginBottom: 12, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <Ring pct={localAnalysis.score * 10} size={64} stroke={6} c={c}
                  colorFrom={localAnalysis.score >= 7.5 ? c.success : localAnalysis.score >= 5 ? c.warning : c.danger}
                  colorTo={localAnalysis.score >= 7.5 ? c.success : localAnalysis.score >= 5 ? c.warning : c.danger}>
                  <span className="ff-mono" style={{ fontWeight: 700, fontSize: 17 }}>{localAnalysis.score}</span>
                </Ring>
                <div>
                  <div className="ff-display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Note globale sur 10</div>
                  <div style={{ fontSize: 11.5, color: c.muted }}>{localAnalysis.daysTrained} jour{localAnalysis.daysTrained > 1 ? "s" : ""} d'entraînement · {localAnalysis.restDays} de repos</div>
                </div>
              </div>

              <div className="scrollbar-none" style={{ display: "flex", gap: 6, marginBottom: 16, background: c.surface2, padding: 3, borderRadius: 10, overflowX: "auto" }}>
                {[
                  { id: "summary", l: "Résumé" },
                  { id: "muscles", l: "Muscles" },
                  ...(localAnalysis.fixes.filter(f => !appliedFixIds.has(f.id)).length > 0 ? [{ id: "fixes", l: `Suggestions (${localAnalysis.fixes.filter(f => !appliedFixIds.has(f.id)).length})` }] : []),
                ].map(t => (
                  <button key={t.id} onClick={() => setAnalysisView(t.id)} style={{
                    flexShrink: 0, padding: "7px 13px", borderRadius: 7, border: "none", cursor: "pointer",
                    background: analysisView === t.id ? c.gradA : "transparent", color: analysisView === t.id ? "#fff" : c.muted, fontWeight: 700, fontSize: 11.5
                  }}>{t.l}</button>
                ))}
              </div>

              {analysisView === "fixes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {localAnalysis.fixes.filter(f => !appliedFixIds.has(f.id)).map(fix => (
                    <div key={fix.id} style={{ display: "flex", alignItems: "center", gap: 10, background: c.surface2, borderRadius: 12, padding: 12 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,159,10,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Plus size={13} color={c.warning} />
                      </div>
                      <span style={{ flex: 1, fontSize: 11.5, lineHeight: 1.4 }}>{fix.label}</span>
                      <SecondaryBtn c={c} icon={Check} onClick={() => applyFix(fix)} style={{ padding: "6px 12px", fontSize: 11 }}>Appliquer</SecondaryBtn>
                    </div>
                  ))}
                  <p style={{ fontSize: 10.5, color: c.muted, margin: "2px 0 0", lineHeight: 1.4 }}>Après application, relance l'analyse pour vérifier l'effet sur la note.</p>
                </div>
              )}

              {analysisView === "muscles" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Volume hebdomadaire</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    {localAnalysis.muscleBreakdown.map(m => (
                      <div key={m.cat}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: m.sets === 0 ? c.muted : c.text, fontWeight: m.sets === 0 ? 400 : 600 }}>{m.cat}</span>
                          <span className="ff-mono" style={{ fontSize: 11, color: c.muted }}>{m.sets === 0 ? "non travaillé" : `${m.sets} séries`}</span>
                        </div>
                        <div style={{ height: 7, background: c.surface2, borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.max(m.pct, m.sets > 0 ? 4 : 0)}%`, background: m.sets === 0 ? "transparent" : c.gradA, borderRadius: 4, transition: "width .3s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {localAnalysis.subMuscleDetail.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Détail anatomique</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {localAnalysis.subMuscleDetail.map(group => (
                          <div key={group.cat} style={{ background: c.surface2, borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>{group.cat}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {group.subMuscles.map(sm => (
                                <div key={sm.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {sm.covered
                                    ? <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(48,209,88,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckCircle2 size={11} color={c.success} /></div>
                                    : <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={10} color={c.muted} /></div>}
                                  <span style={{ fontSize: 11.5, color: sm.covered ? c.text : c.muted }}>{sm.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {analysisView === "summary" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.success, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Points forts</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {localAnalysis.strengths.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, lineHeight: 1.5, background: "rgba(48,209,88,0.08)", borderRadius: 10, padding: 10 }}>
                        <CheckCircle2 size={14} color={c.success} style={{ flexShrink: 0, marginTop: 1 }} /><span>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: c.warning, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Points faibles / risques</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {localAnalysis.weaknesses.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, lineHeight: 1.5, background: "rgba(255,159,10,0.08)", borderRadius: 10, padding: 10 }}>
                        <AlertTriangle size={14} color={c.warning} style={{ flexShrink: 0, marginTop: 1 }} /><span>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Recommandations</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {localAnalysis.recommendations.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, lineHeight: 1.5, background: "rgba(0,113,227,0.08)", borderRadius: 10, padding: 10 }}>
                        <TrendingUp size={14} color={c.electric2} style={{ flexShrink: 0, marginTop: 1 }} /><span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <button onClick={() => setShowAiSection(!showAiSection)} style={{ background: "none", border: "none", color: c.muted, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, marginBottom: showAiSection ? 10 : 0 }}>
            <ChevronDown size={13} style={{ transform: showAiSection ? "rotate(180deg)" : "none" }} /> Analyse IA avancée (optionnel, nécessite ta propre clé API)
          </button>

          {showAiSection && (
            !aiApiKey ? (
              showAiKeyForm ? (
                <div style={{ background: c.surface2, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11.5, color: c.muted, margin: 0, lineHeight: 1.5 }}>
                    Colle ta clé API Anthropic (créée sur <span style={{ color: c.electric2 }}>console.anthropic.com</span>). Elle reste uniquement sur cet appareil — jamais envoyée à N2Koaching ni à Supabase — et les appels sont facturés sur ton propre compte Anthropic.
                  </p>
                  <input type="password" value={aiKeyInput} onChange={e => setAiKeyInput(e.target.value)} placeholder="sk-ant-..." style={{ ...inputStyle(c), fontSize: 12.5 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <SecondaryBtn c={c} full onClick={() => setShowAiKeyForm(false)}>Annuler</SecondaryBtn>
                    <PrimaryBtn c={c} full disabled={!aiKeyInput.trim()} onClick={saveAiKey}>Enregistrer</PrimaryBtn>
                  </div>
                </div>
              ) : (
                <SecondaryBtn c={c} full icon={Sparkles} onClick={() => setShowAiKeyForm(true)}>Configurer l'analyse IA</SecondaryBtn>
              )
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: aiResult || aiError ? 12 : 0 }}>
                  <PrimaryBtn c={c} full icon={Sparkles} disabled={aiAnalyzing || totalSessions === 0} onClick={runAiAnalysis}>
                    {aiAnalyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
                  </PrimaryBtn>
                  <SecondaryBtn c={c} icon={X} onClick={() => { clearApiKey(); setAiApiKey(""); setAiResult(""); setAiError(""); }} />
                </div>
                {aiError && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10 }}>{aiError}</div>}
                {aiResult && (
                  <div style={{ background: c.surface2, borderRadius: 12, padding: 14, fontSize: 12.5, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto" }}>
                    {aiResult.split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 === 1 ? <b key={i} style={{ color: c.electric2 }}>{part}</b> : part)}
                  </div>
                )}
              </>
            )
          )}
        </div>

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

const ExerciseProgressChart = ({ c, profileId }) => {
  const [names, setNames] = useState([]);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingNames, setLoadingNames] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!profileId) { setLoadingNames(false); return; }
    listLoggedExerciseNames(profileId).then(ns => {
      setNames(ns);
      if (ns.length > 0) setSelected(ns[0]);
    }).catch(() => {}).finally(() => setLoadingNames(false));
  }, [profileId]);

  useEffect(() => {
    if (!selected || !profileId) return;
    setLoadingHistory(true);
    getExerciseHistory(profileId, selected).then(setHistory).catch(() => setHistory([])).finally(() => setLoadingHistory(false));
  }, [selected, profileId]);

  const chartData = useMemo(() => {
    const byDate = {};
    history.forEach(h => {
      if (h.weight == null) return;
      const day = new Date(h.loggedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      if (!byDate[day] || h.weight > byDate[day].weight) byDate[day] = { day, weight: h.weight, reps: h.reps, ts: h.loggedAt };
    });
    return Object.values(byDate).sort((a, b) => new Date(a.ts) - new Date(b.ts));
  }, [history]);

  const best = chartData.length ? Math.max(...chartData.map(d => d.weight)) : null;
  const lastPoint = chartData[chartData.length - 1];
  const lastReps = lastPoint ? Number(String(lastPoint.reps).match(/\d+/)?.[0] || 0) : 0;
  const est1RM = lastPoint ? Math.round(lastPoint.weight * (1 + lastReps / 30)) : null;

  if (loadingNames) return <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Chargement...</div>;
  if (names.length === 0) return <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Aucun exercice loggé pour l'instant.</div>;

  return (
    <div>
      <CustomSelect c={c} value={selected} onChange={setSelected} style={{ marginBottom: 12, padding: "9px 10px", fontSize: 12.5 }}
        options={names.map(n => ({ value: n, label: n }))} />
      {loadingHistory ? (
        <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Chargement...</div>
      ) : chartData.length < 2 ? (
        <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12, lineHeight: 1.5 }}>Pas encore assez de séances loggées sur cet exercice pour tracer une courbe.</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: c.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12 }} formatter={(v, n, p) => [`${v} kg × ${p.payload.reps}`, ""]} />
              <Line type="monotone" dataKey="weight" stroke={c.electric2} strokeWidth={2.5} dot={{ r: 3, fill: c.electric2 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
            <div><div className="ff-mono" style={{ fontWeight: 700, fontSize: 15 }}>{best} kg</div><div style={{ fontSize: 10, color: c.muted }}>Meilleure charge</div></div>
            <div><div className="ff-mono" style={{ fontWeight: 700, fontSize: 15 }}>~{est1RM} kg</div><div style={{ fontSize: 10, color: c.muted }}>1RM estimé</div></div>
          </div>
        </>
      )}
    </div>
  );
};

const ClientDossierPanel = ({ c, client }) => {
  const assigned = resolveAssignedProgram(client);
  const streakInfo = computeRealStreak(client.completedSessions || {}, client.streakFreezeUsedAt);
  const row = (label, value) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${c.border}` }}>
      <span style={{ fontSize: 12, color: c.muted }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value ?? "—"}</span>
    </div>
  );

  return (
    <div style={{ maxHeight: 460, overflowY: "auto" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Informations personnelles</div>
      <div style={{ marginBottom: 16 }}>
        {row("Email", client.email)}
        {row("Âge", client.age ? `${client.age} ans` : null)}
        {row("Genre", client.gender === "femme" ? "Femme" : client.gender === "homme" ? "Homme" : null)}
        {row("Taille", client.height ? `${client.height} cm` : null)}
        {row("Poids actuel", client.weight ? `${client.weight} kg` : null)}
        {row("Objectif", client.goal)}
        {row("Niveau sportif", client.sportLevel)}
        {row("Fréquence visée", client.trainingFrequency ? `${client.trainingFrequency}x / semaine` : null)}
      </div>

      {client.injuries && (
        <>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: c.warning, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Blessures / limitations signalées</div>
          <div style={{ background: "rgba(255,159,10,0.1)", borderRadius: 10, padding: 10, fontSize: 12.5, marginBottom: 16, lineHeight: 1.5 }}>{client.injuries}</div>
        </>
      )}

      <div style={{ fontSize: 10.5, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Compte & abonnement</div>
      <div style={{ marginBottom: 16 }}>
        {row("Statut", client.status === "approved" ? "Actif" : client.status === "revoked" ? "Révoqué" : client.status)}
        {row("Inscrit depuis le", client.createdAt ? new Date(client.createdAt).toLocaleDateString("fr-FR") : null)}
        {row("Accès", client.accessExpiresAt ? new Date(client.accessExpiresAt).toLocaleDateString("fr-FR") : "Illimité")}
        {client.revokeReason && row("Motif de révocation", client.revokeReason)}
      </div>

      <div style={{ fontSize: 10.5, fontWeight: 700, color: c.electric2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Programme & progression</div>
      <div style={{ marginBottom: 4 }}>
        {row("Programme assigné", assigned ? assigned.name : "Aucun (bibliothèque libre)")}
        {row("Niveau", client.level)}
        {row("XP total", client.xp?.toLocaleString("fr-FR"))}
        {row("Série actuelle", `${streakInfo.streak} jour${streakInfo.streak > 1 ? "s" : ""}`)}
        {row("Séances complétées", client.sessionsCompleted)}
        {row("Temps total", fmtMin(client.totalMinutes || 0))}
        {row("Calories cumulées", client.calories?.toLocaleString("fr-FR"))}
      </div>
    </div>
  );
};

const ClientChargesPanel = ({ c, client }) => {
  const sessions = Object.entries(client.completedSessions || {})
    .filter(([, entry]) => entry && entry.completedAt)
    .map(([key, entry]) => ({ key, ...entry }))
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 15);

  const [expandedKey, setExpandedKey] = useState(null);
  const [logsCache, setLogsCache] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);
  const [mode, setMode] = useState("sessions");

  const toggle = async (key) => {
    if (expandedKey === key) { setExpandedKey(null); return; }
    setExpandedKey(key);
    if (!logsCache[key]) {
      setLoadingKey(key);
      try {
        const logs = await getSessionExerciseLogs(client.id, key);
        setLogsCache(c2 => ({ ...c2, [key]: logs }));
      } catch (e) { /* rien à afficher */ }
      setLoadingKey(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, background: c.surface, padding: 3, borderRadius: 10 }}>
        {[{ id: "sessions", l: "Par séance" }, { id: "exercise", l: "Par exercice" }].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            flex: 1, padding: "7px 0", borderRadius: 7, border: "none", cursor: "pointer",
            background: mode === m.id ? c.gradA : "transparent", color: mode === m.id ? "#fff" : c.muted, fontWeight: 700, fontSize: 11.5
          }}>{m.l}</button>
        ))}
      </div>

      {mode === "exercise" && <ExerciseProgressChart c={c} profileId={client.id} />}

      {mode === "sessions" && (
        sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Aucune séance loggée avec détail des charges pour l'instant.</div>
        ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
      {sessions.map(s => (
        <div key={s.key} style={{ background: c.surface, borderRadius: 12, overflow: "hidden" }}>
          <div onClick={() => toggle(s.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(0,113,227,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Dumbbell size={14} color={c.electric2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title || "Séance"}</div>
              <div style={{ fontSize: 10.5, color: c.muted }}>{new Date(s.completedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} · {s.minutes} min</div>
            </div>
            <ChevronRight size={15} color={c.muted} style={{ transform: expandedKey === s.key ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
          </div>
          {expandedKey === s.key && (
            <div style={{ padding: "0 12px 12px" }}>
              {loadingKey === s.key ? (
                <div style={{ textAlign: "center", padding: 10, color: c.muted, fontSize: 11.5 }}>Chargement...</div>
              ) : !logsCache[s.key] || Object.keys(logsCache[s.key]).length === 0 ? (
                <div style={{ textAlign: "center", padding: 10, color: c.muted, fontSize: 11.5 }}>Pas de détail de charges pour cette séance.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(logsCache[s.key]).map(([exerciseName, sets]) => (
                    <div key={exerciseName} style={{ background: c.surface2, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>{exerciseName}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {sets.sort((a, b) => a.setIndex - b.setIndex).map((set, i) => (
                          <span key={i} className="ff-mono" style={{ fontSize: 11, background: c.surface, borderRadius: 8, padding: "4px 8px", color: c.text }}>
                            {set.weight ?? "—"}kg × {set.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
        )
      )}
    </div>
  );
};

const ClientFeedbackPanel = ({ c, clientId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listSessionFeedback(clientId).then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Chargement...</div>;
  if (entries.length === 0) return <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Aucun ressenti envoyé par ce client pour l'instant.</div>;

  const recent = entries.slice(0, 5);
  const avgRpe = (recent.reduce((a, e) => a + e.rpe, 0) / recent.length).toFixed(1);
  const avgEnergy = (recent.reduce((a, e) => a + e.energy, 0) / recent.length).toFixed(1);
  const highFatigue = avgRpe >= 7.5 && avgEnergy <= 4.5;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ background: c.surface, borderRadius: 10, padding: 10, textAlign: "center" }}>
          <div className="ff-mono" style={{ fontWeight: 700, fontSize: 18 }}>{avgRpe}</div>
          <div style={{ fontSize: 9.5, color: c.muted }}>RPE moyen (5 dern.)</div>
        </div>
        <div style={{ background: c.surface, borderRadius: 10, padding: 10, textAlign: "center" }}>
          <div className="ff-mono" style={{ fontWeight: 700, fontSize: 18 }}>{avgEnergy}</div>
          <div style={{ fontSize: 9.5, color: c.muted }}>Énergie moyenne</div>
        </div>
      </div>
      {highFatigue && (
        <div style={{ display: "flex", gap: 8, background: "rgba(255,159,10,0.12)", borderRadius: 10, padding: 10, marginBottom: 10 }}>
          <AlertTriangle size={14} color={c.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11.5, color: c.text }}>Signes de fatigue élevée sur les dernières séances — RPE haut et énergie basse.</span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
        {entries.map(e => (
          <div key={e.id} style={{ background: c.surface, borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10.5, color: c.muted }}>{new Date(e.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
              <span className="ff-mono" style={{ fontSize: 11, color: c.text }}>RPE {e.rpe}/10 · Énergie {e.energy}/10</span>
            </div>
            {e.soreness && <div style={{ fontSize: 11, color: c.muted }}>Courbatures : {e.soreness}</div>}
            {e.comment && <p style={{ fontSize: 12, margin: "6px 0 0" }}>{e.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientPhotosPanel = ({ c, clientId, onZoom }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  const load = () => {
    setLoading(true);
    listProgressPhotos(clientId).then(ps => {
      setPhotos(ps);
      setReplyDrafts(d => {
        const next = { ...d };
        ps.forEach(p => { if (next[p.id] === undefined) next[p.id] = p.coachReply || ""; });
        return next;
      });
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [clientId]);

  const sendReply = async (photoId) => {
    setSaving(photoId);
    try {
      await replyToProgressPhoto(photoId, replyDrafts[photoId] || "");
      setPhotos(ps => ps.map(p => p.id === photoId ? { ...p, coachReply: replyDrafts[photoId] } : p));
    } catch (e) { /* réessaiera */ }
    setSaving(null);
  };

  if (loading) return <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Chargement...</div>;
  if (photos.length === 0) return <div style={{ textAlign: "center", padding: 20, color: c.muted, fontSize: 12 }}>Aucune photo envoyée par ce client.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
      {photos.map(p => (
        <div key={p.id} style={{ background: c.surface, borderRadius: 12, padding: 10 }}>
          <img src={p.photoUrl} alt="" onClick={() => onZoom(p.photoUrl)} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, display: "block", marginBottom: 8, cursor: "pointer" }} />
          <div style={{ fontSize: 10.5, color: c.muted, marginBottom: 4 }}>{new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>
          {p.note && <p style={{ fontSize: 12, margin: "0 0 8px" }}>{p.note}</p>}
          <textarea value={replyDrafts[p.id] || ""} onChange={e => setReplyDrafts(d => ({ ...d, [p.id]: e.target.value }))}
            placeholder="Répondre à cette photo..." style={{ ...inputStyle(c), minHeight: 50, resize: "vertical", fontSize: 12, marginBottom: 8 }} />
          <PrimaryBtn c={c} full icon={Send} disabled={saving === p.id} onClick={() => sendReply(p.id)} style={{ padding: "8px 14px", fontSize: 12 }}>
            {saving === p.id ? "Envoi..." : "Envoyer la réponse"}
          </PrimaryBtn>
        </div>
      ))}
    </div>
  );
};

const ClientDetailScreen = ({ c, client, onBack, onAssignLibrary, onSaveCustom, templates, otherClients, onSaveTemplate, onRevoke, onRestore, onRenew }) => {
  const [tab, setTab] = useState("dossier");
  const [zoomUrl, setZoomUrl] = useState(null);
  const [showRevokeForm, setShowRevokeForm] = useState(false);
  const [revokeReasonText, setRevokeReasonText] = useState("");
  const [showRenew, setShowRenew] = useState(false);
  const [renewDuration, setRenewDuration] = useState(30);

  const assigned = resolveAssignedProgram(client);
  const expired = client.status === "approved" && client.accessExpiresAt && new Date(client.accessExpiresAt) < new Date();

  const TABS = [
    { id: "dossier", l: "Dossier", icon: FileText },
    { id: "program", l: "Programme", icon: Edit3 },
    { id: "messages", l: "Messages", icon: MessageCircle },
    { id: "photos", l: "Photos", icon: Camera },
    { id: "feedback", l: "Ressenti", icon: Activity },
    { id: "charges", l: "Charges", icon: Dumbbell },
  ];

  return (
    <div className="anim-fadeIn">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, display: "flex", flexShrink: 0 }}><ArrowLeft size={20} /></button>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {client.name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
          <div style={{ fontSize: 11, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.email}</div>
        </div>
        {client.status === "approved" && !expired && <Pill c={c} tone="success">Actif</Pill>}
        {expired && <Pill c={c} tone="danger">Expiré</Pill>}
        {client.status === "revoked" && <Pill c={c} tone="danger">Révoqué</Pill>}
      </div>

      {client.status === "approved" && (
        <>
          <Card c={c} style={{ marginBottom: 14, padding: 12 }}>
            <div style={{ fontSize: 11.5, color: expired ? c.danger : c.muted, marginBottom: (expired || showRenew) ? 10 : 0 }}>
              {client.accessExpiresAt
                ? `${expired ? "Expiré le" : "Accès valide jusqu'au"} ${new Date(client.accessExpiresAt).toLocaleDateString("fr-FR")}`
                : "Accès illimité"}
              {!expired && (
                <button onClick={() => setShowRenew(!showRenew)} style={{ background: "none", border: "none", color: c.electric2, fontSize: 11, cursor: "pointer", marginLeft: 8, padding: 0 }}>Modifier</button>
              )}
            </div>
            {(expired || showRenew) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {DURATION_OPTIONS.map(opt => (
                    <button key={opt.label} onClick={() => setRenewDuration(opt.days)} style={{
                      padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${renewDuration === opt.days ? "transparent" : c.border}`,
                      background: renewDuration === opt.days ? c.gradA : c.surface2, color: renewDuration === opt.days ? "#fff" : c.muted
                    }}>{opt.label}</button>
                  ))}
                </div>
                <PrimaryBtn c={c} full icon={RefreshCw} onClick={() => { onRenew(client, renewDuration); setShowRenew(false); }}>Renouveler</PrimaryBtn>
              </div>
            )}
          </Card>

          <div className="scrollbar-none" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${tab === t.id ? "transparent" : c.border}`,
                background: tab === t.id ? c.gradA : c.surface2, color: tab === t.id ? "#fff" : c.muted
              }}><t.icon size={12} />{t.l}</button>
            ))}
          </div>

          {tab === "dossier" && <ClientDossierPanel c={c} client={client} />}

          {tab === "program" && (
            <div>
              <div style={{ fontSize: 11.5, color: c.muted, marginBottom: 8 }}>
                Programme actuel : <b style={{ color: c.text }}>{assigned ? assigned.name : "Aucun (bibliothèque libre)"}</b>
              </div>
              <div style={{ marginBottom: 14 }}>
                <CustomSelect c={c} value={client.assignedProgramId || ""} onChange={(v) => onAssignLibrary(client, v)} placeholder="— Assigner depuis la bibliothèque —"
                  options={PROGRAMS.map(p => ({ value: p.id, label: p.name }))} />
              </div>
              <ProgramBuilder c={c} client={client} onCancel={() => setTab("dossier")} onSave={(prog) => onSaveCustom(client, prog)}
                templates={templates} otherClients={otherClients} onSaveTemplate={onSaveTemplate} />
            </div>
          )}

          {tab === "messages" && (
            <div style={{ height: 420, background: c.surface2, borderRadius: 14, padding: 12 }}>
              <MessageThread c={c} clientId={client.id} isAdmin={true} peerName={client.name} />
            </div>
          )}

          {tab === "photos" && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12 }}>
              <ClientPhotosPanel c={c} clientId={client.id} onZoom={setZoomUrl} />
            </div>
          )}

          {tab === "feedback" && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12 }}>
              <ClientFeedbackPanel c={c} clientId={client.id} />
            </div>
          )}

          {tab === "charges" && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12 }}>
              <ClientChargesPanel c={c} client={client} />
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            {showRevokeForm ? (
              <Card c={c} style={{ background: "rgba(255,59,48,0.08)", border: `1px solid ${c.danger}`, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: c.danger }}>Révoquer l'accès de {client.name}</div>
                <textarea value={revokeReasonText} onChange={e => setRevokeReasonText(e.target.value)} placeholder="Motif visible par le client (optionnel)"
                  style={{ ...inputStyle(c), minHeight: 60, resize: "vertical", fontSize: 12.5 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <SecondaryBtn c={c} full onClick={() => { setShowRevokeForm(false); setRevokeReasonText(""); }}>Annuler</SecondaryBtn>
                  <PrimaryBtn c={c} full icon={Lock} style={{ background: c.danger }} onClick={() => { onRevoke(client, revokeReasonText.trim()); setShowRevokeForm(false); setRevokeReasonText(""); }}>Révoquer</PrimaryBtn>
                </div>
              </Card>
            ) : (
              <button onClick={() => setShowRevokeForm(true)} style={{ background: "none", border: "none", color: c.danger, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
                <Lock size={12} /> Révoquer l'accès
              </button>
            )}
          </div>
        </>
      )}

      {client.status === "revoked" && (
        <Card c={c}>
          {client.revokeReason && (
            <div style={{ background: c.surface2, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12, color: c.muted }}>
              <b style={{ color: c.text }}>Motif :</b> {client.revokeReason}
            </div>
          )}
          <SecondaryBtn c={c} full icon={ShieldCheck} onClick={() => onRestore(client)}>Réactiver l'accès</SecondaryBtn>
        </Card>
      )}

      {zoomUrl && <PhotoViewer url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </div>
  );
};

const DURATION_OPTIONS = [
  { label: "1 semaine", days: 7 },
  { label: "1 mois", days: 30 },
  { label: "3 mois", days: 90 },
  { label: "6 mois", days: 182 },
  { label: "1 an", days: 365 },
  { label: "Illimité", days: null },
];

const ClientListRow = ({ c, client, onOpen }) => {
  const expired = client.status === "approved" && client.accessExpiresAt && new Date(client.accessExpiresAt) < new Date();
  const realStreak = computeRealStreak(client.completedSessions || {}, client.streakFreezeUsedAt).streak;
  return (
    <Card c={c} onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
        {client.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
        <div style={{ fontSize: 11, color: c.muted }}>{realStreak > 0 ? `🔥 ${realStreak}j · ` : ""}Actif {fmtRelative(client.lastSessionAt)}</div>
      </div>
      {client.status === "approved" && !expired && <Pill c={c} tone="success">Actif</Pill>}
      {expired && <Pill c={c} tone="danger">Expiré</Pill>}
      {client.status === "revoked" && <Pill c={c} tone="danger">Révoqué</Pill>}
      <ChevronRight size={16} color={c.muted} style={{ flexShrink: 0 }} />
    </Card>
  );
};

const ClientRow = ({ c, client, onApprove, onReject, onAssignLibrary, onOpenBuilder, editing, onCloseBuilder, onSaveCustom, templates, otherClients, onSaveTemplate, onRevoke, onRestore, onRenew }) => {
  const assigned = resolveAssignedProgram(client);
  const [showChat, setShowChat] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCharges, setShowCharges] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [zoomUrl, setZoomUrl] = useState(null);
  const [showRevokeForm, setShowRevokeForm] = useState(false);
  const [revokeReasonText, setRevokeReasonText] = useState("");
  const [duration, setDuration] = useState(30);
  const [showRenew, setShowRenew] = useState(false);
  const [renewDuration, setRenewDuration] = useState(30);

  const expired = client.status === "approved" && client.accessExpiresAt && new Date(client.accessExpiresAt) < new Date();

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
        {client.status === "approved" && !expired && <Pill c={c} tone="success">Actif</Pill>}
        {expired && <Pill c={c} tone="danger">Expiré</Pill>}
        {client.status === "rejected" && <Pill c={c} tone="danger">Refusé</Pill>}
        {client.status === "revoked" && <Pill c={c} tone="danger">Révoqué</Pill>}
      </div>

      {client.status === "pending" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: c.muted, marginBottom: 6, fontWeight: 700 }}>Durée d'accès à accorder</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.label} onClick={() => setDuration(opt.days)} style={{
                padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${duration === opt.days ? "transparent" : c.border}`,
                background: duration === opt.days ? c.gradA : c.surface2, color: duration === opt.days ? "#fff" : c.muted
              }}>{opt.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SecondaryBtn c={c} full icon={XCircle} onClick={() => onReject(client)} style={{ color: c.danger }}>Refuser</SecondaryBtn>
            <PrimaryBtn c={c} full icon={ShieldCheck} onClick={() => onApprove(client, duration)}>Valider</PrimaryBtn>
          </div>
        </div>
      )}

      {client.status === "approved" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11.5, color: c.muted, marginBottom: 8 }}>
            Programme actuel : <b style={{ color: c.text }}>{assigned ? assigned.name : "Aucun (bibliothèque libre)"}</b>
          </div>
          <div style={{ fontSize: 11.5, color: expired ? c.danger : c.muted, marginBottom: 10 }}>
            {client.accessExpiresAt
              ? `${expired ? "Expiré le" : "Accès valide jusqu'au"} ${new Date(client.accessExpiresAt).toLocaleDateString("fr-FR")}`
              : "Accès illimité"}
          </div>

          {(expired || showRenew) ? (
            <div style={{ background: c.surface2, borderRadius: 12, padding: 10, marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>Renouveler pour :</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DURATION_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => setRenewDuration(opt.days)} style={{
                    padding: "6px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    border: `1px solid ${renewDuration === opt.days ? "transparent" : c.border}`,
                    background: renewDuration === opt.days ? c.gradA : c.surface, color: renewDuration === opt.days ? "#fff" : c.muted
                  }}>{opt.label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!expired && <SecondaryBtn c={c} full onClick={() => setShowRenew(false)}>Annuler</SecondaryBtn>}
                <PrimaryBtn c={c} full icon={RefreshCw} onClick={() => { onRenew(client, renewDuration); setShowRenew(false); }}>Renouveler</PrimaryBtn>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowRenew(true)} style={{ background: "none", border: "none", color: c.electric2, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0, marginBottom: 10 }}>
              <RefreshCw size={12} /> Modifier la durée d'accès
            </button>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: (editing || showChat || showPhotos || showFeedback || showCharges || showDossier) ? 12 : 8 }}>
            <div style={{ flex: 1 }}>
              <CustomSelect c={c} value={client.assignedProgramId || ""} onChange={(v) => onAssignLibrary(client, v)} placeholder="— Assigner depuis la bibliothèque —"
                options={PROGRAMS.map(p => ({ value: p.id, label: p.name }))} />
            </div>
            <SecondaryBtn c={c} icon={Edit3} onClick={() => { onOpenBuilder(client); setShowChat(false); setShowPhotos(false); setShowFeedback(false); setShowCharges(false); setShowDossier(false); }}>{editing ? "Fermer" : "Sur-mesure"}</SecondaryBtn>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: (editing || showChat || showPhotos || showFeedback || showCharges || showDossier) ? 12 : 8 }}>
            <SecondaryBtn c={c} full icon={FileText} onClick={() => { setShowDossier(!showDossier); setShowChat(false); setShowPhotos(false); setShowFeedback(false); setShowCharges(false); if (editing) onCloseBuilder(); }}>Dossier</SecondaryBtn>
            <SecondaryBtn c={c} icon={MessageCircle} onClick={() => { setShowChat(!showChat); setShowPhotos(false); setShowFeedback(false); setShowCharges(false); setShowDossier(false); if (editing) onCloseBuilder(); }} />
            <SecondaryBtn c={c} icon={Camera} onClick={() => { setShowPhotos(!showPhotos); setShowChat(false); setShowFeedback(false); setShowCharges(false); setShowDossier(false); if (editing) onCloseBuilder(); }} />
            <SecondaryBtn c={c} icon={Activity} onClick={() => { setShowFeedback(!showFeedback); setShowChat(false); setShowPhotos(false); setShowCharges(false); setShowDossier(false); if (editing) onCloseBuilder(); }} />
            <SecondaryBtn c={c} icon={Dumbbell} onClick={() => { setShowCharges(!showCharges); setShowChat(false); setShowPhotos(false); setShowFeedback(false); setShowDossier(false); if (editing) onCloseBuilder(); }} />
          </div>
          {editing && <ProgramBuilder c={c} client={client} onCancel={onCloseBuilder} onSave={(prog) => onSaveCustom(client, prog)}
            templates={templates} otherClients={otherClients} onSaveTemplate={onSaveTemplate} />}
          {showDossier && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12, marginBottom: 8 }}>
              <ClientDossierPanel c={c} client={client} />
            </div>
          )}
          {showChat && (
            <div style={{ height: 340, background: c.surface2, borderRadius: 14, padding: 12, marginBottom: 8 }}>
              <MessageThread c={c} clientId={client.id} isAdmin={true} peerName={client.name} />
            </div>
          )}
          {showPhotos && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12, marginBottom: 8 }}>
              <ClientPhotosPanel c={c} clientId={client.id} onZoom={setZoomUrl} />
            </div>
          )}
          {showFeedback && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12, marginBottom: 8 }}>
              <ClientFeedbackPanel c={c} clientId={client.id} />
            </div>
          )}
          {showCharges && (
            <div style={{ background: c.surface2, borderRadius: 14, padding: 12, marginBottom: 8 }}>
              <ClientChargesPanel c={c} client={client} />
            </div>
          )}

          {showRevokeForm ? (
            <div style={{ background: "rgba(255,59,48,0.08)", border: `1px solid ${c.danger}`, borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: c.danger }}>Révoquer l'accès de {client.name}</div>
              <textarea value={revokeReasonText} onChange={e => setRevokeReasonText(e.target.value)} placeholder="Motif visible par le client (optionnel)"
                style={{ ...inputStyle(c), minHeight: 60, resize: "vertical", fontSize: 12.5 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <SecondaryBtn c={c} full onClick={() => { setShowRevokeForm(false); setRevokeReasonText(""); }}>Annuler</SecondaryBtn>
                <PrimaryBtn c={c} full icon={Lock} style={{ background: c.danger }} onClick={() => { onRevoke(client, revokeReasonText.trim()); setShowRevokeForm(false); setRevokeReasonText(""); }}>Révoquer</PrimaryBtn>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowRevokeForm(true)} style={{ background: "none", border: "none", color: c.danger, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
              <Lock size={12} /> Révoquer l'accès
            </button>
          )}
        </div>
      )}

      {client.status === "revoked" && (
        <div style={{ marginTop: 12 }}>
          {client.revokeReason && (
            <div style={{ background: c.surface2, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12, color: c.muted }}>
              <b style={{ color: c.text }}>Motif :</b> {client.revokeReason}
            </div>
          )}
          <SecondaryBtn c={c} full icon={ShieldCheck} onClick={() => onRestore(client)}>Réactiver l'accès</SecondaryBtn>
        </div>
      )}
      {zoomUrl && <PhotoViewer url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </Card>
  );
};

const MultiClientCalendar = ({ c, clients }) => {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const cells = [...Array(startOffset)].map(() => null).concat([...Array(daysInMonth)].map((_, i) => i + 1));

  const dayClients = {};
  clients.forEach(cl => {
    Object.values(cl.completedSessions || {}).forEach(entry => {
      if (!entry || !entry.completedAt) return;
      const d = new Date(entry.completedAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!dayClients[day]) dayClients[day] = new Set();
        dayClients[day].add(cl.name);
      }
    });
  });

  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const selectedNames = dayClients[selectedDay] ? [...dayClients[selectedDay]] : [];

  return (
    <div>
      <SectionTitle c={c}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</SectionTitle>
      <Card c={c} style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10.5, color: c.muted, fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const count = dayClients[day] ? dayClients[day].size : 0;
            const isToday = day === now.getDate();
            const isSelected = day === selectedDay;
            return (
              <div key={i} onClick={() => setSelectedDay(day)} style={{
                aspectRatio: "1", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer",
                background: isSelected ? c.gradA : count > 0 ? "rgba(0,113,227,0.12)" : "transparent",
                border: isSelected ? "none" : isToday ? `1.5px solid ${c.electric2}` : count === 0 ? `1px solid ${c.border}` : "none",
              }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: isSelected ? "#fff" : c.text }}>{day}</span>
                {count > 0 && <span className="ff-mono" style={{ fontSize: 8.5, fontWeight: 700, color: isSelected ? "#fff" : c.electric2 }}>{count}</span>}
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle c={c}>{selectedDay} {monthName.split(" ")[0]} — {selectedNames.length} client{selectedNames.length !== 1 ? "s" : ""} actif{selectedNames.length !== 1 ? "s" : ""}</SectionTitle>
      {selectedNames.length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: c.muted, fontSize: 12.5 }}>Aucun client actif ce jour-là.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selectedNames.map(name => (
            <Card c={c} key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {name.charAt(0)}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
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

  const totalSessions = clients.reduce((sum, a) => sum + (a.sessionsCompleted || 0), 0);
  const totalCalories = clients.reduce((sum, a) => sum + (a.calories || 0), 0);
  const expiringSoon = clients.filter(a => {
    if (!a.accessExpiresAt) return false;
    const days = Math.ceil((new Date(a.accessExpiresAt) - new Date()) / 86400000);
    return days >= 0 && days <= 7;
  });

  // Activité hebdomadaire agrégée : sessions de tous les clients, par jour de la semaine
  const now = new Date();
  const offset = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - offset);
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  clients.forEach(a => {
    Object.values(a.completedSessions || {}).forEach(entry => {
      if (!entry || !entry.completedAt) return;
      const d = new Date(entry.completedAt); d.setHours(0, 0, 0, 0);
      const diff = Math.round((d.getTime() - monday.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) dayCounts[diff]++;
    });
  });
  const weeklyActivity = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => ({ d, n: dayCounts[i] }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          { icon: CheckCheck, v: today, l: "Loggé aujourd'hui", tone: c.success },
          { icon: AlertTriangle, v: inactive.length, l: "Inactifs 5j+", tone: c.danger },
          { icon: Flame, v: totalSessions.toLocaleString("fr-FR"), l: "Séances cumulées", tone: c.warning },
          { icon: Hourglass, v: expiringSoon.length, l: "Abonnements expirant <7j", tone: expiringSoon.length > 0 ? c.warning : c.muted },
        ].map((s, i) => (
          <Card c={c} key={i} style={{ padding: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(0,113,227,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <s.icon size={15} color={s.tone} />
            </div>
            <div className="ff-mono" style={{ fontWeight: 700, fontSize: 18 }}>{s.v}</div>
            <div style={{ fontSize: 10.5, color: c.muted, marginTop: 2 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <SectionTitle c={c}>Activité de la semaine (tous clients)</SectionTitle>
      <Card c={c} style={{ paddingTop: 16, marginBottom: 18 }}>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyActivity}>
            <XAxis dataKey="d" tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v} séance${v > 1 ? "s" : ""}`, ""]} />
            <Bar dataKey="n" radius={[6, 6, 6, 6]} fill={c.electric} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {expiringSoon.length > 0 && (
        <>
          <SectionTitle c={c}>Abonnements à renouveler bientôt</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {expiringSoon.map(a => (
              <Card c={c} key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderColor: c.warning }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {a.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600 }}>{a.name}</div>
                <Pill c={c} tone="warning">{new Date(a.accessExpiresAt).toLocaleDateString("fr-FR")}</Pill>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle c={c}>Activité par client</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(a => {
          const days = a.lastSessionAt ? Math.floor((Date.now() - new Date(a.lastSessionAt).getTime()) / 86400000) : null;
          const dropping = days === null || days >= 5;
          const realStreak = computeRealStreak(a.completedSessions || {}, a.streakFreezeUsedAt).streak;
          return (
            <Card c={c} key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.gradA, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {a.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{realStreak} jours de série · {a.sessionsCompleted} séances au total</div>
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

const AdminDrawer = ({ c, open, onClose, tab, setTab, pendingCount, clientsCount, onLogout }) => {
  const items = [
    { id: "overview", icon: LayoutDashboard, label: "Vue d'ensemble" },
    { id: "calendar", icon: CalendarIcon, label: "Calendrier" },
    { id: "pending", icon: ClipboardList, label: "À valider", badge: pendingCount },
    { id: "clients", icon: Users, label: "Clients", badge: clientsCount },
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
          <span className="ff-display" style={{ fontWeight: 700, fontSize: 17, color: c.text }}>Espace coach</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: c.muted }}><X size={18} /></button>
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
                {typeof it.badge === "number" && it.badge > 0 && (
                  <span className="ff-mono" style={{ marginLeft: "auto", background: active ? c.electric2 : c.surface2, color: active ? "#fff" : c.muted, fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>{it.badge}</span>
                )}
                {!it.badge && active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: c.electric2 }} />}
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

const AdminPanel = ({ c, onExit }) => {
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tabAdmin, setTabAdmin] = useState("overview");
  const [err, setErr] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [clientSort, setClientSort] = useState("recent");
  const [selectedClientId, setSelectedClientId] = useState(null);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const [accs, tpls] = await Promise.all([listAllProfiles(), listTemplates().catch(() => [])]);
      setAccounts(accs); setTemplates(tpls);
    } catch (e) { setErr(e.message || "Impossible de charger les comptes."); setAccounts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (client, durationDays) => {
    const accessExpiresAt = durationDays ? new Date(Date.now() + durationDays * 86400000).toISOString() : null;
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, status: "approved", accessExpiresAt } : a));
    try { await approveWithDuration(client.id, durationDays); } catch (e) { setErr(e.message); load(); }
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
  const revoke = async (client, reason) => {
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, status: "revoked", revokeReason: reason } : a));
    try { await revokeAccess(client.id, reason); } catch (e) { setErr(e.message); load(); }
  };
  const restore = async (client) => {
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, status: "approved", revokeReason: "" } : a));
    try { await restoreAccess(client.id); } catch (e) { setErr(e.message); load(); }
  };
  const renew = async (client, durationDays) => {
    const accessExpiresAt = durationDays ? new Date(Date.now() + durationDays * 86400000).toISOString() : null;
    setAccounts(prev => prev.map(a => a.id === client.id ? { ...a, status: "approved", accessExpiresAt, revokeReason: "" } : a));
    try { await renewAccess(client.id, durationDays); } catch (e) { setErr(e.message); load(); }
  };

  const pending = accounts.filter(a => a.status === "pending");
  const clients = accounts.filter(a => a.status !== "pending");
  const approvedClients = accounts.filter(a => a.status === "approved");

  const visibleClients = clients
    .filter(a => {
      if (clientFilter === "active") return a.status === "approved" && !(a.accessExpiresAt && new Date(a.accessExpiresAt) < new Date());
      if (clientFilter === "expired") return a.status === "approved" && a.accessExpiresAt && new Date(a.accessExpiresAt) < new Date();
      if (clientFilter === "revoked") return a.status === "revoked";
      return true;
    })
    .filter(a => !clientSearch.trim() || a.name.toLowerCase().includes(clientSearch.trim().toLowerCase()) || a.email.toLowerCase().includes(clientSearch.trim().toLowerCase()))
    .sort((a, b) => {
      if (clientSort === "name") return a.name.localeCompare(b.name);
      if (clientSort === "sessions") return (b.sessionsCompleted || 0) - (a.sessionsCompleted || 0);
      if (clientSort === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return new Date(b.lastSessionAt || 0) - new Date(a.lastSessionAt || 0); // recent (par défaut)
    });

  const sendBroadcast = async () => {
    if (!broadcastText.trim() || approvedClients.length === 0) return;
    setBroadcasting(true);
    try {
      await broadcastMessage(approvedClients.map(a => a.id), broadcastText.trim());
      setBroadcastDone(approvedClients.length);
      setBroadcastText("");
      setTimeout(() => { setShowBroadcast(false); setBroadcastDone(0); }, 1800);
    } catch (e) { setErr(e.message); }
    setBroadcasting(false);
  };

  return (
    <div className="ff-body scrollbar-none anim-fadeIn" style={{ minHeight: "100vh", background: c.bg, backgroundImage: c.bgGrad, color: c.text }}>
      <AdminDrawer c={c} open={drawerOpen} onClose={() => setDrawerOpen(false)} tab={tabAdmin} setTab={setTabAdmin}
        pendingCount={pending.length} clientsCount={clients.length} onLogout={onExit} />
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: c.bg + "ee", backdropFilter: "blur(10px)", borderBottom: `1px solid ${c.border}`, padding: "calc(16px + max(env(safe-area-inset-top), 24px)) 18px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, padding: 0, display: "flex" }}>
          <Menu size={22} />
        </button>
        <span className="ff-display" style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>
          {{ overview: "Vue d'ensemble", calendar: "Calendrier", pending: "À valider", clients: "Clients" }[tabAdmin]}
        </span>
        <IconBtn icon={RefreshCw} c={c} onClick={load} />
      </div>

      <div style={{ padding: 18 }}>
        <Card c={c} style={{ background: c.gradB, border: "none", marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, marginBottom: 2 }}>Bon retour,</div>
          <div className="ff-display" style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>coach 👋</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div>
              <div className="ff-mono" style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{clients.length}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>clients actifs</div>
            </div>
            <div>
              <div className="ff-mono" style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{pending.length}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>en attente</div>
            </div>
            <div>
              <div className="ff-mono" style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{approvedClients.filter(a => fmtRelative(a.lastSessionAt) === "Aujourd'hui").length}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>actifs aujourd'hui</div>
            </div>
          </div>
        </Card>

        {showBroadcast ? (
          <Card c={c} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Send size={15} color={c.electric2} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Message groupé — {approvedClients.length} client{approvedClients.length > 1 ? "s" : ""} actif{approvedClients.length > 1 ? "s" : ""}</span>
            </div>
            {broadcastDone > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: c.success, fontSize: 13, padding: "8px 0" }}>
                <CheckCircle2 size={16} /> Envoyé à {broadcastDone} client{broadcastDone > 1 ? "s" : ""} !
              </div>
            ) : (
              <>
                <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} placeholder="Ex : La salle sera fermée ce week-end, à lundi !"
                  style={{ ...inputStyle(c), minHeight: 80, resize: "vertical", marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <SecondaryBtn c={c} full onClick={() => { setShowBroadcast(false); setBroadcastText(""); }}>Annuler</SecondaryBtn>
                  <PrimaryBtn c={c} full icon={Send} disabled={!broadcastText.trim() || broadcasting || approvedClients.length === 0} onClick={sendBroadcast}>
                    {broadcasting ? "Envoi..." : "Envoyer à tous"}
                  </PrimaryBtn>
                </div>
              </>
            )}
          </Card>
        ) : (
          <SecondaryBtn c={c} full icon={Send} onClick={() => setShowBroadcast(true)} style={{ marginBottom: 16 }}>
            Message groupé à tous les clients
          </SecondaryBtn>
        )}
        {err && <div style={{ fontSize: 12, color: c.danger, background: "rgba(255,59,48,0.1)", padding: "10px 12px", borderRadius: 10, marginBottom: 14 }}>{err}</div>}

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
                  templates={templates} otherClients={[]} onSaveTemplate={handleSaveTemplate} onRevoke={revoke} onRestore={restore} onRenew={renew} />
              ))
            )}
            {tabAdmin === "clients" && (
              selectedClientId ? (
                (() => {
                  const client = accounts.find(a => a.id === selectedClientId);
                  if (!client) { setSelectedClientId(null); return null; }
                  return (
                    <ClientDetailScreen c={c} client={client} onBack={() => setSelectedClientId(null)}
                      onAssignLibrary={assignLibrary} onSaveCustom={saveCustom}
                      templates={templates} otherClients={approvedClients.filter(o => o.id !== client.id && o.customProgram)}
                      onSaveTemplate={handleSaveTemplate} onRevoke={revoke} onRestore={restore} onRenew={renew} />
                  );
                })()
              ) : (
                <>
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <Search size={15} color={c.muted} style={{ position: "absolute", left: 13, top: 12 }} />
                    <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Rechercher un client..."
                      style={{ ...inputStyle(c), paddingLeft: 36 }} />
                  </div>
                  <div className="scrollbar-none" style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
                    {[
                      { id: "all", l: "Tous" }, { id: "active", l: "Actifs" }, { id: "expired", l: "Expirés" }, { id: "revoked", l: "Révoqués" },
                    ].map(f => (
                      <button key={f.id} onClick={() => setClientFilter(f.id)} style={{
                        flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                        border: `1px solid ${clientFilter === f.id ? "transparent" : c.border}`,
                        background: clientFilter === f.id ? c.gradA : c.surface2, color: clientFilter === f.id ? "#fff" : c.muted
                      }}>{f.l}</button>
                    ))}
                  </div>
                  <CustomSelect c={c} value={clientSort} onChange={setClientSort} style={{ marginBottom: 14, padding: "9px 10px", fontSize: 12.5 }}
                    options={[
                      { value: "recent", label: "Trier : Activité récente" },
                      { value: "name", label: "Trier : Nom (A-Z)" },
                      { value: "sessions", label: "Trier : Nombre de séances" },
                      { value: "oldest", label: "Trier : Ancienneté (plus ancien)" },
                    ]} />

                  {visibleClients.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 30, color: c.muted, fontSize: 13 }}>
                      {clients.length === 0 ? "Aucun client validé pour le moment." : "Aucun client ne correspond à ces filtres."}
                    </div>
                  ) : visibleClients.map(client => (
                    <ClientListRow key={client.id} c={c} client={client} onOpen={() => setSelectedClientId(client.id)} />
                  ))}
                </>
              )
            )}
            {tabAdmin === "overview" && <OverviewTab c={c} clients={approvedClients} />}
            {tabAdmin === "calendar" && <MultiClientCalendar c={c} clients={approvedClients} />}
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
  const [feedbackPrompt, setFeedbackPrompt] = useState(null);
  const [showWeightReminder, setShowWeightReminder] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    if (screen !== "app") return;
    try {
      const lastSeen = localStorage.getItem("n2k_last_seen_version");
      if (lastSeen !== APP_VERSION) setShowWhatsNew(true);
    } catch (e) { /* stockage indisponible, tant pis */ }
  }, [screen]);

  const dismissWhatsNew = () => {
    try { localStorage.setItem("n2k_last_seen_version", APP_VERSION); } catch (e) { /* ignore */ }
    setShowWhatsNew(false);
  };
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [water, setWater] = useState(3);
  const [completedSessions, setCompletedSessions] = useState({});
  const [state, setState] = useState({
    name: "Athlète", weight: 75, height: 175, goal: "Perte de poids", sportLevel: "Débutant",
    xp: 0, level: 1, streak: 0, sessionsCompleted: 0, totalMinutes: 0, calories: 0,
    status: "pending", assignedProgramId: null, customProgram: null,
    age: null, gender: null, injuries: "", avatarUrl: null, streakFreezeUsedAt: null, accessExpiresAt: null,
  });
  const saveTimer = useRef(null);
  const pendingRouteRef = useRef(null);

  const applyProfile = (profile) => {
    setState({
      name: profile.name, weight: profile.weight, height: profile.height, goal: profile.goal, sportLevel: profile.sportLevel,
      xp: profile.xp, level: levelFromXp(profile.xp), streak: profile.streak, sessionsCompleted: profile.sessionsCompleted,
      totalMinutes: profile.totalMinutes, calories: profile.calories,
      status: profile.status || "pending",
      assignedProgramId: profile.assignedProgramId || null,
      customProgram: profile.customProgram || null,
      programStartAt: profile.programStartAt || null,
      age: profile.age || null, gender: profile.gender || null, injuries: profile.injuries || "",
      avatarUrl: profile.avatarUrl || null,
      subscriptionStatus: profile.subscriptionStatus || "inactive",
      revokeReason: profile.revokeReason || "",
      streakFreezeUsedAt: profile.streakFreezeUsedAt || null,
      accessExpiresAt: profile.accessExpiresAt || null,
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
    const expired = profile.status === "approved" && profile.accessExpiresAt && new Date(profile.accessExpiresAt) < new Date();
    if (expired) {
      setState(s => ({ ...s, revokeReason: `Votre accès a expiré le ${new Date(profile.accessExpiresAt).toLocaleDateString("fr-FR")}. Contactez votre coach pour le renouveler.` }));
      setScreen("revoked");
      return;
    }
    if (profile.status === "approved") setScreen("app");
    else if (profile.status === "revoked") setScreen("revoked");
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

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setScreen("resetPassword");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleAuthed = async () => {
    try {
      const profile = await getSessionProfile();
      if (profile) routeProfile(profile);
    } catch (e) { /* reste sur l'écran de connexion */ }
  };

  const handleOnboardingComplete = async (fields) => {
    if (!profileId) throw new Error("Session introuvable, reconnectez-vous.");
    await completeOnboarding(profileId, fields);
    setState(s => ({ ...s, weight: fields.weight, height: fields.height, age: fields.age, gender: fields.gender, goal: fields.goal, trainingFrequency: fields.trainingFrequency, injuries: fields.injuries }));
    const profile = await getSessionProfile();
    if (profile) { pendingRouteRef.current = profile; setScreen("installPrompt"); }
    else setScreen("pending");
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

  // Détecte quand la série a été "sauvée" par le gel mensuel et enregistre
  // la date de consommation pour ne pas pouvoir en reconsommer un ce mois-ci.
  useEffect(() => {
    if (!profileId || screen !== "app") return;
    const { usedFreeze, freezeAvailable } = computeRealStreak(completedSessions, state.streakFreezeUsedAt);
    if (usedFreeze && freezeAvailable) {
      const now = new Date().toISOString();
      setState(s => ({ ...s, streakFreezeUsedAt: now }));
      updateStreakFreezeUsedAt(profileId, now).catch(() => {});
    }
  }, [completedSessions, profileId, screen]);

  const openProgram = (p) => setView({ screen: "programDetail", program: p });
  const openSession = (program, w, dayIdx) => setView({ screen: "session", program, w, dayIdx, session: buildDaySession(program, w, dayIdx) });
  const openReview = (program, w, dayIdx, sessionKey) => setView({ screen: "sessionReview", program, w, dayIdx, sessionKey, session: buildDaySession(program, w, dayIdx) });
  const goTab = (t) => { setTab(t); setView({ screen: "tab" }); };
  const logout = async () => {
    setDrawerOpen(false);
    try { await signOut(); } catch (e) { /* ignore */ }
    setAccountEmail(null); setProfileId(null);
    setScreen("landing"); setView({ screen: "tab" }); setTab("home");
  };

  const handleComplete = (actualMinutes) => {
    const key = `${view.program.id || view.program.name}-${view.w}-${view.dayIdx}`;
    if (completedSessions[key]) return;
    const gainedXp = 120;
    const realMinutes = actualMinutes && actualMinutes > 0 ? actualMinutes : view.session.estTotal;
    const gainedCalories = Math.round(realMinutes * 6.5); // ~6.5 kcal/min, estimation générale musculation modérée
    const completedAt = new Date().toISOString();
    setCompletedSessions(cs => ({ ...cs, [key]: { completedAt, minutes: realMinutes, calories: gainedCalories, xp: gainedXp, title: view.session.title } }));
    setState(s => {
      const newXp = s.xp + gainedXp;
      return { ...s, xp: newXp, level: levelFromXp(newXp), streak: s.streak + 1, sessionsCompleted: s.sessionsCompleted + 1, totalMinutes: s.totalMinutes + realMinutes, calories: s.calories + gainedCalories };
    });
    setReward({ title: `+${gainedXp} XP gagnés !`, desc: "Séance validée — continuez sur votre lancée 🔥" });
    if (profileId) markSessionDone(profileId).catch(() => {});
    setFeedbackPrompt({ sessionKey: key });
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
  if (screen === "installPrompt") {
    return <><GlobalStyle /><InstallPrompt c={c} onContinue={() => {
      const profile = pendingRouteRef.current;
      pendingRouteRef.current = null;
      if (profile) routeProfile(profile); else setScreen("pending");
    }} /></>;
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
  if (screen === "revoked") {
    return <><GlobalStyle /><RevokedScreen c={c} onLogout={logout} reason={state.revokeReason} /></>;
  }
  if (screen === "resetPassword") {
    return <><GlobalStyle /><ResetPasswordScreen c={c} onDone={() => { setReward({ title: "Mot de passe mis à jour", desc: "Vous pouvez vous reconnecter normalement." }); handleAuthed(); }} /></>;
  }

  let content;
  let title = { home: "Accueil", programs: "Programmes", calendar: "Calendrier", messages: "Messages", photos: "Photos", nutrition: "Nutrition", profile: "Profil" }[tab];
  let onBack = null;

  if (view.screen === "programDetail") {
    title = view.program.name; onBack = () => setView({ screen: "tab" });
    content = <ProgramDetail c={c} program={view.program} onBack={onBack} openSession={openSession} completedSessions={completedSessions} openReview={openReview} />;
  } else if (view.screen === "session") {
    title = view.session.rest ? "Repos" : "Séance"; onBack = () => setView({ screen: "programDetail", program: view.program });
    const key = `${view.program.id || view.program.name}-${view.w}-${view.dayIdx}`;
    content = <SessionDetail key={key} c={c} session={view.session} onComplete={handleComplete} completed={!!completedSessions[key]} profileId={profileId} sessionKey={key} />;
  } else if (view.screen === "sessionReview") {
    title = "Performances"; onBack = () => setView({ screen: "programDetail", program: view.program });
    content = <SessionPerformanceView c={c} session={view.session} profileId={profileId} sessionKey={view.sessionKey} />;
  } else if (tab === "home") {
    content = <Dashboard c={c} state={state} quote={quote} openProgram={openProgram} openSession={openSession} goTab={goTab} completedSessions={completedSessions} water={water} />;
  } else if (tab === "programs") {
    content = <ProgramsList c={c} openProgram={openProgram} state={state} />;
  } else if (tab === "calendar") {
    content = <Calendar c={c} completedSessions={completedSessions} />;
  } else if (tab === "messages") {
    content = <div style={{ padding: 18, height: "calc(100vh - 130px)" }}><MessageThread c={c} clientId={profileId} isAdmin={false} peerName="votre coach" /></div>;
  } else if (tab === "photos") {
    content = <ProgressPhotos c={c} profileId={profileId} />;
  } else if (tab === "nutrition") {
    content = <Nutrition c={c} profile={state} water={water} setWater={setWater} />;
  } else if (tab === "profile") {
    content = <Profile c={c} state={state} dark={dark} setDark={setDark} accountEmail={accountEmail} profileId={profileId} completedSessions={completedSessions} onWeightLogged={(w) => setState(s => ({ ...s, weight: w }))} onAvatarChanged={(url) => setState(s => ({ ...s, avatarUrl: url }))} />;
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
      {showWhatsNew && <WhatsNewModal c={c} onClose={dismissWhatsNew} />}
      {reward && <RewardToast reward={reward} c={c} onClose={() => setReward(null)} />}
      {feedbackPrompt && (
        <SessionFeedbackForm c={c}
          onSubmit={async (data) => {
            if (profileId) {
              try { await submitSessionFeedback(profileId, feedbackPrompt.sessionKey, data); } catch (e) { /* réessaiera pas, non bloquant */ }
            }
            setFeedbackPrompt(null);
            setShowWeightReminder(true);
          }}
          onSkip={() => { setFeedbackPrompt(null); setShowWeightReminder(true); }}
        />
      )}
      {showWeightReminder && (
        <WeightReminderPrompt c={c} currentWeight={state.weight}
          onLog={async (w) => {
            if (profileId) {
              try {
                await logWeight(profileId, w);
                setState(s => ({ ...s, weight: w }));
              } catch (e) { /* réessaiera manuellement depuis le Profil */ }
            }
            setShowWeightReminder(false);
          }}
          onSkip={() => setShowWeightReminder(false)}
        />
      )}
    </>
  );
}
