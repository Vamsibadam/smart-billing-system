import { useState, useEffect, useRef} from "react";
import MainLayout from "../layouts/MainLayout";
import {
  searchProducts,
  createBill,
} from "../services/billingService";

import {
  useNavigate
} from "react-router-dom";
import {
  Search
  
} from "lucide-react";

function Billing() {
const navigate =
  useNavigate();

const [search, setSearch] =
  useState("");

const [products, setProducts] =
  useState([]);

const [cart, setCart] =
  useState([]);

const [
  selectedProductIndex,
  setSelectedProductIndex
] = useState(0);

const [
  selectedCartIndex,
  setSelectedCartIndex
] = useState(0);

const handleSearchKeyDown = (e) => {

  if (e.key === "ArrowDown") {

    e.preventDefault();

    setSelectedProductIndex(
      prev =>
        prev < products.length - 1
          ? prev + 1
          : 0
    );
  }


  if (e.key === "ArrowUp") {

    e.preventDefault();

    setSelectedProductIndex(
      prev =>
        prev > 0
          ? prev - 1
          : products.length - 1
    );
  }


  if (e.key === "Enter") {

    e.preventDefault();

    if (products.length > 0) {

      addToCart(
        products[selectedProductIndex]
      );
    }
  }

};

const [generatedBill,
  setGeneratedBill] =
  useState(null);

const [showBillModal,
  setShowBillModal] =
  useState(false);

const [cartLoaded,
  setCartLoaded] =
  useState(false);


  const [showPaymentModal, setShowPaymentModal] =
  useState(false);

const [payments, setPayments] =
  useState([
    {
      method: "upi",
      amount: ""
    }
  ]);

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



const searchInputRef =
  useRef(null);



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
    setSearch("");
    setProducts([]);
    setSelectedProductIndex(0);
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
    setSelectedCartIndex(0);
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

const generateBill = () => {

  if (
    cart.length === 0
  ) {

    alert(
      "Cart is empty"
    );

    return;
  }

  setPayments([
    {
      method: "upi",
      amount: totalAmount
    }
  ]);

  setShowPaymentModal(
    true
  );
};
const addPayment = () => {

  setPayments([
    ...payments,
    {
      method: "upi",
      amount: ""
    }
  ]);
};

const removePayment = (index) => {

  const updated =
    payments.filter(
      (_, i) =>
        i !== index
    );

  setPayments(updated);
};

const updatePayment = (
  index,
  field,
  value
) => {

  const updated =
    [...payments];

  updated[index][field] =
    value;

  setPayments(updated);
};

const paidAmount =
  payments.reduce(
    (
      total,
      payment
    ) =>
      total +
      Number(
        payment.amount || 0
      ),
    0
  );

  const remainingAmount = totalAmount - paidAmount;

  const closeButtonRef =
  useRef(null);

  useEffect(() => {

  if (showBillModal) {

    setTimeout(() => {

      closeButtonRef.current?.focus();

    }, 100);

  }

}, [showBillModal]);

  const confirmPayment =
  async () => {

    if (
      Math.abs(remainingAmount) > 0.01
    ) {

      alert(
        "Payment amount must match bill total"
      );

      return;
    }

    try {

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
          payments
        );

      setGeneratedBill(
        response
      );

      setShowPaymentModal(
        false
      );

      setShowBillModal(
        true
      );

      setCart([]);

      localStorage.removeItem(
        "billing_cart"
      );

      setPayments([
        {
          method: "upi",
          amount: ""
        }
      ]);

    } catch (error) {

      console.error(error);

      alert(
        "Failed to generate bill"
      );
    }
};
const confirmButtonRef =
  useRef(null);

  useEffect(() => {

  if (showPaymentModal) {

    setTimeout(() => {

      confirmButtonRef.current?.focus();

    }, 100);

  }

}, [showPaymentModal]);

const [showHeldBills, setShowHeldBills] =
    useState(false);

const [heldBills, setHeldBills] =
  useState([]);


useEffect(() => {

  const handleShortcuts = (e) => {

    if (e.ctrlKey && e.key === "Enter") {

      e.preventDefault();

      generateBill();

    }


    if (e.ctrlKey && e.key.toLowerCase() === "h") {

      e.preventDefault();

      holdBill();

    }


    if (e.ctrlKey && e.key.toLowerCase() === "b") {

      e.preventDefault();

      setShowHeldBills(true);

    }

    if (e.key === "Escape") {
  setShowHeldBills(false);
}

  };


  window.addEventListener(
    "keydown",
    handleShortcuts
  );


  return () => {

    window.removeEventListener(
      "keydown",
      handleShortcuts
    );

  };

}, [cart, heldBills]);




  useEffect(() => {

  const savedBills =
    localStorage.getItem(
      "held_bills"
    );

  if (savedBills) {

    setHeldBills(
      JSON.parse(savedBills)
    );

  }

}, []);

useEffect(() => {

  localStorage.setItem(
    "held_bills",
    JSON.stringify(
      heldBills
    )
  );

}, [heldBills]);

const holdBill = () => {

  if (
    cart.length === 0
  ) {

    alert(
      "Cart is empty"
    );

    return;

  }


  const newHold = {

    id: Date.now(),

    billNumber:
      heldBills.length + 1,

    items: cart,

    total: totalAmount,

    createdAt:
      new Date()
        .toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )

  };


  setHeldBills([
    ...heldBills,
    newHold
  ]);


  setCart([]);

  setSearch("");

  setProducts([]);

};
const resumeBill = (
  id
) => {

  const selectedBill =
    heldBills.find(
      bill =>
        bill.id === id
    );


  if (
    !selectedBill
  ) {
    return;
  }


  setCart(
    selectedBill.items
  );


  setHeldBills(

    heldBills.filter(
      bill =>
        bill.id !== id
    )

  );


  setSearch("");

  setProducts([]);

};

const deleteHeldBill = (
  id
) => {

  setHeldBills(

    heldBills.filter(
      bill =>
        bill.id !== id
    )

  );

};

useEffect(() => {

const handleCartShortcut = (e) => {


if (
cart.length === 0
)
return;


// Ignore if typing in search
if (
document.activeElement.tagName === "INPUT"
)
return;


// Move down
if (
e.key === "ArrowDown"
) {

e.preventDefault();

setSelectedCartIndex(
prev =>
prev < cart.length - 1
? prev + 1
: 0
);

}


// Move up
if (
e.key === "ArrowUp"
) {

e.preventDefault();

setSelectedCartIndex(
prev =>
prev > 0
? prev - 1
: cart.length - 1
);

}


// Increase quantity
if (
e.key === "+"
) {

e.preventDefault();

const item =
cart[selectedCartIndex];

updateQuantity(
item.id,
item.quantity + 1
);

}


// Decrease quantity
if (
e.key === "-"
) {

e.preventDefault();

const item =
cart[selectedCartIndex];


if (
item.quantity > 1
) {

updateQuantity(
item.id,
item.quantity - 1
);

}

}


// Remove item
if (
e.key === "Backspace"
) {

e.preventDefault();

removeItem(cart[selectedCartIndex].id);
setSelectedCartIndex(0);
}
};
window.addEventListener(
"keydown",
handleCartShortcut
);


return () => {

window.removeEventListener(
"keydown",
handleCartShortcut
);

};


}, [
cart,
selectedCartIndex
]);


  return (
    <MainLayout>

<div className="w-full min-h-screen bg-gradient-to-tr from-indigo-200/70 via-slate-50 to-orange-200/40 p-6 rounded-[24px]">

  <div className="mb-6 relative z-10">
    <h1 className="text-3xl font-black tracking-tight text-slate-800">
      Billing
    </h1>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
      Create and manage sales transactions
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full overflow-hidden pb-6 relative z-10 items-start">

    {/* Left Column: Product Search Box */}
    <div className="lg:col-span-1">
      <div className="bg-slate-900 backdrop-blur-md border border-slate-800 rounded-[24px] p-6 shadow-sm">

        <h2 className="text-lg font-black tracking-tight text-white mb-4">
          Product Search
        </h2>
        
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
        
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="
            w-full
            bg-white/20
            border border-slate-800
            text-white
            rounded-xl
            p-3.5
            pl-11
            text-sm
            font-semibold
            placeholder:text-slate-500
            outline-none
            focus:bg-white/15
            focus:border-indigo-500
            transition-all
            "
          />
        </div>

        <div className="mt-4 max-h-[300px] overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
          {products.map((product,index) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className={`
              flex
              justify-between
              items-center
              p-3
              rounded-xl
              cursor-pointer
              transition-all
              duration-200
              group
              ${
                index === selectedProductIndex
                  ? "bg-slate-600 border border-indigo-400 shadow-lg"
                  : "bg-slate-800/40 border border-slate-800/60 hover:bg-slate-800 hover:border-slate-700 rounded-xl"
              }
              `}
            >
              <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                {product.name}
              </span>

              <strong className="text-sm font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                ₹{product.price}
              </strong>
            </div>
          ))}
        </div>

      </div>
    </div>

    {/* Right Column: Cart Table Box */}
    <div className="lg:col-span-2">
      <div
        className="
        bg-gradient-to-br
        from-orange-300/30
        via-white
        to-indigo-300/30
        backdrop-blur-md
        border
        border-white
        rounded-[24px]
        p-6
        shadow-sm
        "
      >

        <h2 className="text-xl font-bold tracking-normal text-slate-800 mb-4">
          Cart
        </h2>

        {cart.length === 0 ? (
          <div className="text-sm font-bold text-slate-400 py-12 text-center bg-white/40 border border-dashed border-slate-200 rounded-xl uppercase tracking-wider">
            No Items Added
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-sm">
              <thead className="text-slate-400 font-black text-[13px] tracking-wider uppercase">
                <tr>
                  <th className="pb-3 text-left pl-2">Product</th>
                  <th className="pb-3 text-center w-24">Qty</th>
                  <th className="pb-3 text-center w-24">Price</th>
                  <th className="pb-3 text-center w-24">Total</th>
                  <th className="pb-3 text-center w-24">Action</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.id}
                    className={`
                    transition-all
                    duration-150
                    
                    bg-white/60 border-slate-500 rounded-l-xl
                    hover:bg-white
                    
                    `}
                  >
                    <td className="p-3.5 font-bold text-slate-700 rounded-l-xl">
                      {item.name}
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        className="
                        w-16
                        bg-slate-50
                        border border-slate-200
                        rounded-lg
                        p-1.5
                        text-center
                        text-xs
                        font-black
                        text-slate-800
                        outline-none
                        focus:bg-white
                        focus:border-indigo-400
                        transition-all
                        "
                      />
                    </td>

                    <td className="p-3 text-center font-bold text-slate-400">
                      ₹{item.price}
                    </td>

                    <td className="p-3 text-center font-black text-slate-800">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </td>

                    <td className="p-3 text-center rounded-r-xl">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="
                        text-xs
                        text-red-500
                        font-black
                        hover:text-red-600
                        px-2
                        py-1
                        rounded-lg
                        transition-all
                        "
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200/50 pt-5">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Grand Total</p>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-0.5">
                ₹{totalAmount.toFixed(2)}
              </h2>
            </div>

            
          </div>

          <div className="mt-5 flex gap-3 items-center">
          <button
            onClick={generateBill}
            className="
            flex-1 
            bg-gradient-to-r from-orange-500 to-indigo-600 
            text-white 
            py-3.5 
            rounded-xl 
            text-sm 
            font-bold 
            tracking-wide 
            shadow-sm 
            hover:opacity-95 
            hover:scale-[1.002] 
            transition-all 
            duration-200
            cursor-pointer
            "
          >
            Generate Bill
          </button>

          {/* FIXED: Adjusted to px-5 py-3.5 on a fixed-scale frame to look clean and tightly bound beside the gradient action */}
          <button
            onClick={holdBill}
            className="
            flex-initial
            bg-slate-500
            text-white
            px-5
            py-3.5
            rounded-xl
            text-sm
            font-bold
            tracking-wide
            shadow-sm
            hover:bg-slate-700
            hover:scale-[1.05]
            transition-all
            duration-200
            cursor-pointer
            "
          >
            Hold Bill
          </button>
          <button
            onClick={() => setShowHeldBills(true)}
            className="
            flex-initial
            bg-slate-500
            text-white
            px-5
            py-3.5
            rounded-xl
            text-sm
            font-bold
            tracking-wide
            shadow-sm
            hover:bg-slate-700
            hover:scale-[1.05]
            transition-all
            duration-200
            cursor-pointer
            "
          >
            View Held Bills
          </button>
        </div>
          
        </div>
        

      </div>
    </div>

  </div> 
</div>
{showPaymentModal && (

  <div
    className="
    fixed
    inset-0
    bg-black/40
    backdrop-blur-sm
    flex
    items-center
    justify-center
    z-50
    "
  >

    <div
      className="
      bg-white
      w-full
      max-w-lg
      rounded-2xl
      shadow-2xl
      p-6
      animate-fadeIn
      "
    >

      <h2
        className="
        text-2xl
        font-bold
        text-slate-800
        mb-2
        "
      >
        Complete Payment
      </h2>


      <p
        className="
        text-slate-500
        mb-6
        "
      >
        Total Amount
      </p>


      <h1
        className="
        text-4xl
        font-bold
        text-blue-600
        mb-6
        "
      >
        ₹ {totalAmount}
      </h1>


      <div className="space-y-3">

        {payments.map(
          (payment, index) => (

          <div
            key={index}
            className="
            flex
            gap-2
            "
          >

            <select

              value={payment.method}

              onChange={(e) =>
                updatePayment(
                  index,
                  "method",
                  e.target.value
                )
              }

              className="
              flex-1
              border
              rounded-xl
              p-3
              "
            >

              <option value="upi">
                UPI
              </option>
              <option value="cash">
                Cash
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


            <input

              type="number"

              placeholder="Amount"

              value={payment.amount}

              onChange={(e) =>
                updatePayment(
                  index,
                  "amount",
                  e.target.value
                )
              }

              className="
              w-32
              border
              rounded-xl
              p-3
              "
            />


            {payments.length > 1 && (

              <button

                onClick={() =>
                  removePayment(index)
                }

                className="
                px-3
                rounded-xl
                bg-red-100
                text-red-600
                hover:bg-red-200
                "
              >
                ✕
              </button>

            )}

          </div>

        ))}

      </div>


      <button

        onClick={addPayment}

        className="
        mt-4
        text-blue-600
        font-semibold
        hover:text-blue-800
        "
      >
        + Add Payment Method
      </button>


      <div
        className="
        mt-6
        p-4
        rounded-xl
        bg-slate-50
        space-y-2
        "
      >

        <div className="flex justify-between">

          <span>
            Paid
          </span>

          <span>
            ₹ {paidAmount}
          </span>

        </div>


        <div
          className="
          flex
          justify-between
          font-bold
          "
        >

          <span>
            Remaining
          </span>


          <span
            className={
              Math.abs(remainingAmount) <= 0.01
              ? "text-green-600"
              : "text-red-600"
            }
          >

            ₹ {remainingAmount}

          </span>

        </div>

      </div>


      <div
        className="
        flex
        gap-3
        mt-6
        "
      >

        <button

          onClick={() =>
            setShowPaymentModal(false)
          }

          className="
          flex-1
          p-3
          rounded-xl
          bg-slate-200
          hover:bg-slate-300
          "
        >
          Cancel
        </button>


        <button

          ref={confirmButtonRef}
          onClick={confirmPayment}
          className="
          flex-1
          p-3
          rounded-xl
          bg-blue-600
          text-white
          hover:bg-blue-700
          "
        >
          Confirm Bill
        </button>


      </div>

    </div>

  </div>

)}

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

              <div
  className="
  mt-4
  border-t
  pt-4
  "
>

  <h3
    className="
    font-semibold
    text-lg
    mb-3
    "
  >
    Payment Details
  </h3>


  {generatedBill?.payments?.map(
    (
      payment,
      index
    ) => (

      <div
        key={index}
        className="
        flex
        justify-between
        mb-2
        text-slate-700
        "
      >

        <span className="capitalize">

          {payment.method}

        </span>


        <span
          className="
          font-semibold
          "
        >

          ₹ {payment.amount}

        </span>


      </div>

    )
  )}


  <div
    className="
    border-t
    mt-3
    pt-3
    flex
    justify-between
    font-bold
    text-lg
    "
  >

    <span>
      Total Paid
    </span>


    <span>
      ₹ {generatedBill.total_amount}
    </span>

  </div>

</div>

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
              ref={closeButtonRef}
            onClick={() => {

              setShowBillModal(
                false
              );

              setGeneratedBill(
                null
              );

              setSearch("");

              setProducts([]);
              setTimeout(() => {

              searchInputRef.current?.focus();

            }, 100);

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

{showHeldBills && (
  <div
    className="
    fixed
    inset-0
    bg-slate-950/20
    backdrop-blur-sm
    flex
    items-center
    justify-center
    z-50
    p-4
    "
  >
    <div
      className="
      bg-white
      border border-slate-200/80
      rounded-[24px]
      shadow-xl
      w-full
      max-w-2xl
      p-8      
      "
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-normal text-slate-800">
          Held Bills
        </h2>

        <button
          onClick={() => setShowHeldBills(false)}
          className="
          text-slate-400
          hover:text-red-500
          text-lg
          font-bold
          transition-colors
          cursor-pointer
          "
        >
          ✕
        </button>
      </div>

      {/* Held Bills Content Body */}
      {heldBills.length === 0 ? (
        <div className="text-center py-16 text-base font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          No held bills
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1 scrollbar-none">
          {heldBills.map((bill) => (
            <div
              key={bill.id}
              className="
              bg-slate-50/40
              border border-slate-200/60
              rounded-2xl
              p-5 /* Increased internal item padding for a medium row presence */
              flex
              justify-between
              items-center
              hover:bg-slate-50
              transition-all
              duration-150
              shadow-sm
              "
            >
              <div>
                <h3 className="text-base font-bold text-slate-700">
                  Hold #{bill.billNumber}
                </h3>
                <p className="text-sm font-semibold text-slate-400 mt-1.5">
                  <span className="font-extrabold text-slate-700 text-base">₹ {bill.total}</span>
                  {" • "}{bill.items.length} items{" • "}{bill.createdAt}
                </p>
              </div>

              {/* Action Trigger Buttons Container */}
              <div className="flex gap-2.5 text-sm font-bold">
                <button
                  onClick={() => {
                    resumeBill(bill.id);
                    setShowHeldBills(false);
                  }}
                  className="
                  text-indigo-600 
                  px-4 
                  py-2 /* Increased vertical button padding for a solid layout presence */
                  rounded-xl 
                  hover:bg-indigo-200 
                  hover:scale-[1.05]
                  transition-all 
                  cursor-pointer
                  "
                >
                  Resume
                </button>

                <button
                  onClick={() => deleteHeldBill(bill.id)}
                  className="
                  text-red-500 
                  px-4 
                  py-2 /* Increased vertical button padding for a solid layout presence */
                  rounded-xl 
                  hover:bg-red-100 
                  hover:scale-[1.05]
                  transition-all 
                  cursor-pointer
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}


    </MainLayout>
  );
}

export default Billing;

