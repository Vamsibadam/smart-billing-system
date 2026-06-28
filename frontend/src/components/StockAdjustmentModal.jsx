import { useState } from "react";


import {
  adjustIngredientStock
} from "../services/ingredientService";

function StockAdjustmentModal({
  ingredient,
  onSave,
  onClose,
}) {
  const [quantity, setQuantity] = useState("");

  const [transactionType, setTransactionType] =
    useState("PURCHASE");

    const [showStockModal, setShowStockModal] =
  useState(false);

const [selectedStockIngredient, setSelectedStockIngredient] =
  useState(null);

  const handleStockAdjustment = async (
  data
) => {

  await adjustIngredientStock(

    selectedStockIngredient.id,

    data

  );

  fetchIngredients();

  setShowStockModal(false);

};

  const handleSubmit = () => {

    if (!quantity || Number(quantity) <= 0) {

      alert("Enter valid quantity.");

      return;

    }

    onSave({

      quantity,

      transaction_type: transactionType,

    });

  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

        <h2 className="text-2xl font-black text-slate-800">
          Adjust Stock
        </h2>

        <p className="text-slate-500 mt-1 mb-6">
          {ingredient.name}
        </p>

        <div className="mb-4">

          <label className="text-sm font-semibold">
            Current Stock
          </label>

          <div className="mt-2 text-xl font-black text-indigo-600">

            {ingredient.stock} {ingredient.unit}

          </div>

        </div>

        <div className="mb-4">

          <label className="text-sm font-semibold">

            Transaction

          </label>

          <select
            value={transactionType}
            onChange={(e)=>
              setTransactionType(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3 mt-2"
          >

            <option value="PURCHASE">

              Purchase

            </option>

            <option value="ADJUSTMENT">

              Adjustment

            </option>

            <option value="WASTAGE">

              Wastage

            </option>

          </select>

        </div>

        <div>

          <label className="text-sm font-semibold">

            Quantity

          </label>

          <input
            type="number"
            value={quantity}
            onChange={(e)=>
              setQuantity(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3 mt-2"
          />

        </div>

        <div className="flex gap-3 mt-8">

          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-3"
          >

            Cancel

          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-orange-500 to-indigo-600 text-white rounded-xl py-3"
          >

            Update Stock

          </button>

        </div>

      </div>

    </div>
  );
}

export default StockAdjustmentModal;