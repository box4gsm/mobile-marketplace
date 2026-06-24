import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const [users, stores, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  const pendingStores = await prisma.store.findMany({
    where: { isActive: false },
    include: { owner: true },
    take: 10,
  });

  const recentOrders = await prisma.order.findMany({
    include: { product: true, buyer: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalCommission = await prisma.order.aggregate({
    _sum: { commission: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📱 MobileMarket EU — Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{session.user?.name}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="text-sm text-red-500 hover:underline">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{users}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">Stores</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stores}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">Products</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{products}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">Orders</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{orders}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-gray-500 text-sm">Commission</p>
            <p className="text-3xl font-bold text-green-600 mt-1">EUR{(totalCommission._sum.commission || 0).toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-gray-800">Pending Store Approvals</h3>
            </div>
            {pendingStores.length === 0 ? (
              <div className="p-8 text-center text-gray-400">All stores approved</div>
            ) : (
              <div className="divide-y">
                {pendingStores.map((store: { id: string; name: string; owner: { email: string } }) => (
                  <div key={store.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{store.name}</p>
                      <p className="text-sm text-gray-500">{store.owner.email}</p>
                    </div>
                    <form action={async () => {
                      "use server";
                      await prisma.store.update({ where: { id: store.id }, data: { isActive: true } });
                    }}>
                      <button className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700">
                        Approve
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No orders yet</div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order: { id: string; product: { title: string }; buyer: { name: string }; totalAmount: number; commission: number }) => (
                  <div key={order.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{order.product.title}</p>
                      <p className="text-sm text-gray-500">{order.buyer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">EUR{order.totalAmount}</p>
                      <p className="text-xs text-green-600">+EUR{order.commission} fee</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
