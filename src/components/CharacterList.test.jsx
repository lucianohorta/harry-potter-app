import { render, screen, within } from "@testing-library/react";
import { FavoritesContext } from "../App";
import CharacterList from "../App";
import { vi } from "vitest";

test("renders character list with name and the favorite button", async () => {
  const characters = [{ id: 1, name: "Harry Potter", house: "Gryffindor", image: "harry.jpg" }];
  const toggleFavorite = vi.fn();

  render(
    <FavoritesContext.Provider value={{ favorites: [], toggleFavorite }}>
      <CharacterList characters={characters} onSelect={() => {}} />
    </FavoritesContext.Provider>
  );

  screen.debug(); // Inspect output

  const characterItems = await screen.findAllByTestId("character-item");
  expect(characterItems.length).toBeGreaterThan(0);

  expect(within(characterItems[0]).getByText(/Harry Potter/i)).toBeInTheDocument();
  expect(within(characterItems[0]).getByText(/Gryffindor/i)).toBeInTheDocument();
  expect(within(characterItems[0]).getByRole("button")).toHaveTextContent("☆");
});
