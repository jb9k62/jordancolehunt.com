import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly githubUsername: string;
  private readonly hcaptchaSiteKey: string;

  constructor() {
    this.githubUsername = process.env.GITHUB_USERNAME || 'jb9k62';
    this.hcaptchaSiteKey = process.env.HCAPTCHA_SITE_KEY || '';
  }

  getGithubUsername(): string {
    return this.githubUsername;
  }

  getGithubUrl(repo?: string): string {
    const baseUrl = `https://github.com/${this.githubUsername}`;
    return repo ? `${baseUrl}/${repo}` : baseUrl;
  }

  getHcaptchaSiteKey(): string {
    return this.hcaptchaSiteKey;
  }
}
