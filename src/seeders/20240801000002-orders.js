'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('orders', [
      {
        customer_id: 1,
        status: 'delivered',
        total_amount: 32.97,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        customer_id: 2,
        status: 'ready',
        total_amount: 21.98,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        customer_id: 3,
        status: 'preparing',
        total_amount: 44.97,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        customer_id: 4,
        status: 'pending',
        total_amount: 28.97,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        customer_id: 5,
        status: 'canceled',
        total_amount: 18.99,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        customer_id: 1,
        status: 'pending',
        total_amount: 24.98,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('orders', null, {});
  }
}; 
