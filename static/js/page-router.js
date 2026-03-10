/**
 * 赛博朋克页面路由过渡 - Cyberpunk Page Router
 * 在页面间跳转时播放离场/入场动画
 * 
 * 用法：在 onclick 中调用 routeTo('target.html') 代替 window.location.href
 */
(function () {
    'use strict';

    const EXIT_DURATION = 550;   // 离场动画总时长 (ms)
    const ENTER_DURATION = 600;  // 入场动画总时长 (ms)
    const STORAGE_KEY = 'cyber-route-entering';

    let isTransitioning = false; // 防止重复触发

    /**
     * 创建遮罩 DOM 并插入 body
     */
    function createOverlay() {
        // 避免重复创建
        let existing = document.querySelector('.route-overlay');
        if (existing) return existing;

        const overlay = document.createElement('div');
        overlay.className = 'route-overlay';
        overlay.innerHTML = `
            <div class="scan-line"></div>
            <div class="glitch-strips">
                <div class="strip"></div>
                <div class="strip"></div>
                <div class="strip"></div>
                <div class="strip"></div>
                <div class="strip"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * 带过渡动画的页面跳转
     * @param {string} url - 目标页面 URL
     */
    function routeTo(url) {
        if (isTransitioning) return;
        isTransitioning = true;

        const overlay = createOverlay();

        // 在 sessionStorage 打入场标记，让目标页加载时知道要播放入场动画
        sessionStorage.setItem(STORAGE_KEY, '1');

        // 1. 启动离场动画
        document.body.classList.add('route-exiting');

        // 用 rAF 确保 DOM 更新后再添加动画类
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('exit-active');
            });
        });

        // 2. 动画结束后执行跳转
        setTimeout(() => {
            window.location.href = url;
        }, EXIT_DURATION);
    }

    /**
     * 页面加载时检查是否需要播放入场动画
     */
    function handlePageEnter() {
        const overlay = createOverlay();

        if (sessionStorage.getItem(STORAGE_KEY) === '1') {
            sessionStorage.removeItem(STORAGE_KEY);

            // 初始状态：遮罩全屏可见，内容被遮挡
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';

            // 等一帧让页面完成初始渲染
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 启动入场动画
                    overlay.classList.add('enter-active');
                    document.body.classList.add('route-entering');

                    // 动画结束后清理
                    setTimeout(() => {
                        overlay.classList.remove('enter-active');
                        overlay.style.opacity = '';
                        overlay.style.visibility = '';
                        document.body.classList.remove('route-entering');
                        isTransitioning = false;
                    }, ENTER_DURATION);
                });
            });
        }
    }

    // 暴露全局函数
    window.routeTo = routeTo;

    // DOM 就绪后执行入场检测
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handlePageEnter);
    } else {
        handlePageEnter();
    }
})();
