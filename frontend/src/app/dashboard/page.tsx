'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateTripForm from '../../components/CreateTripForm';
import ItineraryCard from '../../components/ItineraryCard';
import PackingList from '../../components/PackingList';
import { apiFetch } from '../../utils/api';
import { Trip } from '../../types';

type MobileTab = 'plan' | 'trips' | 'itinerary' | 'packing';

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('plan');

  const loadTrips = async () => {
    try {
      const data = await apiFetch('/api/trips');
      setTrips(data);
      if (!selectedTrip) {
        setSelectedTrip(data[0] || null);
        if (data[0]) setMobileTab('itinerary');
      } else {
        const refreshed = data.find((t: Trip) => t._id === selectedTrip._id);
        setSelectedTrip(refreshed || data[0] || null);
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTripUpdate = (updated: Trip) => {
    setSelectedTrip(updated);
    setTrips((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const handleTripDelete = (id: string) => {
    const remaining = trips.filter((t) => t._id !== id);
    setTrips(remaining);
    if (selectedTrip?._id === id) {
      setSelectedTrip(remaining[0] || null);
      setMobileTab(remaining[0] ? 'itinerary' : 'plan');
    }
  };

  const handleCreated = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/trips');
      setTrips(data);
      setSelectedTrip(data[0] || null);
      setMobileTab('itinerary');
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="loading-orb" />
          <p className="text-muted text-sm font-medium animate-pulse">Loading your workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="dashboard-container animate-fade-in">

        {/* Header */}
        <header className="dash-header">
          <div className="flex items-center gap-3">
            <div className="header-logo">✈️</div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-tight">
                AI Travel <span className="text-gradient">Planner</span>
              </h1>
              <p className="text-[10px] text-muted hidden sm:block">AI-powered trip workspace</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-icon !rounded-xl">
            Sign Out
          </button>
        </header>

        {/* Mobile Tab Bar */}
        <div className="mobile-tabs lg:hidden">
          <button
            className={`mobile-tab ${mobileTab === 'plan' ? 'active' : ''}`}
            onClick={() => setMobileTab('plan')}
          >
            ✨ Plan
          </button>
          <button
            className={`mobile-tab ${mobileTab === 'trips' ? 'active' : ''}`}
            onClick={() => setMobileTab('trips')}
          >
            🗺️ Trips
            {trips.length > 0 && <span className="tab-badge">{trips.length}</span>}
          </button>
          <button
            className={`mobile-tab ${mobileTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setMobileTab('itinerary')}
            disabled={!selectedTrip}
          >
            📅 Itinerary
          </button>
          <button
            className={`mobile-tab ${mobileTab === 'packing' ? 'active' : ''}`}
            onClick={() => setMobileTab('packing')}
            disabled={!selectedTrip}
          >
            🎒 Packing
          </button>
        </div>

        {/* Desktop layout / Mobile tab content */}
        <div className="dash-grid">

          {/* Sidebar — always visible on desktop, hidden on mobile unless active tab */}
          <div className={`dash-sidebar ${(mobileTab === 'plan' || mobileTab === 'trips') ? 'mobile-visible' : 'mobile-hidden'}`}>

            {/* Plan form — show on "Plan" tab on mobile */}
            <div className={mobileTab === 'trips' ? 'mobile-hidden lg:block' : ''}>
              <CreateTripForm onCreated={handleCreated} />
            </div>

            {/* Trip Switcher — show on "Trips" tab on mobile */}
            <div className={`glass-card p-5 space-y-4 ${mobileTab === 'plan' ? 'mobile-hidden lg:block' : ''}`}>
              <div>
                <h2 className="font-bold tracking-tight">Your Trips</h2>
                <p className="text-[11px] text-muted mt-0.5">{trips.length} trip{trips.length !== 1 ? 's' : ''} saved</p>
              </div>

              <div className="space-y-2">
                {trips.length > 0 ? (
                  trips.map((trip) => (
                    <button
                      key={trip._id}
                      onClick={() => {
                        setSelectedTrip(trip);
                        setMobileTab('itinerary');
                      }}
                      className={`trip-item ${selectedTrip?._id === trip._id ? 'active' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-200 text-sm">{trip.destination}</div>
                          <div className="text-[11px] text-muted mt-0.5">
                            {trip.durationDays}d · {trip.budgetTier}
                            {trip.travelMonth ? ` · ${trip.travelMonth}` : ''}
                          </div>
                        </div>
                        <span className="text-xs text-subtle shrink-0">
                          {trip.estimatedBudget?.total ? `$${trip.estimatedBudget.total.toLocaleString()}` : ''}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="text-3xl">🗺️</div>
                    <p className="text-sm text-subtle">No trips yet. Create one above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`dash-main ${(mobileTab === 'itinerary' || mobileTab === 'packing') ? 'mobile-visible' : 'mobile-hidden'}`}>
            {selectedTrip ? (
              <>
                <div className={mobileTab === 'packing' ? 'mobile-hidden lg:block' : ''}>
                  <ItineraryCard
                    trip={selectedTrip}
                    onUpdate={handleTripUpdate}
                    onDelete={handleTripDelete}
                  />
                </div>
                <div className={mobileTab === 'itinerary' ? 'mobile-hidden lg:block' : ''}>
                  <PackingList
                    trip={selectedTrip}
                    onUpdate={handleTripUpdate}
                  />
                </div>
              </>
            ) : (
              <div className="glass-card p-10 text-center space-y-4">
                <div className="text-5xl">🌍</div>
                <h3 className="text-xl font-bold">No trip selected</h3>
                <p className="text-sm text-subtle max-w-sm mx-auto">
                  Use the Plan tab to generate your first AI-powered itinerary.
                </p>
                <button
                  onClick={() => setMobileTab('plan')}
                  className="btn btn-primary btn-icon mx-auto"
                >
                  ✨ Plan a Trip
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}