/**
 * Attachments Routes
 * 
 * Handles fetching file attachments associated with bookings.
 * Integrates with ServiceM8 API for attachment data.
 */

const express = require('express');
const axios = require('axios');
const { verifyToken } = require('../middleware/auth');
const servicem8 = require('../services/servicem8');

const router = express.Router();

// ServiceM8 API config for direct file access
const SERVICEM8_API_KEY = process.env.SERVICEM8_API_KEY;

// Note: view/download endpoints are public for POC (images need to load in browser)
// In production, these should use signed URLs or pass auth tokens

/**
 * GET /api/attachments/booking/:bookingId
 * 
 * Returns all file attachments for a specific booking.
 * Requires authentication.
 * 
 * @param bookingId - The job/booking UUID
 */
router.get('/booking/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Fetch attachments from ServiceM8
    const rawAttachments = await servicem8.getJobAttachments(bookingId);
    
    // Transform attachments for frontend display
    const attachments = rawAttachments.map(att => ({
      id: att.uuid,
      fileName: att.file_name || 'Unnamed file',
      fileType: att.file_type || 'application/octet-stream',
      description: att.description || '',
      createdDate: att.created_date || null,
      // In production, this would be a signed URL to download the file
      downloadUrl: `/api/attachments/${att.uuid}/download`
    }));

    res.json({
      success: true,
      attachments,
      count: attachments.length
    });

  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch attachments'
    });
  }
});

/**
 * GET /api/attachments/:id/download
 * 
 * Downloads/proxies a specific attachment file from ServiceM8.
 * Streams the actual file content to the client.
 * 
 * @param id - The attachment UUID
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📥 Downloading attachment ${id} from ServiceM8...`);
    
    // Fetch the actual file from ServiceM8
    const response = await axios.get(
      `https://api.servicem8.com/api_1.0/attachment/${id}.file`,
      {
        headers: {
          'X-API-Key': SERVICEM8_API_KEY
        },
        responseType: 'arraybuffer' // Get binary data
      }
    );
    
    // Get content type from response headers
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    console.log(`✅ Downloaded attachment, type: ${contentType}`);
    
    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the file data
    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error('Error downloading attachment:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to download attachment'
    });
  }
});

/**
 * GET /api/attachments/:id/view
 * 
 * Returns the attachment as an inline viewable file (for images).
 * 
 * @param id - The attachment UUID
 */
router.get('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`👁️ Viewing attachment ${id} from ServiceM8...`);
    
    // Fetch the actual file from ServiceM8
    const response = await axios.get(
      `https://api.servicem8.com/api_1.0/attachment/${id}.file`,
      {
        headers: {
          'X-API-Key': SERVICEM8_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );
    
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    console.log(`✅ Retrieved attachment for viewing, type: ${contentType}`);
    
    // Set headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error('Error viewing attachment:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to view attachment'
    });
  }
});

module.exports = router;

