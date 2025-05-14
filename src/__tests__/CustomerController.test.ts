import { Request, Response } from 'express';
import CustomerController from '../controllers/CustomerController';
import CustomerService from '../services/CustomerService';

jest.mock('../services/CustomerService');

describe('CustomerController', () => {
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

  describe('registerCustomer', () => {
    it('should register a customer successfully', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890'
      };

      mockRequest.body = customerData;

      (CustomerService.registerCustomer as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 1, ...customerData }
      });

      await CustomerController.registerCustomer(mockRequest as Request, mockResponse as Response);

      expect(CustomerService.registerCustomer).toHaveBeenCalledWith(customerData);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({ id: 1, ...customerData });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { name: 'Test', email: 'test@example.com' };

      await CustomerController.registerCustomer(mockRequest as Request, mockResponse as Response);

      expect(CustomerService.registerCustomer).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'All fields are required: name, email, phone'
      });
    });

    it('should return 400 if email already exists', async () => {
      mockRequest.body = {
        name: 'Test Customer',
        email: 'existing@example.com',
        phone: '1234567890'
      };

      (CustomerService.registerCustomer as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Email already exists'
      });

      await CustomerController.registerCustomer(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Email already exists' });
    });

    it('should return 500 on server error', async () => {
      mockRequest.body = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890'
      };

      (CustomerService.registerCustomer as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await CustomerController.registerCustomer(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getOrdersByCustomer', () => {
    it('should get customer orders successfully', async () => {
      const customerId = '1';
      const page = 1;
      const limit = 10;
      const mockOrders = {
        rows: [
          { id: 1, status: 'pending', totalAmount: 20 }
        ],
        count: 1,
        page: 1,
        totalPages: 1,
        limit: 10
      };

      mockRequest.params = { customerId };
      mockRequest.query = { page: page.toString(), limit: limit.toString() };

      (CustomerService.getCustomerOrders as jest.Mock).mockResolvedValue(mockOrders);

      await CustomerController.getOrdersByCustomer(mockRequest as Request, mockResponse as Response);

      expect(CustomerService.getCustomerOrders).toHaveBeenCalledWith(customerId, page, limit);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockOrders);
    });

    it('should use default pagination values if not provided', async () => {
      const customerId = '1';
      const mockOrders = {
        rows: [],
        count: 0,
        page: 1,
        totalPages: 0,
        limit: 10
      };

      mockRequest.params = { customerId };
      mockRequest.query = {};

      (CustomerService.getCustomerOrders as jest.Mock).mockResolvedValue(mockOrders);

      await CustomerController.getOrdersByCustomer(mockRequest as Request, mockResponse as Response);

      expect(CustomerService.getCustomerOrders).toHaveBeenCalledWith(customerId, 1, 10);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockOrders);
    });

    it('should return 404 if customer not found', async () => {
      const customerId = '999';

      mockRequest.params = { customerId };
      mockRequest.query = {};

      (CustomerService.getCustomerOrders as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Customer not found'
      });

      await CustomerController.getOrdersByCustomer(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Customer not found' });
    });

    it('should return 500 on server error', async () => {
      const customerId = '1';

      mockRequest.params = { customerId };
      mockRequest.query = {};

      (CustomerService.getCustomerOrders as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await CustomerController.getOrdersByCustomer(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
}); 
