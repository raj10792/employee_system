export function formatMoney(value, currency = "USD") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  try {
    const locale = currency === "INR" ? "en-IN" : "en";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en", { maximumFractionDigits: 0 })}`;
  }
}

export function statusName(status) {
  if (status === 0 || status === "0") return "active";
  if (status === 1 || status === "1") return "inactive";
  if (status === 2 || status === "2") return "terminated";
  return String(status || "active").toLowerCase();
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}
