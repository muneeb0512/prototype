const Inventory = require('../models/Inventory');
const Basket = require('../models/Basket');
const BasketItem = require('../models/BasketItem');


async function getOrderItems() {
    const items = await Inventory.find();
    return items;
  }
  
  async function addItemToBasket(householdId, userId, itemId, quantity) {
    let basket = await Basket.findOne({ household: householdId, status: 'active' });
    if (!basket) {
      basket = new Basket({ household: householdId });
      await basket.save();
    }


    const basketItem = new BasketItem({
        basket: basket._id,
        item: itemId,
        user: userId,
        quantity,
      });
      
      await basketItem.save();
      return basketItem; 
}



async function getBasketItems(householdId) {
    const basket = await Basket.findOne({ household: householdId, status: 'active' });
    if (!basket) {
      return [];
    }
  
    const items = await BasketItem.find({ basket: basket._id })
      .populate('item')
      .populate('user');
    return items;
  }

 async function placeOrder(householdId) {
    const basket = await Basket.findOne({ household: householdId, status: 'active' });
    if (!basket) {
      throw new Error('No active basket to place an order');
    }
  
    basket.status = 'completed';
    await basket.save();
    return basket;
  }

  module.exports = {
    getOrderItems,
    addItemToBasket,
    getBasketItems,
    placeOrder
  };