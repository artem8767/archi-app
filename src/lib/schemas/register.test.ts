import { describe, expect, it } from "vitest";
import { registerRequestSchema } from "./register";

describe("registerRequestSchema", () => {
  it("приймає валідне тіло та підрізає email", () => {
    const r = registerRequestSchema.safeParse({
      email: "  user@example.com  ",
      phone: "+380501112233",
      password: "password123",
      name: "Тест",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("user@example.com");
      expect(r.data.phone).toBe("+380501112233");
      expect(r.data.name).toBe("Тест");
    }
  });

  it("відхиляє короткий пароль", () => {
    const r = registerRequestSchema.safeParse({
      email: "u@e.co",
      phone: "+38050111",
      password: "short",
      name: "Юзер",
    });
    expect(r.success).toBe(false);
  });

  it("відхиляє некоректний email", () => {
    const r = registerRequestSchema.safeParse({
      email: "not-an-email",
      phone: "+380501112233",
      password: "12345678",
      name: "Ім'я",
    });
    expect(r.success).toBe(false);
  });

  it("відхиляє порожнє ім'я", () => {
    const r = registerRequestSchema.safeParse({
      email: "u@e.co",
      phone: "+380501112233",
      password: "12345678",
      name: "   ",
    });
    expect(r.success).toBe(false);
  });

  it("відхиляє відсутнє ім'я", () => {
    const r = registerRequestSchema.safeParse({
      email: "u@e.co",
      phone: "+380501112233",
      password: "12345678",
    });
    expect(r.success).toBe(false);
  });

  it("зберігає непорожнє ім'я", () => {
    const r = registerRequestSchema.safeParse({
      email: "u@e.co",
      phone: "+380501112233",
      password: "12345678",
      name: "  Олег  ",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Олег");
  });
});
