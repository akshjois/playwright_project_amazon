
const testData = require('../utils/testdata.json');

class Cartpage {
    constructor(page) {
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