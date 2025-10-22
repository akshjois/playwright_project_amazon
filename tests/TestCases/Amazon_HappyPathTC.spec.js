const { test, expect } = require('@playwright/test');
const { NavigateMainPage } = require('../PageObjectRepo/HomePage');
const { ProductPage } = require('../PageObjectRepo/ProductPage');
const { Cartpage } = require('../PageObjectRepo/CartPage');
const testData = require('../utils/testdata.json');

test('TC01-Load Homepage and verify its state', async ({ page }) => {
  const mainPage = new NavigateMainPage(page); // create instance
  await mainPage.goTo();
  await expect(mainPage.amazonlogo).toBeVisible();
  await expect(mainPage.searchbox).toBeVisible();  
  await expect(mainPage.carticon).toBeVisible();
})

test("TC02-Search for a particular product", async ({ page }) => {
 const mainPage = new NavigateMainPage(page); // create instance
  await mainPage.goTo();
  if (testData.productDetails.searchText !== '') {
    await (mainPage.searchbox).fill(testData.productDetails.searchText);
    await expect(mainPage.suggestionlist).toBeVisible();
    await (mainPage.searchbox).press('Enter');
  }
  await page.waitForLoadState("domcontentloaded");
  //wait for all the results -
  await mainPage.waitforproducts();
 // Step 4: Collect product items
  let count = await mainPage.getProdCount();
  console.log(`Number of products found: ${count}`);
  await expect(count).toBeGreaterThan(0);

})

test("TC03-Add particular product to Cart from homePage", async ({ page }) => {
 const mainPage = new NavigateMainPage(page); // create instance
  await mainPage.goTo();
  await mainPage.searchBoxAction(testData.productDetails.searchText);
  await mainPage.addProdtoCart(testData.productDetails.ItemName); 
})

test("TC04-Add particular product to Cart using Child window", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
 const mainPage = new NavigateMainPage(page); // create instance
  await mainPage.goTo();
  await mainPage.searchBoxAction(testData.productDetails.searchText);
  const newPage = await mainPage.addProdtoCartFromChildWindow(testData.productDetails.ItemName);
    // Validate that the new page has opened with the expected title with regex
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const regex = new RegExp(escapeRegex(testData.productDetails.ItemName), 'i');
    await expect(newPage).toHaveTitle(regex);

    // The product was opened in a child page (newPage). Use that Page for title checks and cart interactions
    const productPage = new ProductPage(newPage);
   // await productPage.waitForLoadState('domcontentloaded');
    await productPage.addToCart();
    // Wait for the product page (child) to reflect the add-to-cart confirmation
    await newPage.waitForLoadState('domcontentloaded');
    await expect(productPage.confirmMessage).toBeVisible();
    if (await productPage.goToCartbtn.isVisible) {
      console.log('Go to cart button is visible');
      // Clicking the 'Go to Cart' link will navigate the child page to the cart
      await productPage.goToCartbtn.click();
      // Use the same child page to construct the Cartpage object since navigation happened there
      const cartpage = new Cartpage(newPage);
      // Use Page-based assertions against the Page object directly
      await expect(newPage).toHaveTitle(/Amazon.in Shopping Cart/);
      await newPage.waitForLoadState('domcontentloaded');
      await expect(cartpage.itemincarttitle, 'Validation for itemTitle in cart').toBeVisible();
      await expect(cartpage.itemCount, 'Validation for itemcount in cart').toHaveText('1');
      await expect(cartpage.proceedtoBuyBtn, 'Validation for proceed to buy button').toBeVisible();
      await cartpage.proceedtoBuyClick();
    }

})

test("TC05-Validate Cart count after adding product", async ({ page }) => {
  const mainPage = new NavigateMainPage(page); // create instance
  await mainPage.goTo();
  await mainPage.searchBoxAction(testData.productDetails.searchText);
  await mainPage.addProdtoCart(testData.productDetails.ItemName); 
  await page.waitForLoadState("domcontentloaded");
  if(await mainPage.goToCartbtn.isVisible){
    console.log('Go to cart button is visible');
    await mainPage.goToCartbtn.click(); 
  }
  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveTitle(/Amazon.in Shopping Cart/);
  const cartpage = new Cartpage(page);
  await expect(cartpage.itemincarttitle,"Validation for itemTitle in cart").toBeVisible();  
  await expect(cartpage.itemCount,"Validation for itemcount in cart").toHaveText('1');
  await expect(cartpage.proceedtoBuyBtn,"Validation for proceed to buy button").toBeVisible();
  await cartpage.proceedtoBuyClick();

})