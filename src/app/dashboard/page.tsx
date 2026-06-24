import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/login");

  const role = (session.user as any).role;

  if (role === "SELLER") redirect("/dashboard/seller");
  if (role === "AGENT") redirect("/dashboard/agent");
  if (role === "ADMIN") redirect("/dashboard/admin");

  redirect("/dashboard/buyer");
}
