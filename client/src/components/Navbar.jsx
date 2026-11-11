import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  UtensilsCrossed,
  Star,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Users,
  Building2,
  Menu,
  X,
  MessageSquareText,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isOwner, isCustomer, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem',
        }}
      >
        {/* Brand Identity */}
        <Link
          to="/"
          onClick={closeMenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-forest)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UtensilsCrossed size={18} strokeWidth={2} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              SmartWinnr
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              Fine Dining & Reviews
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav"
        >
          <NavLink
            to="/restaurants"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
              textDecoration: 'none',
            })}
          >
            <Compass size={17} />
            Discover
          </NavLink>

          {/* Customer Links */}
          {isAuthenticated && isCustomer && (
            <>
              <NavLink
                to="/customer/reviews"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                })}
              >
                <Star size={17} />
                My Reviews
              </NavLink>
              <NavLink
                to="/customer/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                })}
              >
                <LayoutDashboard size={17} />
                Dashboard
              </NavLink>
            </>
          )}

          {/* Owner Links */}
          {isAuthenticated && isOwner && (
            <NavLink
              to="/owner/dashboard"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                textDecoration: 'none',
              })}
            >
              <Building2 size={17} />
              Owner Portal
            </NavLink>
          )}

          {/* Admin Links */}
          {isAuthenticated && isAdmin && (
            <>
              <NavLink
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                })}
              >
                <LayoutDashboard size={17} />
                Admin Panel
              </NavLink>
              <NavLink
                to="/admin/users"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                })}
              >
                <Users size={17} />
                Users
              </NavLink>
              <NavLink
                to="/admin/restaurants"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                })}
              >
                <Building2 size={17} />
                Restaurants
              </NavLink>
              <NavLink
                to="/admin/reviews"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-forest)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                })}
              >
                <MessageSquareText size={17} />
                Reviews
              </NavLink>
            </>
          )}
        </nav>

        {/* User Status / Auth Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="auth-actions"
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  lineHeight: 1.2,
                }}
              >
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {user.name}
                </span>
                <span
                  className={`badge ${
                    isAdmin
                      ? 'badge-terracotta'
                      : isOwner
                      ? 'badge-forest'
                      : 'badge-neutral'
                  }`}
                  style={{ fontSize: '0.65rem', marginTop: '2px' }}
                >
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={15} />
                <span className="btn-text">Log Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="mobile-menu"
        >
          <NavLink
            to="/restaurants"
            onClick={closeMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 500,
            }}
          >
            <Compass size={18} />
            Discover Restaurants
          </NavLink>

          {isAuthenticated && isCustomer && (
            <>
              <NavLink
                to="/customer/reviews"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 500,
                }}
              >
                <Star size={18} />
                My Reviews
              </NavLink>
              <NavLink
                to="/customer/dashboard"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 500,
                }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>
            </>
          )}

          {isAuthenticated && isOwner && (
            <NavLink
              to="/owner/dashboard"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontWeight: 500,
              }}
            >
              <Building2 size={18} />
              Owner Portal
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <NavLink
                to="/admin/dashboard"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 500,
                }}
              >
                <LayoutDashboard size={18} />
                Admin Overview
              </NavLink>
              <NavLink
                to="/admin/users"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 500,
                }}
              >
                <Users size={18} />
                Manage Users
              </NavLink>
              <NavLink
                to="/admin/restaurants"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 500,
                }}
              >
                <Building2 size={18} />
                Manage Restaurants
              </NavLink>
              <NavLink
                to="/admin/reviews"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 500,
                }}
              >
                <MessageSquareText size={18} />
                Manage Reviews
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              <LogOut size={16} />
              Log Out ({user.name})
            </button>
          )}
        </div>
      )}

      <style>{`
        .mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .btn-text { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
