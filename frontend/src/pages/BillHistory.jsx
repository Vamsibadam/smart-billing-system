import {
  useEffect,
  useState,
} from "react";
import {
  Search

} from "lucide-react";
import MainLayout from "../layouts/MainLayout";

import {
  getBillHistory,
  getBillDetail,
  deleteBill,
} from "../services/billingService";

import { useNavigate }
  from "react-router-dom";
import Loader from "../components/Loader";
import { createPortal } from "react-dom";

function BillHistory() {

  const [bills, setBills] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [selectedBill,
    setSelectedBill] =
    useState(null);

  const [showModal,
    setShowModal] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  useEffect(() => {

    fetchBills(getTodayDate());

  }, []);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  const fetchBills = async (date = "") => {

    try {

      setLoading(true);

      const data =
        await getBillHistory(date);

      setBills(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  const handleDateFilter =
    () => {

      fetchBills(
        selectedDate
      );
    };

  const handleView =
    async (id) => {

      try {

        const data =
          await getBillDetail(
            id
          );

        setSelectedBill(
          data
        );

        setShowModal(
          true
        );

      } catch (error) {

        console.error(error);
      }
    };

  const handleDelete = async () => {

    try {

      setDeleteLoading(true);

      await deleteBill(
        billToDelete.id
      );

      await fetchBills(
        selectedDate
      );

      setShowDeleteModal(false);
      setBillToDelete(null);

    } catch (error) {

      console.error(error);

    } finally {

      setDeleteLoading(false);

    }
  };

  const filteredBills =
    bills.filter(bill =>
      bill.bill_number
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  const navigate = useNavigate();

  if (loading) {

    return (
      <MainLayout>
        <Loader text="Loading bills..." />
      </MainLayout>
    );
  }

  return (

    <MainLayout>

      <div className="mb-6 relative z-10 px-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-800">
          Bill History
        </h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">
          View and manage bills
        </p>
      </div>

      <div
        className="
    bg-white
    border border-slate-200/80
    rounded-[28px]
    p-6
    shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]
    relative
    z-10
    mx-6
    "
      >

        <div
          className="
      flex
      gap-4
      mb-6
      flex-wrap
      items-center
      "
        >
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search Bill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
          w-full
          bg-slate-50/60
          border border-slate-200
          text-slate-800
          rounded-xl
          p-3
          pl-11
          text-sm
          font-medium
          placeholder:text-slate-400
          outline-none
          focus:bg-white
          focus:border-indigo-400
          transition-all
          "
            />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="
        bg-slate-50/60
        border border-slate-200
        text-slate-800
        rounded-xl
        p-3
        text-sm
        font-medium
        outline-none
        focus:bg-white
        focus:border-indigo-400
        transition-all
        "
          />

          <button
            onClick={handleDateFilter}
            className="
        bg-gradient-to-r from-orange-500 to-indigo-600
        text-white
        px-5
        py-3
        rounded-xl
        text-sm
        font-bold
        tracking-wide
        shadow-sm
        hover:opacity-95
        transition-all
        duration-200
        cursor-pointer
        "
          >
            Filter
          </button>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
              <tr>
                <th className="pb-1 text-left pl-4 w-52">Bill No</th>
                <th className="pb-1 text-left w-32">Amount</th>
                <th className="pb-1 text-left w-32">Payment</th>
                <th className="pb-1 text-left">Date</th>
                <th className="pb-1 text-right pr-4 w-40">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredBills.map(bill => (
                <tr
                  key={bill.id}
                  className="group hover:bg-slate-50/60 transition-all duration-150"
                >
                  <td className="py-3 px-4 font-semibold text-slate-700 rounded-l-xl">
                    {bill.bill_number}
                  </td>

                  <td className="py-3 px-2 font-bold text-slate-800">
                    ₹{bill.total_amount}
                  </td>

                  <td className="py-3 px-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200/60">
                      {bill.payment_display}
                    </span>
                  </td>

                  <td className="py-3 px-2 font-medium text-slate-400">
                    {new Date(bill.created_at).toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right rounded-r-xl font-semibold">
                    <button
                      onClick={() => navigate(`/invoice/${bill.id}`)}
                      className="
                  text-indigo-600 
                  bg-indigo-50 
                  px-3.5 
                  py-2.5 
                  rounded-xl 
                  hover:bg-indigo-200
                  hover:scale-[1.1]
                  hover:text-indigo-900
                  transition-all 
                  mr-2
                  cursor-pointer
                  "
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        setBillToDelete(bill);
                        setShowDeleteModal(true);
                      }}
                      className="
                  text-red-500 
                  px-3.5 
                  py-2.5 
                  rounded-xl
                  hover:bg-red-100 
                  transition-all
                  cursor-pointer
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

      {showModal && selectedBill && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-xl shadow-slate-950/5">
            <h2 className="text-xl font-bold tracking-normal text-slate-800 mb-6">
              {selectedBill.bill_number}
            </h2>

            <div className="overflow-x-auto max-w-full mb-6">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="pb-2 text-left pl-4">Product</th>
                    <th className="pb-2 text-center w-24">Qty</th>
                    <th className="pb-2 text-center w-28">Price</th>
                    <th className="pb-2 text-right pr-4 w-32">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedBill.items.map((item, index) => (
                    <tr key={index} className="bg-slate-50/40 border border-slate-100 rounded-xl overflow-hidden shadow-3xs">
                      <td className="p-3 font-bold text-slate-700 pl-4 rounded-l-xl">
                        {item.product_name}
                      </td>
                      <td className="p-3 font-semibold text-slate-500 text-center">
                        {item.quantity}
                      </td>
                      <td className="p-3 font-bold text-slate-600 text-center">
                        ₹{item.unit_price}
                      </td>
                      <td className="p-3 font-extrabold text-slate-800 text-right pr-4 rounded-r-xl">
                        ₹{item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grand Total</span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                ₹{selectedBill.total_amount}
              </h3>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <a
                href={`${import.meta.env.VITE_API_URL}/billing/history/${selectedBill.id}/pdf/`}
                target="_blank"
                rel="noreferrer"
                className="
            bg-indigo-600 
            text-white 
            px-4 
            py-2 
            rounded-xl 
            text-xs 
            font-semibold 
            shadow-sm 
            hover:opacity-95 
            transition
            "
              >
                Download PDF
              </a>

              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/billing/history/${selectedBill.id}/pdf/`, "_blank")}
                className="
            bg-emerald-600 
            text-white 
            px-4 
            py-2 
            rounded-xl 
            text-xs 
            font-semibold 
            shadow-sm 
            hover:opacity-95 
            transition
            "
              >
                Print
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="
            px-4 
            py-2 
            border 
            border-slate-200 
            text-slate-500 
            font-semibold 
            rounded-xl 
            text-xs 
            hover:bg-slate-50 
            transition
            "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && billToDelete && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4">

          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-7">

            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl">🗑️</span>
              </div>
            </div>

            <h2 className="text-xl font-black text-center text-slate-800">
              Delete Bill?
            </h2>

            <p className="mt-3 text-sm text-center text-slate-500 leading-relaxed">
              Are you sure you want to delete
              <br />
              <span className="font-bold text-slate-800">
                {billToDelete.bill_number}
              </span>
              ?
            </p>

            <div className="mt-2 text-center text-xs text-red-500 font-semibold">
              Inventory will be restored automatically.
            </div>

            <div className="flex gap-3 mt-8">

              <button
                onClick={() => {
                  if (deleteLoading) return;

                  setShowDeleteModal(false);
                  setBillToDelete(null);
                }}
                disabled={deleteLoading}
                className="
    flex-1
    py-3
    rounded-xl
    border
    border-slate-200
    bg-white
    text-slate-600
    font-bold
    hover:bg-slate-50
    transition
    cursor-pointer
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="
    flex-1
    py-3
    rounded-xl
    bg-gradient-to-r
    from-red-500
    to-red-600
    text-white
    font-bold
    transition-all
    duration-200
    cursor-pointer
    disabled:opacity-70
    disabled:cursor-not-allowed
    flex
    items-center
    justify-center
    gap-2
  "
              >
                {deleteLoading ? (
                  <>
                    <div
                      className="
          h-4
          w-4
          border-2
          border-white/40
          border-t-white
          rounded-full
          animate-spin
        "
                    />

                    <span>
                      Deleting...
                    </span>
                  </>
                ) : (
                  "Delete Bill"
                )}
              </button>

            </div>

          </div>

        </div>, document.body
      )}

    </MainLayout>

  );
}

export default BillHistory;