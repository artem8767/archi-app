import { describe, expect, it } from "vitest";
import {
  formatReadinessReport,
  getPlayStoreReadinessIssues,
} from "./play-store-readiness";

describe("getPlayStoreReadinessIssues", () => {
  it("flags invalid Play Store URL", () => {
    const issues = getPlayStoreReadinessIssues({
      NEXT_PUBLIC_PLAY_STORE_URL: "http://evil.example/app",
    });
    expect(issues.some((i) => i.code === "PLAY_STORE_URL_INVALID")).toBe(true);
  });

  it("accepts valid Play Store URL", () => {
    const issues = getPlayStoreReadinessIssues({
      NEXT_PUBLIC_PLAY_STORE_URL:
        "https://play.google.com/store/apps/details?id=com.example.archi",
    });
    expect(issues.some((i) => i.code === "PLAY_STORE_URL_INVALID")).toBe(false);
  });

  it("flags OTP exposure in production", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        SHOW_VERIFICATION_CODES: "true",
        JWT_SECRET: "x".repeat(64),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      },
      { treatAsProduction: true },
    );
    expect(issues.some((i) => i.code === "OTP_CODES_EXPOSED")).toBe(true);
  });

  it("flags weak JWT in production", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "change-this-to-a-long-random-string-in-production",
      },
      { treatAsProduction: true },
    );
    expect(issues.some((i) => i.code === "JWT_SECRET_WEAK")).toBe(true);
  });

  it("warns about privacy URL when production", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "a".repeat(48),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
      },
      { treatAsProduction: true },
    );
    expect(
      issues.some((i) => i.code === "PRIVACY_POLICY_URL_MISSING"),
    ).toBe(true);
  });

  it("warns about terms URL when production", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "a".repeat(48),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        NEXT_PUBLIC_PRIVACY_POLICY_URL: "https://example.com/en/privacy",
      },
      { treatAsProduction: true },
    );
    expect(issues.some((i) => i.code === "TERMS_URL_MISSING")).toBe(true);
  });

  it("clean production-like env has no errors when privacy, terms and email set", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "a".repeat(48),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        NEXT_PUBLIC_PRIVACY_POLICY_URL: "https://example.com/privacy",
        NEXT_PUBLIC_TERMS_OF_USE_URL: "https://example.com/en/terms",
        RESEND_API_KEY: "re_xxx",
        EMAIL_FROM: "App <onboarding@resend.dev>",
      },
      { treatAsProduction: true },
    );
    expect(issues.filter((i) => i.level === "error")).toHaveLength(0);
    expect(issues.some((i) => i.code === "TERMS_URL_MISSING")).toBe(false);
  });

  it("warns when only SMS env is set but email verification is required", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "a".repeat(48),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        NEXT_PUBLIC_PRIVACY_POLICY_URL: "https://example.com/privacy",
        TWILIO_ACCOUNT_SID: "ACxxx",
        TWILIO_AUTH_TOKEN: "token",
        TWILIO_FROM_NUMBER: "+10000000000",
      },
      { treatAsProduction: true },
    );
    expect(
      issues.some((i) => i.code === "VERIFICATION_NOT_CONFIGURED"),
    ).toBe(true);
  });

  it("email-only production env has no VERIFICATION_NOT_CONFIGURED warning", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "a".repeat(48),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        NEXT_PUBLIC_PRIVACY_POLICY_URL: "https://example.com/privacy",
        NEXT_PUBLIC_TERMS_OF_USE_URL: "https://example.com/en/terms",
        RESEND_API_KEY: "re_xxx",
        EMAIL_FROM: "App <onboarding@resend.dev>",
      },
      { treatAsProduction: true },
    );
    expect(
      issues.some((i) => i.code === "VERIFICATION_NOT_CONFIGURED"),
    ).toBe(false);
  });

  it("warns when email verification is not configured", () => {
    const issues = getPlayStoreReadinessIssues(
      {
        NODE_ENV: "production",
        JWT_SECRET: "a".repeat(48),
        NEXT_PUBLIC_SITE_URL: "https://example.com",
        NEXT_PUBLIC_PRIVACY_POLICY_URL: "https://example.com/privacy",
      },
      { treatAsProduction: true },
    );
    expect(
      issues.some((i) => i.code === "VERIFICATION_NOT_CONFIGURED"),
    ).toBe(true);
  });
});

describe("formatReadinessReport", () => {
  it("ok when no errors", () => {
    const { ok, text } = formatReadinessReport([]);
    expect(ok).toBe(true);
    expect(text).toContain("Автоматичних блокерів");
  });
});

describe("live environment (RUN_PLAY_CHECK=1)", () => {
  it.skipIf(process.env.RUN_PLAY_CHECK !== "1")(
    "prints report and fails on errors",
    () => {
      const issues = getPlayStoreReadinessIssues(process.env, {
        treatAsProduction: process.env.NODE_ENV === "production",
      });
      const { ok, text } = formatReadinessReport(issues);
      console.log("\n--- Play / production readiness ---\n" + text + "\n");
      expect(
        ok,
        "Виправте помилки вище або змініть конфіг перед релізом / публікацією в Play.",
      ).toBe(true);
    },
  );
});
