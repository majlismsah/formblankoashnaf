// ========== CONFIGURATION ========== //
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzUiB3eVCJu554W4HxwjdqpsPRjBUXx6pCJCEnInCO8tpV9HF3or-zfT9FgOijmsTJ8/exec",
  ADMIN_WA: "62816787977",
  SHEET_COLUMNS: ["Timestamp", "Nama KTP", "Nama Sulthon", "No WA", "Majlis", "Foto URL", "Status"],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// ========== GLOBAL VARIABLES ========== //
let desktopCropper, mobileCropper;

// ========== DOM ELEMENTS ========== //
const elements = {
  desktop: {
    form: document.getElementById('preorderForm'),
    fileInput: document.getElementById('fileInput'),
    imagePreview: document.getElementById('imagePreview'),
    uploadSection: document.getElementById('uploadSection'),
    cropSection: document.getElementById('cropSection'),
    resultSection: document.getElementById('resultSection'),
    croppedResult: document.getElementById('croppedResult'),
    croppedImageData: document.getElementById('croppedImageData'),
    rotateLeft: document.getElementById('rotateLeft'),
    rotateRight: document.getElementById('rotateRight'),
    resetCrop: document.getElementById('resetCrop'),
    cancelCrop: document.getElementById('cancelCrop'),
    saveCrop: document.getElementById('saveCrop'),
    changePhoto: document.getElementById('changePhoto')
  },
  mobile: {
    form: document.getElementById('preorderFormMobile'),
    fileInput: document.getElementById('mobileFileInput'),
    imagePreview: document.getElementById('mobileImagePreview'),
    uploadSection: document.getElementById('mobileUploadSection'),
    cropSection: document.getElementById('mobileCropSection'),
    resultSection: document.getElementById('mobileResultSection'),
    croppedResult: document.getElementById('mobileCroppedResult'),
    croppedImageData: document.getElementById('mobileCroppedImageData'),
    rotateLeft: document.getElementById('mobileRotateLeft'),
    rotateRight: document.getElementById('mobileRotateRight'),
    resetCrop: document.getElementById('mobileResetCrop'),
    cancelCrop: document.getElementById('mobileCancelCrop'),
    saveCrop: document.getElementById('mobileSaveCrop'),
    changePhoto: document.getElementById('mobileChangePhoto')
  },
  sheet: document.getElementById('sheet'),
  sheetOverlay: document.getElementById('sheetOverlay')
};

// ========== MAIN INITIALIZATION ========== //
function init() {
  setupCroppers();
  setupFormSubmissions();
  setupPhoneNumberFormatting();
}

// ========== CROPPER FUNCTIONS ========== //
function setupCroppers() {
  initCropper('desktop');
  initCropper('mobile');
}

function initCropper(prefix) {
  const el = elements[prefix];
  
  el.fileInput.addEventListener('change', function(e) {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      showAlert('Ukuran file terlalu besar. Maksimal 5MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      el.imagePreview.src = event.target.result;
      el.uploadSection.classList.add('hidden');
      el.cropSection.classList.remove('hidden');
      
      // Initialize cropper
      if (prefix === 'desktop') {
        desktopCropper = createCropper(el.imagePreview);
      } else {
        mobileCropper = createCropper(el.imagePreview);
      }
    };
    reader.readAsDataURL(file);
  });

  // Setup cropper controls
  setupCropperControls(prefix);
}

function createCropper(imageElement) {
  return new Cropper(imageElement, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 0.8,
    responsive: true,
    guides: false
  });
}

function setupCropperControls(prefix) {
  const el = elements[prefix];
  const cropper = prefix === 'desktop' ? desktopCropper : mobileCropper;

  // Rotation controls
  el.rotateLeft.addEventListener('click', () => cropper.rotate(-90));
  el.rotateRight.addEventListener('click', () => cropper.rotate(90));
  
  // Reset control
  el.resetCrop.addEventListener('click', () => cropper.reset());
  
  // Cancel control
  el.cancelCrop.addEventListener('click', () => {
    cropper.destroy();
    el.cropSection.classList.add('hidden');
    el.uploadSection.classList.remove('hidden');
    el.fileInput.value = '';
  });
  
  // Save control
  el.saveCrop.addEventListener('click', () => {
    const croppedCanvas = cropper.getCroppedCanvas({
      width: 400,
      height: 400,
      fillColor: '#fff',
      imageSmoothingQuality: 'high'
    });
    
    const croppedImage = document.createElement('img');
    croppedImage.src = croppedCanvas.toDataURL('image/jpeg', 0.8);
    croppedImage.classList.add('cropped-preview');
    
    el.croppedResult.innerHTML = '';
    el.croppedResult.appendChild(croppedImage);
    el.croppedImageData.value = croppedCanvas.toDataURL('image/jpeg', 0.8);
    
    el.cropSection.classList.add('hidden');
    el.resultSection.classList.remove('hidden');
  });
  
  // Change photo control
  el.changePhoto.addEventListener('click', () => {
    el.resultSection.classList.add('hidden');
    el.uploadSection.classList.remove('hidden');
    el.fileInput.value = '';
  });
}

// ========== FORM HANDLING ========== //
function setupFormSubmissions() {
  setupForm('desktop', {
    nama_ktp: "nama_ktp",
    nama_sulthon: "nama_sulthon",
    no_wa: "no_wa",
    majlis: "majlis",
    fotoProfil: "croppedImageData"
  });
  
  setupForm('mobile', {
    nama_ktp: "namaKtpMobile",
    nama_sulthon: "namaSulthonMobile",
    no_wa: "waMobile",
    majlis: "majlisMobile",
    fotoProfil: "mobileCroppedImageData"
  });
}

function setupForm(prefix, fieldIds) {
  const form = elements[prefix].form;
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Mengirim...";

    try {
      const formData = getFormData(form, fieldIds);
      validateFormData(formData);
      
      const response = await submitToGAS(formData);
      handleSuccess(response, formData, prefix);
    } catch (error) {
      showAlert(`❌ ${error.message}`, 'error');
      console.error("Error:", error);
    } finally {
      resetSubmitButton(btn, prefix);
    }
  });
}

function getFormData(form, fieldIds) {
  return {
    nama_ktp: form.querySelector(`#${fieldIds.nama_ktp}`).value.trim(),
    nama_sulthon: form.querySelector(`#${fieldIds.nama_sulthon}`).value.trim(),
    no_wa: formatPhoneNumber(form.querySelector(`#${fieldIds.no_wa}`).value),
    majlis: form.querySelector(`#${fieldIds.majlis}`).value,
    fotoProfil: form.querySelector(`#${fieldIds.fotoProfil}`).value
  };
}

function validateFormData(data) {
  if (!data.nama_ktp) throw new Error("Nama KTP wajib diisi");
  if (!data.nama_sulthon) throw new Error("Nama Sulthon wajib diisi");
  if (!data.no_wa.match(/^[0-9]{10,14}$/)) throw new Error("Nomor WhatsApp tidak valid");
  if (!data.majlis) throw new Error("Majlis wajib dipilih");
  if (!data.fotoProfil) throw new Error("Foto profil wajib diupload");
}

async function submitToGAS(data) {
  const response = await fetch(CONFIG.SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error("Gagal terhubung ke server");
  return await response.json();
}

function handleSuccess(response, formData, prefix) {
  if (response.status !== "success") throw new Error(response.message);
  
  showAlert("✅ Data berhasil dikirim!", 'success');
  resetForm(prefix);
  sendWhatsAppConfirmation(formData, response.data?.fotoUrl);
}

function resetForm(prefix) {
  const el = elements[prefix];
  el.form.reset();
  el.resultSection.classList.add('hidden');
  el.uploadSection.classList.remove('hidden');
  el.fileInput.value = '';
}

function sendWhatsAppConfirmation(data, fotoUrl) {
  const message = `Halo Admin, saya sudah pre-order Buku Asnaf:\n\n` +
                 `Nama KTP: ${data.nama_ktp}\n` +
                 `Nama Sulthon: ${data.nama_sulthon}\n` +
                 `No WA: ${data.no_wa}\n` +
                 `Majlis: ${data.majlis}\n\n` +
                 `Foto: ${fotoUrl || 'Lihat di Google Drive'}`;
  
  window.open(`https://wa.me/${CONFIG.ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
}

function resetSubmitButton(btn, prefix) {
  btn.disabled = false;
  btn.textContent = prefix === 'mobile' 
    ? "Kirim & Konfirmasi via WA ke Admin" 
    : "Kirim & Konfirmasi via WA";
}

// ========== UTILITY FUNCTIONS ========== //
function setupPhoneNumberFormatting() {
  document.querySelectorAll('[name="no_wa"], [name="waMobile"]').forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 15);
    });
  });
}

function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.startsWith('0') ? '62' + cleaned.substring(1) : cleaned;
}

function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white px-4 py-2 rounded-md shadow-lg z-50`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  setTimeout(() => alert.remove(), 5000);
}

function toggleSheet(show) {
  elements.sheet.classList.toggle('hidden', !show);
  elements.sheet.classList.toggle('show', show);
  elements.sheetOverlay.classList.toggle('active', show);
  document.body.style.overflow = show ? 'hidden' : '';
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
