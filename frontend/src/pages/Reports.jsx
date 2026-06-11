import { useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import {
  Calendar,
  DollarSign,
  Receipt,
  CreditCard,
} from "lucide-react";

import {
  getRangeReport,
} from "../services/reportsService";

function Reports() {

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [report, setReport] =
    useState(null);
  
  const navigate = useNavigate();

  const generateReport =
    async () => {

      try {

        if (
          !startDate ||
          !endDate
        ) {

          alert(
            "Select both dates"
          );

          return;
        }

        const data =
          await getRangeReport(
            startDate,
            endDate
          );

        setReport(data);
        localStorage.setItem(
          "report_start_date",
          startDate
        );

        localStorage.setItem(
          "report_end_date",
          endDate
        );

        localStorage.setItem(
          "report_data",
          JSON.stringify(data)
        );

      } catch (error) {

        console.error(error);

        alert(
          "Failed to load report"
        );
      }
    };

useEffect(() => {

  const savedStart =
    localStorage.getItem(
      "report_start_date"
    );

  const savedEnd =
    localStorage.getItem(
      "report_end_date"
    );

  const savedReport =
    localStorage.getItem(
      "report_data"
    );

  if (savedStart)
    setStartDate(savedStart);

  if (savedEnd)
    setEndDate(savedEnd);

  if (savedReport)
    setReport(
      JSON.parse(savedReport)
    );

}, []);


  return (

    <MainLayout>

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="text-slate-500 mt-2">
          Generate sales reports by date range
        </p>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
            className="
            border
            rounded-xl
            p-3
            "
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
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
              generateReport
            }
            className="
            bg-blue-600
            text-white
            rounded-xl
            p-3
            hover:bg-blue-700
            "
          >
            Generate Report
          </button>

        </div>

      </div>

      {report && (

<>

  <div className="grid md:grid-cols-4 gap-6">

    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500">
            Revenue
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹ {report.total_sales}
          </h2>

        </div>

        <DollarSign
          className="text-blue-600"
        />

      </div>

    </div>

    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500">
            Transactions
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {report.transactions}
          </h2>

        </div>

        <Receipt
          className="text-blue-600"
        />

      </div>

    </div>

    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500">
            Average Bill
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹ {report.average_bill}
          </h2>

        </div>

        <Calendar
          className="text-blue-600"
        />

      </div>

    </div>

    <div className="bg-white rounded-2xl shadow-md p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500">
            Most Used Payment
          </p>

          <h2 className="text-2xl font-bold mt-2 capitalize">
            {
              report
                ?.most_used_payment
                ?.payment_method
            }
          </h2>

        </div>

        <CreditCard
          className="text-blue-600"
        />

      </div>

    </div>

  </div>

  {/* Payment Breakdown + Top Products */}

  <div className="grid lg:grid-cols-2 gap-6 mt-8">

    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-4">
        Payment Breakdown
      </h2>

      {Object.entries(
        report.payment_summary
      ).map(
        ([key, value]) => (

        <div
          key={key}
          className="
          flex
          justify-between
          py-3
          border-b
          "
        >

          <span className="capitalize">
            {key}
          </span>

          <span className="font-semibold">
            ₹ {value}
          </span>

        </div>

      ))}

    </div>

    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-4">
        Top Products
      </h2>

      {report.top_products.map(
        (
          product,
          index
        ) => (

        <div
          key={index}
          className="
          flex
          justify-between
          py-3
          border-b
          "
        >

          <span>
            {
              product[
                "product__name"
              ]
            }
          </span>

          <span className="font-semibold">
            {
              product
                .quantity_sold
            }
          </span>

        </div>

      ))}

    </div>

  </div>

  {/* Transaction Table */}

  <div className="bg-white rounded-2xl shadow-md p-6 mt-8">

    <h2 className="text-xl font-semibold mb-4">
      Transaction Details
    </h2>

    <div className="overflow-x-auto">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-3 text-left">
              Bill No
            </th>

            <th className="p-3 text-left">
              Amount
            </th>

            <th className="p-3 text-left">
              Payment
            </th>

            <th className="p-3 text-left">
              Date
            </th>

            <th className="p-3 text-left">
              Invoice
            </th>

          </tr>

        </thead>

        <tbody>

          {report.details.map(
            (
              item
            ) => (

            <tr
              key={item.id}
            >

              <td className="p-3 border-b">
                {item.bill_number}
              </td>

              <td className="p-3 border-b">
                ₹ {item.amount}
              </td>

              <td className="p-3 border-b capitalize">
                {item.payment_method}
              </td>

              <td className="p-3 border-b">
                {
                  new Date(
                    item.created_at
                  ).toLocaleString()
                }
              </td>

              <td className="p-3 border-b">

                <button
                  onClick={() =>
                    navigate(
                      `/invoice/${item.id}`
                    )
                  }
                  className="
                  bg-blue-600
                  text-white
                  px-3
                  py-1
                  rounded-lg
                  hover:bg-blue-700
                  "
                >
                  View
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

  {/* Export Buttons */}

  <div className="flex gap-4 mt-8">

    <a
      href={`http://127.0.0.1:8000/api/reports/export/csv/?start_date=${startDate}&end_date=${endDate}`}
      target="_blank"
      rel="noreferrer"
      className="
      bg-green-600
      text-white
      px-5
      py-3
      rounded-xl
      hover:bg-green-700
      "
    >
      Export CSV
    </a>

    <a
      href={`http://127.0.0.1:8000/api/reports/export/excel/?start_date=${startDate}&end_date=${endDate}`}
      target="_blank"
      rel="noreferrer"
      className="
      bg-emerald-700
      text-white
      px-5
      py-3
      rounded-xl
      hover:bg-emerald-800
      "
    >
      Export Excel
    </a>

    <a
    href={`http://127.0.0.1:8000/api/reports/export/pdf/?start_date=${startDate}&end_date=${endDate}`}
    target="_blank"
    rel="noreferrer"
    className="
    bg-red-600
    text-white
    px-5
    py-3
    rounded-xl
    hover:bg-red-700
    "
  >
    Export PDF
  </a>

  </div>

</>

)}
    </MainLayout>

  );
}

export default Reports;