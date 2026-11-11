import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Building2,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  MapPin,
  Utensils,
} from 'lucide-react';

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    cuisine: '',
    address: '',
    description: '',
    owner: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRestaurantsAndOwners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', 50);

      const [resRestaurants, resUsers] = await Promise.all([
        api.get(`/admin/restaurants?${params.toString()}`),
        api.get('/admin/users?role=OWNER&limit=50'),
      ]);

      if (resRestaurants.success) {
        setRestaurants(resRestaurants.restaurants || []);
      }
      if (resUsers.success) {
        setOwners(resUsers.users || []);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setError('Unable to load restaurants.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRestaurantsAndOwners();
  }, [fetchRestaurantsAndOwners]);

  // Open modal for New or Edit
  const handleOpenModal = (r = null) => {
    setFormError('');
    setFormSuccess('');
    if (r) {
      setEditingRestaurant(r);
      setForm({
        name: r.name || '',
        location: r.location || '',
        cuisine: r.cuisine || '',
        address: r.address || '',
        description: r.description || '',
        owner: r.owner?._id || r.owner || '',
      });
    } else {
      setEditingRestaurant(null);
      setForm({
        name: '',
        location: '',
        cuisine: '',
        address: '',
        description: '',
        owner: '',
      });
    }
    setModalOpen(true);
  };

  // Submit Restaurant Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        ...form,
        owner: form.owner ? form.owner : null,
      };

      let res;
      if (editingRestaurant) {
        res = await api.patch(`/admin/restaurants/${editingRestaurant._id}`, payload);
      } else {
        res = await api.post('/admin/restaurants', payload);
      }

      if (res.success) {
        setFormSuccess(
          editingRestaurant
            ? 'Restaurant details updated successfully.'
            : 'Restaurant added successfully.'
        );
        setTimeout(() => {
          setModalOpen(false);
          setFormSuccess('');
        }, 1200);
        await fetchRestaurantsAndOwners();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to save restaurant details.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (r) => {
    setRestaurantToDelete(r);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!restaurantToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await api.delete(`/admin/restaurants/${restaurantToDelete._id}`);
      if (res.success) {
        setDeleteDialogOpen(false);
        setRestaurantToDelete(null);
        await fetchRestaurantsAndOwners();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete restaurant.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Search and Add Restaurant Header */}
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
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
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
            placeholder="Search restaurants by name, location or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem', height: '2.5rem', fontSize: '0.875rem' }}
          />
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal(null)}
          className="btn btn-primary"
          style={{ height: '2.5rem' }}
        >
          <PlusCircle size={15} /> Add New Restaurant
        </button>
      </div>

      {/* Restaurant Table */}
      {loading ? (
        <LoadingState message="Loading restaurants directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRestaurantsAndOwners} />
      ) : restaurants.length > 0 ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Restaurant Name</th>
                <th>Location & Cuisine</th>
                <th>Assigned Owner</th>
                <th>Average Rating</th>
                <th>Reviews</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => {
                const hasRating = r.averageRating !== null && r.averageRating !== undefined && r.totalReviews > 0;
                return (
                  <tr key={r._id}>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{r.name}</strong>
                      {r.address && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.address}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-forest">{r.cuisine}</span>
                        <span className="badge badge-neutral">{r.location}</span>
                      </div>
                    </td>
                    <td>
                      {r.owner ? (
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {r.owner.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {r.owner.email}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      {hasRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontWeight: 700 }}>{r.averageRating.toFixed(1)}</span>
                          <RatingStars rating={Math.round(r.averageRating)} size={13} />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No ratings
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.totalReviews || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(r)}
                          className="btn btn-secondary btn-sm"
                          title="Edit restaurant"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(r)}
                          className="btn btn-danger btn-sm"
                          title="Delete restaurant"
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
            No restaurants found matching your query.
          </p>
        </div>
      )}

      {/* Add / Edit Restaurant Modal */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                {editingRestaurant ? `Edit ${editingRestaurant.name}` : 'Add New Restaurant'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={16} />
                <div>{formError}</div>
              </div>
            )}

            {formSuccess && (
              <div className="alert alert-success" role="alert">
                <CheckCircle2 size={16} />
                <div>{formSuccess}</div>
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label className="form-label" htmlFor="rest-name">
                  Restaurant Name <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <input
                  id="rest-name"
                  type="text"
                  className="form-input"
                  placeholder="Spice Symphony"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="rest-location">
                    City / Location <span style={{ color: 'var(--status-danger)' }}>*</span>
                  </label>
                  <input
                    id="rest-location"
                    type="text"
                    className="form-input"
                    placeholder="Hyderabad"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rest-cuisine">
                    Cuisine <span style={{ color: 'var(--status-danger)' }}>*</span>
                  </label>
                  <input
                    id="rest-cuisine"
                    type="text"
                    className="form-input"
                    placeholder="Indian, Italian, etc."
                    value={form.cuisine}
                    onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rest-address">
                  Street Address
                </label>
                <input
                  id="rest-address"
                  type="text"
                  className="form-input"
                  placeholder="Road No. 36, Jubilee Hills"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rest-desc">
                  Description
                </label>
                <textarea
                  id="rest-desc"
                  className="form-textarea"
                  rows={3}
                  placeholder="Atmosphere, chef specials, heritage..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rest-owner">
                  Assign Restaurant Owner (Proprietor)
                </label>
                <select
                  id="rest-owner"
                  className="form-select"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                >
                  <option value="">No owner assigned</option>
                  {owners.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
                <div className="form-hint">
                  Only accounts with OWNER role are listed here. You can create owner accounts in the Users section.
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
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingRestaurant
                    ? 'Save Changes'
                    : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Restaurant"
        message={`Are you sure you want to permanently delete "${restaurantToDelete?.name}"? All associated reviews for this restaurant will also be deleted to maintain database referential integrity.`}
        confirmText="Delete Restaurant"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setRestaurantToDelete(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageRestaurants;
