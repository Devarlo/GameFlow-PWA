import { useState, useEffect } from "react";
import GameCard from "../components/Game/GameCard";
import { useGames } from "../hooks/useGames";
import { useMetadata } from "../hooks/useMetadata";
import "./GameDatabasePage.css";

export default function GameDatabasePage() {
  const { games, loading } = useGames();
  const { genres, platforms, developers, publishers } = useMetadata();

  const [search, setSearch] = useState("");

  const [filterGenre, setFilterGenre] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterDeveloper, setFilterDeveloper] = useState("");
  const [filterPublisher, setFilterPublisher] = useState("");

  const [sortBy, setSortBy] = useState("");

  const ITEMS_PER_LOAD = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);

  useEffect(() => {
    function handleScroll() {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200;

      if (bottom) setVisibleCount((p) => p + ITEMS_PER_LOAD);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredGames = games.filter((g) => {
    const searchMatch = g.title?.toLowerCase().includes(search.toLowerCase());
    const genreMatch =
      !filterGenre ||
      g.genres_list?.some((ge) => ge.name === filterGenre);

    const platformMatch =
      !filterPlatform ||
      g.platforms_list?.some((pl) => pl.name === filterPlatform);

    const devMatch = !filterDeveloper || g.developer?.name === filterDeveloper;
    const pubMatch = !filterPublisher || g.publisher?.name === filterPublisher;

    return searchMatch && genreMatch && platformMatch && devMatch && pubMatch;
  });

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

  const visibleGames = sortedGames.slice(0, visibleCount);

  return (
    <div className="db-container">
      <div className="gf-inner">

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

          <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
            <option value="">Genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>

          <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
            <option value="">Platform</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select value={filterDeveloper} onChange={(e) => setFilterDeveloper(e.target.value)}>
            <option value="">Developer</option>
            {developers.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select value={filterPublisher} onChange={(e) => setFilterPublisher(e.target.value)}>
            <option value="">Publisher</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

        </div>

        {/* SORT */}
        <div className="db-sort">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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

        {/* GRID */}
        <div className="db-grid">
          {!loading &&
            visibleGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
        </div>

        {/* INFINITE SCROLL STATUS */}
        {visibleCount < sortedGames.length && (
          <p className="db-loading-more">Loading more games...</p>
        )}

      </div>
    </div>
  );
}
