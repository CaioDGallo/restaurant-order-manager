import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import MenuItem from './MenuItem';

class OrderItem extends Model {
  declare id: number;
  declare orderId: number;
  declare menuItemId: number;
  declare quantity: number;
  declare unitPrice: number;
  declare subtotal: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare menuItem?: MenuItem;
}

OrderItem.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
    field: 'order_id',
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menu_items',
      key: 'id',
    },
    field: 'menu_item_id',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
    field: 'unit_price',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    field: 'updated_at',
  },
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'order_items',
  underscored: true,
  timestamps: true,
  hooks: {
    beforeValidate: (orderItem: OrderItem) => {
      if (orderItem.quantity && orderItem.unitPrice) {
        orderItem.subtotal = orderItem.quantity * Number(orderItem.unitPrice);
      }
    }
  }
});

export default OrderItem; 
