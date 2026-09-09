import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutSession } from '../lib/auth';
import {
  useTrackerStore,
  useLiveNowTicker,
  formatHeaderDateTime,
  formatYMD,
  formatDateFull,
  parseStartOfDay,
  parseEndOfDay,
  isOrderOverdue
} from '../lib/trackerStore';
import { NewOrderForm } from './NewOrderForm';
import { InTransitTable } from './InTransitTable';
import { DeliveredTable } from './DeliveredTable';
import { RecordsTable } from './RecordsTable';

export function Dashboard({ readOnly = false }) {
  const navigate = useNavigate();
  const now = useLiveNowTicker(1000);
  const { orders, riders } = useTrackerStore();

  const todayStr = useMemo(() => formatYMD(Date.now()), []);
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  const rangeOrders = useMemo(() => {
    const startMs = parseStartOfDay(fromDate);
    const endMs = parseEndOfDay(toDate);
    return orders.filter((o) => o.createdAt >= startMs && o.createdAt <= endMs);
  }, [orders, fromDate, toDate]);

  const activeOrders = useMemo(() => rangeOrders.filter((o) => !o.removed), [rangeOrders]);
  const inTransitOrders = useMemo(() => activeOrders.filter((o) => o.status === 'in_transit'), [activeOrders]);
  const deliveredOrders = useMemo(() => activeOrders.filter((o) => o.status === 'delivered'), [activeOrders]);
  const failedOrders = useMemo(() => activeOrders.filter((o) => o.status === 'failed'), [activeOrders]);
  const overdueOrders = useMemo(() => inTransitOrders.filter((o) => isOrderOverdue(o, now)), [inTransitOrders, now]);

  const stats = [
    { label: 'Total orders', value: rangeOrders.filter((o) => o.startedAt).length },
    { label: 'Total delivered', value: deliveredOrders.length },
    { label: 'Total in transit', value: inTransitOrders.length },
    { label: 'Total failed', value: failedOrders.length },
    { label: 'Total overdue', value: overdueOrders.length, danger: true }
  ];

  function handleLogout() {
    logoutSession();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Delivery tracker</h1>
            <p className="text-xs text-muted-foreground">
              {readOnly ? 'Viewer screen — read only' : 'Operator screen'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatHeaderDateTime(now)}
            </span>
            {!readOnly && (
              <Link to="/viewer" className="btn-ghost text-sm">
                Open viewer screen
              </Link>
            )}
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6">
        {/* Date filter section */}
        <section className="panel-card flex flex-wrap items-end gap-4">
          <div>
            <label className="field-label" htmlFor="from-date">
              From
            </label>
            <input
              id="from-date"
              type="date"
              className="field"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="to-date">
              To
            </label>
            <input
              id="to-date"
              type="date"
              className="field"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setFromDate(todayStr);
              setToDate(todayStr);
            }}
          >
            Today
          </button>

          <p className="text-sm text-muted-foreground">
            {fromDate === toDate
              ? formatDateFull(parseStartOfDay(fromDate))
              : `${formatDateFull(parseStartOfDay(fromDate))} → ${formatDateFull(parseStartOfDay(toDate))}`}
          </p>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="panel-card">
              <p
                className={`text-3xl font-semibold tabular-nums ${
                  item.danger ? 'text-[var(--danger)]' : ''
                }`}
              >
                {item.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        {/* New Order Form (Operator only) */}
        {!readOnly && <NewOrderForm orders={orders} riders={riders} />}

        {/* Tables */}
        <InTransitTable orders={inTransitOrders} now={now} readOnly={readOnly} />
        <DeliveredTable orders={deliveredOrders} now={now} readOnly={readOnly} />
        <RecordsTable orders={rangeOrders} now={now} />
      </main>
    </div>
  );
}
