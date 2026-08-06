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
    revokeReason: row.revoke_reason,
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
    streakFreezeUsedAt: row.streak_freeze_used_at,
    accessExpiresAt: row.access_expires_at,
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

/* ---------------- Photos de progression (envoi client + réponse coach) ---------------- */

function progressPhotoRowToApp(row) {
  return {
    id: row.id, profileId: row.profile_id, photoUrl: row.photo_url, note: row.note,
    coachReply: row.coach_reply, coachReplyAt: row.coach_reply_at, createdAt: row.created_at,
  };
}

export async function uploadProgressPhoto(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("progress-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createProgressPhoto(profileId, photoUrl, note) {
  const { error } = await supabase.from("progress_photos").insert({
    profile_id: profileId, photo_url: photoUrl, note: note || null,
  });
  if (error) throw error;
}

export async function listProgressPhotos(profileId) {
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(progressPhotoRowToApp);
}

export async function replyToProgressPhoto(photoId, reply) {
  const { error } = await supabase.from("progress_photos").update({
    coach_reply: reply, coach_reply_at: new Date().toISOString(),
  }).eq("id", photoId);
  if (error) throw error;
}

/* ---------------- Validation avec durée d'abonnement ---------------- */

/** Valide un compte en attente et fixe une date d'expiration d'accès
 *  (durationDays = null pour un accès illimité). */
export async function approveWithDuration(id, durationDays) {
  const accessExpiresAt = durationDays
    ? new Date(Date.now() + durationDays * 86400000).toISOString()
    : null;
  const { error } = await supabase.from("profiles").update({
    status: "approved", access_expires_at: accessExpiresAt,
  }).eq("id", id);
  if (error) throw error;
}

/** Renouvelle/prolonge l'accès d'un client déjà validé (ou expiré). */
export async function renewAccess(id, durationDays) {
  const accessExpiresAt = durationDays
    ? new Date(Date.now() + durationDays * 86400000).toISOString()
    : null;
  const { error } = await supabase.from("profiles").update({
    status: "approved", access_expires_at: accessExpiresAt, revoke_reason: null,
  }).eq("id", id);
  if (error) throw error;
}

export async function setProfileStatus(id, status) {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Révoque l'accès d'un client déjà validé, avec un motif visible par le client
 *  à sa prochaine tentative de connexion. */
export async function revokeAccess(id, reason) {
  const { error } = await supabase.from("profiles").update({
    status: "revoked", revoke_reason: reason || null,
  }).eq("id", id);
  if (error) throw error;
}

/** Redonne l'accès à un client précédemment révoqué. */
export async function restoreAccess(id) {
  const { error } = await supabase.from("profiles").update({
    status: "approved", revoke_reason: null,
  }).eq("id", id);
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

/* ---------------- Historique des séries (perf par exercice) ---------------- */

export async function logExerciseSet(profileId, sessionKey, exerciseName, setIndex, weight, reps) {
  const { error } = await supabase.from("exercise_logs").upsert({
    profile_id: profileId, session_key: sessionKey, exercise_name: exerciseName,
    set_index: setIndex, weight, reps, logged_at: new Date().toISOString(),
  }, { onConflict: "profile_id,session_key,exercise_name,set_index" });
  if (error) throw error;
}

/** Retourne les séries de la dernière fois où cet exercice a été fait
 *  (toutes séances confondues), ou null si jamais fait avant. */
export async function getLastExercisePerformance(profileId, exerciseName) {
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("profile_id", profileId)
    .eq("exercise_name", exerciseName)
    .order("logged_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const lastSessionKey = data[0].session_key;
  return data
    .filter(d => d.session_key === lastSessionKey)
    .sort((a, b) => a.set_index - b.set_index)
    .map(s => ({ weight: s.weight, reps: s.reps }));
}

/** Retourne toutes les séries loggées pour une séance précise, groupées par exercice. */
export async function getSessionExerciseLogs(profileId, sessionKey) {
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("profile_id", profileId)
    .eq("session_key", sessionKey)
    .order("set_index", { ascending: true });
  if (error) throw error;
  const grouped = {};
  (data || []).forEach(row => {
    if (!grouped[row.exercise_name]) grouped[row.exercise_name] = [];
    grouped[row.exercise_name].push({ weight: row.weight, reps: row.reps, setIndex: row.set_index });
  });
  return grouped;
}

export async function updateStreakFreezeUsedAt(id, isoDate) {
  const { error } = await supabase.from("profiles").update({ streak_freeze_used_at: isoDate }).eq("id", id);
  if (error) throw error;
}

/* ---------------- Ressenti post-séance ---------------- */

export async function submitSessionFeedback(profileId, sessionKey, { rpe, energy, soreness, comment }) {
  const { error } = await supabase.from("session_feedback").insert({
    profile_id: profileId, session_key: sessionKey, rpe, energy, soreness: soreness || null, comment: comment || null,
  });
  if (error) throw error;
}

export async function listSessionFeedback(profileId) {
  const { data, error } = await supabase
    .from("session_feedback")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data.map(r => ({ id: r.id, rpe: r.rpe, energy: r.energy, soreness: r.soreness, comment: r.comment, createdAt: r.created_at }));
}

/* ---------------- Message groupé (coach vers tous ses clients) ---------------- */

export async function broadcastMessage(clientIds, content) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non connecté.");
  const rows = clientIds.map(id => ({ client_id: id, sender_id: session.user.id, sender_is_admin: true, content }));
  const { error } = await supabase.from("messages").insert(rows);
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

/* ---------------- Exercices personnalisés (bibliothèque partagée) ---------------- */

function customExerciseRowToApp(row) {
  return {
    id: `custom-${row.id}`, cat: row.cat, location: row.location, name: row.name,
    sets: row.sets, reps: row.reps, rest: row.rest, diff: row.diff,
    tips: row.tips || undefined, safety: row.safety || undefined, equip: row.equip || undefined,
    videoUrl: row.video_url || undefined, photoUrl: row.photo_url || undefined,
  };
}

export async function listCustomExercises() {
  const { data, error } = await supabase
    .from("custom_exercises")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(customExerciseRowToApp);
}

/** Crée un exercice personnalisé et le fait rejoindre la bibliothèque partagée
 *  (visible et réutilisable pour tous les futurs clients). */
export async function createCustomExercise(fields) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non connecté.");
  const { data, error } = await supabase.from("custom_exercises").insert({
    coach_id: session.user.id, name: fields.name, cat: fields.cat, location: fields.location,
    sets: fields.sets, reps: fields.reps, rest: fields.rest, diff: fields.diff,
    tips: fields.tips || null, safety: fields.safety || null, equip: fields.equip || null,
    video_url: fields.videoUrl || null, photo_url: fields.photoUrl || null,
  }).select().single();
  if (error) throw error;
  return customExerciseRowToApp(data);
}

/** Liste les noms d'exercices distincts déjà loggés par ce profil (pour peupler
 *  un sélecteur "voir la progression sur..."), triés par date de dernier usage. */
export async function listLoggedExerciseNames(profileId) {
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("exercise_name, logged_at")
    .eq("profile_id", profileId)
    .order("logged_at", { ascending: false });
  if (error) throw error;
  const seen = new Set();
  const names = [];
  (data || []).forEach(r => { if (!seen.has(r.exercise_name)) { seen.add(r.exercise_name); names.push(r.exercise_name); } });
  return names;
}

/** Historique complet des séries loggées pour un exercice précis, pour tracer
 *  un graphique de progression de charge dans le temps. */
export async function getExerciseHistory(profileId, exerciseName) {
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("profile_id", profileId)
    .eq("exercise_name", exerciseName)
    .order("logged_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(r => ({ weight: r.weight, reps: r.reps, loggedAt: r.logged_at, setIndex: r.set_index }));
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

export async function sendMessage(clientId, content, senderIsAdmin, attachmentUrl, attachmentType) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non connecté.");
  const { error } = await supabase.from("messages").insert({
    client_id: clientId, sender_id: session.user.id, sender_is_admin: !!senderIsAdmin,
    content: content || null, attachment_url: attachmentUrl || null, attachment_type: attachmentType || null,
  });
  if (error) throw error;
}

export async function uploadMessageAttachment(file, clientId) {
  const ext = file.name.split(".").pop();
  const path = `${clientId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("message-attachments").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("message-attachments").getPublicUrl(path);
  return data.publicUrl;
}

/** Marque comme lus les messages envoyés par l'AUTRE partie (pas les siens) —
 *  readerIsAdmin=true (coach qui lit) marque les messages du client comme lus,
 *  et inversement, pour un vrai accusé de lecture. */
export async function markMessagesRead(clientId, readerIsAdmin) {
  const { error } = await supabase.from("messages").update({ read: true })
    .eq("client_id", clientId).eq("sender_is_admin", !readerIsAdmin);
  if (error) throw error;
}
