import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import habit from "../assets/habits.png";
import { useGoogleLogin } from "@react-oauth/google";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch {
      setError("Login failed. Please check your credentials.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const { data } = await axios.post("http://localhost:5000/api/auth/google-login", {
          access_token,
        });
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } catch {
        setError("Google login failed");
      }
    },
    onError: () => setError("Google login failed"),
    scope: "openid email profile",
    ux_mode: "popup",
  });

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      <div className="text-center pt-16 pb-8">
        <h2 className="text-4xl font-bold text-amber-900 mb-4">Login</h2>
        <p className="text-sm text-amber-800">
          Don’t have an account?{" "}
          <a href="/register" className="text-amber-950 underline font-medium">
            Sign Up
          </a>
        </p>
      </div>

      <div className="flex flex-1">
        <div className="w-1/2 flex justify-end items-center p-6">
          <img src={habit} alt="Habit" className="w-full max-w-xl object-contain" />
        </div>

        <div className="flex justify-center">
          <div className="w-px bg-amber-800 h-3/5 self-center" />
        </div>

        <div className="w-1/2 flex items-center ml-12">
          <div className="max-w-md w-full">
            <form onSubmit={handleLogin} className="space-y-2">
              <div className="space-y-4">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                className="w-3/4 py-2 mt-4 bg-amber-800 text-white rounded-md font-medium hover:bg-amber-700 transition"
              >
                Login
              </button>
            </form>

            <button
              onClick={() => googleLogin()}
              className="w-3/4 mt-3 flex items-center justify-center gap-3 py-2 border rounded-md shadow hover:shadow-md
                        bg-white text-amber-900 hover:bg-amber-50 transition">
              <FaGoogle className="h-5 w-5" />
              Sign in with Google
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
