from django.test import TestCase
from datetime import datetime
from planner.services.hos_calculator import HOSCalculator, STATUS_OFF_DUTY, STATUS_SLEEPER, STATUS_DRIVING, STATUS_ON_DUTY_ND


class HOSCalculatorTestCase(TestCase):
    def setUp(self):
        self.curr_loc = {"lat": 41.8781, "lng": -87.6298, "display_name": "Chicago, IL"}
        self.pickup_loc = {"lat": 38.6270, "lng": -90.1994, "display_name": "St. Louis, MO"}
        self.dropoff_loc = {"lat": 32.7767, "lng": -96.7970, "display_name": "Dallas, TX"}
        self.start_dt = datetime(2026, 8, 26, 6, 0, 0)

    def test_short_trip_under_11h(self):
        """Short trip (< 11h driving) -> 1 log sheet, no forced breaks."""
        route_details = {
            "total_miles": 300.0,
            "total_driving_hours": 5.5,
            "leg1": {"miles": 50.0, "driving_hours": 1.0},
            "leg2": {"miles": 250.0, "driving_hours": 4.5},
            "polyline": [[41.87, -87.62], [38.62, -90.19], [32.77, -96.79]]
        }
        calc = HOSCalculator(self.curr_loc, self.pickup_loc, self.dropoff_loc, 10.0, route_details, self.start_dt)
        plan = calc.build_full_plan()

        # Check total daily logs
        self.assertGreaterEqual(len(plan["daily_logs"]), 1)
        # Check totals sum to 24.0 for full days
        for log in plan["daily_logs"]:
            if log["is_full_day"]:
                self.assertAlmostEqual(log["total_hours"], 24.0, delta=0.01)

    def test_medium_trip_requiring_30min_break(self):
        """Trip with > 8 hrs driving requires a 30-min break."""
        route_details = {
            "total_miles": 550.0,
            "total_driving_hours": 9.5,
            "leg1": {"miles": 0.0, "driving_hours": 0.0},
            "leg2": {"miles": 550.0, "driving_hours": 9.5},
            "polyline": [[41.87, -87.62], [32.77, -96.79]]
        }
        calc = HOSCalculator(self.curr_loc, self.pickup_loc, self.dropoff_loc, 0.0, route_details, self.start_dt)
        plan = calc.build_full_plan()

        # Check that a 30-min break event exists in timeline
        break_events = [ev for ev in plan["timeline"] if ev["event_type"] == "break"]
        self.assertGreaterEqual(len(break_events), 1)

    def test_long_trip_requiring_10hr_reset(self):
        """Long trip (> 11h driving) requires 10-hr off-duty reset."""
        route_details = {
            "total_miles": 900.0,
            "total_driving_hours": 16.0,
            "leg1": {"miles": 0.0, "driving_hours": 0.0},
            "leg2": {"miles": 900.0, "driving_hours": 16.0},
            "polyline": [[41.87, -87.62], [32.77, -96.79]]
        }
        calc = HOSCalculator(self.curr_loc, self.pickup_loc, self.dropoff_loc, 15.0, route_details, self.start_dt)
        plan = calc.build_full_plan()

        # Check that 10-hr reset event exists
        reset_events = [ev for ev in plan["timeline"] if ev["event_type"] == "reset"]
        self.assertGreaterEqual(len(reset_events), 1)
        self.assertGreater(len(plan["daily_logs"]), 1)

    def test_fuel_stop_insertion_over_1000_miles(self):
        """Trip > 1,000 miles requires fuel stops."""
        route_details = {
            "total_miles": 1400.0,
            "total_driving_hours": 24.0,
            "leg1": {"miles": 0.0, "driving_hours": 0.0},
            "leg2": {"miles": 1400.0, "driving_hours": 24.0},
            "polyline": [[41.87, -87.62], [32.77, -96.79]]
        }
        calc = HOSCalculator(self.curr_loc, self.pickup_loc, self.dropoff_loc, 0.0, route_details, self.start_dt)
        plan = calc.build_full_plan()

        # Check fuel stops exist
        fuel_events = [ev for ev in plan["timeline"] if ev["event_type"] == "fuel"]
        self.assertGreaterEqual(len(fuel_events), 1)

    def test_cycle_limit_70hr_enforcement(self):
        """High starting cycle hours (e.g. 68h) triggers 34-hr restart."""
        route_details = {
            "total_miles": 400.0,
            "total_driving_hours": 7.0,
            "leg1": {"miles": 0.0, "driving_hours": 0.0},
            "leg2": {"miles": 400.0, "driving_hours": 7.0},
            "polyline": [[41.87, -87.62], [32.77, -96.79]]
        }
        calc = HOSCalculator(self.curr_loc, self.pickup_loc, self.dropoff_loc, 68.5, route_details, self.start_dt)
        plan = calc.build_full_plan()

        # 68.5 + 1.0 (pickup) = 69.5 hrs. Driving 7 hrs will cross 70.0 hrs -> must trigger 34-hr restart
        restart_events = [ev for ev in plan["timeline"] if ev["event_type"] == "restart"]
        self.assertGreaterEqual(len(restart_events), 1)
