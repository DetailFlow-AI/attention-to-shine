#!/usr/bin/env python3
"""kalshi-mirror — an honest, read-only account dashboard for a Kalshi export.

Feed it your Kalshi "Recent Activity" CSV and it holds up a mirror: net P&L,
what you actually paid in fees, how taker-happy you are, how many times you've
cycled your bankroll, your deposit cadence, the win rate you'd need just to
break even, and which days you tilted.

There are no trade suggestions here. No entry prices, no "next plays." Just the
truth about what already happened.

Usage:
    python3 kalshi_mirror.py ACTIVITY.csv [--balance N] [--html out.html]

--balance is your current cash balance on Kalshi (the CSV doesn't contain it).
If omitted, it's estimated from the running ledger of every signed amount.
"""
from __future__ import annotations

import argparse
import csv
import html
import sys
from collections import defaultdict
from datetime import datetime

# ---------------------------------------------------------------------------
# ANSI colors (terminal only)
# ---------------------------------------------------------------------------
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


def _use_color() -> bool:
    return sys.stdout.isatty()


def color(text: str, code: str) -> str:
    return f"{code}{text}{RESET}" if _use_color() else text


def money(x: float, red_if_negative: bool = False) -> str:
    """Format a dollar amount, optionally red when negative."""
    s = f"${x:,.2f}" if x >= 0 else f"-${abs(x):,.2f}"
    if red_if_negative and x < 0:
        return color(s, RED)
    return s


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------
def parse_money(raw: str) -> float:
    """Turn '1,448.59' / '$1,448.59' / '(12.00)' / '-5' into a float."""
    if raw is None:
        return 0.0
    s = str(raw).strip()
    if not s:
        return 0.0
    neg = False
    if s.startswith("(") and s.endswith(")"):
        neg = True
        s = s[1:-1]
    s = s.replace("$", "").replace(",", "").strip()
    if s.startswith("-"):
        neg = True
        s = s[1:]
    if not s:
        return 0.0
    try:
        val = float(s)
    except ValueError:
        return 0.0
    return -val if neg else val


def parse_date(raw: str):
    """Return a datetime (or None). Tolerant of a few common Kalshi formats."""
    if not raw:
        return None
    s = str(raw).strip()
    fmts = (
        "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d", "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M", "%m/%d/%Y", "%m/%d/%y %H:%M", "%m/%d/%y",
    )
    for f in fmts:
        try:
            return datetime.strptime(s, f)
        except ValueError:
            continue
    # Last resort: first 10 chars as a date.
    try:
        return datetime.strptime(s[:10], "%Y-%m-%d")
    except ValueError:
        return None


def _get(row: dict, *names: str) -> str:
    """Case/spacing-insensitive column lookup."""
    for n in names:
        if n in row and row[n] not in (None, ""):
            return row[n]
    low = {str(k).strip().lower(): v for k, v in row.items() if k is not None}
    for n in names:
        v = low.get(n.strip().lower())
        if v not in (None, ""):
            return v
    return ""


# ---------------------------------------------------------------------------
# Fee model (assumptions made explicit so the report stays honest)
# ---------------------------------------------------------------------------
# Kalshi charges the *taker* who crosses the spread. A resting limit order that
# provides liquidity (a maker fill) is not charged this fee. So the honest
# framing of "what limit orders would have saved" is: the taker fees you paid.
MAKER_FEE_PER_CONTRACT = 0.0  # Kalshi maker fills are not charged the taker fee.

GROUP_BTC15 = "BTC 15-min (KXBTC15M)"
GROUP_BTCD = "BTC daily (KXBTCD)"
GROUP_OTHER = "Everything else"


def market_group(ticker: str) -> str:
    t = (ticker or "").strip().upper()
    if t.startswith("KXBTC15M"):
        return GROUP_BTC15
    if t.startswith("KXBTCD"):
        return GROUP_BTCD
    return GROUP_OTHER


def classify_type(row: dict) -> str:
    """Bucket a row into deposit / withdrawal / trade / settlement / other."""
    t = _get(row, "type", "Type", "Activity").strip().lower()
    if "deposit" in t:
        return "deposit"
    if "withdraw" in t:
        return "withdrawal"
    if "settle" in t:
        return "settlement"
    if any(k in t for k in ("trade", "order", "fill", "buy", "sell")):
        return "trade"
    # Fallback: a row with a market ticker and a direction is a trade.
    if _get(row, "Market_Ticker", "market_ticker") and _get(row, "Direction", "direction"):
        return "trade"
    return "other"


def is_taker(row: dict, fee: float) -> bool:
    """A fill 'crossed the spread' if it's a market order (or an order that
    incurred the taker fee). Limit fills that rested are makers."""
    ot = _get(row, "Order_Type", "order_type").strip().lower()
    if ot in ("market", "market_order", "taker"):
        return True
    if ot in ("limit", "limit_order", "maker", "resting"):
        return False
    # Unknown order type: infer from whether a taker fee was charged.
    return fee > 0


# ---------------------------------------------------------------------------
# Core computation
# ---------------------------------------------------------------------------
def load_rows(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def compute(rows: list[dict], balance_override):
    m: dict = {}

    deposits, withdrawals = [], []       # (datetime, amount)
    ledger_sum = 0.0                     # running sum of every signed amount

    # trade aggregates
    trade_count = 0
    taker_count = 0
    total_fees = 0.0
    fees_taker = 0.0
    fees_maker = 0.0
    fees_by_group = defaultdict(float)
    total_notional = 0.0                 # dollars of contracts traded
    total_contracts = 0.0
    limit_savings = 0.0                  # taker fee that a maker fill would avoid
    price_weighted_num = 0.0             # sum(price$ * contracts) for avg fill
    daily_trades = defaultdict(int)      # date -> count
    daily_pnl = defaultdict(float)       # date -> signed trading cashflow
    daily_volume = defaultdict(float)    # date -> notional traded

    for row in rows:
        kind = classify_type(row)
        amt = parse_money(_get(row, "Amount_In_Dollars", "amount_in_dollars", "Amount"))
        fee = parse_money(_get(row, "Fee_In_Dollars", "fee_in_dollars", "Fee"))
        dt = parse_date(_get(row, "Original_Date", "original_date", "Date"))
        ledger_sum += amt - fee

        if kind == "deposit":
            deposits.append((dt, abs(amt)))
        elif kind == "withdrawal":
            withdrawals.append((dt, abs(amt)))
        elif kind in ("trade", "settlement"):
            day = dt.date() if dt else None
            # Trading cashflow impact (signed amount minus fee).
            if day is not None:
                daily_pnl[day] += amt - fee
            if kind == "trade":
                trade_count += 1
                total_fees += fee
                group = market_group(_get(row, "Market_Ticker", "market_ticker"))
                fees_by_group[group] += fee
                price_cents = parse_money(_get(row, "Price_In_Cents", "price_in_cents"))
                price_dollars = price_cents / 100.0 if price_cents else 0.0
                notional = abs(amt)
                contracts = notional / price_dollars if price_dollars > 0 else 0.0
                total_notional += notional
                total_contracts += contracts
                price_weighted_num += price_dollars * contracts
                if day is not None:
                    daily_trades[day] += 1
                    daily_volume[day] += notional
                if is_taker(row, fee):
                    taker_count += 1
                    fees_taker += fee
                    limit_savings += max(fee - MAKER_FEE_PER_CONTRACT * contracts, 0.0)
                else:
                    fees_maker += fee

    total_deposits = sum(a for _, a in deposits)
    total_withdrawals = sum(a for _, a in withdrawals)

    if balance_override is not None:
        balance = balance_override
        balance_estimated = False
    else:
        balance = ledger_sum
        balance_estimated = True

    # 1. Net account P&L
    net_pnl = total_withdrawals + balance - total_deposits

    # 2. Fees
    fee_pct_of_deposits = (total_fees / total_deposits * 100.0) if total_deposits else 0.0

    # 3. Taker ratio
    taker_ratio = (taker_count / trade_count * 100.0) if trade_count else 0.0

    # 4. Volume churn
    churn = (total_notional / total_deposits) if total_deposits else 0.0

    # 5. Deposit buckets (by month)
    dep_buckets = defaultdict(lambda: [0, 0.0])  # 'YYYY-MM' -> [count, total]
    for dt, a in deposits:
        key = dt.strftime("%Y-%m") if dt else "unknown"
        dep_buckets[key][0] += 1
        dep_buckets[key][1] += a
    deposit_count = len(deposits)
    chasing = deposit_count > 20

    # 6. Break-even reality
    avg_fill_price = (price_weighted_num / total_contracts) if total_contracts else 0.0
    avg_fee_per_contract = (total_fees / total_contracts) if total_contracts else 0.0
    breakeven_winrate = avg_fill_price + avg_fee_per_contract  # fraction of $1

    # 7. Session cooldown / tilt days
    tilt_days = sorted(
        (d for d, c in daily_trades.items() if c > 15),
        key=lambda d: daily_trades[d], reverse=True,
    )
    # Highest-volume days (top 3 by notional) and their P&L impact.
    top_days = sorted(daily_volume.items(), key=lambda kv: kv[1], reverse=True)[:3]
    top_days_pnl = sum(daily_pnl.get(d, 0.0) for d, _ in top_days)
    tilt_pnl = sum(daily_pnl.get(d, 0.0) for d in tilt_days)

    m.update(dict(
        total_deposits=total_deposits, total_withdrawals=total_withdrawals,
        balance=balance, balance_estimated=balance_estimated, net_pnl=net_pnl,
        total_fees=total_fees, fees_taker=fees_taker, fees_maker=fees_maker,
        fees_by_group=dict(fees_by_group), fee_pct_of_deposits=fee_pct_of_deposits,
        trade_count=trade_count, taker_count=taker_count, taker_ratio=taker_ratio,
        limit_savings=limit_savings,
        total_notional=total_notional, total_contracts=total_contracts, churn=churn,
        deposit_count=deposit_count, dep_buckets=dict(dep_buckets), chasing=chasing,
        avg_fill_price=avg_fill_price, avg_fee_per_contract=avg_fee_per_contract,
        breakeven_winrate=breakeven_winrate,
        daily_trades={str(d): c for d, c in daily_trades.items()},
        tilt_days=[(str(d), daily_trades[d], daily_pnl.get(d, 0.0)) for d in tilt_days],
        tilt_pnl=tilt_pnl,
        top_days=[(str(d), v, daily_pnl.get(d, 0.0)) for d, v in top_days],
        top_days_pnl=top_days_pnl,
    ))
    return m


# ---------------------------------------------------------------------------
# Terminal report
# ---------------------------------------------------------------------------
def hr(char="─", width=64):
    return char * width


def section(title: str) -> str:
    return f"\n{color(title, BOLD)}\n{color(hr(), DIM)}"


def render_terminal(m: dict) -> str:
    out = []
    out.append(color("\n  KALSHI MIRROR — honest account report", BOLD))
    out.append(color("  a read-only look at what already happened\n", DIM))

    # 1. Net P&L
    out.append(section("1. Net account P&L"))
    out.append(f"  Deposits in .......... {money(m['total_deposits'])}")
    out.append(f"  Withdrawals out ...... {money(m['total_withdrawals'])}")
    bal_note = "  (estimated from ledger)" if m["balance_estimated"] else ""
    out.append(f"  Current balance ...... {money(m['balance'])}{color(bal_note, DIM)}")
    out.append(f"  {color('Net P&L', BOLD)} .............. "
               f"{money(m['net_pnl'], red_if_negative=True)}")
    out.append(color("  (withdrawals + balance − deposits)", DIM))

    # 2. Fees
    out.append(section("2. Fees paid"))
    out.append(f"  Total fees ........... {money(m['total_fees'])}")
    out.append(f"    taker fees ......... {money(m['fees_taker'])}")
    out.append(f"    maker fees ......... {money(m['fees_maker'])}")
    out.append("  By market group:")
    for g in (GROUP_BTC15, GROUP_BTCD, GROUP_OTHER):
        out.append(f"    {g:<26} {money(m['fees_by_group'].get(g, 0.0))}")
    fee_msg = f"{m['fee_pct_of_deposits']:.1f}% of every dollar you deposited went to fees."
    out.append(f"  {color(fee_msg, YELLOW)}")

    # 3. Taker ratio
    out.append(section("3. Taker ratio (crossing the spread)"))
    out.append(f"  Trades ............... {m['trade_count']}")
    out.append(f"  Taker (crossed) ...... {m['taker_count']}  ({m['taker_ratio']:.1f}%)")
    out.append(f"  Est. saved with limits {money(m['limit_savings'])}")
    out.append(color("  (taker fee minus maker fee on those same fills)", DIM))

    # 4. Volume churn
    out.append(section("4. Volume churn"))
    out.append(f"  Contracts traded ..... {m['total_contracts']:,.0f}")
    out.append(f"  Notional volume ...... {money(m['total_notional'])}")
    out.append(f"  Deposited ............ {money(m['total_deposits'])}")
    churn_msg = f"You cycled your bankroll {m['churn']:.1f} times."
    out.append(f"  {color(churn_msg, YELLOW)}")

    # 5. Deposit tracker
    out.append(section("5. Deposit tracker"))
    out.append(f"  Deposits ............. {m['deposit_count']}  "
               f"totaling {money(m['total_deposits'])}")
    for key in sorted(m["dep_buckets"]):
        c, tot = m["dep_buckets"][key]
        out.append(f"    {key} .......... {c:>3} deposits   {money(tot)}")
    if m["chasing"]:
        out.append(color(f"  ⚠ {m['deposit_count']} deposits (>20). That's a chasing pattern.", RED))
    else:
        out.append(color("  Deposit count under the chasing threshold (20).", GREEN))

    # 6. Break-even reality
    out.append(section("6. Break-even reality"))
    out.append(f"  Avg fill price ....... {m['avg_fill_price'] * 100:.1f}¢")
    out.append(f"  Avg fee / contract ... {money(m['avg_fee_per_contract'])}")
    be_msg = f"You need to win {m['breakeven_winrate'] * 100:.1f}% of the time just to break even."
    out.append(f"  {color(be_msg, YELLOW)}")
    out.append(color("  Sit with that number. It's before you make a dime.", DIM))

    # 7. Session cooldown
    out.append(section("7. Session cooldown (tilt days)"))
    if m["tilt_days"]:
        out.append(color(f"  {len(m['tilt_days'])} tilt day(s) with >15 trades:", RED))
        for d, c, pnl in m["tilt_days"]:
            out.append(f"    {d}   {c:>3} trades   P&L {money(pnl, red_if_negative=True)}")
        out.append(f"  Tilt-day P&L impact .. {money(m['tilt_pnl'], red_if_negative=True)}")
    else:
        out.append(color("  No tilt days (>15 trades). Good.", GREEN))
    out.append("  Highest-volume days:")
    for d, vol, pnl in m["top_days"]:
        out.append(f"    {d}   vol {money(vol)}   P&L {money(pnl, red_if_negative=True)}")
    out.append(f"  Those days' P&L ...... {money(m['top_days_pnl'], red_if_negative=True)}")

    out.append("")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# HTML report (single self-contained file, no external libraries)
# ---------------------------------------------------------------------------
def _cls(x: float) -> str:
    return "neg" if x < 0 else "pos"


def render_html(m: dict) -> str:
    e = html.escape

    def dollars(x):
        return f"-${abs(x):,.2f}" if x < 0 else f"${x:,.2f}"

    fee_groups = "".join(
        f"<tr><td>{e(g)}</td><td class='num'>{dollars(m['fees_by_group'].get(g, 0.0))}</td></tr>"
        for g in (GROUP_BTC15, GROUP_BTCD, GROUP_OTHER)
    )
    dep_rows = "".join(
        f"<tr><td>{e(k)}</td><td class='num'>{m['dep_buckets'][k][0]}</td>"
        f"<td class='num'>{dollars(m['dep_buckets'][k][1])}</td></tr>"
        for k in sorted(m["dep_buckets"])
    )
    if m["tilt_days"]:
        tilt_rows = "".join(
            f"<tr><td>{e(d)}</td><td class='num'>{c}</td>"
            f"<td class='num {_cls(pnl)}'>{dollars(pnl)}</td></tr>"
            for d, c, pnl in m["tilt_days"]
        )
        tilt_block = (f"<p class='flag bad'>{len(m['tilt_days'])} tilt day(s) with more than 15 trades</p>"
                      f"<table><tr><th>Day</th><th>Trades</th><th>P&amp;L</th></tr>{tilt_rows}</table>"
                      f"<p class='sub'>Tilt-day P&amp;L impact: "
                      f"<b class='{_cls(m['tilt_pnl'])}'>{dollars(m['tilt_pnl'])}</b></p>")
    else:
        tilt_block = "<p class='flag good'>No tilt days (&gt;15 trades). Good.</p>"
    top_rows = "".join(
        f"<tr><td>{e(d)}</td><td class='num'>{dollars(v)}</td>"
        f"<td class='num {_cls(p)}'>{dollars(p)}</td></tr>"
        for d, v, p in m["top_days"]
    )

    chasing_flag = (f"<p class='flag bad'>⚠ {m['deposit_count']} deposits (over 20) — chasing pattern</p>"
                    if m["chasing"] else
                    "<p class='flag good'>Deposit count under the chasing threshold (20)</p>")
    bal_note = " <span class='note'>(estimated)</span>" if m["balance_estimated"] else ""

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kalshi Mirror — account report</title>
<style>
  :root {{
    --bg:#0d1117; --panel:#161b22; --line:#2b333d; --ink:#e6edf3;
    --muted:#8b949e; --pos:#3fb950; --neg:#f85149; --warn:#d29922; --accent:#58a6ff;
  }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink);
    font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }}
  .wrap {{ max-width:1000px; margin:0 auto; padding:32px 20px 64px; }}
  header h1 {{ margin:0 0 4px; font-size:28px; letter-spacing:.3px; }}
  header p {{ margin:0 0 24px; color:var(--muted); }}
  .cards {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:28px; }}
  .card {{ background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px 20px; }}
  .card .label {{ color:var(--muted); font-size:13px; text-transform:uppercase; letter-spacing:.6px; }}
  .card .big {{ font-size:34px; font-weight:700; margin-top:6px; line-height:1.1; }}
  .card .sub {{ color:var(--muted); font-size:13px; margin-top:6px; }}
  .pos {{ color:var(--pos); }} .neg {{ color:var(--neg); }} .warn {{ color:var(--warn); }}
  section {{ background:var(--panel); border:1px solid var(--line); border-radius:14px;
    padding:18px 22px; margin-bottom:18px; }}
  section h2 {{ margin:0 0 12px; font-size:16px; color:var(--accent); }}
  table {{ width:100%; border-collapse:collapse; margin:8px 0; }}
  th,td {{ text-align:left; padding:7px 8px; border-bottom:1px solid var(--line); font-size:14px; }}
  th {{ color:var(--muted); font-weight:600; }}
  td.num, th.num {{ text-align:right; font-variant-numeric:tabular-nums; }}
  .num {{ font-variant-numeric:tabular-nums; }}
  .flag {{ border-radius:10px; padding:10px 12px; margin:10px 0 0; font-weight:600; }}
  .flag.bad {{ background:rgba(248,81,73,.12); color:var(--neg); border:1px solid rgba(248,81,73,.35); }}
  .flag.good {{ background:rgba(63,185,80,.10); color:var(--pos); border:1px solid rgba(63,185,80,.30); }}
  .note {{ color:var(--muted); font-size:12px; }}
  .sub {{ color:var(--muted); font-size:13px; }}
  footer {{ color:var(--muted); font-size:12px; margin-top:28px; text-align:center; }}
</style></head>
<body><div class="wrap">
<header>
  <h1>Kalshi Mirror</h1>
  <p>An honest, read-only look at what already happened. No plays. No prices. Just the truth.</p>
</header>

<div class="cards">
  <div class="card">
    <div class="label">Net account P&amp;L</div>
    <div class="big {_cls(m['net_pnl'])}">{dollars(m['net_pnl'])}</div>
    <div class="sub">withdrawals + balance − deposits</div>
  </div>
  <div class="card">
    <div class="label">Total fees paid</div>
    <div class="big warn">{dollars(m['total_fees'])}</div>
    <div class="sub">{m['fee_pct_of_deposits']:.1f}% of everything you deposited</div>
  </div>
  <div class="card">
    <div class="label">Taker ratio</div>
    <div class="big">{m['taker_ratio']:.0f}%</div>
    <div class="sub">{m['taker_count']} of {m['trade_count']} trades crossed the spread</div>
  </div>
  <div class="card">
    <div class="label">Bankroll cycled</div>
    <div class="big">{m['churn']:.1f}×</div>
    <div class="sub">{dollars(m['total_notional'])} traded on {dollars(m['total_deposits'])}</div>
  </div>
  <div class="card">
    <div class="label">Break-even win rate</div>
    <div class="big warn">{m['breakeven_winrate'] * 100:.1f}%</div>
    <div class="sub">just to not lose money</div>
  </div>
  <div class="card">
    <div class="label">Deposits</div>
    <div class="big {'neg' if m['chasing'] else ''}">{m['deposit_count']}</div>
    <div class="sub">totaling {dollars(m['total_deposits'])}</div>
  </div>
</div>

<section>
  <h2>1 · Net account P&amp;L</h2>
  <table>
    <tr><td>Deposits in</td><td class="num">{dollars(m['total_deposits'])}</td></tr>
    <tr><td>Withdrawals out</td><td class="num">{dollars(m['total_withdrawals'])}</td></tr>
    <tr><td>Current balance{bal_note}</td><td class="num">{dollars(m['balance'])}</td></tr>
    <tr><td><b>Net P&amp;L</b></td><td class="num"><b class="{_cls(m['net_pnl'])}">{dollars(m['net_pnl'])}</b></td></tr>
  </table>
</section>

<section>
  <h2>2 · Fees paid</h2>
  <table>
    <tr><td>Total fees</td><td class="num">{dollars(m['total_fees'])}</td></tr>
    <tr><td>Taker fees</td><td class="num">{dollars(m['fees_taker'])}</td></tr>
    <tr><td>Maker fees</td><td class="num">{dollars(m['fees_maker'])}</td></tr>
  </table>
  <table><tr><th>Market group</th><th class="num">Fees</th></tr>{fee_groups}</table>
  <p class="sub warn">{m['fee_pct_of_deposits']:.1f}% of every dollar you deposited went to fees.</p>
</section>

<section>
  <h2>3 · Taker ratio (crossing the spread)</h2>
  <table>
    <tr><td>Trades</td><td class="num">{m['trade_count']}</td></tr>
    <tr><td>Taker (crossed the spread)</td><td class="num">{m['taker_count']} ({m['taker_ratio']:.1f}%)</td></tr>
    <tr><td>Estimated saved with resting limits</td><td class="num">{dollars(m['limit_savings'])}</td></tr>
  </table>
  <p class="sub">Taker fee minus maker fee on those same fills.</p>
</section>

<section>
  <h2>4 · Volume churn</h2>
  <table>
    <tr><td>Contracts traded</td><td class="num">{m['total_contracts']:,.0f}</td></tr>
    <tr><td>Notional volume</td><td class="num">{dollars(m['total_notional'])}</td></tr>
    <tr><td>Total deposited</td><td class="num">{dollars(m['total_deposits'])}</td></tr>
  </table>
  <p class="sub warn">You cycled your bankroll {m['churn']:.1f} times.</p>
</section>

<section>
  <h2>5 · Deposit tracker</h2>
  <table><tr><th>Month</th><th class="num">Deposits</th><th class="num">Total</th></tr>{dep_rows}</table>
  {chasing_flag}
</section>

<section>
  <h2>6 · Break-even reality</h2>
  <table>
    <tr><td>Average fill price</td><td class="num">{m['avg_fill_price'] * 100:.1f}¢</td></tr>
    <tr><td>Average fee per contract</td><td class="num">{dollars(m['avg_fee_per_contract'])}</td></tr>
    <tr><td><b>Win rate needed to break even</b></td><td class="num"><b class="warn">{m['breakeven_winrate'] * 100:.1f}%</b></td></tr>
  </table>
  <p class="sub">That's the rate before you make a single dollar. Sit with it.</p>
</section>

<section>
  <h2>7 · Session cooldown (tilt days)</h2>
  {tilt_block}
  <p class="sub" style="margin-top:16px">Highest-volume days:</p>
  <table><tr><th>Day</th><th class="num">Volume</th><th class="num">P&amp;L</th></tr>{top_rows}</table>
  <p class="sub">Those days' combined P&amp;L: <b class="{_cls(m['top_days_pnl'])}">{dollars(m['top_days_pnl'])}</b></p>
</section>

<footer>kalshi-mirror · read-only truth report · generated {e(datetime.now().strftime('%Y-%m-%d %H:%M'))}</footer>
</div></body></html>"""


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main(argv=None):
    p = argparse.ArgumentParser(
        prog="kalshi-mirror",
        description="An honest, read-only account dashboard from a Kalshi activity CSV.",
    )
    p.add_argument("csv", help="Path to the Kalshi 'Recent Activity' CSV export.")
    p.add_argument("--balance", type=float, default=None,
                   help="Current Kalshi cash balance (not in the CSV). "
                        "If omitted, it's estimated from the running ledger.")
    p.add_argument("--html", default=None,
                   help="Path to write the self-contained HTML report "
                        "(default: alongside the CSV as <name>_mirror.html).")
    p.add_argument("--no-html", action="store_true", help="Skip the HTML report.")
    args = p.parse_args(argv)

    try:
        rows = load_rows(args.csv)
    except FileNotFoundError:
        print(f"error: file not found: {args.csv}", file=sys.stderr)
        return 2
    if not rows:
        print("error: CSV has no data rows.", file=sys.stderr)
        return 2

    m = compute(rows, args.balance)
    print(render_terminal(m))

    if not args.no_html:
        out = args.html
        if out is None:
            base = args.csv.rsplit(".", 1)[0]
            out = f"{base}_mirror.html"
        with open(out, "w", encoding="utf-8") as f:
            f.write(render_html(m))
        print(f"\n{color('HTML report written to: ' + out, GREEN)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
