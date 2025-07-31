// Configuration
const CONFIG = {
  SCRIPT_URL: "PASTE_YOUR_WEB_APP_URL_HERE",
  ADMIN_WA_NUMBER: "62816787977",
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// Initialize Cropper instances
let desktopCropper, mobileCropper;

// DOM Elements
const elements = {
  // Desktop
  desktop: {
    fileInput: document.getElementById('fileInput'),
    uploadSection: document.getElementById('uploadSection'),
    cropSection: document.getElementById('cropSection'),
    resultSection: document.getElementById('resultSection'),
    imagePreview: document.getElementById('imagePreview'),
    croppedResult: document.getElementById('croppedResult'),
    croppedImageData: document.getElementById('croppedImageData'),
    form: document.getElementById('preorderForm')
  },
  // Mobile
  mobile: {
    fileInput: document.getElementById('mobileFileInput'),
    uploadSection: document.getElementById('mobileUploadSection'),
    cropSection: document.getElementById('mobileCropSection'),
    resultSection: document.getElementById('mobileResultSection'),
    imagePreview: document.getElementById('mobileImagePreview'),
    croppedResult: document.getElementById('mobileCroppedResult'),
    croppedImageData: document.getElementById('mobileCroppedImageData'),
    form: document.getElementById('preorderFormMobile')
  },
  // Common
  sheet: document.getElementById("sheet"),
  sheetOverlay: document.getElementById("sheetOverlay")
};

// Initialize the application
function init() {
  setupCroppers();
  setupFormSubmissions();
  setupPhoneNumberFormatting();
}

// Setup cropper functionality
function setupCroppers() {
  initCropper('desktop');
  initCropper('mobile');
}

function initCropper(prefix) {
  const {
    fileInput,
    uploadSection,
    cropSection,
    resultSection,
    imagePreview,
    croppedResult,
    croppedImageData
  } = elements[prefix];

  fileInput.addEventListener('change', function(e) {
    handleFileSelect(e, prefix);
  });

  // Button event listeners
  if (prefix === 'desktop') {
    document.getElementById('rotateLeft').addEventListener('click', () => desktopCropper.rotate(-90));
    document.getElementById('rotateRight').addEventListener('click', () => desktopCropper.rotate(90));
    document.getElementById('resetCrop').addEventListener('click', () => desktopCropper.reset());
    document.getElementById('cancelCrop').addEventListener('click', () => resetCropper('desktop'));
    document.getElementById('saveCrop').addEventListener('click', () => saveCroppedImage('desktop'));
    document.getElementById('changePhoto').addEventListener('click', () => changePhoto('desktop'));
  } else {
    document.getElementById('mobileRotateLeft').addEventListener('click', () => mobileCropper.rotate(-90));
    document.getElementById('mobileRotateRight').addEventListener('click', () => mobileCropper.rotate(90));
    document.getElementById('mobileResetCrop').addEventListener('click', () => mobileCropper.reset());
    document.getElementById('mobileCancelCrop').addEventListener('click', () => resetCropper('mobile'));
    document.getElementById('mobileSaveCrop').addEventListener('click', () => saveCroppedImage('mobile'));
    document.getElementById('mobileChangePhoto').addEventListener('click', () => changePhoto('mobile'));
  }
}

function handleFileSelect(e, prefix) {
  const { fileInput, uploadSection, cropSection, imagePreview } = elements[prefix];
  const files = e.target.files;
  
  if (!files || files.length === 0) return;

  const file = files[0];
  
  // Validate file
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    alert('Ukuran file terlalu besar! Maksimal 5MB.');
    return;
  }
  
  if (!file.type.match('image.*')) {
    alert('Hanya file gambar yang diperbolehkan!');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(event) {
    imagePreview.src = event.target.result;
    uploadSection.classList.add('hidden');
    cropSection.classList.remove('hidden');
    
    // Initialize cropper
    if (prefix === 'desktop') {
      if (desktopCropper) desktopCropper.destroy();
      desktopCropper = new Cropper(imagePreview, getCropperConfig());
    } else {
      if (mobileCropper) mobileCropper.destroy();
      mobileCropper = new Cropper(imagePreview, getCropperConfig());
    }
  };
  
  reader.readAsDataURL(file);
}

function getCropperConfig() {
  return {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 0.8,
    responsive: true,
    guides: false
  };
}

function resetCropper(prefix) {
  const { fileInput, uploadSection, cropSection } = elements[prefix];
  cropSection.classList.add('hidden');
  uploadSection.classList.remove('hidden');
  fileInput.value = '';
}

function saveCroppedImage(prefix) {
  const cropper = prefix === 'desktop' ? desktopCropper : mobileCropper;
  const { cropSection, resultSection, croppedResult, croppedImageData } = elements[prefix];
  
  const canvas = cropper.getCroppedCanvas({
    width: 500,
    height: 500,
    minWidth: 256,
    minHeight: 256,
    maxWidth: 2000,
    maxHeight: 2000,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    croppedResult.innerHTML = `<img src="${url}" class="cropped-preview">`;
    croppedImageData.value = canvas.toDataURL('image/jpeg');
    
    cropSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
  }, 'image/jpeg', 0.9);
}

function changePhoto(prefix) {
  const { resultSection, uploadSection, fileInput } = elements[prefix];
  resultSection.classList.add('hidden');
  uploadSection.classList.remove('hidden');
  fileInput.value = '';
}

// Form handling
function setupFormSubmissions() {
  handleFormSubmit('desktop', {
    nama: "nama",
    no_wa: "no_wa",
    majlis: "majlis",
    fotoProfil: "croppedImageData"
  });
  
  handleFormSubmit('mobile', {
    nama: "namaMobile",
    no_wa: "waMobile",
    majlis: "majlisMobile",
    fotoProfil: "mobileCroppedImageData"
  });
}

function handleFormSubmit(prefix, fieldIds) {
  const { form } = elements[prefix];
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Mengirim...";

    const formData = {
      nama: document.getElementById(fieldIds.nama).value,
      no_wa: document.getElementById(fieldIds.no_wa).value,
      majlis: document.getElementById(fieldIds.majlis).value,
      fotoProfil: document.getElementById(fieldIds.fotoProfil).value
    };

    submitFormData(formData, btn, prefix === 'mobile');
  });
}

function submitFormData(formData, btn, isMobile) {
  fetch(CONFIG.SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
  .then((res) => res.json())
  .then((data) => {
    if (data.result === "success") {
      const waMessage = `Halo Admin, saya sudah submit data pre-order Buku Asnaf.\n\nNama: ${formData.nama}\nMajlis: ${formData.majlis}\n\nMohon dicek di Google Sheet. Terima kasih.`;
      const waURL = `https://wa.me/${CONFIG.ADMIN_WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;
      window.location.href = waURL;
    } else {
      showError(btn, isMobile, data.message);
    }
  })
  .catch((err) => {
    showError(btn, isMobile, err.message);
  });
}

function showError(btn, isMobile, errorMsg) {
  alert("❌ Gagal terkirim! Error: " + (errorMsg || ''));
  btn.disabled = false;
  btn.textContent = isMobile ? "Kirim & Konfirmasi via WA ke Admin" : "Kirim & Konfirmasi via WA";
}

// Phone number formatting
function setupPhoneNumberFormatting() {
  document.querySelectorAll('input[type="tel"]').forEach((waInput) => {
    waInput.addEventListener('blur', () => {
      let val = waInput.value.trim();
      val = val.replace(/^(\+62|62|0)/, '62');
      waInput.value = val;
    });
  });
}

// Bottom sheet functionality
function toggleSheet(show) {
  const { sheet, sheetOverlay } = elements;
  
  if (show) {
    sheet.classList.remove("hidden");
    sheetOverlay.classList.add("active");
    setTimeout(() => {
      sheet.classList.add("show");
    }, 10);
  } else {
    sheet.classList.remove("show");
    sheetOverlay.classList.remove("active");
    setTimeout(() => {
      sheet.classList.add("hidden");
    }, 300);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
