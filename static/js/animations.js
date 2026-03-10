/**
 * 通用动画和交互模块
 * 包含星星旋转、蘑菇移动、导航动画等
 */

/**
 * 星星旋转动画
 */
export class StarRotation {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (!this.element) return;
        
        this.angle = 0;
        this.speed = 1.2;
        this.animationId = null;
        
        this.start();
    }
    
    start() {
        const rotate = () => {
            this.angle += this.speed;
            this.element.style.transform = `rotate(${this.angle}deg)`;
            this.animationId = requestAnimationFrame(rotate);
        };
        rotate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

/**
 * 蘑菇鼠标悬停逃跑动画
 */
export class MoguAnimation {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (!this.element) return;
        
        this.isAnimating = false;
        this.bindEvents();
    }
    
    bindEvents() {
        this.element.addEventListener('mouseenter', (e) => this.handleHover(e));
    }
    
    handleHover(e) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        const angle = Math.random() * 2 * Math.PI;
        const distance = 100;
        
        const rect = this.element.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        const currentY = rect.top + rect.height / 2;
        
        const newX = e.clientX + Math.cos(angle) * distance;
        const newY = e.clientY + Math.sin(angle) * distance;
        
        const moveX = newX - currentX;
        const moveY = newY - currentY;
        
        this.element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
        this.element.style.filter = 'brightness(1.2) drop-shadow(0 0 20px rgba(20, 255, 235, 0.8))';
        
        setTimeout(() => {
            this.element.style.transform = 'translate(0, 0) scale(1)';
            this.element.style.filter = 'brightness(1) drop-shadow(0 0 15px rgba(20, 255, 235, 0.3))';
            this.isAnimating = false;
        }, 1000);
    }
}

/**
 * 第三页导航动画控制器
 * 支持 IntersectionObserver 和 pageChange 事件两种触发方式
 */
export class NavAnimation {
    constructor(options = {}) {
        this.sectionSelector = options.sectionSelector || '.contact-section';
        this.navItemSelector = options.navItemSelector || '.nav-item';
        this.threshold = options.threshold || 0.3;
        
        this.section = document.querySelector(this.sectionSelector);
        this.navItems = document.querySelectorAll(this.navItemSelector);
        
        if (!this.section || this.navItems.length === 0) return;
        
        this.init();
    }
    
    init() {
        // 初始状态 - 由 transition-element 类控制，这里只设置悬停交互
        this.setupHoverInteraction();
        this.setupPageChangeListener();
    }
    
    setupPageChangeListener() {
        // 监听页面切换事件（由 page-transition.js 触发）
        window.addEventListener('pageChange', (e) => {
            const { sectionClass } = e.detail;
            if (sectionClass === 'contact-section') {
                this.startAnimation();
            } else {
                this.resetAnimation();
            }
        });
    }
    
    setupHoverInteraction() {
        this.navItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
            
            // 键盘支持
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });
    }
    
    startAnimation() {
        this.navItems.forEach((item, index) => {
            // 使用 CSS 类配合 transition-element
            item.style.transitionDelay = `${0.1 * (index + 1)}s`;
            item.classList.add('nav-animated');
        });
    }
    
    resetAnimation() {
        this.navItems.forEach(item => {
            item.classList.remove('nav-animated');
        });
    }
}

/**
 * 建筑物窗户创建器
 */
export function createBuildingWindows() {
    const buildings = [
        { id: 'building1', windows: 12 },
        { id: 'building2', windows: 20 },
        { id: 'building3', windows: 30 },
        { id: 'building4', windows: 16 },
        { id: 'building5', windows: 10 }
    ];
    
    buildings.forEach(building => {
        const buildingEl = document.getElementById(building.id);
        if (!buildingEl) return;
        
        for (let i = 0; i < building.windows; i++) {
            const windowEl = document.createElement('div');
            windowEl.className = 'window';
            windowEl.setAttribute('aria-hidden', 'true');
            
            if (Math.random() > 0.6) {
                windowEl.classList.add('lit');
            }
            
            const x = 10 + (i % 4) * 18;
            const y = 15 + Math.floor(i / 4) * 20;
            
            windowEl.style.left = x + 'px';
            windowEl.style.top = y + 'px';
            
            buildingEl.appendChild(windowEl);
        }
    });
}

/**
 * 平滑滚动导航
 * 注意：如果使用了 page-transition.js，这些函数会被覆盖
 * 这里作为备用方案保留
 */
export const scrollNavigation = {
    toSection(selector) {
        // 如果 page-transition 可用，使用它
        if (window.pageTransition) {
            const sections = Array.from(document.querySelectorAll('.page-section'));
            const index = sections.findIndex(s => s.matches(selector) || s.classList.contains(selector.replace('.', '')));
            if (index !== -1) {
                window.pageTransition.goToPage(index);
                return;
            }
        }
        // 否则使用原生滚动
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    toAscii() {
        this.toSection('.ascii-section');
    },
    
    toContact() {
        this.toSection('.contact-section');
    },
    
    toCreativity() {
        this.toSection('.creativity-section');
    },
    
    toView() {
        this.toSection('.view-section');
    },
    
    toTop() {
        if (window.pageTransition) {
            window.pageTransition.goToPage(0);
        } else {
            this.toSection('.page-section');
        }
    }
};

// 将滚动函数暴露到全局作用域供HTML使用
// 注意：page-transition.js 会覆盖这些函数
if (typeof window !== 'undefined') {
    // 只在 page-transition 未定义时设置
    const setScrollFunctions = () => {
        if (!window.pageTransition) {
            window.scrollToAscii = () => scrollNavigation.toAscii();
            window.scrollToContact = () => scrollNavigation.toContact();
            window.scrollToCreativity = () => scrollNavigation.toCreativity();
            window.scrollToView = () => scrollNavigation.toView();
            window.scrollToTop = () => scrollNavigation.toTop();
        }
    };
    
    // 延迟执行，让 page-transition 有机会先加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(setScrollFunctions, 100);
        });
    } else {
        setTimeout(setScrollFunctions, 100);
    }
}
