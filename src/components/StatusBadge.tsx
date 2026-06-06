'use client';

interface StatusBadgeProps {
  status: 'pending' | 'yes' | 'no';
  whatsappStatus?: 'pending' | 'sent' | 'failed';
}

export default function StatusBadge({
  status,
  whatsappStatus,
}: StatusBadgeProps) {
  if (whatsappStatus === 'failed') {
    return (
      <span className="badge badge-failed" id={`badge-failed`}>
        <span className="badge-dot" />
        Send Failed
      </span>
    );
  }

  if (whatsappStatus === 'pending') {
    return (
      <span className="badge badge-sending">
        <svg className="spinner-icon badge-spinner" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="30 70"
          />
        </svg>
        Sending...
      </span>
    );
  }

  switch (status) {
    case 'yes':
      return (
        <span className="badge badge-yes">
          <span className="badge-dot" />
          Accepted
        </span>
      );
    case 'no':
      return (
        <span className="badge badge-no">
          <span className="badge-dot" />
          Declined
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="badge badge-pending">
          <span className="badge-dot pulse" />
          Pending
        </span>
      );
  }
}
