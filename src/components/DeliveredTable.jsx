import React from 'react';
import { SectionHeader } from './SectionHeader';
import { StatusSelect } from './StatusSelect';
import {
  formatDateWithTime,
  formatSeconds,
  getTimeTakenSeconds,
  getOverdueSeconds,
  removeOrder
} from '../lib/trackerStore';

export function DeliveredTable({ orders, now, readOnly }) {
  return (
    <section className="panel-card">
      <SectionHeader title="Delivered" count={orders.length} />

      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing delivered in this period yet.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Order</th>
                <th className="pb-2">Rider</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Delivered</th>
                <th className="pb-2">Time taken</th>
                {!readOnly && <th className="pb-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const overdueSec = getOverdueSeconds(order, now);
                const isOverdue = overdueSec > 0;
                const timeTakenSec = getTimeTakenSeconds(order, now);

                return (
                  <tr key={order.id} className="border-t border-border align-middle">
                    <td className="py-3 font-medium">{order.orderLabel}</td>
                    <td className="py-3 text-muted-foreground">{order.driver || '—'}</td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateWithTime(order.createdAt)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {order.deliveredAt ? formatDateWithTime(order.deliveredAt) : '—'}
                    </td>
                    <td className="py-3 tabular-nums">
                      <span className={isOverdue ? 'text-[var(--danger)]' : 'text-[var(--ok)]'}>
                        {formatSeconds(timeTakenSec)}
                      </span>
                      {isOverdue && (
                        <div className="text-xs text-[var(--warn)]">
                          Overdue by {formatSeconds(overdueSec)}
                        </div>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <StatusSelect order={order} />
                          <button
                            type="button"
                            className="btn-ghost py-1.5 text-sm text-[var(--danger)]"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Remove ${order.orderLabel} from the active list? It stays in Records.`
                                )
                              ) {
                                removeOrder(order.id);
                              }
                            }}
                          >
                            Remove
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
