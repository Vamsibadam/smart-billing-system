import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCustomReport,
} from "../services/reportsService";

function Reports() {

  const [reportType, setReportType] =
    useState("daily");

  const [report, setReport] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  useEffect(() => {

    loadReport(reportType);

  }, [reportType]);

  const loadReport =
    async (type) => {

      try {

        let data;

        if (type === "daily") {

          data =
            await getDailyReport();

        } else if (
          type === "weekly"
        ) {

          data =
            await getWeeklyReport();

        } else {

          data =
            await getMonthlyReport();
        }

        setReport(data);

      } catch (error) {

        console.error(error);
      }
  };

  const loadCustomReport =
    async () => {

      try {

        if (!selectedDate) {

          alert(
            "Please select a date"
          );

          return;
        }

        const data =
          await getCustomReport(
            selectedDate
          );

        setReport(data);

      } catch (error) {

        console.error(error);

        alert(
          "Failed to load report"
        );
      }
  };

  return (
    <MainLayout>

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">
          Reports
        </h1>

        <p className="text-slate-500 mt-2">
          Sales analytics and exports
        </p>

      </div>

      <div className="flex flex-wrap gap-3 mb-8">

        <button
          onClick={() =>
            setReportType("daily")
          }
          className={
            reportType === "daily"
              ? "bg-blue-600 text-white px-5 py-3 rounded-xl"
              : "bg-white border px-5 py-3 rounded-xl"
          }
        >
          Daily
        </button>

        <button
          onClick={() =>
            setReportType("weekly")
          }
          className={
            reportType === "weekly"
              ? "bg-blue-600 text-white px-5 py-3 rounded-xl"
              : "bg-white border px-5 py-3 rounded-xl"
          }
        >
          Weekly
        </button>

        <button
          onClick={() =>
            setReportType("monthly")
          }
          className={
            reportType === "monthly"
              ? "bg-blue-600 text-white px-5 py-3 rounded-xl"
              : "bg-white border px-5 py-3 rounded-xl"
          }
        >
          Monthly
        </button>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Custom Date Report
        </h2>

        <div className="flex flex-wrap gap-4">

          <input
            type="date"
            value={selectedDate}
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
              loadCustomReport
            }
            className="
            bg-purple-600
            text-white
            px-5
            py-3
            rounded-xl
            hover:bg-purple-700
            "
          >
            Generate Report
          </button>

        </div>

      </div>

      {report && (

        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white rounded-2xl shadow-md p-6">

              <p className="text-slate-500">
                Total Sales
              </p>

              <h2 className="text-3xl font-bold mt-2">
                ₹ {report.total_sales}
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">

              <p className="text-slate-500">
                Transactions
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {report.transactions}
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">

              <p className="text-slate-500">
                Top Product
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {report.top_product}
              </h2>

            </div>

          </div>

          {report.details && (

            <div className="bg-white rounded-2xl shadow-md p-6 mt-8">

              <h2 className="text-xl font-semibold mb-4">
                Transaction Details
              </h2>

              <table className="w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-left">
                      Bill Number
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

                  </tr>

                </thead>

                <tbody>

                  {report.details.map(
                    (item, index) => (

                    <tr key={index}>

                      <td className="p-3 border-b">
                        {item.bill_number}
                      </td>

                      <td className="p-3 border-b">
                        ₹ {item.amount}
                      </td>

                      <td className="p-3 border-b">
                        {item.payment_method}
                      </td>

                      <td className="p-3 border-b">
                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

          <div className="mt-8 flex gap-4">

            <a
              href="http://127.0.0.1:8000/api/reports/sales/csv/"
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
              href="http://127.0.0.1:8000/api/reports/sales/excel/"
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

          </div>

        </>

      )}

    </MainLayout>
  );
}

export default Reports;