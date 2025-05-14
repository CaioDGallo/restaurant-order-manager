import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

export enum MenuItemCategory {
  STARTER = 'starter',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  DRINK = 'drink'
}

class MenuItem extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare price: number;
  declare category: MenuItemCategory;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

MenuItem.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  category: {
    type: DataTypes.ENUM(...Object.values(MenuItemCategory)),
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
  modelName: 'MenuItem',
  tableName: 'menu_items',
  underscored: true,
  timestamps: true,
});

export default MenuItem; 
