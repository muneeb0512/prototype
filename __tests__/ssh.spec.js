const {
  getOrderItems,
  addItemToBasket,
  getBasketItems,
  placeOrder
} = require("../services/sshservices.js");

  const Inventory = require('../models/Inventory');
  const Basket = require('../models/Basket');
  const BasketItem = require('../models/BasketItem');
  
  
  jest.mock('../models/Inventory', () => ({
    find: jest.fn()
  }));
  
  jest.mock('../models/Basket', () => {
    const basketMock = jest.fn((data) => ({
      ...data,
      save: jest.fn()
    }));
    basketMock.findOne = jest.fn();
    return basketMock;
  });
  
  jest.mock('../models/BasketItem', () => {
    const basketItemMock = jest.fn((data) => ({
      ...data,
      save: jest.fn()
    }));
    basketItemMock.find = jest.fn();
    return basketItemMock;
  });
  
 
  
  
  
  
  
  
  describe('SSH Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('getOrderItems', () => {
      it('should return items from Inventory', async () => {
        const mockItems = [{ name: 'Item1' }, { name: 'Item2' }];
        Inventory.find.mockResolvedValue(mockItems);
  
        const items = await getOrderItems();
        expect(Inventory.find).toHaveBeenCalled();
        expect(items).toEqual(mockItems);
      });
  
      it('should throw if Inventory.find fails', async () => {
        Inventory.find.mockRejectedValue(new Error('DB Error'));
        await expect(getOrderItems()).rejects.toThrow('DB Error');
      });
    });
  
    describe('addItemToBasket', () => {
      it('should create a new basket if none exists and add an item', async () => {
        Basket.findOne.mockResolvedValue(null);
  
        const basketSaveMock = jest.fn();
        Basket.mockImplementation((data) => ({ ...data, save: basketSaveMock }));
  
        const basketItemSaveMock = jest.fn();
        BasketItem.mockImplementation((data) => ({ ...data, save: basketItemSaveMock }));
  
        await addItemToBasket('household123', 'user456', 'item789', 2);
  
        expect(Basket.findOne).toHaveBeenCalledWith({ household: 'household123', status: 'active' });
        expect(basketSaveMock).toHaveBeenCalled();
        expect(basketItemSaveMock).toHaveBeenCalled();
      });
  
      it('should add an item to an existing basket', async () => {
        const existingBasket = { _id: 'existingBasketId' };
        Basket.findOne.mockResolvedValue(existingBasket);
  
        const basketItemSaveMock = jest.fn();
        BasketItem.mockImplementation((data) => ({ ...data, save: basketItemSaveMock }));
  
        await addItemToBasket('household123', 'user456', 'item789', 2);
        expect(Basket.findOne).toHaveBeenCalledWith({ household: 'household123', status: 'active' });
        expect(basketItemSaveMock).toHaveBeenCalled();
      });
  
      it('should throw if saving basket item fails', async () => {
        const existingBasket = { _id: 'existingBasketId' };
        Basket.findOne.mockResolvedValue(existingBasket);
  
        BasketItem.mockImplementation((data) => ({
          ...data,
          save: jest.fn().mockRejectedValue(new Error('Save error'))
        }));
  
        await expect(addItemToBasket('household123', 'user456', 'item789', 2)).rejects.toThrow('Save error');
      });
    });
  
    describe('getBasketItems', () => {
      it('should return empty array if no active basket found', async () => {
        Basket.findOne.mockResolvedValue(null);
        const items = await getBasketItems('household123');
        expect(Basket.findOne).toHaveBeenCalledWith({ household: 'household123', status: 'active' });
        expect(items).toEqual([]);
      });
  
      it('should return basket items if basket found', async () => {
        const basket = { _id: 'basket123' };
        Basket.findOne.mockResolvedValue(basket);
  
        const mockItems = [
          { basket: 'basket123', item: { name: 'Item1' }, user: { name: 'User1' }, quantity: 2 },
          { basket: 'basket123', item: { name: 'Item2' }, user: { name: 'User2' }, quantity: 1 }
        ];
  
        const mockPopulate = jest.fn().mockReturnThis();
        const mockQuery = {
          populate: mockPopulate,
          then: (resolve) => resolve(mockItems)
        };
  
        BasketItem.find.mockReturnValue(mockQuery);
  
        const items = await getBasketItems('household123');
        expect(Basket.findOne).toHaveBeenCalledWith({ household: 'household123', status: 'active' });
        expect(BasketItem.find).toHaveBeenCalledWith({ basket: 'basket123' });
        expect(mockPopulate).toHaveBeenCalledTimes(2);
        expect(items).toEqual(mockItems);
      });
  
      it('should throw if Basket.findOne fails', async () => {
        Basket.findOne.mockRejectedValue(new Error('DB Error'));
        await expect(getBasketItems('household123')).rejects.toThrow('DB Error');
      });
    });
  
    describe('placeOrder', () => {
      it('should throw if no active basket', async () => {
        Basket.findOne.mockResolvedValue(null);
        await expect(placeOrder('household123')).rejects.toThrow('No active basket to place an order');
      });
  
      it('should mark basket as completed and save it', async () => {
        const mockBasketSave = jest.fn();
        const existingBasket = { _id: 'basket123', status: 'active', save: mockBasketSave };
        Basket.findOne.mockResolvedValue(existingBasket);
  
        const result = await placeOrder('household123');
        expect(Basket.findOne).toHaveBeenCalledWith({ household: 'household123', status: 'active' });
        expect(existingBasket.status).toBe('completed');
        expect(mockBasketSave).toHaveBeenCalled();
        expect(result).toBe(existingBasket);
      });
  
      it('should throw if Basket.findOne fails', async () => {
        Basket.findOne.mockRejectedValue(new Error('DB Error'));
        await expect(placeOrder('household123')).rejects.toThrow('DB Error');
      });
    });
  });
  