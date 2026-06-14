import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/layout/Header";

const LoginPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState(null);

  // Handle form input changes
  function onChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle form submission
  async function onSubmit(e) {
    e.preventDefault();

    if (!form.role) {
      setStatus({ error: "Please select a role" });
      return;
    }

    setStatus("loading");

    try {
      const axios = (await import("axios")).default;

      const res = await axios.post("/api/login", form, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { data } = res;
      console.log("[Login] Server response:", data);

      // Extract user and role, considering different response formats
      //const userData = data.user || data;
      const userData = data.user;
      const userRole = userData.role || form.role;

      if (!userRole) {
        console.error("Login response:", data);
        throw new Error("Could not determine user role");
      }

      // Construct complete user object
      const completeUser = {
        ...userData,
        role: userRole,
      };

      // Store token if provided
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Store user object (includes _id, name, role)
      // if (data.user) {
      //   localStorage.setItem("user", JSON.stringify(userData));
      //   login(userData)
      // }

      console.log("[Login] Processed user data:", completeUser);

      // Update auth context with complete user data
      await login(completeUser);

      // Get cleaned role and determine redirect path
      const role = userRole.toLowerCase();
      const redirectPath =
        role === "admin" ? "/teacher/admin/dashboard" : `/${role}/dashboard`;

      // Show success message
      setStatus({ success: "Login successful! Redirecting..." });

      // Force a synchronous delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("[Login] Navigating to dashboard:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.log(err.response?.data);
      const message =
        err?.response?.data?.error || err.message || "Login failed";
      setStatus({ error: message });
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header Card */}
          <div className="bg-gray-50 rounded-lg shadow-md p-8 mb-6 mt-12">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-center">
              Sign in to AlumniConnect
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-gray-50 rounded-lg shadow-md p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* role selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role || ""}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="alumni">Alumni</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  status === "loading"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
              >
                {status === "loading" ? "Signing in..." : "Sign In"}
              </button>

              {/* Status Messages */}
              {status && status !== "loading" && (
                <div
                  className={`p-4 rounded-lg text-center ${
                    status.error
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {status.error || status.success}
                </div>
              )}

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
