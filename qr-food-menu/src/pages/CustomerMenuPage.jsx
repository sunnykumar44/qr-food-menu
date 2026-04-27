import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppTranslator from "../components/AppTranslator";
import { defaultMenuSections, subscribeShop, incrementShopViewCount, addFeedback } from "../firebase";
import { useI18n } from "../i18n.jsx";
import { groupMenuItems } from "../utils";

export default function CustomerMenuPage() {
  const { shopId } = useParams();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [shop, setShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [feedback, setFeedback] = useState({ name: "", comments: "" });
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (!shopId) {
      setIsLoading(false);
      setLoadError(t("invalidMenuLink"));
      return undefined;
    }

    // Only increment the view count once per hard refresh/visit to prevent spam
    const hasViewedKey = `qr_viewed_${shopId}`;
    if (!sessionStorage.getItem(hasViewedKey)) {
      incrementShopViewCount(shopId);
      sessionStorage.setItem(hasViewedKey, "true");
    }

    setIsLoading(true);
    setLoadError("");
    setShop(null);

    const timeoutRef = setTimeout(() => {
      setIsLoading(false);
      setLoadError(t("menuLoadTimeout"));
    }, 8000);

    const unsubscribe = subscribeShop(
      shopId,
      (nextShop) => {
        clearTimeout(timeoutRef);
        setShop(nextShop);
        setIsLoading(false);
      },
      (errorMessage) => {
        clearTimeout(timeoutRef);
        setLoadError(errorMessage || t("menuLoadFailed"));
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutRef);
      unsubscribe();
    };
  }, [shopId, t]);

  if (isLoading) {
    return <p className="muted-text">{t("loadingMenu")}</p>;
  }

  if (loadError) {
    return <p className="muted-text">{loadError}</p>;
  }

  if (!shop) {
    return <p className="muted-text">{t("shopNotFound")}</p>;
  }

  const grouped = groupMenuItems(shop.menuItems || []);
  const allSections =
    shop.menuSections?.length > 0
      ? shop.menuSections
      : defaultMenuSections(shop.businessType || "restaurant");
  const sections = allSections.filter((section) => section.enabled !== false);
  const hasAnyItems = sections.some((section) => grouped[section.id]?.length > 0);

  const filteredSections = sections.map(section => {
    const items = grouped[section.id] || [];
    const filteredItems = searchTerm 
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;
    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  const hasFilteredItems = filteredSections.length > 0;

  return (
    <div className="customer-page card">
      <div className="customer-head">
        <div>
          <h2>{shop.name || t("customerMenu")}</h2>
          <p>{shop.description}</p>
          <p className="muted-text">{shop.mobile}</p>
        </div>
        <AppTranslator />
      </div>

      {shop.imageUrls?.length > 0 && (
        <div className="image-strip">
          {shop.imageUrls.map((url) => (
            <img key={url} src={url} alt={shop.name || "shop"} />
          ))}
        </div>
      )}

      {hasAnyItems && (
        <div className="search-bar-wrap">
          <input 
            type="search" 
            placeholder={t("searchItems")} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="menu-search-input"
          />
        </div>
      )}

      {!hasAnyItems && <p>{t("noItems")}</p>}
      {hasAnyItems && !hasFilteredItems && <p>{t("noItemsFound")}</p>}

      {filteredSections.map((section) => {
        if (section.items.length === 0) return null;

        return (
          <section className="menu-section" key={section.id}>
            <h3>{section.label || t("sectionHeading")}</h3>
            <div className="customer-menu-grid">
              {section.items.map((item) => {
                const showPrice = String(item.price || "").trim().length > 0;
                return (
                  <article className="customer-item" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="item-name-wrap">
                        {item.dietary === "veg" && <div className="diet-icon veg" title={t("veg")}></div>}
                        {item.dietary === "non-veg" && <div className="diet-icon non-veg" title={t("nonVeg")}></div>}
                        <p>{item.name}</p>
                      </div>
                      {showPrice && <strong>Rs. {item.price}</strong>}
                    </div>
                    {item.imageUrl && (
                      <div style={{ marginLeft: '12px' }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <div style={{ marginTop: "40px", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "rgb(0 0 0 / 10%) 0px 4px 12px" }}>
        <h3>{t("customerFeedback") || "Customer Feedback"}</h3>
        {feedbackSent ? (
          <p style={{ color: "green" }}>{t("feedbackSent") || "Thank you for your feedback!"}</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!feedback.comments.trim()) return;
              await addFeedback(shopId, feedback);
              setFeedbackSent(true);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}
          >
            <input 
              placeholder={t("yourName") || "Your Name (Optional)"}
              value={feedback.name}
              onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <textarea
              placeholder={t("yourComments") || "Your Comments"}
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              required
              rows={3}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button type="submit" className="primary-btn" style={{ alignSelf: "flex-start" }}>
              {t("submitFeedback") || "Submit"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
