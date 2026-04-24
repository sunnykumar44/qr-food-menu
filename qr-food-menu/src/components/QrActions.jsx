import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useI18n } from "../i18n.jsx";

export default function QrActions({ shopId }) {
  const { t } = useI18n();
  const qrRef = useRef(null);

  if (!shopId) return null;

  const menuUrl = `${window.location.origin}/menu/${shopId}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const tempLink = document.createElement("a");
    tempLink.href = pngUrl;
    tempLink.download = `menu-qr-${shopId}.png`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, font) => {
    ctx.font = font;
    const words = String(text).split(" ");
    let line = "";

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = word;
        y += lineHeight;
      } else {
        line = testLine;
      }
    });

    if (line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }

    return y;
  };

  const drawPosterPattern = (ctx, width, height) => {
    ctx.save();
    ctx.fillStyle = "rgba(15, 118, 110, 0.03)";
    ctx.fillRect(0, 170, width, height - 170);
    ctx.restore();
  };

  const downloadPoster = () => {
    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (!qrCanvas) return;

    const posterCanvas = document.createElement("canvas");
    posterCanvas.width = 1200;
    posterCanvas.height = 1600;
    const ctx = posterCanvas.getContext("2d");
    if (!ctx) return;

    const width = posterCanvas.width;
    const qrSize = 540;
    const qrX = Math.round((width - qrSize) / 2);
    const qrY = 380;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, posterCanvas.height);

    drawPosterPattern(ctx, width, posterCanvas.height);

    ctx.fillStyle = "#0f766e";
    ctx.fillRect(0, 0, width, 170);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "700 64px Arial, sans-serif";
    ctx.fillText(t("viewTheMenu"), width / 2, 42);

    ctx.font = "500 28px Arial, sans-serif";
    ctx.fillText(t("scanToOpen"), width / 2, 110);

    ctx.fillStyle = "#111827";
    ctx.font = "700 52px Arial, sans-serif";
    ctx.fillText(document.title || t("appTitle"), width / 2, 220);

    ctx.font = "500 28px Arial, sans-serif";
    ctx.fillStyle = "#4b5563";
    ctx.fillText(t("menuUrl"), width / 2, 295);

    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = "#111827";
    ctx.font = "700 34px Arial, sans-serif";
    ctx.fillText(t("openMenu"), width / 2, 980);

    ctx.fillStyle = "#374151";
    ctx.font = "400 24px Arial, sans-serif";
    drawWrappedText(
      ctx,
      menuUrl,
      120,
      1040,
      width - 240,
      34,
      "400 24px Arial, sans-serif"
    );

    ctx.fillStyle = "#6b7280";
    ctx.font = "400 24px Arial, sans-serif";
    ctx.fillText(t("printHint"), width / 2, 1430);

    const pngUrl = posterCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const tempLink = document.createElement("a");
    tempLink.href = pngUrl;
    tempLink.download = `menu-poster-${shopId}.png`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  const scrollToEdit = () => {
    document.querySelector(".shop-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${t("openMenu")}: ${menuUrl}`)}`;

  return (
    <section className="card">
      <h2>{t("generateQr")}</h2>

      <p className="muted-text">
        <strong>{t("menuUrl")}: </strong>
        <a href={menuUrl} target="_blank" rel="noreferrer">
          {menuUrl}
        </a>
      </p>

      <div className="qr-panel" ref={qrRef}>
        <div className="qr-preview-head">
          <p className="qr-kicker">{t("viewTheMenu")}</p>
          <h3>{t("scanToOpen")}</h3>
        </div>
        <QRCodeCanvas value={menuUrl} size={220} includeMargin />
      </div>

      <div className="qr-actions">
        <button className="primary-btn" onClick={downloadQR}>
          {t("downloadQr")}
        </button>
        <button className="primary-btn secondary-btn" onClick={downloadPoster}>
          {t("downloadPoster")}
        </button>
        <button className="ghost-action-btn" onClick={scrollToEdit}>
          {t("editDetails")}
        </button>
        <a className="whatsapp-btn" href={whatsappUrl} target="_blank" rel="noreferrer">
          {t("shareWhatsapp")}
        </a>
      </div>
    </section>
  );
}
