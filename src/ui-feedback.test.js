// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initFeedbackUI, showSpinner, hideSpinner, showToast, apiFetchWithFeedback } from './ui-feedback.js';

beforeEach(() => {
  document.body.innerHTML = '';
  initFeedbackUI();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── showSpinner / hideSpinner ─────────────────────────────────────────────────

describe('showSpinner', () => {
  it('should show loading overlay when called', () => {
    // Arrange
    const overlay = document.getElementById('loading-overlay');
    // Act
    showSpinner();
    // Assert
    expect(overlay.hasAttribute('hidden')).toBe(false);
  });

  it('should keep overlay visible when called multiple times', () => {
    // Arrange / Act
    showSpinner();
    showSpinner();
    hideSpinner();
    // Assert: 2回showして1回hideしたのでまだ表示中
    expect(document.getElementById('loading-overlay').hasAttribute('hidden')).toBe(false);
  });
});

describe('hideSpinner', () => {
  it('should hide loading overlay after matching showSpinner calls', () => {
    // Arrange
    showSpinner();
    showSpinner();
    // Act
    hideSpinner();
    hideSpinner();
    // Assert
    expect(document.getElementById('loading-overlay').hasAttribute('hidden')).toBe(true);
  });

  it('should not go below zero count', () => {
    // Arrange: overlapしていない状態でhideしても壊れない
    // Act
    hideSpinner();
    hideSpinner();
    // Assert: エラーが発生しない（overlay は hidden のまま）
    expect(document.getElementById('loading-overlay').hasAttribute('hidden')).toBe(true);
  });
});

// ── showToast ─────────────────────────────────────────────────────────────────

describe('showToast', () => {
  it('should append toast element to container when called', () => {
    // Arrange
    const container = document.getElementById('toast-container');
    // Act
    showToast('保存しました', 'success');
    // Assert
    expect(container.children.length).toBe(1);
    expect(container.children[0].textContent).toBe('保存しました');
  });

  it('should apply correct CSS class for success type', () => {
    // Arrange / Act
    showToast('保存しました', 'success');
    // Assert
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('toast--success')).toBe(true);
  });

  it('should apply correct CSS class for error type', () => {
    // Arrange / Act
    showToast('エラーが発生しました', 'error');
    // Assert
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('toast--error')).toBe(true);
  });

  it('should apply correct CSS class for info type when no type specified', () => {
    // Arrange / Act
    showToast('情報メッセージ');
    // Assert
    const toast = document.querySelector('.toast');
    expect(toast.classList.contains('toast--info')).toBe(true);
  });

  it('should remove toast after specified duration', () => {
    // Arrange
    vi.useFakeTimers();
    const container = document.getElementById('toast-container');
    // Act
    showToast('一時的なメッセージ', 'info', 3000);
    expect(container.children.length).toBe(1);
    vi.advanceTimersByTime(3000);
    // Assert
    expect(container.children.length).toBe(0);
    vi.useRealTimers();
  });

  it('should stack multiple toasts in container', () => {
    // Arrange / Act
    showToast('メッセージ1', 'success');
    showToast('メッセージ2', 'error');
    // Assert
    expect(document.getElementById('toast-container').children.length).toBe(2);
  });
});

// ── apiFetchWithFeedback ──────────────────────────────────────────────────────

describe('apiFetchWithFeedback', () => {
  it('should return resolved value when apiFetch succeeds', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockResolvedValue({ id: 1 });
    // Act
    const result = await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {});
    // Assert
    expect(result).toEqual({ id: 1 });
  });

  it('should show spinner during apiFetch call', async () => {
    // Arrange
    const overlay = document.getElementById('loading-overlay');
    let visibleDuringCall = false;
    const mockApiFetch = vi.fn().mockImplementation(async () => {
      visibleDuringCall = !overlay.hasAttribute('hidden');
      return {};
    });
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {});
    // Assert
    expect(visibleDuringCall).toBe(true);
  });

  it('should hide spinner after apiFetch resolves', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockResolvedValue({});
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {});
    // Assert
    expect(document.getElementById('loading-overlay').hasAttribute('hidden')).toBe(true);
  });

  it('should hide spinner after apiFetch rejects', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockRejectedValue(new Error('サーバーエラー'));
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {}).catch(() => {});
    // Assert
    expect(document.getElementById('loading-overlay').hasAttribute('hidden')).toBe(true);
  });

  it('should show success toast with provided message on success', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockResolvedValue({});
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, { successMsg: '保存しました' });
    // Assert
    const toast = document.querySelector('.toast--success');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('保存しました');
  });

  it('should not show success toast when successMsg is omitted', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockResolvedValue({});
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {});
    // Assert
    expect(document.querySelector('.toast--success')).toBeNull();
  });

  it('should show error toast with error message on failure', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockRejectedValue(new Error('入力値が不正です'));
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {}).catch(() => {});
    // Assert
    const toast = document.querySelector('.toast--error');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toBe('入力値が不正です');
  });

  it('should show fallback error message when error has no message', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockRejectedValue(new Error(''));
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {}).catch(() => {});
    // Assert
    const toast = document.querySelector('.toast--error');
    expect(toast.textContent).toBe('エラーが発生しました');
  });

  it('should rethrow error after showing toast', async () => {
    // Arrange
    const error = new Error('テストエラー');
    const mockApiFetch = vi.fn().mockRejectedValue(error);
    // Act / Assert
    await expect(apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {})).rejects.toThrow('テストエラー');
  });

  it('should disable button during apiFetch call', async () => {
    // Arrange
    const button = document.createElement('button');
    let disabledDuringCall = false;
    const mockApiFetch = vi.fn().mockImplementation(async () => {
      disabledDuringCall = button.hasAttribute('disabled');
      return {};
    });
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, { button });
    // Assert
    expect(disabledDuringCall).toBe(true);
  });

  it('should re-enable button after apiFetch resolves', async () => {
    // Arrange
    const button = document.createElement('button');
    const mockApiFetch = vi.fn().mockResolvedValue({});
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, { button });
    // Assert
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('should re-enable button after apiFetch rejects', async () => {
    // Arrange
    const button = document.createElement('button');
    const mockApiFetch = vi.fn().mockRejectedValue(new Error('失敗'));
    // Act
    await apiFetchWithFeedback(mockApiFetch, '/api/test', {}, { button }).catch(() => {});
    // Assert
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('should work without button option', async () => {
    // Arrange
    const mockApiFetch = vi.fn().mockResolvedValue({ ok: true });
    // Act / Assert: button なしでもエラーにならない
    await expect(apiFetchWithFeedback(mockApiFetch, '/api/test', {}, {})).resolves.toEqual({ ok: true });
  });
});
