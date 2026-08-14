import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Package,
  Search,
  X,
} from "lucide-react";

const unitMap = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  pcs: "pcs",
};

function LowStockWidget({ ingredients = [] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const alertCount = ingredients.length;

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ingredients;

    return ingredients.filter((item) =>
      item.name?.toLowerCase().includes(query)
    );
  }, [ingredients, search]);

  // ------------------------------------------------------------
  // MOST CRITICAL ITEM
  // ------------------------------------------------------------

  const criticalItem = useMemo(() => {
    if (!ingredients.length) return null;

    return [...ingredients].sort((a, b) => {
      const aRatio =
        Number(a.stock || 0) /
        Math.max(Number(a.minimum_stock || 1), 1);

      const bRatio =
        Number(b.stock || 0) /
        Math.max(Number(b.minimum_stock || 1), 1);

      return aRatio - bRatio;
    })[0];
  }, [ingredients]);

  const getUnit = (item) =>
    unitMap[item?.unit] || item?.unit || "";

  // ============================================================
  // CARD
  // ============================================================

  return (
    <>
      <div
        className="
          group
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-white/70
          bg-white/40
          shadow-[0_20px_60px_-25px_rgba(15,23,42,0.22)]
          backdrop-blur-2xl
          transition-all
          duration-500
          hover:shadow-[0_25px_70px_-25px_rgba(15,23,42,0.28)]
        "
      >

        {/* ======================================================
            LIQUID ORBS
        ======================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-20
            h-56
            w-56
            rounded-full
            bg-orange-400/20
            blur-3xl
            transition-all
            duration-700
            group-hover:scale-125
            group-hover:bg-orange-400/25
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-20
            h-56
            w-56
            rounded-full
            bg-indigo-500/15
            blur-3xl
            transition-all
            duration-700
            group-hover:scale-125
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-[30%]
            top-[-70px]
            h-32
            w-52
            rounded-full
            bg-white/70
            blur-3xl
          "
        />

        {/* ======================================================
            GLASS SURFACE
        ======================================================= */}

        <div
          className="
            relative
            z-10
            rounded-[30px]
            border
            border-white/60
            bg-white/35
            p-5
            backdrop-blur-xl
          "
        >

          {/* ====================================================
              HEADER
          ===================================================== */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[17px]
                  border
                  border-white/80
                  bg-white/60
                  text-slate-700
                  shadow-[inset_0_1px_3px_rgba(255,255,255,.9),0_5px_15px_rgba(15,23,42,.06)]
                  backdrop-blur-xl
                "
              >

                <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    h-7
                    w-7
                    rounded-full
                    bg-orange-300/30
                    blur-xl
                  "
                />

                {alertCount > 0 ? (
                  <AlertTriangle
                    size={18}
                    strokeWidth={1.8}
                    className="relative text-orange-500"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.8}
                    className="relative text-emerald-500"
                  />
                )}

              </div>

              <div>

                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.22em]
                    text-slate-400
                  "
                >
                  Inventory
                </p>

                <h3
                  className="
                    mt-0.5
                    text-[17px]
                    font-black
                    tracking-tight
                    text-slate-800
                  "
                >
                  Low Stock
                </h3>

              </div>

            </div>


            {/* LIQUID COUNT */}

            <div
              className="
                relative
                flex
                h-10
                min-w-10
                items-center
                justify-center
                overflow-hidden
                rounded-[15px]
                border
                border-white/80
                bg-white/55
                px-3
                shadow-sm
                backdrop-blur-xl
              "
            >

              <span
                className={`
                  text-sm
                  font-black
                  ${
                    alertCount
                      ? "text-orange-500"
                      : "text-emerald-500"
                  }
                `}
              >
                {alertCount}
              </span>

            </div>

          </div>


          {/* ====================================================
              MAIN LIQUID PANEL
          ===================================================== */}

          <div
            className="
              relative
              mt-5
              overflow-hidden
              rounded-[25px]
              border
              border-white/70
              bg-white/35
              p-4
              shadow-[inset_0_1px_3px_rgba(255,255,255,.85)]
              backdrop-blur-xl
            "
          >

            {/* Liquid background */}

            <div
              className="
                pointer-events-none
                absolute
                -right-10
                -top-12
                h-32
                w-32
                rounded-full
                bg-orange-300/20
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-12
                left-1/3
                h-24
                w-32
                rounded-full
                bg-indigo-300/15
                blur-2xl
              "
            />


            {alertCount === 0 ? (

              /* HEALTHY */

              <div className="relative flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white
                    bg-white/70
                    text-emerald-500
                    shadow-sm
                  "
                >
                  <CheckCircle2 size={18} />
                </div>

                <div>

                  <p
                    className="
                      text-xs
                      font-black
                      text-slate-700
                    "
                  >
                    All stock levels are healthy
                  </p>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      font-medium
                      text-slate-400
                    "
                  >
                    Nothing requires attention.
                  </p>

                </div>

              </div>

            ) : (

              /* ALERT */

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-slate-400
                      "
                    >
                      Needs attention
                    </p>

                    <div className="mt-1 flex items-baseline gap-2">

                      <span
                        className="
                          text-[46px]
                          font-black
                          leading-none
                          tracking-[-0.08em]
                          text-slate-800
                        "
                      >
                        {alertCount}
                      </span>

                      <span
                        className="
                          text-[10px]
                          font-bold
                          text-slate-400
                        "
                      >
                        alerts
                      </span>

                    </div>

                  </div>


                  {/* LIQUID ORB */}

                  <div
                    className="
                      relative
                      flex
                      h-[62px]
                      w-[62px]
                      items-center
                      justify-center
                      rounded-[45%_55%_58%_42%/50%_43%_57%_50%]
                      border
                      border-white/70
                      bg-gradient-to-br
                      from-orange-400/90
                      via-orange-500/80
                      to-amber-400/80
                      text-white
                      shadow-[0_12px_30px_-10px_rgba(249,115,22,.5)]
                      transition-all
                      duration-700
                      group-hover:rotate-6
                      group-hover:scale-105
                    "
                  >

                    <div
                      className="
                        absolute
                        left-2
                        top-2
                        h-3
                        w-5
                        rounded-full
                        bg-white/40
                        blur-sm
                      "
                    />

                    <AlertTriangle
                      size={21}
                      strokeWidth={1.7}
                    />

                  </div>

                </div>


                {/* CRITICAL ITEM */}

                {criticalItem && (

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-[20px]
                      border
                      border-white/80
                      bg-white/50
                      px-3.5
                      py-3
                      shadow-[inset_0_1px_2px_rgba(255,255,255,.8)]
                      backdrop-blur-md
                    "
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-white
                          bg-white/65
                          text-slate-500
                          shadow-sm
                        "
                      >
                        <Package size={14} />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-[8px]
                            font-black
                            uppercase
                            tracking-[0.16em]
                            text-slate-400
                          "
                        >
                          Most critical
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            font-black
                            text-slate-700
                          "
                        >
                          {criticalItem.name}
                        </p>

                      </div>

                    </div>


                    <div
                      className="
                        shrink-0
                        rounded-xl
                        border
                        border-orange-100/80
                        bg-orange-50/70
                        px-2.5
                        py-1.5
                        text-right
                        backdrop-blur-md
                      "
                    >

                      <p
                        className="
                          text-[11px]
                          font-black
                          text-orange-600
                        "
                      >
                        {criticalItem.stock}{" "}
                        {getUnit(criticalItem)}
                      </p>

                      <p
                        className="
                          text-[8px]
                          font-medium
                          text-slate-400
                        "
                      >
                        Min {criticalItem.minimum_stock}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            )}

          </div>


          {/* ====================================================
              ACTION
          ===================================================== */}

          {alertCount > 0 && (

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="
                group/button
                relative
                mt-3
                flex
                w-full
                items-center
                justify-between
                overflow-hidden
                rounded-[20px]
                border
                border-white/20
                bg-slate-900/90
                px-4
                py-3
                text-white
                shadow-[0_10px_25px_-12px_rgba(15,23,42,.35)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:bg-slate-800
                active:scale-[0.99]
              "
            >

              <span
                className="
                  absolute
                  -right-8
                  -top-10
                  h-20
                  w-32
                  rounded-full
                  bg-indigo-400/10
                  blur-2xl
                "
              />

              <span
                className="
                  relative
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                "
              >
                View all alerts
              </span>

              <span
                className="
                  relative
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  transition-transform
                  duration-300
                  group-hover/button:translate-x-1
                "
              >
                <ArrowUpRight size={13} />
              </span>

            </button>

          )}

        </div>

      </div>


      {/* ========================================================
          LIQUID GLASS MODAL
      ========================================================= */}

      {open && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/25
            p-4
            backdrop-blur-xl
          "
          onClick={() => setOpen(false)}
        >

          <div
            className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-[30px]
              border
              border-white/80
              bg-white/60
              shadow-[0_30px_100px_-25px_rgba(15,23,42,.40)]
              backdrop-blur-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal liquid */}

            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-24
                h-52
                w-52
                rounded-full
                bg-orange-300/25
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-20
                -left-20
                h-52
                w-52
                rounded-full
                bg-indigo-300/20
                blur-3xl
              "
            />


            <div className="relative z-10">

              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/70
                  px-5
                  py-4
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-[15px]
                      border
                      border-white
                      bg-white/70
                      text-slate-700
                      shadow-sm
                    "
                  >
                    <Package size={16} />
                  </div>

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-slate-400
                      "
                    >
                      Inventory
                    </p>

                    <h3
                      className="
                        mt-0.5
                        text-base
                        font-black
                        text-slate-800
                      "
                    >
                      Stock Alerts
                    </h3>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white
                    bg-white/60
                    text-slate-400
                    shadow-sm
                    hover:text-slate-700
                  "
                >
                  <X size={15} />
                </button>

              </div>


              {/* SEARCH */}

              <div className="p-4 pb-2">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-[18px]
                    border
                    border-white/80
                    bg-white/50
                    px-3
                    shadow-[inset_0_1px_2px_rgba(255,255,255,.8)]
                    backdrop-blur-xl
                  "
                >

                  <Search
                    size={14}
                    className="text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search inventory..."
                    autoFocus
                    className="
                      h-10
                      min-w-0
                      flex-1
                      border-0
                      bg-transparent
                      text-xs
                      font-medium
                      text-slate-700
                      outline-none
                      placeholder:text-slate-400
                    "
                  />

                </div>

              </div>


              {/* ITEMS */}

              <div
                className="
                  max-h-[390px]
                  space-y-2
                  overflow-y-auto
                  px-4
                  pb-5
                "
              >

                {filteredItems.map((ingredient) => {

                  const unit = getUnit(ingredient);

                  return (
                    <div
                      key={ingredient.id}
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-[21px]
                        border
                        border-white/80
                        bg-white/45
                        px-3
                        py-3
                        shadow-[inset_0_1px_2px_rgba(255,255,255,.7)]
                        backdrop-blur-xl
                      "
                    >

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-white
                            bg-white/65
                            text-slate-400
                            shadow-sm
                          "
                        >
                          <Package size={14} />
                        </div>

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              text-xs
                              font-bold
                              text-slate-700
                            "
                          >
                            {ingredient.name}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[9px]
                              text-slate-400
                            "
                          >
                            Minimum {ingredient.minimum_stock}{" "}
                            {unit}
                          </p>

                        </div>

                      </div>


                      <div
                        className="
                          ml-3
                          shrink-0
                          rounded-xl
                          border
                          border-orange-100
                          bg-orange-50/70
                          px-2.5
                          py-1.5
                          text-right
                        "
                      >

                        <p
                          className="
                            text-[11px]
                            font-black
                            text-orange-600
                          "
                        >
                          {ingredient.stock} {unit}
                        </p>

                        <p
                          className="
                            text-[8px]
                            text-slate-400
                          "
                        >
                          Current
                        </p>

                      </div>

                    </div>
                  );
                })}


                {!filteredItems.length && (

                  <div
                    className="
                      py-10
                      text-center
                      text-xs
                      font-medium
                      text-slate-400
                    "
                  >
                    No matching inventory
                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}
    </>
  );
}

export default LowStockWidget;