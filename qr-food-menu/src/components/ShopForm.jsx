import { useEffect, useState } from "react";
import { useI18n } from "../i18n.jsx";

export default function ShopForm({ shop, onSave, saving }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", mobile: "", description: "" });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setForm({
      name: shop?.name || "",
      mobile: shop?.mobile || "",
      description: shop?.description || ""
    });
    setFiles([]);
  }, [shop?.id, shop?.name, shop?.mobile, shop?.description]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    await onSave(form, files);
  };

  if (!shop) return null;

  const existingImages = shop.imageUrls || [];

  return (
    <section className="card">
      <h2>{t("shopDetails")}</h2>

      <form className="shop-form" onSubmit={submit}>
        <label>
          <span>{t("shopName")}</span>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Ramesh Tiffin Center"
            required
          />
        </label>

        <label>
          <span>{t("mobile")}</span>
          <input
            value={form.mobile}
            onChange={(e) => updateField("mobile", e.target.value)}
            placeholder="9876543210"
          />
        </label>

        <label>
          <span>{t("description")}</span>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            placeholder="Pure veg tiffins and meals"
          />
        </label>

        <label>
          <span>{t("addImages")}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <small>{t("imageUploadHint")}</small>
        </label>

        {shop.imageUrls?.length > 0 && (
          <div className="image-grid">
            {shop.imageUrls.map((url) => (
              <img key={url} src={url} alt={shop.name || "shop"} />
            ))}
          </div>
        )}

        <div className="shop-preview-block">
          <h3>{t("attachmentPreview")}</h3>
          <div className="preview-list">
            <div>
              <span>{t("shopName")}</span>
              <strong>{form.name || "-"}</strong>
            </div>
            <div>
              <span>{t("mobile")}</span>
              <strong>{form.mobile || "-"}</strong>
            </div>
            <div>
              <span>{t("description")}</span>
              <strong>{form.description || "-"}</strong>
            </div>
            <div>
              <span>{t("selectedFiles")}</span>
              <strong>
                {files.length > 0 ? files.map((file) => file.name).join(", ") : t("noFilesSelected")}
              </strong>
            </div>
            <div>
              <span>{t("existingImages")}</span>
              <strong>{existingImages.length}</strong>
            </div>
          </div>
        </div>

        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? t("saving") : t("saveDetails")}
        </button>
      </form>
    </section>
  );
}
