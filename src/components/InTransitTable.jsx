import React from 'react';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { StatusSelect } from './StatusSelect';
import {
  isOrderOverdue,
  getOverdueSeconds,
  getTimeTakenSeconds,
  formatSeconds,
  getOrderStatusBadgeLabel,
  updateOrderStatus
} from '../lib/trackerStore';

export function InTransitTable({ orders, now, readOnly }) {
  return (
    <section className="panel-card">
      <SectionHeader title="In transit" count={orders.length} />

      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No orders in transit. Start one above.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Order</th>
                <th className="pb-2">Rider</th>
                <th className="pb-2">Time remaining</th>
                <th className="pb-2">Status</th>
                {!readOnly && <th className="pb-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const overdue = isOrderOverdue(order, now);
                const startTime = order.startedAt ?? order.createdAt;
                const remainingSec = Math.max(
                  0,
                  Math.floor((startTime + order.timerDurationSeconds * 1000 - now) / 1000)
                );
                const badgeLabel = getOrderStatusBadgeLabel(order, now);

                return (
                  <tr key={order.id} className="border-t border-border align-middle">
                    <td className="py-3 font-medium">{order.orderLabel}</td>
                    <td className="py-3 text-muted-foreground">{order.driver || '—'}</td>
                    <td className="py-3 tabular-nums">
                      {overdue ? (
                        <div className="text-[var(--danger)]">
                          <div>⚠ Overdue by {formatSeconds(getOverdueSeconds(order, now))}</div>
                          <div className="text-xs text-muted-foreground">
                            Time taken: {formatSeconds(getTimeTakenSeconds(order, now))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--ok)]">
                          {formatSeconds(remainingSec)}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <StatusBadge label={badgeLabel} />
                    </td>
                    {!readOnly && (
                      <td className="py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <StatusSelect order={order} />
                          <button
                            type="button"
                            className="btn-primary py-1.5 text-sm"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            Mark delivered
                          </button>
                        </div>
                      </td>
                    )}
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
