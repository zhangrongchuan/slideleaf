import { describe, expect, it } from "vitest";
import { validateWorkspacePath } from "./index.js";

describe("validateWorkspacePath", () => {
  it("normalizes safe relative paths", () => {
    expect(validateWorkspacePath("slides\\intro.md")).toBe("slides/intro.md");
  });

  it("rejects dangerous paths", () => {
    expect(() => validateWorkspacePath("../secret.md")).toThrow("Unsafe workspace path");
    expect(() => validateWorkspacePath("C:\\secret.md")).toThrow("Absolute workspace paths");
    expect(() => validateWorkspacePath("")).toThrow("empty");
  });
});
