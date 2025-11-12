// --- element refs ---
const ccInput     = document.getElementById("cc");
const brandLogo   = document.getElementById("brand-logo");
const brandNameEl = document.getElementById("brand-name");
const networkEl   = document.getElementById("network");
const lengthEl    = document.getElementById("length");
const checkPill   = document.getElementById("check-pill");
const statusText  = document.getElementById("status-text");

// helpers
const strip  = s => (s || "").replace(/\D+/g, "");
const group4 = digits => digits.replace(/(.{4})/g, "$1 ").trim();

// detect network + local logo path
function detectNetwork(d) {
  let name = "Other";
  let logo = "";

  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(d)) {
    name = "Visa"; logo = "./visa.png";
  } else if (/^(5[1-5]\d{14})$/.test(d) || /^(2221|2[2-6]\d{2}|27[01]\d|2720)\d{12}$/.test(d)) {
    name = "Mastercard"; logo = "./mastercard.png";
  } else if (/^(34|37)\d{13}$/.test(d)) {
    name = "American Express"; logo = "./amex.png";
  } else if (/^6011\d{12}$/.test(d) || /^65\d{14}$/.test(d) || /^64[4-9]\d{13}$/.test(d)) {
    name = "Discover"; logo = "./discover.png";
  }
  return { name, logo };
}

function updateBrandUI({ name, logo }) {
  brandNameEl.textContent = name;
  networkEl.textContent = name;

  if (logo) {
    brandLogo.src = logo;
    brandLogo.alt = `${name} logo`;
    brandLogo.style.display = "inline-block";  // <- show it
  } else {
    brandLogo.removeAttribute("src");
    brandLogo.alt = "";
    brandLogo.style.display = "none";
  }
}

// live formatting + preview
ccInput.addEventListener("input", () => {
  const cursorFromEnd = ccInput.value.length - ccInput.selectionStart;
  const digits = strip(ccInput.value);
  ccInput.value = group4(digits);
  const newPos = Math.max(ccInput.value.length - cursorFromEnd, 0);
  ccInput.setSelectionRange(newPos, newPos);

  const info = digits ? detectNetwork(digits) : { name: "—", logo: "" };
  updateBrandUI(info);
  lengthEl.textContent = digits ? digits.length : "—";

  // reset status pill while typing
  checkPill.className = "pill warn";
  checkPill.textContent = "Not run";
  statusText.textContent = "—";
});

// (optional) simple validate on submit using Luhn
document.getElementById("validator").addEventListener("submit", (e) => {
  e.preventDefault();
  const digits = strip(ccInput.value);
  if (!digits) return;

  // Luhn
  const arr = digits.split("").reverse().map(n => +n);
  let sum = 0;
  for (let i=0; i<arr.length; i++) {
    let v = arr[i];
    if (i % 2 === 1) { v *= 2; if (v > 9) v -= 9; }
    sum += v;
  }
  const valid = sum % 10 === 0;

  checkPill.className = "pill " + (valid ? "valid" : "invalid");
  checkPill.textContent = valid ? "Luhn passed" : "Luhn failed";
  statusText.textContent = valid ? "Valid (Luhn passed)" : "Invalid (Luhn failed)";
});

// clear
document.getElementById("clear").addEventListener("click", () => {
  ccInput.value = "";
  updateBrandUI({ name: "—", logo: "" });
  lengthEl.textContent = "—";
  checkPill.className = "pill warn";
  checkPill.textContent = "Not run";
  statusText.textContent = "—";
});
