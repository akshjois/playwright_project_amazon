const { test, expect } = require('@playwright/test');
const { NavigateMainPage } = require('../PageObjectRepo/HomePage');
const { ProductPage } = require('../PageObjectRepo/ProductPage');
const { Cartpage } = require('../PageObjectRepo/CartPage');
const testData = require('../utils/testdata.json');
const XLSX = require('xlsx');
const { read } = require('fs');
const ExcelJS = require('exceljs');
const { getExcelCellValue } = require('../utils/UtilsFunctions');


test('Read data from Excel', async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('tests/utils/testdata.xlsx');
    const worksheet = workbook.getWorksheet('productDetails');
    worksheet.eachRow((row, rowNumber) => {
      if(rowNumber === 1) return; // Skip header row
      row.eachCell((cell, colNumber) => {
        console.log(`Row ${rowNumber} Column ${colNumber}: ${cell.value}`);
      })
    })

    // for (let i = 2; i <= worksheet.rowCount; i++) {
    // const row = worksheet.getRow(i);
    // row.eachCell((cell, colNumber) => {
    //     console.log(`Row ${i} Column ${colNumber}: ${cell.value}`);
    // });
      // } 

});

test('Use Excel data in another function', async ({}) => {
    const filePath = 'tests/utils/testdata.xlsx';
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

test("Read data from Excel file", async ({ page }) => {
function readExcelData(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}
const data = readExcelData('./tests/utils/testdata.xlsx', 'productDetails');
// console.log(data.searchText);
console.log(data.searchText);
});
