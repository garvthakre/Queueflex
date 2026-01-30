const authService = require("../services/authService");

class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password, is_admin } = req.body;
      const result = await authService.signup(name, email, password, is_admin);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      const statusCode =
        error.message === "User not found"
          ? 404
          : error.message === "Incorrect password"
          ? 403
          : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
