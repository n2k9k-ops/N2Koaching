import { supabase } from "./supabaseClient.js";

/* Convertit une ligne de la table `profiles` (snake_case) vers la forme
   utilisée par l'app React (camelCase). */
function rowToProfile(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    weight: row.weight,
    height: row.height,
    goal: row.goal,
    sportLevel: row.sport_level,
    xp: row.xp,
    streak: row.streak,
    sessionsCompleted: row.sessions_completed,
    totalMinutes: row.total_minutes,
    calories: row.calories,
    completedSessions: row.completed_sessions || {},
    water: row.water,
    dark: row.dark,
    status: row.status,
    isAdmin: row.is_admin,
    assignedProgramId: row.assigned_program_id,
    customProgram: row.custom_program,
    lastSessionAt: row.last_session_at,
    programStartAt: row.program_start_at,
    onboarded: row.onboarded,
    age: row.age,
    trainingFrequency: row.training_frequency,
    gender: row.gender,
    injuries: row.injuries,
    avatarUrl: row.avatar_url,
    subscriptionStatus: row.subscription_status,
  };
}

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signInWithApple() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

/** Retourne le profil de l'utilisateur actuellement connecté (ou null). */
export async function getSessionProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (error || !data) return null;
  return rowToProfile(data);
}

/** Le client met à jour uniquement SES champs de progression.
 *  status / is_admin / assigned_program_id / custom_program sont protégés
 *  côté base de données (trigger protect_admin_fields, voir supabase/schema.sql)
 *  donc même un appel direct à l'API ne peut pas les modifier depuis le client. */
export async function updateOwnProgress(id, fields) {
  const payload = {
    name: fields.name,
    weight: fields.weight,
    height: fields.height,
    goal: fields.goal,
    sport_level: fields.sportLevel,
    xp: fields.xp,
    streak: fields.streak,
    sessions_completed: fields.sessionsCompleted,
    total_minutes: fields.totalMinutes,
    calories: fields.calories,
    completed_sessions: fields.completedSessions,
    water: fields.water,
    dark: fields.dark,
  };
  const { error } = await supabase.from("profiles").update(payload).eq("id", id);
  if (error) throw error;
}

/** Enregistre les réponses du questionnaire de bienvenue (poids, âge, fréquence)
 *  et marque le profil comme onboardé — déclenché une seule fois, quel que soit
 *  le chemin de connexion. Ne masque pas les erreurs : l'appelant doit les gérer
 *  pour ne pas rester bloqué silencieusement sur l'écran d'onboarding. */
export async function completeOnboarding(id, fields) {
  const sportLevel = fields.trainingFrequency <= 2 ? "Débutant" : fields.trainingFrequency <= 4 ? "Intermédiaire" : "Avancé";
  const { error } = await supabase.from("profiles").update({
    weight: fields.weight,
    height: fields.height,
    age: fields.age,
    training_frequency: fields.trainingFrequency,
    gender: fields.gender,
    goal: fields.goal,
    injuries: fields.injuries || null,
    sport_level: sportLevel,
    onboarded: true,
  }).eq("id", id);
  if (error) throw error;
}

/* ---------------- Admin (nécessite is_admin = true côté DB) ---------------- */

export async function listAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(rowToProfile);
}

export async function setProfileStatus(id, status) {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function assignLibraryProgram(id, programId) {
  const { error } = await supabase.from("profiles").update({
    assigned_program_id: programId || null,
    custom_program: null,
    program_start_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

export async function assignCustomProgram(id, programObj) {
  const { error } = await supabase.from("profiles").update({
    custom_program: programObj,
    assigned_program_id: null,
    program_start_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

/** Appelé quand un client termine une séance — distinct de la sauvegarde
 *  de progression générale, pour un suivi d'activité fiable côté coach. */
export async function markSessionDone(id) {
  const { error } = await supabase.from("profiles").update({
    last_session_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

/* ---------------- Programmes réutilisables (modèles) ---------------- */

export async function listTemplates() {
  const { data, error } = await supabase
    .from("program_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(t => ({ id: t.id, name: t.name, data: t.data }));
}

export async function saveTemplate(name, programData) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non connecté.");
  const { error } = await supabase.from("program_templates").insert({
    coach_id: session.user.id, name, data: programData,
  });
  if (error) throw error;
}

export async function deleteTemplate(id) {
  const { error } = await supabase.from("program_templates").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- Historique de poids ---------------- */

export async function logWeight(profileId, weight) {
  const { error } = await supabase.from("weight_logs").insert({ profile_id: profileId, weight });
  if (error) throw error;
}

export async function listWeightLogs(profileId) {
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("profile_id", profileId)
    .order("logged_at", { ascending: true });
  if (error) throw error;
  return data.map(r => ({ weight: r.weight, loggedAt: r.logged_at }));
}

/* ---------------- Photo de profil ---------------- */

export async function uploadAvatar(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateAvatarUrl(id, url) {
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", id);
  if (error) throw error;
}

/* ---------------- Abonnement Stripe ---------------- */

/** Appelle l'Edge Function `create-checkout-session` et retourne l'URL Stripe
 *  Checkout vers laquelle rediriger l'utilisateur. */
export async function createCheckoutSession() {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { returnUrl: window.location.origin },
  });
  if (error) throw error;
  return data.url;
}

/** Ouvre le portail client Stripe (gérer / résilier l'abonnement). */
export async function createBillingPortalSession() {
  const { data, error } = await supabase.functions.invoke("create-billing-portal-session", {
    body: { returnUrl: window.location.origin },
  });
  if (error) throw error;
  return data.url;
}

/* ---------------- Photos de référence par exercice ---------------- */

export async function uploadExercisePhoto(file) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabase.storage.from("exercise-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("exercise-photos").getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------- Messagerie coach ↔ client ---------------- */

export async function listMessages(clientId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendMessage(clientId, content, senderIsAdmin) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non connecté.");
  const { error } = await supabase.from("messages").insert({
    client_id: clientId, sender_id: session.user.id, sender_is_admin: !!senderIsAdmin, content,
  });
  if (error) throw error;
}

export async function markMessagesRead(clientId) {
  const { error } = await supabase.from("messages").update({ read: true }).eq("client_id", clientId);
  if (error) throw error;
}
