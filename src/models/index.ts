import Customer from './Customer';
import MenuItem from './MenuItem';
import Order from './Order';
import OrderItem from './OrderItem';

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });
MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId', as: 'orderItems' });

export {
  Customer,
  MenuItem,
  Order,
  OrderItem
}; 
