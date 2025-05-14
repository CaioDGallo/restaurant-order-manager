import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import OrderItem from './OrderItem';

export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELED = 'canceled'
}

class Order extends Model {
  declare id: number;
  declare customerId: number;
  declare status: OrderStatus;
  declare totalAmount: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare items?: OrderItem[];
}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id',
    },
    field: 'customer_id',
  },
  status: {
    type: DataTypes.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
    field: 'total_amount',
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
  modelName: 'Order',
  tableName: 'orders',
  underscored: true,
  timestamps: true,
});

export default Order; 
