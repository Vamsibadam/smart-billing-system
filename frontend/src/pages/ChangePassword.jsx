import { useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  changePassword,
} from "../services/authService";

import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";


function ChangePassword() {

  const [
    currentPassword,
    setCurrentPassword
  ] = useState("");

  const [
    newPassword,
    setNewPassword
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      alert("Please fill all fields");

      return;
    }


    if (newPassword.length < 8) {

      alert(
        "Password must be at least 8 characters"
      );

      return;
    }


    if (newPassword !== confirmPassword) {

      alert(
        "Passwords do not match"
      );

      return;
    }


    try {

      setLoading(true);

      await changePassword(
        currentPassword,
        newPassword
      );


      alert(
        "Password updated successfully"
      );


      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        "Failed to update password"
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <MainLayout>

      <div
        className="
          min-h-[calc(100vh-140px)]
          flex
          items-center
          justify-center

          py-8
          px-3
          sm:px-6

          relative
        "
      >

        {/* =====================================================
            BACKGROUND GLOW
        ===================================================== */}

        <div
          className="
            absolute
            top-10
            left-1/2
            -translate-x-1/2

            w-72
            h-72

            bg-indigo-300/10
            rounded-full
            blur-3xl

            pointer-events-none
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/4

            w-64
            h-64

            bg-orange-300/10
            rounded-full
            blur-3xl

            pointer-events-none
          "
        />


        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <div
          className="
            relative
            z-10

            w-full
            max-w-2xl

            bg-white/75
            backdrop-blur-xl

            border
            border-white/90

            rounded-[28px]

            shadow-[0_20px_60px_-20px_rgba(15,23,42,0.15)]

            overflow-hidden
          "
        >

          {/* ===================================================
              TOP ACCENT
          =================================================== */}

          <div
            className="
              h-1.5
              w-full

              bg-gradient-to-r
              from-orange-500
              via-amber-400
              to-indigo-500
            "
          />


          <div
            className="
              p-6
              sm:p-8
              md:p-10
            "
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-8
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >

                {/* Icon */}

                <div
                  className="
                    w-14
                    h-14
                    flex-shrink-0

                    rounded-2xl

                    bg-gradient-to-br
                    from-orange-500
                    via-amber-400
                    to-indigo-500

                    flex
                    items-center
                    justify-center

                    shadow-lg
                    shadow-indigo-200/40
                  "
                >

                  <LockKeyhole
                    size={24}
                    className="text-white"
                  />

                </div>


                {/* Heading */}

                <div>

                  <span
                    className="
                      text-[10px]
                      sm:text-[11px]

                      font-black
                      tracking-[0.2em]
                      uppercase

                      bg-gradient-to-r
                      from-orange-500
                      via-amber-500
                      to-indigo-500

                      bg-clip-text
                      text-transparent
                    "
                  >
                    Account Security
                  </span>


                  <h1
                    className="
                      text-2xl
                      sm:text-3xl

                      font-black
                      tracking-tight

                      text-slate-800

                      mt-1
                    "
                  >
                    Change Password
                  </h1>


                  <p
                    className="
                      text-sm

                      text-slate-400

                      mt-1
                    "
                  >
                    Keep your account protected with a
                    strong password.
                  </p>

                </div>

              </div>


              {/* Security badge */}

              <div
                className="
                  hidden
                  sm:flex

                  items-center
                  gap-1.5

                  px-3
                  py-2

                  rounded-xl

                  bg-emerald-50/80
                  border
                  border-emerald-100

                  text-emerald-600

                  text-[10px]
                  font-black
                  uppercase
                  tracking-wider
                "
              >

                <ShieldCheck size={13} />

                Secure

              </div>

            </div>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className="
                h-px
                w-full

                bg-gradient-to-r
                from-transparent
                via-slate-200
                to-transparent

                mb-8
              "
            />


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* =================================================
                  CURRENT PASSWORD
              ================================================= */}

              <div>

                <label
                  className="
                    block

                    text-[11px]
                    font-black

                    tracking-widest
                    uppercase

                    text-slate-500

                    mb-2
                  "
                >
                  Current Password
                </label>


                <div
                  className="
                    relative
                    group
                  "
                >

                  <div
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2

                      w-8
                      h-8

                      rounded-lg

                      bg-slate-100

                      flex
                      items-center
                      justify-center

                      text-slate-400

                      group-focus-within:bg-indigo-50
                      group-focus-within:text-indigo-500

                      transition-all
                    "
                  >

                    <KeyRound size={15} />

                  </div>


                  <input
                    type="password"

                    value={currentPassword}

                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }

                    className="
                      w-full

                      h-14

                      bg-white/80

                      border
                      border-slate-200

                      rounded-2xl

                      pl-16
                      pr-4

                      text-sm
                      font-semibold
                      text-slate-700

                      outline-none

                      placeholder:text-slate-300

                      focus:border-indigo-300
                      focus:ring-4
                      focus:ring-indigo-500/5

                      hover:border-slate-300

                      transition-all
                    "

                    placeholder="Enter your current password"
                  />

                </div>

              </div>


              {/* =================================================
                  NEW PASSWORD
              ================================================= */}

              <div>

                <label
                  className="
                    block

                    text-[11px]
                    font-black

                    tracking-widest
                    uppercase

                    text-slate-500

                    mb-2
                  "
                >
                  New Password
                </label>


                <div
                  className="
                    relative
                    group
                  "
                >

                  <div
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2

                      w-8
                      h-8

                      rounded-lg

                      bg-slate-100

                      flex
                      items-center
                      justify-center

                      text-slate-400

                      group-focus-within:bg-orange-50
                      group-focus-within:text-orange-500

                      transition-all
                    "
                  >

                    <LockKeyhole size={15} />

                  </div>


                  <input
                    type="password"

                    value={newPassword}

                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }

                    className="
                      w-full

                      h-14

                      bg-white/80

                      border
                      border-slate-200

                      rounded-2xl

                      pl-16
                      pr-4

                      text-sm
                      font-semibold
                      text-slate-700

                      outline-none

                      placeholder:text-slate-300

                      focus:border-orange-300
                      focus:ring-4
                      focus:ring-orange-500/5

                      hover:border-slate-300

                      transition-all
                    "

                    placeholder="Minimum 8 characters"
                  />

                </div>


                {/* Password requirement */}

                <div
                  className="
                    flex
                    items-center
                    gap-1.5

                    mt-2
                    ml-1

                    text-[10px]
                    font-semibold
                    text-slate-400
                  "
                >

                  <CheckCircle2
                    size={12}
                    className={
                      newPassword.length >= 8
                        ? "text-emerald-500"
                        : "text-slate-300"
                    }
                  />

                  At least 8 characters

                </div>

              </div>


              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}

              <div>

                <label
                  className="
                    block

                    text-[11px]
                    font-black

                    tracking-widest
                    uppercase

                    text-slate-500

                    mb-2
                  "
                >
                  Confirm Password
                </label>


                <div
                  className="
                    relative
                    group
                  "
                >

                  <div
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2

                      w-8
                      h-8

                      rounded-lg

                      bg-slate-100

                      flex
                      items-center
                      justify-center

                      text-slate-400

                      group-focus-within:bg-indigo-50
                      group-focus-within:text-indigo-500

                      transition-all
                    "
                  >

                    <ShieldCheck size={15} />

                  </div>


                  <input
                    type="password"

                    value={confirmPassword}

                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }

                    className="
                      w-full

                      h-14

                      bg-white/80

                      border
                      border-slate-200

                      rounded-2xl

                      pl-16
                      pr-4

                      text-sm
                      font-semibold
                      text-slate-700

                      outline-none

                      placeholder:text-slate-300

                      focus:border-indigo-300
                      focus:ring-4
                      focus:ring-indigo-500/5

                      hover:border-slate-300

                      transition-all
                    "

                    placeholder="Re-enter your new password"
                  />

                </div>

              </div>


              {/* =================================================
                  SUBMIT BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={loading}

                className="
                  w-full

                  h-14

                  mt-3

                  flex
                  items-center
                  justify-center
                  gap-3

                  bg-slate-900

                  text-white

                  rounded-2xl

                  font-black
                  text-sm

                  shadow-lg
                  shadow-slate-900/10

                  hover:bg-slate-800
                  hover:shadow-xl
                  hover:shadow-indigo-900/10

                  active:scale-[0.99]

                  transition-all
                  duration-200

                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                <span>
                  {loading
                    ? "Updating Password..."
                    : "Update Password"
                  }
                </span>


                {!loading && (
                  <span
                    className="
                      w-8
                      h-8

                      rounded-xl

                      bg-white/10

                      flex
                      items-center
                      justify-center
                    "
                  >

                    <ArrowRight size={16} />

                  </span>
                )}

              </button>

            </form>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-2

                mt-6

                text-[10px]
                font-bold

                text-slate-400

                uppercase
                tracking-wider
              "
            >

              <ShieldCheck
                size={13}
                className="text-emerald-500"
              />

              Your password is securely protected

            </div>

          </div>

        </div>

      </div>

    </MainLayout>

  );
}


export default ChangePassword;