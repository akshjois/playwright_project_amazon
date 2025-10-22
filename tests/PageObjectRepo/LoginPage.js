const { expect } = require("@playwright/test");


class LoginPage {

    constructor(page) {
        this.page = page;
        this.username = page.locator("input[name='email']");
        this.continueBtn = page.locator("input[type='submit']");
        this.password = page.locator("input[name='password']");
        this.signInBtn = page.locator('#signInSubmit')
        this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password' });
        this.changeUsername = page.getByRole('link',{name: 'Change'});
        this.loggedEmailid = page.locator('#auth-email-claim');
        this.otpfield = page.locator('#auth-mfa-otpcode');
        this.authsigninbtn = page.locator('#auth-signin-button');
        this.invalidpasswordmsg = page.getByText("Your password is incorrect");
        this.signinwithanotheremail = page.getByRole('link',{name: 'Sign in with another email or mobile'});
        this.forgotpwdemail = page.locator('#ap_email');
    }

    async enterUsername(username){
        await this.username.fill(username);
        if(await this.continueBtn.isVisible){
          await this.continueBtn.click();
        }
    }

    async enterPassword(password){
        await this.password.fill(password);
        await this.signInBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async mfaAuth(TOTP_key){
        await this.otpfield.fill(TOTP_key);
        await this.authsigninbtn.click();
    }

    async getemailafterforgotpwd(){
        const emailid = await this.forgotpwdemail.inputValue();
        return emailid;
    }
}

module.exports = {LoginPage};