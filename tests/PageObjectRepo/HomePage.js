class NavigateMainPage {

    constructor(page) {
        this.page = page;
        this.amazonlogo = page.locator("a[aria-label='Amazon.in']");
        this.searchbox = page.getByRole('searchbox', { name: 'Search Amazon.in' })
        this.carticon = page.locator("[id='nav-cart']");
        this.suggestionlist = page.locator(".left-pane-results-container");
        this.products = page.locator('[data-component-type="s-search-result"]');
        this.goToCartbtn = page.getByRole('link', { name: 'Go to Cart' });
        this.signInBox = page.getByRole('button',{name: 'Expand Account and Lists'});
        this.signInbtnMain = page.getByText('Sign in').nth(1);
    }

    async goTo() {
        await this.page.goto("https://www.amazon.in/");
        await this.page.waitForLoadState("domcontentloaded");
     } 

    async waitforproducts(){
        // Prefer Locator.waitFor to wait for the first search-result to become visible
        // This is more robust and follows Playwright best-practices
        await this.products.first().waitFor({ state: 'visible', timeout: 30000 });
    }

    async searchBoxAction(text){
        if (text !== '') {
         await (this.searchbox).fill(text);
         await (this.searchbox).press('Enter');
      }
        // make sure we await load state so callers don't continue before navigation completes
        await this.page.waitForLoadState("domcontentloaded");
    }
    
    async getProdCount(){
        const count = await (this.products).count();
        return count;
    }
    async addProdtoCart(expectedText){
          await this.waitforproducts();
          const count = await this.getProdCount();
          for (let i = 0; i < count; i++) {
            const product = this.products.nth(i);
            const title = product.locator('h2 span');       
            let titlename = await title.textContent();        
            if (titlename == expectedText) {
              const addTocart = product.getByRole("button", { name: "Add to Cart" });
              await addTocart.click();
              console.log("button clicked");
              break;
            }
          }
    }

    async addProdtoCartFromChildWindow(expectedText){
          await this.waitforproducts(); 
          const count = await this.getProdCount();
          const context = this.page.context(); 
          for (let i = 0; i < count; i++) {
            const product = this.products.nth(i);
            const title = product.locator('h2 span');
            let titlename = await title.textContent();
            if (titlename == expectedText) {
              const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                title.click(), // opens new page - use promise
              ]);
              return newPage;  
            }
            
          }   
    }

    async goToSignInPage(){
      await this.signInBox.click();
      await this.signInbtnMain.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
}

module.exports = {NavigateMainPage};