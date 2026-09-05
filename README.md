# cryptic.site — Deriv Digit Intelligence

Version 4.0.0. A browser-based statistical digit-analysis dashboard for Deriv market data.

## What is new in V4
- Dynamically discovers currently active Deriv **Volatility Indices** using `active_symbols` instead of a hard-coded list.
- Includes new volatility symbols automatically when Deriv exposes them through the API.
- Supports Volatility indices across 1s and non-1s variants, including current additions such as Volatility 15 (1s), 30 (1s), and 90 (1s), when active.
- Keeps the same digit models for every selected volatility market.
- Per-session analysis resets when changing markets so one market's data does not contaminate another.
- Live tick streaming and tick-history loading.
- Exact digit 0–9 ranking, Even/Odd, Different/Same, Over/Under 5.
- Frequency + transition + recent-frequency model.
- Entropy, confidence score, WATCH/WAIT filter, chart and live backtest scorecard.
- No automatic trade execution.

## Run locally
1. Install Node.js 18+.
2. Register a Deriv OAuth application and set the redirect URI to `http://localhost:3000/callback`.
3. Copy `.env.example` to `.env` and set `DERIV_CLIENT_ID` and `DERIV_REDIRECT_URI`.
4. Run `npm install`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Environment
- `DERIV_CLIENT_ID` — Deriv OAuth application ID.
- `DERIV_REDIRECT_URI` — must exactly match the URI registered in Deriv.
- `PORT` — optional, defaults to 3000.

## Security
This demo stores OAuth access tokens in memory only. For production, use HTTPS, Secure/HttpOnly cookies, encrypted persistent session storage, strict redirect URI validation, token lifecycle handling and proper CSRF/session protections.

## Important
The dashboard is an analytics/backtesting tool. Recent digit frequencies and transitions do not guarantee future outcomes or profitability. Do not treat the confidence score as a guaranteed win probability. The project intentionally does not place trades.
