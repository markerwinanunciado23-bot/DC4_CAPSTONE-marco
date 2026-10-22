import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BusFront, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});

    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (form.password !== form.password_confirmation) {
      nextErrors.password_confirmation = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setErrors(err.response?.data?.errors || {
        general:
          err.response?.data?.message ||
          (err.request && !err.response
            ? "Unable to connect to the API. Please make sure the server is running and try again."
            : "Registration failed."),
      });
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (field) => {
    const value = errors[field];
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand"><BusFront size={28} /> BLUE WAY</div>
        <div className="auth-visual-copy">
          <span className="eyebrow">TRAVEL WITH CLARITY</span>
          <h1>Your next<br />destination awaits.</h1>
          <p>Create an account to explore schedules and manage your bookings in one place.</p>
        </div>
        <div className="auth-bottom">BLUE WAY BUS INFORMATION SYSTEM</div>
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="muted">Join Blue Way as a passenger.</p>

          {fieldError("general") && (
            <div className="alert error-alert">{fieldError("general")}</div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
                autoComplete="name"
              />
              {fieldError("name") && <small className="field-error">{fieldError("name")}</small>}
            </label>

            <label>
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
              {fieldError("email") && <small className="field-error">{fieldError("email")}</small>}
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
                autoComplete="new-password"
              />
              {fieldError("password") && <small className="field-error">{fieldError("password")}</small>}
            </label>

            <label>
              Confirm password
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm({ ...form, password_confirmation: e.target.value })
                }
                required
                autoComplete="new-password"
              />
              {fieldError("password_confirmation") && (
                <small className="field-error">
                  {fieldError("password_confirmation")}
                </small>
              )}
            </label>

            <button className="button-primary full-width" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}