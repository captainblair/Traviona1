import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Newspaper,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLockup from '../BrandLockup.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  canManageInsights,
  canManageRecruitment,
  canManageUsers,
} from '../../lib/adminAccess.js';
import { getAdminPanelUrl } from '../../lib/apiBase.js';

const navLinkClass = ({ isActive }) =>
  `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, show: true },
    { to: '/admin/users', label: 'Users', icon: Users, show: canManageUsers(user) },
    { to: '/admin/jobs', label: 'Jobs', icon: BriefcaseBusiness, show: canManageRecruitment(user) },
    { to: '/admin/applications', label: 'Applications', icon: FileText, show: canManageRecruitment(user) },
    { to: '/admin/talents', label: 'Talent network', icon: Network, show: canManageRecruitment(user) },
    { to: '/admin/insights', label: 'Insights', icon: Newspaper, show: canManageInsights(user) },
  ].filter((item) => item.show);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link to="/" className="admin-sidebar-brand">
            <BrandLockup size="sm" theme="dark" align="left" />
          </Link>
          <button
            type="button"
            className="admin-sidebar-close lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={navLinkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-user-chip">
            <p className="admin-user-name">{user?.first_name || user?.username}</p>
            <p className="admin-user-meta">{user?.email}</p>
          </div>
          <a
            href={getAdminPanelUrl()}
            target="_blank"
            rel="noreferrer"
            className="admin-foot-link"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Website CMS (Django)
          </a>
          <Link to="/" className="admin-foot-link" onClick={() => setSidebarOpen(false)}>
            View public site
          </Link>
          <button type="button" onClick={handleLogout} className="admin-foot-link admin-foot-link-danger">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              type="button"
              className="admin-menu-btn lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="admin-topbar-kicker">Traviona console</p>
              <h1 className="admin-topbar-title">Administration</h1>
            </div>
          </div>
          <Link to="/" className="admin-topbar-site-link lg:hidden">
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            Public site
          </Link>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
