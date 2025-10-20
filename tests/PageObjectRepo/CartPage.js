
const testData = require('../utils/testdata.json');

class Cartpage {
    constructor(page) {
        this.page = page;
        this.itemincarttitle = page.getByRole("listitem").filter({ hasText: testData.productDetails.ItemName });
        this.itemCount = page.getByRole("listitem").locator("span[data-a-selector='value']");
        this.proceedtoBuyBtn = page.getByRole("button", { name: /Proceed to Buy/i });
    }

    async proceedtoBuyClick() {
        await this.proceedtoBuyBtn.click();
    }
}
module.exports = { Cartpage };