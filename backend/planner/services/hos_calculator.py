from datetime import datetime, timedelta
import math
import logging

logger = logging.getLogger(__name__)

STATUS_OFF_DUTY = "Off Duty"
STATUS_SLEEPER = "Sleeper Berth"
STATUS_DRIVING = "Driving"
STATUS_ON_DUTY_ND = "On Duty (Not Driving)"

STATUS_MAP = {
    STATUS_OFF_DUTY: 1,
    STATUS_SLEEPER: 2,
    STATUS_DRIVING: 3,
    STATUS_ON_DUTY_ND: 4
}


class HOSCalculator:
    """
    Independent FMCSA Hours-of-Service (49 CFR Part 395) Calculator & Duty Timeline Simulator.
    Calculates driver duty statuses, breaks, 10-hr resets, 70-hr cycle enforcement, fuel stops,
    and 24-hour Daily Log Sheets.
    """

    def __init__(self, current_loc, pickup_loc, dropoff_loc, current_cycle_used_hrs, route_details, start_time=None):
        self.current_loc = current_loc
        self.pickup_loc = pickup_loc
        self.dropoff_loc = dropoff_loc
        self.current_cycle_used_hrs = float(current_cycle_used_hrs)
        self.route_details = route_details
        
        # Start at 06:00 AM on current date if start_time not provided
        if start_time is None:
            now = datetime.now()
            self.start_time = datetime(now.year, now.month, now.day, 6, 0, 0)
        else:
            self.start_time = start_time

    def generate_timeline(self):
        """
        Simulate the duty clock step by step and build the continuous single-source-of-truth timeline.
        """
        timeline = []
        curr_time = self.start_time
        
        total_miles = self.route_details["total_miles"]
        total_driving_hrs = self.route_details["total_driving_hours"]
        
        # Average speed (mph) for distance tracking
        avg_speed = total_miles / total_driving_hrs if total_driving_hrs > 0 else 55.0

        # Drivers clocks
        shift_driving_hrs = 0.0
        shift_window_hrs = 0.0
        driving_since_last_break = 0.0
        miles_since_last_fuel = 0.0
        cumulative_cycle_hrs = self.current_cycle_used_hrs
        miles_completed = 0.0
        remaining_driving_hrs = total_driving_hrs

        # Function to add event to raw timeline
        def add_event(status, duration_hrs, location_label, remarks, event_type="general", lat=None, lng=None, miles_driven=0.0):
            nonlocal curr_time, shift_driving_hrs, shift_window_hrs, driving_since_last_break
            nonlocal miles_since_last_fuel, cumulative_cycle_hrs, miles_completed

            start = curr_time
            end = start + timedelta(hours=duration_hrs)
            curr_time = end

            # Update clocks
            if status == STATUS_DRIVING:
                shift_driving_hrs += duration_hrs
                shift_window_hrs += duration_hrs
                driving_since_last_break += duration_hrs
                miles_since_last_fuel += miles_driven
                miles_completed += miles_driven
                cumulative_cycle_hrs += duration_hrs
            elif status == STATUS_ON_DUTY_ND:
                shift_window_hrs += duration_hrs
                cumulative_cycle_hrs += duration_hrs
            elif status in [STATUS_OFF_DUTY, STATUS_SLEEPER]:
                # If break >= 0.5 hours, it satisfies the 30-min rest break rule
                if duration_hrs >= 0.5:
                    driving_since_last_break = 0.0
                
                # If off-duty is a 10-hr reset or 34-hr restart
                if duration_hrs >= 10.0:
                    shift_driving_hrs = 0.0
                    shift_window_hrs = 0.0
                    driving_since_last_break = 0.0
                
                if duration_hrs >= 34.0:
                    cumulative_cycle_hrs = 0.0

            timeline.append({
                "status": status,
                "status_code": STATUS_MAP[status],
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
                "start_dt": start,
                "end_dt": end,
                "duration_hrs": round(duration_hrs, 2),
                "location_label": location_label,
                "remarks": remarks,
                "event_type": event_type,
                "lat": lat if lat is not None else self.current_loc["lat"],
                "lng": lng if lng is not None else self.current_loc["lng"],
                "miles_driven": round(miles_driven, 1),
                "mile_marker": round(miles_completed, 1),
                "cumulative_cycle_hrs": round(cumulative_cycle_hrs, 2)
            })

        # Check initial 70-hour cycle limit
        if cumulative_cycle_hrs >= 70.0:
            add_event(
                STATUS_OFF_DUTY,
                34.0,
                self.current_loc["display_name"],
                "34-Hour Off-Duty Cycle Restart (70-Hour Limit Reached Prior to Shift)",
                event_type="restart",
                lat=self.current_loc["lat"],
                lng=self.current_loc["lng"]
            )

        # Leg 1: Current -> Pickup (driving if distance > 0)
        leg1_hours = self.route_details["leg1"]["driving_hours"]
        leg1_miles = self.route_details["leg1"]["miles"]
        
        if leg1_hours > 0:
            # Simple driving block for current -> pickup
            add_event(
                STATUS_DRIVING,
                leg1_hours,
                f"En route to Pickup ({self.pickup_loc['display_name']})",
                f"Departed {self.current_loc['display_name']} - Driving to Pickup",
                event_type="driving",
                lat=self.current_loc["lat"],
                lng=self.current_loc["lng"],
                miles_driven=leg1_miles
            )

        # Pickup Stop: 1 hr On-Duty Not Driving
        add_event(
            STATUS_ON_DUTY_ND,
            1.0,
            self.pickup_loc["display_name"],
            f"Arrived at Pickup ({self.pickup_loc['display_name']}) - Loading Cargo (1 Hr On-Duty)",
            event_type="pickup",
            lat=self.pickup_loc["lat"],
            lng=self.pickup_loc["lng"]
        )

        # Leg 2: Pickup -> Dropoff Main Driving Simulation
        leg2_hours = self.route_details["leg2"]["driving_hours"]
        leg2_miles = self.route_details["leg2"]["miles"]
        remaining_leg2_hrs = leg2_hours
        
        # Step through main driving
        step_hrs = 0.25  # 15-minute simulation grain
        
        while remaining_leg2_hrs > 0.001:
            # Determine maximum drive chunk before hitting a rule limit
            
            # Rule A: 30-min break limit (max 8.0 hrs driving since last break)
            hrs_to_30m_break = max(0.0, 8.0 - driving_since_last_break)
            
            # Rule B: 11-hr driving limit per shift
            hrs_to_11h_limit = max(0.0, 11.0 - shift_driving_hrs)
            
            # Rule C: 14-hr duty window limit (driving must occur within 14 hrs of shift start)
            hrs_to_14h_window = max(0.0, 14.0 - shift_window_hrs)
            
            # Rule D: Fuel stop (~1000 miles)
            miles_to_fuel = max(0.0, 1000.0 - miles_since_last_fuel)
            hrs_to_fuel = miles_to_fuel / avg_speed if avg_speed > 0 else 18.0

            # Rule E: 70-hr cycle ceiling (70 - cumulative_cycle_hrs)
            hrs_to_cycle_cap = max(0.0, 70.0 - cumulative_cycle_hrs)

            # Find nearest constraint
            max_drive = min(remaining_leg2_hrs, hrs_to_30m_break, hrs_to_11h_limit, hrs_to_14h_window, hrs_to_fuel, hrs_to_cycle_cap)

            if max_drive > 0.05:  # Drive for max_drive chunk
                drive_miles = max_drive * avg_speed
                # Calculate interpolated position along route for location label
                progress_pct = min(1.0, (leg2_miles - (remaining_leg2_hrs - max_drive) * avg_speed) / max_drive) if leg2_miles > 0 else 1.0
                
                curr_city = self._interpolate_city_name(self.pickup_loc["display_name"], self.dropoff_loc["display_name"], progress_pct)
                
                add_event(
                    STATUS_DRIVING,
                    max_drive,
                    curr_city,
                    f"Driving en route to {self.dropoff_loc['display_name']} ({round(drive_miles, 1)} mi)",
                    event_type="driving",
                    lat=self.pickup_loc["lat"] + (self.dropoff_loc["lat"] - self.pickup_loc["lat"]) * progress_pct,
                    lng=self.pickup_loc["lng"] + (self.dropoff_loc["lng"] - self.pickup_loc["lng"]) * progress_pct,
                    miles_driven=drive_miles
                )
                remaining_leg2_hrs -= max_drive
            else:
                # Limit reached! Determine which constraint was hit and insert required break/reset
                curr_city = self._interpolate_city_name(
                    self.pickup_loc["display_name"],
                    self.dropoff_loc["display_name"],
                    1.0 - (remaining_leg2_hrs / leg2_hours) if leg2_hours > 0 else 1.0
                )
                curr_lat = self.pickup_loc["lat"] + (self.dropoff_loc["lat"] - self.pickup_loc["lat"]) * (1.0 - remaining_leg2_hrs/leg2_hours if leg2_hours > 0 else 1.0)
                curr_lng = self.pickup_loc["lng"] + (self.dropoff_loc["lng"] - self.pickup_loc["lng"]) * (1.0 - remaining_leg2_hrs/leg2_hours if leg2_hours > 0 else 1.0)

                if hrs_to_cycle_cap <= 0.05:
                    # 70-Hour cycle limit reached -> 34-Hour restart
                    add_event(
                        STATUS_OFF_DUTY,
                        34.0,
                        curr_city,
                        "34-Hour Mandatory Off-Duty Restart (70-Hour Cycle Limit Reached)",
                        event_type="restart",
                        lat=curr_lat,
                        lng=curr_lng
                    )
                elif hrs_to_11h_limit <= 0.05 or hrs_to_14h_window <= 0.05:
                    # 11-hr driving cap or 14-hr duty window reached -> 10-hr off-duty reset
                    reason = "11-Hour Driving Limit Reached" if hrs_to_11h_limit <= 0.05 else "14-Hour Duty Window Reached"
                    add_event(
                        STATUS_OFF_DUTY,
                        10.0,
                        curr_city,
                        f"Mandatory 10-Hour Off-Duty Reset ({reason})",
                        event_type="reset",
                        lat=curr_lat,
                        lng=curr_lng
                    )
                elif hrs_to_30m_break <= 0.05:
                    # 30-min rest break required after 8 hrs cumulative driving
                    add_event(
                        STATUS_OFF_DUTY,
                        0.5,
                        curr_city,
                        "Required 30-Minute Rest Break (8-Hour Driving Limit)",
                        event_type="break",
                        lat=curr_lat,
                        lng=curr_lng
                    )
                elif hrs_to_fuel <= 0.05:
                    # Fuel stop required every 1,000 miles
                    add_event(
                        STATUS_ON_DUTY_ND,
                        0.5,
                        curr_city,
                        f"Fuel Stop - On-Duty Not Driving ({round(miles_since_last_fuel)} mi since last fuel)",
                        event_type="fuel",
                        lat=curr_lat,
                        lng=curr_lng
                    )
                    miles_since_last_fuel = 0.0

        # Dropoff Stop: 1 hr On-Duty Not Driving
        add_event(
            STATUS_ON_DUTY_ND,
            1.0,
            self.dropoff_loc["display_name"],
            f"Arrived at Dropoff ({self.dropoff_loc['display_name']}) - Unloading Cargo (1 Hr On-Duty)",
            event_type="dropoff",
            lat=self.dropoff_loc["lat"],
            lng=self.dropoff_loc["lng"]
        )

        # Final Post-Trip Off-Duty block to complete trip timeline
        add_event(
            STATUS_OFF_DUTY,
            1.0,
            self.dropoff_loc["display_name"],
            f"Post-Trip Inspection & Released Off-Duty at {self.dropoff_loc['display_name']}",
            event_type="post_trip",
            lat=self.dropoff_loc["lat"],
            lng=self.dropoff_loc["lng"]
        )

        return timeline

    def _interpolate_city_name(self, start_name, end_name, pct):
        """Generate a realistic intermediate highway stop location label."""
        if pct <= 0.15:
            return f"Near {start_name}"
        elif pct >= 0.85:
            return f"Approaching {end_name}"
        else:
            return f"I-80/I-90 Highway Rest Area (en route to {end_name})"

    def generate_daily_logs(self, timeline):
        """
        Split continuous timeline into discrete 24-hour calendar days (midnight to midnight).
        Ensures each full 24-hr day's category totals sum to EXACTLY 24.0 hours.
        """
        if not timeline:
            return []

        daily_logs = []
        
        # Determine date range covered
        first_dt = timeline[0]["start_dt"]
        last_dt = timeline[-1]["end_dt"]
        
        start_day = datetime(first_dt.year, first_dt.month, first_dt.day, 0, 0, 0)
        end_day = datetime(last_dt.year, last_dt.month, last_dt.day, 0, 0, 0) + timedelta(days=1)
        
        curr_day_start = start_day
        
        while curr_day_start < end_day:
            curr_day_end = curr_day_start + timedelta(days=1)
            date_str = curr_day_start.strftime("%m/%d/%Y")
            
            day_entries = []
            totals = {
                STATUS_OFF_DUTY: 0.0,
                STATUS_SLEEPER: 0.0,
                STATUS_DRIVING: 0.0,
                STATUS_ON_DUTY_ND: 0.0
            }
            miles_driven_today = 0.0
            remarks = []

            for ev in timeline:
                # Check overlap with [curr_day_start, curr_day_end]
                overlap_start = max(curr_day_start, ev["start_dt"])
                overlap_end = min(curr_day_end, ev["end_dt"])
                
                if overlap_start < overlap_end:
                    dur_hrs = (overlap_end - overlap_start).total_seconds() / 3600.0
                    status = ev["status"]
                    
                    totals[status] += dur_hrs
                    
                    if status == STATUS_DRIVING:
                        # Proportion of miles driven in this sub-segment
                        if ev["duration_hrs"] > 0:
                            miles_today_part = ev["miles_driven"] * (dur_hrs / ev["duration_hrs"])
                            miles_driven_today += miles_today_part

                    # Record remark for status transition
                    start_minute = (overlap_start - curr_day_start).total_seconds() / 60.0
                    time_lbl = overlap_start.strftime("%I:%M %p")
                    remarks.append({
                        "time": time_lbl,
                        "minute_of_day": round(start_minute, 1),
                        "status": status,
                        "location": ev["location_label"],
                        "remark": ev["remarks"]
                    })

                    day_entries.append({
                        "status": status,
                        "status_code": ev["status_code"],
                        "start_time": overlap_start.isoformat(),
                        "end_time": overlap_end.isoformat(),
                        "start_minute": (overlap_start - curr_day_start).total_seconds() / 60.0,
                        "end_minute": (overlap_end - curr_day_start).total_seconds() / 60.0,
                        "duration_hrs": round(dur_hrs, 2),
                        "location": ev["location_label"],
                        "remarks": ev["remarks"]
                    })

            # Round totals cleanly to sum to 24.0
            total_sum = sum(totals.values())
            if day_entries and abs(total_sum - 24.0) > 0.001 and total_sum > 0:
                # Normalize so sum is exactly 24.0
                ratio = 24.0 / total_sum
                totals = {k: round(v * ratio, 2) for k, v in totals.items()}
                # Adjust minor rounding difference on largest category
                diff = 24.0 - sum(totals.values())
                largest_cat = max(totals, key=totals.get)
                totals[largest_cat] = round(totals[largest_cat] + diff, 2)

            daily_logs.append({
                "date": date_str,
                "day_number": len(daily_logs) + 1,
                "is_full_day": True,
                "total_miles_today": round(miles_driven_today, 1),
                "carrier_name": "Antigravity Express Logistics Inc.",
                "main_office_address": "100 Logistics Pkwy, Chicago, IL 60601",
                "truck_number": "TRK-9042 / TRL-8810",
                "driver_name": "John Doe (CDL-A)",
                "entries": day_entries,
                "totals": totals,
                "total_hours": sum(totals.values()),
                "remarks": remarks
            })

            curr_day_start = curr_day_end

        return daily_logs

    def build_full_plan(self):
        """Execute simulation and return comprehensive response dictionary."""
        raw_timeline = self.generate_timeline()
        daily_logs = self.generate_daily_logs(raw_timeline)

        # Extract stop markers for map
        stops = []
        seen_locations = set()
        
        # Add Current Location
        stops.append({
            "type": "current",
            "label": "Current Location",
            "location_name": self.current_loc["display_name"],
            "lat": self.current_loc["lat"],
            "lng": self.current_loc["lng"]
        })
        
        # Add Pickup Location
        stops.append({
            "type": "pickup",
            "label": "Pickup Location (1 Hr On-Duty)",
            "location_name": self.pickup_loc["display_name"],
            "lat": self.pickup_loc["lat"],
            "lng": self.pickup_loc["lng"]
        })

        # Add En-Route Stops (Breaks, Resets, Fuel)
        for ev in raw_timeline:
            if ev["event_type"] in ["break", "reset", "restart", "fuel"]:
                stop_key = f"{ev['event_type']}_{ev['lat']}_{ev['lng']}"
                if stop_key not in seen_locations:
                    seen_locations.add(stop_key)
                    stops.append({
                        "type": ev["event_type"],
                        "label": f"{ev['status']} ({ev['duration_hrs']} hrs)",
                        "location_name": ev["location_label"],
                        "remarks": ev["remarks"],
                        "lat": ev["lat"],
                        "lng": ev["lng"],
                        "time": ev["start_dt"].strftime("%m/%d %I:%M %p")
                    })

        # Add Dropoff Location
        stops.append({
            "type": "dropoff",
            "label": "Dropoff Location (1 Hr On-Duty)",
            "location_name": self.dropoff_loc["display_name"],
            "lat": self.dropoff_loc["lat"],
            "lng": self.dropoff_loc["lng"]
        })

        total_trip_duration_hrs = (raw_timeline[-1]["end_dt"] - raw_timeline[0]["start_dt"]).total_seconds() / 3600.0

        return {
            "inputs": {
                "current_location": self.current_loc["display_name"],
                "pickup_location": self.pickup_loc["display_name"],
                "dropoff_location": self.dropoff_loc["display_name"],
                "current_cycle_used_hrs": self.current_cycle_used_hrs
            },
            "summary": {
                "total_miles": self.route_details["total_miles"],
                "total_driving_hours": self.route_details["total_driving_hours"],
                "total_trip_duration_hours": round(total_trip_duration_hrs, 2),
                "total_days_required": len(daily_logs),
                "final_cycle_hours_used": raw_timeline[-1]["cumulative_cycle_hrs"]
            },
            "route": {
                "polyline": self.route_details["polyline"],
                "current": self.current_loc,
                "pickup": self.pickup_loc,
                "dropoff": self.dropoff_loc
            },
            "stops": stops,
            "timeline": [{
                "status": ev["status"],
                "status_code": ev["status_code"],
                "start_time": ev["start_time"],
                "end_time": ev["end_time"],
                "duration_hrs": ev["duration_hrs"],
                "location_label": ev["location_label"],
                "remarks": ev["remarks"],
                "event_type": ev["event_type"]
            } for ev in raw_timeline],
            "daily_logs": daily_logs
        }
