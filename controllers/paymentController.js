import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// **1️⃣ Buat Payment Intent**
export const createPaymentIntent = async (req, res) => {
  try {
    console.log(req.body);

    const { amount, currency, description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      description,
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: "Ralat mencipta pembayaran", error });
  }
};

// **2️⃣ Webhook untuk Payment Status**
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "payment_intent.succeeded") {
      console.log("✅ Pembayaran berjaya:", event.data.object);
    } else if (event.type === "payment_intent.payment_failed") {
      console.log("❌ Pembayaran gagal:", event.data.object);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("⚠️ Webhook Error:", error);
    res.status(400).json({ message: "Webhook Error" });
  }
};
