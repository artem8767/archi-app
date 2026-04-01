import { describe, expect, it } from "vitest";
import { moderateUserText } from "./content-moderation";

describe("moderateUserText", () => {
  it("allows neutral text", async () => {
    const r = await moderateUserText("Привіт, як справи?");
    expect(r).toEqual({ ok: true });
  });

  it("blocks obvious drug solicitation", async () => {
    const r = await moderateUserText("куплю наркотики великий опт");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("drugs");
  });

  it("blocks hate phrase", async () => {
    const r = await moderateUserText("смерть москалям у чаті");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("hate");
  });
});
