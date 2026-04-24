import { createContext, useContext, useMemo, useState } from "react";

const dictionary = {
  en: {
    appTitle: "QR Food Menu Builder",
    appSubtitle: "Manage shops, menus, prices, and QR sharing",
    admin: "Admin",
    language: "Language",
    english: "English",
    telugu: "Telugu",
    yourShops: "Your Shops",
    createShop: "Create New Shop",
    creatingShop: "Creating shop...",
    createSuccess: "Shop created.",
    deleteShop: "Delete Shop",
    noShops: "No shops yet. Create one to begin.",
    shopDetails: "Shop Details",
    shopName: "Shop Name",
    mobile: "Mobile Number",
    description: "Description",
    images: "Images",
    addImages: "Upload Images",
    attachmentPreview: "Attachment Preview",
    selectedFiles: "Selected Files",
    existingImages: "Existing Images",
    noFilesSelected: "No new files selected",
    saveDetails: "Save Details",
    saving: "Saving...",
    menuSetup: "Menu Setup",
    addItem: "Add Item",
    itemName: "Item Name",
    price: "Price",
    enabled: "Enabled",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    generateQr: "Generate QR",
    downloadQr: "Download QR",
    downloadPoster: "Download Poster",
    editDetails: "Edit Details",
    shareWhatsapp: "Share on WhatsApp",
    customerMenu: "Customer Menu",
    tiffins: "Tiffins",
    lunch: "Lunch",
    dinner: "Dinner",
    noItems: "No menu items available.",
    openMenu: "Open Menu",
    viewTheMenu: "VIEW THE MENU",
    scanToOpen: "Scan to open the menu",
    printHint: "Print this poster and paste it on the wall.",
    menuUrl: "Menu URL",
    loadingMenu: "Loading menu...",
    menuLoadTimeout: "Menu loading is taking too long. Please refresh and try again.",
    shopNotFound: "Menu not found for this QR code.",
    menuLoadFailed: "Could not load this menu right now.",
    invalidMenuLink: "Invalid menu link.",
    imageUploadHint: "You can upload multiple images.",
    updateSuccess: "Updated successfully",
    updateFailed: "Something went wrong. Please try again.",
    shopDeleted: "Shop deleted.",
    confirmDeleteShop: "Are you sure you want to delete this shop?",
    selectShopHint: "Select or create a shop to manage details and menu.",
    addItemPlaceholder: "Example: Dosa"
  },
  te: {
    appTitle: "QR ఫుడ్ మెనూ బిల్డర్",
    appSubtitle: "షాపులు, మెనూ, ధరలు మరియు QR షేర్ నిర్వహణ",
    admin: "అడ్మిన్",
    language: "భాష",
    english: "ఇంగ్లీష్",
    telugu: "తెలుగు",
    yourShops: "మీ షాపులు",
    createShop: "కొత్త షాప్ సృష్టించండి",
    creatingShop: "షాప్ సృష్టిస్తోంది...",
    createSuccess: "షాప్ సృష్టించబడింది.",
    deleteShop: "షాప్ తొలగించండి",
    noShops: "ఇంకా షాపులు లేవు. ప్రారంభించడానికి ఒకటి సృష్టించండి.",
    shopDetails: "షాప్ వివరాలు",
    shopName: "షాప్ పేరు",
    mobile: "మొబైల్ నంబర్",
    description: "వివరణ",
    images: "చిత్రాలు",
    addImages: "చిత్రాలు అప్లోడ్ చేయండి",
    attachmentPreview: "అటాచ్‌మెంట్ ప్రివ్యూ",
    selectedFiles: "ఎంచుకున్న ఫైళ్లు",
    existingImages: "ఇప్పటికే ఉన్న చిత్రాలు",
    noFilesSelected: "కొత్త ఫైళ్లు ఎంచుకోలేదు",
    saveDetails: "వివరాలు సేవ్ చేయండి",
    saving: "సేవ్ అవుతోంది...",
    menuSetup: "మెనూ సెటప్",
    addItem: "ఐటమ్ జోడించండి",
    itemName: "ఐటమ్ పేరు",
    price: "ధర",
    enabled: "అందుబాటులో",
    actions: "చర్యలు",
    edit: "సవరించు",
    delete: "తొలగించు",
    generateQr: "QR సృష్టించండి",
    downloadQr: "QR డౌన్‌లోడ్",
    downloadPoster: "పోస్టర్ డౌన్‌లోడ్",
    editDetails: "వివరాలు సవరించండి",
    shareWhatsapp: "WhatsApp లో షేర్",
    customerMenu: "కస్టమర్ మెనూ",
    tiffins: "టిఫిన్స్",
    lunch: "లంచ్",
    dinner: "డిన్నర్",
    noItems: "మెనూ ఐటమ్స్ లేవు.",
    openMenu: "మెనూ ఓపెన్ చేయండి",
    viewTheMenu: "మెనూను చూడండి",
    scanToOpen: "మెనూ తెరవడానికి స్కాన్ చేయండి",
    printHint: "ఈ పోస్టర్‌ను ప్రింట్ చేసి గోడపై అతికించండి.",
    menuUrl: "మెనూ లింక్",
    loadingMenu: "మెనూ లోడ్ అవుతోంది...",
    menuLoadTimeout: "మెనూ లోడ్ కావడానికి ఎక్కువ సమయం పడుతోంది. దయచేసి రిఫ్రెష్ చేసి మళ్లీ ప్రయత్నించండి.",
    shopNotFound: "ఈ QR కోసం మెనూ కనబడలేదు.",
    menuLoadFailed: "ఈ మెనూను ఇప్పుడు లోడ్ చేయలేము.",
    invalidMenuLink: "చెల్లని మెనూ లింక్.",
    imageUploadHint: "మీరు ఒకేసారి పలు చిత్రాలు అప్లోడ్ చేయవచ్చు.",
    updateSuccess: "విజయవంతంగా అప్డేట్ అయింది",
    updateFailed: "లోపం జరిగింది. మళ్లీ ప్రయత్నించండి.",
    shopDeleted: "షాప్ తొలగించబడింది.",
    confirmDeleteShop: "ఈ షాప్ ను తొలగించాలనుకుంటున్నారా?",
    selectShopHint: "వివరాలు మరియు మెనూ నిర్వహించడానికి షాప్ ఎంచుకోండి లేదా సృష్టించండి.",
    addItemPlaceholder: "ఉదాహరణ: దోసె"
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => dictionary[lang][key] ?? key
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
}
