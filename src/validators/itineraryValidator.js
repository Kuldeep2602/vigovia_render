import Joi from 'joi';

// Validation schema for itinerary request
const itinerarySchema = Joi.object({
  userDetails: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    numberOfTravelers: Joi.number().integer().min(1).max(50).required()
  }).required(),

  tripDetails: Joi.object({
    destination: Joi.string().min(2).max(100).required(),
    departureFrom: Joi.string().min(2).max(100).required(),
    departureDate: Joi.string().required(), // Changed from Joi.date().iso()
    arrivalDate: Joi.string().required(), // Changed from Joi.date().iso()
    numberOfDays: Joi.number().integer().min(1).max(365).default(1),
    numberOfNights: Joi.number().integer().min(0).max(364).default(0),
    tripType: Joi.string().valid('exploration', 'business', 'leisure', 'adventure', 'cultural', 'romantic', 'family').default('leisure')
  }).required(),

  activities: Joi.array().items(
    Joi.object({
      activityId: Joi.string().required(),
      activityName: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(1000).allow('').default(''),
      day: Joi.number().integer().min(1).required(),
      timeSlot: Joi.string().valid('Morning', 'Afternoon', 'Evening').required(),
      price: Joi.number().min(0).default(0),
      duration: Joi.string().max(50).default(''),
      notes: Joi.string().max(500).allow('').default('')
    })
  ).min(1).required(),

  flights: Joi.array().items(
    Joi.object({
      date: Joi.string().required(),
      airline: Joi.string().min(2).max(100).required(),
      route: Joi.string().min(5).max(200).required(),
      flightNumber: Joi.string().min(2).max(20).required(),
      departureTime: Joi.string().allow('').default(''),
      arrivalTime: Joi.string().allow('').default(''),
      class: Joi.string().valid('Economy', 'Business', 'First').default('Economy')
    })
  ).default([]),

  hotels: Joi.array().items(
    Joi.object({
      city: Joi.string().min(2).max(100).required(),
      checkIn: Joi.string().required(), // Changed from Joi.date().iso()
      checkOut: Joi.string().required(), // Changed from Joi.date().iso()
      nights: Joi.number().integer().min(1).required(),
      hotelName: Joi.string().min(2).max(200).required(),
      roomType: Joi.string().max(100).default('Standard'),
      address: Joi.string().max(300).allow('').default(''),
      rating: Joi.number().min(1).max(5).allow(null).default(null)
    })
  ).default([]),

  additionalServices: Joi.object({
    scopeOfServices: Joi.array().items(Joi.string()).default([]),
    specialNotes: Joi.string().max(1000).allow('').default(''),
    termsAndConditions: Joi.string().max(2000).allow('').default(''),
    paymentPlan: Joi.object({
      totalAmount: Joi.number().min(0).required(),
      currency: Joi.string().length(3).default('INR'),
      installments: Joi.array().items(
        Joi.object({
          installmentNumber: Joi.number().integer().min(1).required(),
          amount: Joi.number().min(0).required(),
          dueDate: Joi.string().required(),
          description: Joi.string().max(100).default('')
        })
      ).default([])
    }).default({}),
    visa: Joi.object({
      required: Joi.boolean().default(false),
      type: Joi.string().max(50).allow('').default(''),
      validity: Joi.string().max(50).allow('').default(''),
      processingDate: Joi.string().allow('', null).default(null) // Changed from Joi.date().iso()
    }).default({})
  }).default({})
});

// Middleware function for validation
export const validateItineraryRequest = (req, res, next) => {
  console.log('🔍 Validating request data:', JSON.stringify(req.body, null, 2));
  
  const { error, value } = itinerarySchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    console.error('❌ Validation failed:', validationErrors);

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
      errorCount: validationErrors.length
    });
  }

  // Attach validated data to request
  req.validatedData = value;
  next();
};

// Export schema for testing purposes
export { itinerarySchema };
