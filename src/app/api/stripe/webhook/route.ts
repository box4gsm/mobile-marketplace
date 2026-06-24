import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { storeId, plan, commissionRate } = session.metadata;

    await prisma.subscription.upsert({
      where: { storeId },
      create: {
        storeId,
        plan,
        priceMonthly: session.amount_total / 100,
        commissionRate: parseFloat(commissionRate),
        stripeSubscriptionId: session.subscription,
        status: "ACTIVE",
      },
      update: {
        plan,
        priceMonthly: session.amount_total / 100,
        commissionRate: parseFloat(commissionRate),
        stripeSubscriptionId: session.subscription,
        status: "ACTIVE",
      },
    });

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: true },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: "CANCELLED" },
    });
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: sub.id },
    });
    if (subscription) {
      await prisma.store.update({
        where: { id: subscription.storeId },
        data: { isActive: false },
      });
    }
  }

  return NextResponse.json({ received: true });
}
