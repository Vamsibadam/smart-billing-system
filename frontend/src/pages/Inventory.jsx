import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getInventory,
  getInventoryLogs,
  addStock,
} from "../services/inventoryService";

function Inventory() {

  const [inventory, setInventory] =
    useState([]);

  const [logs, setLogs] =
    useState([]);

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [searchProduct, setSearchProduct] =
    useState("");

  useEffect(() => {

    fetchInventory();

    fetchLogs();

  }, []);

  const fetchInventory =
    async () => {

      try {

        const data =
          await getInventory();

        setInventory(data);

      } catch (error) {

        console.error(error);
      }
  };

  const fetchLogs =
    async () => {

      try {

        const data =
          await getInventoryLogs();

        setLogs(data);

      } catch (error) {

        console.error(error);
      }
  };

  const handleAddStock =
    async () => {

      try {

        if (!productId) {

          alert(
            "Select a product"
          );

          return;
        }

        if (!quantity) {

          alert(
            "Enter quantity"
          );

          return;
        }

        await addStock({
          product_id: productId,
          quantity: quantity,
        });

        setProductId("");

        setSearchProduct("");

        setQuantity("");

        fetchInventory();

        fetchLogs();

        alert(
          "Stock Added Successfully"
        );

      } catch (error) {

        console.error(error);

        alert(
          "Failed to add stock"
        );
      }
  };

  const filteredProducts =
    inventory.filter((product) =>
      product.name
        .toLowerCase()
        .includes(
          searchProduct.toLowerCase()
        )
    );

  return (
    <MainLayout>

      <div className="mb-6">

        <h1 className="text-4xl font-bold text-slate-800">
          Inventory
        </h1>

        <p className="text-slate-500 mt-2">
          Manage stock and inventory movements
        </p>

      </div>

      {/* Add Stock */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          Add Stock
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="relative">

            <input
              type="text"
              placeholder="Search Product..."
              value={searchProduct}
              onChange={(e) =>
                setSearchProduct(
                  e.target.value
                )
              }
              className="
              w-full
              border
              rounded-xl
              p-3
              "
            />

            {searchProduct && (

              <div
                className="
                absolute
                w-full
                bg-white
                border
                rounded-xl
                mt-1
                max-h-48
                overflow-y-auto
                shadow-lg
                z-10
                "
              >

                {filteredProducts.length > 0 ? (

                  filteredProducts.map(
                    (product) => (

                    <div
                      key={product.id}
                      onClick={() => {

                        setProductId(
                          product.id
                        );

                        setSearchProduct(
                          product.name
                        );
                      }}
                      className="
                      p-3
                      cursor-pointer
                      hover:bg-slate-100
                      "
                    >
                      {product.name}
                    </div>

                  ))

                ) : (

                  <div className="p-3 text-slate-500">
                    No products found
                  </div>

                )}

              </div>

            )}

          </div>

          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value
              )
            }
            className="
            border
            rounded-xl
            p-3
            "
          />

          <button
            onClick={
              handleAddStock
            }
            className="
            bg-blue-600
            text-white
            rounded-xl
            hover:bg-blue-700
            transition
            "
          >
            Add Stock
          </button>

        </div>

      {/* Current Inventory */}


      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          Current Inventory
        </h2>

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-3 text-left">
                Product
              </th>

              <th className="p-3 text-left">
                Stock
              </th>

            </tr>

          </thead>

          <tbody>

            {inventory.map(item => (

              <tr key={item.id}>

                <td className="p-3 border-b">
                  {item.name}
                </td>

                <td className="p-3 border-b">

                  <span
                    className={
                      item.stock <= 10
                      ? "text-red-500 font-bold"
                      : "font-medium"
                    }
                  >
                    {item.stock}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      

        {productId && (

          <div
            className="
            mt-4
            text-green-600
            font-medium
            "
          >

            Selected Product:

            {" "}

            {
              inventory.find(
                p =>
                  p.id ===
                  Number(productId)
              )?.name
            }

          </div>

        )}

      </div>

      {/* Inventory History */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-semibold mb-4">
          Inventory History
        </h2>

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-3">
                Product
              </th>

              <th className="p-3">
                Type
              </th>

              <th className="p-3">
                Qty
              </th>

              <th className="p-3">
                Previous
              </th>

              <th className="p-3">
                New
              </th>

            </tr>

          </thead>

          <tbody>

            {logs.map(log => (

              <tr key={log.id}>

                <td className="p-3 border-b">
                  {log.product_name}
                </td>

                <td className="p-3 border-b">

                  <span
                    className={
                      log.transaction_type ===
                      "SALE"
                      ? "text-red-500 font-semibold"
                      : "text-green-600 font-semibold"
                    }
                  >
                    {log.transaction_type}
                  </span>

                </td>

                <td className="p-3 border-b">
                  {log.quantity_changed}
                </td>

                <td className="p-3 border-b">
                  {log.previous_stock}
                </td>

                <td className="p-3 border-b">
                  {log.new_stock}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </MainLayout>
  );
}

export default Inventory;