import CustomerRepository from '../repositories/CustomerRepository';
import { Customer, Order, OrderItem, MenuItem } from '../models';
import { MenuItemCategory } from '../models/MenuItem';
import { OrderStatus } from '../models/Order';

import sequelize from '../config/database';

describe('CustomerRepository', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Customer.destroy({ where: {} });
    await MenuItem.destroy({ where: {} });
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      };

      const customer = await CustomerRepository.create(customerData);

      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe(customerData.name);
      expect(customer.email).toBe(customerData.email);
      expect(customer.phone).toBe(customerData.phone);
    });
  });

  describe('findById', () => {
    it('should find a customer by id', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      };

      const createdCustomer = await CustomerRepository.create(customerData);
      const foundCustomer = await CustomerRepository.findById(createdCustomer.id);

      expect(foundCustomer).toBeDefined();
      expect(foundCustomer?.id).toBe(createdCustomer.id);
      expect(foundCustomer?.name).toBe(customerData.name);
    });

    it('should return null if customer does not exist', async () => {
      const foundCustomer = await CustomerRepository.findById(9999);
      expect(foundCustomer).toBeNull();
    });
  });

  describe('getCustomerOrders', () => {
    let customerId: number;

    beforeEach(async () => {
      const customerData = {
        name: 'Order Customer',
        email: 'orders@example.com',
        phone: '1234567890',
      };

      const customer = await CustomerRepository.create(customerData);
      customerId = customer.id;

      const burger = await MenuItem.create({
        name: 'Burger',
        description: 'Beef burger',
        price: 10.00,
        category: MenuItemCategory.MAIN_COURSE
      });

      const fries = await MenuItem.create({
        name: 'Fries',
        description: 'French fries',
        price: 5.00,
        category: MenuItemCategory.STARTER
      });

      const order1 = await Order.create({
        customerId,
        status: OrderStatus.DELIVERED,
        totalAmount: 15.00
      });

      await OrderItem.create({
        orderId: order1.id,
        menuItemId: burger.id,
        quantity: 1,
        unitPrice: 10.00,
        subtotal: 10.00
      });

      await OrderItem.create({
        orderId: order1.id,
        menuItemId: fries.id,
        quantity: 1,
        unitPrice: 5.00,
        subtotal: 5.00
      });

      const order2 = await Order.create({
        customerId,
        status: OrderStatus.PENDING,
        totalAmount: 20.00
      });

      await OrderItem.create({
        orderId: order2.id,
        menuItemId: burger.id,
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00
      });
    });

    it('should get customer orders with pagination', async () => {
      const result = await CustomerRepository.getCustomerOrders(customerId, { limit: 1, offset: 0 });

      expect(result.count).toBe(3);
      expect(result.rows.length).toBe(1);

      const order = result.rows[0];
      expect(Number(order.totalAmount)).toBe(20.00);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.items).toBeDefined();
      if (order.items) {
        expect(order.items.length).toBe(1);
      }
    });

    it('should get all customer orders when limit is large enough', async () => {
      const result = await CustomerRepository.getCustomerOrders(customerId, { limit: 10, offset: 0 });

      expect(result.count).toBe(3);
      expect(result.rows.length).toBe(2);
    });

    it('should return empty array when customer has no orders', async () => {
      const newCustomer = await CustomerRepository.create({
        name: 'No Orders',
        email: 'noorders@example.com',
        phone: '9876543210',
      });

      const result = await CustomerRepository.getCustomerOrders(newCustomer.id, { limit: 10, offset: 0 });

      expect(result.count).toBe(0);
      expect(result.rows.length).toBe(0);
    });
  });
}); 
