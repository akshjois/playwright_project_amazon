const {expect, test} = require('@playwright/test');
const {LoginPage} = require('../PageObjectRepo/LoginPage');
const {NavigateMainPage} = require('../PageObjectRepo/HomePage');
const testData = require('../utils/testdata.json');
import * as OTPAuth from "otpauth";

let totp = new OTPAuth.TOTP({
  // Provider or service the account is associated with.
  issuer: "Amazon",
  // Account identifier.
  label: "MyTotp",
  // Algorithm used for the HMAC function, possible values are:
  algorithm: "SHA1",
  // Length of the generated tokens.
  digits: 6,
  // Interval of time for which a token is valid, in seconds.
  period: 30,
  secret: "HCCDKXB2WMIYRDA274WDAGXCF4EXQDX6E4UTRT4KXZUXKDVCVBBQ",
});
/* use url : https://zxing.org/w/decode */
//otpauth://totp/Amazon%3Aakshatha6557%40gmail.com?secret=HCCDKXB2WMIYRDA274WDAGXCF4EXQDX6E4UTRT4KXZUXKDVCVBBQ&issuer=Amazon

test('TC01-Enter Valid Username and Password_TOTP', async ({page})=>{
    const homepage = new NavigateMainPage(page);
    await homepage.goTo();
    await homepage.goToSignInPage();
    const loginPage = new LoginPage(page);
    await loginPage.enterUsername(testData.signInCred.username);
    const emailIDfromPage = await loginPage.loggedEmailid.textContent();
    console.log(emailIDfromPage);
    await expect(emailIDfromPage).toContain(testData.signInCred.username);
    await loginPage.enterPassword(testData.signInCred.password);
    let token = totp.generate();
    await loginPage.mfaAuth(token);
    await expect(page.locator('#nav-link-accountList-nav-line-1')).toHaveText('Hello, Akshatha');
});

/*Commenting since puzzle will come with incorrect password to continue - need to see how to handle that */
// test('TC02-Test login with an incorrect password', async ({page})=>{
//     const homepage = new NavigateMainPage(page);
//     await homepage.goTo();
//     await homepage.goToSignInPage();
//     const loginPage = new LoginPage(page);
//     await loginPage.enterUsername(testData.signInCred.username);
//     const emailIDfromPage = await loginPage.loggedEmailid.textContent();
//     console.log(emailIDfromPage);
//     await loginPage.enterPassword(testData.invalidSignInCred.password);
//     //capture invalid msg and image comparison as well.
//     await expect(await loginPage.invalidpasswordmsg.textContent()).toContain("incorrect");

// });

test('TC03-Check login with an incorrect username/email', async ({page})=>{
    const homepage = new NavigateMainPage(page);
    await homepage.goTo();
    await homepage.goToSignInPage();
    const loginPage = new LoginPage(page);
    await loginPage.enterUsername(testData.invalidSignInCred.invaliduseremail);
    //have 2 options - Looks like you are new to Amazon or Invalid email address message
    await expect(page.getByText('Looks like you are new to Amazon')).toBeVisible();
    await loginPage.signinwithanotheremail.click();
    await loginPage.enterUsername(testData.invalidSignInCred.invaliduser);
    await expect(page.getByText('Invalid email address')).toBeVisible();
});

test('TC04-Verify the "Forgot Password" link functionality', async ({page})=>{
  const homepage = new NavigateMainPage(page);
  await homepage.goTo();
  await homepage.goToSignInPage();
  const loginPage = new LoginPage(page);
  await loginPage.enterUsername(testData.signInCred.username);
  await loginPage.forgotPasswordLink.click();
  await expect(page.getByText('Password assistance')).toBeVisible();
  const emailid = await loginPage.getemailafterforgotpwd();
  console.log(emailid);
  await expect(emailid).toContain(testData.signInCred.username);
  await expect(page.getByRole('button',{name: 'Continue'})).toBeVisible();
})

test('TC06-Check for case sensitivity in usernames and passwords', async ({page})=>{
  try {
    const homePage = new NavigateMainPage(page);
    await homePage.goTo();
    await homePage.goToSignInPage();
    const loginPage = new LoginPage(page);
    await loginPage.enterUsername(testData.signInCred.username.toUpperCase());
    if (await (loginPage.password).isVisible) {
      console.log('The signin was successful with uppercase email id and valid pwd');
      await loginPage.enterPassword(testData.signInCred.password);
    }
    else {
      console.log('The email field might be case sensitive!');
      throw new Error('Password field not visible after uppercase username'); 
    }
  }
  catch(error){
    console.log(`There occured an error while performing test case 06 - login with ${error}`);
  }
 
});

test('TC07-Test login with a blank username and password fields', async({page})=>{
    const homePage = new NavigateMainPage(page);
    await homePage.goTo();
    await homePage.goToSignInPage();
    const login = new LoginPage(page);
    await login.enterUsername('');
    await expect(page.getByText('Enter your mobile number or email')).toBeVisible();
    await login.enterUsername(testData.signInCred.username);
    const emailIDfromPage = await login.loggedEmailid.textContent();
    console.log(emailIDfromPage);
    await expect(emailIDfromPage).toContain(testData.signInCred.username);
    await login.enterPassword('');
    await expect(page.getByText('Enter your password')).toBeVisible();
    await login.enterPassword(testData.signInCred.password);
});

test.describe('Random occurence of continue shopping page between test runs', () =>{
  test.beforeEach('Click on continue shopping button', async({page})=>{
      if(await page.getByRole('button',{name: 'Continue shopping'}.isVisible())){
        await page.getByRole('button',{name: 'Continue shopping'}).click();
      }
  })
})
