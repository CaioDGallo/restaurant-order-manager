import { Request, Response } from 'express';
import CustomerService from '../services/CustomerService';
import HttpStatus from '../types/HttpStatus';

class CustomerController {
  public async registerCustomer(req: Request, res: Response) {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'All fields are required: name, email, phone'
      });
      return;
    }

    const result = await CustomerService.registerCustomer({ name, email, phone });

    if (result.success) {
      res.status(HttpStatus.CREATED).json(result.data);
    } else {
      if (result.error === 'Email already exists') {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
    }
  }


  public async getOrdersByCustomer(req: Request, res: Response) {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CustomerService.getCustomerOrders(customerId, page, limit);

    if ('success' in result && !result.success) {
      if (result.error === 'Customer not found') {
        res.status(HttpStatus.NOT_FOUND).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
      return;
    }

    res.status(HttpStatus.OK).json(result);
  }
}

export default new CustomerController();
