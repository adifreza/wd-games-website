import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { resolveGameSizeGB } from '../utils/format.js';

const StorefrontContext = createContext(null);

export function StorefrontProvider({ children }) {
  const [selectedHdd, setSelectedHdd] = useState(null);
  const [selectedGames, setSelectedGames] = useState([]); // array of full game objects
  const [searchQuery, setSearchQuery] = useState('');

  const capacityGB = useMemo(() => Number(selectedHdd?.kapasitas_gb ?? 0), [selectedHdd?.kapasitas_gb]);
  const usedGB = useMemo(
    () => selectedGames.reduce((sum, g) => sum + resolveGameSizeGB(g), 0),
    [selectedGames]
  );
  const remainingGB = useMemo(() => Math.max(0, capacityGB - usedGB), [capacityGB, usedGB]);

  const selectHdd = useCallback((hdd) => {
    setSelectedHdd(hdd);
    setSelectedGames([]);
  }, []);

  const hasGame = useCallback(
    (game) => selectedGames.some((g) => Number(g?.id) === Number(game?.id)),
    [selectedGames]
  );

  const canAddGame = useCallback(
    (game) => {
      if (!selectedHdd) return false;
      const size = resolveGameSizeGB(game);
      return size <= remainingGB;
    },
    [selectedHdd, remainingGB]
  );

  const addGame = useCallback(
    (game) => {
      if (!selectedHdd) return false;
      if (hasGame(game)) return true;
      if (!canAddGame(game)) return false;

      setSelectedGames((prev) => [...prev, game]);
      return true;
    },
    [selectedHdd, hasGame, canAddGame]
  );

  const removeGame = useCallback((game) => {
    setSelectedGames((prev) => prev.filter((g) => Number(g?.id) !== Number(game?.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGames([]);
  }, []);

  const value = useMemo(
    () => ({
      selectedHdd,
      selectedGames,
      capacityGB,
      usedGB,
      remainingGB,
      searchQuery,
      setSearchQuery,
      selectHdd,
      addGame,
      removeGame,
      hasGame,
      canAddGame,
      clearSelection,
    }),
    [
      selectedHdd,
      selectedGames,
      capacityGB,
      usedGB,
      remainingGB,
      searchQuery,
      selectHdd,
      addGame,
      removeGame,
      hasGame,
      canAddGame,
      clearSelection,
    ]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error('useStorefront must be used inside StorefrontProvider');
  return ctx;
}
