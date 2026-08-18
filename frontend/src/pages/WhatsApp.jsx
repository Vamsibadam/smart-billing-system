import { useEffect, useState } from "react";
import {
  MessageCircle,
  Search,
  Users,
  CheckCircle2,
  Clock3,
  Send,
  Eye,
  AlertCircle,
  FileText,
  Megaphone,
  RefreshCw,
  ExternalLink,
  Phone,
  UserCheck,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function WhatsApp() {
  // ============================================================
  // STATE
  // ============================================================

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    invoice_messages: 0,
    marketing_messages: 0,
  });

  const [messages, setMessages] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [updatingOptIn, setUpdatingOptIn] = useState(null);

  // ============================================================
  // LOAD WHATSAPP DATA
  // ============================================================

  const loadWhatsAppData = async () => {
    try {
      setError("");

      const [
        statsResponse,
        messagesResponse,
      ] = await Promise.all([
        api.get("/billing/whatsapp/stats/"),
        api.get("/billing/whatsapp/messages/", {
          params: {
            ...(statusFilter && {
              status: statusFilter,
            }),
            ...(typeFilter && {
              type: typeFilter,
            }),
          },
        }),
      ]);

      setStats(
        statsResponse.data || {
          total: 0,
          pending: 0,
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
          invoice_messages: 0,
          marketing_messages: 0,
        }
      );

      setMessages(
        Array.isArray(messagesResponse.data)
          ? messagesResponse.data
          : messagesResponse.data?.results || []
      );
    } catch (err) {
      console.error(
        "Unable to load WhatsApp data:",
        err
      );

      setError(
        "Unable to load WhatsApp activity."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // LOAD CUSTOMERS
  // ============================================================

  const loadCustomers = async () => {
    try {
      const response = await api.get(
        "/billing/customers/"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setCustomers(data);
    } catch (err) {
      console.error(
        "Unable to load customers:",
        err
      );

      /*
       * Customer API may not exist yet.
       * WhatsApp page should still work without it.
       */
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadWhatsAppData();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadCustomers();
  }, []);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      loadWhatsAppData(),
      loadCustomers(),
    ]);
  };

  // ============================================================
  // CUSTOMER FILTER
  // ============================================================

  const filteredCustomers = customers
    .filter((customer) => {
      const value =
        search.trim().toLowerCase();

      if (!value) return true;

      return (
        customer.name
          ?.toLowerCase()
          .includes(value) ||
        customer.phone_number
          ?.toLowerCase()
          .includes(value)
      );
    })
    .slice(0, 5);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "—";
    }
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case "SENT":
        return {
          label: "Sent",
          className:
            "bg-blue-50 text-blue-600 border-blue-100",
          icon: Send,
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          className:
            "bg-emerald-50 text-emerald-600 border-emerald-100",
          icon: CheckCircle2,
        };

      case "READ":
        return {
          label: "Read",
          className:
            "bg-indigo-50 text-indigo-600 border-indigo-100",
          icon: Eye,
        };

      case "PENDING":
        return {
          label: "Pending",
          className:
            "bg-amber-50 text-amber-600 border-amber-100",
          icon: Clock3,
        };

      case "SENDING":
        return {
          label: "Sending",
          className:
            "bg-sky-50 text-sky-600 border-sky-100",
          icon: RefreshCw,
        };

      case "FAILED":
        return {
          label: "Failed",
          className:
            "bg-red-50 text-red-600 border-red-100",
          icon: AlertCircle,
        };

      default:
        return {
          label: status || "Unknown",
          className:
            "bg-slate-50 text-slate-500 border-slate-100",
          icon: Clock3,
        };
    }
  };

  // ============================================================
  // STATS CARDS
  // ============================================================

  const statCards = [
    {
      label: "Total Messages",
      value: stats.total,
      icon: MessageCircle,
      iconStyle:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
    },

    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      iconStyle:
        "bg-amber-50 text-amber-600 border-amber-100",
    },

    {
      label: "Sent",
      value: stats.sent,
      icon: Send,
      iconStyle:
        "bg-blue-50 text-blue-600 border-blue-100",
    },

    {
      label: "Delivered",
      value: stats.delivered,
      icon: CheckCircle2,
      iconStyle:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
    },

    {
      label: "Read",
      value: stats.read,
      icon: Eye,
      iconStyle:
        "bg-indigo-50 text-indigo-600 border-indigo-100",
    },

    {
      label: "Failed",
      value: stats.failed,
      icon: AlertCircle,
      iconStyle:
        "bg-red-50 text-red-600 border-red-100",
    },
  ];

  const handleRetry = async (messageId) => {
    try {

      setRetryingId(messageId);
      setError("");

      await api.post(
        `/billing/whatsapp/messages/${messageId}/retry/`
      );

      await loadWhatsAppData();

    } catch (err) {

      console.error(
        "Unable to retry WhatsApp message:",
        err
      );

      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        "Unable to retry WhatsApp message."
      );

    } finally {

      setRetryingId(null);
    }
  };
  const handleOptInToggle = async (
    customerId,
    currentValue
  ) => {

    try {

      setUpdatingOptIn(customerId);
      setError("");

      await api.patch(
        `/billing/customers/${customerId}/whatsapp-opt-in/`,
        {
          whatsapp_opt_in: !currentValue,
        }
      );

      await loadCustomers();

    } catch (err) {

      console.error(
        "Unable to update WhatsApp opt-in:",
        err
      );

      setError(
        err.response?.data?.error ||
        "Unable to update WhatsApp opt-in."
      );

    } finally {

      setUpdatingOptIn(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <MainLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-10">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">

          <div>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-600 mb-2">
              <MessageCircle size={15} />
              Customer Engagement
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
              WhatsApp
            </h1>

            <p className="text-sm text-slate-500 font-medium mt-2 max-w-2xl">
              Manage invoice delivery and WhatsApp
              communication with your customers.
            </p>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              self-start
              lg:self-auto
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              text-sm
              font-bold
              shadow-sm
              hover:border-emerald-200
              hover:text-emerald-600
              transition
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="
            mb-6
            rounded-2xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            flex
            items-center
            gap-3
            text-sm
            font-semibold
            text-red-600
          ">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        <div className="
          grid
          grid-cols-2
          sm:grid-cols-3
          xl:grid-cols-6
          gap-3
          sm:gap-4
          mb-6
        ">

          {statCards.map((stat) => {

            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-2xl
                  p-4
                  shadow-[0_4px_20px_-8px_rgba(0,0,0,0.10)]
                "
              >

                <div
                  className={`
                    w-10
                    h-10
                    rounded-xl
                    border
                    flex
                    items-center
                    justify-center
                    ${stat.iconStyle}
                  `}
                >
                  <Icon size={18} />
                </div>

                <div className="mt-4">

                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>

                  <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                    {loading
                      ? "—"
                      : stat.value}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

        {/* ================================================== */}
        {/* MESSAGE TYPE SUMMARY */}
        {/* ================================================== */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
          mb-6
        ">

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-[0_4px_20px_-8px_rgba(0,0,0,0.10)]
          ">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-blue-50
                  border
                  border-blue-100
                  text-blue-600
                  flex
                  items-center
                  justify-center
                ">
                  <FileText size={18} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Invoice Messages
                  </h2>

                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Bills sent through WhatsApp
                  </p>
                </div>

              </div>

              <span className="
                text-lg
                font-black
                text-slate-800
              ">
                {stats.invoice_messages}
              </span>

            </div>

          </div>

          <div className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-5
            shadow-[0_4px_20px_-8px_rgba(0,0,0,0.10)]
          ">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-purple-50
                  border
                  border-purple-100
                  text-purple-600
                  flex
                  items-center
                  justify-center
                ">
                  <Megaphone size={18} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Marketing Messages
                  </h2>

                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Promotional communication
                  </p>
                </div>

              </div>

              <span className="
                text-lg
                font-black
                text-slate-800
              ">
                {stats.marketing_messages}
              </span>

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* RECENT MESSAGES */}
        {/* ================================================== */}

        <div className="
          bg-white
          border
          border-slate-200
          rounded-3xl
          shadow-[0_4px_24px_-10px_rgba(0,0,0,0.12)]
          overflow-hidden
          mb-6
        ">

          <div className="
            px-5
            sm:px-6
            py-5
            border-b
            border-slate-100
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          ">

            <div>

              <h2 className="text-base font-black text-slate-800">
                Recent WhatsApp Messages
              </h2>

              <p className="text-xs text-slate-400 font-medium mt-1">
                Latest invoice and marketing activity
              </p>

            </div>
            <div className="
  flex
  flex-wrap
  items-center
  gap-2
">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="
      h-9
      px-3
      rounded-lg
      border
      border-slate-200
      bg-white
      text-xs
      font-bold
      text-slate-600
      outline-none
    "
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="DELIVERED">Delivered</option>
                <option value="READ">Read</option>
                <option value="FAILED">Failed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="
      h-9
      px-3
      rounded-lg
      border
      border-slate-200
      bg-white
      text-xs
      font-bold
      text-slate-600
      outline-none
    "
              >
                <option value="">All Types</option>
                <option value="INVOICE">Invoice</option>
                <option value="MARKETING">Marketing</option>
              </select>

            </div>
            <div className="
              flex
              items-center
              gap-2
              text-xs
              font-bold
              text-slate-400
            ">
              <MessageCircle size={14} />
              {messages.length} messages
            </div>

          </div>

          {loading ? (

            <div className="
              px-6
              py-12
              text-center
              text-sm
              font-semibold
              text-slate-400
            ">
              Loading WhatsApp messages...
            </div>

          ) : messages.length === 0 ? (

            <div className="
              px-6
              py-12
              text-center
            ">

              <div className="
                mx-auto
                w-12
                h-12
                rounded-2xl
                bg-slate-50
                border
                border-slate-100
                flex
                items-center
                justify-center
                text-slate-400
              ">
                <MessageCircle size={21} />
              </div>

              <p className="mt-4 text-sm font-black text-slate-700">
                No WhatsApp messages yet
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Invoice messages will appear here after sending.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>
                  <tr className="
                    bg-slate-50/70
                    border-b
                    border-slate-100
                  ">

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Customer
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Bill
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Type
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Status
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Updated
                    </th>

                    <th className="
                      px-5
                      py-3
                      text-right
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">
                      Invoice
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {messages
                    .slice(0, 10)
                    .map((message) => {

                      const status =
                        getStatusConfig(
                          message.status
                        );

                      const StatusIcon =
                        status.icon;

                      return (
                        <tr
                          key={message.id}
                          className="
                            border-b
                            border-slate-100
                            last:border-0
                            hover:bg-slate-50/60
                            transition
                          "
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="
                                w-9
                                h-9
                                rounded-xl
                                bg-emerald-50
                                text-emerald-600
                                flex
                                items-center
                                justify-center
                                font-black
                                text-xs
                              ">
                                {(
                                  message.customer_name ||
                                  "C"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="
                                  text-sm
                                  font-black
                                  text-slate-700
                                ">
                                  {message.customer_name ||
                                    "Customer"}
                                </p>

                                <p className="
                                  text-[11px]
                                  font-medium
                                  text-slate-400
                                  flex
                                  items-center
                                  gap-1
                                  mt-0.5
                                ">
                                  <Phone size={11} />
                                  {message.phone_number ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span className="
                              text-xs
                              font-black
                              text-slate-700
                            ">
                              {message.bill_number ||
                                "—"}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-2.5
                              py-1.5
                              rounded-lg
                              bg-slate-50
                              border
                              border-slate-100
                              text-[10px]
                              font-black
                              uppercase
                              tracking-wide
                              text-slate-500
                            ">

                              {message.message_type ===
                                "INVOICE"
                                ? "Invoice"
                                : "Marketing"}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1.5
                                px-2.5
                                py-1.5
                                rounded-lg
                                border
                                text-[10px]
                                font-black
                                uppercase
                                tracking-wide
                                ${status.className}
                              `}
                            >

                              <StatusIcon size={12} />

                              {status.label}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <span className="
                              text-xs
                              font-semibold
                              text-slate-500
                            ">
                              {formatDate(
                                message.updated_at
                              )}
                            </span>

                            {message.status ===
                              "FAILED" &&
                              message.error_message && (
                                <p className="
                                  mt-1
                                  max-w-[220px]
                                  truncate
                                  text-[10px]
                                  font-medium
                                  text-red-500
                                "
                                  title={
                                    message.error_message
                                  }>
                                  {message.error_message}
                                </p>
                              )}
                            {message.status === "FAILED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRetry(message.id)
                                }
                                disabled={retryingId === message.id}
                                className="
      inline-flex
      items-center
      gap-1.5
      mr-3
      text-xs
      font-black
      text-red-600
      hover:text-red-700
      disabled:opacity-50
    "
                              >
                                <RefreshCw
                                  size={13}
                                  className={
                                    retryingId === message.id
                                      ? "animate-spin"
                                      : ""
                                  }
                                />

                                {retryingId === message.id
                                  ? "Retrying..."
                                  : "Retry"}
                              </button>
                            )}

                          </td>

                          <td className="
                            px-5
                            py-4
                            text-right
                          ">

                            {message.invoice_url ? (

                              <a
                                href={
                                  message.invoice_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-black
                                  text-indigo-600
                                  hover:text-indigo-700
                                "
                              >
                                View
                                <ExternalLink
                                  size={13}
                                />
                              </a>

                            ) : (

                              <span className="
                                text-xs
                                font-semibold
                                text-slate-300
                              ">
                                —
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    })}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* INVOICE + MARKETING */}
        {/* ================================================== */}

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
          mb-6
        ">

          {/* INVOICE DELIVERY */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-6
            shadow-[0_4px_20px_-8px_rgba(0,0,0,0.10)]
          ">

            <div className="flex items-start justify-between">

              <div className="
                w-11
                h-11
                rounded-2xl
                bg-emerald-50
                border
                border-emerald-100
                text-emerald-600
                flex
                items-center
                justify-center
              ">
                <FileText size={20} />
              </div>

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-wider
                px-2.5
                py-1.5
                rounded-lg
                bg-emerald-50
                text-emerald-600
              ">
                Active
              </span>

            </div>

            <h2 className="
              mt-5
              text-lg
              font-black
              text-slate-800
            ">
              Invoice Delivery
            </h2>

            <p className="
              mt-2
              text-sm
              leading-relaxed
              font-medium
              text-slate-500
            ">
              Send customers their invoice through
              WhatsApp after completing a bill.
            </p>

            <div className="
              mt-5
              pt-4
              border-t
              border-slate-100
              grid
              grid-cols-2
              gap-3
            ">

              <div className="
                rounded-xl
                bg-slate-50
                border
                border-slate-100
                p-3
              ">
                <p className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                ">
                  Invoice Messages
                </p>

                <p className="
                  mt-1
                  text-lg
                  font-black
                  text-slate-800
                ">
                  {stats.invoice_messages}
                </p>
              </div>

              <div className="
                rounded-xl
                bg-slate-50
                border
                border-slate-100
                p-3
              ">
                <p className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-slate-400
                ">
                  Delivered
                </p>

                <p className="
                  mt-1
                  text-lg
                  font-black
                  text-emerald-600
                ">
                  {stats.delivered}
                </p>
              </div>

            </div>

          </div>

          {/* MARKETING */}

          <div className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-6
            shadow-[0_4px_20px_-8px_rgba(0,0,0,0.10)]
          ">

            <div className="flex items-start justify-between">

              <div className="
                w-11
                h-11
                rounded-2xl
                bg-purple-50
                border
                border-purple-100
                text-purple-600
                flex
                items-center
                justify-center
              ">
                <Megaphone size={20} />
              </div>

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-wider
                px-2.5
                py-1.5
                rounded-lg
                bg-slate-100
                text-slate-400
              ">
                Coming Soon
              </span>

            </div>

            <h2 className="
              mt-5
              text-lg
              font-black
              text-slate-800
            ">
              WhatsApp Marketing
            </h2>

            <p className="
              mt-2
              text-sm
              leading-relaxed
              font-medium
              text-slate-500
            ">
              Send promotional offers and targeted
              campaigns to customers who have opted in.
            </p>

            <div className="
              mt-5
              pt-4
              border-t
              border-slate-100
            ">

              <div className="
                flex
                items-center
                gap-2
                text-xs
                font-bold
                text-slate-400
              ">
                <Clock3 size={14} />
                Campaign tools will be available later.
              </div>

            </div>

          </div>

        </div>

        {/* ================================================== */}
        {/* CUSTOMERS */}
        {/* ================================================== */}

        <div className="
          bg-white
          border
          border-slate-200
          rounded-3xl
          p-5
          sm:p-6
          shadow-[0_4px_20px_-8px_rgba(0,0,0,0.10)]
        ">

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-5
          ">

            <div>

              <div className="
                flex
                items-center
                gap-2
              ">

                <Users
                  size={18}
                  className="text-indigo-600"
                />

                <h2 className="
                  text-base
                  font-black
                  text-slate-800
                ">
                  Recent Customers
                </h2>

              </div>

              <p className="
                text-xs
                font-medium
                text-slate-400
                mt-1
              ">
                Customers available for WhatsApp communication
              </p>

            </div>

            <div className="
              relative
              w-full
              sm:w-64
            ">

              <Search
                size={15}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search customer..."
                className="
                  w-full
                  h-10
                  pl-9
                  pr-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  focus:border-indigo-300
                  focus:bg-white
                  transition
                "
              />

            </div>

          </div>

          {filteredCustomers.length === 0 ? (

            <div className="
              py-8
              text-center
              text-sm
              font-medium
              text-slate-400
            ">
              No customers found.
            </div>

          ) : (

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-5
              gap-3
            ">

              {filteredCustomers.map(
                (customer) => (

                  <div
                    key={customer.id}
                    className="
                      border
                      border-slate-100
                      bg-slate-50/60
                      rounded-2xl
                      p-4
                    "
                  >

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      <div className="
                        w-9
                        h-9
                        rounded-xl
                        bg-indigo-50
                        border
                        border-indigo-100
                        text-indigo-600
                        flex
                        items-center
                        justify-center
                        font-black
                        text-xs
                      ">
                        {(
                          customer.name ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="
                          text-sm
                          font-black
                          text-slate-700
                          truncate
                        ">
                          {customer.name ||
                            "Unnamed Customer"}
                        </p>

                        <p className="
                          text-[11px]
                          font-medium
                          text-slate-400
                          truncate
                          mt-0.5
                        ">
                          {customer.phone_number ||
                            "No phone"}
                        </p>

                      </div>

                    </div>

                    <div className="
                      mt-3
                      pt-3
                      border-t
                      border-slate-200/70
                      flex
                      items-center
                      justify-between
                    ">

                      <span className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wide
                        text-slate-400
                      ">
                        WhatsApp
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleOptInToggle(
                            customer.id,
                            customer.whatsapp_opt_in
                          )
                        }
                        disabled={
                          updatingOptIn === customer.id
                        }
                        className={`
    inline-flex
    items-center
    gap-1.5
    px-2.5
    py-1.5
    rounded-lg
    text-[10px]
    font-black
    border
    transition
    disabled:opacity-50
    ${customer.whatsapp_opt_in
                            ? `
          bg-emerald-50
          text-emerald-600
          border-emerald-100
        `
                            : `
          bg-slate-100
          text-slate-500
          border-slate-200
        `
                          }
  `}
                      >
                        {updatingOptIn === customer.id ? (
                          <RefreshCw
                            size={12}
                            className="animate-spin"
                          />
                        ) : (
                          <UserCheck size={12} />
                        )}

                        {customer.whatsapp_opt_in
                          ? "Opted in"
                          : "Opt in"}
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>
    </MainLayout>
  );
}

export default WhatsApp;