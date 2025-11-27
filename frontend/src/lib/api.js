/**
 * API Client for Customer Portal Backend
 * 
 * Handles all HTTP requests to the Express.js backend.
 * Manages authentication tokens and error handling.
 */

// Backend API base URL
// In production, set NEXT_PUBLIC_API_URL to your deployed backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

console.log('API URL:', API_BASE_URL);

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

/**
 * Retrieves the stored auth token from localStorage
 */
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Stores the auth token in localStorage
 */
const setToken = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

/**
 * Removes the auth token from localStorage
 */
const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

// =============================================================================
// HTTP REQUEST HELPER
// =============================================================================

/**
 * Makes an authenticated HTTP request to the backend
 * 
 * @param {string} endpoint - API endpoint (e.g., '/bookings')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Response data
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Build headers with optional auth token
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Make the request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse JSON response
  const data = await response.json();

  // Handle error responses
  if (!response.ok) {
    // If unauthorized, clear the token
    if (response.status === 401) {
      clearToken();
    }
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// =============================================================================
// AUTHENTICATION API
// =============================================================================

/**
 * Logs in a customer using email and phone number
 * 
 * @param {string} email - Customer email
 * @param {string} phone - Customer phone number
 * @returns {Promise<object>} Login response with token and customer info
 */
export const login = async (email, phone) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, phone }),
  });

  // Store the token if login successful
  if (data.token) {
    setToken(data.token);
  }

  return data;
};

/**
 * Logs out the current user
 */
export const logout = () => {
  clearToken();
};

/**
 * Gets the current authenticated user's info
 * 
 * @returns {Promise<object>} Customer info
 */
export const getCurrentUser = async () => {
  return request('/auth/me');
};

/**
 * Checks if user is authenticated (has valid token)
 */
export const isAuthenticated = () => {
  return !!getToken();
};

// =============================================================================
// BOOKINGS API
// =============================================================================

/**
 * Fetches all bookings for the authenticated customer
 * 
 * @returns {Promise<object>} List of bookings
 */
export const getBookings = async () => {
  return request('/bookings');
};

/**
 * Fetches details for a specific booking
 * 
 * @param {string} bookingId - The booking UUID
 * @returns {Promise<object>} Booking details
 */
export const getBookingById = async (bookingId) => {
  return request(`/bookings/${bookingId}`);
};

// =============================================================================
// ATTACHMENTS API
// =============================================================================

/**
 * Fetches all attachments for a specific booking
 * 
 * @param {string} bookingId - The booking UUID
 * @returns {Promise<object>} List of attachments
 */
export const getBookingAttachments = async (bookingId) => {
  return request(`/attachments/booking/${bookingId}`);
};

// =============================================================================
// MESSAGES API
// =============================================================================

/**
 * Fetches all messages for a specific booking
 * 
 * @param {string} bookingId - The booking UUID
 * @returns {Promise<object>} List of messages
 */
export const getBookingMessages = async (bookingId) => {
  return request(`/messages/booking/${bookingId}`);
};

/**
 * Sends a new message for a specific booking
 * 
 * @param {string} bookingId - The booking UUID
 * @param {string} content - Message content
 * @returns {Promise<object>} Created message
 */
export const sendMessage = async (bookingId, content) => {
  return request(`/messages/booking/${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};

/**
 * Fetches all messages for the current customer
 * 
 * @returns {Promise<object>} List of all customer's messages
 */
export const getAllMessages = async () => {
  return request('/messages/all');
};

