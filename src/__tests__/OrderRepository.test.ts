import OrderRepository from '../repositories/OrderRepository';
import { Customer, Order, OrderItem, MenuItem } from '../models';
import { MenuItemCategory } from '../models/MenuItem';
import { OrderStatus } from '../models/Order';
import sequelize from '../config/database';

describe('OrderRepository', () => {
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
    it('should create an order successfully', async () => {
      const customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      });

      const orderData = {
        customerId: customer.id,
        items: []
      };

      const order = await OrderRepository.create(orderData);

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.customerId).toBe(customer.id);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(Number(order.totalAmount)).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find an order by id with its items', async () => {
      const customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      });

      const burger = await MenuItem.create({
        name: 'Burger',
        description: 'Beef burger',
        price: 10.00,
        category: MenuItemCategory.MAIN_COURSE
      });

      const order = await Order.create({
        customerId: customer.id,
        status: OrderStatus.PENDING,
        totalAmount: 10.00
      });

      await OrderItem.create({
        orderId: order.id,
        menuItemId: burger.id,
        quantity: 1,
        unitPrice: 10.00,
        subtotal: 10.00
      });

      const foundOrder = await OrderRepository.findById(order.id);

      expect(foundOrder).toBeDefined();
      expect(foundOrder?.id).toBe(order.id);
      expect(foundOrder?.status).toBe(OrderStatus.PENDING);
      expect(foundOrder?.items).toBeDefined();
      if (foundOrder?.items) {
        expect(foundOrder.items.length).toBe(1);
        expect(foundOrder.items[0].menuItemId).toBe(burger.id);
        expect(foundOrder.items[0].quantity).toBe(1);
      }
    });

    it('should return null if order does not exist', async () => {
      const foundOrder = await OrderRepository.findById(9999);
      expect(foundOrder).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      });

      const order = await Order.create({
        customerId: customer.id,
        status: OrderStatus.PENDING,
        totalAmount: 0
      });

      const updatedOrder = await OrderRepository.updateStatus(order.id, OrderStatus.PREPARING);

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe(OrderStatus.PREPARING);
    });

    it('should return null if order does not exist', async () => {
      const updatedOrder = await OrderRepository.updateStatus(9999, OrderStatus.PREPARING);
      expect(updatedOrder).toBeNull();
    });
  });

  describe('createOrderItems', () => {
    let orderId: number;
    let menuItem1: MenuItem;
    let menuItem2: MenuItem;

    beforeEach(async () => {
      const customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      });

      const order = await Order.create({
        customerId: customer.id,
        status: OrderStatus.PENDING,
        totalAmount: 0
      });

      orderId = order.id;

      menuItem1 = await MenuItem.create({
        name: 'Burger',
        description: 'Beef burger',
        price: 10.00,
        category: MenuItemCategory.MAIN_COURSE
      });

      menuItem2 = await MenuItem.create({
        name: 'Fries',
        description: 'French fries',
        price: 5.00,
        category: MenuItemCategory.STARTER
      });
    });

    it('should create order items and update order total successfully', async () => {
      const items = [
        {
          menuItemId: menuItem1.id,
          quantity: 2
        },
        {
          menuItemId: menuItem2.id,
          quantity: 1
        }
      ];

      const orderItems = await OrderRepository.createOrderItems(
        orderId,
        items,
        [menuItem1, menuItem2]
      );

      expect(orderItems.length).toBe(2);

      const burger = orderItems.find(item => item.menuItemId === menuItem1.id);
      const fries = orderItems.find(item => item.menuItemId === menuItem2.id);

      expect(burger).toBeDefined();
      if (burger) {
        expect(burger.quantity).toBe(2);
        expect(Number(burger.unitPrice)).toBe(10.00);
        expect(Number(burger.subtotal)).toBe(20.00);
      }

      expect(fries).toBeDefined();
      if (fries) {
        expect(fries.quantity).toBe(1);
        expect(Number(fries.unitPrice)).toBe(5.00);
        expect(Number(fries.subtotal)).toBe(5.00);
      }

      const updatedOrder = await Order.findByPk(orderId);
      expect(Number(updatedOrder?.totalAmount)).toBe(25.00);
    });
  });

  describe('removeOrderItems', () => {
    let orderId: number;

    beforeEach(async () => {
      const customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      });

      const order = await Order.create({
        customerId: customer.id,
        status: OrderStatus.PENDING,
        totalAmount: 0
      });

      orderId = order.id;

      const burger = await MenuItem.create({
        name: 'Burger',
        description: 'Beef burger',
        price: 10.00,
        category: MenuItemCategory.MAIN_COURSE
      });

      await OrderItem.create({
        orderId,
        menuItemId: burger.id,
        quantity: 1,
        unitPrice: 10.00,
        subtotal: 10.00
      });

      const fries = await MenuItem.create({
        name: 'Fries',
        description: 'French fries',
        price: 5.00,
        category: MenuItemCategory.STARTER
      });

      await OrderItem.create({
        orderId,
        menuItemId: fries.id,
        quantity: 1,
        unitPrice: 5.00,
        subtotal: 5.00
      });
    });

    it('should remove all order items', async () => {
      const count = await OrderRepository.removeOrderItems(orderId);

      expect(count).toBe(2);

      const remainingItems = await OrderItem.findAll({ where: { orderId } });
      expect(remainingItems.length).toBe(0);
    });

    it('should return 0 if order has no items', async () => {
      const customer = await Customer.create({
        name: 'Another Customer',
        email: 'another@example.com',
        phone: '0987654321',
      });

      const emptyOrder = await Order.create({
        customerId: customer.id,
        status: OrderStatus.PENDING,
        totalAmount: 0
      });

      const count = await OrderRepository.removeOrderItems(emptyOrder.id);
      expect(count).toBe(0);
    });
  });
}); 
