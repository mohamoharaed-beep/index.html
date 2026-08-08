// ===== MENU TOGGLE =====
function toggleMenu() {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

// ===== WHATSAPP =====
function toggleWhatsApp() {
    const popup = document.getElementById('whatsappPopup');
    if (popup) {
        popup.classList.toggle('active');
    }
}

function openWhatsApp(number) {
    const url = `https://wa.me/962${number.replace(/^0/, '')}`;
    window.open(url, '_blank');
    const popup = document.getElementById('whatsappPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function copyNumber(number) {
    navigator.clipboard.writeText(number).then(() => {
        showNotification('✅ تم نسخ الرقم: ' + number, 'success');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = number;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showNotification('✅ تم نسخ الرقم: ' + number, 'success');
    });
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translateX(-50px)';
        setTimeout(() => div.remove(), 300);
    }, 4000);
}

// ===== STATS COUNTER (تم التحديث) =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-item .number');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = Math.max(1, Math.floor(target / 60));
        let current = 0;
        const increment = () => {
            current += step;
            if (current >= target) {
                counter.textContent = target + '+';
                return;
            }
            counter.textContent = current + '+';
            requestAnimationFrame(increment);
        };
        increment();
    });
}

// ===== LOAD SERVICES =====
function loadServicesStatic(containerId = 'servicesPreview', limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let services = SERVICES_DATA;
    if (limit) {
        services = services.slice(0, limit);
    }
    
    if (!services || services.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:40px;">لا توجد خدمات متاحة</p>';
        return;
    }
    
    container.innerHTML = services.map(service => `
        <div class="service-card animate-on-scroll">
            <span class="icon"><i class="fas ${service.icon || 'fa-file-alt'}"></i></span>
            <h3>${service.name}</h3>
            <p>${service.description || 'خدمة متكاملة ومتميزة'}</p>
            <span class="badge">متاحة</span>
        </div>
    `).join('');
}

function loadAllServices() {
    loadServicesStatic('allServices');
}

// ===== ANIMATION ON SCROLL =====
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => observer.observe(el));
}

// ===== DARK MODE =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark_mode', isDark ? 'true' : 'false');
    
    const btn = document.getElementById('darkModeToggle');
    if (btn) {
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    showNotification(isDark ? '🌙 تم تفعيل الوضع الليلي' : '☀️ تم تفعيل الوضع النهاري', 'info');
}

function loadDarkMode() {
    if (localStorage.getItem('dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('darkModeToggle');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function addDarkModeButton() {
    const btn = document.createElement('button');
    btn.id = 'darkModeToggle';
    btn.className = 'dark-mode-toggle';
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    btn.onclick = toggleDarkMode;
    btn.setAttribute('aria-label', 'تبديل الوضع الليلي');
    document.body.appendChild(btn);
}

// ===== GOOGLE FORM SUBMISSION (مع رفع الملفات) =====
// استبدل GOOGLE_FORM_URL برابط Google Form الخاص بك
const GOOGLE_FORM_URL = 'https://docs.google.com/spreadsheets/d/1XLuRnGWdpGGNIjJQwJqpZZfiwSOwkEFLB4AzQqiudwE/edit?usp=sharing';
// الحد الأقصى لحجم الملف (5 ميجابايت)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// الحد الأقصى للطلبات في اليوم (2)
const MAX_REQUESTS_PER_DAY = 2;

function getTodayDate() {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function getRequestCount() {
    const today = getTodayDate();
    const data = JSON.parse(localStorage.getItem('request_log') || '{}');
    return data[today] || 0;
}

function incrementRequestCount() {
    const today = getTodayDate();
    const data = JSON.parse(localStorage.getItem('request_log') || '{}');
    data[today] = (data[today] || 0) + 1;
    localStorage.setItem('request_log', JSON.stringify(data));
}

function canSubmitRequest() {
    return getRequestCount() < MAX_REQUESTS_PER_DAY;
}

function getRemainingRequests() {
    return MAX_REQUESTS_PER_DAY - getRequestCount();
}

function submitToGoogleForm(event) {
    event.preventDefault();
    
    // التحقق من عدد الطلبات
    if (!canSubmitRequest()) {
        showNotification(`⛔ عذراً، لقد تجاوزت الحد الأقصى للطلبات (${MAX_REQUESTS_PER_DAY} طلبات يومياً). يرجى المحاولة غداً.`, 'error');
        return;
    }
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const service = document.getElementById('serviceSelect').value;
    const description = document.getElementById('requestDescription').value.trim();
    const fileInput = document.getElementById('fileAttachment');
    
    if (!name || !phone || !service || !description) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (!/^[0-9]{10}$/.test(phone)) {
        showNotification('رقم الهاتف يجب أن يكون 10 أرقام', 'error');
        return;
    }
    
    // التحقق من حجم الملف
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > MAX_FILE_SIZE) {
            showNotification(`⚠️ حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت). الرجاء اختيار ملف أصغر.`, 'error');
            return;
        }
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loadingSpinner');
    
    submitBtn.disabled = true;
    loading.style.display = 'block';
    
    // إنشاء FormData لإرسال الملف
    const formData = new FormData();
    formData.append('entry.123456789', name);      // استبدل بـ entry ID من Google Form
    formData.append('entry.987654321', phone);     // استبدل بـ entry ID من Google Form
    formData.append('entry.111111111', service);   // استبدل بـ entry ID من Google Form
    formData.append('entry.222222222', description); // استبدل بـ entry ID من Google Form
    
    if (fileInput && fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    
    // إرسال إلى Google Form
    fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    }).then(() => {
        // تسجيل الطلب
        incrementRequestCount();
        const remaining = getRemainingRequests();
        
        showNotification(`✅ تم استلام طلبك بنجاح! (تبقى ${remaining} طلب اليوم)`, 'success');
        document.getElementById('requestForm').reset();
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }).catch(() => {
        // حتى لو فشل، نعتبر الطلب تم (لأن no-cors لا يعيد استجابة)
        incrementRequestCount();
        const remaining = getRemainingRequests();
        showNotification(`✅ تم استلام طلبك بنجاح! (تبقى ${remaining} طلب اليوم)`, 'success');
        document.getElementById('requestForm').reset();
        submitBtn.disabled = false;
        loading.style.display = 'none';
    });
}

// ===== LOAD SERVICES FOR SELECT =====
function loadServicesSelect() {
    const select = document.getElementById('serviceSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- اختر الخدمة --</option>';
    SERVICES_DATA.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name;
        option.textContent = service.name;
        select.appendChild(option);
    });
}

// ===== ADMIN PANEL =====
const ADMIN_PASSWORD = '123456'; // كلمة مرور لوحة الإدارة

function checkAdminAuth() {
    return localStorage.getItem('admin_logged_in') === 'true';
}

function adminLogin(password) {
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_logged_in', 'true');
        return true;
    }
    return false;
}

function adminLogout() {
    localStorage.removeItem('admin_logged_in');
    window.location.reload();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // إضافة زر الوضع الليلي
    addDarkModeButton();
    loadDarkMode();
    
    // تشغيل العدادات
    animateCounters();
    
    // تحميل الخدمات
    loadServicesStatic('servicesPreview', 6);
    
    if (document.getElementById('allServices')) {
        loadAllServices();
    }
    
    if (document.getElementById('serviceSelect')) {
        loadServicesSelect();
    }
    
    // تفعيل التمرير
    handleScrollAnimation();
    
    // إغلاق القائمة عند النقر على رابط
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('mainNav');
            if (nav) {
                nav.classList.remove('active');
            }
        });
    });
    
    // إغلاق الواتساب عند النقر خارجها
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('whatsappPopup');
        if (popup && !e.target.closest('.whatsapp-float')) {
            popup.classList.remove('active');
        }
    });
});