import { describe, it, expect } from 'vitest';
import { validatePassword } from './passwordPolicy.js';

describe('validatePassword', () => {
  it('should throw when password is shorter than 8 chars', () => {
    // Arrange
    const short = 'Ab1';

    // Act & Assert
    expect(() => validatePassword(short)).toThrow();
  });

  it('should throw when password lacks uppercase letter', () => {
    // Arrange
    const noUpper = 'abcdef12';

    // Act & Assert
    expect(() => validatePassword(noUpper)).toThrow();
  });

  it('should throw when password lacks lowercase letter', () => {
    // Arrange
    const noLower = 'ABCDEF12';

    // Act & Assert
    expect(() => validatePassword(noLower)).toThrow();
  });

  it('should throw when password lacks digit', () => {
    // Arrange
    const noDigit = 'ABCDefgh';

    // Act & Assert
    expect(() => validatePassword(noDigit)).toThrow();
  });

  it('should not throw with valid complex password', () => {
    // Arrange
    const valid = 'Passw0rd';

    // Act & Assert
    expect(() => validatePassword(valid)).not.toThrow();
  });

  it('should throw with descriptive message when too short', () => {
    // Arrange
    const short = 'Ab1';

    // Act & Assert
    expect(() => validatePassword(short)).toThrow('8文字以上');
  });

  it('should throw with descriptive message when no uppercase', () => {
    // Arrange
    const noUpper = 'abcdef12';

    // Act & Assert
    expect(() => validatePassword(noUpper)).toThrow('大文字');
  });

  it('should throw with descriptive message when no digit', () => {
    // Arrange
    const noDigit = 'ABCDefgh';

    // Act & Assert
    expect(() => validatePassword(noDigit)).toThrow('数字');
  });
});
