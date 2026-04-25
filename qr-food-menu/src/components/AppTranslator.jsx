import { useEffect } from "react";

export default function AppTranslator() {
  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,te,hi",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          "google_translate_element"
        );
      };
    }

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // Re-initialize if the script was already loaded but component remounted
      document.getElementById("google_translate_element").innerHTML = "";
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div 
      id="google_translate_element" 
      style={{ overflow: "hidden", display: "inline-block", maxWidth: "160px" }}
    ></div>
  );
}