import { useEffect, useState } from "react";
import {
  getGenres,
  getPlatforms,
  getDevelopers,
  getPublishers,
} from "../services/metadataService";

export function useMetadata() {
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    async function load() {
      const g = await getGenres();
      const p = await getPlatforms();
      const d = await getDevelopers();
      const pub = await getPublishers();

      if (!g.error) setGenres(g.data);
      if (!p.error) setPlatforms(p.data);
      if (!d.error) setDevelopers(d.data);
      if (!pub.error) setPublishers(pub.data);
    }

    load();
  }, []);

  return { genres, platforms, developers, publishers };
}
