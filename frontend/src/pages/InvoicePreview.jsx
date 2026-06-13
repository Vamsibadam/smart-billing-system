import {
  useEffect,
  useState
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getBillDetails
} from "../services/billingService";

import {
  getStoreSettings
} from "../services/settingsService";

function InvoicePreview() {

  const { id } = useParams();

  const navigate =
    useNavigate();

  const [bill,
    setBill] =
    useState(null);

  const [store,
    setStore] =
    useState(null);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        const billData =
          await getBillDetails(id);

        const storeData =
          await getStoreSettings();

        setBill(
          billData
        );

        setStore(
          storeData
        );

      } catch (error) {

        console.error(error);
      }
  };

  if (!bill || !store) {

    return (
      <MainLayout>

        <div>
          Loading...
        </div>

      </MainLayout>
    );
  }

  return (

<MainLayout>
  <div
    className="
    max-w-5xl
    mx-auto
    bg-white
    border border-slate-200/80
    rounded-[28px]
    p-8
    shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]
    relative
    z-10
    "
  >
    {/* Header / Branding Block */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-normal text-slate-800">
          {store.shop_name}
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-2 max-w-sm leading-relaxed">
          {store.address}
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs font-semibold text-slate-400 mt-3">
          <span>Phone: {store.phone}</span>
          {store.gst_number && (
            <>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>GSTIN: {store.gst_number}</span>
            </>
          )}
        </div>
      </div>

      {store.logo_url && (
        <div className="flex-shrink-0">
          <img
            src={store.logo_url}
            alt="logo"
            className="h-24 w-auto max-w-[150px] object-contain"
          />
        </div>
      )}
    </div>

    {/* Invoice Information Block */}
    <div className="flex flex-col md:flex-row justify-between gap-6 my-8 items-start">
      <div>
        <span className="text-[10px] font-black tracking-widest uppercase text-indigo-500 bg-indigo-50 border border-indigo-100/40 px-2.5 py-1 rounded-md">
          Invoice Receipt
        </span>
        <h2 className="text-xl font-bold tracking-normal text-slate-800 mt-3.5">
          Bill Number: {bill.bill_number}
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
          Issued: {new Date(bill.created_at).toLocaleString()}
        </p>
      </div>

      <div className="w-full md:w-80 bg-slate-50/60 border border-slate-200/60 rounded-2xl p-5 shadow-3xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-0.5">
          Payment Settlement
        </h3>

        <div className="space-y-3">
          {bill?.payments?.map((payment, index) => (
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

          <div className="border-t border-slate-200/60 pt-3 mt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Amount Paid
            </span>
            <span className="text-base font-black text-indigo-600">
              ₹ {bill.total_amount}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Line Items Transaction Table */}
    <div className="overflow-x-auto max-w-full my-6">
      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
          <tr>
            <th className="pb-1 text-left pl-5">Product Item Description</th>
            <th className="pb-1 text-center w-24">Qty</th>
            <th className="pb-1 text-center w-32">Unit Price</th>
            <th className="pb-1 text-right pr-5 w-32">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {bill.items.map((item, index) => (
            <tr
              key={item.product_name || index}
              className={`border border-slate-100 rounded-xl overflow-hidden transition ${
                index % 2 === 0 ? "bg-slate-50/40" : "bg-transparent"
              }`}
            >
              <td className="p-4 font-bold text-slate-700 pl-5 rounded-l-xl">
                {item.product_name}
              </td>
              <td className="p-4 font-semibold text-slate-500 text-center">
                {item.quantity}
              </td>
              <td className="p-4 font-bold text-slate-400 text-center">
                ₹ {item.unit_price}
              </td>
              <td className="p-4 font-extrabold text-slate-800 text-right pr-5 rounded-r-xl">
                ₹ {item.subtotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Bottom Accounting Summary Block */}
    <div className="flex flex-col items-end gap-1.5 mt-6 pr-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Grand Total
      </span>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
        ₹ {bill.total_amount}
      </h2>
    </div>

    {/* Optional Messaging Area */}
    {store.footer_message && (
      <div className="text-center mt-12 pt-6 border-t border-slate-100 text-xs font-medium text-slate-400 tracking-wide">
        {store.footer_message}
      </div>
    )}

    {/* FIXED: Increased sizing parameter classes (px-6 py-3.5 text-sm) and synchronized colors with the orange/indigo palette core tokens */}
    <div className="flex flex-wrap gap-4 mt-8 pt-5 border-t border-slate-100">
      <button
        onClick={() => {
    const iframe = document.createElement("iframe");

    iframe.style.display = "none";

    iframe.src =
      `http://127.0.0.1:8000/api/billing/history/${bill.id}/pdf/`;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow.print();
    };
  }}
        className="
        bg-slate-800
        text-white
        px-6
        py-3.5
        rounded-xl
        text-sm
        font-bold
        tracking-wide
        shadow-sm
        hover:bg-slate-900
        transition-all
        cursor-pointer
        "
      >
        Print Receipt
      </button>

      <a
        href={`http://127.0.0.1:8000/api/billing/history/${bill.id}/pdf/`}
        target="_blank"
        rel="noreferrer"
        className="
        bg-gradient-to-r from-orange-500 to-indigo-600
        text-white
        px-6
        py-3.5
        rounded-xl
        text-sm
        font-bold
        tracking-wide
        shadow-sm
        hover:opacity-95
        transition-all
        "
      >
        Download PDF
      </a>

      <button
        onClick={() => navigate(-1)}
        className="
        bg-white
        border border-slate-200
        text-slate-600
        px-6
        py-3.5
        rounded-xl
        text-sm
        font-bold
        tracking-wide
        shadow-3xs
        hover:bg-slate-50
        hover:text-slate-800
        transition-all
        cursor-pointer
        "
      >
        Back
      </button>
    </div>
  </div>
</MainLayout>


  );
}

export default InvoicePreview;