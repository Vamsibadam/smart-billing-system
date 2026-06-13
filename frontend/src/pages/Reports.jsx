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

  <div className="mb-6 relative z-10 px-6">
    <h1 className="text-3xl font-black tracking-tight text-slate-800">
      Reports
    </h1>
    <p className="text-sm font-semibold text-slate-400 mt-1">
      Generate sales reports by date range
    </p>
  </div>

  {/* Filter Control Box */}
  <div
    className="
    bg-white
    border border-slate-200/80
    rounded-[24px]
    p-6
    shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]
    relative
    z-10
    mx-6
    mb-6
    "
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
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

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
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
        onClick={generateReport}
        className="
        bg-gradient-to-r from-orange-500 to-indigo-600
        text-white
        p-3
        rounded-xl
        text-sm
        font-bold
        tracking-wide
        shadow-sm
        hover:opacity-95
        transition-all
        cursor-pointer
        "
      >
        Generate Report
      </button>
    </div>
  </div>

  {report && (
    <div className="px-6 space-y-6 pb-6 relative z-10">
      
      {/* Metric Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
              <h2 className="text-xl font-black text-slate-800 mt-1">₹ {report.total_sales}</h2>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500">
              <DollarSign size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
              <h2 className="text-xl font-black text-slate-800 mt-1">{report.transactions}</h2>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500">
              <Receipt size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Bill</p>
              <h2 className="text-xl font-black text-slate-800 mt-1">₹ {report.average_bill}</h2>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500">
              <Calendar size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Payment Channel</p>
              <h2 className="text-xl font-black text-slate-800 capitalize mt-1">
                {report?.most_used_payment?.payment_method || "—"}
              </h2>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-500">
              <CreditCard size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Side Metrics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-3xs">
          <h2 className="text-base font-bold text-slate-800 tracking-normal mb-4">Payment Breakdown</h2>
          <div className="divide-y divide-slate-100">
            {Object.entries(report.payment_summary).map(([key, value]) => (
              <div key={key} className="flex justify-between py-3 text-sm">
                <span className="capitalize font-semibold text-slate-500">{key}</span>
                <span className="font-bold text-slate-800">₹ {value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-3xs">
          <h2 className="text-base font-bold text-slate-800 tracking-normal mb-4">Top Products</h2>
          <div className="divide-y divide-slate-100">
            {report.top_products.map((product, index) => (
              <div key={index} className="flex justify-between py-3 text-sm">
                <span className="font-semibold text-slate-500">{product["product__name"]}</span>
                <span className="font-bold text-slate-800">{product.quantity_sold} <span className="text-[10px] text-slate-400 font-medium">sold</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Details Data Grid Section */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-3xs">
        <h2 className="text-base font-bold text-slate-800 tracking-normal mb-4">Transaction Details</h2>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
              <tr>
                <th className="pb-1 text-left pl-4 w-44">Bill No</th>
                <th className="pb-1 text-left w-32">Amount</th>
                <th className="pb-1 text-left w-32">Payment</th>
                <th className="pb-1 text-left">Date</th>
                <th className="pb-1 text-right pr-4 w-28">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.details.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/60 transition-all duration-150">
                  <td className="py-3 px-4 font-semibold text-slate-700 rounded-l-xl">{item.bill_number}</td>
                  <td className="py-3 px-2 font-bold text-slate-800">₹ {item.amount}</td>
                  <td className="py-3 px-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200/60 capitalize">
                      {item.payment_display}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right rounded-r-xl font-semibold">
                    <button
                      onClick={() => navigate(`/invoice/${item.id}`)}
                      className="text-indigo-600 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-200 hover:scale-[1.15] transition-all cursor-pointer"
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

      {/* Action Trigger Buttons Container */}
      <div className="flex gap-3 flex-wrap pt-2">
        <a
          href={`http://127.0.0.1:8000/api/reports/export/csv/?start_date=${startDate}&end_date=${endDate}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:text-slate-800 transition shadow-3xs"
        >
          Export CSV
        </a>

        <a
          href={`http://127.0.0.1:8000/api/reports/export/excel/?start_date=${startDate}&end_date=${endDate}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:text-slate-800 transition shadow-3xs"
        >
          Export Excel
        </a>

        <a
          href={`http://127.0.0.1:8000/api/reports/export/pdf/?start_date=${startDate}&end_date=${endDate}`}
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-sm hover:opacity-95 transition"
        >
          Export PDF
        </a>
      </div>

    </div>
  )}
</MainLayout>


  );
}

export default Reports;