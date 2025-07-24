import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFGeneratorService {
  constructor() {
    this.templatePath = path.join(__dirname, '../templates/itinerary-template.html');
    this.cssPath = path.join(__dirname, '../templates/compiled-styles.css');
  }

  async generateItineraryPDF(data, outputPath) {
    try {
      console.log('🔄 Loading HTML template and CSS...');
      
      // Load template and CSS
      const [htmlTemplate, cssContent] = await Promise.all([
        fs.readFile(this.templatePath, 'utf8'),
        fs.readFile(this.cssPath, 'utf8')
      ]);

      // Prepare data for template
      const templateData = this.prepareTemplateData(data);
      
      // Compile template
      const template = handlebars.compile(htmlTemplate);
      const html = template({ ...templateData, css: cssContent });

      console.log('🚀 Launching Puppeteer...');
      
      // Generate PDF with Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set content and wait for it to load
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded']
      });

      console.log('📄 Generating PDF...');
      
      console.log('📄 Generating PDF...');
      
      // Generate PDF
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      await browser.close();
      
      console.log('✅ PDF generated successfully at:', outputPath);
      return outputPath;
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  prepareTemplateData(data) {
    const {
      userDetails,
      tripDetails,
      activities,
      flights,
      hotels,
      additionalServices
    } = data;

    // Format dates
    const formatDate = (date) => moment(date).format('DD/MM/YYYY');
    const formatDateLong = (date) => moment(date).format('Do MMMM');

    // Group activities by day
    const activitiesByDay = this.groupActivitiesByDay(activities);
    
    // Calculate total amount from activities
    const totalActivityCost = activities.reduce((sum, activity) => sum + (activity.price || 0), 0);
    
    // Prepare payment plan
    const paymentPlan = additionalServices.paymentPlan || {};
    const totalAmount = paymentPlan.totalAmount || totalActivityCost;

    return {
      // User information
      userName: userDetails.name,
      userEmail: userDetails.email,
      userPhone: userDetails.phone,
      numberOfTravelers: userDetails.numberOfTravelers,
      
      // Trip details
      destination: tripDetails.destination,
      departureFrom: tripDetails.departureFrom,
      departureDate: formatDate(tripDetails.departureDate),
      arrivalDate: formatDate(tripDetails.arrivalDate),
      numberOfDays: tripDetails.numberOfDays,
      numberOfNights: tripDetails.numberOfNights,
      tripType: tripDetails.tripType,
      
      // Activities grouped by day
      activitiesByDay: activitiesByDay,
      totalActivities: activities.length,
      
      // Flights
      flights: flights.map(flight => ({
        ...flight,
        formattedDate: formatDate(flight.date)
      })),
      
      // Hotels
      hotels: hotels.map(hotel => ({
        ...hotel,
        checkInFormatted: formatDate(hotel.checkIn),
        checkOutFormatted: formatDate(hotel.checkOut)
      })),
      
      // Payment information
      totalAmount: totalAmount,
      currency: paymentPlan.currency || 'INR',
      installments: paymentPlan.installments || [],
      
      // Additional services
      scopeOfServices: additionalServices.scopeOfServices || [],
      specialNotes: additionalServices.specialNotes || '',
      
      // Visa information
      visa: additionalServices.visa || {},
      
      // Company details
      companyName: process.env.COMPANY_NAME || 'Vigovia Tech Pvt. Ltd',
      companyAddress: process.env.COMPANY_ADDRESS || 'HD-109 Cinnabar Hills, Links Business Park, Karnataka, India',
      companyPhone: process.env.COMPANY_PHONE || '+91-9999999999',
      companyEmail: process.env.COMPANY_EMAIL || 'contact@vigovia.com',
      
      // Current date
      generatedDate: moment().format('DD/MM/YYYY'),
      generatedTime: moment().format('HH:mm:ss')
    };
  }

  groupActivitiesByDay(activities) {
    const grouped = {};
    
    activities.forEach(activity => {
      const day = activity.day;
      if (!grouped[day]) {
        grouped[day] = {
          dayNumber: day,
          date: `Day ${day}`,
          Morning: [],
          Afternoon: [],
          Evening: []
        };
      }
      
      grouped[day][activity.timeSlot].push({
        ...activity,
        formattedPrice: activity.price ? `₹${activity.price.toLocaleString('en-IN')}` : 'Free'
      });
    });
    
    // Convert to array and sort by day
    return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber);
  }
}

// Register Handlebars helpers
handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

handlebars.registerHelper('gt', function(a, b) {
  return a > b;
});

handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

handlebars.registerHelper('formatCurrency', function(amount) {
  if (!amount || amount === 0) return '0';
  return amount.toLocaleString('en-IN');
});

handlebars.registerHelper('uppercase', function(str) {
  return str ? str.toUpperCase() : '';
});

handlebars.registerHelper('formatDate', function(date) {
  return moment(date).format('DD/MM/YYYY');
});
