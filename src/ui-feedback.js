// UX-01: グローバルフィードバックUI（スピナー・トースト・ボタン制御）

let _loadingOverlay = null;
let _toastContainer = null;
let _loadingCount = 0;

export function initFeedbackUI(doc = document) {
  if (!doc.getElementById('loading-overlay')) {
    _loadingOverlay = doc.createElement('div');
    _loadingOverlay.id = 'loading-overlay';
    _loadingOverlay.setAttribute('hidden', '');
    _loadingOverlay.innerHTML = '<div class="spinner"></div>';
    doc.body.appendChild(_loadingOverlay);
  } else {
    _loadingOverlay = doc.getElementById('loading-overlay');
  }

  if (!doc.getElementById('toast-container')) {
    _toastContainer = doc.createElement('div');
    _toastContainer.id = 'toast-container';
    doc.body.appendChild(_toastContainer);
  } else {
    _toastContainer = doc.getElementById('toast-container');
  }

  _loadingCount = 0;
}

export function showSpinner() {
  if (!_loadingOverlay) return;
  _loadingCount++;
  _loadingOverlay.removeAttribute('hidden');
}

export function hideSpinner() {
  if (!_loadingOverlay) return;
  _loadingCount = Math.max(0, _loadingCount - 1);
  if (_loadingCount === 0) {
    _loadingOverlay.setAttribute('hidden', '');
  }
}

export function showToast(message, type = 'info', durationMs = 3000) {
  if (!_toastContainer) return null;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  _toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), durationMs);
  return toast;
}

export async function apiFetchWithFeedback(apiFetchFn, url, options, { button, successMsg } = {}) {
  button?.setAttribute('disabled', 'true');
  showSpinner();
  try {
    const result = await apiFetchFn(url, options);
    if (successMsg) showToast(successMsg, 'success');
    return result;
  } catch (err) {
    showToast(err.message || 'エラーが発生しました', 'error');
    throw err;
  } finally {
    button?.removeAttribute('disabled');
    hideSpinner();
  }
}
