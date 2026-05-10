const mongoose = require('mongoose');

const STANDARD_EXERCISES = [
  'Clean+Squat+Press',
  'Half Snatch',
  'Swing',
];

const BLOCK_DURATION_SECONDS = 120;
const ROUNDS_PER_SESSION = 3;
const REST_BETWEEN_ROUNDS_SECONDS = 60;

const exerciseBlockSchema = new mongoose.Schema(
  {
    exercise: {
      type: String,
      required: true,
      enum: STANDARD_EXERCISES,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 1,
      default: BLOCK_DURATION_SECONDS,
    },
  },
  { _id: false }
);

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

const createDefaultBlocks = () =>
  STANDARD_EXERCISES.map((exercise) => ({
    exercise,
    durationSeconds: BLOCK_DURATION_SECONDS,
  }));

const createDefaultRounds = () =>
  Array.from({ length: ROUNDS_PER_SESSION }, (_, index) => ({
    roundNumber: index + 1,
    blocks: createDefaultBlocks(),
  }));

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
      default: createDefaultRounds,
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

// Virtual exposes the fixed work volume to simplify API responses and dashboards.
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
