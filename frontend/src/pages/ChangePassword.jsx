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
          "
        >

          <h1
            className="
            text-3xl
            font-bold
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
            Update your admin password
          </p>

          <form
            onSubmit={
              handleSubmit
            }
          >

            <input
              type="password"
              placeholder="Current Password"
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
              mb-4
              "
            />

            <input
              type="password"
              placeholder="New Password"
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
              mb-4
              "
            />

            <input
              type="password"
              placeholder="Confirm Password"
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
              mb-6
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
              w-full
              bg-blue-600
              text-white
              p-3
              rounded-xl
              hover:bg-blue-700
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