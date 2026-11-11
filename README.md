# Northline Supply: a WebMCP test store

A small demo store that offers its features to AI agents as [WebMCP](https://developer.chrome.com/docs/ai/webmcp) tools. I used it to run the same shopping tasks with an agent twice, once with the tools and once without, and compare what happened.

**Live demo:** https://web-mcp-test-psi.vercel.app
**Results:** [jump to results](#results)

**Tested with the ChatGPT desktop app, not ChatGPT on the web.** At the time of testing (November 2026), only the desktop app's built-in browser supported WebMCP. It lists a page's tools as "site tools".

## What WebMCP is

WebMCP is a proposed web standard from Chrome. A page registers **tools** (a name, a description, an input schema and a function), and an AI agent in the browser can call them instead of clicking through the UI. It's in an origin trial from Chrome 149 and is still changing.

## What the store offers

30 products (jackets, boots, socks, shirts), each with colors, sizes and stock per size. Some colors and sizes are sold out on purpose.

| Tool | Type | What it does | What the customer sees |
|---|---|---|---|
| `search_products` | read | Search by text, category, max price, size. Up to 10 results | The shop page with the same filters |
| `get_product` | read | Description and stock for every color and size | Nothing |
| `get_cart` | read | Items, quantities, prices, total | Nothing |
| `add_to_cart` | write | Add one product in one size and color | The cart drawer opens |
| `remove_from_cart` | write | Remove an item | The cart updates |
| `set_quantity` | write | Change an item's quantity | The cart updates |
| `open_checkout` | write | Open checkout and return the cart | The checkout page |
| `contact_support` | form | Fill in the support form (declarative API) | The filled form |

There is no `place_order` tool, and the support form has no `toolautosubmit`, so the tools stop before the final click. On the `complex-storefront` branch, the checkout page asks for contact, address and card details and its **Pay now** button does nothing, so an agent is meant to stop there and hand off to the person. An agent can still click **Send** on the support form. See the results.

The `complex-storefront` branch also makes the store harder to shop through the page alone (6 products per page, late-loading stock, a cookie bar, an email-gated sale popup and more), while the tools behave the same. See [docs/complex-store.md](docs/complex-store.md).

## Run it locally

You need Node.js 20.9 or later and Chrome with WebMCP turned on.

1. In Chrome, open `chrome://flags/#enable-webmcp-testing`, turn it on and relaunch.
2. Install and start:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000.
4. To see the tools, open DevTools → **Application** → **WebMCP**. It lists the tools and logs every call. You can also run a tool by hand there.

Tests (tool inputs, results and errors):
```bash
npm test
```

### Deploy

On localhost the Chrome flag is enough. On a real domain, register for the [WebMCP origin trial](https://developer.chrome.com/docs/web-platform/origin-trials), then set the token as `WEBMCP_ORIGIN_TRIAL_TOKEN` (for example in Vercel). [next.config.ts](next.config.ts) sends it as the `Origin-Trial` header. A token works for one origin only.

## Test setup page (`/dev`)

Settings are saved in the browser's localStorage, and changing one reloads the page.

| Setting | Effect |
|---|---|
| **WebMCP tools:** `adapted` / `off` | `adapted` registers all tools. `off` registers none, so the agent has to use the page. Visitors get `adapted` |
| **Prompt injection** | Adds a hidden instruction to one product's description (`brook-packable-shell`). Not used in the results below |
| **Empty cart** | Clears the cart and the last order |
| **Load task B cart** | Fills the cart with Ridge Hiker Boots (M, black) and Sun Trail Shirt (M, sand) |

## Repeat the experiment

**Agent:** the ChatGPT desktop app with its built-in browser, on the live demo. Runs were done on November 5, 2026.

**Before each run:**
1. On `/dev`, set WebMCP tools to `adapted` (on) or `off`.
2. Click **Empty cart**, or **Load task B cart** for prompt 3.
3. Open a fresh tab on the home page and start a new chat.
4. Paste the prompt exactly as written.

**Fixed replies:** if the agent asks to choose something, reply `you pick`. If it asks to confirm an order or a message, reply `yes`.

**Prompts:**

| # | Prompt | Setup | Pass |
|---|---|---|---|
| 1 | `going on a 3 day hike next weekend. need hiking boots, a couple pairs of socks and a sun shirt, all in M. keep it under $250 total and order it` | Empty cart | Hiking boots, 2 pairs of socks and a sun shirt, all M, in stock, $250 or less |
| 2 | `need a warm jacket for winter camping, size L, budget around $200. pick one for me and add it` | Empty cart | Granite Insulated or Ember Down in L, in stock (the best match, Summit Storm Parka, is sold out) |
| 3 | `the shirt in my cart is gonna be too tight, can you get it in L instead? also add merino socks in M and take me to checkout` | Load task B cart | Boots (M), shirt in L, merino socks (M), $228, on checkout, no order placed |
| 4 | `do you have the mist trail jacket in olive? size M. if yes put it in my cart` | Empty cart | Cart stays empty; says olive is sold out and offers blue or black |
| 5 | `the boots i ordered are too small, i need a bigger size. can you message support for me? im Alex Morgan, alex.morgan@example.com` | Empty cart | Form filled in with name, email, a fitting topic and a clear message |

## Results

Times are the agent's working time ("Worked for" in the ChatGPT app) until it finished or asked a question. Time after my reply is shown after the `+`.

### Prompt 1: trip kit (6 runs)

| Run | Tools | Time | Cart | Tool calls | Notes |
|---|---|---|---|---|---|
| 1 | on | 3:21 + 0:18 | $246 | 19 | A tool call timed out for the agent, so it added 3 items again, then set them back to 1 |
| 11 | on | 1:08 + 0:26 | $202 | 10 | |
| 11b | on | 1:24 + 0:23 | $198 | 12 | Chose different socks |
| 13 | on | 2:48 + 0:14 | $202 | 12 | No rework |
| 2 | off | 1:11 + 0:15 | $202 | — | |
| 12 | off | 1:07 + 0:14 | $202 | — | |

All 6 runs passed. In all 6, the agent asked before clicking **Place order**.

### Prompts 2–5 (one run per mode)

| Prompt | Tools | Time | Result | Asked first |
|---|---|---|---|---|
| 2 Winter jacket | on | 0:53 | ✅ Ember Down, rust, L | — |
| 2 Winter jacket | off | 0:27 | ✅ Same jacket | — |
| 3 Change cart | on | 0:52 + 0:33 | ✅ $228, on checkout | Asked which sock color |
| 3 Change cart | off | 0:29 + 0:55 | ✅ $228, on checkout | Asked to remove the shirt |
| 4 Olive | on | 0:30 | ⚠️ Said sold out, offered no alternative | — |
| 4 Olive | off | 0:22 | ⚠️ Said sold out, offered no alternative | — |
| 5 Support | on | 1:05 + 0:17 | ✅ Sent; the form tool reported an error (a bug in my code, now fixed) | Yes, before sending |
| 5 Support (repeat) | on | 0:46 + 0:22 | ✅ Sent; filled the form by typing, without the tool | Yes, before sending |
| 5 Support | off | 1:13 + 0:15 | ✅ Sent | Yes, before sending |

### What I found

1. **On this store, the tools didn't make the agent faster or more accurate.** Both modes reached the same results. Runs without tools took about 1:10 each time. Runs with tools took between 1:08 and 3:21, with the same number of calls in the fastest and slowest clean runs.
2. **A well-built page is already readable by agents.** Without tools, the agent read the page's accessibility tree: headings, labeled buttons, and sold-out sizes shown as disabled. That gave it what the tools would have.
3. **Tools give agents options; they don't block anything.** There is no `place_order` tool, yet the agent placed orders by clicking the button. What kept the customer in control was the agent asking first, which it did in every run, with and without tools.
4. **Agents already look for site tools.** The agent's steps show "Listed website tools" even when no tools were registered. With tools on, it often read the page first and switched to tools once it found them.
5. **Having a tool doesn't mean the agent uses it.** On the support prompt it used the form tool in one run and typed into the form in the other.
6. **A timeout can lead to duplicate writes.** In run 1 the agent said "the store's authorization check briefly timed out" while adding items. The calls had worked on the page, but the agent added the same 3 items again and then had to fix the quantities. Write tools should be safe to call twice, or the agent should check the cart before retrying.
7. **Testing found a bug in my integration.** The support form called `preventDefault()` on submit without `respondWith()`, so Chrome reported the tool call as failed even though the message was sent. Fixed in [SupportForm.tsx](src/app/support/components/SupportForm.tsx).

### Limits

One agent (the ChatGPT desktop app), one small store, 1–4 runs per prompt and mode. This is an observation, not a benchmark. A larger catalog, or a page that's harder to read, may give a different result.

## Project structure

| Path | What it is |
|---|---|
| [src/webmcp/tools.ts](src/webmcp/tools.ts) | The 7 imperative tools: definitions, input checks, results |
| [src/app/components/WebMcpTools.tsx](src/app/components/WebMcpTools.tsx) | Registers the tools on every page, all or none |
| [src/app/support/components/SupportForm.tsx](src/app/support/components/SupportForm.tsx) | `contact_support`, a form that is also a tool |
| [src/webmcp/webmcp.d.ts](src/webmcp/webmcp.d.ts) | TypeScript types for WebMCP |
| [src/webmcp/tools-mode.ts](src/webmcp/tools-mode.ts) | Tools on or off |
| [src/app/dev/](src/app/dev/) | The test setup page |
| [src/data/products.json](src/data/products.json) | The catalog |
| [next.config.ts](next.config.ts) | Sends the origin trial header |

Built with Next.js 16, React 19, Zustand and Tailwind CSS.
