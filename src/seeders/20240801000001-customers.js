'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('customers', [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '555-765-4321',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        phone: '555-987-6543',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        phone: '555-456-7890',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        phone: '555-789-0123',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('customers', null, {});
  }
}; 
