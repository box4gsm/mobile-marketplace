import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { name, description } = await req.json();

  if (!name) return NextResponse.json({ error: "Store name required" }, { status: 400 });

  const existing = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (existing) return NextResponse.json({ error: "Store already exists" }, { status: 400 });

  const store = await prisma.store.create({
    data: { name, description, ownerId: userId },
  });

  return NextResponse.json({ store }, { status: 201 });
}

export async function GET() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ stores });
}
