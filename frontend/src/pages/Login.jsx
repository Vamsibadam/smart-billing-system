import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";

function Login() {

  const navigate =
    useNavigate();

  const [username,
    setUsername] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const data =
          await login(
            username,
            password
          );

        localStorage.setItem(
          "access_token",
          data.access
        );

        localStorage.setItem(
          "refresh_token",
          data.refresh
        );

        localStorage.setItem(
          "username",
          data.username
        );

        navigate(
          "/dashboard"
        );

      } catch (error) {

        alert(
          "Invalid username or password"
        );

        console.error(error);

      } finally {

        setLoading(false);
      }
  };

  return (

    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-100
      "
    >

      <div
        className="
        bg-white
        p-10
        rounded-3xl
        shadow-lg
        w-[450px]
        "
      >

        <h1
          className="
          text-3xl
          font-bold
          text-center
          mb-2
          "
        >
          Smart Billing System
        </h1>

        <p
          className="
          text-center
          text-slate-500
          mb-8
          "
        >
          Admin Login
        </p>

        <form
          onSubmit={
            handleLogin
          }
        >

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
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
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
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
              ? "Logging In..."
              : "Login"
            }
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;