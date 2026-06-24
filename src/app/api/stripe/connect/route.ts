import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const account = await stripe.accounts.create({
    type: "express",
    country: "DE",
    capabilities: { transfers: { requested: true } },
    metadata: { storeId: store.id, userId },
  });

  await prisma.store.update({
    where: { id: store.id },
    data: { stripeAccountId: account.id },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/seller?connect=refresh`,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/seller?connect=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
