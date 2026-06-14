import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Password validation checks
  const passwordChecks = {
    length: newPassword.length >= 9,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[\W_]/.test(newPassword),
  };
  const allChecksPassed = Object.values(passwordChecks).every(Boolean);

  // Step 1: Send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) {
      setStatus({ error: "Please enter your email address" });
      return;
    }
    setStatus("loading");
    try {
      const axios = (await import("axios")).default;
      const res = await axios.post(
        "/api/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setStatus({ success: res.data.message });
      setStep(2);
      setCountdown(60);
      // Focus first OTP input after step change
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setStatus({
        error:
          err?.response?.data?.error || "Failed to send OTP. Please try again.",
      });
    }
  }

  // Handle OTP input
  function handleOtpChange(index, value) {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }

  // Resend OTP
  async function handleResendOtp() {
    if (countdown > 0) return;
    setStatus("loading");
    try {
      const axios = (await import("axios")).default;
      await axios.post(
        "/api/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setStatus({ success: "A new OTP has been sent to your email." });
      otpRefs.current[0]?.focus();
    } catch (err) {
      setStatus({
        error: err?.response?.data?.error || "Failed to resend OTP.",
      });
    }
  }

  // Step 2 → 3: Verify OTP and move to password step
  function handleVerifyOtp(e) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setStatus({ error: "Please enter the complete 6-digit OTP" });
      return;
    }
    setStatus(null);
    setStep(3);
  }

  // Step 3: Reset password
  async function handleResetPassword(e) {
    e.preventDefault();

    if (!allChecksPassed) {
      setStatus({ error: "Please meet all password requirements" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ error: "Passwords do not match" });
      return;
    }

    setStatus("loading");
    try {
      const axios = (await import("axios")).default;
      const res = await axios.post(
        "/api/reset-password",
        { email, otp: otp.join(""), newPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      setStatus({ success: res.data.message });
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus({
        error:
          err?.response?.data?.error ||
          "Password reset failed. Please try again.",
      });
    }
  }

  const stepLabels = ["Email", "Verify", "Reset"];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header Card */}
          <div className="bg-gray-50 rounded-lg shadow-md p-8 mb-6 mt-12">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600 text-center">
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Create your new password"}
            </p>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mt-6 gap-1">
              {stepLabels.map((label, idx) => {
                const stepNum = idx + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                return (
                  <React.Fragment key={stepNum}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-blue-600 text-white ring-4 ring-blue-100"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          stepNum
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 font-medium ${
                          isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {idx < stepLabels.length - 1 && (
                      <div
                        className={`h-0.5 w-12 mx-1 mb-5 transition-all duration-300 ${
                          step > stepNum ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-gray-50 rounded-lg shadow-md p-8">
            {/* ──── Step 1: Email ──── */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your registered email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  id="send-otp-btn"
                  type="submit"
                  disabled={status === "loading"}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                    status === "loading"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
                  }`}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            )}

            {/* ──── Step 2: OTP Verification ──── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Enter the 6-digit code sent to
                  </label>
                  <p className="text-center text-blue-600 font-medium text-sm mb-4 truncate">
                    {email}
                  </p>

                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in{" "}
                      <span className="font-semibold text-blue-600">
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={status === "loading"}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  id="verify-otp-btn"
                  type="submit"
                  disabled={status === "loading" || otp.join("").length !== 6}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                    status === "loading" || otp.join("").length !== 6
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
                  }`}
                >
                  Verify Code
                </button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setStep(1); setStatus(null); setOtp(["","","","","",""]); }}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Use a different email
                </button>
              </form>
            )}

            {/* ──── Step 3: New Password ──── */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="mt-3 space-y-1.5">
                      {[
                        { key: "length", label: "At least 9 characters" },
                        { key: "uppercase", label: "One uppercase letter" },
                        { key: "lowercase", label: "One lowercase letter" },
                        { key: "number", label: "One number" },
                        { key: "special", label: "One special character" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span
                            className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                              passwordChecks[key]
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {passwordChecks[key] ? "✓" : "·"}
                          </span>
                          <span
                            className={
                              passwordChecks[key]
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="mt-1.5 text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={
                    status === "loading" ||
                    !allChecksPassed ||
                    newPassword !== confirmPassword
                  }
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                    status === "loading" ||
                    !allChecksPassed ||
                    newPassword !== confirmPassword
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98]"
                  }`}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}

            {/* Status Messages */}
            {status && status !== "loading" && (
              <div
                className={`mt-6 p-4 rounded-lg text-center text-sm ${
                  status.error
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {status.error || status.success}
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center pt-6 mt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
