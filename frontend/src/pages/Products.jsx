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

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-4xl font-bold text-slate-800">
            Products
          </h1>

          <p className="text-slate-500 mt-2">
            Manage products and pricing
          </p>

        </div>

        <button
            onClick={() =>
                setShowAddModal(true)
            }
            className="
            bg-blue-600
            text-white
            px-5
            py-3
            rounded-xl
            hover:bg-blue-700
            "
            >
            + Add Product
            </button>

      </div>

      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        p-6
        "
      >

        <input
          type="text"
          placeholder="Search Product..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
          w-full
          border
          rounded-xl
          p-3
          mb-6
          "
        />

        <table className="w-full">

          <thead
            className="
            bg-slate-100
            "
          >
            <tr>

              <th className="p-3 text-left">
                Product
              </th>

              <th className="p-3 text-left">
                Price
              </th>

              <th className="p-3 text-left">
                Stock
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {filteredProducts.map(
              product => (

              <tr
                key={product.id}
              >
                <td className="p-3 border-b">
                  {product.name}
                </td>

                <td className="p-3 border-b">
                  ₹{product.price}
                </td>

                <td className="p-3 border-b">
                  {product.stock}
                </td>

                <td className="p-3 border-b">
                  {product.status}
                </td>

                <td className="p-3 border-b">

                  <button
                  onClick={() =>
                    handleEditClick(product)
                  }
                    className="
                    bg-yellow-500
                    text-white
                    px-3
                    py-1
                    rounded-lg
                    mr-2
                    "
                  >
                    Edit
                  </button>

                  <button
                  onClick={() => handleDeleteProduct(product.id)}
                    className="
                    bg-red-500
                    text-white
                    px-3
                    py-1
                    rounded-lg
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
      {showAddModal && (

<div
  className="
  fixed
  inset-0
  bg-black/40
  flex
  items-center
  justify-center
  "
>

  <div
    className="
    bg-white
    p-6
    rounded-2xl
    w-[450px]
    "
  >

    <h2
      className="
      text-2xl
      font-bold
      mb-4
      "
    >
      Add Product
    </h2>

    <input
      placeholder="Name"
      value={newProduct.name}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          name:
            e.target.value,
        })
      }
      className="
      w-full
      border
      p-3
      rounded-xl
      mb-3
      "
    />

    <input
      placeholder="Price"
      type="number"
      value={newProduct.price}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          price:
            e.target.value,
        })
      }
      className="
      w-full
      border
      p-3
      rounded-xl
      mb-3
      "
    />

    <input
      placeholder="Stock"
      type="number"
      value={newProduct.stock}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          stock:
            e.target.value,
        })
      }
      className="
      w-full
      border
      p-3
      rounded-xl
      mb-3
      "
    />

    <select
      value={
        newProduct.status
      }
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          status:
            e.target.value,
        })
      }
      className="
      w-full
      border
      p-3
      rounded-xl
      mb-4
      "
    >
      <option value="active">
        Active
      </option>

      <option value="inactive">
        Inactive
      </option>

    </select>

    <div
      className="
      flex
      justify-end
      gap-3
      "
    >

      <button
        onClick={() =>
          setShowAddModal(
            false
          )
        }
        className="
        px-4
        py-2
        border
        rounded-xl
        "
      >
        Cancel
      </button>

      <button
        onClick={
          handleCreateProduct
        }
        className="
        bg-blue-600
        text-white
        px-4
        py-2
        rounded-xl
        "
      >
        Save
      </button>

    </div>

  </div>

</div>

)}
{showEditModal && (

<div
  className="
  fixed
  inset-0
  bg-black/40
  flex
  items-center
  justify-center
  "
>

  <div
    className="
    bg-white
    p-6
    rounded-2xl
    w-[450px]
    "
  >

    <h2 className="text-2xl font-bold mb-4">
      Edit Product
    </h2>

    <input
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
      p-3
      rounded-xl
      mb-3
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
      p-3
      rounded-xl
      mb-3
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
      p-3
      rounded-xl
      mb-3
      "
    />

    <select
      value={selectedProduct.status}
      onChange={(e) =>
        setSelectedProduct({
          ...selectedProduct,
          status: e.target.value,
        })
      }
      className="
      w-full
      border
      p-3
      rounded-xl
      mb-4
      "
    >
      <option value="active">
        Active
      </option>

      <option value="inactive">
        Inactive
      </option>

    </select>

    <div
      className="
      flex
      justify-end
      gap-3
      "
    >

      <button
        onClick={() =>
          setShowEditModal(false)
        }
        className="
        px-4
        py-2
        border
        rounded-xl
        "
      >
        Cancel
      </button>

      <button
        onClick={
          handleUpdateProduct
        }
        className="
        bg-green-600
        text-white
        px-4
        py-2
        rounded-xl
        "
      >
        Update
      </button>

    </div>

  </div>

</div>

)}

    </MainLayout>
  );
}

export default Products;