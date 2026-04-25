import { useEffect, useMemo, useState } from "react";
import MenuEditor from "../components/MenuEditor";
import QrActions from "../components/QrActions";
import ShopForm from "../components/ShopForm";
import ShopList from "../components/ShopList";
import {
  ADMIN_ID,
  createShop,
  createShopId,
  deleteShop,
  defaultMenuSections,
  defaultMenuItems,
  subscribeShops,
  updateShop,
  uploadShopImages
} from "../firebase";
import { useI18n } from "../i18n.jsx";
import { businessTypeLabel } from "../utils";

const BUSINESS_TYPE_OPTIONS = ["restaurant", "canteen", "shop", "other"];

export default function AdminPage() {
  const { t } = useI18n();
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBusinessType, setNewBusinessType] = useState("restaurant");
  const [newBusinessTypeCustom, setNewBusinessTypeCustom] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = subscribeShops(ADMIN_ID, setShops, (message) => {
      setStatus(message || t("updateFailed"));
    });
    return unsubscribe;
  }, [t]);

  useEffect(() => {
    if (!selectedShopId && shops.length > 0) {
      setSelectedShopId(shops[0].id);
    }
  }, [selectedShopId, shops]);

  const selectedShop = useMemo(
    () => shops.find((shop) => shop.id === selectedShopId) || null,
    [selectedShopId, shops]
  );

  const visibleMenuSections = useMemo(() => {
    if (!selectedShop) return [];
    return selectedShop.menuSections?.length > 0
      ? selectedShop.menuSections
      : defaultMenuSections(selectedShop.businessType || "restaurant");
  }, [selectedShop]);

  const visibleMenuItems = useMemo(() => {
    if (!selectedShop) return [];
    return selectedShop.menuItems?.length > 0
      ? selectedShop.menuItems
      : defaultMenuItems(selectedShop.businessType || "restaurant", visibleMenuSections);
  }, [selectedShop, visibleMenuSections]);

  const needsBusinessTypeSelection =
    isCreatingNew && selectedShop && !selectedShop.businessType;

  const handleCreateShop = async () => {
    const newShopId = createShopId();
    setStatus(t("creatingShop"));
    setIsCreatingNew(true);
    setNewBusinessType("restaurant");
    setNewBusinessTypeCustom("");
    setShops((prev) => [
      {
        id: newShopId,
        adminId: ADMIN_ID,
        businessType: "",
        businessTypeCustom: "",
        name: "",
        mobile: "",
        description: "",
        imageUrls: [],
        menuSections: [],
        menuItems: [],
        createdAt: null,
        updatedAt: null
      },
      ...prev.filter((shop) => shop.id !== newShopId)
    ]);
    setSelectedShopId(newShopId);

    try {
      const newId = await createShop(ADMIN_ID, newShopId);
      setSelectedShopId(newId);
      setToast(t("createSuccess"));
    } catch (error) {
      setShops((prev) => prev.filter((shop) => shop.id !== newShopId));
      setSelectedShopId((current) => (current === newShopId ? "" : current));
      setStatus(error?.message || t("updateFailed"));
    }
  };

  const handleSaveBusinessType = async () => {
    if (!selectedShop) return;

    if (newBusinessType === "other" && !newBusinessTypeCustom.trim()) {
      setStatus(t("businessTypeRequired"));
      return;
    }

    try {
      const sections = defaultMenuSections(newBusinessType);
      await updateShop(selectedShop.id, {
        businessType: newBusinessType,
        businessTypeCustom: newBusinessType === "other" ? newBusinessTypeCustom.trim() : "",
        menuSections: sections,
        menuItems: defaultMenuItems(newBusinessType, sections)
      });
      setStatus("");
    } catch (error) {
      setStatus(error?.message || t("updateFailed"));
    }
  };

  const handleSaveDetails = async (details, files) => {
    if (!selectedShop) return;
    setSaving(true);
    setStatus("");

    try {
      let imageUrls = selectedShop.imageUrls || [];
      let uploadWarning = "";

      if (files.length > 0) {
        try {
          const uploaded = await uploadShopImages(selectedShop.id, files);
          imageUrls = [...imageUrls, ...uploaded];
        } catch (error) {
          uploadWarning = error?.message || "Image upload failed.";
        }
      }

      await updateShop(selectedShop.id, {
        ...details,
        imageUrls
      });

      setToast(uploadWarning ? `${t("updateSuccess")} ${uploadWarning}` : t("updateSuccess"));
      setStatus(uploadWarning || "");
    } catch (error) {
      setStatus(error?.message || t("updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleMenuItemsChange = async (nextMenuItems) => {
    if (!selectedShop) return;
    try {
      await updateShop(selectedShop.id, { menuItems: nextMenuItems });
    } catch {
      setStatus(t("updateFailed"));
    }
  };

  const handleMenuSectionsChange = async (nextSections) => {
    if (!selectedShop) return;
    try {
      await updateShop(selectedShop.id, { menuSections: nextSections });
    } catch {
      setStatus(t("updateFailed"));
    }
  };

  const handleDeleteShop = async () => {
    if (!selectedShop) return;
    if (!window.confirm(t("confirmDeleteShop"))) return;

    try {
      await deleteShop(selectedShop.id);
      setToast(t("shopDeleted"));
      setSelectedShopId("");
      setIsCreatingNew(false);
    } catch (error) {
      setStatus(error?.message || t("updateFailed"));
    }
  };

  const handleSelectShop = (shopId) => {
    setSelectedShopId(shopId);
    setIsCreatingNew(false);
  };

  return (
    <div className={`admin-layout ${isCreatingNew ? "creation-mode" : ""}`}>
      {!isCreatingNew && (
        <ShopList
          shops={shops}
          selectedShopId={selectedShopId}
          onSelect={handleSelectShop}
          onCreate={handleCreateShop}
        />
      )}

      <section className="admin-main">
        {!selectedShop && <p className="muted-text">{t("selectShopHint")}</p>}

        {selectedShop && (
          <>
            {toast && <div className="toast-message">{toast}</div>}

            <div className="admin-top-actions">
              <button className="danger-btn" onClick={handleDeleteShop}>
                {t("deleteShop")}
              </button>
              {selectedShop.businessType && (
                <p className="status-pill">{businessTypeLabel(selectedShop.businessType, selectedShop.businessTypeCustom, t)}</p>
              )}
              {status && <p className="status-pill">{status}</p>}
            </div>

            {needsBusinessTypeSelection ? (
              <section className="card business-type-card">
                <h2>{t("selectBusinessType")}</h2>
                <p className="muted-text">{t("businessTypeHint")}</p>

                <div className="business-type-grid">
                  {BUSINESS_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`business-type-option ${newBusinessType === type ? "active" : ""}`}
                      onClick={() => setNewBusinessType(type)}
                    >
                      {type === "restaurant" && t("restaurantType")}
                      {type === "canteen" && t("canteenType")}
                      {type === "shop" && t("shopType")}
                      {type === "other" && t("otherType")}
                    </button>
                  ))}
                </div>

                {newBusinessType === "other" && (
                  <label>
                    <span>{t("otherType")}</span>
                    <input
                      value={newBusinessTypeCustom}
                      onChange={(e) => setNewBusinessTypeCustom(e.target.value)}
                      placeholder={t("otherTypePlaceholder")}
                    />
                  </label>
                )}

                <button type="button" className="primary-btn" onClick={handleSaveBusinessType}>
                  {t("continueToDetails")}
                </button>
              </section>
            ) : (
              <>
                <ShopForm shop={selectedShop} onSave={handleSaveDetails} saving={saving} />
                <MenuEditor
                  menuItems={visibleMenuItems}
                  menuSections={visibleMenuSections}
                  onItemsChange={handleMenuItemsChange}
                  onSectionsChange={handleMenuSectionsChange}
                />
                <QrActions shopId={selectedShop.id} />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
