import { Locator, Page } from "@playwright/test";
import testData from '../utils/testdata.json';

export class Cartpage {
    page:Page;
    itemincarttitle:Locator;
    itemCount:Locator;
    proceedtoBuyBtn:Locator;

    constructor(page:Page) {
        this.page = page;
        this.itemincarttitle = page.getByRole("listitem").filter({ hasText: testData.productDetails.ItemName });
        this.itemCount = page.getByLabel('Shopping Cart', { exact: true }).getByText('1', { exact: true });
        //page.getByRole("listitem").locator("span[data-a-selector='value']");
        this.proceedtoBuyBtn = page.getByRole("button", { name: 'Proceed to Buy Buy Amazon' });
    }

    async proceedtoBuyClick() {
        await this.proceedtoBuyBtn.click();
    }
}
module.exports = { Cartpage };