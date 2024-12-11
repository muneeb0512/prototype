
const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/User');
const Household = require('../models/Household');
const bcrypt = require('bcryptjs');




router.get('/register', (req, res) => {
  res.locals.activePage = 'register';
  res.render('register');
});



router.post('/register', async (req, res) => {
  const { name, email, password, householdName } = req.body;
  let errors = [];

  if (!name || !email || !password || !householdName) {
    errors.push({ msg: 'Please fill in all required fields.' });
    
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      errors.push({ msg: 'This email is already registered. Try logging in.' });
    }
    if (errors.length > 0) {
      return res.render('register', { errors, name, email, householdName });
    }

    const sanitizedHouseholdName = householdName.trim().toLowerCase();

    
    let household = await Household.findOne({ household_name: sanitizedHouseholdName });
    if(household){
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
      
        user = new User({
          name,
          email,
          password_hash,
          household: household.id,
        });

        await user.save();

        req.flash('success_msg', 'Registration successful! You can now log in.');
        req.flash('info_msg', `Joined existing household "${householdName}".`);

        res.redirect('/login');


    }else {
      try {
        household = new Household({ household_name: sanitizedHouseholdName });
        await household.save();
      }catch(err){
        console.error('Error saving new household:', err.message, err.stack);
        req.flash('error_msg', 'An error occurred while creating the household. Please try again later.');
        return res.redirect('/register');

      }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
      
        user = new User({
          name,
          email,
          password_hash,
          household: household._id,
        });

        await user.save();

        req.flash('success_msg', 'Registration successful! You can now log in.');
        req.flash('info_msg', `New household"${householdName} created successfully".`);
        res.redirect('/login');

      } 
    } catch (e) {
    console.error('Error during registration:', e.message, e.stack);
    req.flash('error_msg', 'An unexpected error occurred. Please try again later.');
    res.redirect('/register');
  }
});



router.get('/login', (req, res) => {
  res.locals.activePage = 'login';
    res.render('login');
  });




router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    let errors = [];
  
    
    if (!email) {
      errors.push({ msg: 'Please enter your email address.' });
    }
    if (!password) {
      errors.push({ msg: 'Please enter your password.' });
    }
  
    
    if (errors.length > 0) {
      return res.render('login', { errors, email });
    }
  
    passport.authenticate('local', (err, user, info) => {
      if (err) {
       
        errors.push({ msg: 'An unexpected error occurred. Please try again.' });
        return res.render('login', { errors, email });
      }
      if (!user) {
       
        errors.push({ msg: info ? info.message : 'Invalid email or password.' });
        return res.render('login', { errors, email });
      }
      req.logIn(user, (err) => {
        if (err) {
          
          errors.push({ msg: 'Failed to log you in. Please try again.' });
          return res.render('login', { errors, email });
        }
     
        req.flash('success_msg', 'You have successfully logged in!');
        return res.redirect('/ssh/order');
      });
    })(req, res, next);
  });
  
  

  
  
  router.get('/logout', (req, res) => {
    req.logout(() => {
      req.flash('success_msg', 'You are logged out');
      res.redirect('/login');
    });
  });
  
  module.exports = router;
