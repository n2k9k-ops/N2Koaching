// src/lib/aiAnalysis.js
//
// Analyse IA d'un programme d'entraînement, appelée directement depuis le
// navigateur du coach avec SA PROPRE clé API Anthropic (jamais envoyée à
// Supabase ni à un serveur tiers — stockée uniquement dans le localStorage
// de son appareil). C'est le seul moyen honnête de faire un vrai appel IA
// sans backend dédié : voir le README pour le détail et les limites.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_KEY = "n2k_ai_api_key";
const AI_MODEL = "claude-sonnet-5";

export function getStoredApiKey() {
  try { return localStorage.getItem(STORAGE_KEY) || ""; } catch (e) { return ""; }
}
export function storeApiKey(key) {
  try { localStorage.setItem(STORAGE_KEY, key); } catch (e) { /* stockage indisponible */ }
}
export function clearApiKey() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
}

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function buildProgramSummary(program) {
  const lines = [];
  lines.push(`Nom : ${program.name}`);
  lines.push(`Niveau : ${program.level || "non précisé"}`);
  lines.push(`Durée : ${program.weeks} semaines`);
  lines.push(`Lieu : ${program.location === "home" ? "Maison" : "Salle de sport"}`);
  lines.push("");
  lines.push("Détail des séances de la semaine type :");
  (program.customSessions || []).forEach((day, i) => {
    const dayName = DAY_LABELS[i] || `Jour ${i + 1}`;
    if (day.rest || !day.exercises || day.exercises.length === 0) {
      lines.push(`- ${dayName} : Repos`);
      return;
    }
    lines.push(`- ${dayName} — ${day.title || "Séance"} :`);
    day.exercises.forEach(e => {
      lines.push(`    · ${e.name} (${e.cat}) — ${e.sets} séries × ${e.reps}, repos ${e.rest}s`);
    });
  });
  return lines.join("\n");
}

export async function analyzeProgramWithAI(program, apiKey) {
  if (!apiKey) throw new Error("Aucune clé API configurée.");
  const summary = buildProgramSummary(program);

  const prompt = `Tu es un coach sportif expert en science de l'entraînement (physiologie de l'exercice, périodisation, biomécanique, volume d'entraînement). Analyse ce programme de musculation de façon rigoureuse et approfondie, en t'appuyant sur des principes reconnus dans la littérature scientifique du sport : volume hebdomadaire par groupe musculaire (séries efficaces), fréquence d'entraînement, équilibre entre mouvements de poussée/tirage/jambes, gestion de la récupération et du risque de surentraînement, ordre logique des exercices (polyarticulaires avant isolation), progression de charge, et sécurité.

${summary}

Fournis une analyse structurée avec ces sections, en français :
1. **Points forts**
2. **Points faibles ou risques** (déséquilibres musculaires, volume insuffisant ou excessif, récupération, sécurité)
3. **Recommandations concrètes** (modifications précises, pas de généralités)
4. **Note globale sur 10**, avec une justification en une phrase

Sois direct et précis, appuie-toi sur des repères chiffrés (nombre de séries par groupe musculaire par semaine, fréquence, etc.) plutôt que des généralités vagues.`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 2200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    let msg = `Erreur API (${res.status})`;
    try { const body = await res.json(); if (body?.error?.message) msg = body.error.message; } catch (e) { /* garde le message générique */ }
    if (res.status === 401) msg = "Clé API invalide ou expirée.";
    if (res.status === 429) msg = "Limite de requêtes atteinte, réessayez dans un instant.";
    throw new Error(msg);
  }

  const data = await res.json();
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}
