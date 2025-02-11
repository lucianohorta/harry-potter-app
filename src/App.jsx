import React, { useEffect, useState, createContext, useContext } from "react";
import "./styles.css";

const API_BASE_URL = "https://hp-api.onrender.com/api";

// Contexts for Global State
const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: () => {},
});
const HouseContext = createContext({ house: "All", setHouse: () => {} });

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [view, setView] = useState("characters");
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites")) || [] );
  const [house, setHouse] = useState("All");
  const [spells, setSpells] = useState([]);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const charactersPerPage = 12; // Show 12 characters per page


  // Show all characters initially
  useEffect(() => {
    fetch(`${API_BASE_URL}/characters`)
      .then((res) => res.json())
      .then((data) => {
        setCharacters(data);
        setFilteredCharacters(data);
      });
  }, []);


  // Filter characters by selected house
  useEffect(() => {
    if (house === "All") {
      setFilteredCharacters(characters);
    } else {
      setFilteredCharacters(
        characters.filter((char) => char.house && char.house === house)
      );
    }
    setCurrentPage(1); // Reset to page 1 when changing house
  }, [house, characters]);


  // Toggle favorite character (and save to localStorage)
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const updatedFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
  
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };


  // Spells data
  useEffect(() => {
    fetch(`${API_BASE_URL}/spells`)
      .then((res) => res.json())
      .then((data) => {
        //console.log("Spells data:", data);
        setSpells(data);
      })
      .catch((error) => console.error("Error fetching spells:", error));
  }, []);


  // Get characters for the current page
  const startIndex = (currentPage - 1) * charactersPerPage;
  const paginatedCharacters = filteredCharacters.slice(
    startIndex,
    startIndex + charactersPerPage
  );


  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      <HouseContext.Provider value={{ house, setHouse }}>
      <div className={`app ${view === "details" ? "detail-page" : ""}`}>

          <h1 className="app-title">The Harry Potter Mischief Managed</h1>

          {/* Menu nav buttons */}
          <div className="nav-container">
            <div className="nav-left">
              <button onClick={() => setView("characters")}>Characters</button>
              <button onClick={() => setView("spells")}>Spells</button>
            </div>
            {view !== "details" && (
              <div className="nav-right">
                <HouseSelector />
              </div>
            )}
          </div>

          {/* Characters header and House Selector */}
          {view === "characters" && (
            <div className="character-list-container">
              <h2 className="characters-title">Characters</h2>
              <CharacterList
                characters={paginatedCharacters}
                onSelect={(char) => {
                  setSelectedCharacter(char);
                  setView("details");
                }}
              />
              <Pagination
                totalCharacters={filteredCharacters.length}
                charactersPerPage={charactersPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}

          {view === "details" && selectedCharacter && (
            <CharacterDetail character={selectedCharacter} setView={setView} />
          )}

          {view === "spells" && <SpellList spells={spells} />}
        </div>
      </HouseContext.Provider>
    </FavoritesContext.Provider>
  );
}


// Characters List
function CharacterList({ characters, onSelect }) {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  return (
    <div>
      <ul className="character-list">
        {characters.map((char) => (
          <li
            key={char.id}
            className={`character-item ${favorites.includes(char.id) ? "favorited" : ""}`}
            onClick={() => onSelect(char)}
          >
            <img src={char.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt={char.name} />
            <div className="character-title">
              <p> {char.name} {char.house ? `(${char.house})` : ""} </p>
              <button 
                className={`favorite-button ${favorites.includes(char.id) ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation();  toggleFavorite(char.id); }} >
                {favorites.includes(char.id) ? "★" : "☆"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Pagination Component
function Pagination({
  totalCharacters,
  charactersPerPage,
  currentPage,
  setCurrentPage,
}) {
  const totalPages = Math.ceil(totalCharacters / charactersPerPage);

  return (
    <div className="pagination">
      <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
      <span>{" "}Page {currentPage} of {totalPages}{" "}</span>
      <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
    </div>
  );
}

// Character Detail View
function CharacterDetail({ character, setView }) {
  return (
    <div className="character-detail">
      <h2>{character.name}</h2>
      <img src={character.image} alt={character.name} />
      <div className="character-info">
        <p><strong>House:</strong> {character.house || "Unknown"}</p>
        <p><strong>Species:</strong> {character.species}</p>
        <p><strong>Patronus:</strong> {character.patronus || "Unknown"}</p>
        <p><strong>Ancestry:</strong> {character.ancestry}</p>
      </div>
      <button onClick={() => setView("characters")}>Go Back</button>
    </div>
  );
}

// House Selection Component
function HouseSelector() {
  const { house, setHouse } = useContext(HouseContext);
  return (
    <div className="house-selector">
      <label>Select House: </label>
      <select value={house} onChange={(e) => setHouse(e.target.value)}>
        <option value="All">All</option>
        <option value="Gryffindor">Gryffindor</option>
        <option value="Slytherin">Slytherin</option>
        <option value="Hufflepuff">Hufflepuff</option>
        <option value="Ravenclaw">Ravenclaw</option>
      </select>
    </div>
  );
}

// Spells List
function SpellList({ spells }) {
  return (
    <div>
      <h2>Spells</h2>
      {spells.length === 0 ? (
        <p>Loading spells or no spells found...</p>
      ) : (
        <ul className="spell-list">
          {spells.map((spell, index) => (
            <li key={index} className="spell-item">
              <strong>{spell.name}</strong>
              <p>{spell.description || "No description available"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
