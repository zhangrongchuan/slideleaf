import { describe, expect, it } from "vitest";
import { normalizeClientPath } from "./workspace-paths.js";

describe("normalizeClientPath", () => {
  it("accepts normal workspace paths", () => {
    expect(normalizeClientPath("slides/intro.md")).toBe("slides/intro.md");
  });

  it("throws for unsafe paths", () => {
    expect(() => normalizeClientPath("../intro.md")).toThrow();
  });
});
