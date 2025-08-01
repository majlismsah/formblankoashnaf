// Configuration
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw97zCSLjUjjlcZiyUnJ_xTvS13mQdTTsGVlYhoSRe9sPCdzbh2MoG01s7AcTpmeFXR/exec",
  ADMIN_WA_NUMBER: "62816787977",
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// Initialize Cropper instances
let desktopCropper, mobileCropper;

// DOM Elements
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

function init() {
  setupCroppers();
  setupFormSubmissions();
  setupPhoneNumberFormatting();
}

// Cropper Functions
function setupCroppers() {
  initCropper('desktop');
  initCropper('mobile');
}

function initCropper(prefix) {
  const el = elements[prefix];
  
  el.fileInput.addEventListener('change', function(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > CONFIG.MAX_FILE_SIZE) {
        alert('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(event) {
        el.imagePreview.src = event.target.result;
        el.uploadSection.classList.add('hidden');
        el.cropSection.classList.remove('hidden');
        
        if (prefix === 'desktop') {
          desktopCropper = new Cropper(el.imagePreview, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
            guides: false
          });
        } else {
          mobileCropper = new Cropper(el.imagePreview, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
            guides: false
          });
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Rotate buttons
  el.rotateLeft.addEventListener('click', function() {
    if (prefix === 'desktop') {
      desktopCropper.rotate(-90);
    } else {
      mobileCropper.rotate(-90);
    }
  });

  el.rotateRight.addEventListener('click', function() {
    if (prefix === 'desktop') {
      desktopCropper.rotate(90);
    } else {
      mobileCropper.rotate(90);
    }
  });

  // Reset button
  el.resetCrop.addEventListener('click', function() {
    if (prefix === 'desktop') {
      desktopCropper.reset();
    } else {
      mobileCropper.reset();
    }
  });

  // Cancel button
  el.cancelCrop.addEventListener('click', function() {
    el.cropSection.classList.add('hidden');
    el.uploadSection.classList.remove('hidden');
    el.fileInput.value = '';
    
    if (prefix === 'desktop') {
      desktopCropper.destroy();
    } else {
      mobileCropper.destroy();
    }
  });

  // Save button
  el.saveCrop.addEventListener('click', function() {
    let croppedCanvas;
    if (prefix === 'desktop') {
      croppedCanvas = desktopCropper.getCroppedCanvas({
        width: 400,
        height: 400,
        minWidth: 256,
        minHeight: 256,
        maxWidth: 1024,
        maxHeight: 1024,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
    } else {
      croppedCanvas = mobileCropper.getCroppedCanvas({
        width: 400,
        height: 400,
        minWidth: 256,
        minHeight: 256,
        maxWidth: 1024,
        maxHeight: 1024,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
    }
    
    const croppedImage = document.createElement('img');
    croppedImage.src = croppedCanvas.toDataURL('image/jpeg', 0.9);
    croppedImage.classList.add('cropped-preview');
    
    el.croppedResult.innerHTML = '';
    el.croppedResult.appendChild(croppedImage);
    el.croppedImageData.value = croppedCanvas.toDataURL('image/jpeg', 0.9);
    
    el.cropSection.classList.add('hidden');
    el.resultSection.classList.remove('hidden');
  });

  // Change photo button
  el.changePhoto.addEventListener('click', function() {
    el.resultSection.classList.add('hidden');
    el.uploadSection.classList.remove('hidden');
    el.fileInput.value = '';
  });
}

// Form Handling
function handleFormSubmit(prefix, fieldIds) {
  const form = prefix === 'mobile' ? elements.mobile.form : elements.desktop.form;
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      nama_ktp: document.getElementById(fieldIds.nama_ktp).value,
      nama_sulthon: document.getElementById(fieldIds.nama_sulthon).value,
      no_wa: document.getElementById(fieldIds.no_wa).value,
      majlis: document.getElementById(fieldIds.majlis).value,
      fotoProfil: document.getElementById(fieldIds.fotoProfil).value
    };

    await submitFormData(formData, btn, prefix === 'mobile');
  });
}

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

async function submitFormData(formData, btn, isMobile) {
  try {
    // Validasi nomor WhatsApp
    const waNumber = formData.no_wa.replace(/[^0-9]/g, '');
    if (!waNumber.match(/^[0-9]{10,14}$/)) {
      throw new Error('Nomor WhatsApp tidak valid');
    }
    
    // Validasi foto profil
    if (!formData.fotoProfil) {
      throw new Error('Foto profil wajib diupload');
    }

    const response = await fetch(CONFIG.SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_ktp: formData.nama_ktp,
        nama_sulthon: formData.nama_sulthon,
        no_wa: formData.no_wa,
        majlis: formData.majlis,
        fotoProfil: formData.fotoProfil
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Server response:', data);
    
    if (data.status === "success") {
      const waMessage = `Halo Admin, saya sudah pre-order Buku Asnaf:\n\n` +
                       `Nama KTP: ${formData.nama_ktp}\n` +
                       `Nama Sulthon: ${formData.nama_sulthon}\n` +
                       `No WA: ${formData.no_wa}\n` +
                       `Majlis: ${formData.majlis}\n\n` +
                       `Foto bisa dilihat di: ${data.data?.fotoUrl || 'Google Drive'}`;
    
      window.open(`https://wa.me/${CONFIG.ADMIN_WA_NUMBER}?text=${encodeURIComponent(waMessage)}`, '_blank');
      
      // Reset form
      if (isMobile) {
        elements.mobile.form.reset();
        elements.mobile.resultSection.classList.add('hidden');
        elements.mobile.uploadSection.classList.remove('hidden');
      } else {
        elements.desktop.form.reset();
        elements.desktop.resultSection.classList.add('hidden');
        elements.desktop.uploadSection.classList.remove('hidden');
      }
    } else {
      throw new Error(data.message || 'Terjadi kesalahan server');
    }
  } catch (err) {
    console.error('Submission error:', err);
    showError(btn, isMobile, err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = isMobile ? "Kirim & Konfirmasi via WA ke Admin" : "Kirim & Konfirmasi via WA";
  }
}

// Helper Functions
function showError(btn, isMobile, errorMsg) {
  const errorMessage = errorMsg || 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg';
  errorDiv.textContent = `❌ ${errorMessage}`;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function setupPhoneNumberFormatting() {
  const phoneInputs = [document.getElementById('no_wa'), document.getElementById('waMobile')];
  
  phoneInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    }
  });
}

function toggleSheet(show) {
  if (show) {
    elements.sheet.classList.remove('hidden');
    elements.sheet.classList.add('show');
    elements.sheetOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    elements.sheet.classList.remove('show');
    elements.sheetOverlay.classList.remove('active');
    setTimeout(() => {
      elements.sheet.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', init);
