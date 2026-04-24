export function categoryLabel(key, t) {
  if (key === "tiffins") return t("tiffins");
  if (key === "lunch") return t("lunch");
  return t("dinner");
}

export function groupMenuItems(menuItems = []) {
  return menuItems
    .filter((item) => item.enabled)
    .reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      { tiffins: [], lunch: [], dinner: [] }
    );
}
