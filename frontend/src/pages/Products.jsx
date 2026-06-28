import { useEffect, useState } from "react";
import RecipeModal from "../components/RecipeModal";

import MainLayout from "../layouts/MainLayout";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import ComboModal from "../components/ComboModal";
import Notification from "../components/Notification";

function Products() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedProduct, setSelectedProduct] =useState(null);

  const [showRecipeModal,setShowRecipeModal] = useState(false);

const [showComboModal, setShowComboModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {

      const data =
        await getProducts();

      setProducts(data);

    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts =
    products.filter(product =>
      product.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

const [message, setMessage] = useState("");

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [newProduct, setNewProduct] =
    useState({
        name: "",
        price: "",
        status: "active",
        product_type: "PRODUCT",
    });

    const handleCreateProduct =
  async () => {

    try {

      await createProduct(
        newProduct
      );
      setMessage("Product added successfully!");
      setShowAddModal(false);

      setNewProduct({
        name: "",
        price: "",
        status: "active",
      });

      fetchProducts();

    } catch (error) {

  console.error(error);

  console.log(
    error.response?.data
  );

  alert(
    JSON.stringify(
      error.response?.data
    )
  );
}
};

const handleEditClick = (product) => {

  setSelectedProduct(product);

  setShowEditModal(true);
};


const handleUpdateProduct =
  async () => {

    try {

      await updateProduct(
        selectedProduct.id,
        selectedProduct
      );

      fetchProducts();

      setShowEditModal(false);

    } catch (error) {

      console.error(error);

      alert(
        "Failed to update product"
      );
    }
};

const handleDeleteProduct =
  async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this product?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await deleteProduct(id);

      fetchProducts();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to delete product"
      );
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
      {message && (

  <div
    className="
    bg-green-100
    text-green-800
    border
    border-green-300
    px-5
    py-3
    rounded-xl
    mb-5
    font-semibold
    "
  >
    {message}
  </div>

)}

<>
  {/* Modern Header Section */}
  <div className="flex justify-between items-center mb-8 relative z-10 px-2">
    <div>
      <h1 className="text-3xl font-black tracking-tight text-slate-800">
        Products
      </h1>
      <p className="text-sm font-semibold text-slate-400 mt-1">
        Manage inventory listings, base pricing structures, and stock availability metrics.
      </p>
    </div>
   

    <button
      onClick={() => setShowAddModal(true)}
      className="
      bg-gradient-to-r from-orange-500 to-indigo-600
      text-white
      px-6
      py-3.5
      rounded-2xl
      text-sm
      font-bold
      tracking-wide
      shadow-sm
      hover:opacity-95
      hover:scale-[1.005]
      transition-all
      duration-200
      "
    >
      + Add Product
    </button>
  </div>

  {/* Main Table Content Module */}
  <div 
    className="
    bg-white/80
    backdrop-blur-md
    border border-white/60
    rounded-[28px]
    p-8 /* Increased main box inner padding */
    shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02),0_12px_35px_-10px_rgba(99,102,241,0.03)]
    relative 
    z-10
    "
  >
    
    {/* Filter Input Field */}
    <div className="mb-8">
      <input
        type="text"
        placeholder="Filter products by code, status, or asset name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
        w-full
        bg-slate-50/60
        border border-slate-200/80
        text-slate-800
        rounded-2xl
        p-4.5 /* Increased input inner padding */
        text-base /* Upgraded font size */
        font-medium
        placeholder:text-slate-400
        outline-none
        focus:bg-white
        focus:border-indigo-400
        transition-all
        "
      />
    </div>

    {/* Product Inventory Data Grid */}
    <div className="overflow-x-auto max-w-full">
      {/* Increased spacing-y layout for breathing room between rows */}
      <table className="w-full text-base border-separate border-spacing-y-3">
        <thead className="text-slate-400 font-black text-[11px] tracking-wider uppercase">
          <tr>
            <th className="pb-3 text-left pl-5 w-32">Product ID</th>
            <th className="pb-3 text-left">Product</th>
            <th className="pb-3 text-left w-36">Price</th>
            <th className="pb-3 text-left w-36">Status</th>
            <th className="pb-3 text-center w-44">Actions</th>
          </tr>
        </thead>

        <tbody>
  {filteredProducts.map((product) => (
    <tr 
      key={product.id} 
      className="bg-white border border-slate-100 shadow-3xs rounded-2xl overflow-hidden group hover:bg-slate-50/60 transition-all duration-200"
    >
      <td className="p-5 font-mono text-xs font-bold text-slate-400 pl-5 rounded-l-2xl">
        {product.id}
      </td>
      
      <td className="p-5 font-bold text-slate-700 text-base">
        {product.name}
      </td>
      
      <td className="p-5 font-black text-slate-800 text-base">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </td>
      
      <td className="p-5">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border ${
          product.status === 'active' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40 shadow-3xs' 
            : 'bg-slate-50 text-slate-500 border-slate-200/60'
        }`}>
          {product.status}
        </span>
      </td>

      {/* FIXED: Formatted into a clean, aligned actions deck */}
      <td className="p-5 rounded-r-2xl text-right">
        <div className="flex items-center justify-end gap-2">
          
          {product.product_type === "PRODUCT" && (
            <button
              onClick={() => {
                setSelectedProduct(product);
                setShowRecipeModal(true);
              }}
              className="
                text-emerald-700
                bg-emerald-50
                px-4
                py-2
                rounded-xl
                text-sm
                font-bold
                hover:bg-emerald-100
                transition-all
                duration-200
                cursor-pointer
              "
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
              className="
                text-orange-700
                bg-orange-50
                px-4
                py-2
                rounded-xl
                text-sm
                font-bold
                hover:bg-orange-100
                transition-all
                duration-200
                cursor-pointer
              "
            >
              Combo
            </button>
          )}

          <button
            onClick={() => handleEditClick(product)}
            className="
              text-indigo-700 
              bg-indigo-50
              px-4 
              py-2 
              rounded-xl 
              text-sm
              font-bold
              hover:bg-indigo-100 
              transition-all 
              duration-200 
              cursor-pointer
            "
          >
            Edit
          </button>

          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="
              text-red-600 
              bg-red-50
              px-4 
              py-2 
              rounded-xl 
              text-sm
              font-bold
              hover:bg-red-100 
              transition-all 
              duration-200
              cursor-pointer
            "
          >
            Delete
          </button>
          
        </div>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  </div>
</>

{showAddModal && (

  <div
    className="
    fixed
    inset-0
    bg-black/50
    flex
    items-center
    justify-center
    z-50
    "
  >

    <div
      className="
      bg-white
      rounded-2xl
      p-8
      w-[450px]
      shadow-xl
      "
    >

      <h2
        className="
        text-2xl
        font-bold
        mb-6
        "
      >
        Add Product
      </h2>


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
        className="
        w-full
        border
        rounded-xl
        p-3
        mb-4
        "
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
        className="
        w-full
        border
        rounded-xl
        p-3
        mb-4
        "
      />


      <input
        type="number"
        placeholder="Stock"
        value={newProduct.stock}
        onChange={(e) =>
          setNewProduct({
            ...newProduct,
            stock: e.target.value,
          })
        }
        className="
        w-full
        border
        rounded-xl
        p-3
        mb-6
        "
      />

      <select
      value={newProduct.product_type}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          product_type: e.target.value,
        })
      }
      className="w-full border rounded-xl p-3 mb-6"
    >
      <option value="PRODUCT">Regular Product</option>
      <option value="COMBO">Combo Product</option>
    </select>


      <div
        className="
        flex
        gap-3
        "
      >

        <button
          onClick={handleCreateProduct}
          className="
          flex-1
          bg-blue-600
          text-white
          py-3
          rounded-xl
          hover:bg-blue-700
          "
        >
          Save Product
        </button>


        <button
          onClick={() =>
            setShowAddModal(false)
          }
          className="
          flex-1
          bg-slate-500
          text-white
          py-3
          rounded-xl
          hover:bg-slate-600
          "
        >
          Cancel
        </button>

      </div>

    </div>

  </div>

)}
{showEditModal && selectedProduct && (
  <div
    className="
    fixed
    inset-0
    bg-slate-950/40
    backdrop-blur-sm
    flex
    items-center
    justify-center
    z-50
    p-4
    "
  >
    {/* Upgraded to a clean horizontal rectangle frame layout */}
    <div
      className="
      bg-white
      w-full
      max-w-4xl
      rounded-3xl
      shadow-2xl
      border
      border-slate-200
      overflow-hidden
       animate-in fade-in zoom-in-95 duration-150
      "
    >
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-slate-100">
        <h2 className="text-2xl font-black text-slate-800">
          Edit Product
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Update core product listing information
        </p>
      </div>

      {/* Body Section: Multi-column Horizontal Grid layout */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div>
          <label className="text-sm font-semibold text-slate-600 mb-2 block">
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
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-600 mb-2 block">
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
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-600 mb-2 block">
            Current Stock
          </label>
          <input
            type="number"
            placeholder="0"
            value={selectedProduct.stock}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                stock: e.target.value,
              })
            }
            className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-800"
          />
        </div>

      </div>

      {/* Footer Section: Right-Aligned Action Bar */}
      <div className="flex justify-end gap-4 p-6 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          className="
          px-6
          py-3
          border
          border-slate-300
          rounded-xl
          font-bold
          text-slate-600
          hover:bg-slate-100
          bg-white
          transition-all
          cursor-pointer
          text-sm
          "
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateProduct}
          className="
          px-8
          py-3
          bg-gradient-to-r
          from-orange-500
          to-indigo-600
          rounded-xl
          text-white
          font-bold
          hover:opacity-95
          transition-all
          cursor-pointer
          text-sm
          shadow-sm
          "
        >
          Update Product
        </button>
      </div>

    </div>
  </div>
)}

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