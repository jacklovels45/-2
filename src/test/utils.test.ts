import { describe, it, expect } from "vitest";
import { formatMoney, formatMoneyCompact, formatDate, relativeTime, isSameDay, daysAgo } from "@/utils/format";
import { getEmoji, DEFAULT_EMOJI, I18N } from "@/utils/i18n";
import { cn } from "@/utils/cn";
import { genNo } from "@/store/slices/sharedSlice";

describe("format utils", () => {
  it("formatMoney formats correctly", () => {
    expect(formatMoney(1234.56)).toBe("1,234.56");
    expect(formatMoney(0)).toBe("0.00");
    expect(formatMoney(1234.56, 0)).toBe("1,235");
  });

  it("formatMoneyCompact formats large numbers", () => {
    expect(formatMoneyCompact(12345)).toBe("1.2万");
    expect(formatMoneyCompact(500)).toBe("500");
  });

  it("formatDate formats dates", () => {
    expect(formatDate("2025-06-15T10:30:00")).toBe("2025-06-15");
    expect(formatDate("2025-06-15T10:30:00", true)).toContain("10:30");
  });

  it("isSameDay compares dates correctly", () => {
    expect(isSameDay("2025-06-15T10:00:00", new Date("2025-06-15T18:00:00"))).toBe(true);
    expect(isSameDay("2025-06-15T10:00:00", new Date("2025-06-16T10:00:00"))).toBe(false);
  });

  it("daysAgo returns correct date", () => {
    const sevenDaysAgo = daysAgo(7);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = now.getTime() - sevenDaysAgo.getTime();
    expect(diff).toBe(7 * 86400000);
  });
});

describe("i18n utils", () => {
  it("getEmoji returns default for empty values", () => {
    expect(getEmoji("")).toBe(DEFAULT_EMOJI);
    expect(getEmoji(null)).toBe(DEFAULT_EMOJI);
    expect(getEmoji(undefined)).toBe(DEFAULT_EMOJI);
  });

  it("getEmoji returns valid emoji as-is", () => {
    expect(getEmoji("🍎")).toBe("🍎");
    expect(getEmoji("🥬")).toBe("🥬");
  });

  it("I18N has all required keys", () => {
    expect(I18N.app.name).toBeDefined();
    expect(I18N.roles.manager).toBeDefined();
    expect(I18N.status.draft).toBeDefined();
    expect(I18N.payment.cash).toBeDefined();
    expect(I18N.movement.in).toBeDefined();
  });
});

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", false && "bar")).toBe("foo");
  });
});

describe("genNo sequence generator", () => {
  it("generates formatted order numbers", () => {
    const no = genNo("PO");
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    expect(no).toMatch(new RegExp(`^PO${y}${m}${d}\\d{4}$`));
  });
});