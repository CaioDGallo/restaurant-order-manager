import CustomerService, { OrdersResult } from '../services/CustomerService';
import { CustomerData } from '../repositories/CustomerRepository';
import { Customer, MenuItem, Order, OrderItem } from '../models';
import { MenuItemCategory } from '../models/MenuItem';
import { OrderStatus } from '../models/Order';

import sequelize from '../config/database';

describe('CustomerService', () => {
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

	describe('registerCustomer', () => {
		const customerData: CustomerData = {
			name: 'Test User',
			email: 'test@example.com',
			phone: '1234567890',
		};

		it('should register a customer successfully', async () => {
			const result = await CustomerService.registerCustomer(customerData);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();
				expect(result.data.name).toBe(customerData.name);
				expect(result.data.email).toBe(customerData.email);
				expect(result.data.phone).toBe(customerData.phone);
			}
		});

		it('should return an error if email already exists', async () => {
			await CustomerService.registerCustomer(customerData);
			const result = await CustomerService.registerCustomer(customerData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Email already exists');
			}
		});

		it('should return an error for validation issues', async () => {
			const invalidCustomerData = {
				name: '',
				email: 'not-an-email',
				phone: '123',
			};

			const result = await CustomerService.registerCustomer(invalidCustomerData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
			}
		});
	});

	describe('getCustomerOrders', () => {
		let customerId: string;
		const page = 1;
		const limit = 10;

		beforeEach(async () => {
			const customerData = {
				name: 'Test Customer',
				email: 'customer@example.com',
				phone: '1234567890',
			};

			const customerResult = await CustomerService.registerCustomer(customerData);
			if (customerResult.success && customerResult.data) {
				customerId = customerResult.data.id.toString();
			}

			const burger = await MenuItem.create({
				name: 'Burger',
				description: 'Beef burger',
				price: 10.00,
				category: MenuItemCategory.MAIN_COURSE
			});

			const pizza = await MenuItem.create({
				name: 'Pizza',
				description: 'Cheese pizza',
				price: 30.00,
				category: MenuItemCategory.MAIN_COURSE
			});

			const order = await Order.create({
				customerId: customerId,
				status: OrderStatus.DELIVERED,
				totalAmount: 50.00
			});

			await OrderItem.create({
				orderId: order.id,
				menuItemId: burger.id,
				quantity: 2,
				unitPrice: 10.00,
				subtotal: 20.00
			});

			await OrderItem.create({
				orderId: order.id,
				menuItemId: pizza.id,
				quantity: 1,
				unitPrice: 30.00,
				subtotal: 30.00
			});
		});

		it('should return formatted orders for a customer', async () => {
			const result = await CustomerService.getCustomerOrders(customerId, page, limit);

			expect('orders' in result).toBe(true);
			const ordersResult = result as OrdersResult;

			expect(ordersResult.orders.length).toBe(1);
			expect(ordersResult.totalOrders).toBe(2);
			expect(ordersResult.totalPages).toBe(1);
			expect(ordersResult.currentPage).toBe(page);

			const order = ordersResult.orders[0];
			expect(order.status).toBe(OrderStatus.DELIVERED);
			expect(order.totalAmount).toBe(50.00);
			expect(order.items.length).toBe(2);

			const burgerItem = order.items.find(item => item.name === 'Burger');
			const pizzaItem = order.items.find(item => item.name === 'Pizza');

			expect(burgerItem).toBeDefined();
			expect(burgerItem?.quantity).toBe(2);
			expect(burgerItem?.unitPrice).toBe(10.00);
			expect(burgerItem?.subtotal).toBe(20.00);

			expect(pizzaItem).toBeDefined();
			expect(pizzaItem?.quantity).toBe(1);
			expect(pizzaItem?.unitPrice).toBe(30.00);
			expect(pizzaItem?.subtotal).toBe(30.00);
		});

		it('should return customer not found error if customer does not exist', async () => {
			const nonExistentCustomerId = '999999';
			const result = await CustomerService.getCustomerOrders(nonExistentCustomerId, page, limit);

			expect(result).toEqual({ success: false, error: 'Customer not found' });
		});

		it('should correctly calculate totalPages for multiple pages of orders', async () => {
			for (let i = 0; i < 15; i++) {
				await Order.create({
					customerId: customerId,
					status: OrderStatus.DELIVERED,
					totalAmount: 20.00
				});
			}

			const itemsPerPage = 10;
			const result = await CustomerService.getCustomerOrders(customerId, 1, itemsPerPage) as OrdersResult;

			expect(result.totalOrders).toBe(17);
			expect(result.totalPages).toBe(Math.ceil(17 / itemsPerPage));
			expect(result.currentPage).toBe(1);
		});
	});
}); 
