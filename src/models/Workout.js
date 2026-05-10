const mongoose = require('mongoose');

const STANDARD_EXERCISES = [
  'Clean+Squat+Press',
  'Half Snatch',
  'Swing',
];

const ROUNDS_PER_SESSION = 3;
const REST_BETWEEN_ROUNDS_SECONDS = 60;

/**
 * Training performance captured for a single exercise block.
 * Stores effort and output metrics so each workout works as a log entry.
 */
const exerciseBlockSchema = new mongoose.Schema(
  {
    exercise: {
      type: String,
      required: true,
      trim: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      min: 0,
    },
    reps: {
      type: Number,
      min: 0,
    },
    rpe: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

/**
 * Round container that keeps a predictable 3-round session structure.
 */
const roundSchema = new mongoose.Schema(
  {
    roundNumber: {
      type: Number,
      required: true,
      min: 1,
      max: ROUNDS_PER_SESSION,
    },
    blocks: {
      type: [exerciseBlockSchema],
      required: true,
      validate: {
        validator: (blocks) => blocks.length === STANDARD_EXERCISES.length,
        message: `Each round must contain exactly ${STANDARD_EXERCISES.length} exercise blocks.`,
      },
    },
  },
  { _id: false }
);

/**
 * Training log entry schema.
 * Includes structure defaults plus per-workout metadata and audit timestamps.
 */
const workoutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rounds: {
      type: [roundSchema],
      required: true,
      validate: {
        validator: (rounds) => rounds.length === ROUNDS_PER_SESSION,
        message: `A workout session must include exactly ${ROUNDS_PER_SESSION} rounds.`,
      },
    },
    restBetweenRoundsSeconds: {
      type: Number,
      required: true,
      default: REST_BETWEEN_ROUNDS_SECONDS,
      min: 0,
    },
    workoutDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual exposes calculated work volume for API responses and dashboards.
workoutSchema.virtual('totalWorkDurationSeconds').get(function totalWorkDurationSeconds() {
  return this.rounds.reduce(
    (roundTotal, round) =>
      roundTotal + round.blocks.reduce((blockTotal, block) => blockTotal + block.durationSeconds, 0),
    0
  );
});

workoutSchema.set('toJSON', { virtuals: true });
workoutSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Workout', workoutSchema);
