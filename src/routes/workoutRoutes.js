const express = require('express');

const {
	createWorkout,
	seedWorkout,
	getWorkouts,
	getWorkoutById,
	updateWorkout,
	deleteWorkout,
} = require('../controllers/workoutController');

const router = express.Router();

router.get('/', getWorkouts);
router.post('/', createWorkout);
router.get('/:id', getWorkoutById);
router.post('/seed', seedWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
