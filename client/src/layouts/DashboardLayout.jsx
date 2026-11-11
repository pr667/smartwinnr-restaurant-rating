import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquareText,
  UtensilsCrossed,
  Shield,
  Briefcase,
} from 'lucide-react';

const DashboardLayout = ({ role = 'ADMIN' }) => {
  const { user } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', padding: '2rem 0 4rem' }}>
        <div className="container">
          {/* Header banner */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                {role === 'ADMIN' ? (
                  <span className="badge badge-terracotta">
                    <Shield size={12} /> Administrator Portal
                  </span>
                ) : (
                  <span className="badge badge-forest">
                    <Briefcase size={12} /> Restaurant Owner Portal
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)' }}>
                {role === 'ADMIN' ? 'Platform Governance & Analytics' : 'Restaurant Management Console'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Welcome back, {user?.name}. Manage your verified records, reviews, and platform activity.
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.75rem',
              borderBottom: '1px solid var(--border-medium)',
              paddingBottom: '0.5rem',
              overflowX: 'auto',
            }}
          >
            {role === 'ADMIN' ? (
              <>
                <NavLink
                  to="/admin/dashboard"
                  end
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-terracotta-subtle)' : 'transparent',
                  })}
                >
                  <LayoutDashboard size={16} /> Overview
                </NavLink>
                <NavLink
                  to="/admin/users"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-terracotta-subtle)' : 'transparent',
                  })}
                >
                  <Users size={16} /> Users
                </NavLink>
                <NavLink
                  to="/admin/restaurants"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-terracotta-subtle)' : 'transparent',
                  })}
                >
                  <Building2 size={16} /> Restaurants
                </NavLink>
                <NavLink
                  to="/admin/reviews"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-terracotta-subtle)' : 'transparent',
                  })}
                >
                  <MessageSquareText size={16} /> Reviews
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/owner/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-forest-subtle)' : 'transparent',
                })}
              >
                <Building2 size={16} /> Assigned Restaurant Overview
              </NavLink>
            )}
          </div>

          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
