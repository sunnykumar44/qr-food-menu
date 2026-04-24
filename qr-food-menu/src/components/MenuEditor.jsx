import { useState } from "react";
import { CATEGORY_KEYS } from "../firebase";
import { useI18n } from "../i18n.jsx";
import { categoryLabel } from "../utils";

function ItemRow({ item, onToggle, onName, onPrice, onDelete, t }) {
  return (
    <div className="menu-row">
      <label className="checkbox-wrap">
        <input type="checkbox" checked={item.enabled} onChange={(e) => onToggle(e.target.checked)} />
        <span>{t("enabled")}</span>
      </label>

      <input value={item.name} onChange={(e) => onName(e.target.value)} aria-label={t("itemName")} />

      <input
        value={item.price}
        onChange={(e) => onPrice(e.target.value)}
        type="number"
        min="0"
        aria-label={t("price")}
      />

      <button className="danger-btn" onClick={onDelete} type="button">
        {t("delete")}
      </button>
    </div>
  );
}

export default function MenuEditor({ menuItems = [], onChange }) {
  const { t } = useI18n();
  const [draftItems, setDraftItems] = useState({
    tiffins: { name: "", price: "" },
    lunch: { name: "", price: "" },
    dinner: { name: "", price: "" }
  });

  const updateItem = (id, patch) => {
    const next = menuItems.map((item) => (item.id === id ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeItem = (id) => {
    const next = menuItems.filter((item) => item.id !== id);
    onChange(next);
  };

  const addItem = (category) => {
    const draft = draftItems[category] || { name: "", price: "" };
    const name = draft.name.trim();
    if (!name) return;

    const next = [
      ...menuItems,
      {
        id: crypto.randomUUID(),
        name,
        category,
        price: draft.price.trim(),
        enabled: true
      }
    ];
    onChange(next);
    setDraftItems((prev) => ({
      ...prev,
      [category]: { name: "", price: "" }
    }));
  };

  return (
    <section className="card">
      <h2>{t("menuSetup")}</h2>

      {CATEGORY_KEYS.map((category) => {
        const items = menuItems.filter((item) => item.category === category);
        return (
          <div className="category-block" key={category}>
            <h3>{categoryLabel(category, t)}</h3>

            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={(checked) => updateItem(item.id, { enabled: checked })}
                onName={(value) => updateItem(item.id, { name: value })}
                onPrice={(value) => updateItem(item.id, { price: value })}
                onDelete={() => removeItem(item.id)}
                t={t}
              />
            ))}

            <div className="add-item-row">
              <input
                placeholder={t("addItemPlaceholder")}
                value={draftItems[category]?.name || ""}
                onChange={(e) =>
                  setDraftItems((prev) => ({
                    ...prev,
                    [category]: { ...(prev[category] || {}), name: e.target.value }
                  }))
                }
              />
              <input
                type="number"
                min="0"
                placeholder={t("price")}
                value={draftItems[category]?.price || ""}
                onChange={(e) =>
                  setDraftItems((prev) => ({
                    ...prev,
                    [category]: { ...(prev[category] || {}), price: e.target.value }
                  }))
                }
              />
              <button className="primary-btn" type="button" onClick={() => addItem(category)}>
                {t("addItem")}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
