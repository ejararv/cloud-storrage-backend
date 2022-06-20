const Router = require("express");
const User = require("../models/User");
const router = new Router();
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("./../middleware/auth.middleware");
const fileService = require("./../services/fileService");
const File = require("./../models/File");

router.post(
  "/registration",
  [
    check("email", "Uncorrect email").isEmail(),
    check("password", "Password must be longer than 6 characters").isLength({
      min: 6,
      max: 13,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Request error", errors });
      }
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: `User with email ${email} already exist` });
      }

      const hashPassword = await bcrypt.hash(password, 4);

      const user = new User({ email, password: hashPassword });

      await user.save();
      await fileService.createDir(req, new File({ user: user.id, name: "" }));

      return res.json({ message: "User was created" });
    } catch (error) {
      console.log(error);
      res.send({ message: "Server Error" });
    }
  }
);

router.post(
  "/login",

  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPassValid = bcrypt.compareSync(password, user.password);
      if (!isPassValid) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
        expiresIn: "1h",
      });
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          diskSpace: user.diskSpace,
          usedSpace: user.usedSpace,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.log(error);
      res.send({ message: "Server Error" });
    }
  }
);

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({ message: "Server Error" });
  }
});

module.exports = router;
