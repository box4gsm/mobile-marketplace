"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const BRANDS = ["Apple", "Samsung", "Huawei", "Xiaomi", "OnePlus", "Google", "Sony", "Nokia", "Other"];

export default function AgentAddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", price: "", brand: "", model: "",
    storage: "", condition: "GOOD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }
    router.push("/dashboard/agent");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">Back</button>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Add Phone for Store</h1>
          <p className="text-gray-500 text-sm mt-1">You are adding this on behalf of the store owner</p>
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. iPhone 13 Pro 256GB" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select brand</option>
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. iPhone 13 Pro" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                <input type="text" value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 256GB" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (EUR)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="299" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <div className="flex gap-2 flex-wrap">
                {CONDITIONS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, condition: c })} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.condition === c ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                    {c.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the phone condition and accessories..." />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Adding..." : "Add Phone"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
