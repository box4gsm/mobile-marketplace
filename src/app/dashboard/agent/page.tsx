import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function AgentDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const agent = await prisma.user.findUnique({
    where: { id: userId },
    include: { assignedStore: { include: { products: true } } },
  });

  const store = agent?.assignedStore;

  const activity = await prisma.agentActivity.findMany({
    where: { agentId: userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📱 MobileMarket EU — Field Agent</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{session.user?.name}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="text-sm text-red-500 hover:underline">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!store ? (
          <div className="bg-white rounded-2xl border p-10 text-center">
            <p className="text-5xl mb-4">⏳</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Not Assigned Yet</h2>
            <p className="text-gray-500">You have not been assigned to a store yet. Contact the admin.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Assigned Store</p>
              <h2 className="text-2xl font-bold text-gray-800">{store.name}</h2>
              <p className="text-gray-500 mt-1">{store.products.length} products listed</p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Store Products</h3>
              <Link href="/dashboard/agent/add-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                + Add Phone
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {store.products.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white rounded-xl border p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.brand} · {p.condition}</p>
                  </div>
                  <p className="font-bold text-blue-600">EUR{p.price}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border">
              <div className="p-5 border-b">
                <h3 className="font-semibold text-gray-800">My Activity Log</h3>
              </div>
              {activity.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No activity yet</div>
              ) : (
                <div className="divide-y">
                  {activity.map((a) => (
                    <div key={a.id} className="p-4 flex justify-between items-center">
                      <p className="text-gray-700">{a.action}</p>
                      <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
