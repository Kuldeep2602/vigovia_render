import { PDFGeneratorService } from '../services/pdfGenerator.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateItinerary = async (req, res) => {
  try {
    console.log('📥 Raw request body:', JSON.stringify(req.body, null, 2));
    const itineraryData = req.validatedData;
    
    // Generate unique filename
    const filename = `itinerary_${itineraryData.userDetails.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../generated-pdfs', filename);
    
    console.log('🎯 Starting PDF generation for:', itineraryData.userDetails.name);
    console.log('📊 Trip details:', itineraryData.tripDetails);
    console.log('🎪 Activities count:', itineraryData.activities.length);
    
    // Initialize PDF generator
    const pdfGenerator = new PDFGeneratorService();
    
    // Generate PDF
    const pdfPath = await pdfGenerator.generateItineraryPDF(itineraryData, outputPath);
    
    // Create download URL
    const downloadUrl = `/generated-pdfs/${filename}`;
    
    console.log('✅ PDF generated successfully:', filename);
    
    // Response with metadata
    res.status(200).json({
      success: true,
      message: 'Itinerary generated successfully',
      data: {
        filename,
        downloadUrl,
        generatedAt: new Date().toISOString(),
        tripSummary: {
          destination: itineraryData.tripDetails.destination,
          duration: `${itineraryData.tripDetails.numberOfDays} days, ${itineraryData.tripDetails.numberOfNights} nights`,
          travelers: itineraryData.userDetails.numberOfTravelers,
          activitiesCount: itineraryData.activities.length,
          flightsCount: itineraryData.flights.length,
          hotelsCount: itineraryData.hotels.length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating itinerary:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
