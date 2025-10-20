const {expect, test} = require('@playwright/test');
const {LoginPage} = require('../PageObjectRepo/LoginPage');
const {NavigateMainPage} = require('../PageObjectRepo/HomePage');
const testData = require('../utils/testdata.json');
import * as OTPAuth from "otpauth";
 /*
Verify successful login with valid credentials.  Y
Test login with an incorrect password. Y
Check login with an incorrect username/email. Y
Verify the "Forgot Password" link functionality. Y 
Check for case sensitivity in usernames and passwords. Y
Verify the session timeout behavior. Y
Test login with special characters in the password. Y
Test login with a blank username and password fields. Y
Ensure the "Remember Me" functionality works as expected. Y
Test the "Logout" functionality. Y
Test login on multiple browsers. Y
Verify that login attempts are logged for security monitoring. Y
 */
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

test.only('TC02-Test login with an incorrect password', async ({page})=>{
    const homepage = new NavigateMainPage(page);
    await homepage.goTo();
    await homepage.goToSignInPage();
    const loginPage = new LoginPage(page);
    await loginPage.enterUsername(testData.signInCred.username);
    const emailIDfromPage = await loginPage.loggedEmailid.textContent();
    console.log(emailIDfromPage);
    await loginPage.enterPassword(testData.invalidSignInCred.password);
    //capture invalid msg and image comparison as well.
    await expect(await loginPage.invalidpasswordmsg.textContent()).toContain("incorrect");
    



});