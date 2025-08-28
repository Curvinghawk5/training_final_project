const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/:
 *   get:
 *     summary: API health check endpoint
 *     description: Returns a simple API health check message
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is running!"
 */
router.get('/', (req, res) => {
    res.json({ message: 'API is running!' });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     description: Returns API health status
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   example: "2024-01-01T00:00:00.000Z"
 */
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
