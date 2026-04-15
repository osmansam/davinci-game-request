import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { requestGame, useGetBggGames } from "./utils/api/bgg";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const storageKey = "davinci_request_pairs";

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function buildPairKey(email: string, gameName: string) {
  return `${normalizeText(email)}::${normalizeText(gameName)}`;
}

function readRequestedPairs() {
  if (typeof window === "undefined") return [] as string[];

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
}

function writeRequestedPair(pairKey: string) {
  if (typeof window === "undefined") return;

  const existing = readRequestedPairs();
  if (existing.includes(pairKey)) return;
  window.localStorage.setItem(
    storageKey,
    JSON.stringify([...existing, pairKey]),
  );
}

function App() {
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [isSuggestionFocused, setIsSuggestionFocused] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [requestedPairs, setRequestedPairs] = useState<string[]>(() =>
    readRequestedPairs(),
  );

  const bggGamesRaw = useGetBggGames();

  const bggNames = useMemo(() => {
    return (bggGamesRaw || [])
      .map((entry) => {
        if (Array.isArray(entry)) {
          return entry[0]?.value;
        }

        return (entry as { value?: string })?.value;
      })
      .filter((name): name is string => Boolean(name));
  }, [bggGamesRaw]);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedQuery = normalizeText(query);
  const typedGameName = query.trim();
  const gameNameForSubmit = (selectedGame.trim() || typedGameName).trim();
  const pairKey = buildPairKey(normalizedEmail, gameNameForSubmit);
  const alreadyRequestedByUser = requestedPairs.includes(pairKey);

  const matchingBggGames = useMemo(() => {
    if (normalizedQuery.length < 2) return [];

    return bggNames.filter((name) =>
      normalizeText(name).includes(normalizedQuery),
    );
  }, [bggNames, normalizedQuery]);

  const visibleSuggestions = useMemo(() => {
    return [
      ...matchingBggGames.map((name) => ({
        name,
        source: "bgg" as const,
      })),
    ];
  }, [matchingBggGames]);

  useEffect(() => {
    if (query.trim().length < 2) return;

    console.log("[Game Suggestions Updated]", {
      query,
      count: visibleSuggestions.length,
      options: visibleSuggestions.map((suggestion) => suggestion.name),
    });
  }, [query, visibleSuggestions]);

  const mutation = useMutation({
    mutationFn: requestGame,
    onSuccess: (_data, variables) => {
      const submittedPairKey = buildPairKey(variables.email, variables.name);

      writeRequestedPair(submittedPairKey);
      setRequestedPairs((prev) =>
        prev.includes(submittedPairKey) ? prev : [...prev, submittedPairKey],
      );
      setStatusType("success");
      setStatusMessage("Talebin alindi ve panel veritabanina kaydedildi.");

      setQuery("");
      setSelectedGame("");
    },
    onError: (error: unknown) => {
      const errorMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.message ||
        "Talep kaydedilemedi. Lütfen tekrar deneyin.";
      setStatusType("error");
      setStatusMessage(errorMessage);
    },
  });

  const isEmailValid = emailRegex.test(normalizedEmail);
  const hasGameName = gameNameForSubmit.length > 0;
  const isFormValid = isEmailValid && hasGameName && !alreadyRequestedByUser;

  const handleSelectSuggestion = (name: string) => {
    setQuery(name);
    setSelectedGame(name);
    setIsSuggestionFocused(false);
    setStatusMessage("");
    setStatusType("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("");

    if (!isEmailValid) {
      setStatusType("error");
      setStatusMessage("Geçerli bir e-posta adresi girmeniz gerekiyor.");
      return;
    }

    if (!gameNameForSubmit) {
      setStatusType("error");
      setStatusMessage("Lutfen oyun adini giriniz.");
      return;
    }

    if (alreadyRequestedByUser) {
      setStatusType("error");
      setStatusMessage("Bu oyunu bu e-posta ile daha önce talep etmişsiniz.");
      return;
    }

    mutation.mutate({
      email: normalizedEmail,
      name: gameNameForSubmit,
    });
  };

  return (
    <main className="request-page">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <section className="request-shell" aria-labelledby="request-title">
        <header className="request-header">
          <p className="kicker">DAVINCI BOARD GAME</p>
          <h1 id="request-title">Satılık Oyun Talep Formu</h1>
        </header>

        <form className="request-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>E-posta adresi</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@eposta.com"
              required
              autoComplete="email"
            />
          </label>

          <div className="field autocomplete-field">
            <label htmlFor="game-query">Talep edilen oyun</label>
            <input
              id="game-query"
              type="text"
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
                setQuery(nextValue);
                setSelectedGame("");
                setIsSuggestionFocused(nextValue.trim().length >= 2);
                setStatusMessage("");
                setStatusType("");
              }}
              onFocus={() => setIsSuggestionFocused(true)}
              onBlur={() => {
                // Allow click on suggestion before closing list.
                setTimeout(() => setIsSuggestionFocused(false), 120);
              }}
              placeholder="Ornek: Blood Rage"
              required
            />

            {query.trim().length >= 2 && isSuggestionFocused && (
              <div
                className="suggestion-panel"
                role="listbox"
                aria-label="Oyun onerileri"
              >
                {visibleSuggestions.length === 0 && (
                  <p className="suggestion-empty">
                    Sonuc bulunamadi. Farkli bir isim deneyin.
                  </p>
                )}

                {visibleSuggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={`${suggestion.source}-${suggestion.name}`}
                    className="suggestion-item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectSuggestion(suggestion.name)}
                  >
                    <span className="suggestion-name">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {alreadyRequestedByUser && (
            <div className="status-banner error" role="alert">
              Bu e-posta ile bu oyunu daha once talep etmissiniz. Ayni kisi ayni
              oyunu bir kez talep edebilir.
            </div>
          )}

          {statusMessage && (
            <div
              className={`status-banner ${statusType === "success" ? "success" : "error"}`}
              role={statusType === "success" ? "status" : "alert"}
            >
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid || mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Talebi gönder"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
