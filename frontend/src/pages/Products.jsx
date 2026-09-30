import { useEffect, useState, useRef } from "react";
import RecipeModal from "../components/RecipeModal";

import MainLayout from "../layouts/MainLayout";
import { createPortal } from "react-dom";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import ComboModal from "../components/ComboModal";
import Notification from "../components/Notification";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import {
  Search,
  Plus,
  Sparkles,
  AlertCircle,
  X,
  Edit2,
  Check,
  Package,
} from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null); // null = "All"

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [stockDetailsProduct, setStockDetailsProduct] = useState(null);

  const longPressTimer = useRef(null);

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showComboModal, setShowComboModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  // Category Edit State
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const startLongPress = (product) => {
    longPressTimer.current = setTimeout(() => {
      if (!product.available) {
        setStockDetailsProduct(product);
        setShowStockDetails(true);
      }
    }, 700);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;

    try {
      await createCategory({ name: categoryName.trim() });
      setCategoryName("");
      fetchCategories();
      setNotification({
        show: true,
        type: "success",
        message: "Category added successfully.",
      });
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message: "Unable to create category.",
      });
    }
  };

  const handleStartEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleSaveEditCategory = async (id) => {
    if (!editingCategoryName.trim()) return;

    try {
      if (typeof updateCategory === "function") {
        await updateCategory(id, { name: editingCategoryName.trim() });
      }
      setEditingCategoryId(null);
      setEditingCategoryName("");
      fetchCategories();
      fetchProducts(); // Refresh in case category names on products change
      setNotification({
        show: true,
        type: "success",
        message: "Category updated successfully.",
      });
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message: "Unable to update category.",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      fetchCategories();
      if (selectedCategoryFilter === id) {
        setSelectedCategoryFilter(null);
      }
      setNotification({
        show: true,
        type: "success",
        message: "Category deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message: "Unable to delete category.",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================================================
      CATEGORY & SEARCH FILTERING
  ========================================================== */
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === null ||
      Number(product.category) === Number(selectedCategoryFilter) ||
      product.category_name?.toLowerCase() ===
        categories
          .find((c) => c.id === selectedCategoryFilter)
          ?.name?.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    status: "active",
    product_type: "PRODUCT",
    category: "",
  });

  const handleCreateProduct = async () => {
    try {
      await createProduct(newProduct);
      setNotification({
        show: true,
        type: "success",
        message: "Product added successfully.",
      });
      setShowAddModal(false);
      setNewProduct({
        name: "",
        price: "",
        status: "active",
        product_type: "PRODUCT",
        category: "",
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message:
          error.response?.data?.name?.[0] ||
          error.response?.data?.price?.[0] ||
          error.response?.data?.category?.[0] ||
          "Unable to create product.",
      });
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct(selectedProduct.id, selectedProduct);
      fetchProducts();
      setNotification({
        show: true,
        type: "success",
        message: "Product updated successfully.",
      });
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message:
          error.response?.data?.name?.[0] ||
          error.response?.data?.price?.[0] ||
          error.response?.data?.category?.[0] ||
          "Unable to update product.",
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      fetchProducts();
      setNotification({
        show: true,
        type: "success",
        message: "Product deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.detail || "Unable to delete product.",
      });
    }
  };

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (!notification.show) return;
    const timer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification.show]);

  return (
    <MainLayout>
      <div className="w-full pb-36 lg:pb-12">
        {/* =========================================================
            HEADER & TOP ACTIONS
        ========================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6 mt-2 sm:mt-5 relative z-10 px-3.5 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                Products
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
                <Sparkles size={10} /> {filteredProducts.length} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
              Manage inventory listings, base pricing, and availability
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="
                flex-1 sm:flex-none
                bg-white
                border border-slate-200
                text-slate-700
                px-4 sm:px-6
                py-2.5 sm:py-3.5
                rounded-xl sm:rounded-2xl
                text-xs sm:text-sm
                font-bold
                hover:bg-slate-50
                active:scale-95
                transition-all
                cursor-pointer
                text-center
              "
            >
              Categories
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="
                flex-1 sm:flex-none
                bg-gradient-to-r from-orange-500 to-indigo-600
                text-white
                px-4 sm:px-6
                py-2.5 sm:py-3.5
                rounded-xl sm:rounded-2xl
                text-xs sm:text-sm
                font-bold
                tracking-wide
                shadow-sm
                hover:opacity-95
                active:scale-95
                transition-all
                duration-200
                cursor-pointer
                text-center
              "
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* =========================================================
            CATEGORY HORIZONTAL RIBBON
        ========================================================== */}
        <div className="px-3.5 sm:px-8 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter(null)}
              className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-xs ${
                selectedCategoryFilter === null
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              <span>All Items</span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  selectedCategoryFilter === null
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {products.length}
              </span>
            </button>

            {categories.map((category) => {
              const isSelected = selectedCategoryFilter === category.id;
              const count = products.filter(
                (p) =>
                  Number(p.category) === Number(category.id) ||
                  p.category_name?.toLowerCase() === category.name?.toLowerCase()
              ).length;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(category.id)}
                  className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 text-white shadow-md shadow-orange-500/25"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                  }`}
                >
                  <span>{category.name}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            SEARCH & INVENTORY LEDGER
        ========================================================== */}
        <div
          className="
            bg-white/80
            backdrop-blur-md
            border border-slate-200/80
            rounded-2xl sm:rounded-[28px]
            mx-3 sm:mx-6
            px-3.5 sm:px-6
            py-4 sm:py-6
            shadow-xs
            relative 
            z-10
          "
        >
          {/* Search Box */}
          <div className="mb-4 sm:mb-6 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search product by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                bg-slate-50/70
                border border-slate-200/80
                text-slate-800
                rounded-xl sm:rounded-2xl
                py-2.5 sm:py-3.5
                pl-10 sm:pl-11
                pr-8 sm:pr-4
                text-xs sm:text-base
                font-medium
                placeholder:text-slate-400
                outline-none
                focus:bg-white
                focus:border-indigo-400
                transition-all
              "
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* =========================================================
              CLEAN RESTYLED MOBILE PRODUCT CARDS (Screen < md)
          ========================================================== */}
          <div className="block md:hidden space-y-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = !product.available;

              return (
                <div
                  key={product.id}
                  onMouseDown={() => startLongPress(product)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={() => startLongPress(product)}
                  onTouchEnd={cancelLongPress}
                  onTouchCancel={cancelLongPress}
                  className={`
                    relative
                    overflow-hidden
                    rounded-[24px]
                    bg-white
                    p-4
                    border
                    shadow-[0_8px_22px_-6px_rgba(15,23,42,0.06)]
                    transition-all
                    active:scale-[0.985]
                    space-y-3.5
                    ${
                      isOutOfStock
                        ? "border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/20"
                        : "border-slate-200/70 hover:border-slate-300"
                    }
                  `}
                >
                  {/* Left Ambient Status Spine */}
                  <div
                    className={`absolute left-0 inset-y-0 w-1.5 ${
                      isOutOfStock
                        ? "bg-gradient-to-b from-rose-500 to-amber-500"
                        : product.status === "active"
                        ? "bg-gradient-to-b from-indigo-500 to-cyan-400"
                        : "bg-slate-300"
                    }`}
                  />

                  {/* Top Bar: Category Pill + Status + Price Badge */}
                  <div className="flex items-center justify-between gap-2 pl-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-indigo-50/80 text-indigo-700 border border-indigo-100/60">
                        {product.category_name || "General"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-slate-100 text-slate-500 border-slate-200/80"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            product.status === "active"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-400"
                          }`}
                        />
                        {product.status}
                      </span>
                    </div>

                    {/* Dark Specular Price Capsule */}
                    <div className="shrink-0 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xs">
                      <span className="text-xs font-black tracking-tight">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="pl-1.5 space-y-0.5">
                    <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span className="font-mono font-bold">#{product.id}</span>
                      <span className="text-slate-500 font-semibold">
                        {product.product_type === "COMBO"
                          ? "Combo Pack"
                          : "Standard Item"}
                      </span>
                    </div>
                  </div>

                  {/* Out of Stock Warning Notice */}
                  {isOutOfStock && (
                    <div className="ml-1.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold">
                      <span className="flex items-center gap-1">
                        <AlertCircle size={12} /> Stock Depleted
                      </span>
                      <span className="text-rose-400 font-medium">
                        Hold card to view details
                      </span>
                    </div>
                  )}

                  {/* Action Pill Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 pl-1.5 border-t border-slate-100/80">
                    {product.product_type === "PRODUCT" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowRecipeModal(true);
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition cursor-pointer"
                      >
                        Recipe
                      </button>
                    )}

                    {product.product_type === "COMBO" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowComboModal(true);
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-black bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-95 transition cursor-pointer"
                      >
                        Combo
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEditClick(product)}
                      className="flex-1 py-2 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-100 text-rose-600 hover:bg-rose-50 active:scale-95 transition shrink-0 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="py-14 text-center text-xs font-semibold text-slate-400 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                No products found matching your filter.
              </div>
            )}
          </div>

          {/* =========================================================
              DESKTOP DATA TABLE (Screen >= md) WITH OUT-OF-STOCK DISPLAY
          ========================================================== */}
          <div className="hidden md:block overflow-x-auto max-w-full">
            <table className="w-full text-base border-separate border-spacing-y-3">
              <thead className="text-slate-400 font-black text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="pb-3 text-left pl-5 w-32">Product ID</th>
                  <th className="pb-3 text-left">Product</th>
                  <th className="pb-3 text-left w-40">Category</th>
                  <th className="pb-3 text-left w-36">Price</th>
                  <th className="pb-3 text-left w-48">Status & Stock</th>
                  <th className="pb-3 text-center w-44">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const isOutOfStock = !product.available;

                  return (
                    <tr
                      key={product.id}
                      onMouseDown={() => startLongPress(product)}
                      onMouseUp={cancelLongPress}
                      onMouseLeave={cancelLongPress}
                      className={`
                        bg-white border rounded-2xl overflow-hidden group hover:bg-slate-50/60 transition-all duration-200
                        ${isOutOfStock ? "border-rose-100" : "border-slate-100 shadow-3xs"}
                      `}
                    >
                      <td className="p-5 font-mono text-xs font-bold text-slate-400 pl-5 rounded-l-2xl">
                        {product.id}
                      </td>

                      <td className="p-5 font-bold text-slate-700 text-base">
                        <div className="flex items-center gap-2">
                          <span>{product.name}</span>
                          {product.product_type === "COMBO" && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
                              Combo
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="inline-flex px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
                          {product.category_name || "-"}
                        </span>
                      </td>

                      <td className="p-5 font-black text-slate-800 text-base">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      {/* DESKTOP STATUS & OUT OF STOCK DISPLAY */}
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                              product.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/40 shadow-3xs"
                                : "bg-slate-50 text-slate-500 border-slate-200/60"
                            }`}
                          >
                            {product.status}
                          </span>

                          {isOutOfStock ? (
                            <button
                              type="button"
                              onClick={() => {
                                setStockDetailsProduct(product);
                                setShowStockDetails(true);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 hover:bg-rose-100 transition cursor-pointer"
                              title="Click to view unavailable ingredients"
                            >
                              <AlertCircle size={11} /> Out of Stock
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-5 rounded-r-2xl text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.product_type === "PRODUCT" && (
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowRecipeModal(true);
                              }}
                              className="text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all duration-200 cursor-pointer"
                            >
                              Recipe
                            </button>
                          )}

                          {product.product_type === "COMBO" && (
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowComboModal(true);
                              }}
                              className="text-orange-700 bg-orange-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-100 transition-all duration-200 cursor-pointer"
                            >
                              Combo
                            </button>
                          )}

                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all duration-200 cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 bg-red-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-all duration-200 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: CATEGORIES MANAGEMENT (WITH EDIT & RENAME)
      ========================================================== */}
      {showCategoryModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-[120] p-0 sm:p-4"
            onClick={() => {
              setShowCategoryModal(false);
              handleCancelEditCategory();
            }}
          >
            <div
              className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-[500px] p-5 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-[slideUp_0.25s_ease-out] sm:animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                    Product Categories
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Create, rename, and manage item categories
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    handleCancelEditCategory();
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Add Category Input */}
              <div className="flex gap-2 mb-4 sm:mb-6">
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateCategory();
                  }}
                  placeholder="New category name"
                  className="flex-1 border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="bg-gradient-to-r from-orange-500 to-indigo-600 text-white px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Category Items List with Inline Edit */}
              <div className="space-y-2 max-h-56 sm:max-h-72 overflow-y-auto pr-1">
                {categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;

                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between border border-slate-100 bg-slate-50/60 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold gap-2"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveEditCategory(category.id);
                              if (e.key === "Escape")
                                handleCancelEditCategory();
                            }}
                            autoFocus
                            className="flex-1 bg-white border border-indigo-400 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(category.id)}
                            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                            title="Save name"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditCategory}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-slate-800 font-bold truncate">
                            {category.name}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(category)}
                              className="px-2.5 py-1 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 font-bold text-xs transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {categories.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No categories created yet.
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4 sm:mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    handleCancelEditCategory();
                  }}
                  className="w-full sm:w-auto border border-slate-200 text-slate-600 rounded-xl px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          MODAL: ADD PRODUCT
      ========================================================== */}
      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="bg-white rounded-t-[32px] sm:rounded-2xl p-5 sm:p-8 w-full max-w-[450px] max-h-[90vh] overflow-y-auto shadow-2xl animate-[slideUp_0.25s_ease-out] sm:animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Add Product
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm font-semibold outline-none focus:border-indigo-500"
              />

              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm font-semibold outline-none focus:border-indigo-500"
              />

              <input
                type="number"
                placeholder="Initial Stock"
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm font-semibold outline-none focus:border-indigo-500"
              />

              <select
                value={newProduct.product_type}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    product_type: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm font-semibold outline-none focus:border-indigo-500"
              >
                <option value="PRODUCT">Regular Product</option>
                <option value="COMBO">Combo Product</option>
              </select>

              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-3 mb-6 text-sm font-semibold outline-none focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateProduct}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          MODAL: EDIT PRODUCT
      ========================================================== */}
      {showEditModal &&
        selectedProduct &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] sm:animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                    Edit Product
                  </h2>
                  <p className="text-slate-400 mt-0.5 text-xs sm:text-sm">
                    Update core product listing information
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 block">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={selectedProduct.name}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 block">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={selectedProduct.price}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        price: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={selectedProduct.category || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-800"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 block">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={selectedProduct.stock || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        stock: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 sm:gap-4 p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 bg-white text-xs sm:text-sm active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-indigo-600 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer"
                >
                  Update Product
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          MODAL: STOCK UNAVAILABLE DETAILS
      ========================================================== */}
      {showStockDetails &&
        stockDetailsProduct &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-[130] p-0 sm:p-4"
            onClick={() => {
              setShowStockDetails(false);
              setStockDetailsProduct(null);
            }}
          >
            <div
              className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] sm:animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 sm:px-7 sm:py-6 border-b border-slate-100 flex justify-between items-start gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                    Stock Unavailable
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
                    {stockDetailsProduct.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                    Unavailable ingredient(s) preventing this item from being sold.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowStockDetails(false);
                    setStockDetailsProduct(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="p-5 sm:p-7 space-y-2.5">
                {stockDetailsProduct.unavailable_ingredients?.map(
                  (ingredient, index) => (
                    <div
                      key={index}
                      className="bg-red-50/70 border border-red-100 rounded-2xl p-3.5 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                          {ingredient.ingredient}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Required: {ingredient.required}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-black text-red-600 uppercase">
                          Available
                        </p>
                        <p className="text-base sm:text-lg font-black text-red-700">
                          {ingredient.available}
                        </p>
                      </div>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowStockDetails(false);
                    setStockDetailsProduct(null);
                  }}
                  className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Auxiliary Dialogs */}
      {showRecipeModal && (
        <RecipeModal
          product={selectedProduct}
          onSaved={() => {
            setNotification({
              show: true,
              type: "success",
              message: "Recipe saved successfully.",
            });
          }}
          onClose={() => {
            setShowRecipeModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showComboModal && (
        <ComboModal
          product={selectedProduct}
          onClose={() => {
            setShowComboModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() =>
          setNotification((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />
    </MainLayout>
  );
}

export default Products;