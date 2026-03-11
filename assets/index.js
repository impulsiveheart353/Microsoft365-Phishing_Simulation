// ================= CONSTANTS =================
const MSG_UNAME = 'Enter a valid email address, phone number, or Skype name.';
const MSG_PWD   = 'Please enter the password for your Microsoft account.';

// ================= SESSION =================
function initSession() {
    if (!localStorage.getItem('step'))       localStorage.setItem('step', 'uname');
    if (!localStorage.getItem('identity'))   localStorage.setItem('identity', '');
    if (!localStorage.getItem('uname_error')) localStorage.setItem('uname_error', '');
    if (!localStorage.getItem('pwd_error'))  localStorage.setItem('pwd_error', '');
}

// ================= VALIDATION =================
function isEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function isPhone(s) {
    return /^(?:\+91[\-\s]?|91[\-\s]?|0[\-\s]?)?[6-9]\d{9}$/.test(s);
}

function isValidUname(input) {
    const v = input.trim();
    return isEmail(v) || isPhone(v);
}

// ================= UI HELPERS =================
function showSection(sectionId) {
    ['section_uname', 'section_pwd', 'section_final'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('d-none', id !== sectionId);
    });
}

// FIX 3: Query by class (.user_identity) instead of duplicate id (#user_identity)
function updateIdentityDisplay() {
    const identity = localStorage.getItem('identity') || '';
    document.querySelectorAll('.user_identity').forEach(el => {
        el.textContent = identity;
    });
}

function updateErrors() {
    const unameError = localStorage.getItem('uname_error') || '';
    const pwdError   = localStorage.getItem('pwd_error')   || '';

    const unameErrorEl = document.getElementById('error_uname');
    const pwdErrorEl   = document.getElementById('error_pwd');
    const unameInput   = document.getElementById('inp_uname');
    const pwdInput     = document.getElementById('inp_pwd');

    if (unameErrorEl) unameErrorEl.textContent = unameError;
    if (pwdErrorEl)   pwdErrorEl.textContent   = pwdError;

    // Highlight input border on error
    if (unameInput) unameInput.classList.toggle('error-inp', !!unameError);
    if (pwdInput)   pwdInput.classList.toggle('error-inp', !!pwdError);
}

// ================= HANDLERS =================
function handleNext() {
    localStorage.setItem('uname_error', '');
    const unameInput = document.getElementById('inp_uname');
    const uname = unameInput ? unameInput.value.trim() : '';

    if (!isValidUname(uname)) {
        localStorage.setItem('uname_error', MSG_UNAME);
        updateErrors();
        return;
    }

    localStorage.setItem('identity', uname);
    localStorage.setItem('step', 'pwd');
    updateIdentityDisplay();
    showSection('section_pwd');
    updateErrors();

    // Focus password field for better UX
    const pwdInput = document.getElementById('inp_pwd');
    if (pwdInput) pwdInput.focus();
}

function handleBack() {
    localStorage.setItem('pwd_error', '');
    localStorage.setItem('step', 'uname');
    showSection('section_uname');
    updateErrors();

    // Restore username field value
    const unameInput = document.getElementById('inp_uname');
    const identity = localStorage.getItem('identity') || '';
    if (unameInput && identity) unameInput.value = identity;
}

function handleSign() {
    localStorage.setItem('pwd_error', '');
    const identity = localStorage.getItem('identity') || '';
    const pwdInput = document.getElementById('inp_pwd');
    const pwd = pwdInput ? pwdInput.value : '';

    if (!isValidUname(identity)) {
        localStorage.setItem('step', 'uname');
        localStorage.setItem('uname_error', MSG_UNAME);
        showSection('section_uname');
        updateErrors();
        return;
    }

    if (!pwd) {
        localStorage.setItem('pwd_error', MSG_PWD);
        updateErrors();
        return;
    }

    localStorage.setItem('step', 'final');
    updateIdentityDisplay();
    showSection('section_final');
}

function handleFinal(shouldStaySigned) {
    // Clear session after final step
    localStorage.removeItem('step');
    localStorage.removeItem('identity');
    localStorage.removeItem('uname_error');
    localStorage.removeItem('pwd_error');

    if (shouldStaySigned) {
        alert('Signed in successfully! Staying signed in.');
    } else {
        alert('Signed in. Session will not persist.');
    }
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function () {
    initSession();

    const step = localStorage.getItem('step') || 'uname';

    // Map step names to section IDs
    const stepMap = { uname: 'section_uname', pwd: 'section_pwd', final: 'section_final' };
    showSection(stepMap[step] || 'section_uname');

    updateIdentityDisplay();
    updateErrors();

    // --- Username section ---
    const btnNext = document.getElementById('btn_next');
    if (btnNext) btnNext.addEventListener('click', e => { e.preventDefault(); handleNext(); });

    const unameForm = document.getElementById('uname_form');
    if (unameForm) unameForm.addEventListener('submit', e => { e.preventDefault(); handleNext(); });

    // --- Password section ---
    document.querySelectorAll('.back').forEach(btn => {
        btn.addEventListener('click', e => { e.preventDefault(); handleBack(); });
    });

    const btnSig = document.getElementById('btn_sig');
    if (btnSig) btnSig.addEventListener('click', e => { e.preventDefault(); handleSign(); });

    // FIX 4: was handleBack() — Enter in password field was going backwards instead of signing in
    const pwdForm = document.getElementById('pwd_form');
    if (pwdForm) pwdForm.addEventListener('submit', e => { e.preventDefault(); handleSign(); });

    // --- Final section ---
    const btnFinalYes = document.getElementById('btn_final_yes');
    if (btnFinalYes) btnFinalYes.addEventListener('click', e => { e.preventDefault(); handleFinal(true); });

    const btnFinalNo = document.getElementById('btn_final_no');
    if (btnFinalNo) btnFinalNo.addEventListener('click', e => { e.preventDefault(); handleFinal(false); });
});