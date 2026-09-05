import { test, expect } from '@playwright/test';

const BASE = process.env.GLOWHUB_PREVIEW_URL || '';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

test('Discover renders on mobile without horizontal overflow and finds a real published storefront', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /Find your next appointment/i })).toBeVisible();
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(noOverflow).toBeTruthy();

  await page.getByPlaceholder('Haircut, braids, nails, facial…').fill('Silk Press');
  await page.getByPlaceholder('Johannesburg, Sandton…').fill('Johannesburg');
  await page.getByRole('button', { name: /^Search$/ }).click();
  await expect(page.getByRole('heading', { name: 'QA Clean Studio' })).toBeVisible();
  await expect(page.getByText('R450')).toBeVisible();
});

test('Clean White, Warm & Soft and Dark & Bold are three structural storefront templates', async ({ page }) => {
  await page.goto(`${BASE}#/qa-clean-studio`, { waitUntil: 'networkidle' });
  await expect(page.locator('.sf-minimal-template')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'QA Clean Studio' })).toBeVisible();
  expect(await page.locator('.sf-minimal-template').count()).toBe(1);
  expect(await page.locator('.sf-soft-template').count()).toBe(0);
  expect(await page.locator('.sf-editorial-template').count()).toBe(0);

  await page.goto(`${BASE}#/qa-soft-nails`, { waitUntil: 'networkidle' });
  await expect(page.locator('.sf-soft-template')).toBeVisible();
  await expect(page.getByText('Soft detail. Beautiful finish.')).toBeVisible();
  expect(await page.locator('.sf-minimal-template').count()).toBe(0);

  await page.goto(`${BASE}#/qa-dark-barber`, { waitUntil: 'networkidle' });
  await expect(page.locator('.sf-editorial-template')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'QA Dark Barber' })).toBeVisible();
  expect(await page.locator('.sf-soft-template').count()).toBe(0);
});

test('business app remains separate from Discover and uses the Supabase sign-in surface', async ({ page }) => {
  await page.goto(`${BASE}#/app`, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await page.getByRole('button', { name: /^Sign in$/ }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to your business.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});
