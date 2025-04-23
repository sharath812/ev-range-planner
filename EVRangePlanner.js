
// EV Range Planner with Google Maps Autocomplete (React + AWS SDK + Amazon Location Service)

import React, { useState, useRef, useEffect } from 'react';
import { LocationClient, CalculateRouteCommand } from '@aws-sdk/client-location';

const client = new LocationClient({ region: 'us-east-1' }); // Change to your AWS Region

export default function EVRangePlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const isScriptLoaded = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!window.google && !isScriptLoaded) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC_BCvOhh-R72BNEVJk_pap3MaYrW4tJh0&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.body.appendChild(script);
      } else if (window.google) {
        initAutocomplete();
      }
    };

    const initAutocomplete = () => {
      const originAutocomplete = new window.google.maps.places.Autocomplete(originRef.current);
      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const loc = place.geometry.location;
          setOrigin(`${loc.lat()},${loc.lng()}`);
        }
      });

      const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationRef.current);
      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const loc = place.geometry.location;
          setDestination(`${loc.lat()},${loc.lng()}`);
        }
      });
    };

    loadGoogleMapsScript();
  }, []);

  const handleRoute = async () => {
    try {
      const input = {
        CalculatorName: 'MyRouteCalculator', // Replace with your actual route calculator name
        DeparturePosition: origin.split(',').map(Number),
        DestinationPosition: destination.split(',').map(Number),
        TravelMode: 'Car',
      };

      const command = new CalculateRouteCommand(input);
      const response = await client.send(command);

      const distKm = response.Summary.Distance;
      setDistance(distKm);
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">EV Range Planner</h1>

      <div>
        <label>Origin:</label>
        <input
          ref={originRef}
          type="text"
          className="w-full border p-2 mt-1"
          placeholder="Enter starting location"
        />
      </div>

      <div>
        <label>Destination:</label>
        <input
          ref={destinationRef}
          type="text"
          className="w-full border p-2 mt-1"
          placeholder="Enter destination"
        />
      </div>

      <button onClick={handleRoute} className="bg-blue-500 text-white p-2 rounded">
        Calculate Route
      </button>

      {distance && (
        <div className="mt-4 text-green-700">
          <p>Total Distance: {distance.toFixed(2)} km</p>
          <p>Estimated Stops: {(distance / 300).toFixed(0)} (Assuming 300km range)</p>
        </div>
      )}
    </div>
  );
}
