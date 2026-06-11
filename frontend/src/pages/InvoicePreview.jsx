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
        rounded-2xl
        shadow-lg
        p-10
        "
      >

        {/* Header */}

        <div className="text-center">

          {store.logo_url && (

            <img
              src={store.logo_url}
              alt="logo"
              className="
              h-24
              mx-auto
              mb-4
              object-contain
              "
            />

          )}

          <h1
            className="
            text-3xl
            font-bold
            "
          >
            {store.shop_name}
          </h1>

          <p className="mt-2">
            {store.address}
          </p>

          <p>
            {store.phone}
          </p>

          <p>
            GST:
            {" "}
            {store.gst_number}
          </p>

        </div>

        <hr className="my-6" />

        {/* Invoice Info */}

        <div
          className="
          flex
          justify-between
          mb-8
          "
        >

          <div>

            <h2
              className="
              text-2xl
              font-bold
              "
            >
              Invoice
            </h2>

            <p>
              Bill:
              {" "}
              {bill.bill_number}
            </p>

          </div>

          <div>

            <p>
              Date:
              {" "}
              {
                new Date(
                  bill.created_at
                ).toLocaleString()
              }
            </p>

            <p>
              Payment:
              {" "}
              {
                bill.payment_method
              }
            </p>

          </div>

        </div>

        {/* Products */}

        <table
          className="
          w-full
          border
          "
        >

          <thead
            className="
            bg-blue-600
            text-white
            "
          >

            <tr>

              <th className="p-3">
                Product
              </th>

              <th className="p-3">
                Qty
              </th>

              <th className="p-3">
                Price
              </th>

              <th className="p-3">
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {bill.items.map(
              item => (

              <tr
                key={
                  item.product_name
                }
              >

                <td className="p-3 border">
                  {
                    item.product_name
                  }
                </td>

                <td className="p-3 border text-center">
                  {
                    item.quantity
                  }
                </td>

                <td className="p-3 border text-center">
                  ₹
                  {
                    item.unit_price
                  }
                </td>

                <td className="p-3 border text-center">
                  ₹
                  {
                    item.subtotal
                  }
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* Total */}

        <div
          className="
          text-right
          mt-8
          "
        >

          <h2
            className="
            text-3xl
            font-bold
            "
          >
            ₹
            {
              bill.total_amount
            }
          </h2>

        </div>

        <div
          className="
          text-center
          mt-10
          text-slate-500
          "
        >

          {
            store.footer_message
          }

        </div>

        {/* Buttons */}

        <div
          className="
          flex
          gap-4
          mt-10
          "
        >

          <button
            onClick={() =>
              window.print()
            }
            className="
            bg-green-600
            text-white
            px-5
            py-3
            rounded-xl
            "
          >
            Print
          </button>

          <a
            href={`http://127.0.0.1:8000/api/billing/history/${bill.id}/pdf/`}
            target="_blank"
            rel="noreferrer"
            className="
            bg-blue-600
            text-white
            px-5
            py-3
            rounded-xl
            "
          >
            Download PDF
          </a>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="
            bg-slate-700
            text-white
            px-5
            py-3
            rounded-xl
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