import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '../services/config.service';

@Controller()
export class PagesController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Sets CDN-optimized cache headers for HTML pages
   * Cache for 1 hour at edge, allowing background revalidation
   */
  private setCacheHeaders(res: Response): void {
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('CDN-Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Accept-Encoding');
  }

  @Get()
  index(@Req() req: Request, @Res() res: Response) {
    this.setCacheHeaders(res);
    return res.render('index', {
      title: 'JCH - Software Engineer',
      page: 'home',
      currentPath: req.path
    });
  }

  @Get('skills')
  skills(@Req() req: Request, @Res() res: Response) {
    this.setCacheHeaders(res);
    return res.render('skills', {
      title: 'Skills - JCH',
      page: 'skills',
      currentPath: req.path
    });
  }

  @Get('projects')
  projects(@Req() req: Request, @Res() res: Response) {
    this.setCacheHeaders(res);
    return res.render('projects', {
      title: 'Projects - JCH',
      page: 'projects',
      currentPath: req.path,
      githubUsername: this.configService.getGithubUsername(),
      githubUrl: this.configService.getGithubUrl()
    });
  }

  @Get('about')
  about(@Req() req: Request, @Res() res: Response) {
    this.setCacheHeaders(res);
    return res.render('about', {
      title: 'About - JCH',
      page: 'about',
      currentPath: req.path
    });
  }

  @Get('contact')
  contact(@Req() req: Request, @Res() res: Response) {
    this.setCacheHeaders(res);
    return res.render('contact', {
      title: 'Contact - JCH',
      page: 'contact',
      currentPath: req.path,
      hcaptchaSiteKey: this.configService.getHcaptchaSiteKey()
    });
  }

  @Get('cv')
  cv(@Req() req: Request, @Res() res: Response) {
    this.setCacheHeaders(res);
    return res.render('cv', {
      title: 'CV - JCH',
      page: 'cv',
      currentPath: req.path,
      cvPath: '/cv/resume.pdf'
    });
  }
}
