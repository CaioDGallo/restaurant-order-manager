# Restaurant Orders API

A restaurant order management API built with Node.js, Express, TypeScript, and PostgreSQL.

## Project Structure

The application follows a layered architecture:
- `controllers`: Handle HTTP requests and responses
- `services`: Implement business logic
- `repositories`: Data access layer
- `models`: Database models (Sequelize)
- `routes`: API route definitions
- `middlewares`: Express middlewares
- `config`: Application configuration
- `migrations`: Database schema migrations
- `seeders`: Database seed data
- `__tests__`: Test files

## Setup & Installation

### Requirements

- Node.js LTS v22.15.0
- Docker

### Docker Setup

1. Clone the repository
2. Start containers:
   ```bash
   docker-compose up -d
   ```
3. Access the API at http://localhost:3000

Both the main database (`restaurant-orders`) and test database (`restaurant-orders-test`) are created automatically in Docker.

## Database Configuration

The project uses PostgreSQL with Sequelize ORM:

- Development database: `restaurant-orders`
- Test database: `restaurant-orders-test`

When using Docker, databases are configured automatically.

For manual setup:
```bash
createdb restaurant-orders
createdb restaurant-orders-test
```

## Development

Start the development server with auto-reload:

```bash
# Local development using Docker (already configured to auto-reload)
docker-compose up -d

docker exec restaurant-orders npx sequelize-cli db:migrate

# (Optional) Seed the database with test data:
docker exec restaurant-orders npx sequelize-cli db:seed:all
```

## Postman Collection

The [postman collection](./restaurant-orders.postman_collection.json) can be used to test the API endpoints.

## Testing

Tests run against a real test database for more accurate and simpler testing:

```bash
# Install dependencies
npm install

# Setup test database
npm run test:db:setup

# Run all tests
npm test

# Generate coverage report
npm run test:coverage
```

## Building and Running

```bash
# Build TypeScript to JavaScript
npm run build

# Run the compiled application
npm start
```

## License

ISC 
