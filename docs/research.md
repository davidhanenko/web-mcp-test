# WebMCP research notes

Notes from Chrome's official WebMCP docs, checked 2026-11-03. Each point links to its source page.

Sources:
- [Overview](https://developer.chrome.com/docs/ai/webmcp)
- [Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api)
- [Agentic JavaScript Tools guide](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools)
- [Best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- [Secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- [DevTools WebMCP panel](https://developer.chrome.com/docs/devtools/application/webmcp)
- [Origin trials guide](https://developer.chrome.com/docs/web-platform/origin-trials)
- [use-webmcp-tool](https://github.com/GoogleChromeLabs/use-webmcp-tool)
- [chrome-devtools-mcp configuration](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md)

## Status

- WebMCP is a proposed web standard, Chrome only. Chrome says it is "under active discussion and subject to change". ([overview](https://developer.chrome.com/docs/ai/webmcp))
- **Origin trial from Chrome 149.** ([overview](https://developer.chrome.com/docs/ai/webmcp))
- **Local development:** turn on `chrome://flags/#enable-webmcp-testing` and relaunch Chrome. ([overview](https://developer.chrome.com/docs/ai/webmcp))
- Built for a visible, local browser with a human in the loop. Tools "may" run headless. ([overview](https://developer.chrome.com/docs/ai/webmcp))

## Registering tools in JavaScript (imperative API)

```js
if (!('modelContext' in document)) return;      // feature detection

const controller = new AbortController();
await document.modelContext.registerTool({
  name: "get_cart",
  description: "…",
  inputSchema: { type: "object", properties: {} },
  execute(input, { signal }) { return { … }; },
  annotations: { readOnlyHint: true },
}, { signal: controller.signal });

controller.abort();                              // unregisters
```

- **Required fields:** `name`, `description`, `inputSchema`, `execute`. `annotations` is optional. ([imperative](https://developer.chrome.com/docs/ai/webmcp/imperative-api))
- **Unregistering:** there is no `unregisterTool()`; you abort the signal. Aborting doesn't cancel a call already running. ([guide](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools))
- **`execute` arguments:** the input object first, `{ signal }` second. ([imperative](https://developer.chrome.com/docs/ai/webmcp/imperative-api))
- **The browser does not validate input against the schema and does not apply defaults.** The guide says to do both in `execute` (for example `qty = 1`). ([guide](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools))
- **Return value:** any JSON-serializable value. ([guide](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools))
- **Errors:** **if `execute` throws, the message is not forwarded to the agent.** The guide says to return errors as values (`{ error, available… }`) and to rethrow only when `signal.aborted`. ([guide](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools))
- **Other API surface:** `getTools()`, `executeTool()` and the `toolchange` event are for clients and DevTools. ([imperative](https://developer.chrome.com/docs/ai/webmcp/imperative-api))

### Annotations

| Annotation | Meaning |
|---|---|
| `readOnlyHint` | Reads only, no side effects; helps the agent decide when to ask for confirmation |
| `untrustedContentHint` | Output has user-generated or external data; the agent should scrutinize it |
| `consequentialHint` | High-stakes or irreversible; agent or browser may ask the user to confirm |
| `debugging` | Developer-only (Chrome 156+) |

Sources: [imperative](https://developer.chrome.com/docs/ai/webmcp/imperative-api), [secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools).

### Size limits ([secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools), "subject to change")

| What | Max |
|---|---|
| Tool description | 500 characters |
| Parameter description | 150 characters |
| Tool and parameter names | 30 characters |
| One tool's output | 1.5K characters |

## Support form (declarative API)

Source: [declarative](https://developer.chrome.com/docs/ai/webmcp/declarative-api).

```html
<form toolname="contact_support" tooldescription="…">
  <input name="email" toolparamdescription="…" required>
</form>
```

- `toolname` and `tooldescription` on the `<form>` register it as a tool. Removing either attribute unregisters it.
- **Parameter descriptions come from:** `toolparamdescription`, or else the field's `<label>`, or else `aria-description`.
- **Field mapping:** text inputs become strings, a `<select>` becomes an enum, and `required` fields are listed in `required`.
- **When the agent calls the form tool:** the browser focuses the form and fills it in. By default **the user clicks Submit**. Without `toolautosubmit`, the agent can't submit.
- **`SubmitEvent.agentInvoked`** is true when the agent submitted. `e.respondWith(promise)` returns a result to the agent, after `e.preventDefault()`.
- **Events on `document.modelContext`:** `toolactivated` (fields filled) and `toolcancel`. `window.ontool*` stops working in Chrome 156.
- **CSS:** `:tool-form-active` applies to the form and `:tool-submit-active` to its submit button. The default is a dashed outline.
- **React 19 + TypeScript:** `toolname` and the other attributes aren't in React's types, so TypeScript needs a type declaration.

## React

- **The guide** says not to call `registerTool()` from components in React. It points to [`use-webmcp-tool`](https://github.com/GoogleChromeLabs/use-webmcp-tool), which uses one hook per tool. ([guide](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools))
- **Best practices** say: "Register tools all at once. Expose the full tool set or none of it, and roll back the entire batch on failure." ([best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices))
- `use-webmcp-tool` registers each tool through its own hook call.

## Tool design rules ([best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices))

- Precise verbs; keep "starts something" apart from "does it".
- Description: what it does + when to use it, positive wording, no "don't…" lists.
- Don't script a step order; trust the agent.
- Specific types; natural-language values, not opaque ids.
- Accept raw input; no math for the model.
- Validate strictly in code, loosely in schema.
- Descriptive errors so the model can retry.
- Report success only when it matches app state.
- One tool = one function, no overlap.
- UI and tools share one service.
- Register all at once, all or none.

Naming: Chrome's examples use kebab-case, but there's no casing rule.

## Security ([secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools))

- Chrome: "it's impossible to guarantee safety inside of a large language model". The annotations are hints, not protection.
- **Prompt injection:** tool output that contains user-generated or external text can carry instructions. `untrustedContentHint` tells the agent to treat the output with suspicion.
- **Consequential actions:** `consequentialHint` marks a tool as high-stakes or irreversible; the agent or browser may ask the user to confirm.
- **Exposure:** tools are same-origin by default.
- `requestUserInteraction()` is in the spec draft but not documented for use yet.

## Debugging and test tooling

- **DevTools → Application → WebMCP** ([panel](https://developer.chrome.com/docs/devtools/application/webmcp)):
  - lists each tool with its name and description as the agent sees them
  - logs each call with its input, output or error, and status
  - filters by declarative or imperative
  - lets you run a tool by hand ("Run tool")
- **chrome-devtools-mcp** ([configuration](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md)):
  - `--categoryExperimentalWebmcp` adds `list_webmcp_tools` and `execute_webmcp_tool`. Off by default.
  - **It requires Chrome 150+ launched with `--enable-features=WebMCP`.**
  - `--browserUrl=http://127.0.0.1:9222` connects it to a Chrome that's already running.

## Evaluating the runs ([evals](https://developer.chrome.com/docs/ai/evals))

This is Chrome's general guide to evals. It doesn't mention WebMCP.

- **Define pass and fail from real faults.** Look at actual failed outputs before fixing the criteria.
- **Objective criteria get rule-based code checks; subjective ones get an LLM judge with a rubric.**
- **A valid format isn't a correct result.** The guide's example is JSON that parses but breaks domain rules.
- The guide has no advice on how many runs to do.

## Origin trial

Source: [origin trials guide](https://developer.chrome.com/docs/web-platform/origin-trials).

- **Register:** register the production origin and get a token. A token is tied to one origin, so preview URLs need their own.
- **Add the token:** either the `Origin-Trial: <token>` response header, or `<meta http-equiv="origin-trial" content="<token>">` in `<head>`.
- **Check it:** in DevTools → Application, the frame details list the active trials.
- **Expiry:** tokens expire. Chrome emails a renewal link, and renewing requires feedback. Expired tokens are ignored without any error.
- **Not stated:** whether a token can cover localhost or subdomains.
