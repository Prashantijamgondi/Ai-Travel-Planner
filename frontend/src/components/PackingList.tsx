'use client';

import { useState } from 'react';
import { Trip, PackingItem } from '../types';
import { apiFetch } from '../utils/api';

const CATEGORY_ICONS: Record<string, string> = {
  Documents: '📄',
  Clothing: '👕',
  Apparel: '👗',
  Footwear: '👟',
  Gear: '🎒',
  Electronics: '🔌',
  Essentials: '🧴',
  'Health & Personal Care': '💊',
  Other: '📦',
};

export default function PackingList({ trip, onUpdate }: {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
}) {
  const [regenLoading, setRegenLoading] = useState(false);

  const onToggle = async (itemId: string) => {
    const updated = trip.packingList.map((i) =>
      i._id === itemId ? { ...i, isPacked: !i.isPacked } : i
    );
    const data = await apiFetch(`/api/trips/${trip._id}`, {
      method: 'PUT',
      body: JSON.stringify({ packingList: updated }),
    });
    onUpdate(data);
  };

  const handleRegen = async () => {
    setRegenLoading(true);
    try {
      const data = await apiFetch(`/api/trips/${trip._id}/generate-packing`, { method: 'POST' });
      onUpdate(data);
    } finally {
      setRegenLoading(false);
    }
  };

  const grouped = (trip.packingList || []).reduce<Record<string, PackingItem[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const total = trip.packingList?.length ?? 0;
  const packed = trip.packingList?.filter((i) => i.isPacked).length ?? 0;
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Packing List</h2>
          <p className="text-xs text-muted mt-1">Weather-aware, tailored to your destination.</p>
        </div>
        <button
          onClick={handleRegen}
          disabled={regenLoading}
          className="btn btn-secondary btn-icon shrink-0"
        >
          {regenLoading ? <><span className="spinner" /> Regenerating...</> : '🔄 Regenerate'}
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted">{packed} of {total} items packed</span>
            <span className={`font-semibold ${pct === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>{pct}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : undefined }}
            />
          </div>
        </div>
      )}

      {total > 0 ? (
        <div className="space-y-5">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{CATEGORY_ICONS[category] ?? '📦'}</span>
                <span className="text-xs font-semibold text-muted uppercase tracking-widest">{category}</span>
                <span className="text-xs text-subtle">({items.filter((i) => i.isPacked).length}/{items.length})</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => item._id && onToggle(item._id)}
                    className={`pack-item ${item.isPacked ? 'packed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isPacked}
                      readOnly
                      className="pack-checkbox mt-0.5 shrink-0"
                    />
                    <span className={`text-sm font-medium transition-all ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {item.item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-2">
          <div className="text-3xl">🎒</div>
          <p className="text-sm text-muted">No packing list yet.</p>
          <button onClick={handleRegen} disabled={regenLoading} className="btn btn-primary btn-icon mx-auto mt-2">
            {regenLoading ? <><span className="spinner" /> Generating...</> : '✨ Generate Packing List'}
          </button>
        </div>
      )}
    </div>
  );
}