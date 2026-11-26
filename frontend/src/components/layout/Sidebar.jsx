import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../format";

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/">
        <span className="brand-mark">p</span>
        <span>people<span className="brand-light">&amp;pay</span></span>
      </NavLink>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink className={({ isActive }) => `nav-item${isActive ? " selected" : ""}`} to="/" end>
          <span className="nav-icon">◫</span> Overview
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item${isActive ? " selected" : ""}`} to="/employees">
          <span className="nav-icon">♙</span> Employees
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="secure-note"><span className="secure-dot" /> Workspace secure</div>
        <button className="profile" onClick={logout} title="Sign out">
          <span className="avatar avatar-small">{initials(user?.email)}</span>
          <span className="profile-copy">
            <strong>{user?.email}</strong>
            <small>{user?.role?.replace("_", " ") || "HR manager"}</small>
          </span>
          <span className="logout-icon">↪</span>
        </button>
      </div>
    </aside>
  );
}
