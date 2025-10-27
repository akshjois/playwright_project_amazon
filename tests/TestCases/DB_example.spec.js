// example.spec.js
const { test, expect } = require('@playwright/test');
const { query } = require('../utils/db'); // Adjust path if needed

// test.describe('Database Interactions in Playwright', () => {
//   let initialProductCount;

//   test.beforeAll(async () => {
//     // Get initial product count before tests
//     const products = await query('SELECT COUNT(*) as count FROM products');
//     initialProductCount = products[0].count;
//   });

//   test('should add a new product and verify in DB', async ({ page }) => {
//     // Navigate to the page where products are added
//     await page.goto('http://localhost:3000/add-product'); 

//     // Interact with the UI to add a product
//     await page.fill('#productName', 'New Test Product');
//     await page.fill('#productPrice', '99.99');
//     await page.click('#submitButton');

//     // Verify UI confirmation (optional)
//     await expect(page.locator('.success-message')).toHaveText('Product added successfully!');

//     // Verify in the database
//     const updatedProducts = await query('SELECT COUNT(*) as count FROM products');
//     expect(updatedProducts[0].count).toBe(initialProductCount + 1);

//     // Optionally, clean up the added product
//     await query('DELETE FROM products WHERE productName = ?', ['New Test Product']);
//   });

//   test.afterAll(async () => {
//     // Ensure database state is clean after all tests if needed
//     // For example, delete any remaining test data
//   });
// });