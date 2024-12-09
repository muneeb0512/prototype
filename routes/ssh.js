
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Inventory = require('../models/Inventory');
const Basket = require('../models/Basket');
const BasketItem = require('../models/BasketItem');


router.get("/home",(req,res)=>{
  res.locals.activePage = 'home';
    res.render("index");
})


router.get('/order', ensureAuthenticated, async (req, res) => {
  res.locals.activePage = 'order';
  try {
    
    const items = await Inventory.find();
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
    let basket = await Basket.findOne({ household: householdId, status: 'active' });

    if (!basket) {
      basket = new Basket({
        household: householdId,
      });
      await basket.save();
    }

    const basketItem = new BasketItem({
      basket: basket._id,
      item: itemId,
      user: req.user._id,
      quantity,
    });

    await basketItem.save();

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
      
      const basket = await Basket.findOne({ household: householdId, status: 'active' });
  
      if (!basket) {
        return res.render('basket', { items: [] }); 
      }
  
      const items = await BasketItem.find({ basket: basket._id })
        .populate('item')
        .populate('user');
  
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
    const basket = await Basket.findOne({ household: householdId, status: 'active' });

    if (!basket) {
      req.flash('error_msg', 'No active basket to place an order');
      return res.redirect('/ssh/basket');
    }

    basket.status = 'completed';
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
