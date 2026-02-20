/**
 * QRCodeDisplay 组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QRCodeDisplay } from './QRCodeDisplay.js';

describe('QRCodeDisplay', () => {
  let qrCodeDisplay;

  beforeEach(() => {
    qrCodeDisplay = new QRCodeDisplay();
  });

  afterEach(() => {
    if (qrCodeDisplay) {
      qrCodeDisplay.dispose();
    }
  });

  describe('初始化', () => {
    it('应该创建 QRCodeDisplay 实例', () => {
      expect(qrCodeDisplay).toBeDefined();
      expect(qrCodeDisplay.isVisible).toBe(false);
    });

    it('应该创建 DOM 结构', () => {
      expect(qrCodeDisplay.container).toBeDefined();
      expect(qrCodeDisplay.canvas).toBeDefined();
      expect(qrCodeDisplay.qrGenerator).toBeDefined();
    });

    it('应该有正确的样式', () => {
      const container = qrCodeDisplay.getContainer();
      expect(container.style.background).toContain('linear-gradient');
      expect(container.style.borderRadius).toBe('16px');
    });
  });

  describe('生成二维码', () => {
    it('应该生成二维码', () => {
      const generateSpy = vi.spyOn(qrCodeDisplay.qrGenerator, 'generateToCanvas');
      generateSpy.mockReturnValue(true);

      qrCodeDisplay.generate('https://example.com');

      expect(generateSpy).toHaveBeenCalledWith(
        'https://example.com',
        qrCodeDisplay.canvas,
        expect.objectContaining({
          size: 256,
          margin: 2,
          colorDark: '#2d1b3d',
          colorLight: '#ffffff',
        })
      );
    });

    it('应该使用当前 URL 如果未提供', () => {
      const generateSpy = vi.spyOn(qrCodeDisplay.qrGenerator, 'generateToCanvas');
      const getCurrentURLSpy = vi.spyOn(qrCodeDisplay.qrGenerator, 'getCurrentURL');
      getCurrentURLSpy.mockReturnValue('https://current-url.com');
      generateSpy.mockReturnValue(true);

      qrCodeDisplay.generate();

      expect(getCurrentURLSpy).toHaveBeenCalled();
      expect(generateSpy).toHaveBeenCalledWith(
        'https://current-url.com',
        qrCodeDisplay.canvas,
        expect.any(Object)
      );
    });

    it('应该处理生成失败', () => {
      const generateSpy = vi.spyOn(qrCodeDisplay.qrGenerator, 'generateToCanvas');
      generateSpy.mockReturnValue(false);

      const showErrorSpy = vi.spyOn(qrCodeDisplay, 'showError');

      qrCodeDisplay.generate('https://example.com');

      expect(showErrorSpy).toHaveBeenCalled();
    });
  });

  describe('显示和隐藏', () => {
    it('应该显示二维码显示器', () => {
      qrCodeDisplay.show();

      expect(qrCodeDisplay.isVisible).toBe(true);
      expect(qrCodeDisplay.container.style.display).toBe('block');
    });

    it('应该隐藏二维码显示器', () => {
      qrCodeDisplay.show();
      qrCodeDisplay.hide();

      expect(qrCodeDisplay.isVisible).toBe(false);
      expect(qrCodeDisplay.container.style.display).toBe('none');
    });
  });

  describe('下载二维码', () => {
    it('应该下载二维码', () => {
      const downloadSpy = vi.spyOn(qrCodeDisplay.qrGenerator, 'download');
      const toDataURLSpy = vi.spyOn(qrCodeDisplay.canvas, 'toDataURL');
      toDataURLSpy.mockReturnValue('data:image/png;base64,test');

      qrCodeDisplay.downloadQRCode();

      expect(toDataURLSpy).toHaveBeenCalledWith('image/png');
      expect(downloadSpy).toHaveBeenCalledWith(
        'data:image/png;base64,test',
        'cave-exploration-qrcode.png'
      );
    });

    it('应该处理下载失败', () => {
      const toDataURLSpy = vi.spyOn(qrCodeDisplay.canvas, 'toDataURL');
      toDataURLSpy.mockImplementation(() => {
        throw new Error('Canvas error');
      });

      global.alert = vi.fn();

      qrCodeDisplay.downloadQRCode();

      expect(global.alert).toHaveBeenCalledWith('下载失败，请重试');
    });
  });

  describe('清理资源', () => {
    it('应该清理所有资源', () => {
      const container = qrCodeDisplay.container;
      document.body.appendChild(container);

      qrCodeDisplay.dispose();

      expect(qrCodeDisplay.container).toBeNull();
      expect(qrCodeDisplay.canvas).toBeNull();
      expect(qrCodeDisplay.qrGenerator).toBeNull();
      expect(qrCodeDisplay.isVisible).toBe(false);

      // 验证 DOM 已移除
      expect(document.body.contains(container)).toBe(false);
    });
  });
});
