import { useState } from "react";
import { useI18n } from "../i18n.jsx";

function ItemRow({ item, onToggle, onName, onPrice, onDietary, onDelete, t }) {
  return (
    <div className="menu-row">
      <label className="checkbox-wrap">
        <input type="checkbox" checked={item.enabled} onChange={(e) => onToggle(e.target.checked)} />
        <span>{t("enabled")}</span>
      </label>

      <input value={item.name} onChange={(e) => onName(e.target.value)} aria-label={t("itemName")} />

      <select value={item.dietary || "none"} onChange={(e) => onDietary(e.target.value)} aria-label={t("dietary")}>
        <option value="none">{t("none")}</option>
        <option value="veg">{t("veg")}</option>
        <option value="non-veg">{t("nonVeg")}</option>
      </select>

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

export default function MenuEditor({ menuItems = [], menuSections = [], onItemsChange, onSectionsChange, onBulkImport }) {
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
    const draft = draftItems[category] || {};
    const name = (draft.name || "").trim();
    if (!name) return;

    const next = [
      ...menuItems,
      {
        id: crypto.randomUUID(),
        name,
        category,
        price: (draft.price || "").trim(),
        dietary: draft.dietary || "none",
        enabled: true
      }
    ];
    onItemsChange(next);
    setDraftItems((prev) => ({
      ...prev,
      [category]: { name: "", price: "", dietary: "none" }
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

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").map(r => r.trim()).filter(r => r);
      
      const newItems = [];
      const newSections = [];
      let currentSections = [...menuSections];

      // Assuming format: Section Name, Item Name, Price, Dietary (opt)
      // Skip header if it contains typical header words
      const startIndex = rows[0].toLowerCase().includes("section") || rows[0].toLowerCase().includes("price") ? 1 : 0;

      for (let i = startIndex; i < rows.length; i++) {
        // split by comma, handling potential quotes if needed, but a simple split is fine for basic
        const cols = rows[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 2) continue;

        let sectionName = cols[0];
        let itemName = cols[1];
        let itemPrice = cols[2] || "";
        let rawDiet = (cols[3] || "none").toLowerCase();

        if (!itemName) continue;

        // Find or create section
        let section = currentSections.find(s => s.label.toLowerCase() === sectionName.toLowerCase());
        if (!section) {
          section = { id: `section-${crypto.randomUUID().slice(0, 8)}`, label: sectionName || "Imported", enabled: true };
          currentSections.push(section);
        }

        let dietary = "none";
        if (rawDiet.includes("non")) dietary = "non-veg";
        else if (rawDiet.includes("veg")) dietary = "veg";

        newItems.push({
          id: crypto.randomUUID(),
          name: itemName,
          category: section.id,
          price: itemPrice,
          dietary,
          enabled: true
        });
      }

      // Apply changes safely. React batched updates are best done individually if relying on previous state, but we just pass the full arrays.
      if (onBulkImport && (currentSections.length !== menuSections.length || newItems.length > 0)) {
        onBulkImport(currentSections, [...menuItems, ...newItems]);
      } else {
        if (currentSections.length !== menuSections.length) {
          onSectionsChange(currentSections);
        }
        if (newItems.length > 0) {
          onItemsChange([...menuItems, ...newItems]);
        }
      }
      
      // Reset input
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>{t("menuSetup")}</h2>
        <label className="ghost-action-btn" style={{ cursor: "pointer", fontSize: "0.85rem", padding: "6px 12px" }} title={t("csvFormatHint")}>
          {t("importCsv")}
          <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleCsvUpload} />
        </label>
      </div>

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
                onDietary={(value) => updateItem(item.id, { dietary: value })}
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
              <select
                value={draftItems[category]?.dietary || "none"}
                onChange={(e) =>
                  setDraftItems((prev) => ({
                    ...prev,
                    [category]: { ...(prev[category] || {}), dietary: e.target.value }
                  }))
                }
                aria-label={t("dietary")}
              >
                <option value="none">{t("none")}</option>
                <option value="veg">{t("veg")}</option>
                <option value="non-veg">{t("nonVeg")}</option>
              </select>
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
