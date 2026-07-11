import { useEffect, useState } from "react";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../../services/expenseService";
import { Pencil, Trash2, Calendar, Wallet } from "lucide-react";

function CashBook() {
    const today = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [expenses, setExpenses] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        category_name: "",
        amount: "",
        remarks: "",
        expense_date: today,
    });

    const categories = [
        "Raw Material",
        "Fuel",
        "Electricity",
        "Gas",
        "Salary",
        "Delivery",
        "Maintenance",
        "Miscellaneous",
    ];

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await getExpenses(selectedDate);
            setExpenses(data.expenses || []); // Fallback to avoid map errors
            setTotalExpense(Number(data.total || 0));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, [selectedDate]);

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
            category: "Raw Material",
            amount: "",
            remarks: "",
            expense_date: selectedDate, // Syncs back to the current view date
        });
    };

    const saveExpense = async () => {
        if (!formData.amount) return;
        try {
            if (editingId) {
                await updateExpense(editingId, formData);
            } else {
                await createExpense(formData);
            }
            cancelEdit(); // Helper simplifies structural reset
            loadExpenses();
        } catch (err) {
            console.error(err);
        }
    };

    const editExpense = (expense) => {
        setEditingId(expense.id);
        setFormData({
            category_name: expense.category,
            amount: String(expense.amount), // Coerce to string for React input element stability
            remarks: expense.remarks || "",
            expense_date: expense.expense_date,
        });
        setSelectedDate(expense.expense_date); // Switch daily view to matching edit entry
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Wallet className="text-orange-500" size={34} /> Cash Book
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your daily expenses.</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-indigo-600 rounded-3xl px-8 py-5 text-white shadow-xl">
                    <p className="text-xs uppercase font-bold opacity-80">
                        {selectedDate === today ? "Today's Expense" : "Selected Date Expense"}
                    </p>
                    <h1 className="text-4xl font-black mt-1">₹{totalExpense}</h1>
                </div>
            </div>

            {/* BODY */}
            <div className="grid lg:grid-cols-5 gap-8">
                {/* LEFT FORM */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-xl">
                                {editingId ? "Update Expense" : "Add Expense"}
                            </h2>
                            {editingId && (

                                <button
                                    onClick={() => {

                                        setEditingId(null);

                                        setFormData({
                                            category: "Raw Material",
                                            amount: "",
                                            remarks: "",
                                            expense_date: selectedDate,
                                        });

                                    }}
                                    className="
    w-full
    mt-3
    py-3
    rounded-2xl
    bg-slate-200
    hover:bg-slate-300
    font-bold
    transition-all
    "
                                >
                                    Cancel Edit
                                </button>

                            )}
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-slate-500">Date</label>
                                <input
                                    type="date"
                                    value={formData.expense_date}
                                    onChange={handleDateChange}
                                    className="w-full mt-2 border rounded-xl p-3"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500">Category</label>
                                <input
                                    list="expenseCategories"
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={handleChange}
                                    placeholder="Enter or Select Category"
                                    className="w-full mt-2 border rounded-xl p-3"
                                />

                                <datalist id="expenseCategories">

                                    {categories.map((cat) => (

                                        <option
                                            key={cat.id}
                                            value={cat.name}
                                        />

                                    ))}

                                </datalist>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500">Amount</label>
                                <input
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="Enter Amount"
                                    className="w-full mt-2 border rounded-xl p-3"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500">Remarks</label>
                                <textarea
                                    rows="4"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    placeholder="Optional..."
                                    className="w-full mt-2 border rounded-xl p-3 resize-none"
                                />
                            </div>
                            <button
                                onClick={saveExpense}
                                className="w-full bg-gradient-to-r from-orange-500 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all"
                            >
                                {editingId ? "Update Expense" : "Save Expense"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT LIST */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">Expenses</h2>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar size={18} /> {selectedDate}
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center py-20 text-slate-400">Loading...</div>
                        ) : expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Wallet size={60} className="text-slate-300" />
                                <h3 className="mt-5 text-xl font-black text-slate-700">
                                    No Expenses Found
                                </h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    Start by adding expenses for this date.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                                                    {expense.category.name}
                                                </span>
                                                <h3 className="mt-3 text-2xl font-black text-slate-800">
                                                    ₹{expense.amount}
                                                </h3>
                                                {expense.remarks && (
                                                    <p className="mt-2 text-sm text-slate-500">
                                                        {expense.remarks}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editExpense(expense)}
                                                    className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => removeExpense(expense.id)}
                                                    className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CashBook;
