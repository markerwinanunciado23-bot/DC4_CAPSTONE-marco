import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BusFront,
  LayoutDashboard,
  Map,
  CalendarDays,
  Ticket,
  LogOut,
  Menu,
  X,
  Route as RouteIcon,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/buses", label: "Bus Fleet", icon: BusFront },
    { to: "/routes", label: "Routes", icon: Map },
    { to: "/schedules", label: "Schedules", icon: CalendarDays },
    { to: "/bookings", label: "Bookings", icon: Ticket },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><BusFront size={26} /></div>
          <div>
            <strong>BLUE WAY</strong>
            <small>BUS MANAGEMENT</small>
          </div>
          <button className="mobile-close" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="nav-links">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <div className="admin-note">
              <RouteIcon size={16} />
              <span>Administrator mode</span>
            </div>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{user?.name}</strong>
              <small>{isAdmin ? "Administrator" : "Passenger"}</small>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-label">TRANSPORTATION MANAGEMENT</div>
          <div className="topbar-right">
            <span className="status-dot" />
            <span>Connected workspace</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>

        <footer className="footer">
          BLUE WAY BUS <span>·</span> Information & Transportation Management
        </footer>
      </main>
    </div>
  );
}