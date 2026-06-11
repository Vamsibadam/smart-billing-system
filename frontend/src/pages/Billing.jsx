import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  searchProducts,
  createBill,
} from "../services/billingService";
import {useNavigate} from "react-router-dom";

function Billing() {
  const navigate =
  useNavigate();

const [search, setSearch] =
  useState("");

const [products, setProducts] =
  useState([]);

const [cart, setCart] =
  useState([]);

const [paymentMethod,
  setPaymentMethod] =
  useState("cash");

const [generatedBill,
  setGeneratedBill] =
  useState(null);

const [showBillModal,
  setShowBillModal] =
  useState(false);

const [cartLoaded,
  setCartLoaded] =
  useState(false);

const [paymentLoaded,
  setPaymentLoaded] =
  useState(false);

useEffect(() => {

  const savedCart =
    localStorage.getItem(
      "billing_cart"
    );

  if (savedCart) {

    try {

      setCart(
        JSON.parse(
          savedCart
        )
      );

    } catch {

      localStorage.removeItem(
        "billing_cart"
      );

    }

  }

  setCartLoaded(true);

}, []);

useEffect(() => {

  if (!cartLoaded) {
    return;
  }

  localStorage.setItem(
    "billing_cart",
    JSON.stringify(
      cart
    )
  );

}, [
  cart,
  cartLoaded
]);

useEffect(() => {

  const savedPayment =
    localStorage.getItem(
      "payment_method"
    );

  if (savedPayment) {

    setPaymentMethod(
      savedPayment
    );

  }

  setPaymentLoaded(true);

}, []);

useEffect(() => {

  if (!paymentLoaded) {
    return;
  }

  localStorage.setItem(
    "payment_method",
    paymentMethod
  );

}, [
  paymentMethod,
  paymentLoaded
]);

useEffect(() => {

  if (
    search.trim().length > 0
  ) {

    fetchProducts();

  } else {

    setProducts([]);

  }

}, [search]);

const fetchProducts =
  async () => {

    try {

      const data =
        await searchProducts(
          search
        );

      setProducts(data);

    } catch (error) {

      console.error(error);

    }
};

const addToCart =
  (product) => {

    const existing =
      cart.find(
        (item) =>
          item.id ===
          product.id
      );

    if (existing) {
      return;
    }

    setCart([

      ...cart,

      {
        ...product,
        quantity: 1,
      },

    ]);
};

const updateQuantity =
  (
    id,
    quantity
  ) => {

    const qty =
      parseInt(quantity);

    if (
      isNaN(qty) ||
      qty < 1
    ) {
      return;
    }

    const updated =
      cart.map(
        (item) => {

          if (
            item.id === id
          ) {

            return {

              ...item,

              quantity:
                qty,

            };

          }

          return item;

        }
      );

    setCart(updated);
};

const removeItem =
  (id) => {

    setCart(

      cart.filter(
        (item) =>
          item.id !== id
      )

    );
};

const totalAmount =
  cart.reduce(

    (total, item) =>

      total +

      Number(
        item.price
      ) *
      item.quantity,

    0

  );

const generateBill =
  async () => {

    try {

      if (
        cart.length === 0
      ) {

        alert(
          "Cart is empty"
        );

        return;
      }

      const items =
        cart.map(
          (item) => ({
            product_id:
              item.id,
            quantity:
              item.quantity,
          })
        );

      const response =
        await createBill(
          items,
          paymentMethod
        );

      setGeneratedBill(
        response
      );

      setShowBillModal(
        true
      );

      setCart([]);

      setPaymentMethod(
        "cash"
      );

      localStorage.removeItem(
        "billing_cart"
      );

      localStorage.removeItem(
        "payment_method"
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Failed to generate bill"
      );

    }

};
  return (
    <MainLayout>

      <div className="mb-6">

        <h1 className="text-4xl font-bold text-slate-800">
          Billing
        </h1>

        <p className="text-slate-500 mt-2">
          Create and manage sales transactions
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1">

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-semibold mb-4">
              Product Search
            </h2>

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
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />

            <div className="mt-4">

              {products.map(
                (product) => (

                <div
                  key={product.id}
                  onClick={() =>
                    addToCart(
                      product
                    )
                  }
                  className="
                  flex
                  justify-between
                  p-3
                  border-b
                  cursor-pointer
                  hover:bg-slate-50
                  transition
                  "
                >
                  <span>
                    {product.name}
                  </span>

                  <strong>
                    ₹
                    {product.price}
                  </strong>

                </div>

              ))}

            </div>

          </div>

        </div>

        <div className="lg:col-span-2">

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-semibold mb-4">
              Cart
            </h2>

            {cart.length === 0 ? (

              <div className="text-slate-500">
                No Items Added
              </div>

            ) : (

              <table className="w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-left">
                      Product
                    </th>

                    <th className="p-3 text-center">
                      Qty
                    </th>

                    <th className="p-3 text-center">
                      Price
                    </th>

                    <th className="p-3 text-center">
                      Total
                    </th>

                    <th className="p-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {cart.map(
                    (item) => (

                    <tr
                      key={
                        item.id
                      }
                    >

                      <td className="p-3 border-b">
                        {item.name}
                      </td>

                      <td className="p-3 border-b text-center">

                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity
                          }
                          onFocus={(e) =>
                            e.target.select()
                          }
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              e.target.value
                            )
                          }
                          className="
                          w-20
                          border
                          rounded-lg
                          p-2
                          text-center
                          "
                        />

                      </td>

                      <td className="p-3 border-b text-center">
                        ₹
                        {item.price}
                      </td>

                      <td className="p-3 border-b text-center">
                        ₹
                        {(
                          Number(
                            item.price
                          ) *
                          item.quantity
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td className="p-3 border-b text-center">

                        <button
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          className="
                          bg-red-500
                          text-white
                          px-3
                          py-1
                          rounded-lg
                          hover:bg-red-600
                          "
                        >
                          Remove
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

            <div className="mt-8 border-t pt-6">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-slate-500">
                    Grand Total
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800">
                    ₹ {totalAmount.toFixed(2)}
                  </h2>

                </div>

                <div>

                  <label className="block text-sm text-slate-500 mb-2">
                    Payment Method
                  </label>

                  <select
                    value={
                      paymentMethod
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="
                    border
                    rounded-xl
                    px-4
                    py-2
                    "
                  >
                    <option value="cash">
                      Cash
                    </option>

                    <option value="upi">
                      UPI
                    </option>

                    <option value="card">
                      Card
                    </option>

                    <option value="swiggy">
                      Swiggy
                    </option>

                    <option value="zomato">
                      Zomato
                    </option>

                  </select>

                </div>

              </div>

              <div className="mt-6">

                <button
                  onClick={
                    generateBill
                  }
                  className="
                  w-full
                  bg-blue-600
                  text-white
                  py-3
                  rounded-xl
                  text-lg
                  font-semibold
                  hover:bg-blue-700
                  transition
                  "
                >
                  Generate Bill
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

      {showBillModal &&
      generatedBill && (

        <div className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        ">

          <div className="
          bg-white
          rounded-2xl
          shadow-xl
          p-8
          w-[500px]
          ">

            <h2 className="
            text-2xl
            font-bold
            mb-4
            ">
              Bill Generated Successfully
            </h2>

            <div className="space-y-3">

              <p>
                <strong>
                  Bill Number:
                </strong>{" "}
                {
                  generatedBill.bill_number
                }
              </p>

              <p>
                <strong>
                  Total Amount:
                </strong>{" "}
                ₹{
                  generatedBill.total_amount
                }
              </p>

              <p>
                <strong>
                  Payment Method:
                </strong>{" "}
                {
                  generatedBill.payment_method
                }
              </p>

            </div>
            <button
                onClick={() =>
                  navigate(
                    `/invoice/${generatedBill.id}`
                  )
                }
                className="
                flex-l
                bg-purple-600
                text-white
                mt-2
                py-1.5
                px-2
                rounded-xl
                "
              >
                View Invoice
              </button>

            <div className="
              flex
              gap-3
              mt-8
              ">

              <a
                href={`http://127.0.0.1:8000/api/billing/history/${generatedBill.id}/pdf/`}
                target="_blank"
                rel="noreferrer"
                className="
                flex-1
                text-center
                bg-blue-600
                text-white
                py-3
                rounded-xl
                "
              >
                Download PDF
              </a>

              <button
                onClick={() =>
                  window.open(
                    `http://127.0.0.1:8000/api/billing/history/${generatedBill.id}/pdf/`,
                    "_blank"
                  )
                }
                className="
                flex-1
                bg-green-600
                text-white
                py-3
                rounded-xl
                "
              >
                Print
              </button>

              <button
            onClick={() => {

              setShowBillModal(
                false
              );

              setGeneratedBill(
                null
              );

              setSearch("");

              setProducts([]);

            }}
            className="
            flex-1
            bg-slate-700
            text-white
            py-3
            rounded-xl
            "
          >
            Close
          </button>

            </div>

          </div>

        </div>

      )}

    </MainLayout>
  );
}

export default Billing;

