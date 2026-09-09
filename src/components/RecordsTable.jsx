import React from 'react';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import {
  formatTime12,
  formatSeconds,
  getTimeTakenSeconds,
  getOrderStatusBadgeLabel
} from '../lib/trackerStore';

export function RecordsTable({ orders, now }) {
  return (
    <section className="panel-card">
      <SectionHeader title="Records" count={orders.length} />

      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No records for the selected period.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Order</th>
                <th className="pb-2">Rider</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Delivered</th>
                <th className="pb-2">Time taken</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const badgeLabel = getOrderStatusBadgeLabel(order, now);
                const timeTakenSec = getTimeTakenSeconds(order, now);

                return (
                  <tr key={order.id} className="border-t border-border">
                    <td className="py-3 font-medium">{order.orderLabel}</td>
                    <td className="py-3 text-muted-foreground">{order.driver || '—'}</td>
                    <td className="py-3 text-muted-foreground tabular-nums">
                      {formatTime12(order.createdAt)}
                    </td>
                    <td className="py-3 text-muted-foreground tabular-nums">
                      {order.deliveredAt ? formatTime12(order.deliveredAt) : '—'}
                    </td>
                    <td className="py-3 tabular-nums">
                      {formatSeconds(timeTakenSec)}
                    </td>
                    <td className="py-3">
                      <StatusBadge label={badgeLabel} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
