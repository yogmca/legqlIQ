import React, { useState } from 'react';
import './FilterSection.css';
import { specializations, locations } from '../data/lawyersData';
import LocationAutocomplete from './LocationAutocomplete';

const FilterSection = ({
  selectedSpecialization,
  selectedLocation,
  onSpecializationChange,
  onLocationChange,
  onReset
}) => {
  const [useAutocomplete, setUseAutocomplete] = useState(false);

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
          {specializations.map((spec, index) => (
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
            <select
              id="location-filter"
              className="filter-select"
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            >
              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
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
