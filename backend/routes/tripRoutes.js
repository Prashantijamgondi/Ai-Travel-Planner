const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addActivity,
  removeActivity,
  regenerateDay,
  generatePackingList
} = require('../controllers/tripController');

router.use(auth);

router.get('/', getTrips);
router.post('/generate', generateTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/add-activity', addActivity);
router.delete('/:id/days/:dayNumber/activities/:activityId', removeActivity);
router.post('/:id/regenerate-day', regenerateDay);
router.post('/:id/packing', generatePackingList);

module.exports = router;