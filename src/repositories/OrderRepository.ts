import { Order, OrderItem, MenuItem } from '../models';
import { Transaction } from 'sequelize';
import { OrderStatus } from '../models/Order';

export interface OrderItemData {
  menuItemId: number;
  quantity: number;
}

export interface OrderData {
  customerId: number;
  items: OrderItemData[];
}

class OrderRepository {
  async create(orderData: OrderData, transaction?: Transaction): Promise<Order> {
    return await Order.create({
      customerId: orderData.customerId,
      status: OrderStatus.PENDING,
      totalAmount: 0
    }, { transaction });
  }

  async findById(id: string | number): Promise<Order | null> {
    return await Order.findByPk(id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: MenuItem,
          as: 'menuItem'
        }]
      }]
    });
  }
  
  async updateStatus(orderId: string | number, status: string): Promise<Order | null> {
    const order = await this.findById(orderId);
    if (!order) return null;
    
    await order.update({ status });
    return order;
  }
  
  async createOrderItems(
    orderId: number,
    items: OrderItemData[],
    menuItems: MenuItem[],
    transaction?: Transaction
  ): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) continue;
      
      const unitPrice = Number(menuItem.price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;
      
      const orderItem = await OrderItem.create({
        orderId,
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice,
        subtotal
      }, { transaction });
      
      orderItems.push(orderItem);
    }
    
    await Order.update({ totalAmount }, { 
      where: { id: orderId },
      transaction
    });
    
    return orderItems;
  }
  
  async removeOrderItems(orderId: number, transaction?: Transaction): Promise<number> {
    return await OrderItem.destroy({
      where: { orderId },
      transaction
    });
  }
}

export default new OrderRepository(); 