'use client';

import { useState } from 'react';
import { Trip } from '../types';
import { apiFetch } from '../utils/api';

const TIME_ICONS: Record<string, string> = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌙',
};

interface Props {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
  onDelete: (id: string) => void;
}

export default function ItineraryCard({ trip, onUpdate, onDelete }: Props) {
  const [addModal, setAddModal] = useState<{ dayNumber: number } | null>(null);
  const [regenModal, setRegenModal] = useState<{ dayNumber: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', description: '', estimatedCostUSD: 0, timeOfDay: 'Morning' });
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAddActivity = async () => {
    if (!addModal || !newActivity.title) return;
    setActionLoading('add');
    try {
      const data = await apiFetch(`/api/trips/${trip._id}/add-activity`, {
        method: 'POST',
        body: JSON.stringify({ dayNumber: addModal.dayNumber, activity: newActivity }),
      });
      onUpdate(data);
      setAddModal(null);
      setNewActivity({ title: '', description: '', estimatedCostUSD: 0, timeOfDay: 'Morning' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerate = async () => {
    if (!regenModal || !feedback) return;
    setActionLoading('regen');
    try {
      const data = await apiFetch(`/api/trips/${trip._id}/regenerate-day`, {
        method: 'POST',
        body: JSON.stringify({ dayNumber: regenModal.dayNumber, feedback }),
      });
      onUpdate(data);
      setRegenModal(null);
      setFeedback('');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await apiFetch(`/api/trips/${trip._id}`, { method: 'DELETE' });
      onDelete(trip._id);
    } finally {
      setActionLoading(null);
      setDeleteConfirm(false);
    }
  };

  const budgetItems = [
    { label: 'Transport', value: trip.estimatedBudget?.transport, icon: '✈️' },
    { label: 'Stay', value: trip.estimatedBudget?.accommodation, icon: '🏨' },
    { label: 'Food', value: trip.estimatedBudget?.food, icon: '🍽️' },
    { label: 'Activities', value: trip.estimatedBudget?.activities, icon: '🎭' },
  ];

  return (
    <>
      <div className="glass-card p-6 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{trip.destination}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge badge-indigo">{trip.durationDays} Days</span>
              <span className="badge badge-cyan">{trip.budgetTier} Budget</span>
              {trip.travelMonth && <span className="badge badge-green">{trip.travelMonth}</span>}
              {trip.status === 'edited' && <span className="badge badge-amber">Edited</span>}
            </div>
          </div>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="btn btn-danger btn-icon shrink-0"
            title="Delete trip"
          >
            🗑 Delete
          </button>
        </div>

        <hr className="divider" />

        {/* Budget Breakdown */}
        {trip.estimatedBudget && (
          <div className="budget-grid">
            {budgetItems.map((b) => (
              <div key={b.label} className="budget-cell">
                <span className="budget-icon">{b.icon}</span>
                <div>
                  <div className="budget-label">{b.label}</div>
                  <div className="budget-value">${b.value?.toLocaleString() ?? 0}</div>
                </div>
              </div>
            ))}
            <div className="budget-cell budget-cell--total">
              <span className="budget-icon">💰</span>
              <div>
                <div className="budget-label">Total Est.</div>
                <div className="budget-value budget-value--total">${trip.estimatedBudget.total?.toLocaleString() ?? 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Hotels */}
        {trip.hotels && trip.hotels.length > 0 && (
          <div>
            <p className="form-label mb-3">Recommended Hotels</p>
            <div className="space-y-2">
              {trip.hotels.map((h, i) => (
                <div key={h._id || i} className="hotel-card">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏨</span>
                    <div>
                      <div className="font-semibold text-slate-100 text-sm">{h.name}</div>
                      <div className="text-xs text-muted">{h.tier} · {h.rating} · ~${h.estimatedCostNightUSD}/night</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="divider" />

        {/* Itinerary Days */}
        <div className="space-y-5">
          {trip.itinerary.map((day) => (
            <div key={day.dayNumber} className="glass-card--subtle p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold text-gradient">Day {day.dayNumber}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewActivity({ title: '', description: '', estimatedCostUSD: 0, timeOfDay: 'Morning' });
                      setAddModal({ dayNumber: day.dayNumber });
                    }}
                    className="btn btn-secondary btn-icon"
                  >
                    + Add Stop
                  </button>
                  <button
                    onClick={() => { setFeedback(''); setRegenModal({ dayNumber: day.dayNumber }); }}
                    className="btn btn-primary btn-icon"
                  >
                    ⚡ Customize
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {day.activities && day.activities.length > 0 ? (
                  day.activities.map((a) => (
                    <div key={a._id} className="activity-card flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-100">{a.title}</span>
                          {a.estimatedCostUSD !== undefined && a.estimatedCostUSD > 0 && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                              ${a.estimatedCostUSD}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted font-light leading-relaxed">{a.description}</p>
                      </div>
                      {a.timeOfDay && (
                        <span className="time-badge">
                          {TIME_ICONS[a.timeOfDay] || ''} {a.timeOfDay}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-subtle py-4">No plans added yet for this day.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Activity Modal */}
      {addModal && (
        <div className="modal-backdrop" onClick={() => setAddModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add Activity — Day {addModal.dayNumber}</h3>
            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="e.g. Visit local market" value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Brief description..." value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Est. Cost (USD)</label>
                  <input type="number" min={0} className="form-input" value={newActivity.estimatedCostUSD}
                    onChange={(e) => setNewActivity({ ...newActivity, estimatedCostUSD: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time of Day</label>
                  <select className="form-input" value={newActivity.timeOfDay}
                    onChange={(e) => setNewActivity({ ...newActivity, timeOfDay: e.target.value })}>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setAddModal(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleAddActivity} disabled={!newActivity.title || actionLoading === 'add'}
                className="btn btn-primary flex-1">
                {actionLoading === 'add' ? <><span className="spinner" /> Adding...</> : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Day Modal */}
      {regenModal && (
        <div className="modal-backdrop" onClick={() => setRegenModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Customize Day {regenModal.dayNumber}</h3>
            <p className="text-sm text-muted mb-4">Tell the AI what you'd like to change.</p>
            <div className="form-group">
              <label className="form-label">Your Feedback</label>
              <textarea
                rows={4}
                className="form-input resize-none"
                placeholder="e.g. More outdoor activities, avoid crowded tourist spots, add a local food experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRegenModal(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleRegenerate} disabled={!feedback || actionLoading === 'regen'}
                className="btn btn-primary flex-1">
                {actionLoading === 'regen' ? <><span className="spinner" /> Regenerating...</> : '⚡ Regenerate Day'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Trip?</h3>
            <p className="text-sm text-muted mb-6">
              Are you sure you want to delete your <span className="text-slate-200 font-medium">{trip.destination}</span> trip?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="btn btn-danger flex-1">
                {actionLoading === 'delete' ? <><span className="spinner" /> Deleting...</> : '🗑 Delete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}