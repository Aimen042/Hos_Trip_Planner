import axios from 'axios';

// In production (Vercel), set VITE_API_BASE_URL in the frontend project's
// Environment Variables to your deployed backend URL, e.g.
// https://your-backend-project.vercel.app/api
// Falls back to localhost for local development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const planTrip = async (tripData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/plan-trip/`, {
      current_location: tripData.current_location,
      pickup_location: tripData.pickup_location,
      dropoff_location: tripData.dropoff_location,
      current_cycle_used_hrs: parseFloat(tripData.current_cycle_used_hrs),
      driver_name: tripData.driver_name || '',
      carrier_name: tripData.carrier_name || '',
      main_office_address: tripData.main_office_address || '',
      truck_number: tripData.truck_number || '',
      home_terminal_address: tripData.home_terminal_address || ''
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || error.response.data.message || 'Failed to calculate trip plan.');
    }
    throw new Error('Server connection error. Please ensure Django backend is running.');
  }
};
