import { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  searchProducts,
  createBill,
  getProducts,
  getDiscounts,
} from "../services/billingService";
import { createPortal } from "react-dom";
import {
  useNavigate
} from "react-router-dom";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Keyboard

} from "lucide-react";
import { getRecipe, getCustomization } from "../services/recipeService";
import IngredientCustomizationModal from "../components/IngredientCustomizationModal";
import Notification from "../components/Notification";
import ComboCustomizationModal from "../components/ComboCustomizationModal";
import BillingTouch from "../components/billing/BillingTouch";
import { getCategories } from "../services/categoryService";
import CartPanel from "../components/billing/CartPanel";
import QuantityDialog from "../components/billing/QuantityDialog";
import TouchCartDrawer from "../components/billing/TouchCartDrawer";
import FloatingCheckoutButton from "../components/billing/FloatingCheckoutButton";
import CashBook from "../components/billing/CashBook";


function Billing() {
  const navigate =
    useNavigate();

  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [cart, setCart] = useState([]);

  const [showShortcuts, setShowShortcuts] = useState(false);

  const [
    selectedProductIndex,
    setSelectedProductIndex
  ] = useState(0);

  const [
    selectedCartIndex,
    setSelectedCartIndex
  ] = useState(0);

  const [showCustomize, setShowCustomize] = useState(false);

  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);

  const [selectedQuantityItem, setSelectedQuantityItem] = useState(null);
  const [showComboCustomize, setShowComboCustomize] = useState(false);

  const [comboCartItem, setComboCartItem] = useState(null);

  const [layout, setLayout] = useState(() => {
    return localStorage.getItem("billing_layout") || "classic";
  });
  useEffect(() => {
    localStorage.setItem("billing_layout", layout);
  }, [layout]);

  const [billingView, setBillingView] = useState("classic");
  useEffect(() => { setBillingView(layout); }, [layout]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showTouchCart, setShowTouchCart] = useState(false);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);


  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const saveCustomization = (overrides) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === selectedCartItem.id
          ? {
            ...item,
            recipe: selectedCartItem.recipe,
            combo_overrides: selectedCartItem.combo_overrides || [],
            ingredient_overrides: overrides,
          }
          : item
      )
    );
    setShowCustomize(false);
    setSelectedCartItem(null);
  };

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

        const selected = products[selectedProductIndex];

        if (!selected.available) {
          setNotification({
            show: true,
            type: "error",
            message: `${selected.name} is currently out of stock.`,
          });
          return;
        }

        addToCart(
          products[selectedProductIndex]
        );
      }
    }

  };
  const [posMode, setPosMode] = useState(
    localStorage.getItem("pos_mode") === "true"
  );
  useEffect(() => {

    localStorage.setItem("pos_mode", posMode);

    window.dispatchEvent(
      new Event("pos-mode-change")
    );

  }, [posMode]);

  const [generatedBill, setGeneratedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [payments, setPayments] =
    useState([
      {
        method: "upi",
        amount: ""
      }
    ]);

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

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

  const searchInputRef = useRef(null);

  useEffect(() => {

    if (layout !== "classic") {
      return;
    }

    if (search.trim().length > 0) {

      fetchProducts();

    } else {

      setProducts([]);

      setSelectedProductIndex(0);

    }

  }, [search, layout]);

  const fetchAllProducts = async () => {
    try {
      const data = await getProducts();
      setAllProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await searchProducts(search);
      setProducts(data);
      setSelectedProductIndex(0);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {

    fetchCategories();
    fetchAllProducts();

  }, []);

  const touchProducts = allProducts.filter((product) => {

    const matchesCategory =
      selectedCategory === null ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase());

    return (
      matchesCategory &&
      matchesSearch
    );

  });

  const addToCart = async (product) => {

    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {

      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
              ...item,
              quantity: item.quantity + 1,
            }
            : item
        )
      );

      return;
    }

    try {

      const recipe = await getCustomization(product.id);

      const cartItem = {
        ...product,
        quantity: 1,
        recipe,
        ingredient_overrides: [],
        combo_overrides: [],
      };

      setCart((prev) => [
        ...prev,
        cartItem,
      ]);

    } catch (err) {

      console.error(err);

    }

    setSearch("");
    setProducts([]);
    setSelectedProductIndex(0);

    searchInputRef.current?.focus();

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
  const increaseQuantity = () => {

    setCart((prev) =>
      prev.map((item) =>
        item.id === selectedQuantityItem.id
          ? {
            ...item,
            quantity: item.quantity + 1,
          }
          : item
      )
    );

    setSelectedQuantityItem((prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));

  };

  const decreaseQuantity = () => {

    if (selectedQuantityItem.quantity === 1) {
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === selectedQuantityItem.id
          ? {
            ...item,
            quantity: item.quantity - 1,
          }
          : item
      )
    );

    setSelectedQuantityItem((prev) => ({
      ...prev,
      quantity: prev.quantity - 1,
    }));

  };

  const removeFromDialog = () => {

    removeItem(selectedQuantityItem.id);

    setShowQuantityDialog(false);

    setSelectedQuantityItem(null);

  };
  const updateQuantityFromDialog = (newQuantity) => {

    if (
      !newQuantity ||
      newQuantity < 1
    ) {
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === selectedQuantityItem.id
          ? {
            ...item,
            quantity: Number(newQuantity),
          }
          : item
      )
    );

    setSelectedQuantityItem((prev) => ({
      ...prev,
      quantity: Number(newQuantity),
    }));

  };

 const subtotalAmount = cart.reduce(
  (total, item) =>
    total +
    Number(item.price) * item.quantity,
  0
);


// ==========================================
// PRODUCT DISCOUNT
// ==========================================

const productDiscountAmount = cart.reduce(
  (total, item) => {

    const productDiscount = discounts.find(
      (discount) =>
        discount.discount_type === "PRODUCT" &&
        discount.product === item.id &&
        discount.is_active
    );

    if (
      !productDiscount ||
      !productDiscount.buy_quantity ||
      !productDiscount.free_quantity
    ) {
      return total;
    }

    const buyQuantity =
      Number(productDiscount.buy_quantity);

    const freeQuantity =
      Number(productDiscount.free_quantity);

    const groupSize =
      buyQuantity + freeQuantity;

    const freeItems =
      Math.floor(
        item.quantity / groupSize
      ) * freeQuantity;

    return (
      total +
      freeItems * Number(item.price)
    );
  },
  0
);


// ==========================================
// TOTAL AFTER PRODUCT DISCOUNT
// ==========================================

const productDiscountedTotal = Math.max(
  subtotalAmount -
  productDiscountAmount,
  0
);


// ==========================================
// DIRECT DISCOUNT
// ==========================================

const selectedDiscount = discounts.find(
  (discount) =>
    discount.id === Number(selectedDiscountId)
);

let discountAmount = 0;

if (
  selectedDiscount &&
  selectedDiscount.discount_type === "DIRECT"
) {

  if (
    selectedDiscount.value_type === "PERCENTAGE"
  ) {

    discountAmount =
      productDiscountedTotal *
      Number(selectedDiscount.value) /
      100;

  } else if (
    selectedDiscount.value_type === "FIXED"
  ) {

    discountAmount = Math.min(
      Number(selectedDiscount.value),
      productDiscountedTotal
    );

  }
}


// ==========================================
// FINAL BILL TOTAL
// ==========================================

const totalAmount = Math.max(
  productDiscountedTotal -
  discountAmount,
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
  const addPayment = (method = "upi") => {

    if (payments.some(payment => payment.method === method)) {
      return;
    }

    setPayments([
      ...payments,
      {
        method,
        amount:
          remainingAmount > 0
            ? remainingAmount.toFixed(2)
            : ""
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
    setSelectedPaymentIndex(0);
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
useEffect(() => {

  if (!showPaymentModal) {
    return;
  }

  setPayments((prev) => {

    if (prev.length === 0) {
      return prev;
    }

    // If there is only one payment,
    // automatically keep it equal to the bill total.
    if (prev.length === 1) {
      return [
        {
          ...prev[0],
          amount: totalAmount.toFixed(2),
        },
      ];
    }

    // For split payments, preserve the
    // manually entered amounts.
    return prev;
  });

}, [totalAmount, showPaymentModal]);
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
        setNotification({
          show: true,
          type: "error",
          message:
            "Payment amount must match bill total",
        });


        return;
      }

      try {

        const items =
          cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            combo_overrides: item.combo_overrides || [],
            ingredient_overrides:
              item.ingredient_overrides || [],
          }))

        const response =
          await createBill(
            items,
            payments,
            selectedDiscountId
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
        setSelectedDiscountId(null);

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
        setNotification({
          show: true,
          type: "error",
          message:
            error.response?.data?.error,
        });
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
    const fetchDiscounts = async () => {
      try {
        const data = await getDiscounts();
        setDiscounts(data);
      } catch (error) {
        console.error("Failed to fetch discounts:", error);
      }
    };

    fetchDiscounts();
  }, []);

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
      discountId: selectedDiscountId,
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
    setSelectedDiscountId(
      selectedBill.discountId || null
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

      <div className="w-full min-h-screen bg-gradient-to-tr from-indigo-200/70 via-slate-50 to-orange-200/40 p-6 rounded-[24px]">

        <div className="mb-6 relative z-10 flex justify-between items-start">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            Billing
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHeldBills(true)}
              className="
              bg-white
              border
              border-slate-200
              px-5
              py-3
              rounded-2xl
              text-sm
              font-bold
              shadow-sm
              hover:bg-slate-50
              transition-all
              cursor-pointer
              "
            >

              🧾 Held Bills

              {heldBills.length > 0 && (

                <span
                  className="
                  ml-2
                  inline-flex
                  items-center
                  justify-center
                  w-6
                  h-6
                  rounded-full
                  bg-orange-500
                  text-white
                  text-xs
                  font-black
                  "
                >
                  {heldBills.length}
                </span>

              )}

            </button>
            <button
              onClick={() => setPosMode(!posMode)}
              className="
              bg-slate-900
              hover:bg-slate-800
              text-white
              px-5
              py-3
              rounded-2xl
              text-sm
              font-bold
              transition-all
              cursor-pointer
              "
            >
              {posMode ? "🡸 Exit POS" : "⛶ Enter POS"}
            </button>

            <button
              onClick={() => {
                const nextLayout =
                  layout === "classic"
                    ? "touch"
                    : "classic";
                setLayout(nextLayout);
                setBillingView(nextLayout);

              }}
              className="
              bg-gradient-to-r
              from-orange-500
              to-indigo-600
              text-white
              px-5
              py-2.5
              rounded-xl
              font-bold
              cursor-pointer
              "
            >
              {layout === "classic"
                ? "Touch POS"
                : "Classic POS"}
            </button>
            <button
              onClick={() => setBillingView("cashbook")}
              className={`
            px-5
            py-3
            rounded-2xl
            text-sm
            font-bold
            transition-all
            cursor-pointer
            ${billingView === "cashbook"
                  ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }
            `}
            >
              💸 Cash Book
            </button>
            <button
              onClick={() =>
                setShowShortcuts(
                  !showShortcuts
                )
              }
              className="
              bg-white
              border
              border-slate-200
              px-4
              py-2
              rounded-xl
              text-sm
              font-semibold
              shadow-sm
              hover:bg-slate-50
              transition
              "
            >

              <div className="flex items-center gap-2">
                <Keyboard size={18} />
                Shortcuts

                {
                  showShortcuts
                    ?
                    <ChevronUp size={16} />
                    :
                    <ChevronDown size={16} />
                }

              </div>

            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full overflow-hidden pb-6 relative z-10 items-start">

          {/* Left Column Section: Dynamically stretches to full screen size if it is in touch mode */}
          <div className={layout === "classic" ? "lg:col-span-1" : "lg:col-span-3"}>
            {billingView === "classic" ? (
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
                    className="w-full bg-white/20 border border-slate-800 text-white rounded-xl p-3.5 pl-11 text-sm font-semibold placeholder:text-slate-500 outline-none focus:bg-white/15 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="mt-4 max-h-[300px] overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (!product.available) {
                          setNotification({
                            show: true,
                            type: "error",
                            message: `${product.name} is out of stock.`,
                          });
                          return;
                        }
                        addToCart(product);
                      }}
                      className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group border ${index === selectedProductIndex
                        ? "bg-slate-600 border-indigo-400 shadow-lg"
                        : "bg-slate-800/40 border-slate-800/60 hover:bg-slate-800 hover:border-slate-700"
                        }`}
                    >
                      <span className="text-sm font-semibold text-slate-300 group-hover:text-white">
                        {product.name}
                      </span>

                      {!product.available && (
                        <span className="text-[10px] text-red-400 font-bold">
                          OUT OF STOCK
                        </span>
                      )}

                      <strong className="text-sm font-bold text-slate-200 group-hover:text-orange-400">
                        ₹{product.price}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : billingView === "touch" ? (

              <BillingTouch
                search={search}
                setSearch={setSearch}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                filteredProducts={touchProducts}
                addToCart={addToCart}
                openQuantityDialog={(item) => {
                  setSelectedQuantityItem(item);
                  setShowQuantityDialog(true);
                }}
                showCheckout={() => setShowTouchCart(true)}
                cartProps={{
                  cart,
                  totalAmount,
                  updateQuantity,
                  removeItem,
                  generateBill,
                  holdBill,
                  setShowHeldBills,
                  setSelectedCartItem,
                  setShowCustomize,
                  setComboCartItem,
                  setShowComboCustomize,
                }}
              />

            ) : (

              <CashBook />

            )}
          </div>

          {/* Right Column Section: Only displays during classic view to match your precise requirements */}
          {layout === "classic" && (
            <div className="lg:col-span-2">
              <CartPanel
                cart={cart}
                totalAmount={totalAmount}
                subtotalAmount={subtotalAmount}
                productDiscountAmount={productDiscountAmount}
                discountAmount={discountAmount}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                generateBill={generateBill}
                holdBill={holdBill}
                setShowHeldBills={setShowHeldBills}
                setSelectedCartItem={setSelectedCartItem}
                setShowCustomize={setShowCustomize}
                setComboCartItem={setComboCartItem}
                setShowComboCustomize={setShowComboCustomize}
              />
            </div>
          )}

        </div>
      </div>

      {showPaymentModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-[32px] shadow-2xl p-8 flex flex-col justify-between">

            {/* Header Block */}
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">
                    Choose Payment Method
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Select one or more channels to break down and settle this bill.
                  </p>
                </div>
                {/* Main Balance Display Badge */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Bill
                  </span>
                  <span className="text-2xl font-black text-slate-950 block mt-0.5">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>
              {/* Discount Selection */}

              <div className="mb-6">

                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Discount
                  </span>

                  {discountAmount > 0 && (
                    <span className="text-xs font-black text-emerald-600">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  )}
                </div>

                <select
                  value={selectedDiscountId || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedDiscountId(
                      value ? Number(value) : null
                    );
                  }}
                  className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      p-3
      text-sm
      font-bold
      text-slate-700
      outline-none
      focus:border-indigo-500
      focus:ring-2
      focus:ring-indigo-100
    "
                >

                  <option value="">
                    No Discount
                  </option>

                  {discounts
                    .filter((discount) => discount.is_active)
                    .map((discount) => (
                      <option
                        key={discount.id}
                        value={discount.id}
                      >
                        {discount.name}
                      </option>
                    ))}

                </select>

              </div>
              {/* Brand Method Grid (Massive, Tactical Grid Buttons) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'upi', label: '⚡ UPI ', color: 'peer-checked:border-indigo-600 peer-checked:bg-indigo-50/40 text-indigo-600' },
                  { id: 'cash', label: '💵 Cash ', color: 'peer-checked:border-slate-800 peer-checked:bg-slate-50 text-slate-800' },
                  { id: 'card', label: '💳 Swipe Card', color: 'peer-checked:border-indigo-600 peer-checked:bg-indigo-50/40 text-indigo-600' },
                  { id: 'swiggy', label: '🧡 Swiggy Order', color: 'peer-checked:border-orange-500 peer-checked:bg-orange-50/40 text-orange-500' },
                  { id: 'zomato', label: '❤️ Zomato Order', color: 'peer-checked:border-red-500 peer-checked:bg-red-50/40 text-red-500' },
                ].map((item) => {
                  // Evaluates if this method is currently added inside your payments state array
                  const isActive = payments.some(p => p.method === item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {

                        const updated = [...payments];

                        updated[selectedPaymentIndex] = {
                          ...updated[selectedPaymentIndex],
                          method: item.id,
                        };

                        setPayments(updated);

                      }}
                      className={`
                  w-full
                  h-20
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1.5
                  border-2
                  rounded-2xl
                  font-black
                  text-sm
                  transition-all
                  active:scale-[0.97]
                  cursor-pointer
                  ${isActive
                          ? `border-indigo-600 bg-indigo-50/30 text-indigo-700 shadow-xs`
                          : `border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50`
                        }
                `}
                    >
                      <span className="text-base">{item.label.split(' ')[0]}</span>
                      <span className="text-xs tracking-tight">{item.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setPayments((prev) => [
                      ...prev,
                      {
                        method: "cash",
                        amount: "",
                      },
                    ])
                  }
                  className="
                  px-4
                  py-2
                  rounded-xl
                  bg-indigo-50
                  text-indigo-600
                  text-xs
                  font-bold
                  hover:bg-indigo-100
                  transition-all
                  cursor-pointer
                  "
                >
                  + Split Payment
                </button>
              </div>
              {/* Contextual Input Fields Stack */}
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPaymentIndex(index)}
                    className={`
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    p-4
                    border
                    transition-all
                    cursor-pointer
                    ${selectedPaymentIndex === index
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-slate-50"
                      }
                  `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
                        {payment.method}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs font-black text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={payment.amount}
                          onChange={(e) => updatePayment(index, "amount", e.target.value)}
                          className="
                    w-40
                    bg-white
                    border border-slate-200
                    text-slate-900
                    rounded-xl
                    p-3
                    pl-7
                    text-sm
                    font-black
                    outline-none
                    text-right
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    transition-all
                    "
                        />
                      </div>

                      {payments.length > 1 && (
                        <button
                          onClick={() => removePayment(index)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer & Balancing Computations Block */}
            <div className="mt-6">
              {/* Dynamic Status Bar Card */}
              <div className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${Math.abs(remainingAmount) <= 0.01
                ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-900"
                : "bg-red-50/50 border-red-200/60 text-red-900"
                }`}>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Remaining Balance Status
                  </span>
                  <span className="text-xs font-bold text-slate-600 block mt-0.5">
                    Collected Paid Total: <strong className="text-slate-800">₹{paidAmount}</strong>
                  </span>
                </div>
                <span className={`text-xl font-black ${Math.abs(remainingAmount) <= 0.01 ? "text-emerald-600" : "text-red-500"
                  }`}>
                  {Math.abs(remainingAmount) <= 0.01 ? "✓ Fully Balanced" : `₹${remainingAmount}`}
                </span>
              </div>

              {/* Main Action Large Button Bar */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="
            flex-1
            bg-white
            border-2
            border-slate-200
            text-slate-500
            p-4
            rounded-2xl
            text-sm
            font-black
            tracking-wide
            hover:bg-slate-50
            hover:border-slate-300
            active:scale-95
            transition-all
            cursor-pointer
            "
                >
                  Cancel Order
                </button>

                <button
                  ref={confirmButtonRef}
                  onClick={confirmPayment}
                  disabled={Math.abs(remainingAmount) > 0.01}
                  className={`
              flex-1
              p-4
              rounded-2xl
              text-sm
              font-black
              tracking-wide
              shadow-md
              transition-all
              ${Math.abs(remainingAmount) <= 0.01
                      ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-95 active:scale-95 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }
            `}
                >
                  Confirm Bill
                </button>
              </div>
            </div>

          </div>
        </div>, document.body
      )}

      {showBillModal && generatedBill && createPortal(
        <div
          className="
    fixed
    inset-0
    bg-slate-950/20
    backdrop-blur-xs
    flex
    items-center
    justify-center
    z-50
    p-4
    "
        >
          {/* Glassmorphic Modal Box */}
          <div
            className="
      bg-white
      border border-slate-200/80
      rounded-[24px]
      shadow-xl
      w-full
      max-w-xl
      p-8
      relative
      overflow-hidden
      "
          >
            {/* Structural Headers Style Override (Less Intense Bold) */}
            <h2 className="text-2xl font-bold tracking-normal text-slate-800 mb-6">
              Bill Generated Successfully
            </h2>

            <div className="space-y-4">
              {/* Core Invoice Summary Row */}
              <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-4 space-y-2 text-sm">
                <p className="flex justify-between items-center">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-xs">Bill Number:</span>
                  <span className="font-bold text-slate-700">{generatedBill.bill_number}</span>
                </p>
                <p className="flex justify-between items-center">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-xs">Total Amount:</span>
                  <span className="font-black text-slate-800">₹{generatedBill.total_amount}</span>
                </p>
              </div>

              {/* Payment Metadata Segment Tree */}
              <div className="border-t border-slate-200/60 pt-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pl-0.5">
                  Payment Details
                </h3>

                <div className="space-y-3 max-h-40 overflow-y-auto pr-1 scrollbar-none">
                  {generatedBill?.payments?.map((payment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="capitalize font-semibold text-slate-500">
                        {payment.method}
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹ {payment.amount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Aggregate Paid Summary Banner */}
                <div className="border-t border-slate-200/60 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Paid
                  </span>
                  <span className="text-lg font-black text-indigo-600">
                    ₹ {generatedBill.total_amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Navigation Direct Shortcut Action */}
            <button
              onClick={() => navigate(`/invoice/${generatedBill.id}`)}
              className="
        w-full
        bg-white
        border border-slate-200
        text-slate-600
        mt-5
        py-2.5
        px-4
        rounded-xl
        text-s
        font-bold
        tracking-wide
        shadow-3xs
        hover:bg-slate-50
        hover:text-slate-800
        transition-all
        cursor-pointer
        "
            >
              View Invoice
            </button>

            {/* Master Action Grid Hub Buttons Suite */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
              <a
                href={`${import.meta.env.VITE_API_URL}/billing/history/${generatedBill.id}/pdf/`}
                target="_blank"
                rel="noreferrer"
                className="
          flex-1
          text-center
          bg-white
          border border-slate-200
          text-slate-600
          py-3
          rounded-xl
          text-xs
          font-bold
          tracking-wide
          shadow-3xs
          hover:bg-slate-50
          hover:text-slate-800
          transition-all
          "
              >
                Download PDF
              </a>

              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/billing/history/${generatedBill.id}/pdf/`, "_blank")}
                className="
          flex-1
          bg-gradient-to-r from-orange-500 to-indigo-600
          text-white
          py-3
          rounded-xl
          text-xs
          font-bold
          tracking-wide
          shadow-sm
          hover:opacity-95
          transition-all
          cursor-pointer
          "
              >
                Print
              </button>

              <button
                ref={closeButtonRef}
                onClick={() => {
                  setShowBillModal(false);
                  setGeneratedBill(null);
                  setSearch("");
                  setProducts([]);
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 100);
                }}
                className="
          flex-1
          bg-slate-800
          text-white
          py-3
          rounded-xl
          text-xs
          font-bold
          tracking-wide
          shadow-sm
          hover:bg-slate-900
          transition-all
          cursor-pointer
          "
              >
                Close
              </button>
            </div>

          </div>
        </div>, document.body
      )}


      {
        showShortcuts && (

          <div
            className="
absolute
right-8
top-20
z-50
w-80
bg-white
rounded-2xl
shadow-xl
border
border-slate-200
p-4
"
          >

            <h3 className="
font-bold
text-slate-800
mb-3
">
              Keyboard Shortcuts
            </h3>


            <div className="
space-y-2
text-sm
">

              <div className="flex justify-between">
                <span>↑ ↓</span>
                <span>Navigate Products</span>
              </div>

              <div className="flex justify-between">
                <span>Enter</span>
                <span>Add Product</span>
              </div>

              <div className="flex justify-between">
                <span>Ctrl + H</span>
                <span>Hold Bill</span>
              </div>

              <div className="flex justify-between">
                <span>Ctrl + B</span>
                <span>Held Bills</span>
              </div>

              <div className="flex justify-between">
                <span>Ctrl + Enter</span>
                <span>Generate Bill</span>
              </div>



              <div className="flex justify-between">
                <span>Backspace</span>
                <span>Remove Product</span>
              </div>

            </div>

          </div>

        )
      }

      {showHeldBills && createPortal(
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
        </div>, document.body
      )}
      {showComboCustomize &&
        comboCartItem && (
          <ComboCustomizationModal
            product={comboCartItem}
            comboItems={comboCartItem.recipe}
            onClose={() => {
              setShowComboCustomize(false);
            }}
            onContinue={async (selectedProducts) => {
              try {
                const recipeGroups = await Promise.all(
                  selectedProducts.map(async (item) => {
                    const recipe = await getCustomization(
                      item.product_id
                    );
                    return recipe[0];
                  })
                );
                const updatedCart = cart.map((cartItem) =>
                  cartItem.id === comboCartItem.id
                    ? {
                      ...cartItem,
                      recipe: recipeGroups,
                      combo_overrides: selectedProducts,
                    }
                    : cartItem
                );
                setCart(updatedCart);
                const updatedItem = updatedCart.find(
                  (i) => i.id === comboCartItem.id
                );
                setSelectedCartItem(updatedItem);
                setShowComboCustomize(false);
                setShowCustomize(true);
              } catch (error) {
                console.error(error);
              }
            }}
          />
        )
      }

      {showCustomize && (
        <IngredientCustomizationModal
          product={selectedCartItem || []}
          recipeGroups={selectedCartItem?.recipe || []}
          overrides={selectedCartItem?.ingredient_overrides || []}
          onSave={saveCustomization}
          onClose={() => {
            setShowCustomize(false);
            setSelectedCartItem(null);
          }}
        />
      )}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() =>
          setNotification({
            ...notification,
            show: false,
          })
        }
      />
      <QuantityDialog
        product={selectedQuantityItem}
        quantity={selectedQuantityItem?.quantity || 0}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromDialog}
        onUpdate={updateQuantityFromDialog}
        onClose={() => {
          setShowQuantityDialog(false);
          setSelectedQuantityItem(null);
        }}
      />
      <TouchCartDrawer
        open={showTouchCart}
        onClose={() => setShowTouchCart(false)}
      >

        <CartPanel
          cart={cart}
          totalAmount={totalAmount}
          subtotalAmount={subtotalAmount}
          productDiscountAmount={productDiscountAmount}
          discountAmount={discountAmount}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          generateBill={() => {
            setShowTouchCart(false);
            generateBill();
          }}
          holdBill={holdBill}
          setShowHeldBills={setShowHeldBills}
          setSelectedCartItem={setSelectedCartItem}
          setShowCustomize={setShowCustomize}
          setComboCartItem={setComboCartItem}
          setShowComboCustomize={setShowComboCustomize}
        />

      </TouchCartDrawer>
      {layout === "touch" && (

        <FloatingCheckoutButton
          visible={cart.length > 0}
          total={totalAmount}
          onClick={() => setShowTouchCart(true)}
        />

      )}
    </MainLayout>
  );
}

export default Billing;

