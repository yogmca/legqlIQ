// Web Scraper Routes
// API endpoints for web scraping legal information

const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

/**
 * @route   POST /api/scraper/search
 * @desc    Search for legal information using web scraper
 * @access  Public
 * @body    { query: string }
 */
router.post('/search', scraperController.searchLegalInfo);

/**
 * @route   POST /api/scraper/chat
 * @desc    Get formatted chatbot response using web scraper
 * @access  Public
 * @body    { message: string }
 */
router.post('/chat', scraperController.getChatResponse);

/**
 * @route   DELETE /api/scraper/cache
 * @desc    Clear scraper cache (all or specific query)
 * @access  Public
 * @body    { query?: string }
 */
router.delete('/cache', scraperController.clearCache);

/**
 * @route   GET /api/scraper/cache/stats
 * @desc    Get cache statistics
 * @access  Public
 */
router.get('/cache/stats', scraperController.getCacheStats);

/**
 * @route   GET /api/scraper/health
 * @desc    Health check for scraper service
 * @access  Public
 */
router.get('/health', scraperController.healthCheck);

module.exports = router;
