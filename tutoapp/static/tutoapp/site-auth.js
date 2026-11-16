import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, browserLocalPersistence, browserSessionPersistence, setPersistence, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const firebaseConfig = { projectId: 'owcus-24e46', appId: '1:585892351412:web:bbc439d0320c8bac7676e1', apiKey: 'AIzaSyCaYcZd17Cx6tsCjJoEATiZVhIqgORwU3g', authDomain: 'owcus-24e46.firebaseapp.com', storageBucket: 'owcus-24e46.firebasestorage.app', messagingSenderId: '585892351412' };
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
// Configure persistence before the header listener or any sign-in operation.
// If durable browser storage is unavailable, keep the session usable for the
// current tab and surface the storage limitation instead of claiming that the
// Google account was never signed in.
const authReady = setPersistence(auth, browserLocalPersistence)
  .catch(() => setPersistence(auth, browserSessionPersistence));
const ensurePersistence = () => authReady;
let authUser = null;
let authMode = 'signin';
let otpChallenge = null;
let otpPurpose = null;
let otpEmail = '';
let otpName = '';
const escapeHtml = value => String(value ?? '').replace(/[&<>'\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

const modalMarkup = `<div class="auth-backdrop" data-site-auth-modal hidden><section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="site-auth-title"><button class="auth-close" type="button" data-auth-close aria-label="Close sign in dialog">×</button><div class="auth-kicker">OWCUS ACCOUNT</div><h2 id="site-auth-title">Welcome back</h2><p class="auth-subtitle">Save your learning progress, practice results and resume work in one place.</p><div class="auth-tabs" role="tablist"><button type="button" data-auth-tab="signin" class="active">Sign in</button><button type="button" data-auth-tab="signup">Sign up</button></div><div data-auth-form><button class="google-auth-button" type="button" data-google-auth><span class="google-g">G</span> Continue with Google</button><div class="auth-divider"><span>or use your email</span></div><label class="auth-label" data-auth-name-field>Your name</label><input class="auth-input" type="text" placeholder="Your name" autocomplete="name" data-auth-name-input><label class="auth-label">Email address</label><input class="auth-input" type="email" placeholder="you@example.com" autocomplete="email" data-auth-email-input><label class="auth-label" data-auth-password-label>Password</label><input class="auth-input" type="password" placeholder="At least 6 characters" autocomplete="current-password" data-auth-password-input><label class="auth-label" data-auth-confirm-label>Confirm password</label><input class="auth-input" type="password" placeholder="Repeat your password" autocomplete="new-password" data-auth-confirm-input><button class="auth-submit-button" type="button" data-email-auth>Sign in with email</button><p class="auth-message" data-auth-message role="status"></p></div></section></div>`;

function ensureModal() {
  let modal = document.querySelector('[data-site-auth-modal]');
  if (modal && !modal.querySelector('[data-auth-password-input]')) { modal.remove(); modal = null; }
  if (!modal) { document.body.insertAdjacentHTML('beforeend', modalMarkup); modal = document.querySelector('[data-site-auth-modal]'); }
  // The homepage has legacy landing styles that define the same auth class.
  // Keep the shared Firebase modal above sticky headers on every page.
  if (modal) modal.style.zIndex = '1200';
  if (modal && !modal.querySelector('[data-password-reset]')) {
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'auth-forgot';
    reset.dataset.passwordReset = '';
    reset.textContent = 'Forgot password?';
    reset.style.cssText = 'display:block;margin:8px 0 0 auto;border:0;background:transparent;color:#e67534;font:600 12px system-ui;cursor:pointer;padding:0;';
    modal.querySelector('[data-auth-password-input]').insertAdjacentElement('afterend', reset);
  }
  const googleButton = modal?.querySelector('[data-google-auth]');
  googleButton?.remove();
  modal?.querySelector('.auth-divider')?.remove();
  return modal;
}

function showToast(text, error = false) {
  let toast = document.querySelector('[data-site-auth-toast]');
  if (!toast) { toast = document.createElement('div'); toast.className = 'site-auth-toast'; toast.dataset.siteAuthToast = ''; toast.setAttribute('role', 'status'); document.body.append(toast); }
  toast.textContent = text; toast.classList.toggle('error', error); toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3600);
}

function sessionGet(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } }
function sessionSet(key, value) { try { sessionStorage.setItem(key, value); } catch (_) {} }
function sessionRemove(key) { try { sessionStorage.removeItem(key); } catch (_) {} }

function initCookieConsent() {
  let accepted = false;
  try { accepted = localStorage.getItem('owcusCookieConsent') === 'accepted'; } catch (_) { accepted = false; }
  if (accepted) return;
  if (document.querySelector('[data-owcus-cookie-consent]')) return;
  const banner = document.createElement('aside');
  banner.dataset.owcusCookieConsent = '';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = '<div><strong>Allow browser storage for the best OWCUS experience</strong><p>Essential browser storage keeps your sign-in state and preferences available after a refresh. You can change this in your browser settings.</p></div><button type="button" data-cookie-accept>Allow</button>';
  banner.style.cssText = 'position:fixed;left:18px;right:18px;bottom:18px;z-index:1100;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding:16px 18px;border:1px solid #dbe4e7;border-radius:16px;background:#fff;color:#183d61;box-shadow:0 16px 40px rgba(17,37,56,.2);font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;';
  const text = banner.querySelector('div');
  text.style.flex = '1';
  banner.querySelector('strong').style.display = 'block';
  banner.querySelector('p').style.cssText = 'margin:4px 0 0;color:#6f8291;font-size:12px;';
  const accept = banner.querySelector('[data-cookie-accept]');
  accept.style.cssText = 'flex:none;border:0;border-radius:999px;padding:11px 16px;background:#e67534;color:#fff;font:700 12px system-ui;cursor:pointer;';
  accept.onclick = () => { try { localStorage.setItem('owcusCookieConsent', 'accepted'); } catch (_) {} banner.remove(); };
  document.body.append(banner);
}

function errorText(error) {
  const messages = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/unauthorized-domain': `This website host (${location.hostname}) is not authorized for Google sign-in.`,
    origin_mismatch: `This website origin (${location.origin}) is not authorized in the Google OAuth client.`,
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was closed. Please try again.',
    'auth/cancelled-popup-request': 'Another Google sign-in window is already open.',
    'auth/network-request-failed': 'Unable to connect to Google/Firebase. Please check your internet connection.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.'
  };
  return messages[error?.code] || 'Authentication could not be completed. Please try again.';
}

function renderSignedOut(container) {
  container.classList.remove('is-authenticated');
  container.innerHTML = '<button class="site-auth-login" type="button" data-auth-open="signin">Login</button><button class="site-auth-signup" type="button" data-auth-open="signup">Sign Up</button>';
}

function renderSignedIn(container, user) {
  const name = user.displayName || user.email?.split('@')[0] || 'OWCUS member';
  const email = user.email || 'Email unavailable';
  const safeName = escapeHtml(name); const safeEmail = escapeHtml(email); const photo = user.photoURL ? `<img src="${escapeHtml(user.photoURL)}" alt="${safeName}'s profile picture" referrerpolicy="no-referrer">` : `<span>${escapeHtml(name.slice(0, 1).toUpperCase())}</span>`;
  container.classList.add('is-authenticated');
  container.innerHTML = `<div class="site-profile"><button class="site-profile-button" type="button" data-profile-toggle aria-expanded="false"><span class="site-profile-avatar">${photo}</span><span class="site-profile-copy"><strong>${safeName}</strong><small>Signed in</small></span><span class="site-profile-arrow">⌄</span></button><div class="site-profile-menu" data-profile-menu hidden><div class="site-profile-email"><strong>${safeName}</strong><span>${safeEmail}</span></div><a href="/dashboard/">My Profile</a><a href="/dashboard/">My Dashboard</a><a href="/resume-builder/">My Resumes</a><a href="/dashboard/#settings">Account Settings</a><button type="button" data-site-signout><span aria-hidden="true">↪</span> Sign Out</button></div></div>`;
  const toggle = container.querySelector('[data-profile-toggle]');
  const menu = container.querySelector('[data-profile-menu]');
  toggle.onclick = event => { event.stopPropagation(); const open = !menu.hidden; menu.hidden = open; toggle.setAttribute('aria-expanded', String(!open)); };
  container.querySelector('[data-site-signout]').onclick = handleSignOut;
}

function renderAuth(user) {
  authUser = user || null;
  document.querySelectorAll('[data-site-auth]').forEach(container => { container.removeAttribute('data-auth-loading'); if (user) renderSignedIn(container, user); else renderSignedOut(container); });
  document.body.classList.toggle('auth-signed-in', Boolean(user));
  document.body.dataset.authReady = 'true';
  if (document.body.dataset.authProtected === 'true' && !user) window.location.replace('/?auth=required');
}

function setMode(next) {
  authMode = next;
  const modal = ensureModal();
  modal.querySelector('#site-auth-title').textContent = next === 'signup' ? 'Create your free account' : 'Welcome back';
  modal.querySelectorAll('[data-auth-tab]').forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === next));
  modal.querySelector('[data-auth-name-field]').hidden = next !== 'signup';
  modal.querySelector('[data-auth-name-input]').hidden = next !== 'signup';
  modal.querySelector('[data-auth-confirm-label]').hidden = true;
  modal.querySelector('[data-auth-confirm-input]').hidden = true;
  modal.querySelector('[data-auth-password-label]').hidden = next === 'signup';
  modal.querySelector('[data-auth-password-input]').hidden = next === 'signup';
  modal.querySelector('[data-password-reset]').hidden = next !== 'signin';
  modal.querySelector('[data-auth-password-input]').autocomplete = next === 'signup' ? 'new-password' : 'current-password';
  modal.querySelector('[data-email-auth]').textContent = next === 'signup' ? 'Send verification email' : 'Sign in with email';
  modal.querySelector('[data-auth-message]').textContent = '';
}

function openAuth(next = 'signin') { const modal = ensureModal(); modal.hidden = false; sessionSet('owcusAuthReturn', location.pathname + location.search); setMode(next); }
function closeAuth() { const modal = ensureModal(); modal.hidden = true; }

function csrfToken() { return document.cookie.split('; ').find(item => item.startsWith('csrftoken='))?.split('=').slice(1).join('=') || ''; }
async function postAuthApi(path, payload) {
  if (!csrfToken()) await fetch('/', { credentials: 'same-origin' });
  const response = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': decodeURIComponent(csrfToken()) }, body: JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) { const error = new Error(data.error || 'Authentication request failed.'); error.status = response.status; throw error; }
  return data;
}

function renderOtpStep() {
  const form = ensureModal().querySelector('[data-auth-form]');
  form.innerHTML = `<p class="auth-step-note">We sent a 6-digit verification code to <strong>${escapeHtml(otpEmail)}</strong>. It expires in 5 minutes.</p><label class="auth-label">Verification code</label><input class="auth-input" inputmode="numeric" maxlength="6" autocomplete="one-time-code" data-otp-code placeholder="000000"><button class="auth-submit-button" type="button" data-otp-verify>Verify email</button><button class="auth-forgot" type="button" data-otp-resend>Resend code</button><p class="auth-message" data-auth-message role="status"></p>`;
  form.querySelector('[data-otp-verify]').onclick = async () => {
    const message = form.querySelector('[data-auth-message]');
    try { await postAuthApi('/api/auth/otp/verify/', { challenge_id: otpChallenge, code: form.querySelector('[data-otp-code]').value }); renderPasswordStep(); }
    catch (error) { message.textContent = error.message; }
  };
  form.querySelector('[data-otp-resend]').onclick = async event => {
    const message = form.querySelector('[data-auth-message]'); event.currentTarget.disabled = true;
    try { await postAuthApi('/api/auth/otp/start/', { email: otpEmail, full_name: otpName, purpose: otpPurpose }); message.textContent = 'A new code was sent. Please wait 60 seconds before resending.'; }
    catch (error) { message.textContent = error.message; }
    window.setTimeout(() => { event.currentTarget.disabled = false; }, 60000);
  };
}

function renderVerificationSent() {
  const form = ensureModal().querySelector('[data-auth-form]');
  form.innerHTML = `<p class="auth-step-note">We sent a secure verification link to <strong>${escapeHtml(otpEmail)}</strong>. Open the link in your email to verify your address and create your password.</p><button class="auth-forgot" type="button" data-otp-resend>Resend verification email</button><p class="auth-message" data-auth-message role="status"></p>`;
  form.querySelector('[data-otp-resend]').onclick = async event => {
    const message = form.querySelector('[data-auth-message]'); event.currentTarget.disabled = true;
    try { await postAuthApi('/api/auth/otp/start/', { email: otpEmail, full_name: otpName, purpose: otpPurpose }); message.textContent = 'If eligible, a new verification email was sent.'; }
    catch (error) { message.textContent = error.message; }
    window.setTimeout(() => { event.currentTarget.disabled = false; }, 60000);
  };
}

function renderPasswordStep() {
  const form = ensureModal().querySelector('[data-auth-form]');
  form.innerHTML = `<p class="auth-step-note">Email verified. Create a secure password for your OWCUS account.</p><label class="auth-label">New password</label><input class="auth-input" type="password" autocomplete="new-password" data-otp-password placeholder="At least 8 characters"><label class="auth-label">Confirm password</label><input class="auth-input" type="password" autocomplete="new-password" data-otp-confirm placeholder="Repeat your password"><button class="auth-submit-button" type="button" data-otp-complete>Save password</button><p class="auth-message" data-auth-message role="status"></p>`;
  form.querySelector('[data-otp-complete]').onclick = async () => {
    const message = form.querySelector('[data-auth-message]'); const password = form.querySelector('[data-otp-password]').value; const confirm = form.querySelector('[data-otp-confirm]').value;
    if (password.length < 8) { message.textContent = 'Password must be at least 8 characters.'; return; }
    try { const result = await postAuthApi('/api/auth/otp/complete/', { challenge_id: otpChallenge, password, confirm_password: confirm }); renderAuth(result.user); closeAuth(); showToast(otpPurpose === 'registration' ? 'Account created successfully.' : 'Password reset successful.'); goAfterAuth(); }
    catch (error) { message.textContent = error.message; }
  };
}

async function startOtpFlow(purpose, email, name = '') {
  const message = ensureModal().querySelector('[data-auth-message]');
  try { const result = await postAuthApi('/api/auth/otp/start/', { email, full_name: name, purpose }); otpChallenge = result.challenge_id; otpPurpose = purpose; otpEmail = email; otpName = name; if (!otpChallenge) { message.textContent = result.message; return; } renderVerificationSent(); }
  catch (error) { message.textContent = error.message; }
}

async function consumeVerificationLink() {
  const params = new URLSearchParams(location.search); const challengeId = params.get('verify'); const token = params.get('token');
  if (!challengeId || !token) return;
  try {
    const result = await postAuthApi('/api/auth/otp/verify-link/', { challenge_id: challengeId, token });
    otpChallenge = result.challenge_id; otpPurpose = result.purpose; otpEmail = result.email; otpName = result.name || '';
    openAuth('signup'); renderPasswordStep();
    window.history.replaceState({}, document.title, location.pathname);
  } catch (error) { showToast(error.message, true); }
}

function goAfterAuth() {
  const destination = sessionGet('owcusAuthReturn') || '/dashboard/';
  sessionRemove('owcusAuthReturn');
  window.location.assign(destination);
}

async function handlePasswordReset() {
  const modal = ensureModal();
  const email = modal.querySelector('[data-auth-email-input]').value.trim();
  if (!email) { modal.querySelector('[data-auth-message]').textContent = 'Enter your email address first.'; return; }
  await startOtpFlow('password_reset', email);
}

async function handleEmail() {
  const modal = ensureModal();
  const message = modal.querySelector('[data-auth-message]');
  const email = modal.querySelector('[data-auth-email-input]').value.trim();
  const name = modal.querySelector('[data-auth-name-input]').value.trim();
  const password = modal.querySelector('[data-auth-password-input]').value;
  const confirm = modal.querySelector('[data-auth-confirm-input]').value;
  if (authMode === 'signup') { if (!email) { message.textContent = 'Enter your email address.'; return; } await startOtpFlow('registration', email, name); return; }
  if (!email || !password) { message.textContent = 'Enter your email and password.'; return; }
  try {
    await ensurePersistence();
    try {
      const session = await postAuthApi('/api/auth/login/', { email, password });
      renderAuth(session.user); closeAuth(); showToast(`Welcome back, ${session.user.name || session.user.email}.`); goAfterAuth(); return;
    } catch (djangoError) {
      if (djangoError.status !== 401) { message.textContent = djangoError.message; return; }
    }
    let result;
    if (authMode === 'signup') {
      result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, { displayName: name });
      await sendEmailVerification(result.user, { url: `${location.origin}${location.pathname}`, handleCodeInApp: false });
      await signOut(auth);
      message.textContent = 'Account created. Check your email and click the verification link before signing in.';
      return;
    }
    result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user, { url: `${location.origin}${location.pathname}`, handleCodeInApp: false });
      await signOut(auth);
      message.textContent = 'Please verify your email first. We sent you a new verification link.';
      return;
    }
    renderAuth(result.user); closeAuth(); showToast(`Welcome back, ${result.user.displayName || result.user.email}.`); goAfterAuth();
  } catch (error) { message.textContent = errorText(error); }
}

async function handleSignOut() {
  try { await postAuthApi('/api/auth/logout/', {}); await signOut(auth); try { Object.keys(localStorage).filter(key => key.toLowerCase().startsWith('owcus')).forEach(key => localStorage.removeItem(key)); } catch (_) {} try { Object.keys(sessionStorage).filter(key => key.toLowerCase().startsWith('owcus')).forEach(key => sessionStorage.removeItem(key)); } catch (_) {} sessionSet('owcusSignedOutMessage', 'You have successfully signed out.'); window.location.assign('/?signedout=1'); }
  catch (error) { showToast(`Sign out failed: ${errorText(error)}`, true); }
}

function init() {
  initCookieConsent();
  if (!document.querySelector('link[href*="site-nav.css"]')) { const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = '/static/tutoapp/site-nav.css?v=20261115-4'; document.head.append(style); }
  if (!document.querySelector('[data-site-auth]')) {
    const host = document.querySelector('header .header-right') || document.querySelector('header') || document.querySelector('.top');
    if (host) { const container = document.createElement('div'); container.className = 'site-auth-actions'; container.dataset.siteAuth = ''; host.append(container); }
  }
  const modal = ensureModal();
  document.addEventListener('click', event => { document.querySelectorAll('[data-profile-menu]').forEach(menu => { if (!menu.parentElement.contains(event.target)) menu.hidden = true; }); });
  document.addEventListener('click', event => { const openButton = event.target.closest('[data-auth-open]'); if (openButton) openAuth(openButton.dataset.authOpen); });
  modal.addEventListener('click', event => { if (event.target === modal) closeAuth(); });
  modal.querySelector('[data-auth-close]').onclick = closeAuth;
  modal.querySelectorAll('[data-auth-tab]').forEach(tab => { tab.onclick = () => setMode(tab.dataset.authTab); });
  modal.querySelector('[data-email-auth]').onclick = handleEmail;
  modal.querySelector('[data-password-reset]').onclick = handlePasswordReset;
  const pendingSignedOut = sessionGet('owcusSignedOutMessage');
  if (pendingSignedOut || new URLSearchParams(location.search).has('signedout')) { sessionRemove('owcusSignedOutMessage'); showToast(pendingSignedOut || 'You have successfully signed out.'); }
  // Popup is deliberately the only Google flow. Redirect recovery requires
  // sessionStorage and produces Firebase's "missing initial state" error in
  // storage-partitioned browsers.
  // Keep the navigation in its loading state until persistence has completed,
  // so a restored account is never briefly replaced by Login/Sign Up.
  authReady
    .then(() => { onAuthStateChanged(auth, async user => { if (user) { renderAuth(user); return; } try { const response = await fetch('/api/auth/session/', { credentials: 'same-origin' }); const session = await response.json(); renderAuth(session.authenticated ? session.user : null); } catch (_) { renderAuth(null); } }); consumeVerificationLink(); })
    .catch(() => {
      document.querySelectorAll('[data-site-auth]').forEach(container => {
        container.removeAttribute('data-auth-loading');
        renderSignedOut(container);
      });
      showToast('Browser storage is unavailable. Enable cookies and site data, then reload to keep Google sign-in active.', true);
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
