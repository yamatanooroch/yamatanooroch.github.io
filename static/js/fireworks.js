/**
 * 代码烟花交互模块
 * 当鼠标点击特定区域时，在点击位置爆炸出一团赛博风格的字符粒子
 */

export class CodeFireworks {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || '.view-section';
        this.container = document.querySelector(this.containerSelector);
        
        if (!this.container) return;
        
        // 粒子池和颜色配置
        this.chars = ['0', '1', '!', '?', '{', '}', '<', '>', '/', '#', '*', '%'];
        this.colors = ['#14ffeb', '#ff00ff', '#ffffff', '#00ff41'];
        this.particleCount = 15; // 每次点击产生的粒子数
        
        this.isActive = false; // 是否在当前页，只有当前页响应点击
        
        this.init();
    }
    
    init() {
        this.setupPageChangeListener();
        this.bindEvents();
        this.injectStyles();
    }
    
    injectStyles() {
        // 动态注入粒子基础样式，保证隔离性
        const style = document.createElement('style');
        style.textContent = `
            .cyber-particle {
                position: absolute;
                pointer-events: none;
                user-select: none;
                z-index: 9999;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                text-shadow: 0 0 8px currentColor;
                transform: translate(-50%, -50%); /* 居中鼠标点 */
                will-change: transform, opacity;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupPageChangeListener() {
        // 监听页面切换事件，只在 view-section 激活烟花
        window.addEventListener('pageChange', (e) => {
            const { sectionClass } = e.detail;
            this.isActive = sectionClass === 'view-section';
        });
    }
    
    bindEvents() {
        this.container.addEventListener('mousedown', (e) => {
            if (!this.isActive) return;
            this.createExplosion(e.clientX, e.clientY);
        });
        
        // 触摸屏支持
        this.container.addEventListener('touchstart', (e) => {
            if (!this.isActive || e.touches.length === 0) return;
            this.createExplosion(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
    }
    
    createExplosion(x, y) {
        // 由于我们的容器可能是相对定位的，我们要将 clientX/Y 转换为相对于容器的坐标
        // 如果 section 是满屏 fixed/absolute 的，则 clientXY 往往等价。为了安全起见，我们直接计算绝对坐标
        const rect = this.container.getBoundingClientRect();
        const startX = x - rect.left;
        const startY = y - rect.top;
        
        for (let i = 0; i < this.particleCount; i++) {
            this.spawnParticle(startX, startY);
        }
    }
    
    spawnParticle(x, y) {
        const particle = document.createElement('span');
        particle.className = 'cyber-particle';
        
        // 随机内容和颜色
        particle.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];
        particle.style.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // 随机字体大小 (12px - 24px)
        const size = Math.random() * 12 + 12;
        particle.style.fontSize = `${size}px`;
        
        // 初始位置
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        this.container.appendChild(particle);
        
        // 物理爆炸计算
        // 随机爆炸角度 (0 - 2PI)
        const angle = Math.random() * Math.PI * 2;
        // 随机扩散距离 (40px - 120px)
        const distance = Math.random() * 80 + 40;
        
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        // 随机旋转
        const rot = (Math.random() - 0.5) * 360;
        
        // 使用 Web Animations API 创建丝滑且高性能的动画
        const animation = particle.animate([
            { 
                transform: `translate(-50%, -50%) rotate(0deg) scale(0)`,
                opacity: 1 
            },
            { 
                transform: `translate(calc(-50% + ${tx * 0.8}px), calc(-50% + ${ty * 0.8}px)) rotate(${rot * 0.5}deg) scale(1.5)`,
                opacity: 1,
                offset: 0.5 // 动画进行到一半时的状态
            },
            { 
                transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot}deg) scale(0.5)`,
                opacity: 0 
            }
        ], {
            duration: Math.random() * 400 + 600, // 600ms - 1000ms 的随机持续时间
            easing: 'cubic-bezier(0.15, 0.9, 0.3, 1)', // 类似爆炸弹出的缓动
            fill: 'forwards'
        });
        
        // 动画结束后自动清理 DOM
        animation.onfinish = () => {
            particle.remove();
        };
    }
}
