import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function SellerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const store = await prisma.store.findUnique({
    where: { ownerId: userId },
    include: {
      products: true,
      subscription: true,
      _count: { select: { products: true } },
    },
  });

  const orders = store
    ? await prisma.order.findMany({
        where: { product: { storeId: store.id } },
        include: { product: true, buyer: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + (o.totalAmount - o.commission), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📱 MobileMarket EU — Seller</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{session.user?.name}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="text-sm text-red-500 hover:underline">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!store ? (
          <div className="bg-white rounded-2xl border p-10 text-center">
            <p className="text-5xl mb-4">🏪</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Up Your Store</h2>
            <p className="text-gray-500 mb-6">Create your store to start selling phones</p>
            <Link href="/dashboard/seller/setup" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700">
              Create My Store
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{store.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${store.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {store.isActive ? "Active" : "Pending Approval"}
                </span>
              </div>
              <Link href="/dashboard/seller/products/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">
                + Add Phone
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border p-5">
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{store._count.products}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{orders.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-gray-500 text-sm">Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">€{totalRevenue.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-gray-500 text-sm">Plan</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{store.subscription?.plan || "No Plan"}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border">
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                <Link href="/dashboard/seller/orders" className="text-blue-600 text-sm hover:underline">View all</Link>
              </div>
              {orders.length === 0 ? (
                <div className="p-10 text-center text-gray-400">No orders yet</div>
              ) : (
                <div className="divide-y">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{order.product.title}</p>
                        <p className="text-sm text-gray-500">Buyer: {order.buyer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">€{order.totalAmount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                          order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{order.status}</span>
                      </div>
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
