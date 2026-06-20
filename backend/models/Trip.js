const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedCostUSD: { type: Number, default: 0 },
    timeOfDay: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], default: 'Morning' }
  },
  { _id: true }
);

const DaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    activities: { type: [ActivitySchema], default: [] }
  },
  { _id: true }
);

const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tier: { type: String, default: '' },
    estimatedCostNightUSD: { type: Number, default: 0 },
    rating: { type: String, default: '' }
  },
  { _id: true }
);

const PackingItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    category: { type: String, default: 'Other' },
    isPacked: { type: Boolean, default: false }
  },
  { _id: true }
);

const TripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    durationDays: { type: Number, required: true },
    budgetTier: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    interests: [{ type: String }],
    itinerary: { type: [DaySchema], default: [] },
    hotels: { type: [HotelSchema], default: [] },
    packingList: { type: [PackingItemSchema], default: [] },
    estimatedBudget: {
      transport: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    travelMonth: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'generated', 'edited'], default: 'generated' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', TripSchema);