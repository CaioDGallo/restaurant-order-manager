import MenuItem, { MenuItemCategory } from '../models/MenuItem';
import { Optional } from 'sequelize';

export interface MenuItemData {
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
}

interface MenuQueryOptions {
  limit?: number;
  offset?: number;
  category?: MenuItemCategory;
}

interface QueryResult {
  count: number;
  rows: MenuItem[];
}

type MenuItemCreationAttributes = Optional<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;

class MenuRepository {
  async create(menuItemData: MenuItemData): Promise<MenuItem> {
    return await MenuItem.create(menuItemData as MenuItemCreationAttributes);
  }
  
  async findAll(options: MenuQueryOptions = {}): Promise<QueryResult> {
    const { limit, offset, category } = options;
    const filter = category ? { category } : {};
    
    return await MenuItem.findAndCountAll({
      where: filter,
      limit,
      offset,
      order: [['name', 'ASC']],
    });
  }
  
  async findById(id: number): Promise<MenuItem | null> {
    return await MenuItem.findByPk(id);
  }
}

export default new MenuRepository(); 