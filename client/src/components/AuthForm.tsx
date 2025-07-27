import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const AuthForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResend, setShowResend] = useState(false);

  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      toast.success("Email successfully verified! You can now log in.");
      // Clear the query param from URL without reloading
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResend(false);

    if (!isLogin && password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    const endpoint = isLogin ? "/api/login" : "/api/signup";

    try {
      const res = await axios.post(endpoint, { email, password });

      if (isLogin) {
        login(res.data.token, res.data.email, res.data.userId);
        toast.success("Logged in successfully!");
      } else {
        toast.success("Account created! Please check your email to verify.");
        setIsLogin(true);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errMsg);

      if (isLogin && errMsg.toLowerCase().includes("verify")) {
        setShowResend(true);
      }
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("/api/resend-verification", { email });
      toast.success("Verification email resent. Please check your inbox.");
    } catch (err) {
      toast.error("Failed to resend verification email.");
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="text-black"
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="text-black"
          />
        )}
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="mt-2">
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
      </button>
      {showResend && (
        <button
          onClick={handleResend}
          className="mt-2 text-blue-600 hover:underline"
        >
          Resend Verification Email
        </button>
      )}
    </div>
  );
};

export default AuthForm;