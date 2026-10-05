import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Filter, SlidersHorizontal, Pill, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import ProductCard from "../../components/ProductCard";
import ProductDetailModal from "../../components/ProductDetailModal";

// Local fallback medicines seed data to guarantee 100% uptime during development
const FALLBACK_MEDICINES = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    name: "Dolo 650mg Paracetamol Tablets",
    description: "Fast relief from fever, body ache, and mild to moderate pain. Pack of 15 tablets.",
    type: "medicine",
    category: "Fever & Pain Relief",
    price: 30.50,
    mrp: 33.60,
    stock: 150,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    name: "Azithral 500mg (Azithromycin)",
    description: "Broad spectrum macrolide antibiotic used for respiratory tract and skin infections. Pack of 5 tablets.",
    type: "medicine",
    category: "Antibiotics",
    price: 119.00,
    mrp: 132.50,
    stock: 80,
    requires_prescription: true,
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    name: "Augmentin 625 Duo Tablet",
    description: "Potent combination of Amoxicillin and Potassium Clavulanate for bacterial infections. Strip of 10 tablets.",
    type: "medicine",
    category: "Antibiotics",
    price: 201.50,
    mrp: 223.80,
    stock: 60,
    requires_prescription: true,
    image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    name: "Glycomet 500 SR (Metformin)",
    description: "Sustained release oral anti-diabetic formulation for managing Type 2 Diabetes. Strip of 20 tablets.",
    type: "medicine",
    category: "Diabetes Care",
    price: 48.00,
    mrp: 54.00,
    stock: 120,
    requires_prescription: true,
    image_url: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    name: "Pan 40mg Tablet (Pantoprazole)",
    description: "Proton pump inhibitor providing effective relief from acidity, heartburn, and GERD. Strip of 15 tablets.",
    type: "medicine",
    category: "Digestion & Acidity",
    price: 155.00,
    mrp: 172.00,
    stock: 95,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000006",
    name: "Cetzine 10mg Tablet (Cetirizine)",
    description: "Antihistamine for allergic rhinitis, watery eyes, sneezing, and skin itching. Strip of 10 tablets.",
    type: "medicine",
    category: "Allergy & Cold",
    price: 21.00,
    mrp: 23.50,
    stock: 200,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000007",
    name: "Electral Oral Rehydration Salts (ORS) 21.8g",
    description: "WHO-formulated oral rehydration salts for restoring electrolytes during dehydration and diarrhea.",
    type: "medicine",
    category: "First Aid & Wellness",
    price: 22.00,
    mrp: 24.20,
    stock: 300,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000008",
    name: "Benadryl Cough Syrup 100ml",
    description: "Soothing formula for dry cough, throat irritation, and bronchial congestion.",
    type: "medicine",
    category: "Allergy & Cold",
    price: 115.00,
    mrp: 128.00,
    stock: 110,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000009",
    name: "Volini Pain Relief Gel 50g",
    description: "Quick absorbing gel with Diclofenac for muscle pain, sprains, and joint discomfort.",
    type: "medicine",
    category: "Fever & Pain Relief",
    price: 145.00,
    mrp: 160.00,
    stock: 90,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000010",
    name: "Dettol Antiseptic Liquid 550ml",
    description: "Trusted germ protection for first aid, cuts, grazes, and personal hygiene.",
    type: "medicine",
    category: "First Aid & Wellness",
    price: 215.00,
    mrp: 232.00,
    stock: 85,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000011",
    name: "Limcee 500mg Vitamin C Chewable Tablets",
    description: "Immunity booster tablets containing Ascorbic Acid. Pack of 15 chewable tablets.",
    type: "medicine",
    category: "Vitamins & Supplements",
    price: 23.50,
    mrp: 26.00,
    stock: 250,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000012",
    name: "Asthalin 100mcg Inhaler (Salbutamol)",
    description: "Bronchodilator providing rapid emergency relief from asthma symptoms and bronchospasm.",
    type: "medicine",
    category: "Respiratory Care",
    price: 158.00,
    mrp: 175.00,
    stock: 70,
    requires_prescription: true,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
];

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState(FALLBACK_MEDICINES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [rxFilter, setRxFilter] = useState("all"); // 'all' | 'rx' | 'otc'
  const [sortBy, setSortBy] = useState("relevance"); // 'price_low' | 'price_high' | 'name'
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Fetch medicines from Supabase
  useEffect(() => {
    async function fetchMedicines() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("type", "medicine")
          .eq("is_active", true);

        if (!error && data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(FALLBACK_MEDICINES);
        }
      } catch (err) {
        console.warn("Using fallback medicines:", err);
        setProducts(FALLBACK_MEDICINES);
      } finally {
        setLoading(false);
      }
    }

    fetchMedicines();
  }, []);

  const categories = [
    "all",
    "Fever & Pain Relief",
    "Antibiotics",
    "Diabetes Care",
    "Digestion & Acidity",
    "Allergy & Cold",
    "Respiratory Care",
    "First Aid & Wellness",
    "Vitamins & Supplements",
  ];

  const filteredProducts = products
    .filter((prod) => {
      if (selectedCategory !== "all" && prod.category !== selectedCategory) {
        return false;
      }
      if (rxFilter === "rx" && !prod.requires_prescription) return false;
      if (rxFilter === "otc" && prod.requires_prescription) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q) ||
          prod.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>CareSetu Verified Online Pharmacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Buy Genuine Medicines
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Doorstep delivery across Vadodara & India. Prescription drugs reviewed by licensed pharmacists.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Free delivery on orders above ₹500</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by medicine name, salt or brand (e.g., Dolo, Pan, Azithral)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Sort Select */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium text-slate-700"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Medicine Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Rx Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All Medicines" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setRxFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium ${
                rxFilter === "all" ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRxFilter("otc")}
              className={`px-2.5 py-1 rounded-lg font-medium ${
                rxFilter === "otc" ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-500"
              }`}
            >
              OTC (No Rx)
            </button>
            <button
              onClick={() => setRxFilter("rx")}
              className={`px-2.5 py-1 rounded-lg font-medium ${
                rxFilter === "rx" ? "bg-red-50 text-red-700 font-bold" : "text-slate-500"
              }`}
            >
              Rx Required
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{filteredProducts.length}</strong> medicines
          </span>
          <span>Currency: INR (₹)</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Medicines Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No products match your search or filter criteria. Try clearing filters or searching for generic terms like Paracetamol or ORS.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setRxFilter("all");
              }}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetail={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
}
