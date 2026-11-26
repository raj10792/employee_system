import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { token, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-decoration decoration-one" />
      <div className="login-decoration decoration-two" />
      <section className="login-card">
        <a className="brand login-brand" href="/">
          <span className="brand-mark">p</span><span>people<span className="brand-light">&amp;pay</span></span>
        </a>
        <p className="eyebrow">PEOPLE OPERATIONS</p>
        <h1>Good to have<br />you back.</h1>
        <p className="login-subtitle">Sign in to manage your people and payroll insights.</p>
        <form className="login-form" onSubmit={submit}>
          <label htmlFor="login-email">Work email</label>
          <input id="login-email" autoComplete="username" type="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" autoComplete="current-password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"} <span>→</span>
          </button>
        </form>
        <p className="login-footnote"><span className="secure-dot" /> Secure access for your organization</p>
      </section>
      <div className="login-aside">
        <div className="aside-orbit orbit-a" /><div className="aside-orbit orbit-b" />
        <div className="aside-content">
          <span className="aside-tag">YOUR PEOPLE, IN FOCUS</span>
          <h2>Better decisions<br />start with a clearer<br /><em>people picture.</em></h2>
          <p>One calm place to understand your team, compensation, and what comes next.</p>
          <div className="aside-stat">
            <div className="stat-avatars"><span>A</span><span>M</span><span>J</span><span>+</span></div>
            <div><strong>People first.</strong><small>Built for thoughtful teams</small></div>
          </div>
        </div>
        <small className="aside-copyright">PEOPLE &amp; PAYROLL, MADE HUMAN.</small>
      </div>
    </main>
  );
}
