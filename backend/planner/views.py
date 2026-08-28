from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

from .serializers import TripPlanRequestSerializer
from .services.routing_service import geocode_location, get_route_details
from .services.hos_calculator import HOSCalculator

logger = logging.getLogger(__name__)


class PlanTripAPIView(APIView):
    """
    POST /api/plan-trip/
    Takes current_location, pickup_location, dropoff_location, and current_cycle_used_hrs.
    Returns calculated route, map stops, and FMCSA-compliant Daily Log Sheets.
    """
    def post(self, request, *args, **kwargs):
        serializer = TripPlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "error": "Invalid trip request inputs",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        curr_str = data["current_location"]
        pickup_str = data["pickup_location"]
        dropoff_str = data["dropoff_location"]
        cycle_used_hrs = data["current_cycle_used_hrs"]

        try:
            # 1. Geocode locations
            curr_loc = geocode_location(curr_str)
            pickup_loc = geocode_location(pickup_str)
            dropoff_loc = geocode_location(dropoff_str)

            # 2. Get route details (distance, duration, polyline)
            route_details = get_route_details(curr_loc, pickup_loc, dropoff_loc)

            # 3. Calculate HOS duty timeline & Daily Logs
            calculator = HOSCalculator(
                current_loc=curr_loc,
                pickup_loc=pickup_loc,
                dropoff_loc=dropoff_loc,
                current_cycle_used_hrs=cycle_used_hrs,
                route_details=route_details
            )

            plan_result = calculator.build_full_plan()

            return Response(plan_result, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error calculating trip plan: {e}", exc_info=True)
            return Response({
                "error": "Failed to process trip plan calculation.",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
