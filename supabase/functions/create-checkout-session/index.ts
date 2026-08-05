// supabase/functions/create-checkout-session/index.ts
// Crée une session Stripe Checkout (abonnement) pour l'utilisateur authentifié
// et renvoie l'URL vers laquelle rediriger le navigateur.
import Stripe from "npm:stripe@14?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non authentifié." }, 401);
    const jwt = authHeader.replace("Bearer ", "");

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(jwt);
    if (userErr || !user) return json({ error: "Session invalide." }, 401);

    const priceId = Deno.env.get("STRIPE_PRICE_ID");
    if (!priceId) return json({ error: "STRIPE_PRICE_ID non configuré côté serveur." }, 500);

    const body = await req.json().catch(() => ({}));
    const base = body.returnUrl || Deno.env.get("APP_URL") || "https://example.com";

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}?checkout=success`,
      cancel_url: `${base}?checkout=cancel`,
    });

    return json({ url: session.url });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erreur inconnue." }, 500);
  }
});
