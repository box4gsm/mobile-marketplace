import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">📱 MobileMarket EU</h1>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Buy & Sell Used Phones Across Europe</h2>
          <p className="text-xl text-blue-100 mb-10">Trusted marketplace connecting buyers and sellers of quality used mobile phones</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register?role=BUYER" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50">Browse Phones</Link>
            <Link href="/register?role=SELLER" className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700">Open Your Store</Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center px-4">
          <div>
            <p className="text-4xl font-bold text-blue-600">500+</p>
            <p className="text-gray-500 mt-1">Verified Stores</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600">10k+</p>
            <p className="text-gray-500 mt-1">Phones Available</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600">15+</p>
            <p className="text-gray-500 mt-1">European Countries</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h4 className="font-bold text-lg mb-2">Open Your Store</h4>
              <p className="text-gray-500">Register as a seller and set up your store in minutes</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="font-bold text-lg mb-2">List Your Phones</h4>
              <p className="text-gray-500">Add photos and details of your phones easily</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="font-bold text-lg mb-2">Get Paid Directly</h4>
              <p className="text-gray-500">Receive payments directly to your bank account</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>© 2026 MobileMarket EU. All rights reserved.</p>
      </footer>
    </main>
  );
}
