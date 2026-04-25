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
      {}
    );
}

export function businessTypeLabel(type, customType, t) {
  if (type === "restaurant") return t("restaurantType");
  if (type === "canteen") return t("canteenType");
  if (type === "shop") return t("shopType");
  if (type === "other") return customType?.trim() || t("otherType");
  return "-";
}
