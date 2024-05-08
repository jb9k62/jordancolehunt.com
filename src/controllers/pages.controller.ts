import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class PagesController {
  @Get()
  @Render('index')
  index(@Req() req: Request) {
    return {
      title: 'JCH - Software Engineer',
      page: 'home',
      currentPath: req.path
    };
  }

  @Get('skills')
  @Render('skills')
  skills(@Req() req: Request) {
    return {
      title: 'Skills - JCH',
      page: 'skills',
      currentPath: req.path
    };
  }

  @Get('projects')
  @Render('projects')
  projects(@Req() req: Request) {
    return {
      title: 'Projects - JCH',
      page: 'projects',
      currentPath: req.path
    };
  }

  @Get('about')
  @Render('about')
  about(@Req() req: Request) {
    return {
      title: 'About - JCH',
      page: 'about',
      currentPath: req.path
    };
  }

  @Get('contact')
  @Render('contact')
  contact(@Req() req: Request) {
    return {
      title: 'Contact - JCH',
      page: 'contact',
      currentPath: req.path
    };
  }
}
