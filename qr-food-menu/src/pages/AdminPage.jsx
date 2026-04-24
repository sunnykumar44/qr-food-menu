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
  subscribeShops,
  updateShop,
  uploadShopImages
} from "../firebase";
import { useI18n } from "../i18n.jsx";

export default function AdminPage() {
  const { t } = useI18n();
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

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

  const handleCreateShop = async () => {
    const newShopId = createShopId();
    setStatus(t("creatingShop"));
    setShops((prev) => [
      {
        id: newShopId,
        adminId: ADMIN_ID,
        name: "",
        mobile: "",
        description: "",
        imageUrls: [],
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
      setStatus(t("createSuccess"));
    } catch (error) {
      setShops((prev) => prev.filter((shop) => shop.id !== newShopId));
      setSelectedShopId((current) => (current === newShopId ? "" : current));
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

      setStatus(uploadWarning ? `${t("updateSuccess")} ${uploadWarning}` : t("updateSuccess"));
    } catch (error) {
      setStatus(error?.message || t("updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleMenuChange = async (nextMenuItems) => {
    if (!selectedShop) return;
    try {
      await updateShop(selectedShop.id, { menuItems: nextMenuItems });
    } catch {
      setStatus(t("updateFailed"));
    }
  };

  const handleDeleteShop = async () => {
    if (!selectedShop) return;
    if (!window.confirm(t("confirmDeleteShop"))) return;

    try {
      await deleteShop(selectedShop.id);
      setStatus(t("shopDeleted"));
      setSelectedShopId("");
    } catch (error) {
      setStatus(error?.message || t("updateFailed"));
    }
  };

  return (
    <div className="admin-layout">
      <ShopList
        shops={shops}
        selectedShopId={selectedShopId}
        onSelect={setSelectedShopId}
        onCreate={handleCreateShop}
      />

      <section className="admin-main">
        {!selectedShop && <p className="muted-text">{t("selectShopHint")}</p>}

        {selectedShop && (
          <>
            <div className="admin-top-actions">
              <button className="danger-btn" onClick={handleDeleteShop}>
                {t("deleteShop")}
              </button>
              {status && <p className="status-pill">{status}</p>}
            </div>

            <ShopForm shop={selectedShop} onSave={handleSaveDetails} saving={saving} />
            <MenuEditor menuItems={selectedShop.menuItems || []} onChange={handleMenuChange} />
            <QrActions shopId={selectedShop.id} />
          </>
        )}
      </section>
    </div>
  );
}
