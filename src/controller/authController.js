const syncUserService = require("../services/auth.service");

const syncUserController = async (req, res) => {
  try {
    const user = await syncUserService(req.user);

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({message: error.message});
    console.log(error);
  }
};

module.exports = syncUserController;