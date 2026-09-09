import React from 'react';
import { updateOrderStatus } from '../lib/trackerStore';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' }
];

export function StatusSelect({ order }) {
  return (
    <select
      aria-label={`Status for ${order.orderLabel}`}
      className="field w-auto py-1.5 text-sm"
      value={order.status}
      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
