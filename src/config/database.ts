import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl;
if (process.env.NODE_ENV === 'test') {
  dbUrl = process.env.TEST_DATABASE_URL || 'postgres://user:password@localhost:5432/restaurant-orders-test';
} else {
  dbUrl = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/restaurant-orders';
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize; 
