import { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  searchProducts,
  createBill,
  getProducts,
  getDiscounts,
  deductBillInventoryWithRetry,
  searchCustomers,
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
  const [mobileTab, setMobileTab] = useState("products"); // 'products' | 'cart'
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
  const [selectedProductDiscountId, setSelectedProductDiscountId] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [customerSearching, setCustomerSearching] = useState(false);
  const [showCustomerResults, setShowCustomerResults] = useState(false);


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
  const [showCustomerModal, setShowCustomerModal] = useState(false);

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
  // BILLING TOTAL
  // ==========================================
  const generateBill = () => {

    if (cart.length === 0) {

      alert("Cart is empty");

      return;
    }

    // Every new bill starts with NO offer selected.
    setSelectedProductDiscountId(null);

    // Percentage discount also starts at 0.
    setDiscountPercentage(0);
    setCustomerPhone("");
    setCustomerName("");
    setSelectedCustomer(null);
    setCustomerResults([]);
    setShowCustomerResults(false);

    setPayments([
      {
        method: "upi",
        amount: subtotalAmount.toFixed(2),
      }
    ]);

    setShowCustomerModal(true);
  };
  // ==========================================
  // PAYMENT MODAL DISCOUNT CALCULATION
  // ==========================================

  const selectedProductDiscount =
    discounts.find(
      (discount) =>
        discount.id ===
        Number(selectedProductDiscountId) &&
        discount.discount_type === "PRODUCT" &&
        discount.is_active
    );

  let paymentProductDiscountAmount = 0;

  if (selectedProductDiscount) {

    const buyQuantity =
      Number(
        selectedProductDiscount.buy_quantity || 0
      );

    const freeQuantity =
      Number(
        selectedProductDiscount.free_quantity || 0
      );

    const groupSize =
      buyQuantity + freeQuantity;

    if (groupSize > 0) {

      const units = [];

      cart.forEach((item) => {

        for (
          let i = 0;
          i < item.quantity;
          i++
        ) {

          units.push({
            productId: item.id,
            price: Number(item.price),
          });

        }

      });

      // Cheapest items first
      units.sort(
        (a, b) => a.price - b.price
      );

      const numberOfGroups =
        Math.floor(
          units.length / groupSize
        );

      const numberOfFreeItems =
        numberOfGroups * freeQuantity;

      paymentProductDiscountAmount =
        units
          .slice(
            0,
            numberOfFreeItems
          )
          .reduce(
            (total, unit) =>
              total + unit.price,
            0
          );
    }
  }


  // ==========================================
  // AFTER PRODUCT OFFER
  // ==========================================

  const paymentProductDiscountedTotal =
    Math.max(
      subtotalAmount -
      paymentProductDiscountAmount,
      0
    );


  // ==========================================
  // CUSTOM PERCENTAGE DISCOUNT
  // ==========================================

  const paymentDiscountAmount =
    paymentProductDiscountedTotal *
    (Number(discountPercentage) || 0) /
    100;


  // ==========================================
  // FINAL PAYMENT TOTAL
  // ==========================================

  const paymentTotalAmount = Math.round(
    Math.max(
      paymentProductDiscountedTotal -
      paymentDiscountAmount,
      0
    )
  );

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

  const remainingAmount = paymentTotalAmount - paidAmount;
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
            amount: paymentTotalAmount.toFixed(2),
          },
        ];
      }

      // For split payments, preserve the
      // manually entered amounts.
      return prev;
    });

  }, [paymentTotalAmount, showPaymentModal]);
  const closeButtonRef =
    useRef(null);
  const confirmButtonRef =
    useRef(null);

  useEffect(() => {

    if (showBillModal) {

      setTimeout(() => {

        closeButtonRef.current?.focus();

      }, 100);

    }

  }, [showBillModal]);

  const selectCustomer = (customer) => {

    setSelectedCustomer(customer);

    setCustomerPhone(
      customer.phone_number || ""
    );

    setCustomerName(
      customer.name || ""
    );

    setCustomerResults([]);
    setShowCustomerResults(false);
  };
  const continueToPayment = () => {
    setShowCustomerModal(false);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (Math.abs(remainingAmount) > 0.01) {
      setNotification({
        show: true,
        type: "error",
        message: "Payment amount must match bill total",
      });
      return;
    }

    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        combo_overrides: item.combo_overrides || [],
        ingredient_overrides: item.ingredient_overrides || [],
      }));
      const customerData =
        customerPhone.trim()
          ? {
            name: customerName.trim(),
            phone_number: customerPhone.trim(),
          }
          : null;
      // 1️⃣ CREATE BILL
      const response = await createBill(
        items,
        payments,
        selectedProductDiscountId,
        discountPercentage,
        customerData
      );

      console.log("BILL CREATED:", response);

      // 2️⃣ MARK INVENTORY AS PENDING
      const pendingBills = JSON.parse(
        localStorage.getItem("pending_inventory_bills") || "[]"
      );

      if (!pendingBills.includes(response.id)) {
        pendingBills.push(response.id);

        localStorage.setItem(
          "pending_inventory_bills",
          JSON.stringify(pendingBills)
        );
      }

      // 3️⃣ DEDUCT INVENTORY
      // Don't await — invoice appears immediately.
      deductBillInventoryWithRetry(response.id)
        .then(() => {
          console.log(
            "INVENTORY DEDUCTED:",
            response.id
          );

          const currentPending = JSON.parse(
            localStorage.getItem("pending_inventory_bills") || "[]"
          );

          const updatedPending = currentPending.filter(
            (id) => id !== response.id
          );

          localStorage.setItem(
            "pending_inventory_bills",
            JSON.stringify(updatedPending)
          );
        })
        .catch((error) => {
          console.error(
            "INVENTORY DEDUCTION FAILED:",
            error
          );

          // IMPORTANT:
          // Do NOT remove from pending list.
        });

      // 4️⃣ SHOW BILL IMMEDIATELY
      setGeneratedBill(response);
      setShowPaymentModal(false);
      setShowBillModal(true);

      // 5️⃣ CLEAR CART
      setCart([]);
      setDiscountPercentage(0);
      setSelectedProductDiscountId(null);

      localStorage.removeItem("billing_cart");

      setPayments([
        {
          method: "upi",
          amount: "",
        },
      ]);

    } catch (error) {
      console.error("BILL ERROR:", error);

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      setNotification({
        show: true,
        type: "error",
        message:
          error.response?.data?.error ||
          "Unable to create bill.",
      });
    }
  };

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
      billNumber: heldBills.length + 1,
      items: cart,
      total: subtotalAmount,
      discountPercentage: 0,
      productDiscountId: null,
      createdAt:
        new Date().toLocaleTimeString(
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
    setDiscountPercentage(
      selectedBill.discountPercentage || null
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

  useEffect(() => {

    if (!showCustomerModal) {
      return;
    }

    const phone = customerPhone
      .replace(/\D/g, "");

    if (phone.length < 3) {

      setCustomerResults([]);
      setShowCustomerResults(false);

      return;
    }

    const timer = setTimeout(
      async () => {

        try {

          setCustomerSearching(true);

          const results =
            await searchCustomers(phone);

          setCustomerResults(results);

          setShowCustomerResults(
            results.length > 0
          );

        } catch (error) {

          console.error(
            "CUSTOMER SEARCH ERROR:",
            error
          );

          setCustomerResults([]);
          setShowCustomerResults(false);

        } finally {

          setCustomerSearching(false);

        }

      },
      300
    );

    return () => clearTimeout(timer);

  }, [
    customerPhone,
    showCustomerModal
  ]);

const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <MainLayout>
      <div
        className="
          w-full
          min-h-screen
          bg-gradient-to-tr
          from-indigo-200/70
          via-slate-50
          to-orange-200/40
          p-2.5
          sm:p-4
          md:p-6
          rounded-2xl
          sm:rounded-[24px]
          pb-36
          lg:pb-8
        "
      >
        {/* =========================================================
            HEADER & ACTIONS BAR
        ========================================================== */}
        <div
          className="
            mb-3
            sm:mb-6
            relative
            z-10
            flex
            flex-col
            lg:flex-row
            lg:justify-between
            lg:items-center
            gap-2.5
            sm:gap-3
          "
        >
          {/* Header Row */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-800">
                Billing
              </h1>
              <span className="lg:hidden text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                {layout === "classic" ? "Classic" : "Touch"} POS
              </span>
            </div>

            {/* Mobile Switcher (Items vs Cart) - Only in Classic View */}
            {layout === "classic" && billingView === "classic" && (
              <div className="flex lg:hidden p-1 bg-slate-900/10 rounded-xl text-xs font-black">
                <button
                  type="button"
                  onClick={() => setMobileTab("products")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mobileTab === "products"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Items
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab("cart")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    mobileTab === "cart"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  <span>Cart</span>
                  {totalCartCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action Button Track */}
          <div
            className="
              flex
              items-center
              gap-2
              w-full
              lg:w-auto
              overflow-x-auto
              scrollbar-none
              py-1
              flex-nowrap
              sm:flex-wrap
            "
          >
            {/* Held Bills */}
            <button
              onClick={() => setShowHeldBills(true)}
              className="
                shrink-0
                bg-white
                border
                border-slate-200/90
                px-3.5
                sm:px-5
                py-2
                sm:py-3
                rounded-xl
                sm:rounded-2xl
                text-xs
                sm:text-sm
                font-bold
                shadow-xs
                hover:bg-slate-50
                active:scale-95
                transition-all
                cursor-pointer
                flex
                items-center
                gap-1.5
              "
            >
              <span>🧾 Held Bills</span>
              {heldBills.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black">
                  {heldBills.length}
                </span>
              )}
            </button>

            {/* Exit / Enter POS */}
            <button
              onClick={() => setPosMode(!posMode)}
              className="
                hidden
                sm:inline-flex
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

            {/* Layout Toggle */}
            <button
              onClick={() => {
                const nextLayout = layout === "classic" ? "touch" : "classic";
                setLayout(nextLayout);
                setBillingView(nextLayout);
              }}
              className="
                shrink-0
                bg-gradient-to-r
                from-orange-500
                to-indigo-600
                text-white
                px-3.5
                sm:px-5
                py-2
                sm:py-2.5
                rounded-xl
                text-xs
                sm:text-sm
                font-bold
                active:scale-95
                shadow-xs
                cursor-pointer
              "
            >
              {layout === "classic" ? "Touch Mode" : "Classic Mode"}
            </button>

            {/* Cash Book */}
            <button
              onClick={() => setBillingView("cashbook")}
              className={`
                shrink-0
                px-3.5
                sm:px-5
                py-2
                sm:py-3
                rounded-xl
                sm:rounded-2xl
                text-xs
                sm:text-sm
                font-bold
                transition-all
                active:scale-95
                cursor-pointer
                ${
                  billingView === "cashbook"
                    ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50"
                }
              `}
            >
              💸 Cash Book
            </button>

            {/* Shortcuts Toggle */}
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="
                hidden
                sm:inline-flex
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
                items-center
                gap-2
              "
            >
              <Keyboard size={18} />
              Shortcuts
              {showShortcuts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* =========================================================
            CORE WORKSPACE
        ========================================================== */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-3
            sm:gap-4
            lg:gap-6
            max-w-full
            overflow-hidden
            relative
            z-10
            items-start
          "
        >
          {/* Main Area: Classic List or Touch POS View */}
          <div
            className={`
              ${layout === "classic" ? "lg:col-span-1" : "lg:col-span-3"}
              ${mobileTab === "cart" && layout === "classic" ? "hidden lg:block" : "block"}
            `}
          >
            {billingView === "classic" ? (
              <div
                className="
                  bg-slate-900
                  backdrop-blur-md
                  border
                  border-slate-800
                  rounded-2xl
                  sm:rounded-[24px]
                  p-3.5
                  sm:p-4
                  md:p-6
                  shadow-sm
                "
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm sm:text-lg font-black tracking-tight text-white">
                    Product Search
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400">
                    {products.length} Items
                  </span>
                </div>

                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Search size={17} />
                  </div>

                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full bg-white/15 border border-slate-800 text-white rounded-xl p-3 pl-10 pr-9 text-xs sm:text-sm font-semibold placeholder:text-slate-500 outline-none focus:bg-white/20 focus:border-indigo-500 transition-all"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                    >
                      
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-[380px] lg:max-h-[300px] overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
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
                      className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all duration-150 border active:scale-[0.98] ${
                        index === selectedProductIndex
                          ? "bg-slate-600 border-indigo-400 shadow-md"
                          : "bg-slate-800/40 border-slate-800/60 hover:bg-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white truncate pr-2">
                        {product.name}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {!product.available && (
                          <span className="text-[9px] text-red-400 font-bold">
                            OUT OF STOCK
                          </span>
                        )}
                        <strong className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-orange-400">
                          ₹{product.price}
                        </strong>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No products matching search
                    </div>
                  )}
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
                  totalAmount: subtotalAmount,
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

          {/* Desktop Only Right Cart Panel */}
          {layout === "classic" && (
            <div
              className={`
                lg:col-span-2
                ${mobileTab === "products" ? "hidden lg:block" : "block"}
              `}
            >
              <CartPanel
                cart={cart}
                totalAmount={paymentTotalAmount}
                subtotalAmount={subtotalAmount}
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

        {/* =========================================================
            CLASSIC POS MOBILE FLOATING CHECKOUT BAR (Hidden in Modals)
        ========================================================== */}
        {layout === "classic" &&
          cart.length > 0 &&
          !showPaymentModal &&
          !showCustomerModal &&
          !showBillModal && (
            <div className="lg:hidden fixed bottom-[84px] inset-x-3 z-30 pointer-events-none">
              <div className="pointer-events-auto flex items-center justify-between p-3 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.5)] text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
                    🧾
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"}
                    </p>
                    <p className="text-base font-black text-white">
                      ₹{paymentTotalAmount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileTab("cart")}
                    className="px-3 py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-200 active:scale-95"
                  >
                    Edit Cart
                  </button>
                  <button
                    type="button"
                    onClick={generateBill}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white text-xs font-black shadow-md active:scale-95 transition"
                  >
                    Pay Now →
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Customer Modal */}
      {showCustomerModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-t-[32px] sm:rounded-[28px] shadow-2xl p-5 sm:p-7">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.18em] mb-1">
                    Step 1 of 2
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                    Customer Details
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Optional — WhatsApp billing and receipt updates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                  value={customerPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCustomerPhone(value);
                    if (
                      selectedCustomer &&
                      value !==
                        selectedCustomer.phone_number
                          ?.replace(/\D/g, "")
                          .replace(/^91/, "")
                    ) {
                      setSelectedCustomer(null);
                      setCustomerName("");
                    }
                  }}
                  onFocus={() => {
                    if (customerResults.length > 0) setShowCustomerResults(true);
                  }}
                  placeholder="Enter 10-digit number"
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                />
                {customerSearching && (
                  <div className="absolute right-4 top-[38px] text-xs font-semibold text-slate-400">
                    Searching...
                  </div>
                )}
                {showCustomerResults && customerResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                    {customerResults.map((customer) => (
                      <button
                        type="button"
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {customer.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {customer.phone_number}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                            {customer.visit_count} visits
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {customerPhone && (
                <div className="mt-3.5">
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5">
                      <div>
                        <p className="text-sm font-black text-indigo-900">
                          {selectedCustomer.name}
                        </p>
                        <p className="text-xs text-indigo-500 mt-0.5">
                          {selectedCustomer.visit_count} previous visits
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Existing
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter name (optional)"
                        className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {!customerPhone && (
                <div className="mt-3.5 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-600">
                      Walk-in Customer
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Receipt will be generated without profile sync
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 mt-5 sm:mt-7 pt-4 sm:pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-500 text-xs sm:text-sm font-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={continueToPayment}
                  className="flex-[1.5] py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white text-xs sm:text-sm font-black shadow-md"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Payment Settlement Modal */}
      {showPaymentModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs">
            <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white border border-slate-200/80 rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-3 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                      Payment Settlement
                    </h2>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
                      Select channel to balance and generate bill
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Due
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-950 block mt-0.5">
                      ₹{paymentTotalAmount}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Product Offer
                    </span>
                    <select
                      value={selectedProductDiscountId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedProductDiscountId(val ? Number(val) : null);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-bold text-slate-700 outline-none"
                    >
                      <option value="">No Product Offer</option>
                      {discounts
                        .filter(
                          (discount) =>
                            discount.discount_type === "PRODUCT" &&
                            discount.is_active
                        )
                        .map((discount) => (
                          <option key={discount.id} value={discount.id}>
                            {discount.name}
                            {discount.product === null ? " - All Items" : ""}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Discount %
                      </span>
                      {paymentDiscountAmount > 0 && (
                        <span className="text-xs font-black text-emerald-600">
                          -₹{paymentDiscountAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={discountPercentage}
                        onChange={(e) => {
                          let val = Number(e.target.value);
                          if (val < 0) val = 0;
                          if (val > 100) val = 100;
                          setDiscountPercentage(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-8 text-xs sm:text-sm font-bold text-slate-700 outline-none"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  {[
                    { id: "upi", label: "⚡ UPI" },
                    { id: "cash", label: "💵 Cash" },
                    { id: "card", label: "💳 Card" },
                    { id: "swiggy", label: "🧡 Swiggy" },
                    { id: "zomato", label: "❤️ Zomato" },
                  ].map((item) => {
                    const isActive = payments.some((p) => p.method === item.id);
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
                          h-14
                          sm:h-20
                          flex
                          flex-col
                          items-center
                          justify-center
                          border-2
                          rounded-xl
                          sm:rounded-2xl
                          font-black
                          text-xs
                          sm:text-sm
                          transition-all
                          active:scale-95
                          ${
                            isActive
                              ? "border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-xs"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }
                        `}
                      >
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      setPayments((prev) => [
                        ...prev,
                        { method: "cash", amount: "" },
                      ])
                    }
                    className="h-14 sm:h-20 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl sm:rounded-2xl font-bold text-xs text-indigo-600 bg-indigo-50/20 active:scale-95"
                  >
                    <span>+ Split</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {payments.map((payment, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedPaymentIndex(index)}
                      className={`flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border transition-all ${
                        selectedPaymentIndex === index
                          ? "border-indigo-500 bg-indigo-50/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-xs sm:text-sm font-black uppercase text-slate-700">
                          {payment.method}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-xs font-black text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={payment.amount}
                            onChange={(e) =>
                              updatePayment(index, "amount", e.target.value)
                            }
                            className="w-24 sm:w-36 bg-white border border-slate-200 rounded-lg p-2 pl-6 text-right text-xs sm:text-sm font-black outline-none focus:border-indigo-500"
                          />
                        </div>

                        {payments.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePayment(index);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div
                  className={`p-3 rounded-xl border flex justify-between items-center mb-3 sm:mb-4 ${
                    Math.abs(remainingAmount) <= 0.01
                      ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                      : "bg-red-50/60 border-red-200/80 text-red-900"
                  }`}
                >
                  <span className="text-[11px] font-bold">
                    Paid: ₹{paidAmount}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-black ${
                      Math.abs(remainingAmount) <= 0.01
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {Math.abs(remainingAmount) <= 0.01
                      ? "✓ Balanced"
                      : `Due: ₹${remainingAmount}`}
                  </span>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-xs sm:text-sm font-black active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    ref={confirmButtonRef}
                    onClick={confirmPayment}
                    disabled={Math.abs(remainingAmount) > 0.01}
                    className={`flex-[1.5] py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-black tracking-wide shadow-md transition-all ${
                      Math.abs(remainingAmount) <= 0.01
                        ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-95 active:scale-95"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    Confirm Bill
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Bill Generated Success Modal */}
      {showBillModal &&
        generatedBill &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white border border-slate-200/80 rounded-t-[32px] sm:rounded-[28px] shadow-2xl w-full max-w-lg p-5 sm:p-7 relative overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4 sm:mb-6">
                Bill Generated Successfully
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm">
                  <p className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Bill Number:
                    </span>
                    <span className="font-bold text-slate-700">
                      {generatedBill.bill_number}
                    </span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Total Paid:
                    </span>
                    <span className="font-black text-slate-800 text-sm sm:text-base">
                      ₹{generatedBill.total_amount}
                    </span>
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Settlement Details
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {generatedBill?.payments?.map((payment, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs font-medium"
                      >
                        <span className="capitalize text-slate-500">
                          {payment.method}
                        </span>
                        <span className="font-bold text-slate-800">
                          ₹{payment.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/invoice/${generatedBill.id}`)}
                className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 mt-4 py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-indigo-100"
              >
                View Full Invoice
              </button>

              <div className="flex gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-100">
                <a
                  href={`${import.meta.env.VITE_API_URL}/billing/history/${generatedBill.id}/pdf/`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  PDF
                </a>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_URL}/billing/history/${generatedBill.id}/pdf/`,
                      "_blank"
                    )
                  }
                  className="flex-1 bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  Print
                </button>
                <button
                  type="button"
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
                  className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Held Bills Modal */}
      {showHeldBills &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white border border-slate-200/80 rounded-t-[32px] sm:rounded-[24px] shadow-xl w-full max-w-2xl p-5 sm:p-7 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Held Bills
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHeldBills(false)}
                  className="text-slate-400 hover:text-red-500 font-bold p-1 text-sm"
                >
                  ✕
                </button>
              </div>

              {heldBills.length === 0 ? (
                <div className="text-center py-12 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  No held bills
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {heldBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                    >
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800">
                          Hold #{bill.billNumber}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">
                          <span className="font-black text-slate-800">
                            ₹ {bill.total}
                          </span>
                          {" • "}
                          {bill.items.length} items
                          {" • "}
                          {bill.createdAt}
                        </p>
                      </div>

                      <div className="flex gap-2 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            resumeBill(bill.id);
                            setShowHeldBills(false);
                          }}
                          className="flex-1 sm:flex-none text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl active:scale-95"
                        >
                          Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHeldBill(bill.id)}
                          className="flex-1 sm:flex-none text-red-500 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Auxiliary Dialogs */}
      {showComboCustomize && comboCartItem && (
        <ComboCustomizationModal
          product={comboCartItem}
          comboItems={comboCartItem.recipe}
          onClose={() => setShowComboCustomize(false)}
          onContinue={async (selectedProducts) => {
            try {
              const recipeGroups = await Promise.all(
                selectedProducts.map(async (item) => {
                  const recipe = await getCustomization(item.product_id);
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
      )}

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
          totalAmount={paymentTotalAmount}
          subtotalAmount={subtotalAmount}
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

      {/* Floating Checkout Button for Touch Mode: Clamped so it doesn't overlap modals or footer capsule */}
      {layout === "touch" &&
        !showTouchCart &&
        !showPaymentModal &&
        !showCustomerModal &&
        !showBillModal && (
          <div className="fixed bottom-[88px] inset-x-4 z-30 pointer-events-none">
            <FloatingCheckoutButton
              visible={cart.length > 0}
              total={subtotalAmount}
              onClick={() => setShowTouchCart(true)}
            />
          </div>
        )}
    </MainLayout>
  );
}

export default Billing;

