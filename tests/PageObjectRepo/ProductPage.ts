import { Locator, Page } from "@playwright/test";

export class ProductPage{
    page:Page;
    addTocart:Locator;
    confirmMessage:Locator;
    goToCartbtn:Locator;

    constructor(page:Page) {
        this.page = page;
        this.addTocart = page.getByRole("button", { name: "Add to Cart" });
        this.confirmMessage = page.locator('h1:has-text("Added to Cart")');
        this.goToCartbtn = page.getByRole('link', { name: 'Go to Cart' }).nth(1);
    }

    async addToCart() {
        await this.addTocart.click();
    }
}
module.exports = { ProductPage };

