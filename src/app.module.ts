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
    }),
  ],
  controllers: [AppController, PagesController, ContactController, BlogController],
  providers: [MailService, BlogService, ConfigService, HcaptchaService],
})
export class AppModule {}
