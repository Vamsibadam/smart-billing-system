import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

function Products() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showEditModal, setShowEditModal] =
  useState(false);

  const [selectedProduct, setSelectedProduct] =
  useState(null);

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
        stock: "",
        status: "active",
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
        stock: "",
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
            <th className="pb-3 text-left w-32">Stock</th>
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
              {/* Increased internal cell padding values (p-5) and bumped font-sizes to text-base */}
              <td className="p-5 font-mono text-xs font-bold text-slate-400 pl-5 rounded-l-2xl">
                {product.id}
              </td>
              
              <td className="p-5 font-bold text-slate-700 text-base">
                {product.name}
              </td>
              
              <td className="p-5 font-black text-slate-800 text-base">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </td>
              
              <td className="p-5 font-bold text-slate-500 text-base">
                {product.stock} <span className="text-xs text-slate-400 font-medium ml-0.5">units</span>
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

              {/* Action Buttons with subtle, beautiful background pill shapes on hover */}
              <td className="p-4 text-center rounded-r-2xl font-semibold text-m">
                <button
                  onClick={() => handleEditClick(product)}
                  className="
                  text-indigo-700 
                  bg-indigo-50
                  px-3.5 
                  py-2 
                  rounded-xl 
                  hover:bg-indigo-200 
                  hover:text-indigo-900 
                  hover:scale-[1.15]
                  transition-all 
                  duration-300 
                  mr-2
                  "
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="
                  text-red-500 
                  px-3.5 
                  py-2 
                  rounded-xl 
                  hover:bg-red-100 
                  hover:text-red-600 
                  active:scale-95
                  transition-all 
                  duration-200
                  "
                >
                  Delete
                </button>
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
        Edit Product
      </h2>

      <input
        type="text"
        value={selectedProduct.name}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
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
        value={selectedProduct.price}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
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
        value={selectedProduct.stock}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
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

      <div
        className="
        flex
        gap-3
        "
      >

        <button
          onClick={handleUpdateProduct}
          className="
          flex-1
          bg-indigo-600
          text-white
          py-3
          rounded-xl
          hover:bg-indigo-700
          "
        >
          Update Product
        </button>

        <button
          onClick={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
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

    </MainLayout>
  );
}

export default Products;