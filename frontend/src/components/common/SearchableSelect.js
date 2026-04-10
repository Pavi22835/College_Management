import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX, FiSearch } from 'react-icons/fi';
import './SearchableSelect.css';

const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  hint = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  return (
    <div className="searchable-select-wrapper" ref={containerRef}>
      {label && (
        <label className="searchable-select-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className={`searchable-select-box ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
        <div className="select-trigger" onClick={handleToggle}>
          {isOpen ? (
            <div className="search-wrapper">
              <FiSearch size={16} className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-field"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <span className={`selected-value ${!value ? 'empty' : ''}`}>
              {value || placeholder}
            </span>
          )}
          
          <div className="trigger-actions">
            {value && !isOpen && (
              <button
                type="button"
                className="clear-icon"
                onClick={handleClear}
                title="Clear"
              >
                <FiX size={16} />
              </button>
            )}
            <FiChevronDown size={16} className={`toggle-icon ${isOpen ? 'open' : ''}`} />
          </div>
        </div>

        {isOpen && (
          <div className="select-dropdown">
            {filteredOptions.length > 0 ? (
              <div className="dropdown-list">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`dropdown-item ${value === option ? 'active' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option}</span>
                    {value === option && <span className="checkmark">✓</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">No options available</div>
            )}
          </div>
        )}
      </div>

      {hint && <div className="select-hint">{hint}</div>}
    </div>
  );
};

export default SearchableSelect;
