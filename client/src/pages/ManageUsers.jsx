import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  ShieldAlert,
} from 'lucide-react';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Owner Modal
  const [createOwnerOpen, setCreateOwnerOpen] = useState(false);
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    password: '',
    restaurantId: '',
  });
  const [ownerSubmitting, setOwnerSubmitting] = useState(false);
  const [ownerError, setOwnerError] = useState('');
  const [ownerSuccess, setOwnerSuccess] = useState('');

  // Delete User Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newRole, setNewRole] = useState('CUSTOMER');
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (role) params.append('role', role);

      const [resUsers, resRestaurants] = await Promise.all([
        api.get(`/admin/users?${params.toString()}`),
        api.get('/admin/restaurants?limit=50'),
      ]);

      if (resUsers.success) {
        setUsers(resUsers.users || []);
      }
      if (resRestaurants.success) {
        setRestaurants(resRestaurants.restaurants || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Owner Creation
  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setOwnerSubmitting(true);
    setOwnerError('');
    setOwnerSuccess('');

    try {
      const res = await api.post('/admin/owners', ownerForm);
      if (res.success) {
        setOwnerSuccess('Restaurant Owner account created successfully.');
        setOwnerForm({ name: '', email: '', password: '', restaurantId: '' });
        setTimeout(() => {
          setCreateOwnerOpen(false);
          setOwnerSuccess('');
        }, 1200);
        await fetchUsers();
      }
    } catch (err) {
      setOwnerError(
        err.response?.data?.message || 'Failed to create owner account.'
      );
    } finally {
      setOwnerSubmitting(false);
    }
  };

  // Open Delete Dialog with Self-Deletion Check
  const handleOpenDelete = (targetUser) => {
    if (targetUser._id === currentUser._id) {
      alert('Security safeguard: You cannot delete your own active administrator account.');
      return;
    }
    setUserToDelete(targetUser);
    setDeleteDialogOpen(true);
  };

  // Confirm User Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await api.delete(`/admin/users/${userToDelete._id}`);
      if (res.success) {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        await fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Role Change
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;
    setRoleSubmitting(true);
    setRoleError('');

    try {
      const res = await api.patch(`/admin/users/${userToEdit._id}`, { role: newRole });
      if (res.success) {
        setRoleModalOpen(false);
        setUserToEdit(null);
        await fetchUsers();
      }
    } catch (err) {
      setRoleError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Controls: Search, Role Filter & Create Owner Button */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 320px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem', height: '2.5rem', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
              style={{ height: '2.5rem', fontSize: '0.875rem' }}
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="OWNER">Restaurant Owners</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOwnerOpen(true)}
          className="btn btn-primary"
          style={{ height: '2.5rem' }}
        >
          <UserPlus size={15} /> Create Restaurant Owner
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingState message="Loading platform users..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length > 0 ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Registered Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isCurrent = u._id === currentUser._id;
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {u.email}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'ADMIN'
                            ? 'badge-terracotta'
                            : u.role === 'OWNER'
                            ? 'badge-forest'
                            : 'badge-neutral'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setUserToEdit(u);
                            setNewRole(u.role);
                            setRoleError('');
                            setRoleModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Change user role"
                        >
                          <Edit2 size={13} /> Role
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(u)}
                          className="btn btn-danger btn-sm"
                          disabled={isCurrent}
                          title={isCurrent ? 'Cannot delete self' : 'Delete user'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)' }}>
            No users matched your query.
          </p>
        </div>
      )}

      {/* Create Owner Modal */}
      {createOwnerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                Create Restaurant Owner Account
              </h3>
              <button
                onClick={() => setCreateOwnerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {ownerError && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={16} />
                <div>{ownerError}</div>
              </div>
            )}

            {ownerSuccess && (
              <div className="alert alert-success" role="alert">
                <CheckCircle2 size={16} />
                <div>{ownerSuccess}</div>
              </div>
            )}

            <form onSubmit={handleCreateOwner}>
              <div className="form-group">
                <label className="form-label" htmlFor="owner-name">
                  Proprietor Full Name <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <input
                  id="owner-name"
                  type="text"
                  className="form-input"
                  placeholder="Chef Marco Bellini"
                  value={ownerForm.name}
                  onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="owner-email">
                  Email Address <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <input
                  id="owner-email"
                  type="email"
                  className="form-input"
                  placeholder="owner@restaurant.com"
                  value={ownerForm.email}
                  onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="owner-password">
                  Initial Password <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <input
                  id="owner-password"
                  type="password"
                  className="form-input"
                  placeholder="Owner@12345"
                  value={ownerForm.password}
                  onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                  required
                />
                <div className="form-hint">
                  Must be 8-16 chars with uppercase, lowercase, number, and special character.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="owner-restaurant">
                  Assign Restaurant (Optional)
                </label>
                <select
                  id="owner-restaurant"
                  className="form-select"
                  value={ownerForm.restaurantId}
                  onChange={(e) => setOwnerForm({ ...ownerForm, restaurantId: e.target.value })}
                >
                  <option value="">No restaurant assigned yet</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.location} • {r.cuisine})
                    </option>
                  ))}
                </select>
                <div className="form-hint">
                  You can also assign or change ownership later in the Restaurants manager.
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setCreateOwnerOpen(false)}
                  className="btn btn-secondary"
                  disabled={ownerSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={ownerSubmitting}
                >
                  {ownerSubmitting ? 'Creating Owner...' : 'Create Owner Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {roleModalOpen && userToEdit && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>
                Update Role for {userToEdit.name}
              </h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {roleError && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={15} />
                <div>{roleError}</div>
              </div>
            )}

            <form onSubmit={handleUpdateRole}>
              <div className="form-group">
                <label className="form-label" htmlFor="role-select">
                  Select Account Role
                </label>
                <select
                  id="role-select"
                  className="form-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="CUSTOMER">CUSTOMER (Diner)</option>
                  <option value="OWNER">OWNER (Restaurant Proprietor)</option>
                  <option value="ADMIN">ADMIN (Platform Administrator)</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={roleSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={roleSubmitting}
                >
                  {roleSubmitting ? 'Saving...' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})? If they are a restaurant owner or customer, associated records will be cleaned up safely.`}
        confirmText="Delete User"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageUsers;
