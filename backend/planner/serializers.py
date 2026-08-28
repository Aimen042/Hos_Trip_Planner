from rest_framework import serializers

class TripPlanRequestSerializer(serializers.Serializer):
    current_location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        help_text="Driver's current location (e.g. 'Chicago, IL')"
    )
    pickup_location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        help_text="Cargo pickup location (e.g. 'St. Louis, MO')"
    )
    dropoff_location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        help_text="Cargo dropoff location (e.g. 'Dallas, TX')"
    )
    current_cycle_used_hrs = serializers.FloatField(
        required=True,
        min_value=0.0,
        max_value=70.0,
        help_text="Hours accumulated in the driver's 70-hour / 8-day cycle (0 - 70 hrs)"
    )

    # Driver & carrier details entered on the Driver Details screen.
    # These are printed verbatim on the FMCSA Daily Log Sheets, so they must
    # come from the user instead of being hardcoded in the calculator.
    driver_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="",
        help_text="Name of the driver (e.g. 'John Doe (CDL-A)')"
    )
    carrier_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="",
        help_text="Name of the motor carrier"
    )
    main_office_address = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="",
        help_text="Carrier's main office address"
    )
    truck_number = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="",
        help_text="Truck/trailer numbers"
    )
    home_terminal_address = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="",
        help_text="Driver's home terminal address"
    )

    def validate_current_cycle_used_hrs(self, value):
        if value < 0 or value > 70.0:
            raise serializers.ValidationError("Current cycle hours must be between 0.0 and 70.0 hours.")
        return value
