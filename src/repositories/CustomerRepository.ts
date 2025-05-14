import { Customer, Order, OrderItem, MenuItem } from '../models';
import { Optional } from 'sequelize';

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface OrderQueryResult {
  count: number;
  rows: Order[];
}

type CustomerCreationAttributes = Optional<Customer, 'id' | 'createdAt' | 'updatedAt'>;

class CustomerRepository {
  async create(customerData: CustomerData): Promise<Customer> {
    return await Customer.create(customerData as CustomerCreationAttributes);
  }

  async findById(id: string | number): Promise<Customer | null> {
    return await Customer.findByPk(id);
  }

  async getCustomerOrders(customerId: string | number, options: { limit: number; offset: number }): Promise<OrderQueryResult> {
    const { limit, offset } = options;
    
    return await Order.findAndCountAll({
      where: { customerId },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: MenuItem,
          as: 'menuItem',
          attributes: ['id', 'name', 'price', 'category']
        }]
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }
}

export default new CustomerRepository(); 