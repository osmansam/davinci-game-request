import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import trFlag from "../assets/images/tr.png";
import enFlag from "../assets/images/abd.png";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "tr";

  const [displayedLang, setDisplayedLang] = useState(currentLang);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentLang === displayedLang) return;
    // Fade out → swap → fade in
    setVisible(false);
    const timer = setTimeout(() => {
      setDisplayedLang(currentLang);
      setVisible(true);
    }, 180);
    return () => clearTimeout(timer);
  }, [currentLang]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative bg-dark-brown/80 backdrop-blur-sm rounded-full border border-dark-brown/50 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200 p-0.5"
      title={displayedLang === "tr" ? "Switch to English" : "Türkçeye geç"}
    >
      <img
        src={displayedLang === "tr" ? trFlag : enFlag}
        alt={displayedLang === "tr" ? "Türkçe" : "English"}
        className="w-7 h-7 rounded-full object-cover"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) rotate(0deg)" : "scale(0.6) rotate(45deg)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      />
    </button>
  );
};
