import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const planTrip = async (tripData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/plan-trip/`, {
      current_location: tripData.current_location,
      pickup_location: tripData.pickup_location,
      dropoff_location: tripData.dropoff_location,
      current_cycle_used_hrs: parseFloat(tripData.current_cycle_used_hrs)
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || error.response.data.message || 'Failed to calculate trip plan.');
    }
    throw new Error('Server connection error. Please ensure Django backend is running.');
  }
};
