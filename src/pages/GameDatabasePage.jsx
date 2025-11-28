import { useState, useEffect } from "react";
import { useGames } from "../hooks/useGames";
import { useMetadata } from "../hooks/useMetadata";
import "./GameDatabasePage.css";

export default function GameDatabasePage() {
  const { games, loading } = useGames();
  const { genres, platforms, developers, publishers } = useMetadata();

  // Search
  const [search, setSearch] = useState("");

  // Filters
  const [filterGenre, setFilterGenre] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterDeveloper, setFilterDeveloper] = useState("");
  const [filterPublisher, setFilterPublisher] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("");

  // Infinite Scroll
  const ITEMS_PER_LOAD = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    function handleScroll() {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200;

      if (bottom) {
        setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtering Logic
  const filteredGames = games.filter((g) => {
    const matchSearch =
      g.title?.toLowerCase().includes(search.toLowerCase());

    const matchGenre =
      !filterGenre ||
      g.genres_list?.some((ge) => ge.name === filterGenre);

    const matchPlatform =
      !filterPlatform ||
      g.platforms_list?.some((pl) => pl.name === filterPlatform);

    const matchDeveloper =
      !filterDeveloper || g.developer?.name === filterDeveloper;

    const matchPublisher =
      !filterPublisher || g.publisher?.name === filterPublisher;

    return (
      matchSearch &&
      matchGenre &&
      matchPlatform &&
      matchDeveloper &&
      matchPublisher
    );
  });

  // Sorting Logic
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "az") return a.title.localeCompare(b.title);
    if (sortBy === "za") return b.title.localeCompare(a.title);

    if (sortBy === "newest")
      return new Date(b.release_date) - new Date(a.release_date);

    if (sortBy === "oldest")
      return new Date(a.release_date) - new Date(b.release_date);

    if (sortBy === "rating-high")
      return (b.average_rating || 0) - (a.average_rating || 0);

    if (sortBy === "rating-low")
      return (a.average_rating || 0) - (b.average_rating || 0);

    return 0;
  });

  // Infinite Scroll sliced list
  const visibleGames = sortedGames.slice(0, visibleCount);

  return (
    <div className="db-container">

      {/* SEARCH */}
      <input
        type="text"
        className="db-search"
        placeholder="Search games..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="db-filters">

        {/* GENRE */}
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          <option value="">Genre</option>
          {genres.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>

        {/* PLATFORM */}
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
        >
          <option value="">Platform</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        {/* DEVELOPER */}
        <select
          value={filterDeveloper}
          onChange={(e) => setFilterDeveloper(e.target.value)}
        >
          <option value="">Developer</option>
          {developers.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        {/* PUBLISHER */}
        <select
          value={filterPublisher}
          onChange={(e) => setFilterPublisher(e.target.value)}
        >
          <option value="">Publisher</option>
          {publishers.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* SORTING */}
      <div className="db-sort">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
          <option value="newest">Newest Release</option>
          <option value="oldest">Oldest Release</option>
          <option value="rating-high">Rating: High → Low</option>
          <option value="rating-low">Rating: Low → High</option>
        </select>
      </div>

      {/* LOADING */}
      {loading && <p className="db-loading">Loading games...</p>}

      {/* GAME GRID */}
      <div className="db-grid">
        {!loading &&
          visibleGames.map((game) => (
            <div className="db-card" key={game.id}>

              <img
                src={game.cover_url}
                alt={game.title}
              />

              <h4>{game.title}</h4>

              <p>
                {/* Genres */}
                {Array.isArray(game.genres_list)
                  ? game.genres_list.map((g) => g.name).join(", ")
                  : "Unknown"}

                {" • "}

                {/* Platforms */}
                {Array.isArray(game.platforms_list)
                  ? game.platforms_list.map((p) => p.name).join(", ")
                  : "Unknown"}
              </p>

            </div>
          ))}
      </div>

      {/* INFINITE SCROLL STATUS */}
      {visibleCount < sortedGames.length && (
        <p className="db-loading-more">Loading more games...</p>
      )}

    </div>
  );
}
