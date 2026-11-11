/** What the tools can do on the page, so the customer sees what the agent did. */
export type ToolPage = {
  navigate: (path: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};
