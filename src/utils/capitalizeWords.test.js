import { capitalizeWords } from "./capitalizeWords";

test("capitalizeWords should capitalize each word", () => {
    expect(capitalizeWords("harry potter")).toBe("Harry Potter");
    expect(capitalizeWords("hogwarts school of witchcraft")).toBe("Hogwarts School Of Witchcraft");
});
