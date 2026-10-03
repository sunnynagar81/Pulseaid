import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useSocket } from "../../contexts/SocketContext";
import { AppBackground } from "../AppBackground";
import { cn } from "../../lib/cn";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DONOR_NAV = [
  { to: "/donor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/donor/alerts", label: "My Alerts", icon: Bell },
  { to: "/donor/profile", label: "Profile", icon: User },
];

const HOSPITAL_NAV = [
  { to: "/hospital", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/hospital/requests", label: "Requests", icon: Bell },
  { to: "/hospital/profile", label: "Profile", icon: User },
];

export function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, logout } = useAuthStore();
  const { connected } = useSocket();

  const navItems = role === "donor" ? DONOR_NAV : HOSPITAL_NAV;
  const location = useLocation();

  return (
    <div className="min-h-screen flex relative">
      <AppBackground />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 glass z-40 flex flex-col transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center shrink-0 shadow-soft">
              <HeartPulse className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-semibold text-ink-900">PulseAid</span>
          </div>
          <button className="lg:hidden text-ink-500" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-teal-700 text-white shadow-soft"
                    : "text-ink-600 hover:bg-white/70 hover:text-teal-800 hover:translate-x-0.5"
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/50">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-navy-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
              <p className="text-xs text-ink-500 truncate capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 glass flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-ink-600" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-200",
              connected ? "bg-teal-100 text-teal-700" : "bg-ink-100 text-ink-500"
            )}
            title={connected ? "Live connection active" : "Reconnecting…"}
          >
            {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{connected ? "Live" : "Offline"}</span>
          </div>
        </header>

                <main className="flex-1 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}