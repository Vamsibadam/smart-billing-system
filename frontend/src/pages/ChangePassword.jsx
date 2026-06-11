import { useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  changePassword,
} from "../services/authService";

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

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {

        alert(
          "Password must be at least 8 characters"
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {

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

      <div className="max-w-xl mx-auto">

        <div
          className="
          bg-white
          rounded-2xl
          shadow-md
          p-8
          border
          border-slate-100
          "
        >

          <h1
            className="
            text-3xl
            font-bold
            text-slate-800
            mb-2
            "
          >
            Change Password
          </h1>

          <p
            className="
            text-slate-500
            mb-8
            "
          >
            Update your account password securely
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            <div>

              <label
                className="
                block
                text-sm
                font-medium
                text-slate-700
                mb-2
                "
              >
                Current Password
              </label>

              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                className="
                w-full
                border
                rounded-xl
                p-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                "
                placeholder="Enter current password"
              />

            </div>

            <div>

              <label
                className="
                block
                text-sm
                font-medium
                text-slate-700
                mb-2
                "
              >
                New Password
              </label>

              <input
                type="password"
                value={
                  newPassword
                }
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                className="
                w-full
                border
                rounded-xl
                p-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                "
                placeholder="Minimum 8 characters"
              />

            </div>

            <div>

              <label
                className="
                block
                text-sm
                font-medium
                text-slate-700
                mb-2
                "
              >
                Confirm Password
              </label>

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="
                w-full
                border
                rounded-xl
                p-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                "
                placeholder="Re-enter new password"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-xl
              font-semibold
              hover:bg-blue-700
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
              "
            >

              {
                loading
                ? "Updating..."
                : "Update Password"
              }

            </button>

          </form>

        </div>

      </div>

    </MainLayout>

  );
}

export default ChangePassword;