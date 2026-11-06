import { beforeEach, describe, expect, it } from "vitest";
import {
  readToolsMode,
  saveToolsMode,
  TOOLS_MODE_STORAGE_KEY,
} from "@/webmcp/tools-mode";

beforeEach(() => {
  localStorage.clear();
});

describe("tools mode", () => {
  it("defaults to adapted", () => {
    expect(readToolsMode()).toBe("adapted");
  });

  it("reads an unknown saved value as adapted", () => {
    localStorage.setItem(TOOLS_MODE_STORAGE_KEY, "everything");
    expect(readToolsMode()).toBe("adapted");
  });

  it("reads back the saved mode", () => {
    saveToolsMode("off");
    expect(readToolsMode()).toBe("off");
    saveToolsMode("adapted");
    expect(readToolsMode()).toBe("adapted");
  });

  it("reads the removed basic mode as adapted", () => {
    localStorage.setItem(TOOLS_MODE_STORAGE_KEY, "basic");
    expect(readToolsMode()).toBe("adapted");
  });
});
