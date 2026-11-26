import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../format";

export default function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = pathname === "/employees" ? "Employees" : "Overview";

  return (
    <header className="topbar">
      <div className="breadcrumb"><span>Workspace</span><b>/</b>{title}</div>
      <div className="topbar-right">
        <span className="today-label">{new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
        <span className="avatar">{initials(user?.email)}</span>
      </div>
    </header>
  );
}
