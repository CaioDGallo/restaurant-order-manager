import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

class Customer extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Customer.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
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
  modelName: 'Customer',
  tableName: 'customers',
  underscored: true,
  timestamps: true,
});

export default Customer; 
