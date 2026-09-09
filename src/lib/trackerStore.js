import { useSyncExternalStore, useState, useEffect } from 'react';

const STATE_KEY = 'delivery-tracker-state-v1';
const SYNC_CHANNEL = 'delivery-tracker-sync';

export const DEFAULT_RIDERS = ['Yowas', 'Onesphore', 'Paul', 'Fred', 'Uzziah', 'Valens'];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(num) {
  return String(num).padStart(2, '0');
}

export function formatTime12(timestamp) {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes();
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${pad2(displayH)}:${pad2(m)} ${ampm}`;
}

export function formatTimeSeconds12(timestamp) {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${displayH}:${pad2(m)}:${pad2(s)} ${ampm}`;
}

export function formatDateFull(timestamp) {
  const d = new Date(timestamp);
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateWithTime(timestamp) {
  const d = new Date(timestamp);
  return `${DAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} — ${formatTime12(timestamp)}`;
}

export function formatHeaderDateTime(timestamp) {
  return `${formatTimeSeconds12(timestamp)} · ${formatDateFull(timestamp)}`;
}

export function formatSeconds(totalSec) {
  const t = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) {
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }
  return `${pad2(m)}:${pad2(s)}`;
}

export function formatYMD(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseStartOfDay(ymdStr) {
  const [y = 1970, m = 1, d = 1] = (ymdStr || '').split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

export function parseEndOfDay(ymdStr) {
  const [y = 1970, m = 1, d = 1] = (ymdStr || '').split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

const INITIAL_STATE = {
  orders: [],
  riders: DEFAULT_RIDERS
};

let currentState = INITIAL_STATE;
let initialized = false;
let broadcastChannel = null;
const storeListeners = new Set();

function notifyStoreListeners() {
  for (const listener of storeListeners) {
    listener();
  }
}

function parseStateJSON(jsonString) {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.orders)) return null;
    return {
      orders: parsed.orders,
      riders: Array.isArray(parsed.riders) && parsed.riders.length ? parsed.riders : DEFAULT_RIDERS
    };
  } catch (e) {
    return null;
  }
}

function initStoreIfNeeded() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const stored = parseStateJSON(window.localStorage.getItem(STATE_KEY));
  currentState = stored || INITIAL_STATE;

  if ('BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
    broadcastChannel.onmessage = (event) => {
      const data = event.data;
      if (data && Array.isArray(data.orders)) {
        currentState = data;
        notifyStoreListeners();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== STATE_KEY) return;
    const newState = parseStateJSON(e.newValue);
    if (newState) {
      currentState = newState;
      notifyStoreListeners();
    }
  });
}

export function setTrackerState(newState) {
  currentState = newState;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(newState));
      broadcastChannel?.postMessage(newState);
    } catch (e) {
      console.error('Failed to write tracker state:', e);
    }
  }
  notifyStoreListeners();
}

function subscribeTrackerStore(listener) {
  initStoreIfNeeded();
  storeListeners.add(listener);
  return () => storeListeners.delete(listener);
}

export function useTrackerStore() {
  return useSyncExternalStore(
    subscribeTrackerStore,
    () => currentState,
    () => INITIAL_STATE
  );
}

export function useLiveNowTicker(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createOrder({ orderNumber, driver, timerDurationSeconds }) {
  const now = Date.now();
  const num = Number(orderNumber);
  const newOrder = {
    id: generateId(),
    orderNumber: num,
    orderLabel: `Order ${num}`,
    driver: driver || '',
    status: 'in_transit',
    createdAt: now,
    timerDurationSeconds: Number(timerDurationSeconds) || 0,
    startedAt: now,
    deliveredAt: null,
    removed: false
  };

  setTrackerState({
    ...currentState,
    orders: [newOrder, ...currentState.orders]
  });
}

export function updateOrderStatus(id, newStatus) {
  const now = Date.now();
  const updatedOrders = currentState.orders.map((ord) => {
    if (ord.id !== id) return ord;
    const copy = { ...ord, status: newStatus, removed: false };
    if (newStatus === 'delivered') {
      copy.deliveredAt = ord.deliveredAt ?? now;
      copy.startedAt = ord.startedAt ?? ord.createdAt;
    } else {
      copy.deliveredAt = null;
    }

    if (newStatus === 'in_transit' && !copy.startedAt) {
      copy.startedAt = now;
    }
    if (newStatus === 'pending') {
      copy.startedAt = null;
    }

    return copy;
  });

  setTrackerState({
    ...currentState,
    orders: updatedOrders
  });
}

export function removeOrder(id) {
  const updatedOrders = currentState.orders.map((ord) =>
    ord.id === id ? { ...ord, removed: true } : ord
  );
  setTrackerState({
    ...currentState,
    orders: updatedOrders
  });
}

export function addNewRider(riderName) {
  const clean = riderName.trim();
  if (!clean) return;
  const exists = currentState.riders.some((r) => r.toLowerCase() === clean.toLowerCase());
  if (!exists) {
    setTrackerState({
      ...currentState,
      riders: [...currentState.riders, clean]
    });
  }
}

export function isOrderOverdue(order, now) {
  if (order.status !== 'in_transit' || !order.startedAt) return false;
  return now >= order.startedAt + order.timerDurationSeconds * 1000;
}

export function getOverdueSeconds(order, now) {
  const deadline = (order.startedAt ?? order.createdAt) + order.timerDurationSeconds * 1000;
  const endTime = order.deliveredAt ?? now;
  return Math.max(0, Math.floor((endTime - deadline) / 1000));
}

export function getTimeTakenSeconds(order, now) {
  const endTime = order.deliveredAt ?? now;
  return Math.max(0, Math.floor((endTime - order.createdAt) / 1000));
}

export function getUsedOrderNumbersSet(orders) {
  return new Set(orders.map((o) => o.orderNumber));
}

export function getOrderStatusBadgeLabel(order, now) {
  if (order.removed) return 'Removed';
  if (order.status === 'delivered') return 'Delivered';
  if (order.status === 'failed') return 'Failed';
  if (order.status === 'pending') return 'Pending';
  if (isOrderOverdue(order, now)) return 'Overdue';
  return 'In transit';
}
