import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  let store = await prisma.store.findUnique({ where: { ownerId: userId } });

  if (!store && role === "AGENT") {
    const agent = await prisma.user.findUnique({
      where: { id: userId },
      include: { assignedStore: true },
    });
    store = agent?.assignedStore || null;
  }

  if (!store) return NextResponse.json({ error: "No store found" }, { status: 400 });

  const { title, description, price, brand, model, storage, condition } = await req.json();

  if (!title || !price || !brand || !model || !condition) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { title, description, price, brand, model, storage, condition, storeId: store.id },
  });

  if (role === "AGENT") {
    await prisma.agentActivity.create({
      data: { agentId: userId, action: `Added product: ${title}`, details: `Store: ${store.name}` },
    });
  }

  return NextResponse.json({ product }, { status: 201 });
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { store: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}
