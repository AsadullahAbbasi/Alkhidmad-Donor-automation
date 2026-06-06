'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import DonorTable from '@/components/DonorTable';
import StatsBar from '@/components/StatsBar';
import type { Donor, DonorStatus, BloodGroup, KarachiArea, RequestSession } from '@/lib/types';

type DashboardPhase = 'search' | 'results' | 'tracking';

export default function DashboardPage() {
  const [phase, setPhase] = useState<DashboardPhase>('search');
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  
  // Search data
  const [matchedDonors, setMatchedDonors] = useState<Donor[]>([]);
  const [searchContext, setSearchContext] = useState<{ bloodGroup: string; location: string } | null>(null);
  const [searchAreas, setSearchAreas] = useState<string[]>([]);
  
  // Tracking data
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<RequestSession | null>(null);
  const [stats, setStats] = useState<any>(null);

  // ─── Initialize WhatsApp ───────────────────────────────────
  useEffect(() => {
    // Ping the init endpoint to ensure WhatsApp is running and QR is shown if needed
    fetch('/api/init-whatsapp')
      .then(res => res.json())
      .then(data => console.log('[System] WhatsApp Connection:', data.message))
      .catch(err => console.error('[System] WhatsApp Init Error:', err));
  }, []);

  // ─── Search ──────────────────────────────────────────────────
  const handleSearch = async (bloodGroup: BloodGroup, location: KarachiArea) => {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodGroup, location }),
      });
      const data = await res.json();
      
      if (data.donors) {
        setMatchedDonors(data.donors);
        setSearchAreas(data.searchAreas);
        setSearchContext({ bloodGroup, location });
        setPhase('results');
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Notify ──────────────────────────────────────────────────
  const handleNotify = async () => {
    if (!searchContext || matchedDonors.length === 0) return;
    
    setNotifying(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup: searchContext.bloodGroup,
          location: searchContext.location,
          donors: matchedDonors.slice(0, 2), // Limit to 2 donors to avoid mass messaging during testing
        }),
      });
      const data = await res.json();
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setPhase('tracking');
      }
    } catch (err) {
      console.error('Notification failed:', err);
    } finally {
      setNotifying(false);
    }
  };

  // ─── Polling ──────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const res = await fetch(`/api/status?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Status fetch failed:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    if (phase !== 'tracking' || !sessionId) return;
    
    // Initial fetch
    fetchStatus();
    
    // Poll every 3 seconds
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [phase, sessionId, fetchStatus]);

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="section-enter space-y-8">
      {/* Search Header (Hidden in tracking) */}
      {phase !== 'tracking' && (
        <SearchForm onSearch={handleSearch} loading={loading} />
      )}

      {/* Results View */}
      {phase === 'results' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="action-bar">
            <div className="action-bar-left">
              <button 
                onClick={() => setPhase('search')}
                className="btn-back"
              >
                ← New Search
              </button>
              <div className="action-info">
                <h2 className="action-title">Matching Donors Found</h2>
                <p className="action-subtitle">
                  {matchedDonors.length} donors are eligible and compatible for {searchContext?.bloodGroup} at {searchContext?.location}
                </p>
              </div>
            </div>
            <div className="action-bar-right">
              <button 
                onClick={handleNotify}
                disabled={notifying}
                className="btn-notify"
              >
                {notifying ? (
                  <span className="loading-spinner">
                    <svg className="spinner-icon" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                    </svg>
                    Sending Alerts...
                  </span>
                ) : (
                  <>
                    <span>📱</span>
                    Notify All via WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>

          <StatsBar 
            phase="search" 
            stats={{ total: matchedDonors.length }} 
            searchAreas={searchAreas} 
          />
          
          <DonorTable mode="search" donors={matchedDonors} />
        </div>
      )}

      {/* Tracking View */}
      {phase === 'tracking' && (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="action-bar">
            <div className="action-bar-left">
              <button 
                onClick={() => {
                  setPhase('search');
                  setSessionId(null);
                  setSession(null);
                }}
                className="btn-back"
              >
                ← Back to Search
              </button>
              <div className="action-info">
                <h2 className="action-title">Live Response Tracking</h2>
                <p className="action-subtitle">
                  Monitoring replies for {searchContext?.bloodGroup} request in {searchContext?.location}
                </p>
              </div>
            </div>
            <div className="action-bar-right">
              <div className="live-indicator">
                <span className="live-dot" />
                Live: Auto-refreshing every 3s
              </div>
            </div>
          </div>

          {stats && <StatsBar phase="tracking" stats={stats} />}
          
          <DonorTable 
            mode="tracking" 
            donors={session?.donors || []} 
          />
        </div>
      )}
    </div>
  );
}
