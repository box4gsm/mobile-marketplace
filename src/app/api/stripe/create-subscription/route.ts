import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PLANS = {
  basic: { price: 2900, commission: 0.08, name: "Basic", productName: "Basic Plan - MobileMarket EU" },
  pro: { price: 5900, commission: 0.05, name: "Pro", productName: "Pro Plan - MobileMarket EU" },
  business: { price: 9900, commission: 0.03, name: "Business", productName: "Business Plan - MobileMarket EU" },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { plan } = await req.json();

  const planData = PLANS[plan as keyof typeof PLANS];
  if (!planData) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const product = await stripe.products.create({ name: planData.productName });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: planData.price,
    currency: "eur",
    recurring: { interval: "month" },
  });

  let customerId: string;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const customer = await stripe.customers.create({
    email: user!.email,
    name: user!.name,
    metadata: { storeId: store.id, userId },
  });
  customerId = customer.id;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/seller?subscription=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/seller/subscribe`,
    metadata: { storeId: store.id, plan, commissionRate: planData.commission.toString() },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
