import { useEffect, useState } from "react";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,

    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../services/expenseService";
import { Pencil, Trash2, Calendar, Wallet } from "lucide-react";
import { createPortal } from "react-dom";
import Notification from "../Notification";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


function CashBook() {
    const today = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [expenses, setExpenses] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [filterType, setFilterType] = useState("today");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const navigate = useNavigate();

    const [summary, setSummary] = useState({
    cash: 0,
    upi: 0,
    total: 0,
});

    const [notification, setNotification] = useState({
        show: false,
        type: "success",
        message: "",
    });

    const showNotification = (type, message) => {
        setNotification({
            show: true,
            type,
            message,
        });

        setTimeout(() => {
            setNotification((prev) => ({
                ...prev,
                show: false,
            }));
        }, 3000);
    };
    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        remarks: "",
        expense_date: today,
    });

    const filteredExpenses = expenses.filter((expense) => {
        const text = search.toLowerCase();

        return (
            expense.category_details.name.toLowerCase().includes(text) ||
            (expense.remarks || "").toLowerCase().includes(text) ||
            String(expense.amount).includes(text)
        );
    });
    useEffect(() => {
        loadCategories();
    }, []);




    const saveCategory = async () => {
        if (!newCategory.trim()) return;

        try {
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, {
                    name: newCategory,
                });
            } else {
                await createCategory({
                    name: newCategory,
                });
            }

            setNewCategory("");
            setEditingCategoryId(null);
            setShowCategoryModal(false);
            loadCategories();

        } catch (err) {
            console.error(err);
        }
    };

    const editCategory = (category) => {
        setEditingCategoryId(category.id);
        setNewCategory(category.name);
    };

    const removeCategory = async (id) => {
        if (!window.confirm("Delete Category?")) return;

        try {
            await deleteCategory(id);
            loadCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await getExpenses(
                filterType,
                fromDate,
                toDate
            );
            setExpenses(data.expenses || []); // Fallback to avoid map errors
            setSummary({
                cash: data.cash_total,
                upi: data.upi_total,
                total: data.total,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const loadCategories = async () => {
        try {
            const { data } = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, [
        filterType,
        fromDate,
        toDate
    ]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setFormData((prev) => ({
            ...prev,
            expense_date: newDate,
        }));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            category: "",
            amount: "",
            remarks: "",
            expense_date: selectedDate, // Syncs back to the current view date
        });
        setEditingId(null);
    };

    const saveExpense = async () => {
        if (!formData.category) {
            showNotification(
                "warning",
                "Please select a category."
            );
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            showNotification(
                "warning",
                "Please enter a valid amount."
            );
            return;
        }
        if (!formData.amount) return;
        try {
            if (editingId) {
                await updateExpense(editingId, formData);
            } else {
                await createExpense(formData);
            }
            cancelEdit(); // Helper simplifies structural reset
            loadExpenses();
            setShowExpenseModal(false);
            setOpenMenuId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const editExpense = (expense) => {
        setEditingId(expense.id);
        setFormData({
            category: expense.category,
            payment_method: expense.payment_method,
            amount: String(expense.amount),
            remarks: expense.remarks,
            expense_date: expense.expense_date
        });
        setSelectedDate(expense.expense_date);
        setShowExpenseModal(true);
    };

    const removeExpense = async (id) => {
        if (!window.confirm("Delete Expense?")) return;
        try {
            await deleteExpense(id);
            loadExpenses();
        } catch (err) {
            console.error(err);
        }
    };

    return (
       <div className="space-y-6">
  {/* HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
    <div>
      <button onClick={() => navigate("/dashboard")} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold tracking-normal text-slate-800">Business Expenses</h1>
      <p className="text-sm font-medium text-slate-400 mt-1">Track and manage all business expenses.</p>
    </div>
    
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => setShowCategoryModal(true)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
        + Category
      </button>
      <button onClick={() => { setEditingId(null); setFormData({ category: "", payment_method: "", amount: "", remarks: "", expense_date: selectedDate }); setShowExpenseModal(true); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white text-xs font-bold tracking-wide shadow-sm hover:opacity-95 transition cursor-pointer">
        + Add Expense
      </button>
    </div>
  </div>

  {/* TOTALS OVERVIEW */}
  <div className="flex items-center justify-between mt-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-wider">
    <div className="flex items-center gap-3"></div>
    <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
      <p>Cash : <span className="text-slate-700 font-black">₹{summary.cash}</span></p>
      <span className="text-slate-200">|</span>
      <p>UPI : <span className="text-slate-700 font-black">₹{summary.upi}</span></p>
      <span className="text-slate-200">|</span>
      <p className="bg-indigo-50 border border-indigo-100/40 text-indigo-600 px-2 py-0.5 rounded-md">
        Total : <span className="text-slate-800 font-black normal-case">₹{summary.total}</span>
      </p>
    </div>
  </div>

  {/* TOOLBAR */}
  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-5 shadow-3xs">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Search */}
      <div className="relative w-full lg:w-96">
        <input 
          type="text" 
          placeholder="Search expenses..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 rounded-xl p-2.5 pl-10 text-sm font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-400 transition-all" 
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

                          {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["today", "week", "month", "custom"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              filterType === type
                ? "bg-slate-800 text-white shadow-3xs"
                : "border border-slate-200 text-slate-500 bg-white hover:bg-slate-50"
            }`}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}

        {filterType === "custom" && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100 animate-fade-in w-full">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-400 transition"
            />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-400 transition"
            />
            <button
              onClick={() => loadExpenses()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold tracking-wide shadow-xs hover:bg-indigo-700 transition"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* BODY */}
  <div className="mt-6">
    <div>
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-normal text-slate-800">Expenses</h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Calendar size={16} className="text-slate-400" />
            {selectedDate}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sm font-bold text-slate-400 uppercase tracking-wider">Loading accounts data...</div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Wallet size={48} className="text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-slate-700 uppercase tracking-wider">No Expenses Found</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Start by adding business operational expenses for this date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="pb-1 text-left pl-4 w-40">Category</th>
                  <th className="pb-1 text-left w-36">Amount</th>
                  <th className="pb-1 text-left">Remarks</th>
                  <th className="pb-1 text-left w-32">Payment</th>
                  <th className="pb-1 text-left w-36">Date</th>
                  <th className="pb-1 text-right pr-4 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="bg-slate-50/40 border border-slate-100 rounded-xl overflow-hidden group hover:bg-slate-50 transition shadow-3xs">
                    <td className="py-3 px-4 rounded-l-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-white border-orange-200 text-orange-600 shadow-3xs">
                        {expense.category_details.name}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-black text-slate-800 text-base">₹{expense.amount}</td>
                    <td className="py-3 px-2 font-medium text-slate-500 max-w-xs truncate">
                      {expense.remarks || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wide">💳 {expense.payment_method}</td>
                    <td className="py-3 px-2 font-medium text-slate-400">{expense.expense_date}</td>
                    <td className="py-3 px-4 text-right rounded-r-xl relative font-semibold">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                        className="w-8 h-8 rounded-lg hover:bg-white hover:border hover:border-slate-200 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        ⋮
                      </button>
                      {openMenuId === expense.id && (
                        <div className="absolute right-4 mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-20 text-left text-xs font-bold">
                          <button
                            onClick={() => { editExpense(expense); setOpenMenuId(null); }}
                            className="w-full px-4 py-2.5 text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <span>✏️</span> Edit
                          </button>
                          <button
                            onClick={() => { removeExpense(expense.id); setOpenMenuId(null); }}
                            className="w-full px-4 py-2.5 text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <span>🗑️</span> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Add/Edit Expense Modal */}
  {showExpenseModal && createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold tracking-normal text-slate-800">
              {editingId ? "Edit Expense Entry" : "Add New Expense"}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">Complete general business operational record values.</p>
          </div>
          <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer">✕</button>
        </div>

                                {/* FORM */}
        <form 
          onSubmit={(e) => { e.preventDefault(); saveExpense(); }} 
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4"
        >
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Category
            </label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl p-3 outline-none cursor-pointer focus:bg-white focus:border-slate-300"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Payment Method
            </label>
            <select 
              name="payment_method" 
              value={formData.payment_method} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl p-3 outline-none cursor-pointer focus:bg-white focus:border-slate-300"
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Amount (INR)
            </label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all" 
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Expense Date
            </label>
            <input 
              type="date" 
              name="expense_date" 
              value={formData.expense_date} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-400 transition-all" 
              required
            />
          </div>

          {/* Remarks */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">
              Remarks / Ledger Notes
            </label>
            <textarea 
              rows="2" 
              name="remarks" 
              value={formData.remarks} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-400 transition-all resize-none" 
              placeholder="Provide extra description parameters..."
            />
          </div>

          {/* Buttons */}
          <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button 
              type="button" 
              onClick={() => setShowExpenseModal(false)} 
              className="px-5 py-2.5 border border-slate-200 text-slate-500 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white text-xs font-bold tracking-wide shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              {editingId ? "Update Record" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )}

  {/* showCategoryModal */}
  {showCategoryModal && createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-bold tracking-normal text-slate-800 mb-5">Expense Categories</h2>
        
        <div className="flex gap-2.5 mb-5">
          <input 
            type="text" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)} 
            placeholder="Category Name" 
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-400 transition" 
          />
          <button 
            type="button" 
            onClick={saveCategory} 
            className="rounded-xl bg-slate-900 px-5 text-xs font-bold tracking-wide text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {editingCategoryId ? "Update" : "Add"}
          </button>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-none">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-xl bg-slate-50/60 border border-slate-200/50 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              <span>{category.name}</span>
              <div className="flex gap-1">
                <button 
                  type="button" 
                  onClick={() => editCategory(category)} 
                  className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                >
                  Edit
                </button>
                <button 
                  type="button" 
                  onClick={() => removeCategory(category.id)} 
                  className="px-2 py-1 text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="button" 
            onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); setNewCategory(""); }} 
            className="px-4 py-2 border border-slate-200 text-slate-500 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}

  <Notification 
    show={notification.show} 
    type={notification.type} 
    message={notification.message} 
    onClose={() => setNotification((prev) => ({ ...prev, show: false }))} 
  />
</div>

    );

}

export default CashBook;
