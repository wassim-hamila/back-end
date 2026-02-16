const User = require('../models/User');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');

// @desc    Obtenir le profil utilisateur
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'name email')
      .populate('following', 'name email');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, weight, height, profilePicture } = req.body;

    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.age = age !== undefined ? age : user.age;
      user.weight = weight !== undefined ? weight : user.weight;
      user.height = height !== undefined ? height : user.height;
      user.profilePicture = profilePicture || user.profilePicture;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        weight: updatedUser.weight,
        height: updatedUser.height,
        profilePicture: updatedUser.profilePicture
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les statistiques de l'utilisateur
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Statistiques des workouts
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    
    const workoutStats = await Workout.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$caloriesBurned' },
          totalDuration: { $sum: '$duration' },
          avgCalories: { $avg: '$caloriesBurned' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Répartition par type d'exercice
    const workoutsByType = await Workout.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCalories: { $sum: '$caloriesBurned' },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Workouts des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWorkouts = await Workout.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
          calories: { $sum: '$caloriesBurned' },
          duration: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Statistiques des objectifs
    const totalGoals = await Goal.countDocuments({ user: userId });
    const completedGoals = await Goal.countDocuments({ user: userId, isCompleted: true });
    const activeGoals = await Goal.countDocuments({ user: userId, isCompleted: false });

    res.json({
      workouts: {
        total: totalWorkouts,
        stats: workoutStats[0] || {
          totalCalories: 0,
          totalDuration: 0,
          avgCalories: 0,
          avgDuration: 0
        },
        byType: workoutsByType,
        recent: recentWorkouts
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        active: activeGoals,
        completionRate: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suivre un utilisateur (Bonus)
// @route   POST /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous suivre vous-même' });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Vous suivez déjà cet utilisateur' });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: 'Utilisateur suivi avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ne plus suivre un utilisateur (Bonus)
// @route   DELETE /api/users/follow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'Utilisateur retiré des abonnements' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir le feed social (Bonus)
// @route   GET /api/users/feed
// @access  Private
exports.getSocialFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    const feedWorkouts = await Workout.find({
      user: { $in: currentUser.following }
    })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    const recentAchievements = await Goal.find({
      user: { $in: currentUser.following },
      isCompleted: true
    })
      .populate('user', 'name profilePicture')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      workouts: feedWorkouts,
      achievements: recentAchievements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};