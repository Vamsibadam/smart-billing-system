import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getProducts,
} from "../services/billingService";


function Discounts() {

  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [showProductResults, setShowProductResults] = useState(false);

  const [form, setForm] = useState({
    name: "",
    discount_type: "PRODUCT",
    value_type: "",
    value: "",
    product: "",
    buy_quantity: "",
    free_quantity: "",
    is_active: true,
  });


  // ============================================================
  // SELECTED PRODUCT
  // ============================================================

  const selectedProduct = products.find(
    (product) =>
      product.id === Number(form.product)
  );


  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(productSearch.toLowerCase())
  );


  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {

    try {

      setLoading(true);

      const [discountData, productData] =
        await Promise.all([
          getDiscounts(),
          getProducts(),
        ]);

      setDiscounts(discountData);
      setProducts(productData);

    } catch (error) {

      console.error(
        "Failed to load discount data:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {

    setForm({
      name: "",
      discount_type: "PRODUCT",
      value_type: "",
      value: "",
      product: "",
      buy_quantity: "",
      free_quantity: "",
      is_active: true,
    });

    setProductSearch("");
    setShowProductResults(false);

    setEditingDiscount(null);

  };


  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal = () => {

    resetForm();

    setShowModal(true);

  };


  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (discount) => {

    setEditingDiscount(discount);

    setForm({
      name: discount.name || "",

      discount_type:
        discount.discount_type || "PRODUCT",

      value_type:
        discount.value_type || "",

      value:
        discount.value ?? "",

      product:
        discount.product ?? "",

      buy_quantity:
        discount.buy_quantity ?? "",

      free_quantity:
        discount.free_quantity ?? "",

      is_active:
        discount.is_active,
    });


    // Show existing product name
    if (discount.product) {

      const product = products.find(
        (item) =>
          item.id === Number(discount.product)
      );

      setProductSearch(
        product?.name || ""
      );

    } else {

      // NULL means All Products
      setProductSearch("");

    }

    setShowProductResults(false);

    setShowModal(true);

  };


  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

  };


  // ============================================================
  // SAVE DISCOUNT
  // ============================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      const payload = {

        name: form.name,

        discount_type:
          form.discount_type,

        // Product discounts do not use direct
        // value type/value.
        value_type:
          form.discount_type === "PRODUCT"
            ? ""
            : form.value_type,

        value:
          form.discount_type === "PRODUCT"
            ? 0
            : Number(form.value || 0),

        // IMPORTANT:
        // Empty product = All Products = null
        product:
          form.discount_type === "PRODUCT"
            ? (
                form.product === ""
                  ? null
                  : Number(form.product)
              )
            : null,

        buy_quantity:
          form.discount_type === "PRODUCT"
            ? Number(form.buy_quantity)
            : null,

        free_quantity:
          form.discount_type === "PRODUCT"
            ? Number(form.free_quantity)
            : null,

        is_active:
          form.is_active,
      };


      console.log(
        "Discount payload:",
        payload
      );


      if (editingDiscount) {

        await updateDiscount(
          editingDiscount.id,
          payload
        );

      } else {

        await createDiscount(payload);

      }


      setShowModal(false);

      resetForm();

      await loadData();

    } catch (error) {

      console.error(
        "Failed to save discount:",
        error
      );

      alert(
        error?.response?.data ||
        error?.response?.data?.detail ||
        "Failed to save discount."
      );

    } finally {

      setSaving(false);

    }

  };


  // ============================================================
  // DELETE DISCOUNT
  // ============================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this discount?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteDiscount(id);

      await loadData();

    } catch (error) {

      console.error(
        "Failed to delete discount:",
        error
      );

      alert(
        "Failed to delete discount."
      );

    }

  };


  // ============================================================
  // TOGGLE ACTIVE
  // ============================================================

  const handleToggleActive = async (discount) => {

    try {

      await updateDiscount(
        discount.id,
        {
          is_active:
            !discount.is_active,
        }
      );

      await loadData();

    } catch (error) {

      console.error(
        "Failed to update discount:",
        error
      );

    }

  };


  // ============================================================
  // GET PRODUCT NAME
  // ============================================================

  const getProductName = (productId) => {

    const product = products.find(
      (item) =>
        item.id === Number(productId)
    );

    return product?.name || "Unknown Product";

  };


  // ============================================================
  // GET DISCOUNT DESCRIPTION
  // ============================================================

  const getDiscountDescription = (discount) => {

    if (
      discount.discount_type === "DIRECT"
    ) {

      if (
        discount.value_type === "PERCENTAGE"
      ) {

        return `${discount.value}% OFF`;

      }

      return `₹${discount.value} OFF`;

    }

    return (
      `Buy ${discount.buy_quantity} ` +
      `Get ${discount.free_quantity} Free`
    );

  };


  // ============================================================
  // UI
  // ============================================================

  return (

    <MainLayout>

      <div className="w-full">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="
          flex
          justify-between
          items-center
          mb-6
        ">

          <div>

            <h1 className="
              text-2xl
              font-black
              text-slate-800
            ">
              Discount Management
            </h1>

            <p className="
              text-sm
              text-slate-400
              mt-1
            ">
              Create and manage your billing discounts
            </p>

          </div>


          <button
            onClick={openCreateModal}
            className="
              bg-gradient-to-r
              from-orange-500
              to-indigo-600
              text-white
              px-5
              py-3
              rounded-xl
              text-sm
              font-bold
              shadow-sm
              hover:opacity-95
              transition-all
            "
          >
            + Add Discount
          </button>

        </div>


        {/* =====================================================
            DISCOUNT LIST
        ===================================================== */}

        {loading ? (

          <div className="
            text-center
            py-16
            text-slate-400
            font-bold
          ">
            Loading discounts...
          </div>

        ) : discounts.length === 0 ? (

          <div className="
            bg-white/70
            border
            border-white
            rounded-2xl
            p-12
            text-center
          ">

            <p className="
              text-slate-400
              font-bold
            ">
              No discounts created yet.
            </p>

            <button
              onClick={openCreateModal}
              className="
                mt-4
                text-indigo-600
                font-bold
                text-sm
              "
            >
              Create your first discount
            </button>

          </div>

        ) : (

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-5
          ">

            {discounts.map((discount) => (

              <div
                key={discount.id}
                className="
                  bg-white/80
                  backdrop-blur-md
                  border
                  border-white
                  rounded-2xl
                  p-5
                  shadow-sm
                  hover:shadow-md
                  transition-all
                "
              >

                <div className="
                  flex
                  justify-between
                  items-start
                ">

                  <div>

                    <h3 className="
                      font-black
                      text-slate-800
                    ">
                      {discount.name}
                    </h3>

                    <p className="
                      text-xs
                      text-slate-400
                      mt-1
                    ">
                      {discount.discount_type === "DIRECT"
                        ? "Direct Discount"
                        : "Product Discount"}
                    </p>

                  </div>


                  <span
                    className={`
                      px-2.5
                      py-1
                      rounded-full
                      text-[10px]
                      font-black
                      uppercase
                      ${
                        discount.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}
                  >
                    {discount.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>


                <div className="
                  mt-5
                  bg-slate-50
                  rounded-xl
                  p-4
                ">

                  <p className="
                    text-xl
                    font-black
                    text-indigo-600
                  ">
                    {getDiscountDescription(
                      discount
                    )}
                  </p>


                  {discount.discount_type ===
                    "PRODUCT" && (

                    <p className="
                      text-xs
                      text-slate-500
                      font-bold
                      mt-2
                    ">
                      Product:{" "}
                      {discount.product
                        ? getProductName(
                            discount.product
                          )
                        : "All Products"}
                    </p>

                  )}

                </div>


                <div className="
                  flex
                  gap-2
                  mt-5
                ">

                  <button
                    onClick={() =>
                      openEditModal(discount)
                    }
                    className="
                      flex-1
                      bg-indigo-50
                      text-indigo-600
                      py-2.5
                      rounded-lg
                      text-xs
                      font-bold
                      hover:bg-indigo-100
                    "
                  >
                    Edit
                  </button>


                  <button
                    onClick={() =>
                      handleToggleActive(discount)
                    }
                    className="
                      flex-1
                      bg-slate-100
                      text-slate-600
                      py-2.5
                      rounded-lg
                      text-xs
                      font-bold
                      hover:bg-slate-200
                    "
                  >
                    {discount.is_active
                      ? "Disable"
                      : "Enable"}
                  </button>


                  <button
                    onClick={() =>
                      handleDelete(discount.id)
                    }
                    className="
                      px-4
                      bg-red-50
                      text-red-500
                      rounded-lg
                      text-xs
                      font-bold
                      hover:bg-red-100
                    "
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}


        {/* =====================================================
            DISCOUNT MODAL
        ===================================================== */}

        {showModal && (

          <div className="
            fixed
            inset-0
            z-50
            bg-slate-900/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          ">

            <div className="
              bg-white
              w-full
              max-w-lg
              rounded-2xl
              shadow-2xl
              p-6
              max-h-[90vh]
              overflow-y-auto
            ">

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="
                flex
                justify-between
                items-center
                mb-6
              ">

                <div>

                  <h2 className="
                    text-xl
                    font-black
                    text-slate-800
                  ">
                    {editingDiscount
                      ? "Edit Discount"
                      : "Add Discount"}
                  </h2>

                  <p className="
                    text-xs
                    text-slate-400
                    mt-1
                  ">
                    Configure the discount rules
                  </p>

                </div>


                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="
                    text-slate-400
                    hover:text-slate-700
                    text-xl
                    font-bold
                  "
                >
                  ×
                </button>

              </div>


              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* -------------------------------------------------
                    DISCOUNT NAME
                ------------------------------------------------- */}

                <div>

                  <label className="
                    block
                    text-xs
                    font-black
                    text-slate-500
                    uppercase
                    mb-2
                  ">
                    Discount Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Example: Buy 2 Get 1"
                    className="
                      w-full
                      border
                      border-slate-200
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-indigo-500
                    "
                  />

                </div>


                {/* -------------------------------------------------
                    DISCOUNT TYPE
                ------------------------------------------------- */}

                <div>

                  <label className="
                    block
                    text-xs
                    font-black
                    text-slate-500
                    uppercase
                    mb-2
                  ">
                    Discount Type
                  </label>

                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="
                      w-full
                      border
                      border-slate-200
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  >

                    <option value="DIRECT">
                      Direct Discount
                    </option>

                    <option value="PRODUCT">
                      Product Discount
                    </option>

                  </select>

                </div>


                {/* =================================================
                    DIRECT DISCOUNT
                ================================================= */}

                {form.discount_type === "DIRECT" && (

                  <>

                    <div>

                      <label className="
                        block
                        text-xs
                        font-black
                        text-slate-500
                        uppercase
                        mb-2
                      ">
                        Value Type
                      </label>

                      <select
                        name="value_type"
                        value={form.value_type}
                        onChange={handleChange}
                        className="
                          w-full
                          border
                          border-slate-200
                          rounded-xl
                          px-4
                          py-3
                          text-sm
                          outline-none
                        "
                      >

                        <option value="PERCENTAGE">
                          Percentage
                        </option>

                        <option value="FIXED">
                          Fixed Amount
                        </option>

                      </select>

                    </div>


                    <div>

                      <label className="
                        block
                        text-xs
                        font-black
                        text-slate-500
                        uppercase
                        mb-2
                      ">
                        Discount Value
                      </label>

                      <input
                        type="number"
                        name="value"
                        min="0"
                        step="0.01"
                        value={form.value}
                        onChange={handleChange}
                        required
                        placeholder={
                          form.value_type ===
                          "PERCENTAGE"
                            ? "10"
                            : "50"
                        }
                        className="
                          w-full
                          border
                          border-slate-200
                          rounded-xl
                          px-4
                          py-3
                          text-sm
                          outline-none
                        "
                      />

                    </div>

                  </>

                )}


                {/* =================================================
                    PRODUCT DISCOUNT
                ================================================= */}

                {form.discount_type === "PRODUCT" && (

                  <>

                    {/* -------------------------------------------------
                        PRODUCT SELECTION
                    ------------------------------------------------- */}

                    <div className="relative">

                      <label className="
                        block
                        text-xs
                        font-black
                        text-slate-500
                        uppercase
                        mb-2
                      ">
                        Product
                      </label>


                      <input
                        type="text"
                        value={
                          form.product === ""
                            ? productSearch
                            : selectedProduct?.name ||
                              productSearch
                        }
                        onChange={(e) => {

                          setProductSearch(
                            e.target.value
                          );

                          setForm((prev) => ({
                            ...prev,
                            product: "",
                          }));

                          setShowProductResults(
                            true
                          );

                        }}
                        onFocus={() => {
                          setShowProductResults(
                            true
                          );
                        }}
                        placeholder="
                          Search product or leave blank for all products
                        "
                        className="
                          w-full
                          border
                          border-slate-200
                          rounded-xl
                          px-4
                          py-3
                          text-sm
                          outline-none
                          focus:border-indigo-500
                        "
                      />


                      {/* SEARCH RESULTS */}

                      {showProductResults && (

                        <div className="
                          absolute
                          z-50
                          left-0
                          right-0
                          mt-2
                          bg-white
                          border
                          border-slate-200
                          rounded-xl
                          shadow-xl
                          max-h-52
                          overflow-y-auto
                        ">

                          {/* ALL PRODUCTS */}

                          <button
                            type="button"
                            onClick={() => {

                              setForm((prev) => ({
                                ...prev,
                                product: "",
                              }));

                              setProductSearch("");

                              setShowProductResults(
                                false
                              );

                            }}
                            className="
                              w-full
                              text-left
                              px-4
                              py-3
                              text-sm
                              font-black
                              text-indigo-600
                              bg-indigo-50
                              hover:bg-indigo-100
                              transition-colors
                            "
                          >
                            All Products
                          </button>


                          {/* PRODUCTS */}

                          {filteredProducts.length ===
                          0 ? (

                            <div className="
                              px-4
                              py-3
                              text-sm
                              text-slate-400
                              font-bold
                            ">
                              No products found
                            </div>

                          ) : (

                            filteredProducts.map(
                              (product) => (

                                <button
                                  type="button"
                                  key={product.id}
                                  onClick={() => {

                                    setForm(
                                      (prev) => ({
                                        ...prev,
                                        product:
                                          product.id,
                                      })
                                    );

                                    setProductSearch(
                                      product.name
                                    );

                                    setShowProductResults(
                                      false
                                    );

                                  }}
                                  className="
                                    w-full
                                    text-left
                                    px-4
                                    py-3
                                    text-sm
                                    font-bold
                                    text-slate-700
                                    hover:bg-indigo-50
                                    hover:text-indigo-600
                                    transition-colors
                                  "
                                >
                                  {product.name}
                                </button>

                              )
                            )

                          )}

                        </div>

                      )}

                      <p className="
                        text-[11px]
                        text-slate-400
                        mt-2
                      ">
                        Choose <strong>All Products</strong> to
                        apply this offer to any product.
                      </p>

                    </div>


                    {/* -------------------------------------------------
                        QUANTITIES
                    ------------------------------------------------- */}

                    <div className="
                      grid
                      grid-cols-2
                      gap-3
                    ">

                      {/* BUY QUANTITY */}

                      <div>

                        <label className="
                          block
                          text-xs
                          font-black
                          text-slate-500
                          uppercase
                          mb-2
                        ">
                          Buy Quantity
                        </label>

                        <input
                          type="number"
                          name="buy_quantity"
                          min="1"
                          value={form.buy_quantity}
                          onChange={handleChange}
                          required
                          className="
                            w-full
                            border
                            border-slate-200
                            rounded-xl
                            px-4
                            py-3
                            text-sm
                            outline-none
                          "
                        />

                      </div>


                      {/* FREE QUANTITY */}

                      <div>

                        <label className="
                          block
                          text-xs
                          font-black
                          text-slate-500
                          uppercase
                          mb-2
                        ">
                          Free Quantity
                        </label>

                        <input
                          type="number"
                          name="free_quantity"
                          min="1"
                          value={form.free_quantity}
                          onChange={handleChange}
                          required
                          className="
                            w-full
                            border
                            border-slate-200
                            rounded-xl
                            px-4
                            py-3
                            text-sm
                            outline-none
                          "
                        />

                      </div>

                    </div>

                  </>

                )}


                {/* =================================================
                    ACTIVE
                ================================================= */}

                <label className="
                  flex
                  items-center
                  gap-3
                  bg-slate-50
                  rounded-xl
                  p-4
                  cursor-pointer
                ">

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />

                  <span className="
                    text-sm
                    font-bold
                    text-slate-700
                  ">
                    Discount is active
                  </span>

                </label>


                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="
                  flex
                  gap-3
                  pt-3
                ">

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="
                      flex-1
                      bg-slate-100
                      text-slate-600
                      py-3
                      rounded-xl
                      text-sm
                      font-bold
                    "
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      flex-1
                      bg-gradient-to-r
                      from-orange-500
                      to-indigo-600
                      text-white
                      py-3
                      rounded-xl
                      text-sm
                      font-bold
                      disabled:opacity-50
                    "
                  >
                    {saving
                      ? "Saving..."
                      : editingDiscount
                        ? "Update Discount"
                        : "Create Discount"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </MainLayout>

  );
}


export default Discounts;