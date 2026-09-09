import React, { useState, useMemo } from 'react';
import { createOrder, addNewRider, getUsedOrderNumbersSet } from '../lib/trackerStore';

const PRESETS = [
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
  { label: '1 hour 30 min', seconds: 5400 }
];

export function NewOrderForm({ orders, riders }) {
  const usedOrderSet = useMemo(() => getUsedOrderNumbersSet(orders), [orders]);

  const [orderNumber, setOrderNumber] = useState('');
  const [selectedRider, setSelectedRider] = useState('');
  const [newRiderName, setNewRiderName] = useState('');
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [selectedTimerOption, setSelectedTimerOption] = useState(null);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  const computedCustomSeconds =
    (Number(customHours) || 0) * 3600 + (Number(customMinutes) || 0) * 60;
  
  const activeDurationSeconds =
    selectedTimerOption === 'custom'
      ? computedCustomSeconds
      : typeof selectedTimerOption === 'number'
      ? selectedTimerOption
      : 0;

  const canStart = activeDurationSeconds > 0 && orderNumber !== '';

  function resetForm() {
    setOrderNumber('');
    setSelectedRider('');
    setNewRiderName('');
    setShowTimerPicker(false);
    setSelectedTimerOption(null);
    setCustomHours('');
    setCustomMinutes('');
  }

  function handleStart() {
    if (!canStart) return;
    const finalDriver = selectedRider === '__new' ? newRiderName.trim() : selectedRider;

    if (selectedRider === '__new' && finalDriver) {
      addNewRider(finalDriver);
    }

    createOrder({
      orderNumber: Number(orderNumber),
      driver: finalDriver,
      timerDurationSeconds: activeDurationSeconds
    });

    resetForm();
  }

  return (
    <section className="panel-card">
      <h2 className="text-lg font-semibold">New order</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick an order number and rider, then choose the allotted delivery time.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="order-number">
            Order number
          </label>
          <select
            id="order-number"
            className="field"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          >
            <option value="">Select an order…</option>
            {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
              const isUsed = usedOrderSet.has(num);
              return (
                <option key={num} value={num} disabled={isUsed}>
                  {isUsed ? `Order ${num} — already used` : `Order ${num}`}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="rider">
            Rider
          </label>
          <select
            id="rider"
            className="field"
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
          >
            <option value="">Select a rider…</option>
            {riders.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="__new">+ Add new rider…</option>
          </select>

          {selectedRider === '__new' && (
            <input
              className="field mt-2"
              placeholder="New rider name"
              value={newRiderName}
              onChange={(e) => setNewRiderName(e.target.value)}
            />
          )}
        </div>
      </div>

      {showTimerPicker ? (
        <div className="mt-4 rounded-xl border border-border bg-panel-2 p-4">
          <p className="text-sm font-medium">Choose the allotted time</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setSelectedTimerOption(preset.seconds)}
                className={`rounded-[10px] border px-3 py-2 text-sm ${
                  selectedTimerOption === preset.seconds
                    ? 'border-primary bg-primary text-primary-foreground font-semibold'
                    : 'border-border bg-panel text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedTimerOption('custom')}
              className={`rounded-[10px] border px-3 py-2 text-sm ${
                selectedTimerOption === 'custom'
                  ? 'border-primary bg-primary text-primary-foreground font-semibold'
                  : 'border-border bg-panel text-foreground'
              }`}
            >
              Custom
            </button>
          </div>

          {selectedTimerOption === 'custom' && (
            <div className="mt-3 flex gap-3">
              <div>
                <label className="field-label" htmlFor="custom-h">
                  Hours
                </label>
                <input
                  id="custom-h"
                  className="field"
                  type="number"
                  min="0"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="custom-m">
                  Minutes
                </label>
                <input
                  id="custom-m"
                  className="field"
                  type="number"
                  min="0"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="btn-primary disabled:opacity-50"
              disabled={!canStart}
              onClick={handleStart}
            >
              Start
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setShowTimerPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn-primary mt-4 disabled:opacity-50"
          disabled={orderNumber === ''}
          onClick={() => setShowTimerPicker(true)}
        >
          Start timer
        </button>
      )}
    </section>
  );
}
