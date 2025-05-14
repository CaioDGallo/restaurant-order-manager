require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/restaurant-orders',
    dialect: 'postgres',
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgres://user:password@localhost:5432/restaurant-orders-test',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
  },
}; 