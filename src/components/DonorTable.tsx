'use client';

import StatusBadge from './StatusBadge';
import type { Donor, DonorStatus } from '@/lib/types';

interface DonorTableSearchProps {
  mode: 'search';
  donors: Donor[];
}

interface DonorTableTrackingProps {
  mode: 'tracking';
  donors: DonorStatus[];
}

type DonorTableProps = DonorTableSearchProps | DonorTableTrackingProps;

export default function DonorTable(props: DonorTableProps) {
  if (props.donors.length === 0) {
    return (
      <div className="empty-state" id="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>No Donors Found</h3>
        <p>
          No eligible, compatible donors were found in the selected area and its
          neighbors. Try a different blood group or location.
        </p>
      </div>
    );
  }

  if (props.mode === 'search') {
    return (
      <div className="table-container" id="donor-table-search">
        <table className="donor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Blood Group</th>
              <th>Location</th>
              <th>Weight</th>
              <th>Last Donation</th>
            </tr>
          </thead>
          <tbody>
            {props.donors.map((donor, i) => (
              <tr
                key={donor.donorId}
                className="table-row"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <td className="cell-id">{donor.donorId}</td>
                <td className="cell-name">{donor.fullName}</td>
                <td className="cell-phone">
                  0{donor.phone.slice(0, 3)}-{donor.phone.slice(3)}
                </td>
                <td>
                  <span className="blood-badge">{donor.bloodGroup}</span>
                </td>
                <td className="cell-location">
                  <span className="location-pin">📍</span>
                  {donor.location}
                </td>
                <td>{donor.weight} kg</td>
                <td className="cell-date">
                  {donor.lastDonationDate
                    ? new Date(donor.lastDonationDate).toLocaleDateString(
                        'en-PK',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Tracking mode
  return (
    <div className="table-container" id="donor-table-tracking">
      <table className="donor-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Blood Group</th>
            <th>Location</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {props.donors.map((donor, i) => (
            <tr
              key={donor.donorId}
              className={`table-row ${
                donor.reply === 'yes'
                  ? 'row-accepted'
                  : donor.reply === 'no'
                  ? 'row-declined'
                  : ''
              }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <td className="cell-id">{donor.donorId}</td>
              <td className="cell-name">{donor.name}</td>
              <td>
                <span className="blood-badge">{donor.bloodGroup}</span>
              </td>
              <td className="cell-location">
                <span className="location-pin">📍</span>
                {donor.location}
              </td>
              <td className="cell-phone">
                0{donor.phone.slice(0, 3)}-{donor.phone.slice(3)}
              </td>
              <td>
                <StatusBadge
                  status={donor.reply}
                  whatsappStatus={donor.whatsappStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
