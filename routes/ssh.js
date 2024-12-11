
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Inventory = require('../models/Inventory');
const Basket = require('../models/Basket');
const BasketItem = require('../models/BasketItem');

const {
  getOrderItems,
  addItemToBasket,
  getBasketItems,
  placeOrder
} = require("../services/sshservices.js");



router.get("/home",(req,res)=>{
  res.locals.activePage = 'home';
    res.render("index");
})


router.get('/order', ensureAuthenticated, async (req, res) => {
  res.locals.activePage = 'order';
  try {
    
    const items = await getOrderItems();
    res.render('order', { items });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load items');
    res.redirect('/');
  }
});







router.post('/order', ensureAuthenticated, async (req, res) => {
  const { itemId, quantity } = req.body;
  const householdId = req.user.household; 

  try {
    await addItemToBasket(req.user.household, req.user._id, req.body.itemId, req.body.quantity);
    req.flash('success_msg', 'Item added to basket');
    res.redirect('/ssh/basket');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add item to basket');
    res.redirect('/ssh/order');
  }
});


router.get('/basket', ensureAuthenticated, async (req, res) => {
    const householdId = req.user.household;
    res.locals.activePage = 'basket';
  
    try {
      const items = await getBasketItems(householdId);
      res.render('basket', { items });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to load basket');
      res.redirect('/ssh/order'); 
    }
  });
  


router.post('/place-order', ensureAuthenticated, async (req, res) => {
  const householdId = req.user.household;

  try {
    await placeOrder(householdId);
    await basket.save();

    req.flash('success_msg', 'Order placed successfully');
    res.redirect('/ssh/order');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to place order');
    res.redirect('/ssh/basket');
  }
});

module.exports = router;
