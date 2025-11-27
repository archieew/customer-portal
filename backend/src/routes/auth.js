/**
 * Authentication Routes
 * 
 * Handles customer login using email and phone number.
 * Issues JWT tokens for authenticated sessions.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const servicem8 = require('../services/servicem8');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret_change_in_production';
const TOKEN_EXPIRY = '24h'; // Token valid for 24 hours

// =============================================================================
// MOCK CUSTOMER DATABASE
// In production, this would be a real database lookup
// =============================================================================

const mockCustomers = [
  {
    id: 'cust-001',
    email: 'customer@example.com',
    phone: '0400123456', // Stored without spaces for comparison
    firstName: 'John',
    lastName: 'Smith'
  },
  {
    id: 'cust-002',
    email: 'jane.doe@example.com',
    phone: '0411222333',
    firstName: 'Jane',
    lastName: 'Doe'
  }
];

/**
 * POST /api/auth/login
 * 
 * Authenticates a customer using email and phone number.
 * Returns a JWT token if credentials are valid.
 * 
 * Request body:
 * - email: Customer email address
 * - phone: Customer phone number
 */
router.post('/login', async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Validate required fields
    if (!email || !phone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and phone number are required'
      });
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const normalizedEmail = email.toLowerCase().trim();

    // Find customer by email and phone
    const customer = mockCustomers.find(c => 
      c.email.toLowerCase() === normalizedEmail && 
      c.phone === normalizedPhone
    );

    if (!customer) {
      // Don't reveal whether email or phone was wrong (security best practice)
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or phone number'
      });
    }

    // Create JWT token with customer info
    const tokenPayload = {
      customerId: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Return success response with token and customer info
    res.json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during login'
    });
  }
});

/**
 * GET /api/auth/me
 * 
 * Returns the current authenticated user's info.
 * Requires valid JWT token in Authorization header.
 */
router.get('/me', require('../middleware/auth').verifyToken, (req, res) => {
  // req.user is set by the verifyToken middleware
  res.json({
    success: true,
    customer: req.user
  });
});

module.exports = router;

