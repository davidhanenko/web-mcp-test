/* eslint-disable @typescript-eslint/no-unused-vars -- the `T` below must match React's own declarations to merge with them */

// Types for Chrome's WebMCP (https://developer.chrome.com/docs/ai/webmcp), which TypeScript doesn't know yet.

export {};

declare global {
  type ModelContextToolInput = Record<string, unknown>;

  type ModelContextTool = {
    name: string;
    description: string;
    /** JSON Schema. The browser does not check input against it, so `execute` must. */
    inputSchema: Record<string, unknown>;
    execute: (
      input: ModelContextToolInput,
      client: { signal: AbortSignal },
    ) => unknown | Promise<unknown>;
    annotations?: {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
      consequentialHint?: boolean;
    };
  };

  interface ModelContext {
    /** Aborting `options.signal` unregisters the tool. */
    registerTool(
      tool: ModelContextTool,
      options?: { signal?: AbortSignal },
    ): Promise<void> | void;
  }

  interface Document {
    /** Missing in browsers without WebMCP. */
    modelContext?: ModelContext;
  }

  // Declarative API: a form tool's submit event.
  interface SubmitEvent {
    /** True when an agent submitted the form. Missing in browsers without WebMCP. */
    agentInvoked?: boolean;
    /** The tool result for the agent. Required after preventDefault() when agentInvoked. */
    respondWith?: (result: Promise<unknown>) => void;
  }
}

// Declarative API: these attributes turn a <form> into a tool.
declare module "react" {
  interface FormHTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }
  interface InputHTMLAttributes<T> {
    toolparamdescription?: string;
  }
  interface SelectHTMLAttributes<T> {
    toolparamdescription?: string;
  }
  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string;
  }
}
