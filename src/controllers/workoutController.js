const mongoose = require('mongoose');
const Workout = require('../models/Workout');

const EXERCISES = [
  'Clean+Squat+Press',
  'Half Snatch',
  'Swing',
];

const BLOCK_DURATION_SECONDS = 120;
const TOTAL_ROUNDS = 3;
const REST_BETWEEN_ROUNDS_SECONDS = 60;

const buildRounds = () =>
  Array.from({ length: TOTAL_ROUNDS }, (_, index) => ({
    roundNumber: index + 1,
    blocks: EXERCISES.map((exercise) => ({
      exercise,
      durationSeconds: BLOCK_DURATION_SECONDS,
    })),
  }));

/**
 * Converts Mongoose validation details into a field-based object for API consumers.
 */
const mapValidationErrors = (errors) =>
  Object.values(errors).reduce((accumulator, currentError) => {
    accumulator[currentError.path] = currentError.message;
    return accumulator;
  }, {});

const createWorkout = async (req, res) => {
  try {
    const workoutPayload = req.body;
    const workout = await Workout.create(workoutPayload);

    return res.status(201).json({
      message: 'Workout created successfully',
      data: workout,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid workout payload. Please review required fields and value ranges.',
        errors: mapValidationErrors(error.errors),
      });
    }

    return res.status(500).json({
      message: 'Error creating workout',
      error: error.message,
    });
  }
};

const seedWorkout = async (_req, res) => {
  try {
    const workout = await Workout.create({
      title: 'Kettlebell HIIT Standard Session',
      rounds: buildRounds(),
      restBetweenRoundsSeconds: REST_BETWEEN_ROUNDS_SECONDS,
    });

    return res.status(201).json({
      message: 'Workout seeded successfully',
      data: workout,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error seeding workout',
      error: error.message,
    });
  }
};

const getWorkouts = async (_req, res) => {
  try {
    const workouts = await Workout.find().sort({ createdAt: -1 });

    if (workouts.length === 0) {
      return res.status(200).json({
        message: 'No workouts found yet. Seed your first routine with POST /api/workouts/seed.',
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Workouts fetched successfully',
      data: workouts,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching workouts',
      error: error.message,
    });
  }
};

const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid workout ID format. Please provide a valid MongoDB ObjectId.',
      });
    }

    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({
        message: 'Workout not found.',
      });
    }

    return res.status(200).json({
      message: 'Workout fetched successfully',
      data: workout,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching workout by ID',
      error: error.message,
    });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid workout ID format. Please provide a valid MongoDB ObjectId.',
      });
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedWorkout) {
      return res.status(404).json({
        message: 'Workout not found.',
      });
    }

    return res.status(200).json({
      message: 'Workout updated successfully',
      data: updatedWorkout,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid workout payload. Please review the request body.',
        error: error.message,
      });
    }

    return res.status(500).json({
      message: 'Error updating workout',
      error: error.message,
    });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid workout ID format. Please provide a valid MongoDB ObjectId.',
      });
    }

    const deletedWorkout = await Workout.findByIdAndDelete(id);

    if (!deletedWorkout) {
      return res.status(404).json({
        message: 'Workout not found.',
      });
    }

    return res.status(200).json({
      message: 'Workout deleted successfully',
      data: deletedWorkout,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting workout',
      error: error.message,
    });
  }
};

module.exports = {
  createWorkout,
  seedWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};
