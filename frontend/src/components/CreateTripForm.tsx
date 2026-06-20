'use client';

import { useState } from 'react';
import { apiFetch } from '../utils/api';

const INTEREST_OPTIONS = [
  'Food & Dining', 'Museums', 'Beaches', 'Hiking', 'Shopping',
  'Nightlife', 'History', 'Art', 'Adventure', 'Wellness',
];

export default function CreateTripForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    destination: '',
    durationDays: 3,
    budgetTier: 'Medium',
    travelMonth: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : [...prev, tag]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/trips/generate', {
        method: 'POST',
        body: JSON.stringify({
          destination: form.destination,
          durationDays: Number(form.durationDays),
          budgetTier: form.budgetTier,
          interests: selectedInterests,
          travelMonth: form.travelMonth,
        }),
      });

      onCreated();
      setForm({ destination: '', durationDays: 3, budgetTier: 'Medium', travelMonth: '' });
      setSelectedInterests([]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-5 m-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Plan a New Trip</h2>
        <p className="text-xs text-muted mt-1">Let AI generate your perfect itinerary.</p>
      </div>

      {error && (
        <div className="alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Destination</label>
        <input
          required
          className="form-input"
          placeholder="e.g. Tokyo, Japan"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="form-label">Duration (days)</label>
          <input
            type="number"
            min={1}
            max={30}
            required
            className="form-input"
            value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Budget Tier</label>
          <select
            className="form-input"
            value={form.budgetTier}
            onChange={(e) => setForm({ ...form, budgetTier: e.target.value })}
          >
            <option value="Low">🪙 Low</option>
            <option value="Medium">💳 Medium</option>
            <option value="High">💎 High</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Travel Month</label>
        <input
          className="form-input"
          placeholder="e.g. December, Summer"
          value={form.travelMonth}
          onChange={(e) => setForm({ ...form, travelMonth: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Interests</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {INTEREST_OPTIONS.map((tag) => {
            const active = selectedInterests.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleInterest(tag)}
                className={`interest-tag ${active ? 'active' : ''}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !form.destination}
        className="btn btn-primary btn-block"
      >
        {loading ? (
          <>
            <span className="spinner" />
            Generating Itinerary...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Generate Itinerary
          </>
        )}
      </button>
    </form>
  );
}