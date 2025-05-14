import MenuRepository, { MenuItemData } from '../repositories/MenuRepository';
import MenuItem, { MenuItemCategory } from '../models/MenuItem';
import { ValidationError } from 'sequelize';
import { ServiceResponse } from '../utils/api';

interface MenuQueryParams {
  category?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResult {
  menuItems: MenuItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

class MenuService {
  async addMenuItem(data: MenuItemData): Promise<ServiceResponse<MenuItem>> {
    try {
      if (!data.name || !data.description || data.price === undefined || !data.category) {
        return {
          success: false,
          error: 'All fields are required: name, description, price, category'
        };
      }

      if (data.price < 0) {
        return {
          success: false,
          error: 'Price must be greater than or equal to zero'
        };
      }

      const validCategories = Object.values(MenuItemCategory);
      if (!validCategories.includes(data.category)) {
        return {
          success: false,
          error: `Category must be one of: ${validCategories.join(', ')}`
        };
      }

      const menuItem = await MenuRepository.create(data);

      return {
        success: true,
        data: menuItem
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Failed to add menu item'
      };
    }
  }

  async listMenuItems(params: MenuQueryParams): Promise<ServiceResponse<PaginatedResult>> {
    try {
      const { category, page = 1, limit = 10 } = params;

      if (category) {
        const validCategories = Object.values(MenuItemCategory);
        if (!validCategories.includes(category as MenuItemCategory)) {
          return {
            success: false,
            error: `Category must be one of: ${validCategories.join(', ')}`
          };
        }
      }

      const offset = (page - 1) * limit;

      const { count, rows: menuItems } = await MenuRepository.findAll({
        limit,
        offset,
        category: category as MenuItemCategory
      });

      return {
        success: true,
        data: {
          menuItems,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to list menu items: ' + error
      };
    }
  }
}

export default new MenuService(); 
