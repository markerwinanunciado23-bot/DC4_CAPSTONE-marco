import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BusFront, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(form);
      const destination =
        location.state?.from?.pathname ||
        (result.user.role === "admin" ? "/dashboard" : "/dashboard");

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to sign in. Check your credentials and API connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand"><BusFront size={28} /> BLUE WAY</div>
        <div className="auth-visual-copy">
          <span className="eyebrow">YOUR JOURNEY, REFINED</span>
          <h1>Every journey<br />starts with trust.</h1>
          <p>A clearer way to explore routes, schedules, fares, and your next destination.</p>
          <div className="auth-feature">
            <ShieldCheck size={19} />
            Secure access for passengers and administrators
          </div>
        </div>
        <div className="auth-bottom">BLUE WAY BUS INFORMATION SYSTEM</div>
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to Blue Way</h2>
          <p className="muted">Enter your account details to continue.</p>

          {error && <div className="alert error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>

            <button className="button-primary full-width" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            New to Blue Way? <Link to="/register">Create an account</Link>
          </p>

          <p className="auth-security">
            <ShieldCheck size={15} /> Protected account access
          </p>
        </div>
      </div>
    </div>
  );
}