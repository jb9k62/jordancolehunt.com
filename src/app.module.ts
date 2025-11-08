import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { PagesController } from './controllers/pages.controller';
import { ContactController } from './controllers/contact.controller';
import { BlogController } from './controllers/blog.controller';
import { MailService } from './services/mail.service';
import { BlogService } from './services/blog.service';
import { ConfigService } from './services/config.service';
import { HcaptchaService } from './services/hcaptcha.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/*'],
      serveStaticOptions: {
        // Cache static assets for 1 year (immutable content)
        maxAge: 31536000000, // 1 year in milliseconds
        immutable: true,
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
          // Enhanced CloudFlare CDN caching headers
          // Differentiate cache TTL between edge and browser
          res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Vary', 'Accept-Encoding');

          // For unversioned assets like favicon, use shorter cache
          if (path.includes('favicon') || path.includes('index.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
            res.setHeader('CDN-Cache-Control', 'public, max-age=86400'); // 1 day for CDN
          }
        },
      },
    }),
  ],
  controllers: [AppController, PagesController, ContactController, BlogController],
  providers: [MailService, BlogService, ConfigService, HcaptchaService],
})
export class AppModule {}
