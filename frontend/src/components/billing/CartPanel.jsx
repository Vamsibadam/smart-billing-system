function CartPanel({
  cart,
  totalAmount,
  updateQuantity,
  removeItem,
  generateBill,
  holdBill,
  setShowHeldBills,
  setSelectedCartItem,
  setShowCustomize,
  setComboCartItem,
  setShowComboCustomize,
}) {

  return (

    <div className="bg-gradient-to-br from-orange-300/30 via-white to-indigo-300/30 backdrop-blur-md border border-white rounded-[24px] p-6 shadow-sm">

      

              <h2 className="text-xl font-bold tracking-normal text-slate-800 mb-4">
                Cart
              </h2>

              {cart.length === 0 ? (
                <div className="text-sm font-bold text-slate-400 py-12 text-center bg-white/40 border border-dashed border-slate-200 rounded-xl uppercase tracking-wider">
                  No Items Added
                </div>
              ) : (
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400 font-black text-[13px] tracking-wider uppercase">
                      <tr>
                        <th className="pb-3 text-left pl-2">Product</th>
                        <th className="pb-3 text-center w-24">Qty</th>
                        <th className="pb-3 text-center w-28">Options</th>
                        <th className="pb-3 text-center w-24">Price</th>
                        <th className="pb-3 text-center w-24">Total</th>
                        <th className="pb-3 text-center w-24">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {cart.map((item) => (
                        <tr
                          key={item.id}
                          className={`
                    transition-all
                    duration-150
                    
                    bg-white/60 border-slate-500 rounded-l-xl
                    hover:bg-white
                    
                    `}
                        >
                          <td className="p-3.5 font-bold text-slate-700 rounded-l-xl text-lg">
                            {item.name}
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => updateQuantity(item.id, e.target.value)}
                              className="
                        w-16
                        bg-slate-50
                        border border-slate-200
                        rounded-lg
                        p-1.5
                        text-center
                        text-xs
                        font-black
                        text-slate-800
                        outline-none
                        focus:bg-white
                        focus:border-indigo-400
                        transition-all
                        "
                            />
                          </td>

                          {/* FIXED: Dedicated column with a clean, high-visibility button */}
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                if (item.product_type === "COMBO") {
                                    setComboCartItem(item);
                                    setShowComboCustomize(true);
                                }
                                else{
                                    setSelectedCartItem(item);
                                    setShowCustomize(true);
                                }
                              }}
                              className="
                              inline-flex
                              items-center
                              justify-center
                              bg-indigo-50
                              text-indigo-600
                              hover:bg-indigo-100
                              px-3
                              py-1.5
                              rounded-lg
                              text-xs
                              font-bold
                              transition-all
                              cursor-pointer
                              "
                            >
                              Customize
                            </button>
                          </td>



                          <td className="p-3 text-center font-bold text-slate-400">
                            ₹{item.price}
                          </td>

                          <td className="p-3 text-center font-black text-slate-800">
                            ₹{(Number(item.price) * item.quantity).toFixed(2)}
                          </td>

                          <td className="p-3 text-center rounded-r-xl">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="
                        text-s
                        text-red-500
                        font-black
                        hover:text-red-600
                        px-2
                        py-1
                        rounded-lg
                        transition-all
                        "
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 border-t border-slate-200/50 pt-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Grand Total</p>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-0.5">
                      ₹{totalAmount.toFixed(2)}
                    </h2>
                  </div>


                </div>

                <div className="mt-5 flex gap-3 items-center">
                  <button
                    onClick={generateBill}
                    className="
            flex-1 
            bg-gradient-to-r from-orange-500 to-indigo-600 
            text-white 
            py-3.5 
            rounded-xl 
            text-sm 
            font-bold 
            tracking-wide 
            shadow-sm 
            hover:opacity-95 
            hover:scale-[1.002] 
            transition-all 
            duration-200
            cursor-pointer
            "
                  >
                    Generate Bill
                  </button>

                  <button
                    onClick={holdBill}
                    className="
            flex-initial
            bg-slate-500
            text-white
            px-5
            py-3.5
            rounded-xl
            text-sm 
            font-bold 
            tracking-wide 
            shadow-sm 
            hover:bg-slate-700
            hover:scale-[1.05] 
            transition-all 
            duration-200
            cursor-pointer
            "
                  >
                    Hold Bill
                  </button>
                  <button
                    onClick={() => setShowHeldBills(true)}
                    className="
            flex-initial
            bg-slate-500
            text-white
            px-5
            py-3.5
            rounded-xl
            text-sm 
            font-bold 
            tracking-wide 
            shadow-sm 
            hover:bg-slate-700
            hover:scale-[1.05] 
            transition-all 
            duration-200
            cursor-pointer
            "
                  >
                    View Held Bills
                  </button>
                </div>

              </div>


            </div>
        
    


  );

}

export default CartPanel;