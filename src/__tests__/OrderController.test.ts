import { Request, Response } from 'express';
import OrderController from '../controllers/OrderController';
import OrderService from '../services/OrderService';
import { OrderStatus } from '../models/Order';

jest.mock('../services/OrderService');

describe('OrderController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {};
    mockResponse = {
      status: responseStatus,
      json: responseJson
    };

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const orderData = {
        customer_id: 1,
        items: [
          { menu_item_id: 1, quantity: 2 },
          { menu_item_id: 2, quantity: 1 }
        ]
      };

      mockRequest.body = orderData;

      const mockOrder = {
        id: 1,
        customerId: 1,
        status: OrderStatus.PENDING,
        totalAmount: 25.0,
        items: [
          { menuItemId: 1, quantity: 2, unitPrice: 10.0, subtotal: 20.0 },
          { menuItemId: 2, quantity: 1, unitPrice: 5.0, subtotal: 5.0 }
        ]
      };

      (OrderService.createOrder as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder
      });

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(OrderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 if customer_id or items are missing', async () => {
      mockRequest.body = { customer_id: 1 };

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(OrderService.createOrder).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Customer ID and at least one item are required'
      });
    });

    it('should return 400 if items is not an array', async () => {
      mockRequest.body = {
        customer_id: 1,
        items: 'not an array'
      };

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(OrderService.createOrder).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Customer ID and at least one item are required'
      });
    });

    it('should return 400 if items array is empty', async () => {
      mockRequest.body = {
        customer_id: 1,
        items: []
      };

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(OrderService.createOrder).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Customer ID and at least one item are required'
      });
    });

    it('should return 404 if customer is not found', async () => {
      mockRequest.body = {
        customer_id: 999,
        items: [{ menu_item_id: 1, quantity: 1 }]
      };

      (OrderService.createOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Customer not found'
      });

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Customer not found' });
    });

    it('should return 400 if menu items do not exist', async () => {
      mockRequest.body = {
        customer_id: 1,
        items: [{ menu_item_id: 999, quantity: 1 }]
      };

      (OrderService.createOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'One or more menu items do not exist'
      });

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: 'One or more menu items do not exist' });
    });

    it('should return 400 if quantity is invalid', async () => {
      mockRequest.body = {
        customer_id: 1,
        items: [{ menu_item_id: 1, quantity: 0 }]
      };

      (OrderService.createOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Quantity must be a positive integer for all items'
      });

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Quantity must be a positive integer for all items'
      });
    });

    it('should return 500 on server error', async () => {
      mockRequest.body = {
        customer_id: 1,
        items: [{ menu_item_id: 1, quantity: 1 }]
      };

      (OrderService.createOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await OrderController.create(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const order_id = '1';
      const status = OrderStatus.PREPARING;

      mockRequest.params = { order_id };
      mockRequest.body = { status };

      const mockOrder = {
        id: 1,
        customerId: 1,
        status: OrderStatus.PREPARING,
        totalAmount: 25.0
      };

      (OrderService.updateOrderStatus as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder
      });

      await OrderController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(OrderService.updateOrderStatus).toHaveBeenCalledWith(order_id, status);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 if status is missing', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = {};

      await OrderController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(OrderService.updateOrderStatus).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Status is required'
      });
    });

    it('should return 404 if order is not found', async () => {
      mockRequest.params = { order_id: '999' };
      mockRequest.body = { status: OrderStatus.PREPARING };

      (OrderService.updateOrderStatus as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Order not found'
      });

      await OrderController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Order not found' });
    });

    it('should return 400 if status is invalid', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = { status: 'invalid_status' };

      (OrderService.updateOrderStatus as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Status must be one of: pending, preparing, ready, delivered, cancelled'
      });

      await OrderController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Status must be one of: pending, preparing, ready, delivered, cancelled'
      });
    });

    it('should return 500 on server error', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = { status: OrderStatus.PREPARING };

      (OrderService.updateOrderStatus as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await OrderController.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('modify', () => {
    it('should modify an order successfully', async () => {
      const order_id = '1';
      const items = [
        { menu_item_id: 1, quantity: 3 },
        { menu_item_id: 2, quantity: 2 }
      ];

      mockRequest.params = { order_id };
      mockRequest.body = { items };

      const mockOrder = {
        id: 1,
        customerId: 1,
        status: OrderStatus.PENDING,
        totalAmount: 40.0,
        items: [
          { menuItemId: 1, quantity: 3, unitPrice: 10.0, subtotal: 30.0 },
          { menuItemId: 2, quantity: 2, unitPrice: 5.0, subtotal: 10.0 }
        ]
      };

      (OrderService.modifyOrder as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrder
      });

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(OrderService.modifyOrder).toHaveBeenCalledWith(order_id, items);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 if items are missing', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = {};

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(OrderService.modifyOrder).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'At least one item is required'
      });
    });

    it('should return 400 if items is not an array', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = { items: 'not an array' };

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(OrderService.modifyOrder).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'At least one item is required'
      });
    });

    it('should return 400 if items array is empty', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = { items: [] };

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(OrderService.modifyOrder).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'At least one item is required'
      });
    });

    it('should return 404 if order is not found', async () => {
      mockRequest.params = { order_id: '999' };
      mockRequest.body = {
        items: [{ menu_item_id: 1, quantity: 1 }]
      };

      (OrderService.modifyOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Order not found'
      });

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Order not found' });
    });

    it('should return 400 if menu items do not exist', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = {
        items: [{ menu_item_id: 999, quantity: 1 }]
      };

      (OrderService.modifyOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'One or more menu items do not exist'
      });

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'One or more menu items do not exist'
      });
    });

    it('should return 400 if quantity is invalid', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = {
        items: [{ menu_item_id: 1, quantity: 0 }]
      };

      (OrderService.modifyOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Quantity must be a positive integer for all items'
      });

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Quantity must be a positive integer for all items'
      });
    });

    it('should return 400 if order status does not allow modification', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = {
        items: [{ menu_item_id: 1, quantity: 1 }]
      };

      (OrderService.modifyOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Only orders with status "pending" or "preparing" can be modified'
      });

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Only orders with status "pending" or "preparing" can be modified'
      });
    });

    it('should return 500 on server error', async () => {
      mockRequest.params = { order_id: '1' };
      mockRequest.body = {
        items: [{ menu_item_id: 1, quantity: 1 }]
      };

      (OrderService.modifyOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await OrderController.modify(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
}); 
