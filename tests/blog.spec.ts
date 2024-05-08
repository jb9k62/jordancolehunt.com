import { test, expect } from '@playwright/test';

test.describe('Blog Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure server is running at localhost:3000
    await page.goto('http://localhost:3000');
  });

  test.describe('Blog Index Page', () => {
    test('should load blog index page', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      // Check page title
      await expect(page).toHaveTitle(/Blog.*Jordan Cole Hunt/);

      // Check heading
      const heading = page.locator('h1.section-title');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Blog/i);
    });

    test('should display blog posts if they exist', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      // Check if blog grid exists
      const blogGrid = page.locator('.blog-grid');
      const noPosts = page.locator('.no-posts');

      // Either blog posts exist or "no posts" message shows
      const hasPosts = await blogGrid.isVisible().catch(() => false);
      const hasNoPosts = await noPosts.isVisible().catch(() => false);

      expect(hasPosts || hasNoPosts).toBe(true);
    });

    test('should display post metadata correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPost = page.locator('.blog-card').first();

      if (await firstPost.isVisible()) {
        // Check for title link
        const titleLink = firstPost.locator('h2 a');
        await expect(titleLink).toBeVisible();

        // Check for date
        const date = firstPost.locator('.date');
        await expect(date).toBeVisible();

        // Check for excerpt
        const excerpt = firstPost.locator('.excerpt');
        await expect(excerpt).toBeVisible();
      }
    });

    test('should navigate to blog post when clicking title', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        const href = await firstPostLink.getAttribute('href');
        await firstPostLink.click();

        // Should navigate to blog post page
        await expect(page).toHaveURL(new RegExp(href));

        // Should show back link
        const backLink = page.locator('.back-link');
        await expect(backLink).toBeVisible();
      }
    });

    test('should have correct cache headers', async ({ page }) => {
      const response = await page.goto('http://localhost:3000/blog');

      const cacheControl = response?.headers()['cache-control'];
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('s-maxage');
      expect(cacheControl).toContain('stale-while-revalidate');
    });
  });

  test.describe('Individual Blog Post Page', () => {
    test('should load blog post page', async ({ page }) => {
      // First, get a post slug from the index
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();

        // Check post title exists
        const postTitle = page.locator('h1.post-title');
        await expect(postTitle).toBeVisible();

        // Check post content exists
        const postContent = page.locator('.post-content');
        await expect(postContent).toBeVisible();
      }
    });

    test('should display post metadata', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();

        // Check for date
        const date = page.locator('.post-meta .date');
        await expect(date).toBeVisible();

        // Check for author (if present)
        const author = page.locator('.post-meta .author');
        if (await author.isVisible()) {
          await expect(author).toContainText(/by/i);
        }
      }
    });

    test('should render markdown content as HTML', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();

        const postContent = page.locator('.post-content');

        // Check that HTML elements exist (not raw markdown)
        const hasParagraphs = await postContent.locator('p').count() > 0;
        const hasHeadings = await postContent.locator('h1, h2, h3').count() > 0;

        expect(hasParagraphs || hasHeadings).toBe(true);
      }
    });

    test('should have syntax highlighting for code blocks', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();

        // Check if code blocks exist
        const codeBlocks = page.locator('pre code');
        const codeCount = await codeBlocks.count();

        if (codeCount > 0) {
          // Check that highlight.js classes are applied
          const firstCode = codeBlocks.first();
          const className = await firstCode.getAttribute('class');

          // Highlight.js adds language-specific classes
          expect(className).toBeTruthy();
        }
      }
    });

    test('should have back to blog link', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();

        const backLink = page.locator('.back-link');
        await expect(backLink).toBeVisible();
        await expect(backLink).toHaveAttribute('href', '/blog');

        // Click back link and verify navigation
        await backLink.click();
        await expect(page).toHaveURL('http://localhost:3000/blog');
      }
    });

    test('should return 404 for non-existent post', async ({ page }) => {
      const response = await page.goto('http://localhost:3000/blog/this-post-does-not-exist-xyz');

      expect(response?.status()).toBe(404);
    });

    test('should have correct cache headers for immutable post', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        const href = await firstPostLink.getAttribute('href');
        const response = await page.goto(`http://localhost:3000${href}`);

        const cacheControl = response?.headers()['cache-control'];
        expect(cacheControl).toContain('public');
        expect(cacheControl).toContain('immutable');
        expect(cacheControl).toContain('stale-while-revalidate');
      }
    });
  });

  test.describe('Security Tests', () => {
    test('should sanitize HTML in markdown', async ({ page }) => {
      // This test assumes you can create a test post with HTML
      // For now, we'll check that script tags don't execute
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        await firstPostLink.click();

        // Check that no inline scripts exist in post content
        const scripts = page.locator('.post-content script');
        await expect(scripts).toHaveCount(0);
      }
    });

    test('should reject invalid slug characters', async ({ page }) => {
      // Try accessing with path traversal
      const response = await page.goto('http://localhost:3000/blog/../../../etc/passwd');

      // Should return error, not file contents
      expect(response?.status()).toBeGreaterThanOrEqual(400);
    });

    test('should reject slugs with special characters', async ({ page }) => {
      const response = await page.goto('http://localhost:3000/blog/test<script>alert(1)</script>');

      // Should return 400 or 404
      expect(response?.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Performance Tests', () => {
    test('should load blog index quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/blog');
      const loadTime = Date.now() - startTime;

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('should load blog post quickly', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const firstPostLink = page.locator('.blog-card h2 a').first();

      if (await firstPostLink.isVisible()) {
        const startTime = Date.now();
        await firstPostLink.click();
        await page.waitForLoadState('load');
        const loadTime = Date.now() - startTime;

        // Should load within 2 seconds
        expect(loadTime).toBeLessThan(2000);
      }
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      // Check that h1 exists
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
    });

    test('should have accessible time elements', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const timeElements = page.locator('time[datetime]');
      const count = await timeElements.count();

      if (count > 0) {
        const firstTime = timeElements.first();
        const datetime = await firstTime.getAttribute('datetime');

        // Should have valid datetime attribute
        expect(datetime).toBeTruthy();
        expect(new Date(datetime).toString()).not.toBe('Invalid Date');
      }
    });

    test('should have proper link text', async ({ page }) => {
      await page.goto('http://localhost:3000/blog');

      const backLink = page.locator('.back-link').first();

      if (await backLink.isVisible()) {
        const text = await backLink.textContent();

        // Should not just be an arrow or empty
        expect(text?.trim()).toBeTruthy();
      }
    });
  });
});
