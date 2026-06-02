// src/pages/HomePage.tsx
import ProductListPage from "./ProductListPage"; // Aapka existing page direct import kiya

const HomePage = () => {
  return (
    <div className="space-y-6">
      {/* 🔥 Ek pyara sa commercial banner layout */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-10 text-white shadow-lg shadow-blue-100">
        <h1 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">
          Welcome to PROSTORE
        </h1>
        <p className="text-blue-100 text-xs md:text-sm max-w-md font-medium opacity-90">
          Explore our trending items and manage everything seamlessly with an elegant full-stack interface.
        </p>
      </div>

      {/* 📦 Aapki apni layout screen automatically yahan load ho jayegi */}
      <div className="bg-white rounded-3xl p-2 md:p-4 border border-gray-100 shadow-sm">
        <ProductListPage />
      </div>
    </div>
  );
};

export default HomePage;