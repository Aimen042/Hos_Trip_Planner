# 🚛 Spotter HOS Trip Planner

A full-stack **FMCSA Hours-of-Service (HOS) compliance trip planner** for truck drivers. Enter a driver/carrier profile and a trip (current location, pickup, dropoff, and current 70-hour cycle usage), and the app simulates a legally compliant duty timeline — inserting required 30-minute breaks, 10-hour resets, fuel stops, and 70-hour cycle limits — then renders the route on a map and auto-fills official **Driver's Daily Log (RODS)** sheets for every day of the trip.

Built with **Django REST Framework** (backend) and **React 19 + Vite + Tailwind CSS v4** (frontend).

**🔗 Live Demo:** [https://hos-trip-planner-pl78.vercel.app](https://hos-trip-planner-pl78.vercel.app)

---

## ✨ Features

- **Driver & Carrier Profile screen** — capture driver name, carrier name, main office address, truck/trailer numbers, and home terminal address before planning a trip. All fields appear as placeholders (not prefilled) and are validated before continuing.
- **Trip Planning form** — starting location, pickup, dropoff, and current 70-hr/8-day cycle hours used, with quick-pick hour presets and a live cycle-progress ring.
- **HOS Compliance Engine** (`hos_calculator.py`) — a pure-Python duty-status simulator that enforces, per 49 CFR § 395:
  - 11-hour driving limit
  - 14-hour on-duty window
  - 30-minute break after 8 cumulative hours of driving
  - 70-hour / 8-day cycle cap
  - 10-hour off-duty resets between shifts
  - Automatic fuel stops on long-haul legs
  - 1-hour on-duty time for pickup and dropoff
- **Interactive route map** (Leaflet/React-Leaflet) showing current, pickup, dropoff, and all break/reset/fuel stops along the route.
- **Auto-generated Driver's Daily Log sheets** — one official-style 24-hour grid (Form FMCSA-395.8 style) per day of the trip, with:
  - Continuous step-function duty-status graph (Off Duty / Sleeper Berth / Driving / On Duty)
  - Auto-computed hour totals per status, reconciled to sum to 24.0
  - Driver name, carrier, truck/trailer numbers, main office & home terminal addresses auto-filled from the Driver Profile screen (no more hardcoded values)
  - Remarks log (city/state + reason at every duty-status change)
  - On-screen **signature pad** to sign each day's log
  - **"I certify these entries are true and correct"** certification checkbox next to each day's signature
  - Print/export support (each day prints as its own clean page)
- **Geocoding with graceful fallback** — tries OpenStreetMap Nominatim first, falls back to a built-in table of major US cities so the app keeps working offline/rate-limited.
- **Routing with graceful fallback** — tries the public OSRM routing API first, falls back to a Haversine-distance estimate if OSRM is unreachable.
- **Preset demo trips** (short / medium / cross-country) to quickly showcase single-day, 30-min-break, and multi-day + fuel-stop scenarios.
- **Production-ready configuration** — environment-driven Django secret key, debug flag, allowed hosts, and CORS origins; optional Postgres support via `DATABASE_URL`; ready to deploy to Vercel out of the box.
- Backend unit tests covering short trips, 30-minute break enforcement, and multi-day cycles.

---

## 🏗️ Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Python, Django 5, Django REST Framework, django-cors-headers, requests |
| Database   | SQLite (default, dev) |
| Frontend   | React 19, Vite, Tailwind CSS v4, Axios |
| Mapping    | Leaflet, React-Leaflet |
| Icons      | lucide-react |
| Routing API| OSRM (`router.project-osrm.org`) with Haversine fallback |
| Geocoding  | OpenStreetMap Nominatim with a built-in US-city fallback table |

---

## 📁 Project Structure

```
Hos_Trip_Planner-main/
├── .gitignore
├── README.md
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── vercel.json                   # Vercel function config (maxDuration)
│   ├── hos_backend/                  # Django project settings
│   │   ├── settings.py               # Env-driven secret key, debug, hosts, CORS, DB
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── planner/                      # Main Django app
│       ├── views.py                  # PlanTripAPIView (POST /api/plan-trip/)
│       ├── serializers.py            # Request validation (trip + driver fields)
│       ├── urls.py
│       ├── services/
│       │   ├── hos_calculator.py     # Core HOS simulation & daily-log generation
│       │   └── routing_service.py    # Geocoding + route distance/duration
│       └── tests/
│           └── test_hos_calculator.py
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env.example                  # Template for VITE_API_BASE_URL
    ├── public/
    │   └── images/truck-hero.png
    └── src/
        ├── App.jsx                        # Top-level step router (driver → welcome → loading → results)
        ├── main.jsx
        ├── services/
        │   └── api.js                     # Axios client for /api/plan-trip/ (env-driven base URL)
        ├── mock/
        │   └── presetTrips.js             # Demo trip presets
        └── components/
            ├── DriverDetailsScreen.jsx    # Step 1: driver & carrier profile form
            ├── WelcomeScreen.jsx          # Step 2: trip details form
            ├── TruckLoader.jsx            # Animated loading screen while backend calculates
            ├── ResultsScreen.jsx          # Step 3: results (summary, map, log sheets)
            ├── TripForm.jsx
            ├── TripSummary.jsx
            ├── RouteMap.jsx               # Leaflet map with route + stop markers
            ├── HOSStatsWidget.jsx
            └── LogSheet/
                ├── LogSheetViewer.jsx     # Day pagination, print controls, signature/certify state
                ├── LogSheetSVG.jsx        # The actual 24-hr FMCSA log sheet (SVG grid)
                └── SignaturePad.jsx       # Canvas-based signature capture
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

The API will be available at `http://127.0.0.1:8000/api/`.

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
cp .env.example .env.local      # optional locally; defaults already point at localhost:8000
npm install
npm run dev
```

The app will be available at `http://127.0.0.1:5173/`.

> The frontend calls the backend at the URL in `VITE_API_BASE_URL` (see `frontend/.env.example`), falling back to `http://127.0.0.1:8000/api` if unset. Update it if your backend runs elsewhere.

### 3. Build for Production

```bash
cd frontend
npm run build     # outputs to frontend/dist
```

## 🔌 API Reference

### `POST /api/plan-trip/`

**Request body:**

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used_hrs": 15.0,

  "driver_name": "John Doe",
  "carrier_name": "Antigravity Express Logistics Inc.",
  "main_office_address": "100 Logistics Pkwy, Chicago, IL 60601",
  "truck_number": "TRK-9042 / TRL-8810",
  "home_terminal_address": "100 Logistics Pkwy, Chicago, IL 60601"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `current_location` | string | ✅ | Driver's starting location |
| `pickup_location` | string | ✅ | Cargo pickup location |
| `dropoff_location` | string | ✅ | Cargo dropoff location |
| `current_cycle_used_hrs` | float | ✅ | 0.0 – 70.0 hours already used in the 70-hr/8-day cycle |
| `driver_name` | string | optional | Printed on the daily log |
| `carrier_name` | string | optional | Printed on the daily log |
| `main_office_address` | string | optional | Printed on the daily log |
| `truck_number` | string | optional | Printed on the daily log |
| `home_terminal_address` | string | optional | Printed on the daily log |

**Response:** a JSON object containing `inputs`, `summary` (total miles/hours/days), `route` (polyline + coordinates), `stops` (map markers for breaks/resets/fuel), `timeline` (full duty-status event list), and `daily_logs` (one FMCSA-style log per day, pre-filled with the driver/carrier details above).

---

## 🧪 Running Tests

```bash
cd backend
python manage.py test planner
```

Covers: short trips (no forced breaks), the 30-minute break rule after 8 hours of driving, and multi-day cycle/reset behavior.

---

## 🧭 App Flow

1. **Driver Details** — enter driver name, carrier, addresses, and truck/trailer numbers.
2. **Trip Details** — enter current/pickup/dropoff locations and current cycle hours used.
3. **Calculating** — animated loader while the backend geocodes, routes, and runs the HOS simulation.
4. **Results** — trip summary, interactive route map, and per-day Driver's Daily Log sheets you can sign, certify, and print.

---

## 📜 Compliance Notice

All Hours-of-Service calculations are based on **49 CFR § 395** (FMCSA 2024 regulations) as implemented in `hos_calculator.py`. This tool is intended for planning and demonstration purposes — always verify compliance against your carrier's official ELD system before dispatch.