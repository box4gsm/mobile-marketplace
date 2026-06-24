"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  { id: "basic", name: "Basic", price: "€29/month", commission: "8%", products: "50 products", color: "blue" },
  { id: "pro", name: "Pro", price: "€59/month", commission: "5%", products: "200 products", color: "purple", popular: true },
  { id: "business", name: "Business", price: "€99/month", commission: "3%", products: "Unlimited", color: "green" },
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    const res = await fetch("/api/stripe/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2">Select the plan that fits your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 p-6 relative ${plan.popular ? "border-purple-500 shadow-lg" : "border-gray-200"}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                <li>✅ {plan.products}</li>
                <li>✅ {plan.commission} commission per sale</li>
                <li>✅ Direct bank payouts</li>
                <li>✅ Seller dashboard</li>
                {plan.id !== "basic" && <li>✅ Priority support</li>}
                {plan.id === "business" && <li>✅ Featured listings</li>}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`mt-6 w-full py-3 rounded-xl font-medium transition-colors ${
                  plan.popular
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {loading === plan.id ? "Redirecting..." : "Get Started"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Secure payment via Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
