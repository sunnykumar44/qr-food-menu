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
  const [draftNames, setDraftNames] = useState({ tiffins: "", lunch: "", dinner: "" });

  const updateItem = (id, patch) => {
    const next = menuItems.map((item) => (item.id === id ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeItem = (id) => {
    const next = menuItems.filter((item) => item.id !== id);
    onChange(next);
  };

  const addItem = (category) => {
    const name = (draftNames[category] || "").trim();
    if (!name) return;

    const next = [
      ...menuItems,
      {
        id: crypto.randomUUID(),
        name,
        category,
        price: "",
        enabled: true
      }
    ];
    onChange(next);
    setDraftNames((prev) => ({ ...prev, [category]: "" }));
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
                value={draftNames[category]}
                onChange={(e) => setDraftNames((prev) => ({ ...prev, [category]: e.target.value }))}
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
