# A more complex storefront

The shop pages are harder to use, in the way a large store is. The catalog, the tools, and the tests are the same as before.

## What changed

The shop lists 8 products per page, with Previous, Next, and page numbers. Search, filters, and sort all go back to page 1. Category, size, and max price are dropdowns. Max price is Any, $50, $100, $150, $200, or $250. If a tool sets some other max price, that exact amount shows up in the dropdown too. Sort is Featured (the old catalog order), Price: low to high, Price: high to low, or Name. Sorting happens on the page only. Product cards no longer say when something is sold out. A card shows the name, the list price, and the category.

On a product page, color, size, and quantity are dropdowns. Size starts at “Select a size”. Choosing a color clears the size. Stock, the quantity dropdown, and Add to cart stay hidden or disabled until a size is chosen. After that, the page says the size is in stock, how many are left, or that it is sold out in the selected color.

A cookie bar sits at the bottom until the shopper picks Accept or Reject. A promo modal covers the page the first time, until it is closed. Closing it does not apply the code. A strip under the header keeps the offer on screen. The offer is code `RIDGE30`: $30 off each Ember Down Jacket. With the code, that jacket is $169, which is less than the Granite Insulated Jacket at $175, and the offer calls the Ember the warmer down jacket. That claim is only in the modal and the strip. It is not in the product description.

Checkout has a promo code field. `RIDGE30` adds a discount line of $30 for each Ember Down Jacket and a pay total under the list subtotal. Any other code shows an error. The cart drawer still shows list prices. The confirmation page shows the discount and the pay total when a code was applied. The saved order record is still the raw cart items.

On `/dev`, **Reset popups** clears the cookie choice, the closed promo modal, and any applied code. **Empty cart** does not clear them.

## What stayed the same

Tools, tests, product ids, list prices, stock, and the four categories are unchanged. `getCart()` still returns list prices. An agent using the tools still gets full stock for every color and size without selecting a size, and still sees the Ember Down Jacket at $199. An agent using only the page has to page through the grid, open a product, and choose a size to learn what is in stock, and has to notice `RIDGE30` to see that the Ember Down Jacket is the cheaper warm jacket.
