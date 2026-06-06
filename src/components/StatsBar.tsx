'use client';

interface StatsBarProps {
  stats: {
    total: number;
    sent?: number;
    failed?: number;
    pending?: number;
    accepted?: number;
    declined?: number;
  };
  searchAreas?: string[];
  phase: 'search' | 'tracking';
}

export default function StatsBar({ stats, searchAreas, phase }: StatsBarProps) {
  if (phase === 'search') {
    return (
      <div className="stats-bar" id="stats-bar">
        <div className="stat-card stat-primary">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Donors Found</div>
        </div>
        {searchAreas && (
          <div className="stat-card stat-info">
            <div className="stat-number">{searchAreas.length}</div>
            <div className="stat-label">Areas Covered</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stats-bar stats-tracking" id="stats-bar-tracking">
      <div className="stat-card stat-sent">
        <div className="stat-number">{stats.sent ?? 0}</div>
        <div className="stat-label">Sent</div>
        <div className="stat-icon">📤</div>
      </div>
      <div className="stat-card stat-pending">
        <div className="stat-number">{stats.pending ?? 0}</div>
        <div className="stat-label">Pending</div>
        <div className="stat-icon">⏳</div>
      </div>
      <div className="stat-card stat-accepted">
        <div className="stat-number">{stats.accepted ?? 0}</div>
        <div className="stat-label">Accepted</div>
        <div className="stat-icon">✅</div>
      </div>
      <div className="stat-card stat-declined">
        <div className="stat-number">{stats.declined ?? 0}</div>
        <div className="stat-label">Declined</div>
        <div className="stat-icon">❌</div>
      </div>
    </div>
  );
}
