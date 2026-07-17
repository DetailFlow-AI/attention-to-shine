# kalshi-mirror

An honest, **read-only** account dashboard built from your Kalshi *Recent
Activity* CSV export.

There are no trade suggestions here. No entry prices, no exit prices, no "next
plays." This is a mirror — it shows you what already happened to your money so
you can sit with the real numbers.

## Usage

```bash
python3 kalshi_mirror.py ACTIVITY.csv [--balance N] [--html out.html] [--no-html]
```

- `ACTIVITY.csv` — your Kalshi "Recent Activity" export.
- `--balance N` — your current Kalshi cash balance. The CSV does **not** contain
  your balance, so if you leave this off it's *estimated* from the running
  ledger of every signed amount. Pass the real number for an exact Net P&L.
- `--html out.html` — where to write the HTML report. Defaults to
  `<csvname>_mirror.html` next to your CSV.
- `--no-html` — terminal report only.

The tool prints a clean terminal report first, then writes a single
self-contained HTML file (all CSS inline, **no external libraries**) you can
open in any browser.

No Python dependencies beyond the standard library. Python 3.8+.

## What it computes

1. **Net account P&L** — `withdrawals + current balance − deposits`. Printed in
   red if negative.
2. **Fees paid** — total, split taker vs maker and by market group
   (BTC 15-min `KXBTC15M`, BTC daily `KXBTCD`, everything else), plus what
   percent of every deposited dollar went to fees.
3. **Taker ratio** — the share of trades that crossed the spread, and the
   dollars resting limit orders would have saved on those same fills.
4. **Volume churn** — notional volume traded ÷ total deposited, shown as
   "you cycled your bankroll X times."
5. **Deposit tracker** — count, total, a month-bucketed list, and a chasing
   flag if there are more than 20 deposits.
6. **Break-even reality** — the win rate you'd need, at your average fill price
   and fee load, just to not lose money.
7. **Session cooldown** — trades grouped by day; any day with more than 15
   trades is flagged a "tilt day," with the P&L impact of your tilt days and
   your highest-volume days totaled up.

## Assumptions (kept explicit so the report stays honest)

- **Dollar fields** may contain thousands separators like `1,448.59`; commas,
  `$`, and `(parentheses)` negatives are stripped before conversion.
- **Taker vs maker** comes from `Order_Type` (`market` = taker/crossed the
  spread, `limit` = maker/resting). If the order type is missing, a fill that
  incurred a fee is treated as a taker fill.
- **Limit-order savings** assume a maker fill on Kalshi is not charged the taker
  fee, so the estimated savings is the taker fees paid on crossed fills.
- **Contracts per fill** are derived as `abs(Amount_In_Dollars) ÷ (Price_In_Cents/100)`
  because the export doesn't carry an explicit quantity column. Break-even win
  rate uses `avg fill price + avg fee per contract`.
- **Daily P&L impact** is the signed trade/settlement cashflow minus fees for
  that day. We don't have clean per-trade win/loss outcomes, so section 6 shows
  the required win rate without claiming your actual one.

## Files

- `kalshi_mirror.py` — the tool.
- `make_sample.py` — generates `sample_activity.csv`, a fixture for testing.
- `sample_activity.csv` — sample export (a taker-heavy, chasing, net-down account).
