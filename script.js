// Configuration
const CONFIG = {
  SCRIPT_URL: "PASTE_YOUR_WEB_APP_URL_HERE",
  ADMIN_WA_NUMBER: "62816787977",
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// Initialize Cropper instances
let desktopCropper, mobileCropper;

// [Bagian 1: DOM Elements & Initialization - tetap sama]
const elements = {
  // ... (kode sebelumnya tetap sama)
};

function init() {
  setupCroppers();
  setupFormSubmissions();
  setupPhoneNumberFormatting();
}

// [Bagian 2: Cropper Functions - tetap sama]
function setupCroppers() {
  // ... (kode sebelumnya tetap sama)
}

function initCropper(prefix) {
  // ... (kode sebelumnya tetap sama)
}

// [Bagian 3: Form Handling - diupdate]
function setupFormSubmissions() {
  handleFormSubmit('desktop', {
    nama_ktp: "nama_ktp",
    nama_sulthon: "nama_sulthon",
    no_wa: "no_wa",
    majlis: "majlis",
    fotoProfil: "croppedImageData"
  });
  
  handleFormSubmit('mobile', {
    nama_ktp: "namaKtpMobile",
    nama_sulthon: "namaSulthonMobile",
    no_wa: "waMobile",
    majlis: "majlisMobile",
    fotoProfil: "mobileCroppedImageData"
  });
}

function handleFormSubmit(prefix, fieldIds) {
  const { form } = elements[prefix];
  
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Mengirim...";

    const formData = {
      nama_ktp: document.getElementById(fieldIds.nama_ktp).value,
      nama_sulthon: document.getElementById(fieldIds.nama_sulthon).value,
      no_wa: document.getElementById(fieldIds.no_wa).value,
      majlis: document.getElementById(fieldIds.majlis).value,
      fotoProfil: document.getElementById(fieldIds.fotoProfil).value
    };

    // Panggil fungsi yang sudah diperbaiki
    await submitFormData(formData, btn, prefix === 'mobile');
  });
}

// [Bagian 4: Submit Function - tambahkan ini]
async function submitFormData(formData, btn, isMobile) {
  try {
    const response = await fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Server response:', data);
    
    if (data.result === "success") {
      const waMessage = `Halo Admin, saya sudah submit data pre-order Buku Asnaf.\n\nNama KTP: ${formData.nama_ktp}\nNama Sulthon: ${formData.nama_sulthon}\nNo WA: ${formData.no_wa}\nMajlis: ${formData.majlis}\n\nMohon dicek di Google Sheet. Terima kasih.`;
      const waURL = `https://wa.me/${CONFIG.ADMIN_WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.location.href = waURL;
    } else {
      throw new Error(data.message || 'Terjadi kesalahan server');
    }
  } catch (err) {
    console.error('Submission error:', err);
    showError(btn, isMobile, err.message);
    
    if (err.response) {
      err.response.text().then(text => console.error('Error details:', text));
    }
  }
}

// [Bagian 5: Helper Functions - tetap sama]
function showError(btn, isMobile, errorMsg) {
  alert("❌ Gagal terkirim! Error: " + (errorMsg || ''));
  btn.disabled = false;
  btn.textContent = isMobile ? "Kirim & Konfirmasi via WA ke Admin" : "Kirim & Konfirmasi via WA";
}

function setupPhoneNumberFormatting() {
  // ... (kode sebelumnya tetap sama)
}

function toggleSheet(show) {
  // ... (kode sebelumnya tetap sama)
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
