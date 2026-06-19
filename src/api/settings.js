import api from "./client";

export async function fetchSettings() {
  const response = await api.get("/api/settings");
  return mapSettingsFromApi(response.data?.data || {});
}

export async function updateSetting(key, value) {
  const response = await api.patch(`/api/settings/${key}`, { value });
  return response.data?.data || {};
}

export async function bulkUpdateSettings(data) {
  const payload = mapSettingsToApi(data);
  const response = await api.put("/api/settings/bulk", payload);
  return mapSettingsFromApi(response.data?.data || {});
}

const DEFAULTS = {
  businessInfo: {
    businessName: "RetailPro Store",
    email: "info@retailpro.com",
    phone: "+20 100 123 4567",
    address: "123 Main Street, Cairo, Egypt",
  },
  taxCurrency: {
    currency: "USD",
    taxRate: "14",
    taxRegistrationNumber: "TAX123456789",
  },
  notifications: {
    lowStockAlerts: false,
    dailySalesReport: false,
    newSalesNotifications: true,
  },
  language: {
    code: "en",
    label: "English",
    dir: "ltr",
  },
};

export function mapSettingsFromApi(apiData) {
  return {
    businessInfo: {
      businessName: apiData.businessName || DEFAULTS.businessInfo.businessName,
      email: apiData.email || DEFAULTS.businessInfo.email,
      phone: apiData.phone || DEFAULTS.businessInfo.phone,
      address: apiData.address || DEFAULTS.businessInfo.address,
    },
    taxCurrency: {
      currency: apiData.currency || DEFAULTS.taxCurrency.currency,
      taxRate: apiData.taxRate ?? DEFAULTS.taxCurrency.taxRate,
      taxRegistrationNumber:
        apiData.taxRegistrationNumber || DEFAULTS.taxCurrency.taxRegistrationNumber,
    },
    notifications: {
      lowStockAlerts: apiData.lowStockAlerts ?? DEFAULTS.notifications.lowStockAlerts,
      dailySalesReport: apiData.dailySalesReport ?? DEFAULTS.notifications.dailySalesReport,
      newSalesNotifications:
        apiData.newSalesNotifications ?? DEFAULTS.notifications.newSalesNotifications,
    },
    language: {
      code: apiData.languageCode || DEFAULTS.language.code,
      label: apiData.languageLabel || DEFAULTS.language.label,
      dir: apiData.languageDir || DEFAULTS.language.dir,
    },
  };
}

export function mapSettingsToApi(settings) {
  const entries = [];
  const b = settings.businessInfo || {};
  entries.push({ key: "businessName", value: b.businessName || "" });
  entries.push({ key: "email", value: b.email || "" });
  entries.push({ key: "phone", value: b.phone || "" });
  entries.push({ key: "address", value: b.address || "" });

  const t = settings.taxCurrency || {};
  entries.push({ key: "currency", value: t.currency || "USD" });
  entries.push({ key: "taxRate", value: t.taxRate ?? "14" });
  entries.push({ key: "taxRegistrationNumber", value: t.taxRegistrationNumber || "" });

  const n = settings.notifications || {};
  entries.push({ key: "lowStockAlerts", value: !!n.lowStockAlerts });
  entries.push({ key: "dailySalesReport", value: !!n.dailySalesReport });
  entries.push({ key: "newSalesNotifications", value: !!n.newSalesNotifications });

  const l = settings.language || {};
  entries.push({ key: "languageCode", value: l.code || "en" });
  entries.push({ key: "languageLabel", value: l.label || "English" });
  entries.push({ key: "languageDir", value: l.dir || "ltr" });

  return entries;
}
