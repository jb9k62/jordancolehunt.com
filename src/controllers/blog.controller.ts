import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BlogService } from '../services/blog.service';
import { BlogSlugDto } from '../dto/blog-slug.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Serve blog index page with CDN-optimized caching headers
   * GET /blog
   */
  @Get()
  getBlogIndex(@Req() req: Request, @Res() res: Response) {
    const posts = this.blogService.getAllPosts();

    // CDN-optimized cache headers
    // Cache for 1 hour, revalidate in background for up to 1 day
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('CDN-Cache-Control', 's-maxage=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Accept-Encoding');

    return res.render('blog', {
      title: 'Blog - JCH',
      page: 'blog',
      currentPath: req.path,
      posts
    });
  }

  /**
   * Serve individual blog post with CDN-optimized caching headers
   * GET /blog/:slug
   */
  @Get(':slug')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBlogPost(
    @Param() params: BlogSlugDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const post = await this.blogService.getPostBySlug(params.slug);

    // CDN-optimized cache headers for immutable content
    // Cache for 1 day, revalidate in background for up to 7 days
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800, immutable');
    res.setHeader('CDN-Cache-Control', 's-maxage=86400, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Accept-Encoding');

    return res.render('blog-post', {
      title: `${post.title} - JCH`,
      page: 'blog-post',
      currentPath: req.path,
      post
    });
  }
}
