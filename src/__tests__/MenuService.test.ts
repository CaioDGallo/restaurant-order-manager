import MenuService from '../services/MenuService';
import { MenuItem, OrderItem } from '../models';
import { MenuItemCategory } from '../models/MenuItem';

import sequelize from '../config/database';

describe('MenuService', () => {
	beforeAll(async () => {
		await sequelize.authenticate();
	});

	afterAll(async () => {
		await sequelize.close();
	});

	beforeEach(async () => {
		try {
			await OrderItem.destroy({ where: {} });
			await MenuItem.destroy({ where: {} });
		} catch (error) {
			console.log('Error destroying menu items: ' + error);
		}
	});

	describe('addMenuItem', () => {
		const menuItemData = {
			name: 'Test Burger',
			description: 'Delicious test burger',
			price: 15.99,
			category: MenuItemCategory.MAIN_COURSE
		};

		it('should add a menu item successfully', async () => {
			const result = await MenuService.addMenuItem(menuItemData);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();
				expect(result.data.name).toBe(menuItemData.name);
				expect(result.data.description).toBe(menuItemData.description);
				expect(Number(result.data.price)).toBe(menuItemData.price);
				expect(result.data.category).toBe(menuItemData.category);
			}
		});

		it('should return an error if price is negative', async () => {
			const invalidData = {
				...menuItemData,
				price: -10
			};

			const result = await MenuService.addMenuItem(invalidData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Price must be greater than or equal to zero');
			}
		});

		it('should return an error if category is invalid', async () => {
			const invalidData = {
				...menuItemData,
				category: 'invalid_category' as MenuItemCategory
			};

			const result = await MenuService.addMenuItem(invalidData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Category must be one of');
			}
		});

		it('should return an error for validation issues', async () => {
			const invalidData = {
				name: '',
				description: '',
				price: 15.99,
				category: MenuItemCategory.MAIN_COURSE
			};

			const result = await MenuService.addMenuItem(invalidData);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
			}
		});
	});

	describe('listMenuItems', () => {
		beforeEach(async () => {
			await MenuItem.destroy({ where: {} });

			await MenuItem.create({
				name: 'Burger',
				description: 'Beef burger',
				price: 10.00,
				category: MenuItemCategory.MAIN_COURSE
			});

			await MenuItem.create({
				name: 'Pizza',
				description: 'Cheese pizza',
				price: 15.00,
				category: MenuItemCategory.MAIN_COURSE
			});

			await MenuItem.create({
				name: 'Salad',
				description: 'Fresh salad',
				price: 8.00,
				category: MenuItemCategory.STARTER
			});

			await MenuItem.create({
				name: 'Cake',
				description: 'Chocolate cake',
				price: 7.00,
				category: MenuItemCategory.DESSERT
			});
		});

		it('should list all menu items with pagination', async () => {
			const params = {
				page: 1,
				limit: 10
			};

			const result = await MenuService.listMenuItems(params);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();

				const count = await MenuItem.count();
				expect(result.data.menuItems.length).toBe(count);
				expect(result.data.totalItems).toBe(count);

				expect(result.data.totalPages).toBe(1);
				expect(result.data.currentPage).toBe(params.page);
			}
		});

		it('should filter menu items by category', async () => {
			const params = {
				category: MenuItemCategory.MAIN_COURSE,
				page: 1,
				limit: 10
			};

			const result = await MenuService.listMenuItems(params);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeDefined();

				const count = await MenuItem.count({
					where: { category: MenuItemCategory.MAIN_COURSE }
				});

				expect(result.data.menuItems.length).toBe(count);
				expect(result.data.totalItems).toBe(count);

				result.data.menuItems.forEach(item => {
					expect(item.category).toBe(MenuItemCategory.MAIN_COURSE);
				});
			}
		});

		it('should return an error if category is invalid', async () => {
			const params = {
				category: 'invalid_category',
				page: 1,
				limit: 10
			};

			const result = await MenuService.listMenuItems(params);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toContain('Category must be one of');
			}
		});

		it('should correctly paginate results', async () => {
			await MenuItem.destroy({ where: {} });

			for (let i = 0; i < 15; i++) {
				await MenuItem.create({
					name: `Item ${i}`,
					description: `Description ${i}`,
					price: 5.00,
					category: MenuItemCategory.MAIN_COURSE
				});
			}

			const itemsPerPage = 10;
			const result = await MenuService.listMenuItems({
				page: 1,
				limit: itemsPerPage
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.menuItems.length).toBe(itemsPerPage);
				expect(result.data.totalItems).toBe(15);
				expect(result.data.totalPages).toBe(Math.ceil(15 / itemsPerPage));
				expect(result.data.currentPage).toBe(1);

				const secondPageResult = await MenuService.listMenuItems({
					page: 2,
					limit: itemsPerPage
				});

				expect(secondPageResult.success).toBe(true);
				if (secondPageResult.success) {
					expect(secondPageResult.data.menuItems.length).toBe(5);
					expect(secondPageResult.data.currentPage).toBe(2);
				}
			}
		});
	});
}); 
