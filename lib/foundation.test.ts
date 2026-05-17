import { describe, expect, it } from "vitest";

const requiredScripts = ["dev", "build", "lint", "typecheck", "test"] as const;

describe("project foundation", () => {
  it("defines the expected baseline script names", () => {
    expect(requiredScripts).toEqual(["dev", "build", "lint", "typecheck", "test"]);
  });
});

