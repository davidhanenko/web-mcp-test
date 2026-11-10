# A more complex storefront

The shop pages are harder to use, in the way a large store is. The catalog, the tools, and the tests are the same as before.

## What changed

The shop lists 12 products per page, with Previous, Next, and page numbers. The count is how many products matched, and which of those are on this page. Search runs on the whole catalog, then the page slices the matches. A word matches a name, description, tag, color, or category when it equals that word or starts it, so "water" matches waterproof and "boots" matches the boots category. Words like "for" and "the" are ignored. Category is chips. Max price is a slider. Size is buttons: XS–XL for apparel, 8–12 for boots, and both groups when every category is showing. Sort is the only dropdown: Featured (the old catalog order), Price: low to high, Price: high to low, or Name. Sorting happens on the page only. Product cards no longer say when something is sold out. A card shows the name, the list price, and the category.

On a product page, nothing is preselected. Color is swatches. Size buttons appear after a color is chosen. Jackets, shirts, and socks use XS–XL. Boots use US sizes 8, 9, 10, 11, and 12. Choosing another color clears the size. Stock and the quantity stepper appear only after a size is chosen. A sold-out size can be clicked, and then the page says it is sold out in that color.

Stock is counted per size inside a color, and the gaps are mixed. Fifteen colors are gone entirely, including Mist Trail olive, Summit Storm navy, and Cedar Rain rust. Other colors are missing one or two sizes and can still be bought in the rest, and that missing size is often still available in another color. Dusk Wind Shell has no M in either color, and black has no XL. Ember Down, Brook Packable, the liner socks, and the River Tee are in stock in every color and size. Mist Trail blue is down to a few units. Every product can still be bought in at least one color.

Nothing covers the page on first paint. The cookie bar slides in after 4 seconds and stays until the shopper picks Accept or Reject. The sale popup opens after 12 seconds, or after the shopper scrolls halfway down, whichever comes first. It offers $30 off the Ember Down Jacket with code `RIDGE30`, shows $199 and $169, and has Shop the jacket and No thanks. A strip under the header repeats the offer. The code is not applied until checkout. The discount is not in the product description.

Checkout has a promo code field. `RIDGE30` adds a discount line of $30 for each Ember Down Jacket and a pay total under the list subtotal. Any other code shows an error. The cart drawer still shows list prices. The confirmation page shows the discount and the pay total when a code was applied. The saved order record is still the raw cart items.

On `/dev`, **Reset popups** clears the cookie choice, the closed promo modal, and any applied code. **Empty cart** does not clear them.

## What stayed the same

Tools, tests, product ids, list prices, and the four categories are unchanged. The tool size list is still XS–XL, so a tool cannot pick a shoe size. The page can. `getCart()` still returns list prices. An agent using the tools still gets full stock for every color and size without selecting a size, and still sees the Ember Down Jacket at $199. An agent using only the page has to page through the grid, pick a color, and then a size to learn what is in stock. With `RIDGE30`, the Ember Down Jacket is $169 at checkout. The Granite Insulated Jacket stays $175. The page does not say that comparison out loud.
