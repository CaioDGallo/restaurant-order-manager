'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('order_items', [
      {
        order_id: 1,
        menu_item_id: 1,
        quantity: 1,
        unit_price: 8.99,
        subtotal: 8.99,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 1,
        menu_item_id: 4,
        quantity: 1,
        unit_price: 14.99,
        subtotal: 14.99,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 1,
        menu_item_id: 11,
        quantity: 3,
        unit_price: 3.99,
        subtotal: 9.99,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },

      {
        order_id: 2,
        menu_item_id: 3,
        quantity: 1,
        unit_price: 9.99,
        subtotal: 9.99,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 2,
        menu_item_id: 9,
        quantity: 1,
        unit_price: 6.99,
        subtotal: 6.99,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 2,
        menu_item_id: 13,
        quantity: 2,
        unit_price: 3.49,
        subtotal: 6.98,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 3,
        menu_item_id: 2,
        quantity: 1,
        unit_price: 7.99,
        subtotal: 7.99,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 3,
        menu_item_id: 5,
        quantity: 2,
        unit_price: 18.99,
        subtotal: 37.98,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 4,
        menu_item_id: 6,
        quantity: 1,
        unit_price: 16.99,
        subtotal: 16.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: 4,
        menu_item_id: 8,
        quantity: 1,
        unit_price: 7.99,
        subtotal: 7.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: 4,
        menu_item_id: 14,
        quantity: 1,
        unit_price: 8.99,
        subtotal: 8.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: 5,
        menu_item_id: 5,
        quantity: 1,
        unit_price: 18.99,
        subtotal: 18.99,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        order_id: 6,
        menu_item_id: 7,
        quantity: 1,
        unit_price: 13.99,
        subtotal: 13.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: 6,
        menu_item_id: 10,
        quantity: 1,
        unit_price: 8.99,
        subtotal: 8.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: 6,
        menu_item_id: 12,
        quantity: 1,
        unit_price: 2.99,
        subtotal: 2.99,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_items', null, {});
  }
}; 
