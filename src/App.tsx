import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import logoUrl from "./assets/images/logo.png";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { LanguageToggle } from "./components/LanguageToggle";
import { WelcomeModal } from "./components/WelcomeModal";
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
}//deneme

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
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
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

  const bggNames = useMemo(
      () => (bggGamesRaw || []).map((g) => g.name),
      [bggGamesRaw],
  );

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
      setStatusMessage(t("successMessage"));

      setQuery("");
      setSelectedGame("");
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawMessage = (error as any)?.response?.data?.message;
      // NestJS validation returns message as array or string
      const messageStr = Array.isArray(rawMessage)
        ? rawMessage.join(" ")
        : rawMessage ?? "";
      const errorMessage = messageStr.includes("name must be longer than or equal to 2")
        ? t("errorNameTooShort")
        : messageStr || t("errorMessage");
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
      setStatusMessage(t("invalidEmail"));
      return;
    }

    if (!gameNameForSubmit) {
      setStatusType("error");
      setStatusMessage(t("missingGame"));
      return;
    }

    if (alreadyRequestedByUser) {
      setStatusType("error");
      setStatusMessage(t("alreadyRequestedValidation"));
      return;
    }

    mutation.mutate({
      email: normalizedEmail,
      name: gameNameForSubmit,
    });
  };

  return (
      <main className="request-page">
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `url('${logoUrl}')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px auto',
            filter: 'grayscale(1) brightness(0.5)',
          }}
        />
        {/* Header Bar */}
        <div className="request-topbar">
          <img
              src="/title-background.png"
              alt=""
              className="request-topbar-bg"
              aria-hidden="true"
          />
          <div className="request-topbar-title">
            <div className="request-topbar-logo">
              <img src={logoUrl} alt="Davinci Logo" />
            </div>
            {t("title")}
            <div className="request-topbar-lang">
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="request-content">
          <section className="request-shell" aria-labelledby="request-title">
            {/* Board game illustration */}
            <div className="request-hero">
              <img src="/boardgame.png" alt="Board Game" />
            </div>

            <div className="request-divider" />

            <div className="request-inner">
              <header className="request-header">
                <h1 id="request-title">{t("formTitle")}</h1>
              </header>

              <form className="request-form" onSubmit={handleSubmit} noValidate>
                <label className="field">
                  <span>{t("emailLabel")}</span>
                  <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("emailPlaceholder")}
                      required
                      autoComplete="email"
                  />
                </label>

                <div className="field autocomplete-field">
                  <label htmlFor="game-query">{t("gameLabel")}</label>
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
                        setTimeout(() => setIsSuggestionFocused(false), 120);
                      }}
                      placeholder={t("gamePlaceholder")}
                      required
                  />

            {query.trim().length >= 2 && isSuggestionFocused && (
              <div
                className="suggestion-panel"
                role="listbox"
                aria-label={t("gameLabel")}
              >
                {visibleSuggestions.length === 0 && (
                  <p className="suggestion-empty">
                    {t("suggestionsEmpty")}
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
                      {t("alreadyRequestedBanner")}
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
                  {mutation.isPending ? t("submitting") : t("submitButton")}
                </button>

                <div className="social-links">
                  <a
                      href="https://www.instagram.com/davinciboardgamecafe/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                      href="https://www.youtube.com/@davinciboardgamecafe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label="YouTube"
                  >
                    <FaYoutube />
                  </a>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
  );
}

export default App;