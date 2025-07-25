// import puppeteer from 'puppeteer';
// import handlebars from 'handlebars';
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import moment from 'moment';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export class PDFGeneratorService {
//   constructor() {
//     this.templatePath = path.join(__dirname, '../templates/itinerary-template.html');
//     this.cssPath = path.join(__dirname, '../templates/compiled-styles.css');
//   }

//   async generateItineraryPDF(data, outputPath) {
//     try {
//       console.log('🔄 Loading HTML template and CSS...');
      
//       // Load template and CSS
//       const [htmlTemplate, cssContent] = await Promise.all([
//         fs.readFile(this.templatePath, 'utf8'),
//         fs.readFile(this.cssPath, 'utf8')
//       ]);

//       // Prepare data for template
//       const templateData = this.prepareTemplateData(data);
      
//       // Compile template
//       const template = handlebars.compile(htmlTemplate);
//       const html = template({ ...templateData, css: cssContent });

//       console.log('🚀 Launching Puppeteer...');
      
//       // Generate PDF with Puppeteer
//       const browser = await puppeteer.launch({
//         headless: 'new',
//         executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//       });

//       const page = await browser.newPage();
      
//       // Set content and wait for it to load
//       await page.setContent(html, {
//         waitUntil: ['networkidle0', 'domcontentloaded']
//       });

//       console.log('📄 Generating PDF...');
      
//       console.log('📄 Generating PDF...');
      
//       // Generate PDF
//       await page.pdf({
//         path: outputPath,
//         format: 'A4',
//         printBackground: true,
//         margin: {
//           top: '20px',
//           right: '20px',
//           bottom: '20px',
//           left: '20px'
//         }
//       });

//       await browser.close();
      
//       console.log('✅ PDF generated successfully at:', outputPath);
//       return outputPath;
      
//     } catch (error) {
//       console.error('❌ PDF generation failed:', error);
//       throw new Error(`PDF generation failed: ${error.message}`);
//     }
//   }

//   prepareTemplateData(data) {
//     const {
//       userDetails,
//       tripDetails,
//       activities,
//       flights,
//       hotels,
//       additionalServices
//     } = data;

//     // Format dates
//     const formatDate = (date) => moment(date).format('DD/MM/YYYY');
//     const formatDateLong = (date) => moment(date).format('Do MMMM');

//     // Group activities by day
//     const activitiesByDay = this.groupActivitiesByDay(activities);
    
//     // Calculate total amount from activities
//     const totalActivityCost = activities.reduce((sum, activity) => sum + (activity.price || 0), 0);
    
//     // Prepare payment plan
//     const paymentPlan = additionalServices.paymentPlan || {};
//     const totalAmount = paymentPlan.totalAmount || totalActivityCost;

//     return {
//       // User information
//       userName: userDetails.name,
//       userEmail: userDetails.email,
//       userPhone: userDetails.phone,
//       numberOfTravelers: userDetails.numberOfTravelers,
      
//       // Trip details
//       destination: tripDetails.destination,
//       departureFrom: tripDetails.departureFrom,
//       departureDate: formatDate(tripDetails.departureDate),
//       arrivalDate: formatDate(tripDetails.arrivalDate),
//       numberOfDays: tripDetails.numberOfDays,
//       numberOfNights: tripDetails.numberOfNights,
//       tripType: tripDetails.tripType,
      
//       // Activities grouped by day
//       activitiesByDay: activitiesByDay,
//       totalActivities: activities.length,
      
//       // Flights
//       flights: flights.map(flight => ({
//         ...flight,
//         formattedDate: formatDate(flight.date)
//       })),
      
//       // Hotels
//       hotels: hotels.map(hotel => ({
//         ...hotel,
//         checkInFormatted: formatDate(hotel.checkIn),
//         checkOutFormatted: formatDate(hotel.checkOut)
//       })),
      
//       // Payment information
//       totalAmount: totalAmount,
//       currency: paymentPlan.currency || 'INR',
//       installments: paymentPlan.installments || [],
      
//       // Additional services
//       scopeOfServices: additionalServices.scopeOfServices || [],
//       specialNotes: additionalServices.specialNotes || '',
      
//       // Visa information
//       visa: additionalServices.visa || {},
      
//       // Company details
//       companyName: process.env.COMPANY_NAME || 'Vigovia Tech Pvt. Ltd',
//       companyAddress: process.env.COMPANY_ADDRESS || 'HD-109 Cinnabar Hills, Links Business Park, Karnataka, India',
//       companyPhone: process.env.COMPANY_PHONE || '+91-9999999999',
//       companyEmail: process.env.COMPANY_EMAIL || 'contact@vigovia.com',
      
//       // Current date
//       generatedDate: moment().format('DD/MM/YYYY'),
//       generatedTime: moment().format('HH:mm:ss')
//     };
//   }

//   groupActivitiesByDay(activities) {
//     const grouped = {};
    
//     activities.forEach(activity => {
//       const day = activity.day;
//       if (!grouped[day]) {
//         grouped[day] = {
//           dayNumber: day,
//           date: `Day ${day}`,
//           Morning: [],
//           Afternoon: [],
//           Evening: []
//         };
//       }
      
//       grouped[day][activity.timeSlot].push({
//         ...activity,
//         formattedPrice: activity.price ? `₹${activity.price.toLocaleString('en-IN')}` : 'Free'
//       });
//     });
    
//     // Convert to array and sort by day
//     return Object.values(grouped).sort((a, b) => a.dayNumber - b.dayNumber);
//   }
// }

// // Register Handlebars helpers
// handlebars.registerHelper('eq', function(a, b) {
//   return a === b;
// });

// handlebars.registerHelper('gt', function(a, b) {
//   return a > b;
// });

// handlebars.registerHelper('add', function(a, b) {
//   return a + b;
// });

// handlebars.registerHelper('formatCurrency', function(amount) {
//   if (!amount || amount === 0) return '0';
//   return amount.toLocaleString('en-IN');
// });

// handlebars.registerHelper('uppercase', function(str) {
//   return str ? str.toUpperCase() : '';
// });

// handlebars.registerHelper('formatDate', function(date) {
//   return moment(date).format('DD/MM/YYYY');
// });



import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';
import moment from 'moment';

const __dirname = path.resolve(path.dirname(''));

export class PDFGeneratorService {
  constructor() {}

  async generateItineraryPDF(data, outputPath) {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = doc.pipe(require('fs').createWriteStream(outputPath));

      // Title
      doc.fontSize(22).text('Travel Itinerary', { align: 'center' });
      doc.moveDown();

      // User Details
      doc.fontSize(14).text(`Name: ${data.userDetails.name}`);
      doc.text(`Email: ${data.userDetails.email}`);
      doc.text(`Phone: ${data.userDetails.phone}`);
      doc.text(`Travelers: ${data.userDetails.numberOfTravelers}`);
      doc.moveDown();

      // Trip Details
      doc.fontSize(16).text('Trip Details', { underline: true });
      doc.fontSize(12).text(`Destination: ${data.tripDetails.destination}`);
      doc.text(`Departure: ${data.tripDetails.departureFrom} on ${moment(data.tripDetails.departureDate).format('DD/MM/YYYY')}`);
      doc.text(`Arrival: ${moment(data.tripDetails.arrivalDate).format('DD/MM/YYYY')}`);
      doc.text(`Days: ${data.tripDetails.numberOfDays}, Nights: ${data.tripDetails.numberOfNights}`);
      doc.text(`Type: ${data.tripDetails.tripType}`);
      doc.moveDown();

      // Activities
      doc.fontSize(16).text('Activities', { underline: true });
      data.activities.forEach((activity, idx) => {
        doc.fontSize(12).text(`Day ${activity.day} - ${activity.timeSlot}: ${activity.name} (${activity.price ? '₹' + activity.price : 'Free'})`);
      });
      doc.moveDown();

      // Flights
      if (data.flights && data.flights.length > 0) {
        doc.fontSize(16).text('Flights', { underline: true });
        data.flights.forEach(flight => {
          doc.fontSize(12).text(`Flight: ${flight.airline} ${flight.flightNumber} on ${moment(flight.date).format('DD/MM/YYYY')}`);
        });
        doc.moveDown();
      }

      // Hotels
      if (data.hotels && data.hotels.length > 0) {
        doc.fontSize(16).text('Hotels', { underline: true });
        data.hotels.forEach(hotel => {
          doc.fontSize(12).text(`Hotel: ${hotel.name}, Check-in: ${moment(hotel.checkIn).format('DD/MM/YYYY')}, Check-out: ${moment(hotel.checkOut).format('DD/MM/YYYY')}`);
        });
        doc.moveDown();
      }

      // Payment Info
      doc.fontSize(16).text('Payment Info', { underline: true });
      doc.fontSize(12).text(`Total Amount: ₹${data.additionalServices?.paymentPlan?.totalAmount || 0}`);
      doc.text(`Currency: ${data.additionalServices?.paymentPlan?.currency || 'INR'}`);
      doc.moveDown();

      // Company Info
      doc.fontSize(10).text(`${process.env.COMPANY_NAME || 'Vigovia Tech Pvt. Ltd'} | ${process.env.COMPANY_ADDRESS || 'HD-109 Cinnabar Hills, Links Business Park, Karnataka, India'} | ${process.env.COMPANY_PHONE || '+91-9999999999'} | ${process.env.COMPANY_EMAIL || 'contact@vigovia.com'}`, { align: 'center' });

      doc.end();
      await new Promise(resolve => stream.on('finish', resolve));
      return outputPath;
    } catch (error) {
      console.error('❌ PDF generation failed:', error.message);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
}

// ...existing code...