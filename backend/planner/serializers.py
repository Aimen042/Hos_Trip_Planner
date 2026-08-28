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

    def validate_current_cycle_used_hrs(self, value):
        if value < 0 or value > 70.0:
            raise serializers.ValidationError("Current cycle hours must be between 0.0 and 70.0 hours.")
        return value
