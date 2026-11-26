import { describe, expect, it } from "vitest";
import { formatMoney, initials, statusName } from "./format";

describe("format helpers", () => {
  it("formats salary using the employee currency", () => {
    expect(formatMoney(125000, "USD")).toContain("125,000");
    expect(formatMoney(1200000, "INR")).toContain("12,00,000");
  });

  it("normalizes numeric API status values", () => {
    expect(statusName(0)).toBe("active");
    expect(statusName(2)).toBe("terminated");
  });

  it("creates initials from a full name", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
  });
});
