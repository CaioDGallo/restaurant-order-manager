import OrderService from '../services/OrderService';
import { Customer, MenuItem, Order, OrderItem } from '../models';
import { MenuItemCategory } from '../models/MenuItem';
import { OrderStatus } from '../models/Order';

import sequelize from '../config/database';

describe('OrderService', () => {
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

	describe('createOrder', () => {
		let customerId: number;
		let menuItemId1: number;
		let menuItemId2: number;

		beforeEach(async () => {
			const customer = await Customer.create({
				name: 'Test Customer',
				email: 'customer@example.com',
				phone: '1234567890',
			});
			customerId = customer.id;

			const burger = await MenuItem.create({
				name: 'Burger',
				description: 'Beef burger',
				price: 10.00,
				category: MenuItemCategory.MAIN_COURSE
			});
			menuItemId1 = burger.id;

			const fries = await MenuItem.create({
				name: 'Fries',
				description: 'French fries',
				price: 5.00,
				category: MenuItemCategory.STARTER
			});
			menuItemId2 = fries.id;
		});

		it('should create an order successfully', async () => {
			const orderData = {
				customer_id: customerId,
				items: [
					{ menu_item_id: menuItemId1, quantity: 1 },
					{ menu_item_id: menuItemId2, quantity: 2 }
				]
			};

			const result = await OrderService.createOrder(orderData);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();
				expect(result.data.customerId).toBe(customerId);

				const orderItems = await OrderItem.findAll({ where: { orderId: result.data.id } });
				expect(orderItems.length).toBe(2);
			}
		});

		it('should return an error if customer does not exist', async () => {
			const orderData = {
				customer_id: 9999,
				items: [
					{ menu_item_id: menuItemId1, quantity: 1 }
				]
			};

			const result = await OrderService.createOrder(orderData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Customer not found');
			}
		});

		it('should return an error if items array is empty', async () => {
			const orderData = {
				customer_id: customerId,
				items: []
			};

			const result = await OrderService.createOrder(orderData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('At least one item is required');
			}
		});

		it('should return an error if item quantity is invalid', async () => {
			const orderData = {
				customer_id: customerId,
				items: [
					{ menu_item_id: menuItemId1, quantity: 0 }
				]
			};

			const result = await OrderService.createOrder(orderData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Quantity must be a positive integer for all items');
			}
		});

		it('should return an error if menu item does not exist', async () => {
			const orderData = {
				customer_id: customerId,
				items: [
					{ menu_item_id: 9999, quantity: 1 }
				]
			};

			const result = await OrderService.createOrder(orderData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('One or more menu items do not exist');
			}
		});
	});

	describe('updateOrderStatus', () => {
		let orderId: string;

		beforeEach(async () => {
			const customer = await Customer.create({
				name: 'Test Customer',
				email: 'customer@example.com',
				phone: '1234567890',
			});

			const order = await Order.create({
				customerId: customer.id,
				status: OrderStatus.PENDING,
				totalAmount: 0
			});

			orderId = order.id.toString();
		});

		it('should update order status successfully', async () => {
			const result = await OrderService.updateOrderStatus(orderId, OrderStatus.PREPARING);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();
				expect(result.data.status).toBe(OrderStatus.PREPARING);
			}
		});

		it('should return an error if order does not exist', async () => {
			const nonExistentOrderId = '99999';
			const result = await OrderService.updateOrderStatus(nonExistentOrderId, OrderStatus.PREPARING);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Order not found');
			}
		});

		it('should return an error if status is invalid', async () => {
			const result = await OrderService.updateOrderStatus(orderId, 'invalid_status');

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
				expect(result.error).toContain('Status must be one of');
			}
		});
	});

	describe('modifyOrder', () => {
		let customerId: number;
		let orderId: string;
		let menuItemId1: number;
		let menuItemId2: number;

		beforeEach(async () => {
			const customer = await Customer.create({
				name: 'Test Customer',
				email: 'customer@example.com',
				phone: '1234567890',
			});
			customerId = customer.id;

			const burger = await MenuItem.create({
				name: 'Burger',
				description: 'Beef burger',
				price: 10.00,
				category: MenuItemCategory.MAIN_COURSE
			});
			menuItemId1 = burger.id;

			const fries = await MenuItem.create({
				name: 'Fries',
				description: 'French fries',
				price: 5.00,
				category: MenuItemCategory.STARTER
			});
			menuItemId2 = fries.id;

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

			orderId = order.id.toString();
		});

		it('should modify an order successfully', async () => {
			const items = [
				{ menu_item_id: menuItemId1, quantity: 2 },
				{ menu_item_id: menuItemId2, quantity: 1 }
			];

			const result = await OrderService.modifyOrder(orderId, items);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();

				const orderItems = await OrderItem.findAll({ where: { orderId } });
				expect(orderItems.length).toBe(2);

				const burgerItem = orderItems.find(item => item.menuItemId === menuItemId1);
				const friesItem = orderItems.find(item => item.menuItemId === menuItemId2);

				expect(burgerItem).toBeDefined();
				expect(burgerItem?.quantity).toBe(2);

				expect(friesItem).toBeDefined();
				expect(friesItem?.quantity).toBe(1);
			}
		});

		it('should return an error if order does not exist', async () => {
			const nonExistentOrderId = '99999';
			const items = [
				{ menu_item_id: menuItemId1, quantity: 2 }
			];

			const result = await OrderService.modifyOrder(nonExistentOrderId, items);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Order not found');
			}
		});

		it('should return an error if order is not in pending or preparing status', async () => {
			await Order.update(
				{ status: OrderStatus.DELIVERED },
				{ where: { id: orderId } }
			);

			const items = [
				{ menu_item_id: menuItemId1, quantity: 2 }
			];

			const result = await OrderService.modifyOrder(orderId, items);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Only orders with status "pending" or "preparing" can be modified');
			}
		});

		it('should return an error if items array is empty', async () => {
			const items: { menu_item_id: number, quantity: number }[] = [];

			const result = await OrderService.modifyOrder(orderId, items);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('At least one item is required');
			}
		});

		it('should return an error if item quantity is invalid', async () => {
			const items = [
				{ menu_item_id: menuItemId1, quantity: 0 }
			];

			const result = await OrderService.modifyOrder(orderId, items);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Quantity must be a positive integer for all items');
			}
		});

		it('should return an error if menu item does not exist', async () => {
			const items = [
				{ menu_item_id: 9999, quantity: 1 }
			];

			const result = await OrderService.modifyOrder(orderId, items);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('One or more menu items do not exist');
			}
		});
	});
}); 
