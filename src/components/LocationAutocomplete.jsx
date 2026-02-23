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
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

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
    const filtered = indianCities.filter(city =>
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
      const filtered = indianCities.filter(city =>
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
