/**
 * 页面过渡模块
 * 实现页面切换时的平滑过渡效果
 * - opacity渐变 + 位置偏移 + 元素淡入淡出
 * - 防抖处理
 * - 移动端触摸支持
 */

class PageTransition {
    constructor(options = {}) {
        // 配置
        this.transitionDuration = options.duration || 1000; // 1秒
        this.easing = options.easing || 'cubic-bezier(0.4, 0, 0.2, 1)';
        this.debounceTime = options.debounceTime || 1200; // 防抖时间
        this.touchThreshold = options.touchThreshold || 50; // 触摸滑动阈值
        
        // 状态
        this.isTransitioning = false;
        this.currentPageIndex = 0;
        this.sections = [];
        this.lastScrollTime = 0;
        
        // 触摸状态
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isTouching = false;
        
        this.init();
    }
    
    init() {
        // 获取所有页面section
        this.sections = Array.from(document.querySelectorAll('.page-section'));
        if (this.sections.length === 0) return;
        
        // 初始化样式
        this.setupStyles();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化第一个页面
        this.showPage(0, 'none');
        
        // 暴露全局滚动函数
        this.exposeGlobalFunctions();
    }
    
    setupStyles() {
        // 禁用原生滚动snap（我们自己控制）
        document.body.style.scrollSnapType = 'none';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // 设置每个section的初始状态
        this.sections.forEach((section, index) => {
            section.style.position = 'fixed';
            section.style.top = '0';
            section.style.left = '0';
            section.style.width = '100vw';
            section.style.height = '100vh';
            section.style.zIndex = index === 0 ? '10' : '1';
            section.style.visibility = index === 0 ? 'visible' : 'hidden';
            section.style.opacity = index === 0 ? '1' : '0';
            section.style.transition = `opacity ${this.transitionDuration}ms ${this.easing}, transform ${this.transitionDuration}ms ${this.easing}`;
            
            // 给内部可动画元素添加过渡类
            this.setupAnimatableElements(section, index === 0);
        });
    }
    
    setupAnimatableElements(section, isActive) {
        // 选择需要动画的元素
        const animatableSelectors = [
            '.main-content > *',
            '.ascii-container',
            '.window-frame',
            '.center-nav',
            '.holographic-panel',
            '.left-content',
            '.right-content',
            '.physics-canvas-container',
            '.eye-container',
            '.scrolling-text-container',
            '.main-text > *',
            '.nav-item',
            '.contact-info',
            'h1', 'h2', 'h3',
            '.bottom-tip'
        ];
        
        const elements = section.querySelectorAll(animatableSelectors.join(', '));
        
        elements.forEach((el, i) => {
            el.classList.add('transition-element');
            el.style.transition = `opacity ${this.transitionDuration * 0.8}ms ${this.easing} ${i * 50}ms, transform ${this.transitionDuration * 0.8}ms ${this.easing} ${i * 50}ms`;
            
            if (isActive) {
                el.classList.add('transition-active');
            }
        });
    }
    
    bindEvents() {
        // 滚轮事件（带防抖）
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // 键盘事件
        window.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 触摸事件
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        // 防抖检查
        const now = Date.now();
        if (this.isTransitioning || now - this.lastScrollTime < this.debounceTime) {
            return;
        }
        
        const direction = e.deltaY > 0 ? 1 : -1;
        this.navigateToPage(this.currentPageIndex + direction);
        this.lastScrollTime = now;
    }
    
    handleKeydown(e) {
        if (this.isTransitioning) return;
        
        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                this.navigateToPage(this.currentPageIndex + 1);
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.navigateToPage(this.currentPageIndex - 1);
                break;
            case 'Home':
                e.preventDefault();
                this.navigateToPage(0);
                break;
            case 'End':
                e.preventDefault();
                this.navigateToPage(this.sections.length - 1);
                break;
        }
    }
    
    handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        this.isTouching = true;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
    }
    
    handleTouchMove(e) {
        if (!this.isTouching || this.isTransitioning) return;
        
        const deltaY = this.touchStartY - e.touches[0].clientY;
        const deltaX = this.touchStartX - e.touches[0].clientX;
        
        // 判断是否为垂直滑动
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            e.preventDefault();
        }
    }
    
    handleTouchEnd(e) {
        if (!this.isTouching || this.isTransitioning) return;
        
        const deltaY = this.touchStartY - (e.changedTouches[0]?.clientY || this.touchStartY);
        
        if (Math.abs(deltaY) > this.touchThreshold) {
            const direction = deltaY > 0 ? 1 : -1;
            this.navigateToPage(this.currentPageIndex + direction);
        }
        
        this.isTouching = false;
    }
    
    handleResize() {
        // 重新定位当前页面
        this.sections.forEach((section, index) => {
            if (index === this.currentPageIndex) {
                section.style.transform = 'translateY(0)';
            }
        });
    }
    
    navigateToPage(targetIndex) {
        // 边界检查
        if (targetIndex < 0 || targetIndex >= this.sections.length) {
            return;
        }
        
        if (targetIndex === this.currentPageIndex || this.isTransitioning) {
            return;
        }
        
        const direction = targetIndex > this.currentPageIndex ? 'down' : 'up';
        this.transitionToPage(targetIndex, direction);
    }
    
    transitionToPage(targetIndex, direction) {
        this.isTransitioning = true;
        
        const currentSection = this.sections[this.currentPageIndex];
        const targetSection = this.sections[targetIndex];
        
        // 设置目标页面初始位置
        targetSection.style.visibility = 'visible';
        targetSection.style.zIndex = '11';
        targetSection.style.opacity = '0';
        targetSection.style.transform = direction === 'down' ? 'translateY(30px)' : 'translateY(-30px)';
        
        // 淡出当前页面元素
        this.animateElementsOut(currentSection, direction);
        
        // 强制重排
        targetSection.offsetHeight;
        
        // 延迟启动目标页面动画
        requestAnimationFrame(() => {
            // 淡出当前页面
            currentSection.style.opacity = '0';
            currentSection.style.transform = direction === 'down' ? 'translateY(-30px)' : 'translateY(30px)';
            
            // 淡入目标页面
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
            
            // 淡入目标页面元素（带错开延迟）
            setTimeout(() => {
                this.animateElementsIn(targetSection);
            }, this.transitionDuration * 0.3);
        });
        
        // 过渡完成
        setTimeout(() => {
            currentSection.style.visibility = 'hidden';
            currentSection.style.zIndex = '1';
            targetSection.style.zIndex = '10';
            
            this.currentPageIndex = targetIndex;
            this.isTransitioning = false;
            
            // 触发页面切换事件
            this.dispatchPageChangeEvent(targetIndex);
        }, this.transitionDuration);
    }
    
    animateElementsOut(section, direction) {
        const elements = section.querySelectorAll('.transition-element');
        const offset = direction === 'down' ? '-20px' : '20px';
        
        elements.forEach((el, i) => {
            el.classList.remove('transition-active');
            el.style.transitionDelay = `${i * 30}ms`;
        });
    }
    
    animateElementsIn(section) {
        const elements = section.querySelectorAll('.transition-element');
        
        elements.forEach((el, i) => {
            el.style.transitionDelay = `${i * 50}ms`;
            el.classList.add('transition-active');
        });
    }
    
    showPage(index, transition = 'fade') {
        if (index < 0 || index >= this.sections.length) return;
        
        this.sections.forEach((section, i) => {
            if (i === index) {
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                section.style.zIndex = '10';
                this.animateElementsIn(section);
            } else {
                section.style.visibility = 'hidden';
                section.style.opacity = '0';
                section.style.zIndex = '1';
            }
        });
        
        this.currentPageIndex = index;
    }
    
    dispatchPageChangeEvent(pageIndex) {
        const event = new CustomEvent('pageChange', {
            detail: {
                pageIndex,
                section: this.sections[pageIndex],
                sectionClass: this.sections[pageIndex].classList[1] || ''
            }
        });
        window.dispatchEvent(event);
    }
    
    // 暴露全局函数（兼容现有代码）
    exposeGlobalFunctions() {
        const self = this;
        
        window.scrollToAscii = () => {
            const index = this.sections.findIndex(s => s.classList.contains('ascii-section'));
            if (index !== -1) self.navigateToPage(index);
        };
        
        window.scrollToContact = () => {
            const index = this.sections.findIndex(s => s.classList.contains('contact-section'));
            if (index !== -1) self.navigateToPage(index);
        };
        
        window.scrollToCreativity = () => {
            const index = this.sections.findIndex(s => s.classList.contains('creativity-section'));
            if (index !== -1) self.navigateToPage(index);
        };
        
        window.scrollToView = () => {
            const index = this.sections.findIndex(s => s.classList.contains('view-section'));
            if (index !== -1) self.navigateToPage(index);
        };
        
        window.scrollToTop = () => {
            self.navigateToPage(0);
        };
        
        // 暴露实例供调试
        window.pageTransition = self;
    }
    
    // 公共API
    goToPage(index) {
        this.navigateToPage(index);
    }
    
    nextPage() {
        this.navigateToPage(this.currentPageIndex + 1);
    }
    
    prevPage() {
        this.navigateToPage(this.currentPageIndex - 1);
    }
    
    getCurrentPage() {
        return this.currentPageIndex;
    }
}

// 初始化
let pageTransitionInstance = null;

function initPageTransition() {
    pageTransitionInstance = new PageTransition({
        duration: 1000,
        debounceTime: 1200,
        touchThreshold: 50
    });
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTransition);
} else {
    initPageTransition();
}

export { PageTransition, pageTransitionInstance };
