import React, { useState, useEffect } from 'react';
import './SearchBar.css';

// ============================================
// GEOCODING SERVICE CONFIGURATION
// ============================================
// Easy switch between FREE and GOOGLE services
const GEOCODING_CONFIG = {
  // Change this to 'google' when you want to use Google services
  provider: 'free', // Options: 'free' or 'google'
  
  // Google API Key (add when switching to Google)
  googleApiKey: '', // Get from: https://console.cloud.google.com/
  
  // Free services (no API key needed)
  freeServices: {
    primary: 'nominatim', // OpenStreetMap
    fallback: 'bigdatacloud'
  }
};

// ============================================
// CITY NAME MAPPING
// ============================================
// Map official city names to common database names
const CITY_NAME_MAPPING = {
  'Bengaluru': 'Bangalore',
  'Mumbai': 'Bombay',
  'Kolkata': 'Calcutta',
  'Chennai': 'Madras',
  'Thiruvananthapuram': 'Trivandrum',
  'Kochi': 'Cochin',
  'Kozhikode': 'Calicut',
  'Mysuru': 'Mysore',
  'Hubballi': 'Hubli',
  'Belagavi': 'Belgaum',
  'Mangaluru': 'Mangalore',
  'Shivamogga': 'Shimoga',
  'Tumakuru': 'Tumkur',
  'Ballari': 'Bellary',
  'Vijayapura': 'Bijapur',
  'Kalaburagi': 'Gulbarga',
  'Puducherry': 'Pondicherry',
  'Visakhapatnam': 'Vizag',
  'Thiruchirapalli': 'Trichy',
  'Coimbatore': 'Coimbatore',
  'Pune': 'Poona'
};

// Normalize city name to match database
const normalizeCityName = (cityName) => {
  if (!cityName) return '';
  
  // Check if city has a common name mapping
  const normalizedName = CITY_NAME_MAPPING[cityName] || cityName;
  
  console.log(`🗺️ City normalized: "${cityName}" → "${normalizedName}"`);
  return normalizedName;
};

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [detectedCity, setDetectedCity] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Detect user's location on component mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    setIsDetecting(true);
    setLocationError('');

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsDetecting(false);
      return;
    }

    try {
      // Get user's coordinates
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Location detected:', latitude, longitude);

          // Reverse geocode to get city name
          const city = await reverseGeocode(latitude, longitude);
          
          if (city) {
            // Normalize city name to match database (e.g., Bengaluru → Bangalore)
            const normalizedCity = normalizeCityName(city);
            
            setDetectedCity(normalizedCity);
            // Auto-fill search with normalized city name
            if (!searchTerm) {
              onSearchChange(normalizedCity);
            }
            console.log('🏙️ Detected city:', city, '→ Normalized:', normalizedCity);
          }
          
          setIsDetecting(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError(getLocationErrorMessage(error.code));
          setIsDetecting(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } catch (error) {
      console.error('Error detecting location:', error);
      setLocationError('Failed to detect location');
      setIsDetecting(false);
    }
  };

  // ============================================
  // REVERSE GEOCODING - SMART PROVIDER SELECTION
  // ============================================
  const reverseGeocode = async (latitude, longitude) => {
    // Choose geocoding provider based on configuration
    if (GEOCODING_CONFIG.provider === 'google' && GEOCODING_CONFIG.googleApiKey) {
      return await reverseGeocodeGoogle(latitude, longitude);
    } else {
      return await reverseGeocodeFree(latitude, longitude);
    }
  };

  // ============================================
  // GOOGLE GEOCODING (Premium - Requires API Key)
  // ============================================
  const reverseGeocodeGoogle = async (latitude, longitude) => {
    try {
      console.log('🌐 Using Google Geocoding API');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GEOCODING_CONFIG.googleApiKey}&result_type=locality|administrative_area_level_2`
      );

      if (!response.ok) {
        throw new Error('Google Geocoding failed');
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        // Extract city from Google's response
        const addressComponents = data.results[0].address_components;
        
        // Look for locality (city) or administrative_area_level_2 (district)
        const cityComponent = addressComponents.find(
          component => component.types.includes('locality') ||
                      component.types.includes('administrative_area_level_2')
        );
        
        return cityComponent?.long_name || '';
      }
      
      throw new Error('No results from Google');
    } catch (error) {
      console.error('Google geocoding error:', error);
      console.log('⚠️ Falling back to free service');
      // Fallback to free service if Google fails
      return await reverseGeocodeFree(latitude, longitude);
    }
  };

  // ============================================
  // FREE GEOCODING (No API Key Required)
  // ============================================
  const reverseGeocodeFree = async (latitude, longitude) => {
    try {
      console.log('🆓 Using Free Geocoding (OpenStreetMap)');
      
      // Primary: OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LegalIQ/1.0' // Required by Nominatim
          }
        }
      );

      if (!response.ok) {
        throw new Error('Nominatim failed');
      }

      const data = await response.json();
      
      // Extract city name from response
      const city = data.address?.city ||
                   data.address?.town ||
                   data.address?.village ||
                   data.address?.state_district ||
                   data.address?.state ||
                   '';

      if (city) {
        return city;
      }
      
      throw new Error('No city found in Nominatim response');
    } catch (error) {
      console.error('Nominatim error:', error);
      
      // Fallback: BigDataCloud (also free)
      try {
        console.log('🔄 Trying fallback service (BigDataCloud)');
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        return data.city || data.locality || '';
      } catch (fallbackError) {
        console.error('Fallback geocoding error:', fallbackError);
        return '';
      }
    }
  };

  const getLocationErrorMessage = (code) => {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Location access denied';
      case 2: // POSITION_UNAVAILABLE
        return 'Location unavailable';
      case 3: // TIMEOUT
        return 'Location request timeout';
      default:
        return 'Location error';
    }
  };

  const handleLocationButtonClick = () => {
    detectUserLocation();
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={
            isDetecting
              ? "Detecting your location..."
              : detectedCity
                ? `Search in ${detectedCity} or enter location...`
                : "Search by name, location, specialization, or keywords..."
          }
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        
        {/* Location detect button */}
        <button
          className="location-button"
          onClick={handleLocationButtonClick}
          disabled={isDetecting}
          title={detectedCity ? `Current location: ${detectedCity}` : 'Detect my location'}
          style={{
            position: 'absolute',
            right: searchTerm ? '45px' : '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: isDetecting ? 'wait' : 'pointer',
            fontSize: '20px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDetecting ? 0.5 : 1,
            transition: 'opacity 0.3s'
          }}
        >
          {isDetecting ? '⏳' : detectedCity ? '📍' : '📌'}
        </button>

        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Location status message */}
      {(detectedCity || locationError) && (
        <div style={{
          fontSize: '12px',
          marginTop: '5px',
          padding: '5px 10px',
          borderRadius: '4px',
          background: detectedCity ? '#e8f5e9' : '#ffebee',
          color: detectedCity ? '#2e7d32' : '#c62828',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          {detectedCity && (
            <>
              <span>✅</span>
              <span>Showing professionals near <strong>{detectedCity}</strong></span>
            </>
          )}
          {locationError && (
            <>
              <span>⚠️</span>
              <span>{locationError}. Please enter location manually.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
