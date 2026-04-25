import { useState } from "react";
import { useI18n } from "../i18n.jsx";

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

export default function MenuEditor({ menuItems = [], menuSections = [], onItemsChange, onSectionsChange }) {
  const { t } = useI18n();
  const [draftItems, setDraftItems] = useState({});
  const [newSectionLabel, setNewSectionLabel] = useState("");

  const updateItem = (id, patch) => {
    const next = menuItems.map((item) => (item.id === id ? { ...item, ...patch } : item));
    onItemsChange(next);
  };

  const removeItem = (id) => {
    const next = menuItems.filter((item) => item.id !== id);
    onItemsChange(next);
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
    onItemsChange(next);
    setDraftItems((prev) => ({
      ...prev,
      [category]: { name: "", price: "" }
    }));
  };

  const updateSectionLabel = (sectionId, label) => {
    const nextSections = menuSections.map((section) =>
      section.id === sectionId ? { ...section, label } : section
    );
    onSectionsChange(nextSections);
  };

  const updateSectionEnabled = (sectionId, enabled) => {
    const nextSections = menuSections.map((section) =>
      section.id === sectionId ? { ...section, enabled } : section
    );
    onSectionsChange(nextSections);
  };

  const addSection = () => {
    const label = newSectionLabel.trim();
    if (!label) return;

    const sectionId = `section-${crypto.randomUUID().slice(0, 8)}`;
    const nextSections = [...menuSections, { id: sectionId, label, enabled: true }];
    onSectionsChange(nextSections);
    setNewSectionLabel("");
  };

  return (
    <section className="card">
      <h2>{t("menuSetup")}</h2>

      <div className="add-heading-row">
        <input
          value={newSectionLabel}
          onChange={(e) => setNewSectionLabel(e.target.value)}
          placeholder={t("addHeadingPlaceholder")}
        />
        <button className="primary-btn" type="button" onClick={addSection}>
          {t("addHeading")}
        </button>
      </div>

      {menuSections.map((section) => {
        const category = section.id;
        const items = menuItems.filter((item) => item.category === section.id);
        return (
          <div className={`category-block ${section.enabled === false ? "is-disabled" : ""}`} key={section.id}>
            <div className="section-head-row">
              <label className="checkbox-wrap section-toggle">
                <input
                  type="checkbox"
                  checked={section.enabled !== false}
                  onChange={(e) => updateSectionEnabled(section.id, e.target.checked)}
                />
                <span>{t("headingEnabled")}</span>
              </label>
              <input
                value={section.label || ""}
                onChange={(e) => updateSectionLabel(section.id, e.target.value)}
                placeholder={t("sectionHeadingPlaceholder")}
              />
            </div>

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
