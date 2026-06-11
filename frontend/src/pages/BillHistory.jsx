import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getBillHistory,
  getBillDetail,
  deleteBill,
} from "../services/billingService";

import { useNavigate }
from "react-router-dom";

function BillHistory() {

  const [bills, setBills] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedDate,
    setSelectedDate] =
    useState("");

  const [selectedBill,
    setSelectedBill] =
    useState(null);

  const [showModal,
    setShowModal] =
    useState(false);

  useEffect(() => {

    fetchBills();

  }, []);

  const fetchBills =
    async (date = "") => {

      try {

        const data =
          await getBillHistory(
            date
          );

        setBills(data);

      } catch (error) {

        console.error(error);
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

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this bill?"
        );

      if (
        !confirmDelete
      ) return;

      try {

        await deleteBill(
          id
        );

        alert(
          "Bill deleted"
        );

        fetchBills();

      } catch (error) {

        console.error(error);

        alert(
          "Failed to delete bill"
        );
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


const navigate =
  useNavigate();


  return (

    <MainLayout>

      <div className="mb-6">

        <h1
          className="
          text-4xl
          font-bold
          text-slate-800
          "
        >
          Bill History
        </h1>

        <p
          className="
          text-slate-500
          mt-2
          "
        >
          View and manage bills
        </p>

      </div>

      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        p-6
        "
      >

        <div
          className="
          flex
          gap-4
          mb-6
          flex-wrap
          "
        >

          <input
            type="text"
            placeholder="Search Bill..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
            border
            rounded-xl
            p-3
            flex-1
            "
          />

          <input
            type="date"
            value={
              selectedDate
            }
            onChange={(e) =>
              setSelectedDate(
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
              handleDateFilter
            }
            className="
            bg-blue-600
            text-white
            px-5
            rounded-xl
            "
          >
            Filter
          </button>

        </div>

        <table
          className="
          w-full
          "
        >

          <thead
            className="
            bg-slate-100
            "
          >

            <tr>

              <th className="p-3">
                Bill No
              </th>

              <th className="p-3">
                Amount
              </th>

              <th className="p-3">
                Payment
              </th>

              <th className="p-3">
                Date
              </th>

              <th className="p-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredBills.map(
              bill => (

              <tr
                key={bill.id}
              >

                <td className="p-3 border-b">
                  {bill.bill_number}
                </td>

                <td className="p-3 border-b">
                  ₹{bill.total_amount}
                </td>

                <td className="p-3 border-b">
                  {bill.payment_method}
                </td>

                <td className="p-3 border-b">
                  {new Date(
                    bill.created_at
                  ).toLocaleString()}
                </td>

                <td className="p-3 border-b">

                  <button
                    onClick={() =>
                      navigate(
                        `/invoice/${bill.id}`
                      )
                    }
                    className="
                    bg-blue-600
                    text-white
                    px-3
                    py-2
                    rounded-lg
                    mr-2
                    "
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        bill.id
                      )
                    }
                    className="
                    bg-red-600
                    text-white
                    px-3
                    py-2
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

      {showModal &&
        selectedBill && (

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
            rounded-2xl
            p-6
            w-[600px]
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              mb-4
              "
            >
              {
                selectedBill.bill_number
              }
            </h2>

            <table
              className="
              w-full
              mb-4
              "
            >

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {selectedBill.items.map(
                  (
                    item,
                    index
                  ) => (

                  <tr
                    key={index}
                  >

                    <td>
                      {
                        item.product_name
                      }
                    </td>

                    <td>
                      {
                        item.quantity
                      }
                    </td>

                    <td>
                      ₹
                      {
                        item.unit_price
                      }
                    </td>

                    <td>
                      ₹
                      {
                        item.subtotal
                      }
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            <h3
              className="
              text-xl
              font-bold
              "
            >
              Total:
              ₹
              {
                selectedBill.total_amount
              }
            </h3>

            
            <div className="flex gap-3 mt-6">

              <a
                href={`http://127.0.0.1:8000/api/billing/history/${selectedBill.id}/pdf/`}
                target="_blank"
                rel="noreferrer"
                className="
                bg-blue-600
                text-white
                px-4
                py-2
                rounded-xl
                "
              >
                Download PDF
              </a>

              <button
                onClick={() =>
                  window.open(
                    `http://127.0.0.1:8000/api/billing/history/${selectedBill.id}/pdf/`,
                    "_blank"
                  )
                }
                className="
                bg-green-600
                text-white
                px-4
                py-2
                rounded-xl
                "
              >
                Print
              </button>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="
                bg-slate-700
                text-white
                px-4
                py-2
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

export default BillHistory;