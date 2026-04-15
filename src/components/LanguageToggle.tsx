import { useTranslation } from "react-i18next";
import trFlag from "../assets/images/tr.png";
import enFlag from "../assets/images/abd.png";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language || "tr";

  return (
    <button
      onClick={toggleLanguage}
      className="relative bg-dark-brown/80 backdrop-blur-sm rounded-full border border-dark-brown/50 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 p-0.5 flex flex-row gap-0.5"
      title={currentLang === "tr" ? "Switch to English" : "Türkçeye geç"}
    >
      <div className="relative flex items-center justify-center">
        <img
          src={trFlag}
          alt="Türkçe"
          className={`w-7 h-7 rounded-full object-cover transition-all duration-300 ${
            currentLang === "tr" ? "opacity-100 scale-100" : "opacity-40 scale-90"
          }`}
        />
      </div>
      <div className="relative flex items-center justify-center">
        <img
          src={enFlag}
          alt="English"
          className={`w-7 h-7 rounded-full object-cover transition-all duration-300 ${
            currentLang === "en" ? "opacity-100 scale-100" : "opacity-40 scale-90"
          }`}
        />
      </div>
    </button>
  );
};
