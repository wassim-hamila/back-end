const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { goalValidation, validate } = require('../middleware/validator');

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal); // Sans validation temporairement

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, goalValidation, validate, updateGoal)
  .delete(protect, deleteGoal);

module.exports = router;