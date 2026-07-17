"""Generate a realistic Kalshi 'Recent Activity' style CSV for testing kalshi-mirror.

This is only a fixture generator. Real users feed their own export in.
The scenario: a taker-heavy BTC 15-min gambler who deposits repeatedly
(chasing), has a few tilt days, and is net down.
"""
import csv
import random
from datetime import datetime, timedelta

random.seed(7)

HEADER = [
    "type", "Status", "Amount_In_Dollars", "Original_Date", "Fee_In_Dollars",
    "Market_Ticker", "Direction", "Order_Type", "Price_In_Cents", "Result",
]

rows = []
start = datetime(2026, 5, 1, 9, 0, 0)


def money(x):
    # Emulate Kalshi's habit of thousands separators on larger numbers.
    s = f"{abs(x):,.2f}"
    return f"-{s}" if x < 0 else s


day = start
# 24 deposits over the run (chasing pattern), a couple withdrawals.
deposit_days = [0, 0, 1, 3, 3, 4, 6, 7, 7, 8, 10, 11, 12, 12, 13, 15,
                16, 17, 18, 19, 20, 20, 21, 22]
for d in deposit_days:
    dt = start + timedelta(days=d, hours=random.randint(0, 8))
    amt = random.choice([100, 100, 200, 250, 500, 50])
    rows.append(["Deposit", "Completed", money(amt), dt.strftime("%Y-%m-%d %H:%M:%S"),
                 "0.00", "", "", "", "", ""])

# Withdrawals (rare).
for d in (9, 22):
    dt = start + timedelta(days=d, hours=12)
    rows.append(["Withdrawal", "Completed", money(300), dt.strftime("%Y-%m-%d %H:%M:%S"),
                 "0.00", "", "", "", "", ""])

# Trades. Heavy on KXBTC15M (15-min BTC), taker/market orders.
tickers = (["KXBTC15M"] * 12) + (["KXBTCD"] * 4) + (["KXETHD", "KXINXD", "KXHIGHNY"])
n_trade_days = 23
for d in range(n_trade_days):
    # Some days are tilt days (>15 trades).
    n = random.choice([2, 3, 5, 8, 4, 20, 18, 6, 3, 25])
    for _ in range(n):
        dt = start + timedelta(days=d, hours=9,
                               minutes=random.randint(0, 600))
        ticker = random.choice(tickers)
        price = random.randint(20, 85)          # cents
        contracts = random.choice([5, 10, 10, 20, 25, 40, 50])
        notional = round(contracts * price / 100.0, 2)
        # Kalshi taker fee ~ 0.07 * price$ * (1-price$) * contracts, rounded up.
        p = price / 100.0
        order_type = random.choices(["market", "limit"], weights=[8, 2])[0]
        fee = 0.0
        if order_type == "market":
            fee = round(0.07 * p * (1 - p) * contracts + 0.004, 2)
        direction = random.choice(["yes", "no"])
        result = random.choice(["win", "loss", "loss", "loss"])  # mostly losing
        # Signed amount: buys cost money (negative), settlements add later.
        rows.append(["Trade", "Filled", money(-notional),
                     dt.strftime("%Y-%m-%d %H:%M:%S"), money(fee),
                     ticker, direction, order_type, str(price), result])
        # Settlement payout row (win pays $1/contract, loss pays $0).
        payout = contracts * 1.0 if result == "win" else 0.0
        sdt = dt + timedelta(minutes=15)
        rows.append(["Settlement", "Settled", money(payout),
                     sdt.strftime("%Y-%m-%d %H:%M:%S"), "0.00",
                     ticker, direction, "", str(price), result])

with open("sample_activity.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(HEADER)
    w.writerows(rows)

print(f"wrote sample_activity.csv with {len(rows)} rows")
