import MenuRepository from '../repositories/MenuRepository';
import { MenuItem, OrderItem } from '../models';
import { MenuItemCategory } from '../models/MenuItem';
import sequelize from '../config/database';

describe('MenuRepository', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await OrderItem.destroy({ where: {} });
    await MenuItem.destroy({ where: {} });
  });

  describe('create', () => {
    it('should create a menu item successfully', async () => {
      const menuItemData = {
        name: 'Test Burger',
        description: 'A delicious test burger',
        price: 12.99,
        category: MenuItemCategory.MAIN_COURSE
      };

      const menuItem = await MenuRepository.create(menuItemData);

      expect(menuItem).toBeDefined();
      expect(menuItem.id).toBeDefined();
      expect(menuItem.name).toBe(menuItemData.name);
      expect(menuItem.description).toBe(menuItemData.description);
      expect(Number(menuItem.price)).toBe(menuItemData.price);
      expect(menuItem.category).toBe(menuItemData.category);
    });
  });

  describe('findById', () => {
    it('should find a menu item by id', async () => {
      const menuItemData = {
        name: 'Test Burger',
        description: 'A delicious test burger',
        price: 12.99,
        category: MenuItemCategory.MAIN_COURSE
      };

      const createdItem = await MenuRepository.create(menuItemData);
      const foundItem = await MenuRepository.findById(createdItem.id);

      expect(foundItem).toBeDefined();
      expect(foundItem?.id).toBe(createdItem.id);
      expect(foundItem?.name).toBe(menuItemData.name);
    });

    it('should return null if menu item does not exist', async () => {
      const foundItem = await MenuRepository.findById(9999);
      expect(foundItem).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await MenuRepository.create({
        name: 'Burger',
        description: 'A delicious burger',
        price: 12.99,
        category: MenuItemCategory.MAIN_COURSE
      });

      await MenuRepository.create({
        name: 'Pizza',
        description: 'A delicious pizza',
        price: 15.99,
        category: MenuItemCategory.MAIN_COURSE
      });

      await MenuRepository.create({
        name: 'Salad',
        description: 'A fresh salad',
        price: 8.99,
        category: MenuItemCategory.STARTER
      });

      await MenuRepository.create({
        name: 'Ice Cream',
        description: 'A cold dessert',
        price: 5.99,
        category: MenuItemCategory.DESSERT
      });
    });

    it('should return all menu items when no options are provided', async () => {
      const result = await MenuRepository.findAll();

      expect(result.count).toBe(4);
      expect(result.rows.length).toBe(4);
    });

    it('should apply pagination correctly', async () => {
      const result = await MenuRepository.findAll({
        limit: 2,
        offset: 0
      });

      expect(result.count).toBe(4);
      expect(result.rows.length).toBe(2);
    });

    it('should filter by category', async () => {
      const result = await MenuRepository.findAll({
        category: MenuItemCategory.MAIN_COURSE
      });

      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(2);

      const categories = result.rows.map(item => item.category);
      expect(categories.every(category => category === MenuItemCategory.MAIN_COURSE)).toBe(true);
    });

    it('should combine pagination and category filter', async () => {
      const result = await MenuRepository.findAll({
        limit: 1,
        offset: 0,
        category: MenuItemCategory.MAIN_COURSE
      });

      expect(result.count).toBe(2);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].category).toBe(MenuItemCategory.MAIN_COURSE);
    });

    it('should return empty array when no items match the category', async () => {
      await MenuItem.destroy({ where: { category: MenuItemCategory.DRINK } });

      const result = await MenuRepository.findAll({
        category: MenuItemCategory.DRINK
      });

      expect(result.count).toBe(0);
      expect(result.rows.length).toBe(0);
    });
  });
}); 
