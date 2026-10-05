import React, { useState, useEffect } from "react";
import { Stethoscope, Search as SearchIcon, AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import ProductCard from "../../components/ProductCard";
import ProductDetailModal from "../../components/ProductDetailModal";

// Local fallback equipment seed data to ensure zero downtime
const FALLBACK_EQUIPMENT = [
  {
    id: "10000000-0000-0000-0000-000000000013",
    name: "Omron HEM-7120 Digital BP Monitor",
    description: "Clinically validated automatic blood pressure monitor with Intellisense technology and irregular heartbeat detector.",
    type: "equipment",
    category: "Monitoring Devices",
    price: 2199.00,
    mrp: 2640.00,
    stock: 45,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000014",
    name: "Dr. Trust Professional Pulse Oximeter",
    description: "Fingertip pulse oximeter for accurate SpO2 oxygen saturation and pulse rate monitoring with OLED display.",
    type: "equipment",
    category: "Monitoring Devices",
    price: 1299.00,
    mrp: 1800.00,
    stock: 60,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1583912267670-6575ad362e49?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000015",
    name: "Dr. Morepen Digital Clinical Thermometer",
    description: "Quick 60-second reading, waterproof digital thermometer with fever alarm and memory recall.",
    type: "equipment",
    category: "Monitoring Devices",
    price: 199.00,
    mrp: 275.00,
    stock: 180,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000016",
    name: "Accu-Chek Active Blood Glucose Monitor",
    description: "Simple, accurate blood sugar testing kit with 10 test strips, lancing device, and 10 lancets included.",
    type: "equipment",
    category: "Diabetes Care",
    price: 1450.00,
    mrp: 1699.00,
    stock: 50,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000017",
    name: "Omron NE-C28P Compressor Nebulizer",
    description: "Heavy-duty hospital-grade nebulizer for efficient respiratory therapy for asthma, COPD, and bronchitis.",
    type: "equipment",
    category: "Respiratory Care",
    price: 2899.00,
    mrp: 3450.00,
    stock: 30,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1583912267670-6575ad362e49?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000018",
    name: "KosmoCare Standard Steel Folding Wheelchair",
    description: "Durable chrome-plated steel frame wheelchair with cushioned armrests, footrests, and 100 kg weight capacity.",
    type: "equipment",
    category: "Mobility & Support",
    price: 6499.00,
    mrp: 8200.00,
    stock: 15,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000019",
    name: "Friends Easy Adult Diapers (Large, 10 pcs)",
    description: "High absorbency adult incontinence diapers with wetness indicator and leak-guard barriers.",
    type: "equipment",
    category: "Hygiene & Care",
    price: 499.00,
    mrp: 620.00,
    stock: 90,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000020",
    name: "Comprehensive Family First Aid Kit",
    description: "Emergency medical kit containing sterile gauze, bandages, antiseptic cream, scissors, tape, and emergency guide.",
    type: "equipment",
    category: "First Aid & Wellness",
    price: 799.00,
    mrp: 999.00,
    stock: 100,
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",
    is_active: true,
  },
];

export default function EquipmentList() {
  const [products, setProducts] = useState(FALLBACK_EQUIPMENT);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    async function fetchEquipment() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("type", "equipment")
          .eq("is_active", true);

        if (!error && data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(FALLBACK_EQUIPMENT);
        }
      } catch (err) {
        console.warn("Using fallback equipment:", err);
        setProducts(FALLBACK_EQUIPMENT);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, []);

  const categories = [
    "all",
    "Monitoring Devices",
    "Respiratory Care",
    "Mobility & Support",
    "Diabetes Care",
    "Hygiene & Care",
    "First Aid & Wellness",
  ];

  const filteredProducts = products
    .filter((prod) => {
      if (selectedCategory !== "all" && prod.category !== selectedCategory) {
        return false;
      }
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
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>Home Healthcare & Medical Devices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Medical Equipment & Monitoring
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Certified blood pressure monitors, pulse oximeters, wheelchairs, and respiratory nebulizers.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Manufacturer Warranty on All Devices</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medical equipment (e.g., BP monitor, Wheelchair, Nebulizer)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium text-slate-700"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Product Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
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
              {cat === "all" ? "All Equipment" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{filteredProducts.length}</strong> medical devices
          </span>
          <span>Certified Quality</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Devices Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No equipment matches your search query. Try broadening your keywords.
            </p>
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
