export const PRESET_TRIPS = [
  {
    id: 'preset-short',
    title: 'Short Regional Route',
    subtitle: '< 11 Hrs Driving (Chicago → Springfield → St. Louis)',
    current_location: 'Chicago, IL',
    pickup_location: 'Springfield, IL',
    dropoff_location: 'St. Louis, MO',
    current_cycle_used_hrs: 12.5,
    tag: 'Single Day'
  },
  {
    id: 'preset-medium',
    title: 'Medium Interstate Route',
    subtitle: '> 8 Hrs Driving (30-Min Rest Break Required)',
    current_location: 'Chicago, IL',
    pickup_location: 'Indianapolis, IN',
    dropoff_location: 'Atlanta, GA',
    current_cycle_used_hrs: 24.0,
    tag: '30-Min Break'
  },
  {
    id: 'preset-long',
    title: 'Cross-Country (>1,000 Mi)',
    subtitle: 'Multi-Day + Fuel Stops + 10-Hr Resets',
    current_location: 'Chicago, IL',
    pickup_location: 'Denver, CO',
    dropoff_location: 'Los Angeles, CA',
    current_cycle_used_hrs: 35.0,
    tag: 'Multi-Day & Fuel'
  },
  {
    id: 'preset-edge-cycle',
    title: 'High Cycle Hours Edge Case',
    subtitle: 'Near 70-Hr Ceiling (Requires 34-Hr Restart)',
    current_location: 'Chicago, IL',
    pickup_location: 'St. Louis, MO',
    dropoff_location: 'Dallas, TX',
    current_cycle_used_hrs: 67.5,
    tag: '70-Hr Restart'
  }
];
