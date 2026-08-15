const express = require('express');
const { all, get, run } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/contact
 * Public endpoint to submit contact form
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await run(
      `INSERT INTO messages (id, name, email, message, status) VALUES (?, ?, ?, ?, ?)`,
      [id, name.trim(), email.trim(), message.trim(), 'unread']
    );

    console.log(`[Contact Form] New message from ${name} (${email}): ${message.slice(0, 50)}...`);

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been sent to the lab team.',
      id,
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

/**
 * GET /api/contact/messages
 * Protected endpoint for admin to view messages
 */
router.get('/contact/messages', requireAuth, async (req, res) => {
  try {
    const messages = await all(`SELECT * FROM messages ORDER BY created_at DESC`);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

/**
 * PUT /api/contact/messages/:id/read
 * Protected endpoint to mark message as read
 */
router.put('/contact/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await run(`UPDATE messages SET status = 'read' WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

/**
 * DELETE /api/contact/messages/:id
 * Protected endpoint to delete a message
 */
router.delete('/contact/messages/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run(`DELETE FROM messages WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
