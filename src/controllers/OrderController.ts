import { Request, Response } from 'express';
import OrderService from '../services/OrderService';
import HttpStatus from '../types/HttpStatus';

class OrderController {
  public async create(req: Request, res: Response) {
    const { customer_id, items } = req.body;

    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Customer ID and at least one item are required'
      });
      return;
    }

    const result = await OrderService.createOrder({ customer_id, items });

    if (result.success) {
      res.status(HttpStatus.CREATED).json(result.data);
    } else {
      if (result.error === 'Customer not found') {
        res.status(HttpStatus.NOT_FOUND).json({ error: result.error });
      } else if (
        result.error === 'One or more menu items do not exist' ||
        result.error === 'Quantity must be a positive integer for all items' ||
        result.error === 'At least one item is required'
      ) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
    }
  }

  public async updateStatus(req: Request, res: Response) {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Status is required'
      });
      return;
    }

    const result = await OrderService.updateOrderStatus(order_id, status);

    if (result.success) {
      res.status(HttpStatus.OK).json(result.data);
    } else {
      if (result.error === 'Order not found') {
        res.status(HttpStatus.NOT_FOUND).json({ error: result.error });
      } else if (result.error.includes('Status must be one of')) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
    }
  }

  public async modify(req: Request, res: Response) {
    const { order_id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'At least one item is required'
      });
      return;
    }

    const result = await OrderService.modifyOrder(order_id, items);

    if (result.success) {
      res.status(HttpStatus.OK).json(result.data);
    } else {
      if (result.error === 'Order not found') {
        res.status(HttpStatus.NOT_FOUND).json({ error: result.error });
      } else if (
        result.error === 'One or more menu items do not exist' ||
        result.error === 'Quantity must be a positive integer for all items' ||
        result.error === 'At least one item is required' ||
        result.error === 'Only orders with status "pending" or "preparing" can be modified'
      ) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
    }
  }
}

export default new OrderController();
