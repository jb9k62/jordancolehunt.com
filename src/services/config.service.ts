import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly githubUsername: string;

  constructor() {
    this.githubUsername = process.env.GITHUB_USERNAME || 'jb9k62';
  }

  getGithubUsername(): string {
    return this.githubUsername;
  }

  getGithubUrl(repo?: string): string {
    const baseUrl = `https://github.com/${this.githubUsername}`;
    return repo ? `${baseUrl}/${repo}` : baseUrl;
  }
}
