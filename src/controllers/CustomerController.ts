import { Request, Response } from 'express';
import CustomerService from '../services/CustomerService';

class CustomerController {
  public async registerCustomer(req: Request, res: Response) {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      res.status(400).json({
        error: 'All fields are required: name, email, phone'
      });
      return;
    }

    const result = await CustomerService.registerCustomer({ name, email, phone });

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      if (result.error === 'Email already exists') {
        res.status(400).json({ error: result.error });
      } else {
        res.status(500).json({ error: result.error });
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
        res.status(404).json({ error: result.error });
      } else {
        res.status(500).json({ error: result.error });
      }
      return;
    }

    res.status(200).json(result);
  }
}

export default new CustomerController();
