import { IsString, Matches, MaxLength } from 'class-validator';

export class BlogSlugDto {
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  })
  slug: string;
}
