import React, { useState, useEffect } from 'react';
import './FilterSection.css';
import { specializations, locations as defaultLocations, indianCities } from '../data/lawyersData';
import LocationAutocomplete from './LocationAutocomplete';
import CustomDropdown from './CustomDropdown';

const FilterSection = ({
  selectedSpecialization,
  selectedLocation,
  onSpecializationChange,
  onLocationChange,
  onReset,
  professionalType = 'lawyer'
}) => {
  const [useAutocomplete, setUseAutocomplete] = useState(false);
  const [locations, setLocations] = useState(defaultLocations);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch locations from database on component mount
  useEffect(() => {
    fetchLocationsFromDB();
  }, []);

  const fetchLocationsFromDB = async () => {
    setLoadingLocations(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      // Remove trailing slash if present
      const baseURL = API_URL.replace(/\/$/, '');
      // Check if API_URL already includes /api
      const endpoint = baseURL.includes('/api') ? `${baseURL}/locations` : `${baseURL}/api/locations`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success && data.locations && data.locations.length > 0) {
        // Merge database locations with Indian cities, removing duplicates
        const dbLocs = data.locations;
        const allCities = [...new Set([...dbLocs, ...indianCities])];
        // Sort alphabetically
        allCities.sort();
        // Add "All Locations" at the beginning
        const finalLocations = ['All Locations', ...allCities];
        setLocations(finalLocations);
        console.log(`✅ Loaded ${dbLocs.length} locations from database, merged with ${indianCities.length} Indian cities`);
      } else {
        // Use default locations if database fetch fails
        console.log('⚠️ Using default locations');
        setLocations(defaultLocations);
      }
    } catch (error) {
      console.error('Error fetching locations from database:', error);
      // Use default locations on error
      setLocations(defaultLocations);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Get specializations based on professional type
  const getSpecializations = () => {
    switch(professionalType) {
      case 'tax-consultant':
        return [
          'All Specializations',
          'Income Tax',
          'GST',
          'Corporate Tax',
          'International Tax',
          'Tax Planning',
          'Tax Audit',
          'Transfer Pricing',
          'Indirect Tax'
        ];
      case 'auditor':
        return [
          'All Specializations',
          'Statutory Audit',
          'Internal Audit',
          'Tax Audit',
          'Forensic Audit',
          'Information Systems Audit',
          'Compliance Audit',
          'Operational Audit',
          'Financial Audit'
        ];
      default:
        return specializations; // Lawyer specializations
    }
  };

  const currentSpecializations = getSpecializations();

  return (
    <div className="filter-section">
      <div className="filter-group">
        <label htmlFor="specialization-filter" className="filter-label">
          ⚖️ Specialization:
        </label>
        <select
          id="specialization-filter"
          className="filter-select"
          value={selectedSpecialization}
          onChange={(e) => onSpecializationChange(e.target.value)}
        >
          {currentSpecializations.map((spec, index) => (
            <option key={index} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="location-filter" className="filter-label">
          📍 Location:
        </label>
        <div className="location-filter-wrapper">
          {!useAutocomplete ? (
            <CustomDropdown
              id="location-filter"
              value={selectedLocation}
              onChange={onLocationChange}
              options={locations}
              placeholder="Select location..."
            />
          ) : (
            <LocationAutocomplete
              value={selectedLocation === 'All Locations' ? '' : selectedLocation}
              onChange={onLocationChange}
              placeholder="Type city name..."
              defaultValue="Bangalore"
              id="location-filter"
              name="location"
            />
          )}
          <button
            type="button"
            className="toggle-autocomplete-btn"
            onClick={() => setUseAutocomplete(!useAutocomplete)}
            title={useAutocomplete ? "Switch to dropdown" : "Search other cities"}
          >
            {useAutocomplete ? '📋' : '🔍'}
          </button>
        </div>
      </div>

      <button className="reset-btn" onClick={onReset}>
        🔄 Reset Filters
      </button>
    </div>
  );
};

export default FilterSection;
