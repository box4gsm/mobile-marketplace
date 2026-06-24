import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function BuyerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: { store: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">📱 MobileMarket EU</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {session.user?.name}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="text-sm text-red-500 hover:underline">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Phones</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg">No phones available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="bg-gray-100 h-48 rounded-t-xl flex items-center justify-center text-5xl">
                  📱
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">{product.store.name}</p>
                  <h3 className="font-semibold text-gray-800">{product.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product.brand} · {product.condition}</p>
                  <p className="text-xl font-bold text-blue-600 mt-2">€{product.price}</p>
                  <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
