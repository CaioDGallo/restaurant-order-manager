'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('menu_items', [
      {
        name: 'Bruschetta',
        description: 'Toasted bread topped with diced tomatoes, fresh basil, garlic, and olive oil',
        price: 8.99,
        category: 'starter',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Mozzarella Sticks',
        description: 'Breaded and fried mozzarella cheese sticks served with marinara sauce',
        price: 7.99,
        category: 'starter',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Spinach Artichoke Dip',
        description: 'Creamy dip with spinach, artichoke hearts, and melted cheese, served with tortilla chips',
        price: 9.99,
        category: 'starter',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Spaghetti Bolognese',
        description: 'Classic pasta dish with rich meat sauce and parmesan cheese',
        price: 14.99,
        category: 'main_course',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Grilled Salmon',
        description: 'Fresh salmon fillet grilled to perfection, served with seasonal vegetables',
        price: 18.99,
        category: 'main_course',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Chicken Parmesan',
        description: 'Breaded chicken breast topped with marinara sauce and melted cheese, served with pasta',
        price: 16.99,
        category: 'main_course',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Vegetable Stir Fry',
        description: 'Fresh vegetables stir-fried in a savory sauce, served with steamed rice',
        price: 13.99,
        category: 'main_course',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten chocolate center, served with vanilla ice cream',
        price: 7.99,
        category: 'dessert',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Cheesecake',
        description: 'Creamy New York-style cheesecake with a graham cracker crust',
        price: 6.99,
        category: 'dessert',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tiramisu',
        description: 'Italian dessert made with coffee-soaked ladyfingers and mascarpone cheese',
        price: 8.99,
        category: 'dessert',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Fresh Lemonade',
        description: 'Freshly squeezed lemonade with mint leaves',
        price: 3.99,
        category: 'drink',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Iced Tea',
        description: 'House-brewed iced tea, sweetened or unsweetened',
        price: 2.99,
        category: 'drink',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Espresso',
        description: 'Strong, concentrated coffee served in a small cup',
        price: 3.49,
        category: 'drink',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Red Wine',
        description: 'Glass of house red wine',
        price: 8.99,
        category: 'drink',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_items', null, {});
  }
}; 
