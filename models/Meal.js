const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation']
  },
  foods: [{
    name: String,
    quantity: Number,
    calories: Number
  }],
  totalCalories: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

mealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);