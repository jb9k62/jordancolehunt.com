import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('health')
  getHealth(@Res() res: Response) {
    // Health check should not be cached
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    return res.json({
      status: 'ok',
      message: 'Server is running!',
      timestamp: new Date().toISOString()
    });
  }
}
