import { useI18n } from "../i18n.jsx";

export default function ShopList({ shops, selectedShopId, onSelect, onCreate }) {
  const { t } = useI18n();

  return (
    <aside className="card shop-list">
      <div className="section-head">
        <h2>{t("yourShops")}</h2>
        <button className="primary-btn" type="button" onClick={onCreate}>
          {t("createShop")}
        </button>
      </div>

      <div className="shop-items">
        {shops.length === 0 && <p className="muted-text">{t("noShops")}</p>}

        {shops.map((shop) => {
          const active = shop.id === selectedShopId;
          return (
            <button
              className={`shop-item ${active ? "active" : ""}`}
              key={shop.id}
              onClick={() => onSelect(shop.id)}
            >
              <strong>{shop.name?.trim() || "Untitled Shop"}</strong>
              <span>{shop.mobile || "--"}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
