import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, MessageCircle } from "lucide-react";

import { getStoreSettings } from "../services/settingsService";

function PublicInvoice() {
  const { token } = useParams();

  const [bill, setBill] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/billing/public-invoice/${token}/`
      );

      if (!response.ok) {
        throw new Error("Invoice not found");
      }

      const billData = await response.json();
      const storeData = await getStoreSettings();

      setBill(billData);
      setStore(storeData);

    } catch (err) {
      console.error("PUBLIC INVOICE ERROR:", err);
      setError(
        "This invoice could not be found or is no longer available."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const url =
      `${apiUrl}/billing/public-invoice/${token}/pdf/`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !bill || !store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            !
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-800">
            Invoice unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {error || "Unable to load this invoice."}
          </p>

        </div>
      </div>
    );
  }

  const subtotalAmount = Number(
    bill.subtotal_display ??
    bill.subtotal_amount ??
    0
  );

  const productDiscountAmount = Number(
    bill.product_discount_display?.amount ?? 0
  );

  const directDiscountAmount = Number(
    bill.direct_discount_amount ?? 0
  );

  const calculatedTotal =
    subtotalAmount -
    productDiscountAmount -
    directDiscountAmount;

  const roundedTotal = Math.round(calculatedTotal);

  const roundOffAmount =
    roundedTotal - calculatedTotal;

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-10 px-3 sm:px-6">

      <div className="max-w-5xl mx-auto">

        {/* =====================================================
            NEXBILL BRAND
        ====================================================== */}

        <div className="text-center mb-5">

          <div className="inline-flex items-center gap-2">

            <div className="
              w-9
              h-9
              rounded-xl
              bg-gradient-to-br
              from-orange-500
              to-indigo-600
              text-white
              flex
              items-center
              justify-center
              font-black
              text-sm
            ">
              N
            </div>

            <span className="
              text-lg
              font-black
              tracking-tight
              text-slate-800
            ">
              nex<span className="text-indigo-600">Bill</span>
            </span>

          </div>

        </div>


        {/* =====================================================
            INVOICE CARD
        ====================================================== */}

        <div className="
          bg-white
          border
          border-slate-200/80
          rounded-[28px]
          p-5
          sm:p-8
          shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)]
        ">

          {/* ===================================================
              STORE HEADER
          ==================================================== */}

          <div className="
            flex
            flex-col
            sm:flex-row
            items-center
            sm:items-start
            justify-between
            gap-6
            pb-6
            border-b
            border-slate-100
          ">

            <div className="text-center sm:text-left">

              <h1 className="
                text-2xl
                font-bold
                tracking-normal
                text-slate-800
              ">
                {store.shop_name}
              </h1>

              <p className="
                text-sm
                font-medium
                text-slate-400
                mt-2
                max-w-sm
                leading-relaxed
              ">
                {store.address}
              </p>

              <div className="
                flex
                flex-wrap
                items-center
                justify-center
                sm:justify-start
                gap-x-4
                gap-y-1
                text-xs
                font-semibold
                text-slate-400
                mt-3
              ">

                <span>
                  Phone: {store.phone}
                </span>

                {store.gst_number && (
                  <>
                    <span className="hidden sm:inline text-slate-300">
                      •
                    </span>

                    <span>
                      GSTIN: {store.gst_number}
                    </span>
                  </>
                )}

              </div>

            </div>


            {store.logo_url && (
              <div className="flex-shrink-0">

                <img
                  src={store.logo_url}
                  alt="Store logo"
                  className="
                    h-24
                    w-auto
                    max-w-[150px]
                    object-contain
                  "
                />

              </div>
            )}

          </div>


          {/* ===================================================
              INVOICE HEADER + PAYMENT
          ==================================================== */}

          <div className="
            flex
            flex-col
            md:flex-row
            justify-between
            gap-6
            my-8
            items-start
          ">

            <div>

              <span className="
                text-[10px]
                font-black
                tracking-widest
                uppercase
                text-indigo-500
                bg-indigo-50
                border
                border-indigo-100/40
                px-2.5
                py-1
                rounded-md
              ">
                Invoice Receipt
              </span>

              <h2 className="
                text-xl
                font-bold
                tracking-normal
                text-slate-800
                mt-3.5
              ">
                Bill Number: {bill.bill_number}
              </h2>

              <p className="
                text-xs
                font-semibold
                text-slate-400
                mt-1.5
                uppercase
                tracking-wider
              ">
                Issued:{" "}
                {new Date(
                  bill.created_at
                ).toLocaleString()}
              </p>

            </div>


            <div className="
              w-full
              md:w-80
              bg-slate-50/60
              border
              border-slate-200/60
              rounded-2xl
              p-5
            ">

              <h3 className="
                text-xs
                font-bold
                text-slate-400
                uppercase
                tracking-wider
                mb-4
              ">
                Payment Settlement
              </h3>

              <div className="space-y-3">

                {bill?.payments?.map(
                  (payment, index) => (

                    <div
                      key={index}
                      className="
                        flex
                        justify-between
                        items-center
                        text-sm
                      "
                    >

                      <span className="
                        capitalize
                        font-semibold
                        text-slate-500
                      ">
                        {payment.method}
                      </span>

                      <span className="
                        font-bold
                        text-slate-800
                      ">
                        ₹ {payment.amount}
                      </span>

                    </div>

                  )
                )}

                <div className="
                  border-t
                  border-slate-200/60
                  pt-3
                  mt-3
                  flex
                  justify-between
                  items-center
                ">

                  <span className="
                    text-xs
                    font-bold
                    text-slate-400
                    uppercase
                    tracking-wider
                  ">
                    Total Amount Paid
                  </span>

                  <span className="
                    text-base
                    font-black
                    text-indigo-600
                  ">
                    ₹ {roundedTotal}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* ===================================================
              CUSTOMER DETAILS
          ==================================================== */}

          <div className="
            w-full
            bg-indigo-50/50
            border
            border-indigo-100/70
            rounded-2xl
            p-5
            mb-6
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-4
            ">

              <h3 className="
                text-xs
                font-black
                text-indigo-500
                uppercase
                tracking-wider
              ">
                Customer Details
              </h3>

              {bill?.customer?.visit_count != null && (
                <span className="
                  text-[10px]
                  font-bold
                  text-indigo-600
                  bg-white
                  border
                  border-indigo-100
                  px-2.5
                  py-1
                  rounded-lg
                ">
                  {bill.customer.visit_count} visits
                </span>
              )}

            </div>


            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            ">

              <div>

                <p className="
                  text-[10px]
                  font-black
                  text-slate-400
                  uppercase
                  tracking-wider
                  mb-1
                ">
                  Name
                </p>

                <p className="
                  text-sm
                  font-bold
                  text-slate-700
                ">
                  {bill?.customer?.name ||
                    "Walk-in Customer"}
                </p>

              </div>


              <div>

                <p className="
                  text-[10px]
                  font-black
                  text-slate-400
                  uppercase
                  tracking-wider
                  mb-1
                ">
                  Phone / WhatsApp
                </p>

                <p className="
                  text-sm
                  font-bold
                  text-slate-700
                ">
                  {bill?.customer?.phone_number ||
                    "—"}
                </p>

              </div>

            </div>

          </div>


          {/* ===================================================
              ITEMS
          ==================================================== */}

          <div className="
            overflow-x-auto
            max-w-full
            my-6
          ">

            <table className="
              w-full
              text-sm
              border-separate
              border-spacing-y-2
            ">

              <thead className="
                text-slate-400
                font-bold
                text-[11px]
                tracking-wider
                uppercase
              ">

                <tr>

                  <th className="
                    pb-1
                    text-left
                    pl-5
                  ">
                    Product Item Description
                  </th>

                  <th className="
                    pb-1
                    text-center
                    w-24
                  ">
                    Qty
                  </th>

                  <th className="
                    pb-1
                    text-center
                    w-32
                  ">
                    Unit Price
                  </th>

                  <th className="
                    pb-1
                    text-right
                    pr-5
                    w-32
                  ">
                    Subtotal
                  </th>

                </tr>

              </thead>


              <tbody>

                {bill.items.map(
                  (item, index) => (

                    <tr
                      key={
                        item.product_name ||
                        index
                      }
                      className={
                        `border border-slate-100
                        rounded-xl
                        overflow-hidden
                        ${
                          index % 2 === 0
                            ? "bg-slate-50/40"
                            : "bg-transparent"
                        }`
                      }
                    >

                      <td className="
                        p-4
                        font-bold
                        text-slate-700
                        pl-5
                        rounded-l-xl
                      ">
                        {item.product_name}
                      </td>

                      <td className="
                        p-4
                        font-semibold
                        text-slate-500
                        text-center
                      ">
                        {item.quantity}
                      </td>

                      <td className="
                        p-4
                        font-bold
                        text-slate-400
                        text-center
                      ">
                        ₹ {item.unit_price}
                      </td>

                      <td className="
                        p-4
                        font-extrabold
                        text-slate-800
                        text-right
                        pr-5
                        rounded-r-xl
                      ">
                        ₹ {item.subtotal}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          {/* ===================================================
              ACCOUNTING SUMMARY
          ==================================================== */}

          <div className="
            flex
            flex-col
            items-end
            gap-2
            mt-8
            pr-2
          ">

            {/* Subtotal */}

            <div className="
              w-full
              max-w-sm
              flex
              justify-between
              items-center
            ">

              <span className="
                text-xs
                font-bold
                text-slate-400
                uppercase
                tracking-wider
              ">
                Subtotal
              </span>

              <span className="
                text-sm
                font-bold
                text-slate-700
              ">
                ₹{" "}
                {Number(
                  bill.subtotal_display ??
                  bill.subtotal_amount ??
                  0
                ).toFixed(2)}
              </span>

            </div>


            {/* Product Offer */}

            {bill.product_discount_display && (
              <div className="
                w-full
                max-w-sm
                flex
                justify-between
                items-center
              ">

                <div className="flex flex-col">

                  <span className="
                    text-xs
                    font-bold
                    text-slate-500
                  ">
                    {bill.product_discount_display.name}
                  </span>

                  <span className="
                    text-[10px]
                    font-semibold
                    text-slate-400
                  ">
                    Product Offer
                  </span>

                </div>

                <span className="
                  text-sm
                  font-black
                  text-emerald-600
                ">
                  - ₹{" "}
                  {Number(
                    bill.product_discount_display.amount
                  ).toFixed(2)}
                </span>

              </div>
            )}


            {/* Percentage Discount */}

            {Number(
              bill.discount_percentage || 0
            ) > 0 && (

              <div className="
                w-full
                max-w-sm
                flex
                justify-between
                items-center
              ">

                <div className="flex flex-col">

                  <span className="
                    text-xs
                    font-bold
                    text-slate-500
                  ">
                    Additional Discount
                  </span>

                  <span className="
                    text-[10px]
                    font-semibold
                    text-slate-400
                  ">
                    {Number(
                      bill.discount_percentage
                    ).toFixed(2)}%
                  </span>

                </div>

                <span className="
                  text-sm
                  font-black
                  text-emerald-600
                ">
                  - ₹{" "}
                  {Number(
                    bill.direct_discount_amount
                  ).toFixed(2)}
                </span>

              </div>
            )}


            {/* Round Off */}

            {Math.abs(
              roundOffAmount
            ) > 0.001 && (

              <div className="
                w-full
                max-w-sm
                flex
                justify-between
                items-center
              ">

                <span className="
                  text-xs
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-wider
                ">
                  Round Off
                </span>

                <span
                  className={`text-sm font-black ${
                    roundOffAmount >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {roundOffAmount >= 0
                    ? "+"
                    : "-"}{" "}
                  ₹{" "}
                  {Math.abs(
                    roundOffAmount
                  ).toFixed(2)}
                </span>

              </div>

            )}


            <div className="
              w-full
              max-w-sm
              border-t
              border-slate-200
              my-2
            " />


            {/* Grand Total */}

            <div className="
              w-full
              max-w-sm
              flex
              justify-between
              items-end
            ">

              <span className="
                text-[10px]
                font-bold
                text-slate-400
                uppercase
                tracking-wider
              ">
                Grand Total
              </span>

              <h2 className="
                text-3xl
                font-black
                text-slate-900
                tracking-tight
              ">
                ₹ {roundedTotal}
              </h2>

            </div>

          </div>


          {/* ===================================================
              MARKETING / THANK YOU
          ==================================================== */}

          <div className="
            mt-12
            pt-7
            border-t
            border-slate-100
            text-center
          ">

            <div className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-black
              text-slate-700
            ">

              <MessageCircle
                size={17}
                className="text-emerald-500"
              />

              Thank you for visiting us! ❤️

            </div>

            <p className="
              text-xs
              font-medium
              text-slate-400
              mt-2
              leading-relaxed
            ">
              Keep visiting for our latest
              offers and special deals.
            </p>

            <div className="
              mt-4
              text-[10px]
              font-black
              uppercase
              tracking-[0.18em]
              text-indigo-500
            ">
              Powered by nexBill
            </div>

          </div>


          {/* ===================================================
              DOWNLOAD PDF
          ==================================================== */}

          <div className="
            mt-7
            pt-5
            border-t
            border-slate-100
            flex
            justify-center
          ">

            <button
              type="button"
              onClick={downloadPDF}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-gradient-to-r
                from-orange-500
                to-indigo-600
                text-white
                px-7
                py-3.5
                rounded-xl
                text-sm
                font-bold
                tracking-wide
                shadow-sm
                hover:opacity-95
                active:scale-[0.98]
                transition-all
              "
            >

              <Download size={17} />

              Download PDF

            </button>

          </div>

        </div>


        {/* =====================================================
            NEXBILL FOOTER
        ====================================================== */}

        <div className="
          text-center
          mt-5
          text-[10px]
          font-semibold
          text-slate-400
        ">
          Digital invoice powered by{" "}
          <span className="text-indigo-500 font-black">
            nexBill
          </span>
        </div>

      </div>

    </div>
  );
}

export default PublicInvoice;