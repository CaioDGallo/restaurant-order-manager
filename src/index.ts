import express from 'express';
import dotenv from 'dotenv';
import customerRoutes from './routes/customerRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import sequelize from './config/database';
import { requestLogger, errorLogger } from './middlewares/logger';

dotenv.config();

const app = express();

app.use(requestLogger);

app.use(express.json());

app.use('/customer', customerRoutes);
app.use('/menu', menuRoutes);
app.use('/order', orderRoutes);

app.use(errorLogger);

const PORT = process.env.PORT || 3000;

async function startServer() {
	try {
		await sequelize.authenticate();
		console.log('Database connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
		process.exit(1);
	}

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

startServer();
