/**
 * Bookings Routes
 * 
 * Handles fetching and displaying customer bookings (jobs).
 * Integrates with ServiceM8 API to retrieve job data.
 */

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const servicem8 = require('../services/servicem8');

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

/**
 * GET /api/bookings
 * 
 * Returns all bookings for the authenticated customer.
 * Fetches jobs from ServiceM8 filtered by customer email.
 */
router.get('/', async (req, res) => {
  try {
    const customerEmail = req.user.email;
    
    // Fetch jobs from ServiceM8 for this customer
    const jobs = await servicem8.getJobsByCustomerEmail(customerEmail);
    
    // Transform jobs into booking format for the frontend
    const bookings = jobs.map(job => ({
      id: job.uuid,
      jobNumber: job.generated_job_id || `JOB-${job.uuid.slice(0, 8)}`,
      address: job.job_address || 'No address provided',
      description: job.job_description || 'No description',
      status: job.status || 'Unknown',
      date: job.date || null,
      time: job.time || null,
      amount: job.total_amount || 0
    }));

    res.json({
      success: true,
      bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch bookings'
    });
  }
});

/**
 * GET /api/bookings/:id
 * 
 * Returns detailed information for a specific booking.
 * Includes all job details from ServiceM8.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch job details from ServiceM8
    const job = await servicem8.getJobById(id);
    
    if (!job) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Booking not found'
      });
    }

    // Transform job into detailed booking format
    const booking = {
      id: job.uuid,
      jobNumber: job.generated_job_id || `JOB-${job.uuid.slice(0, 8)}`,
      address: job.job_address || 'No address provided',
      description: job.job_description || 'No description',
      status: job.status || 'Unknown',
      date: job.date || null,
      time: job.time || null,
      amount: job.total_amount || 0,
      workDone: job.work_done_description || '',
      notes: job.notes || '',
      contact: {
        firstName: job.contact_first || '',
        lastName: job.contact_last || '',
        phone: job.contact_phone || '',
        email: job.contact_email || ''
      }
    };

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch booking details'
    });
  }
});

module.exports = router;

