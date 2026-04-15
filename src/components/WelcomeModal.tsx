import { useTranslation } from "react-i18next";

type Props = {
  onClose: () => void;
};

export const WelcomeModal = ({ onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="welcome-overlay" onClick={onClose}>
      <div
        className="welcome-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="welcome-close" onClick={onClose} aria-label="Kapat">
          ✕
        </button>

        <h2 className="welcome-title">{t("welcomeModalTitle")}</h2>
        <p className="welcome-body">
          {t("welcomeModalBodyPart1")}
          <a
            href="https://www.instagram.com/davinciboardgamecafe/"
            target="_blank"
            rel="noopener noreferrer"
            className="welcome-link"
          >
            {t("welcomeModalBodyLink")}
          </a>
          {t("welcomeModalBodyPart2")}
        </p>

        <button className="welcome-ok" onClick={onClose}>
          {t("welcomeModalButton")}
        </button>
      </div>
    </div>
  );
};
