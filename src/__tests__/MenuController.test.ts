import { Request, Response } from 'express';
import MenuController from '../controllers/MenuController';
import MenuService from '../services/MenuService';

jest.mock('../services/MenuService');

describe('MenuController', () => {
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

  describe('addItem', () => {
    it('should add a menu item successfully', async () => {
      const menuItemData = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'main_course'
      };

      mockRequest.body = menuItemData;

      (MenuService.addMenuItem as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 1, ...menuItemData }
      });

      await MenuController.addItem(mockRequest as Request, mockResponse as Response);

      expect(MenuService.addMenuItem).toHaveBeenCalledWith(menuItemData);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({ id: 1, ...menuItemData });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        name: 'Test Item',
        description: 'Test Description'
      };

      await MenuController.addItem(mockRequest as Request, mockResponse as Response);

      expect(MenuService.addMenuItem).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'All fields are required: name, description, price, category'
      });
    });

    it('should return 400 if category is invalid', async () => {
      mockRequest.body = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'invalid_category'
      };

      (MenuService.addMenuItem as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Category must be one of: starter, main_course, dessert, beverage'
      });

      await MenuController.addItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Category must be one of: starter, main_course, dessert, beverage'
      });
    });

    it('should return 400 if price is negative', async () => {
      mockRequest.body = {
        name: 'Test Item',
        description: 'Test Description',
        price: -10.99,
        category: 'main_course'
      };

      (MenuService.addMenuItem as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Price must be greater than or equal to zero'
      });

      await MenuController.addItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Price must be greater than or equal to zero'
      });
    });

    it('should return 500 on server error', async () => {
      mockRequest.body = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'main_course'
      };

      (MenuService.addMenuItem as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await MenuController.addItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('listItems', () => {
    it('should list menu items successfully', async () => {
      const category = 'main_course';
      const page = 1;
      const limit = 10;
      const mockItems = {
        rows: [
          { id: 1, name: 'Test Item', description: 'Test Description', price: 10.99, category: 'main_course' }
        ],
        count: 1,
        page: 1,
        totalPages: 1,
        limit: 10
      };

      mockRequest.query = {
        category,
        page: page.toString(),
        limit: limit.toString()
      };

      (MenuService.listMenuItems as jest.Mock).mockResolvedValue({
        success: true,
        data: mockItems
      });

      await MenuController.listItems(mockRequest as Request, mockResponse as Response);

      expect(MenuService.listMenuItems).toHaveBeenCalledWith({ category, page, limit });
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockItems);
    });

    it('should use default pagination values if not provided', async () => {
      mockRequest.query = {};

      const mockItems = {
        rows: [],
        count: 0,
        page: 1,
        totalPages: 0,
        limit: 10
      };

      (MenuService.listMenuItems as jest.Mock).mockResolvedValue({
        success: true,
        data: mockItems
      });

      await MenuController.listItems(mockRequest as Request, mockResponse as Response);

      expect(MenuService.listMenuItems).toHaveBeenCalledWith({
        category: undefined,
        page: 1,
        limit: 10
      });
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockItems);
    });

    it('should return 400 if category is invalid', async () => {
      mockRequest.query = { category: 'invalid_category' };

      (MenuService.listMenuItems as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Category must be one of: starter, main_course, dessert, beverage'
      });

      await MenuController.listItems(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Category must be one of: starter, main_course, dessert, beverage'
      });
    });

    it('should return 500 on server error', async () => {
      mockRequest.query = {};

      (MenuService.listMenuItems as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      await MenuController.listItems(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
}); 
