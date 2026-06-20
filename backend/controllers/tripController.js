const Trip = require('../models/Trip');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await sleep(delay);
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      const text = await response.text();
      throw new Error(`External API Error ${response.status}: ${text}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

function buildPrompt({ destination, durationDays, budgetTier, interests, travelMonth }) {
  return `
Create a ${durationDays}-day travel itinerary for ${destination}.
Budget tier: ${budgetTier}.
Interests: ${interests?.join(', ') || 'general sightseeing'}.
Travel month/season context: ${travelMonth || 'not provided'}.

Return ONLY valid JSON with this exact structure:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "string",
          "description": "string",
          "estimatedCostUSD": 0,
          "timeOfDay": "Morning"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "string",
      "tier": "Budget",
      "estimatedCostNightUSD": 0,
      "rating": "4.5/5"
    }
  ],
  "estimatedBudget": {
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "total": 0
  },
  "packingList": [
    {
      "item": "Passport",
      "category": "Documents",
      "isPacked": false
    }
  ]
}

Rules:
- Match the JSON structure exactly.
- Make budget realistic for the selected budget tier.
- Include at least 1-3 activities per day.
- Include weather-aware packing items.
- Keep descriptions short and practical.
`;
}

function buildPackingPrompt({ destination, travelMonth, itinerary }) {
  return `
You are a weather-aware packing assistant.

Destination: ${destination}
Travel month/season: ${travelMonth || 'unknown'}
Itinerary summary: ${JSON.stringify(itinerary)}

Return ONLY JSON:
{
  "packingList": [
    { "item": "string", "category": "Documents | Clothing | Apparel | Footwear | Gear | Electronics | Essentials | Health & Personal Care | Other", "isPacked": false }
  ]
}

Include:
- Travel documents
- Climate-based clothing
- Activity-specific gear
- Practical essentials
`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in backend .env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  console.log('Gemini raw response:', rawText);

  if (!response.ok) {
    throw new Error(`Gemini API Error ${response.status}: ${rawText}`);
  }

  const data = JSON.parse(rawText);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text returned from Gemini');
  }

  return JSON.parse(text);
}

exports.generateTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, durationDays, budgetTier, interests = [], travelMonth = '' } = req.body;

    if (!destination || !durationDays || !budgetTier) {
      return res.status(400).json({ message: 'destination, durationDays, and budgetTier are required' });
    }

    const prompt = buildPrompt({ destination, durationDays, budgetTier, interests, travelMonth });
    const aiResult = await callGemini(prompt);

    const trip = await Trip.create({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests,
      travelMonth,
      itinerary: aiResult.itinerary || [],
      hotels: aiResult.hotels || [],
      estimatedBudget: aiResult.estimatedBudget || {},
      packingList: aiResult.packingList || [],
      status: 'generated'
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate trip', error: error.message });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips', error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trip', error: error.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const allowed = [
      'destination',
      'durationDays',
      'budgetTier',
      'interests',
      'itinerary',
      'hotels',
      'packingList',
      'estimatedBudget',
      'travelMonth',
      'status'
    ];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) trip[key] = req.body[key];
    });

    const saved = await trip.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update trip', error: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete trip', error: error.message });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const { dayNumber, activity } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const day = trip.itinerary.find((d) => d.dayNumber === Number(dayNumber));
    if (!day) return res.status(404).json({ message: 'Day not found' });

    day.activities.push(activity);
    trip.status = 'edited';
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add activity', error: error.message });
  }
};

exports.removeActivity = async (req, res) => {
  try {
    const { dayNumber, activityId } = req.params;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const day = trip.itinerary.find((d) => d.dayNumber === Number(dayNumber));
    if (!day) return res.status(404).json({ message: 'Day not found' });

    day.activities = day.activities.filter((a) => String(a._id) !== activityId);
    trip.status = 'edited';
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove activity', error: error.message });
  }
};

exports.regenerateDay = async (req, res) => {
  try {
    const { dayNumber, feedback } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const day = trip.itinerary.find((d) => d.dayNumber === Number(dayNumber));
    if (!day) return res.status(404).json({ message: 'Day not found' });

    const prompt = `
You are updating only Day ${dayNumber} of this trip.

Destination: ${trip.destination}
Budget tier: ${trip.budgetTier}
Interests: ${trip.interests.join(', ')}
Existing day JSON: ${JSON.stringify(day)}
Traveler feedback: ${feedback}

Return ONLY JSON in this structure:
{
  "dayNumber": ${dayNumber},
  "activities": [
    {
      "title": "string",
      "description": "string",
      "estimatedCostUSD": 0,
      "timeOfDay": "Morning"
    }
  ]
}

Keep it aligned with the overall trip.
`;

    const updatedDay = await callGemini(prompt);

    day.activities = updatedDay.activities || [];
    trip.status = 'edited';
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to regenerate day', error: error.message });
  }
};

exports.generatePackingList = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const prompt = buildPackingPrompt({
      destination: trip.destination,
      travelMonth: trip.travelMonth,
      itinerary: trip.itinerary
    });

    const aiResult = await callGemini(prompt);
    trip.packingList = aiResult.packingList || [];
    trip.status = 'edited';
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate packing list', error: error.message });
  }
};