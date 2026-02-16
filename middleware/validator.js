const { body, validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('L\'âge doit être entre 13 et 120 ans'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 300 })
    .withMessage('Le poids doit être entre 20 et 300 kg'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('La taille doit être entre 50 et 300 cm')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide'),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

exports.workoutValidation = [
  body('type')
    .notEmpty()
    .withMessage('Le type d\'entraînement est requis')
    .isIn(['Cardio', 'Musculation', 'Yoga', 'Course', 'Natation', 'Cyclisme', 'Autre'])
    .withMessage('Type invalide'),
  
  body('duration')
    .notEmpty()
    .withMessage('La durée est requise')
    .isInt({ min: 1, max: 1440 })
    .withMessage('La durée doit être entre 1 et 1440 minutes'),
  
  body('caloriesBurned')
    .notEmpty()
    .withMessage('Les calories sont requises')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Les calories doivent être entre 0 et 10000'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date invalide'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères')
];

// FIX: Validation des objectifs SANS custom validator
exports.goalValidation = [
  body('type')
    .notEmpty()
    .withMessage('Le type d\'objectif est requis')
    .isIn(['Poids', 'Heures d\'entraînement', 'Calories brûlées', 'Distance', 'Autre'])
    .withMessage('Type invalide'),
  
  body('targetValue')
    .notEmpty()
    .withMessage('La valeur cible est requise')
    .isFloat({ min: 0.1 })
    .withMessage('La valeur cible doit être positive'),
  
  body('currentValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La valeur actuelle doit être positive'),
  
  body('deadline')
    .notEmpty()
    .withMessage('La date limite est requise')
    .isISO8601()
    .withMessage('Date invalide'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
];