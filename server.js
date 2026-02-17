const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
app.use(cors({
  origin: "https://front-end-05.vercel.app",
  credentials: true
}));
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: '🏋️ API Fitness Tracker',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      workouts: '/api/workouts',
      goals: '/api/goals',
      users: '/api/users'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Error handler (doit être en dernier)
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🏋️  SERVEUR DÉMARRÉ AVEC SUCCÈS  🏋️    ║
╠══════════════════════════════════════════╣
║  Port: ${PORT}                             ║
║  Environnement: ${process.env.NODE_ENV || 'development'}              ║
║  URL: http://localhost:${PORT}             ║
╚══════════════════════════════════════════╝
  `);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.log('❌ ERREUR NON GÉRÉE:', err.message);
  process.exit(1);
});
