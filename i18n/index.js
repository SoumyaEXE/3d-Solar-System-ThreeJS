// i18n/index.js - Main Internationalization Logic

let currentLanguage = 'en';
let translations = {};

// Load translation files
import { en } from './en.js';
import { fr } from './fr.js';

// Initialize translations
translations = { en, fr };

// Get current language from localStorage or default to English
export function getCurrentLanguage() {
  return localStorage.getItem('solarSystemLanguage') || 'en';
}

// Set language and save to localStorage
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('solarSystemLanguage', lang);
    document.documentElement.lang = lang;
    return true;
  }
  return false;
}

// Get nested translation by key path (e.g., 'ui.controls.pause')
export function t(key, params = {}) {
  //console.log('t() called with key:', key, 'current language:', currentLanguage);
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations['en'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          console.warn(`Translation key "${key}" not found in ${currentLanguage} or English`);
          return key; // Return key as fallback
        }
      }
      break;
    }
  }
  
  // Handle parameter substitution
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  return value || key;
}

// Format numbers according to locale
export function formatNumber(number, decimals = 0) {
  const locale = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

// Format time periods with proper pluralization
export function formatTimePeriod(value, unit) {
  const rounded = Math.round(value);
  const yearsText = t('units.years');
  const daysText = t('units.days');

  if (unit === 'years') {
    return `${formatNumber(rounded)} ${yearsText}`;
  } else if (unit === 'days') {
    return `${formatNumber(rounded)} ${daysText}`;
  }

  return `${formatNumber(rounded)} ${unit}`;
}

// Initialize language on load
currentLanguage = getCurrentLanguage();
setLanguage(currentLanguage);