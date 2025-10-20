class ProductPage{
    constructor(page) {
        this.page = page;
        this.addTocart = page.getByRole("button", { name: "Add to Cart" });
        this.confirmMessage = page.locator('h1:has-text("Added to Cart")');
        this.goToCartbtn = page.getByRole('link', { name: 'Go to Cart' });
    }

    async addToCart(page) {
        await this.addTocart.click();
    }
}
module.exports = { ProductPage };

