/**
 * Messages Routes
 * 
 * Handles sending and retrieving messages related to bookings.
 * Messages are persisted to a local JSON file for the POC.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Path to the messages storage file
const MESSAGES_FILE = path.join(__dirname, '../../data/messages.json');

// =============================================================================
// HELPER FUNCTIONS FOR FILE-BASED STORAGE
// =============================================================================

/**
 * Ensures the data directory and messages file exist
 */
const ensureStorageExists = () => {
  const dataDir = path.dirname(MESSAGES_FILE);
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create empty messages file if it doesn't exist
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
  }
};

/**
 * Reads all messages from the storage file
 */
const readMessages = () => {
  ensureStorageExists();
  const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
  return JSON.parse(data);
};

/**
 * Writes messages to the storage file
 */
const writeMessages = (messages) => {
  ensureStorageExists();
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

// All message routes require authentication
router.use(verifyToken);

/**
 * GET /api/messages/booking/:bookingId
 * 
 * Returns all messages for a specific booking.
 * Messages are sorted by creation date (newest first).
 * 
 * @param bookingId - The job/booking UUID
 */
router.get('/booking/:bookingId', (req, res) => {
  try {
    const { bookingId } = req.params;
    const allMessages = readMessages();
    
    // Filter messages for this booking
    const bookingMessages = allMessages
      .filter(msg => msg.bookingId === bookingId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      messages: bookingMessages,
      count: bookingMessages.length
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch messages'
    });
  }
});

/**
 * POST /api/messages/booking/:bookingId
 * 
 * Creates a new message for a specific booking.
 * 
 * Request body:
 * - content: The message text (required)
 * 
 * @param bookingId - The job/booking UUID
 */
router.post('/booking/:bookingId', (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const { customerId, firstName, lastName, email } = req.user;

    // Validate message content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message content is required'
      });
    }

    // Limit message length
    if (content.length > 2000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message content cannot exceed 2000 characters'
      });
    }

    // Create new message object
    const newMessage = {
      id: uuidv4(),
      bookingId,
      customerId,
      customerName: `${firstName} ${lastName}`.trim() || 'Customer',
      customerEmail: email,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isFromCustomer: true // Distinguishes from staff replies
    };

    // Read existing messages and add the new one
    const allMessages = readMessages();
    allMessages.push(newMessage);
    writeMessages(allMessages);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to send message'
    });
  }
});

/**
 * GET /api/messages/all
 * 
 * Returns all messages for the authenticated customer.
 * Useful for a "My Messages" overview page.
 */
router.get('/all', (req, res) => {
  try {
    const { customerId } = req.user;
    const allMessages = readMessages();
    
    // Filter messages by customer ID
    const customerMessages = allMessages
      .filter(msg => msg.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      messages: customerMessages,
      count: customerMessages.length
    });

  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch messages'
    });
  }
});

module.exports = router;

