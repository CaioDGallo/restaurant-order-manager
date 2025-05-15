import { Request, Response } from 'express';
import MenuService from '../services/MenuService';
import HttpStatus from '../types/HttpStatus';

class MenuController {
  public async addItem(req: Request, res: Response) {
    const { name, description, price, category } = req.body;
    
    if (!name || !description || price === undefined || !category) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'All fields are required: name, description, price, category'
      });
      return;
    }
    
    const result = await MenuService.addMenuItem({ name, description, price, category });
    
    if (result.success) {
      res.status(HttpStatus.CREATED).json(result.data);
    } else {
      if (result.error.includes('Category must be one of')) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else if (result.error === 'Price must be greater than or equal to zero') {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
    }
  }
  
  public async listItems(req: Request, res: Response) {
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await MenuService.listMenuItems({ category, page, limit });
    
    if (result.success) {
      res.status(HttpStatus.OK).json(result.data);
    } else {
      if (result.error.includes('Category must be one of')) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: result.error });
      }
    }
  }
}

export default new MenuController();
