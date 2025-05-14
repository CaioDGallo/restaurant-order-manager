import CustomerRepository, { CustomerData } from '../repositories/CustomerRepository';
import { ValidationError, UniqueConstraintError } from 'sequelize';
import { OrderItem, Customer, MenuItem } from '../models';
import { ServiceError, ServiceResponse } from '../utils/api';

interface FormattedOrderItem {
  menu_item_id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface FormattedOrder {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: FormattedOrderItem[];
}

export interface OrdersResult {
  orders: FormattedOrder[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

class CustomerService {
  async registerCustomer(customerData: CustomerData): Promise<ServiceResponse<Customer>> {
    if (!customerData.name || !customerData.email || !customerData.phone) {
      return {
        success: false,
        error: 'All fields are required: name, email, phone'
      };
    }

    try {
      const customer = await CustomerRepository.create(customerData);
      return {
        success: true,
        data: customer
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return {
          success: false,
          error: 'Email already exists'
        };
      }

      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Failed to register customer'
      };
    }
  }

  async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10): Promise<OrdersResult | ServiceError> {
    try {
      const customer = await CustomerRepository.findById(customerId);

      if (!customer) {
        return {
          success: false,
          error: 'Customer not found'
        };
      }

      const offset = (page - 1) * limit;
      const { count, rows: orders } = await CustomerRepository.getCustomerOrders(customerId, { limit, offset });

      const formattedOrders = orders.map(order => {
        const orderItems = order.get('items') as OrderItem[];

        const menuItems = orderItems.map(oi => {
          const menuItem = oi.get('menuItem') as MenuItem;
          return {
            menu_item_id: menuItem.id,
            name: menuItem.name,
            quantity: oi.quantity,
            unitPrice: Number(oi.unitPrice),
            subtotal: Number(oi.subtotal)
          };
        });

        return {
          id: order.id,
          status: order.status,
          totalAmount: Number(order.totalAmount),
          createdAt: order.createdAt,
          items: menuItems
        };
      });

      return {
        orders: formattedOrders,
        totalOrders: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch customer orders: ' + error
      };
    }
  }
}

export default new CustomerService(); 
