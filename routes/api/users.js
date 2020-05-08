const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const normalize = require("normalize-url");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Include a valid email").isEmail(),
    check("password", "Enter a Password with 6 or moe characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;
    try {
      //See if user exists
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ message: "User already exists" }] });
      }

      //Get users gravatar image
      const avatar = normalize(
        gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm",
        })
      );

      user = new User({
        name: name,
        email: email,
        password: password,
        avatar: avatar,
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error!");
    }
  }
);

module.exports = router;
