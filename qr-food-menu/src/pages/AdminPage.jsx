import { useEffect, useMemo, useState } from "react";
import MenuEditor from "../components/MenuEditor";
import QrActions from "../components/QrActions";
import ShopForm from "../components/ShopForm";
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
  return (
    <div className={`admin-layout ${isCreatingNew ? "creation-mode" : ""}`}>
      <section className="admin-main">
        {deleteConfirm && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelDelete();
              }
            }}
          >
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{t("confirmDeleteShop")}</h3>
              <p className="delete-modal-shop-name">{deleteConfirm.name || "Untitled Shop"}</p>
              <p className="muted-text delete-modal-hint">{t("deleteActionCannot")}</p>
              <div className="delete-modal-actions">
                <button className="danger-btn" onClick={handleConfirmDelete} disabled={isDeleting}>
                  {isDeleting ? t("deleting") : t("yesDeletePermanently")}
                </button>
                <button className="ghost-action-btn" onClick={handleCancelDelete} disabled={isDeleting}>
                  {t("cancelDelete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRecentQR && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseRecentQR();
              }
            }}
          >
            <div className="recent-qr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="recent-qr-header">
                <h2>{t("viewRecentQR")}</h2>
                <button className="ghost-action-btn" onClick={handleCloseRecentQR}>
                  ✕
                </button>
              </div>

              {!previewShopId ? (
                <div className="recent-shops-list">
                  {shops.length === 0 && <p className="muted-text">{t("noShops")}</p>}
                  {shops.map((shop) => (
                    <button key={shop.id} className="recent-shop-item" onClick={() => setPreviewShopId(shop.id)}>
                      <div className="recent-shop-info">
                        <strong>{shop.name || "Untitled Shop"}</strong>
                        <p className="muted-text">{businessTypeLabel(shop.businessType, shop.businessTypeCustom, t)}</p>
                        <span className="muted-text">{shop.mobile || "--"}</span>
                      </div>
                      <span className="arrow">→</span>
                    </button>
                  ))}
                </div>
              ) : previewShop ? (
                <div className="recent-qr-detail">
                  <button className="ghost-action-btn back-btn" onClick={() => setPreviewShopId(null)}>
                    ← {t("back")}
                  </button>
                  <h3>{previewShop.name || "Untitled Shop"}</h3>
                  <p className="muted-text">{businessTypeLabel(previewShop.businessType, previewShop.businessTypeCustom, t)}</p>
                  {previewShop.mobile && <p>{previewShop.mobile}</p>}
                  {previewShop.description && <p>{previewShop.description}</p>}

                  {previewShop.imageUrls?.length > 0 && (
                    <div className="image-strip-preview">
                      {previewShop.imageUrls.slice(0, 3).map((url) => (
                        <img key={url} src={url} alt={previewShop.name || "shop"} />
                      ))}
                    </div>
                  )}

                  <div className="recent-qr-code-section">
                    <QrActions shopId={previewShop.id} />
                  </div>

                  <button
                    className="primary-btn edit-btn"
                    onClick={() => {
                      setShowRecentQR(false);
                      setSelectedShopId(previewShop.id);
                    }}
                  >
                    {t("editDetails")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!selectedShop && !isCreatingNew && !showRecentQR && (
          <div className="admin-welcome card">
            <div className="admin-welcome-copy">
              <h2>{t("yourShops")}</h2>
              <p className="muted-text">{t("selectShopHint")}</p>
            </div>
            <div className="admin-welcome-actions">
              <button className="primary-btn" onClick={() => setShowRecentQR(true)}>
                {t("viewRecentQR")}
              </button>
              <button className="ghost-action-btn" onClick={handleCreateShop}>
                {t("createShop")}
              </button>
            </div>
          </div>
        )}

        {selectedShop && (
          <>
            {toast && <div className="toast-message">{toast}</div>}

            <div className="admin-top-actions">
              <button className="ghost-action-btn" onClick={() => setShowRecentQR(true)}>
                {t("viewRecentQR")}
              </button>
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
  const handleDeleteShop = () => {
    if (!selectedShop) return;
    setDeleteConfirm(selectedShop);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      await deleteShop(deleteConfirm.id);
      setToast(t("shopDeleted"));
      setSelectedShopId("");
      setIsCreatingNew(false);
      setDeleteConfirm(null);
    } catch (error) {
      setStatus(error?.message || t("updateFailed"));
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const previewShop = useMemo(
    () => shops.find((shop) => shop.id === previewShopId),
    [previewShopId, shops]
  );

  const handleCloseRecentQR = () => {
    setShowRecentQR(false);
    setPreviewShopId(null);
  };

  const handleSelectShop = (shopId) => {
    setSelectedShopId(shopId);
    setIsCreatingNew(false);
  };

  return (
    <div className={`admin-layout ${isCreatingNew ? "creation-mode" : ""}`}>
      <section className="admin-main">
        {deleteConfirm && (
          <div 
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelDelete();
              }
            }}
          >
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{t("confirmDeleteShop")}</h3>
              <p className="delete-modal-shop-name">{deleteConfirm.name || "Untitled Shop"}</p>
              <p className="muted-text delete-modal-hint">{t("deleteActionCannot")}</p>
              <div className="delete-modal-actions">
                <button
                  className="danger-btn"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("deleting") : t("yesDeletePermanently")}
                </button>
                <button
                  className="ghost-action-btn"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  {t("cancelDelete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRecentQR && (
          <div 
            className="modal-backdrop"
            onClick={(e) => {
        {!selectedShop && !isCreatingNew && !showRecentQR && (
          <div className="admin-welcome card">
            <div className="admin-welcome-copy">
              <h2>{t("yourShops")}</h2>
              <p className="muted-text">{t("selectShopHint")}</p>
            </div>
            <div className="admin-welcome-actions">
              <button className="primary-btn" onClick={() => setShowRecentQR(true)}>
                {t("viewRecentQR")}
              </button>
              <button className="ghost-action-btn" onClick={handleCreateShop}>
                {t("createShop")}
              </button>
            </div>
          </div>
        )}

        {!selectedShop && isCreatingNew && !showRecentQR && (
          <div className="admin-welcome card">
            <div className="admin-welcome-copy">
              <h2>{t("yourShops")}</h2>
              <p className="muted-text">{t("selectShopHint")}</p>
            </div>
          </div>
        )}

        {!selectedShop && !showRecentQR && isCreatingNew && (
          <div className="admin-welcome card">
            <div className="admin-welcome-copy">
              <h2>{t("yourShops")}</h2>
              <p className="muted-text">{t("selectShopHint")}</p>
            </div>
          </div>
        )}

        {!selectedShop && isCreatingNew && (
          <div className="admin-home-note muted-text">{t("creatingShop")}</div>
        )}

        {!selectedShop && !isCreatingNew && showRecentQR && null}

        {!selectedShop && !isCreatingNew && (
          <div className="admin-home-note muted-text">{t("viewRecentQR")}</div>
        )}

        {selectedShop && (
          <>
            {toast && <div className="toast-message">{toast}</div>}

            <div className="admin-top-actions">
              <button className="ghost-action-btn" onClick={() => setShowRecentQR(true)}>
                {t("viewRecentQR")}
              </button>
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
              </button>
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
