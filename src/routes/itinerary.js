import express from 'express';
import { generateItinerary } from '../controllers/itineraryController.js';
import { validateItineraryRequest } from '../validators/itineraryValidator.js';

const router = express.Router();

// Main itinerary generation endpoint
router.post('/generate-itinerary', validateItineraryRequest, generateItinerary);

// Test endpoint for PDF generation
router.get('/test-pdf', (req, res) => {
  res.json({
    message: 'PDF generation test endpoint',
    status: 'Available'
  });
});

export default router;
