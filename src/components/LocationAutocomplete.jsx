import React, { useState, useEffect, useRef } from 'react';
import './LocationAutocomplete.css';
import { indianCities } from '../data/lawyersData';

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Enter city name...",
  defaultValue = "Bangalore",
  required = false,
  id = "location",
  name = "location"
}) => {
  const [inputValue, setInputValue] = useState(value || defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allCities, setAllCities] = useState(indianCities);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch database locations and merge with Indian cities
  useEffect(() => {
    fetchAndMergeLocations();
  }, []);

  const fetchAndMergeLocations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const baseURL = API_URL.replace(/\/$/, '');
      const endpoint = baseURL.includes('/api') ? `${baseURL}/locations` : `${baseURL}/api/locations`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success && data.locations && data.locations.length > 0) {
        // Merge database locations with Indian cities, removing duplicates
        const merged = [...new Set([...data.locations, ...indianCities])];
        merged.sort();
        setAllCities(merged);
        console.log(`✅ LocationAutocomplete: Merged ${data.locations.length} DB locations with ${indianCities.length} Indian cities`);
      }
    } catch (error) {
      console.error('Error fetching locations for autocomplete:', error);
      // Keep using indianCities as fallback
    }
  };

  // Update input value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter cities based on input
    const filtered = allCities.filter(city =>
      city.toLowerCase().includes(newValue.toLowerCase())
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (city) => {
    setInputValue(city);
    onChange(city);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.trim() !== '') {
      const filtered = allCities.filter(city =>
        city.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  return (
    <div className="location-autocomplete" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((city, index) => (
            <li
              key={city}
              className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => handleSuggestionClick(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="location-icon">📍</span>
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
