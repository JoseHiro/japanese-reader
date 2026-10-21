import { describe, expect, it } from "vitest";
import { PARTICLES, parseParticleText, particleChoices } from "./ParticleQuiz";

describe("parseParticleText", () => {
  it("splits bracketed particles into answers and the text around them", () => {
    expect(parseParticleText("A［を］B［に］C")).toEqual({
      segments: ["A", "B", "C"],
      answers: ["を", "に"],
    });
  });

  it("keeps empty segments at the edges so segments = answers + 1", () => {
    const { segments, answers } = parseParticleText("［は］中［から］");
    expect(answers).toEqual(["は", "から"]);
    expect(segments).toEqual(["", "中", ""]);
  });

  it("returns the whole text as one segment when there are no blanks", () => {
    expect(parseParticleText("ブランクなし。")).toEqual({
      segments: ["ブランクなし。"],
      answers: [],
    });
  });
});

describe("particleChoices", () => {
  it("is the shared set when every answer is in it", () => {
    expect(particleChoices(["を", "が"])).toEqual(PARTICLES);
  });

  it("appends answers outside the shared set once", () => {
    expect(particleChoices(["や", "を", "や"])).toEqual([...PARTICLES, "や"]);
  });
});
