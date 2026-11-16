import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, browserLocalPersistence, setPersistence, signOut, updateProfile, isSignInWithEmailLink, signInWithEmailLink } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const app = initializeApp({ projectId: 'owcus-24e46', appId: '1:585892351412:web:bbc439d0320c8bac7676e1', apiKey: 'AIzaSyCaYcZd17Cx6tsCjJoEATiZVhIqgORwU3g', authDomain: 'owcus-24e46.firebaseapp.com', storageBucket: 'owcus-24e46.firebasestorage.app', messagingSenderId: '585892351412' });
const auth = getAuth(app), google = new GoogleAuthProvider(), modal = document.querySelector('#auth-modal'), form = document.querySelector('[data-auth-form]'), message = document.querySelector('[data-auth-message]'), title = document.querySelector('#auth-title');
const authReady = Promise.race([setPersistence(auth, browserLocalPersistence), new Promise(resolve => setTimeout(resolve, 2500))]).catch(() => {});
let mode = 'signin';
const emailInput = document.querySelector('[data-auth-email-input]'), nameInput = document.querySelector('[data-auth-name-input]'), emailButton = document.querySelector('[data-email-auth]');
const headerAuth = document.querySelector('.home-auth-actions'), headerProfile = document.createElement('div');
const headerStatus = document.createElement('span');
headerStatus.className = 'home-auth-status';
headerStatus.setAttribute('aria-live', 'polite');
headerStatus.textContent = 'Not signed in';
headerAuth.prepend(headerStatus);
headerProfile.className = 'home-profile';
headerProfile.hidden = true;
headerProfile.innerHTML = '<button class="home-profile-button" type="button" data-profile-toggle><span class="home-profile-avatar" data-profile-avatar>U</span><span class="home-profile-label"><strong data-profile-name>Owcus member</strong><small data-profile-email></small></span><span class="home-profile-chevron">⌄</span></button><div class="home-profile-menu" data-profile-menu hidden><span class="home-profile-status">Signed in</span><button type="button" data-header-signout>Sign out</button></div>';
headerAuth.append(headerProfile);
const profileToggle = headerProfile.querySelector('[data-profile-toggle]'), profileMenu = headerProfile.querySelector('[data-profile-menu]');
profileToggle.onclick = () => { profileMenu.hidden = !profileMenu.hidden; };
document.addEventListener('click', event => { if (!headerProfile.contains(event.target)) profileMenu.hidden = true; });
headerProfile.querySelector('[data-header-signout]').onclick = () => signOut(auth);
const passwordFields = document.createElement('div');
passwordFields.innerHTML = '<label class="auth-label" for="auth-password">Password</label><input class="auth-input" id="auth-password" type="password" placeholder="At least 6 characters" autocomplete="new-password" data-auth-password><label class="auth-label" for="auth-confirm-password" data-auth-confirm-label>Confirm password</label><input class="auth-input" id="auth-confirm-password" type="password" placeholder="Repeat your password" autocomplete="new-password" data-auth-confirm-password>';
emailInput.after(passwordFields);
const passwordInput = passwordFields.querySelector('[data-auth-password]'), confirmPasswordInput = passwordFields.querySelector('[data-auth-confirm-password]');
const showMessage = (text, error = false) => { message.textContent = text; message.className = `auth-message${error ? ' error' : ''}`; };
const authErrorMessage = (error, provider) => ({
  'auth/operation-not-allowed': provider === 'email' ? 'Email sign-in is disabled. Enable Email link sign-in in Firebase Authentication → Sign-in method.' : 'Google sign-in is disabled. Enable Google in Firebase Authentication → Sign-in method.',
  'auth/unauthorized-domain': 'This local domain is not authorized. Add 127.0.0.1 and localhost in Firebase Authentication → Settings → Authorized domains.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.',
  'auth/popup-closed-by-user': 'Sign-in cancelled.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/email-already-in-use': 'An account already exists for this email. Try signing in.',
  'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account exists for this email. Sign up first.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/operation-not-allowed': provider === 'email' ? 'Email/password sign-in is disabled. Enable Email/Password in Firebase Authentication → Sign-in method.' : 'Google sign-in is disabled. Enable Google in Firebase Authentication → Sign-in method.'
}[error?.code] || (provider === 'email' ? 'Email authentication could not be completed. Try again.' : 'Google sign-in could not be completed. Try again.'));
const setMode = (next) => { mode = next; title.textContent = mode === 'signup' ? 'Create your free account' : 'Welcome back'; document.querySelectorAll('[data-auth-tab]').forEach(x => x.classList.toggle('active', x.dataset.authTab === mode)); document.querySelector('[data-auth-name-field]').hidden = mode !== 'signup'; nameInput.hidden = mode !== 'signup'; document.querySelector('[data-auth-confirm-label]').hidden = mode !== 'signup'; confirmPasswordInput.hidden = mode !== 'signup'; emailButton.textContent = mode === 'signup' ? 'Create account' : 'Sign in with email'; passwordInput.autocomplete = mode === 'signup' ? 'new-password' : 'current-password'; showMessage(''); };
const open = (next = 'signin') => { modal.hidden = false; setMode(next); };
const close = () => { modal.hidden = true; showMessage(''); };
document.querySelectorAll('[data-auth-open]').forEach(x => x.onclick = () => open(x.dataset.authOpen));
document.querySelectorAll('[data-auth-tab]').forEach(x => x.onclick = () => setMode(x.dataset.authTab));
document.querySelector('[data-auth-close]').onclick = close;
modal.onclick = event => { if (event.target === modal) close(); };
document.querySelector('[data-google-auth]').onclick = async () => { showMessage('Connecting to Google securely…'); try { await authReady; const { user } = await signInWithPopup(auth, google); renderAuthState(user); close(); } catch (error) { const fallbackCodes = ['auth/popup-blocked', 'auth/popup-timeout', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/web-storage-unsupported', 'auth/operation-not-supported-in-this-environment']; if (fallbackCodes.includes(error?.code)) { try { showMessage('Opening Google sign-in…'); sessionStorage.setItem('owcusGoogleRedirectPending', '1'); await signInWithRedirect(auth, google); } catch (redirectError) { sessionStorage.removeItem('owcusGoogleRedirectPending'); showMessage(authErrorMessage(redirectError, 'google'), true); } } else { showMessage(authErrorMessage(error, 'google'), true); } } };
emailButton.onclick = async () => { const email = emailInput.value.trim(), name = nameInput.value.trim(), password = passwordInput.value, confirmPassword = confirmPasswordInput.value; if (!email) return showMessage('Enter your email address first.', true); if (!password) return showMessage('Enter your password.', true); if (password.length < 6) return showMessage('Password must be at least 6 characters.', true); if (mode === 'signup' && password !== confirmPassword) return showMessage('Passwords do not match.', true); try { await authReady; let user; if (mode === 'signup') { ({ user } = await createUserWithEmailAndPassword(auth, email, password)); if (name) await updateProfile(user, { displayName: name }); renderAuthState(user); showMessage('Account created successfully.'); } else { ({ user } = await signInWithEmailAndPassword(auth, email, password)); renderAuthState(user); close(); } } catch (error) { showMessage(authErrorMessage(error, 'email'), true); } };
document.querySelector('[data-auth-signout]').onclick = () => signOut(auth);
const renderAuthState = user => { const state = document.querySelector('[data-auth-user]'), signedOutActions = headerAuth.querySelectorAll('[data-auth-open]'); if (!user) { headerStatus.classList.remove('is-signed-in'); headerStatus.textContent = 'Not signed in'; headerStatus.title = 'You are not signed in'; state.hidden = true; form.hidden = false; headerProfile.hidden = true; signedOutActions.forEach(button => { button.hidden = false; }); return; } state.hidden = false; form.hidden = true; signedOutActions.forEach(button => { button.hidden = true; }); headerProfile.hidden = false; profileMenu.hidden = true; const displayName = user.displayName || user.email?.split('@')[0] || 'Owcus member'; const email = user.email || 'Email unavailable'; headerStatus.classList.add('is-signed-in'); headerStatus.textContent = `Signed in as ${displayName} · ${email}`; headerStatus.title = `Signed in as ${displayName} (${email})`; document.querySelector('[data-auth-name]').textContent = displayName; document.querySelector('[data-auth-email]').textContent = email; document.querySelector('[data-auth-avatar]').textContent = displayName[0].toUpperCase(); headerProfile.querySelector('[data-profile-name]').textContent = displayName; headerProfile.querySelector('[data-profile-email]').textContent = email; headerProfile.querySelector('[data-profile-avatar]').textContent = displayName[0].toUpperCase(); };
onAuthStateChanged(auth, user => { renderAuthState(user); if (user) close(); });
authReady.then(async () => { const redirectPending = sessionStorage.getItem('owcusGoogleRedirectPending') === '1'; const result = await getRedirectResult(auth); sessionStorage.removeItem('owcusGoogleRedirectPending'); const user = result?.user || auth.currentUser; renderAuthState(user); if (!user && redirectPending) { open('signin'); showMessage('Google sign-in did not complete. Please choose your Google account and allow access, then try again.', true); } }).catch(error => { sessionStorage.removeItem('owcusGoogleRedirectPending'); open('signin'); showMessage(authErrorMessage(error, 'google'), true); });
if (isSignInWithEmailLink(auth, window.location.href)) { const email = localStorage.getItem('owcusEmailForSignIn') || window.prompt('Confirm your email address'); if (email) signInWithEmailLink(auth, email, window.location.href).then(async ({ user }) => { const name = localStorage.getItem('owcusPendingDisplayName'); if (name && !user.displayName) await updateProfile(user, { displayName: name }); localStorage.removeItem('owcusEmailForSignIn'); localStorage.removeItem('owcusPendingDisplayName'); window.history.replaceState({}, document.title, window.location.pathname); open(); showMessage('You are signed in successfully.'); }).catch(() => { open(); showMessage('This sign-in link is invalid or expired.', true); }); }
