//ts-check
import { test, expect, Page, } from '@playwright/test';
import { NavigateMainPage } from '../PageObjectRepo/HomePage.ts';
import { ProductPage } from '../PageObjectRepo/ProductPage.ts';
import { Cartpage } from '../PageObjectRepo/CartPage.ts';
import { getExcelCellValue } from '../utils/UtilsFunctions.ts';

test('Use Excel data in another function', async () => {
    const filePath = 'C:/Users/Akshatha/Playwright_Amazon_self/tests/utils/testdata.xlsx';
    const sheetName = 'productDetails';

    // Fetch value from row 2, column 3
    const value = await getExcelCellValue(filePath, sheetName, 2, 1);
    console.log('Fetched Value:', value);
});


test('TC01-Load Homepage and verify its state', async ({ page }) => {
    const mainPage = new NavigateMainPage(page); // create instance
    await mainPage.goTo();
    await expect(mainPage.amazonlogo).toBeVisible();
    await expect(mainPage.searchbox).toBeVisible();
    await expect(mainPage.carticon).toBeVisible();
});

test("TC02-Search for a particular product", async ({ page }) => {
    const filePath: string = 'C:/Users/Akshatha/Playwright_Amazon_self/tests/utils/testdata.xlsx';
    const sheetName: string = 'productDetails';

    // Fetch value from row 2, column 1
    const value: any = await getExcelCellValue(filePath, sheetName, 2, 1);
    const mainPage = new NavigateMainPage(page); // create instance
    await mainPage.goTo();
    if (value !== '') {
        await (mainPage.searchbox).fill(value);
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

});

test("TC03-Add particular product to Cart from homePage", async ({ page }) => {
    const filePath: string = 'C:/Users/Akshatha/Playwright_Amazon_self/tests/utils/testdata.xlsx';
    const sheetName: string = 'productDetails';

    // Fetch value from row 2, column 1
    const searchText: any = await getExcelCellValue(filePath, sheetName, 2, 1);
    const ItemName: any = await getExcelCellValue(filePath, sheetName, 2, 2);
    const mainPage = new NavigateMainPage(page); // create instance
    await mainPage.goTo();
    await mainPage.searchBoxAction(searchText);
    await mainPage.addProdtoCart(ItemName);
});

test("TC04-Add particular product to Cart using Child window", async ({ browser }) => {
    const filePath: string = 'C:/Users/Akshatha/Playwright_Amazon_self/tests/utils/testdata.xlsx';
    const sheetName: string = 'productDetails';
    const searchText: any = await getExcelCellValue(filePath, sheetName, 2, 1);
    const ItemName: any = await getExcelCellValue(filePath, sheetName, 2, 2);
    const context = await browser.newContext();
    const page = await context.newPage();
    const mainPage = new NavigateMainPage(page); // create instance
    await mainPage.goTo();
    await mainPage.searchBoxAction(searchText);
    const newPage = await mainPage.addProdtoCartFromChildWindow(ItemName);
    if (!newPage) {
        throw new Error('Failed to open product in child window');
    }
    // Validate that the new page has opened with the expected title with regex
    function escapeRegex(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const regex = new RegExp(escapeRegex(ItemName), 'i');
    await expect(newPage).toHaveTitle(regex);

    // The product was opened in a child page (newPage). Use that Page for title checks and cart interactions
    const productPage = new ProductPage(newPage);
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

});

test("TC05-Validate Cart count after adding product", async ({ page }) => {
    const filePath: string = 'C:/Users/Akshatha/Playwright_Amazon_self/tests/utils/testdata.xlsx';
    const sheetName: string = 'productDetails';
    const searchText: any = await getExcelCellValue(filePath, sheetName, 2, 1);
    const ItemName: any = await getExcelCellValue(filePath, sheetName, 2, 2);
    const mainPage = new NavigateMainPage(page); // create instance
    await mainPage.goTo();
    await mainPage.searchBoxAction(searchText);
    await mainPage.addProdtoCart(ItemName);
    await page.waitForLoadState("domcontentloaded");
    if (await mainPage.goToCartbtn.isVisible) {
        console.log('Go to cart button is visible');
        await mainPage.goToCartbtn.click();
    }
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Amazon.in Shopping Cart/);
    const cartpage = new Cartpage(page);
    await expect(cartpage.itemincarttitle, "Validation for itemTitle in cart").toBeVisible();
    await expect(cartpage.itemCount, "Validation for itemcount in cart").toHaveText('1');
    await expect(cartpage.proceedtoBuyBtn, "Validation for proceed to buy button").toBeVisible();
    await cartpage.proceedtoBuyClick();

});

