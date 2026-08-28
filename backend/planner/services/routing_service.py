import requests
import math
import logging

logger = logging.getLogger(__name__)

# Fallback database of key US cities to ensure 100% offline reliability if geocoding APIs timeout
CITY_COORDINATES = {
    "chicago, il": {"lat": 41.8781, "lng": -87.6298, "name": "Chicago, IL"},
    "chicago": {"lat": 41.8781, "lng": -87.6298, "name": "Chicago, IL"},
    "springfield, il": {"lat": 39.7817, "lng": -89.6501, "name": "Springfield, IL"},
    "st. louis, mo": {"lat": 38.6270, "lng": -90.1994, "name": "St. Louis, MO"},
    "dallas, tx": {"lat": 32.7767, "lng": -96.7970, "name": "Dallas, TX"},
    "dallas": {"lat": 32.7767, "lng": -96.7970, "name": "Dallas, TX"},
    "houston, tx": {"lat": 29.7604, "lng": -95.3698, "name": "Houston, TX"},
    "atlanta, ga": {"lat": 33.7490, "lng": -84.3880, "name": "Atlanta, GA"},
    "atlanta": {"lat": 33.7490, "lng": -84.3880, "name": "Atlanta, GA"},
    "denver, co": {"lat": 39.7392, "lng": -104.9903, "name": "Denver, CO"},
    "los angeles, ca": {"lat": 34.0522, "lng": -118.2437, "name": "Los Angeles, CA"},
    "new york, ny": {"lat": 40.7128, "lng": -74.0060, "name": "New York, NY"},
    "seattle, wa": {"lat": 47.6062, "lng": -122.3321, "name": "Seattle, WA"},
    "miami, fl": {"lat": 25.7617, "lng": -80.1918, "name": "Miami, FL"},
    "phoenix, az": {"lat": 33.4484, "lng": -112.0740, "name": "Phoenix, AZ"},
    "indianapolis, in": {"lat": 39.7684, "lng": -86.1581, "name": "Indianapolis, IN"},
    "nashville, tn": {"lat": 36.1627, "lng": -86.7816, "name": "Nashville, TN"},
    "memphis, tn": {"lat": 35.1495, "lng": -90.0490, "name": "Memphis, TN"},
    "des moines, ia": {"lat": 41.5868, "lng": -93.6250, "name": "Des Moines, IA"},
    "kansas city, mo": {"lat": 39.0997, "lng": -94.5786, "name": "Kansas City, MO"},
    "oklahoma city, ok": {"lat": 35.4676, "lng": -97.5164, "name": "Oklahoma City, OK"},
    "salt lake city, ut": {"lat": 40.7608, "lng": -111.8910, "name": "Salt Lake City, UT"},
    "richmond, va": {"lat": 37.5407, "lng": -77.4360, "name": "Richmond, VA"},
    "newark, nj": {"lat": 40.7357, "lng": -74.1724, "name": "Newark, NJ"},
    "baltimore, md": {"lat": 39.2904, "lng": -76.6122, "name": "Baltimore, MD"},
    "philadelphia, pa": {"lat": 39.9526, "lng": -75.1652, "name": "Philadelphia, PA"},
}

def geocode_location(location_str: str) -> dict:
    """Geocode address/city string to lat, lng, display_name."""
    clean_str = location_str.strip().lower()
    
    # Check fallback cache first for exact match or substring
    for key, data in CITY_COORDINATES.items():
        if key in clean_str or clean_str in key:
            return {"lat": data["lat"], "lng": data["lng"], "display_name": data["name"]}

    # Live Nominatim Request
    headers = {"User-Agent": "HOS-Trip-Planner-Compliance-App/1.0"}
    try:
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={requests.utils.quote(location_str)}&countrycodes=us,ca,mx&limit=1"
        res = requests.get(url, headers=headers, timeout=4)
        if res.status_code == 200:
            data = res.json()
            if data:
                lat = float(data[0]["lat"])
                lng = float(data[0]["lon"])
                name = data[0].get("display_name", location_str)
                # Shorten name to City, State if possible
                parts = [p.strip() for p in name.split(",")]
                short_name = f"{parts[0]}, {parts[1]}" if len(parts) >= 2 else name
                return {"lat": lat, "lng": lng, "display_name": short_name}
    except Exception as e:
        logger.warning(f"Geocoding failed for '{location_str}': {e}")

    # Fallback default if geocoding returns nothing
    return {"lat": 39.8283, "lng": -98.5795, "display_name": location_str.title()}


def calculate_haversine_distance_miles(lat1, lon1, lat2, lon2):
    """Calculate distance in miles using Haversine formula."""
    R = 3958.8  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_route_details(current_loc: dict, pickup_loc: dict, dropoff_loc: dict):
    """
    Fetch routing distance (miles), driving duration (hours), and polyline coordinates.
    Returns route data for current -> pickup leg and pickup -> dropoff leg.
    """
    coords_str = f"{current_loc['lng']},{current_loc['lat']};{pickup_loc['lng']},{pickup_loc['lat']};{dropoff_loc['lng']},{dropoff_loc['lat']}"
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
    
    try:
        res = requests.get(osrm_url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                legs = route.get("legs", [])
                
                # Convert meters to miles, seconds to hours
                leg1_miles = legs[0]["distance"] * 0.000621371 if len(legs) > 0 else 0
                leg1_hours = legs[0]["duration"] / 3600.0 if len(legs) > 0 else 0
                
                leg2_miles = legs[1]["distance"] * 0.000621371 if len(legs) > 1 else 0
                leg2_hours = legs[1]["duration"] / 3600.0 if len(legs) > 1 else 0
                
                total_miles = route["distance"] * 0.000621371
                total_driving_hours = route["duration"] / 3600.0
                
                # Extract polyline coordinates [[lat, lng], ...]
                geometry = route.get("geometry", {}).get("coordinates", [])
                polyline = [[coord[1], coord[0]] for coord in geometry]
                
                return {
                    "total_miles": round(total_miles, 1),
                    "total_driving_hours": round(total_driving_hours, 2),
                    "leg1": {"miles": round(leg1_miles, 1), "driving_hours": round(leg1_hours, 2)},
                    "leg2": {"miles": round(leg2_miles, 1), "driving_hours": round(leg2_hours, 2)},
                    "polyline": polyline
                }
    except Exception as e:
        logger.warning(f"OSRM Routing failed, using Haversine calculation: {e}")

    # Fallback calculations if OSRM is offline
    leg1_miles = calculate_haversine_distance_miles(current_loc["lat"], current_loc["lng"], pickup_loc["lat"], pickup_loc["lng"]) * 1.25
    leg2_miles = calculate_haversine_distance_miles(pickup_loc["lat"], pickup_loc["lng"], dropoff_loc["lat"], dropoff_loc["lng"]) * 1.25
    total_miles = leg1_miles + leg2_miles
    
    # Estimate truck speed at 55 mph
    truck_speed_mph = 55.0
    leg1_hours = leg1_miles / truck_speed_mph
    leg2_hours = leg2_miles / truck_speed_mph
    total_driving_hours = leg1_hours + leg2_hours

    # Interpolate simple 3-point polyline
    polyline = [
        [current_loc["lat"], current_loc["lng"]],
        [pickup_loc["lat"], pickup_loc["lng"]],
        [dropoff_loc["lat"], dropoff_loc["lng"]]
    ]

    return {
        "total_miles": round(total_miles, 1),
        "total_driving_hours": round(total_driving_hours, 2),
        "leg1": {"miles": round(leg1_miles, 1), "driving_hours": round(leg1_hours, 2)},
        "leg2": {"miles": round(leg2_miles, 1), "driving_hours": round(leg2_hours, 2)},
        "polyline": polyline
    }
