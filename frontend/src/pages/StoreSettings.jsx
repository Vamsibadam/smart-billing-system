import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getStoreSettings,
  updateStoreSettings,
} from "../services/settingsService";

function StoreSettings() {
  const [form, setForm] =
    useState({
      shop_name: "",
      address: "",
      phone: "",
      gst_number: "",
      footer_message: "",
      logo_url: "",
    });

  const [logo, setLogo] =
    useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings =
    async () => {
      try {
        const data =
          await getStoreSettings();

        setForm(data);

      } catch (error) {
        console.error(error);
      }
    };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        const formData =
            new FormData();

            formData.append(
            "shop_name",
            form.shop_name
            );

            formData.append(
            "address",
            form.address
            );

            formData.append(
            "phone",
            form.phone
            );

            formData.append(
            "gst_number",
            form.gst_number
            );

            formData.append(
            "footer_message",
            form.footer_message
            );

            if (logo) {

            formData.append(
                "logo",
                logo
            );
            }

            await updateStoreSettings(
            formData
            );

        alert(
          "Store Settings Updated"
        );

      } catch (error) {
        console.error(error);

        alert(
          "Failed to update settings"
        );
      }
    };

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
          Store Settings
        </h1>

        <p
          className="
          text-slate-500
          mt-2
          "
        >
          Manage shop information
        </p>

      </div>

      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        p-8
        max-w-3xl
        "
      >

        <form
          onSubmit={
            handleSubmit
          }
        >

          <input
            type="text"
            placeholder="Shop Name"
            value={
              form.shop_name
            }
            onChange={(e) =>
              setForm({
                ...form,
                shop_name:
                  e.target.value,
              })
            }
            className="
            w-full
            border
            rounded-xl
            p-3
            mb-4
            "
          />

          <textarea
            placeholder="Address"
            value={
              form.address
            }
            onChange={(e) =>
              setForm({
                ...form,
                address:
                  e.target.value,
              })
            }
            className="
            w-full
            border
            rounded-xl
            p-3
            mb-4
            "
            rows="4"
          />

          <input
            type="text"
            placeholder="Phone"
            value={
              form.phone
            }
            onChange={(e) =>
              setForm({
                ...form,
                phone:
                  e.target.value,
              })
            }
            className="
            w-full
            border
            rounded-xl
            p-3
            mb-4
            "
          />

          <input
            type="text"
            placeholder="GST Number"
            value={
              form.gst_number
            }
            onChange={(e) =>
              setForm({
                ...form,
                gst_number:
                  e.target.value,
              })
            }
            className="
            w-full
            border
            rounded-xl
            p-3
            mb-4
            "
          />

          <div className="mb-4">

            <label className="block mb-2 font-medium">
              Shop Logo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setLogo(
                  e.target.files[0]
                )
              }
              className="
              w-full
              border
              rounded-xl
              p-3
              "
            />

            {logo ? (

              <img
                src={
                  URL.createObjectURL(
                    logo
                  )
                }
                alt="Logo Preview"
                className="
                h-24
                mt-4
                object-contain
                border
                rounded-lg
                p-2
                "
              />

            ) : form.logo_url ? (

              <img
                src={
                  form.logo_url
                }
                alt="Current Logo"
                className="
                h-24
                mt-4
                object-contain
                border
                rounded-lg
                p-2
                "
              />

            ) : null}

          </div>

          <input
            type="text"
            placeholder="Footer Message"
            value={
              form.footer_message
            }
            onChange={(e) =>
              setForm({
                ...form,
                footer_message:
                  e.target.value,
              })
            }
            className="
            w-full
            border
            rounded-xl
            p-3
            mb-6
            "
          />

          <button
            type="submit"
            className="
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-xl
            hover:bg-blue-700
            "
          >
            Save Settings
          </button>

        </form>

      </div>

    </MainLayout>
  );
}

export default StoreSettings;