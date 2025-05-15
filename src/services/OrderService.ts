import OrderRepository from '../repositories/OrderRepository';
import CustomerRepository from '../repositories/CustomerRepository';
import MenuItem from '../models/MenuItem';
import { Order } from '../models';
import { OrderStatus } from '../models/Order';
import sequelize from '../config/database';
import { Transaction } from 'sequelize';
import { ServiceResponse } from '../types/Api';

interface OrderItemInput {
  menu_item_id: number;
  quantity: number;
}

interface OrderInput {
  customer_id: number;
  items: OrderItemInput[];
}

class OrderService {
  async createOrder(orderData: OrderInput): Promise<ServiceResponse<Order>> {
    let transaction: Transaction | null = null;

    try {
      const customer = await CustomerRepository.findById(orderData.customer_id);
      if (!customer) {
        return {
          success: false,
          error: 'Customer not found'
        };
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return {
          success: false,
          error: 'At least one item is required'
        };
      }

      for (const item of orderData.items) {
        if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          return {
            success: false,
            error: 'Quantity must be a positive integer for all items'
          };
        }
      }

      const menuItemIds = orderData.items.map(item => item.menu_item_id);
      const menuItems = await MenuItem.findAll({
        where: { id: menuItemIds }
      });

      if (menuItems.length !== menuItemIds.length) {
        return {
          success: false,
          error: 'One or more menu items do not exist'
        };
      }

      transaction = await sequelize.transaction();

      const order = await OrderRepository.create({
        customerId: orderData.customer_id,
        items: []
      }, transaction);

      const itemsData = orderData.items.map(item => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity
      }));

      await OrderRepository.createOrderItems(
        order.id,
        itemsData,
        menuItems,
        transaction
      );

      await transaction.commit();
      transaction = null;

      const createdOrder = await OrderRepository.findById(order.id);

      if (!createdOrder) {
        return {
          success: false,
          error: 'Failed to create order'
        };
      }

      return {
        success: true,
        data: createdOrder
      };
    } catch (error) {
      if (transaction) await transaction.rollback();

      return {
        success: false,
        error: 'Failed to create order: ' + error
      };
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ServiceResponse<Order>> {
    try {
      const validStatuses = Object.values(OrderStatus);
      if (!status || !validStatuses.includes(status as OrderStatus)) {
        return {
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        };
      }

      const updatedOrder = await OrderRepository.updateStatus(orderId, status);

      if (!updatedOrder) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      return {
        success: true,
        data: updatedOrder
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update order status: ' + error
      };
    }
  }

  async modifyOrder(orderId: string, items: OrderItemInput[]): Promise<ServiceResponse<Order>> {
    let transaction: Transaction | null = null;

    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          error: 'At least one item is required'
        };
      }

      const order = await OrderRepository.findById(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PREPARING) {
        return {
          success: false,
          error: 'Only orders with status "pending" or "preparing" can be modified'
        };
      }

      for (const item of items) {
        if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          return {
            success: false,
            error: 'Quantity must be a positive integer for all items'
          };
        }
      }

      const menuItemIds = items.map(item => item.menu_item_id);
      const menuItems = await MenuItem.findAll({
        where: { id: menuItemIds }
      });

      if (menuItems.length !== menuItemIds.length) {
        return {
          success: false,
          error: 'One or more menu items do not exist'
        };
      }

      transaction = await sequelize.transaction();

      await OrderRepository.removeOrderItems(Number(orderId), transaction);

      const itemsData = items.map(item => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity
      }));

      await OrderRepository.createOrderItems(
        Number(orderId),
        itemsData,
        menuItems,
        transaction
      );

      await transaction.commit();
      transaction = null;

      const updatedOrder = await OrderRepository.findById(orderId);

      if (!updatedOrder) {
        return {
          success: false,
          error: 'Failed to update order'
        };
      }

      return {
        success: true,
        data: updatedOrder
      };
    } catch (error) {
      if (transaction) await transaction.rollback();

      return {
        success: false,
        error: 'Failed to modify order: ' + error
      };
    }
  }
}

export default new OrderService(); 
