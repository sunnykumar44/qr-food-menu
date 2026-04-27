import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  increment
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const missingEnvKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingEnvKeys.join(", ")}. Add them to your local .env file.`
  );
}

if (!IMGBB_API_KEY) {
  throw new Error("Missing VITE_IMGBB_API_KEY. Add it to your local .env file.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

function toReadableError(error, fallbackMessage) {
  const message = String(error?.message || "");
  if (message.includes("firestore.googleapis.com") || message.includes("SERVICE_DISABLED")) {
    return new Error(
      "Firestore API is disabled for this project. Enable it in Google Cloud Console, then retry."
    );
  }
  return new Error(fallbackMessage || message || "Request failed.");
}

export const ADMIN_ID = "demo-admin-001";

const RESTAURANT_SECTIONS = [
  { id: "tiffins", label: "Tiffins", enabled: true },
  { id: "lunch", label: "Lunch", enabled: true },
  { id: "dinner", label: "Dinner", enabled: true }
];

const CANTEEN_SECTIONS = [
  { id: "snacks", label: "Snacks", enabled: true },
  { id: "meals", label: "Meals", enabled: true },
  { id: "beverages", label: "Beverages", enabled: true }
];

const SHOP_SECTIONS = [
  { id: "vegetables", label: "Vegetables", enabled: true },
  { id: "grocery", label: "Grocery", enabled: true },
  { id: "daily-needs", label: "Daily Needs", enabled: true }
];

const OTHER_SECTIONS = [
  { id: "section-1", label: "Section 1", enabled: true },
  { id: "section-2", label: "Section 2", enabled: true },
  { id: "section-3", label: "Section 3", enabled: true }
];

export function defaultMenuSections(businessType = "restaurant") {
  const key = (businessType || "").toLowerCase();
  if (key === "shop") return SHOP_SECTIONS.map((section) => ({ ...section, enabled: section.enabled !== false }));
  if (key === "canteen") {
    return CANTEEN_SECTIONS.map((section) => ({ ...section, enabled: section.enabled !== false }));
  }
  if (key === "other") return OTHER_SECTIONS.map((section) => ({ ...section, enabled: section.enabled !== false }));
  return RESTAURANT_SECTIONS.map((section) => ({ ...section, enabled: section.enabled !== false }));
}

export function defaultMenuItems(businessType = "restaurant", sections = defaultMenuSections(businessType)) {
  if (!sections.length) return [];

  if (businessType === "shop") {
    return [
      { id: crypto.randomUUID(), name: "Tomato", category: sections[0].id, price: "30", enabled: true },
      { id: crypto.randomUUID(), name: "Potato", category: sections[0].id, price: "28", enabled: true },
      { id: crypto.randomUUID(), name: "Rice (1kg)", category: sections[1].id, price: "60", enabled: true },
      { id: crypto.randomUUID(), name: "Wheat Flour (1kg)", category: sections[1].id, price: "45", enabled: true },
      { id: crypto.randomUUID(), name: "Soap", category: sections[2].id, price: "35", enabled: true }
    ];
  }

  if (businessType === "canteen") {
    return [
      { id: crypto.randomUUID(), name: "Samosa", category: sections[0].id, price: "20", enabled: true },
      { id: crypto.randomUUID(), name: "Veg Meals", category: sections[1].id, price: "90", enabled: true },
      { id: crypto.randomUUID(), name: "Tea", category: sections[2].id, price: "15", enabled: true }
    ];
  }

  return [
    { id: crypto.randomUUID(), name: "Idli", category: sections[0].id, price: "40", enabled: true },
    { id: crypto.randomUUID(), name: "Dosa", category: sections[0].id, price: "60", enabled: true },
    { id: crypto.randomUUID(), name: "Veg Meals", category: sections[1]?.id || sections[0].id, price: "120", enabled: true },
    {
      id: crypto.randomUUID(),
      name: "Chicken Biryani",
      category: sections[2]?.id || sections[0].id,
      price: "180",
      enabled: true
    }
  ];
}

export function createShopId() {
  return doc(collection(db, "shops")).id;
}

export async function createShop(adminId = ADMIN_ID, shopId = createShopId()) {
  const shop = {
    adminId,
    businessType: "",
    businessTypeCustom: "",
    name: "",
    mobile: "",
    description: "",
    imageUrls: [],
    menuSections: [],
    menuItems: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, "shops", shopId), shop);
    return shopId;
  } catch (error) {
    throw toReadableError(error, "Unable to create shop.");
  }
}

export function subscribeShops(adminId, callback, onError) {
  const q = query(collection(db, "shops"), where("adminId", "==", adminId));
  return onSnapshot(
    q,
    (snapshot) => {
      const shops = snapshot.docs
        .map((entry) => ({ id: entry.id, ...entry.data() }))
        .sort((left, right) => {
          const leftTime = left.updatedAt?.seconds || left.createdAt?.seconds || 0;
          const rightTime = right.updatedAt?.seconds || right.createdAt?.seconds || 0;
          return rightTime - leftTime;
        });
      callback(shops);
    },
    (error) => {
      if (onError) {
        onError(toReadableError(error, "Unable to load shops.").message);
      }
    }
  );
}

export function subscribeShop(shopId, callback, onError) {
  return onSnapshot(
    doc(db, "shops", shopId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback({ id: snapshot.id, ...snapshot.data() });
    },
    (error) => {
      if (onError) {
        onError(toReadableError(error, "Failed to load menu.").message);
      }
    }
  );
}

export async function updateShop(shopId, patch) {
  try {
    await updateDoc(doc(db, "shops", shopId), {
      ...patch,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw toReadableError(error, "Unable to save shop changes.");
  }
}

export async function incrementShopViewCount(shopId) {
  try {
    await updateDoc(doc(db, "shops", shopId), {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error("Failed to increment view count", error);
  }
}

export async function deleteShop(shopId) {
  try {
    await deleteDoc(doc(db, "shops", shopId));
  } catch (error) {
    throw toReadableError(error, "Unable to delete shop.");
  }
}

export async function uploadShopImages(shopId, files) {
  void shopId;

  try {
    const uploads = files.map(async (file) => {
      const formData = new FormData();
      formData.append("image", file);

      const controller = new AbortController();
      const timeoutMs = 12000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      if (!response.ok) {
        throw new Error(`ImgBB upload failed with status ${response.status}`);
      }

      const payload = await response.json();
      const imageUrl = payload?.data?.url;
      if (!payload?.success || !imageUrl) {
        throw new Error(payload?.error?.message || "ImgBB upload returned an invalid response");
      }

      return imageUrl;
    });

    return Promise.all(uploads);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Image upload timed out. Please retry with a smaller image or better network.");
    }

    const msg = String(error?.message || "");
    if (msg.includes("timed out")) {
      throw new Error("Image upload timed out. Please retry with a smaller image or better network.");
    }
    if (msg.includes("ImgBB") || msg.includes("upload") || msg.includes("CORS") || msg.includes("Failed to fetch")) {
      throw new Error("Image upload failed. Check VITE_IMGBB_API_KEY and your internet connection.");
    }
    throw error;
  }
}

export async function addFeedback(shopId, data) {
  if (!db) return;
  try {
    const feedbackRef = collection(doc(db, "shops", shopId), "feedback");
    await addDoc(feedbackRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to add feedback", error);
  }
}

export function subscribeToFeedback(shopId, onUpdate) {
  if (!db || !shopId) return () => {};
  try {
    const feedbackRef = collection(doc(db, "shops", shopId), "feedback");
    const q = query(feedbackRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach((docSpan) => {
        results.push({ id: docSpan.id, ...docSpan.data() });
      });
      onUpdate(results);
    });
  } catch (error) {
    console.error("Failed to subscribe to feedback", error);
    onUpdate([]);
    return () => {};
  }
}
