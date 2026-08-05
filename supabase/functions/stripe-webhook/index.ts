// supabase/functions/stripe-webhook/index.ts
// Reçoit les événements Stripe (paiement réussi, abonnement mis à jour/annulé)
// et met à jour la colonne subscription_status du profil correspondant.
//
// À configurer dans Stripe Dashboard > Developers > Webhooks :
//   URL : https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
//   Événements à écouter : checkout.session.completed,
//                           customer.subscription.updated,
//                           customer.subscription.deleted
import Stripe from "npm:stripe@14?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Signature invalide: ${err instanceof Error ? err.message : err}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (userId) {
          await supabaseAdmin.from("profiles").update({
            subscription_status: "active",
            subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
          }).eq("id", userId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const status = (sub.status === "active" || sub.status === "trialing") ? "active"
          : sub.status === "canceled" ? "canceled"
          : sub.status; // past_due, unpaid, incomplete, etc. — stockés tels quels
        await supabaseAdmin.from("profiles")
          .update({ subscription_status: status })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }
      default:
        // Événement non géré, ignoré volontairement.
        break;
    }
  } catch (e) {
    return new Response(`Erreur de traitement: ${e instanceof Error ? e.message : e}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
