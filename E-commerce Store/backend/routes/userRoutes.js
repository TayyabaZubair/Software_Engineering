const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const generateToken = require("../utils/generateToken");
const protect = require("../middleware/authMiddleware");
const { v4: uuid } = require("uuid");
const pool = require("../config/helpers");
const user = new User();

// match password

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    user.login(email, password, (result) => {
      if (result) {
        res.json({
          id: result.id,
          fname: result.fname,
          lname: result.lname,
          email: result.email,
          isAdmin: result.isAdmin,
          token: generateToken(result.id),
        });
      } else {
        res.status(401).json({
          message: "Email/password Invalid",
        });
      }
    });
  } else {
    res.status(401).json({
      message: "Enter valid Email/password.",
    });
  }
});

// @desc   Register a new user
// @route  POST /api/users/
// @access Public
router.post("/", async (req, res) => {
  let userInput = {
    id: uuid(),
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    fname: req.body.fname,
    lname: req.body.lname,
  };

  pool.query(
    `SELECT * FROM users WHERE email = ?`,
    [req.body.email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result[0]) {
          console.log("here");
          res.status(400).json({
            message: "User with this email already exist.",
          });
        } else {
          user.create(userInput, (user) => {
            if (user) {
              console.log(userInput.id);
              res.status(201).json({
                id: userInput.id,
                username: userInput.username,
                fname: userInput.fname,
                lname: userInput.lname,
                email: userInput.email,
                token: generateToken(userInput.id),
              });
            } else {
              res.status(400).json({
                message: "Invalid User Data",
              });
            }
          });
        }
      }
    }
  );
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
router.get("/profile", protect, async (req, res) => {
  console.log("User", req.id);
  user.find(req.id, (result) => {
    // console.log(req.id);
    if (result) {
      res.json({
        id: result.id,
        username: result.username,
        fname: result.fname,
        lname: result.lname,
        email: result.email,
        isAdmin: result.isAdmin,
      });
    } else {
      res.status(404).json({
        message: "user Not Found",
      });
    }
  });
  // console.log(req.id);
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
router.put("/profile", protect, async (req, res) => {
  let userId = req.id;
  // console.log(userId);

  // console.log(req.id);

  let userArray = [
    userId,
    req.body.username,
    req.body.fname,
    req.body.lname,
    req.body.email,
    req.body.password,
  ];

  user.update(userArray, (user) => {
    // console.log(user.id);
    if (user) {
      // console.log(user);
      res.json({
        id: user.id,
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user.id),
      });
    } else {
      res.status(404).json({
        message: "User Not Found.",
      });
    }
  });
  // console.log(req.id);
});

module.exports = router;
