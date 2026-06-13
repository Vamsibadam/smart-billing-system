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

  <div className="mb-6 relative z-10 px-6">
    <h1 className="text-3xl font-black tracking-tight text-slate-800">
      Store Settings
    </h1>
    <p className="text-sm font-semibold text-slate-400 mt-1">
      Manage shop information
    </p>
  </div>

  <div
    className="
    bg-gradient-to-r from-orange-200/20 via-gray to-indigo-300/30 backdrop-blur-md
    border border-slate-400
    rounded-[28px]
    p-6
    shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]
    relative
    z-10
    mx-6
    max-w-3xl
    "
  >

    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
          Shop Name
        </label>
        <input
          type="text"
          placeholder="Enter shop name"
          value={form.shop_name}
          onChange={(e) =>
            setForm({
              ...form,
              shop_name: e.target.value,
            })
          }
          className="
          w-full
          bg-slate-50/60
          border border-slate-500
          text-slate-800
          rounded-xl
          p-3
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

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
          Address
        </label>
        <textarea
          placeholder="Enter shop address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
          className="
          w-full
          bg-slate-50/60
          border border-slate-500
          text-slate-800
          rounded-xl
          p-3
          text-sm
          font-medium
          placeholder:text-slate-400
          outline-none
          focus:bg-white
          focus:border-indigo-400
          transition-all
          resize-none
          "
          rows="3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="Enter contact number"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="
            w-full
            bg-slate-50/60
            border border-slate-500
            text-slate-800
            rounded-xl
            p-3
            text-sm
            font-medium
            placeholder:text-slate-500
            outline-none
            focus:bg-white
            focus:border-indigo-400
            transition-all
            "
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
            GST Number
          </label>
          <input
            type="text"
            placeholder="Enter GSTIN identification"
            value={form.gst_number}
            onChange={(e) =>
              setForm({
                ...form,
                gst_number: e.target.value,
              })
            }
            className="
            w-full
            bg-slate-50/60
            border border-slate-500
            text-slate-800
            rounded-xl
            p-3
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
      </div>

      <div className="bg-slate-50/60 border border-slate-500 rounded-xl p-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Shop Logo
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
          className="
          w-full
          text-xs
          text-slate-500
          file:mr-4 
          file:py-2 
          file:px-4
          file:rounded-xl 
          file:border-0
          file:text-xs 
          file:font-bold
          file:bg-indigo-50 
          file:text-indigo-600
          hover:file:bg-indigo-100
          cursor-pointer
          "
        />

        {logo ? (
          <img
            src={URL.createObjectURL(logo)}
            alt="Logo Preview"
            className="h-16 mt-3 object-contain border border-slate-500 rounded-xl p-1.5 bg-white shadow-3xs"
          />
        ) : form.logo_url ? (
          <img
            src={form.logo_url}
            alt="Current Logo"
            className="h-16 mt-3 object-contain border border-slate-500 rounded-xl p-1.5 bg-white shadow-3xs"
          />
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
          Receipt Footer Message
        </label>
        <input
          type="text"
          placeholder="Thank you for shopping with us!"
          value={form.footer_message}
          onChange={(e) =>
            setForm({
              ...form,
              footer_message: e.target.value,
            })
          }
          className="
          w-full
          bg-slate-50/60
          border border-slate-500
          text-slate-800
          rounded-xl
          p-3
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

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          className="
          bg-gradient-to-r from-orange-500 to-indigo-600
          text-white
          px-6
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
          Save Settings
        </button>
      </div>

    </form>

  </div>

</MainLayout>

  );
}

export default StoreSettings;