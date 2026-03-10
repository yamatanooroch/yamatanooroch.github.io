/**
 * 主入口文件
 * 初始化所有模块和交互
 */

import { CanvasGlow } from './canvas-glow.js';
import { PhysicsEngine } from './physics-engine.js';
import { AsciiAnimation } from './ascii-animation.js';
import { EyeTracking } from './eye-tracking.js';
import { City3D } from './city3d.js';
import { CodeFireworks } from './fireworks.js';
import { 
    StarRotation, 
    MoguAnimation, 
    NavAnimation, 
    scrollNavigation 
} from './animations.js';

// 应用实例
let app = {
    canvasGlow: null,
    physicsEngine: null,
    asciiAnimation: null,
    eyeTracking: null,
    starRotation: null,
    moguAnimation: null,
    navAnimation: null,
    city3D: null,
    codeFireworks: null
};

/**
 * 初始化所有模块
 */
function initApp() {
    // 初始化光效
    app.canvasGlow = new CanvasGlow('bgGlow');
    
    // 初始化星星旋转
    app.starRotation = new StarRotation('star-img');
    
    // 初始化蘑菇动画
    app.moguAnimation = new MoguAnimation('mogu-img');
    
    // 初始化ASCII动画
    app.asciiAnimation = new AsciiAnimation('asciiContainer', {
        gifUrl: 'imerge/head.gif',
        scale: 2,
        frameDelay: 80
    });
    
    // 初始化导航动画
    app.navAnimation = new NavAnimation();
    
    // 初始化 3D 城市（第三页）
    app.city3D = new City3D('city3d-container');
    
    // 初始化物理引擎
    const physicsCanvas = document.getElementById('physicsCanvas');
    if (physicsCanvas) {
        app.physicsEngine = new PhysicsEngine(physicsCanvas, {
            onAllLit: () => showCongratulations()
        });
    }
    
    // 初始化眼球跟踪
    app.eyeTracking = new EyeTracking();
    
    // 初始化代码烟花（第五页）
    app.codeFireworks = new CodeFireworks({
        containerSelector: '.view-section'
    });
}

/**
 * 显示恭喜弹窗
 */
function showCongratulations() {
    const modal = document.getElementById('congratulationModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 添加键盘支持关闭弹窗
        const closeBtn = modal.querySelector('button');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
}

/**
 * 关闭弹窗
 */
function closeModal() {
    const modal = document.getElementById('congratulationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 显示联系提示弹窗
 */
function showContactAlert() {
    const modal = document.getElementById('contactAlertModal');
    if (modal) {
        modal.style.display = 'block';
        const closeBtn = modal.querySelector('button');
        if (closeBtn) closeBtn.focus();
    }
}

/**
 * 关闭联系提示弹窗
 */
function closeContactAlert() {
    const modal = document.getElementById('contactAlertModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 暴露函数到全局
window.closeModal = closeModal;
window.showContactAlert = showContactAlert;
window.closeContactAlert = closeContactAlert;

// 键盘支持：ESC关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeContactAlert();
    }
});

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 导出供外部使用
export { app, scrollNavigation };
