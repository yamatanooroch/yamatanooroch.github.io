/**
 * 眼球跟踪模块
 * 实现瞳孔跟随鼠标移动的效果
 */

export class EyeTracking {
    constructor(options = {}) {
        this.eyePupil = document.querySelector(options.pupilSelector || '.eye-pupil');
        this.eyeBackground = document.querySelector(options.backgroundSelector || '.eye-background');
        this.viewSection = document.querySelector(options.sectionSelector || '.view-section');
        
        if (!this.eyePupil || !this.eyeBackground || !this.viewSection) {
            console.warn('Eye tracking elements not found');
            return;
        }
        
        this.isActive = false;
        this.maxDistance = options.maxDistance || 45;
        this.smoothness = options.smoothness || 0.3;
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.bindEvents();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target === this.viewSection) {
                    this.isActive = entry.isIntersecting;
                    if (!this.isActive) {
                        this.resetPupilPosition();
                    }
                }
            });
        }, {
            threshold: 0.3
        });
        
        observer.observe(this.viewSection);
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 触摸支持
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.handleMouseMove({
                    clientX: e.touches[0].clientX,
                    clientY: e.touches[0].clientY
                });
            }
        }, { passive: true });
    }
    
    handleMouseMove(e) {
        if (!this.isActive) return;
        
        const eyeRect = this.eyeBackground.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        const mouseX = e.clientX - eyeCenterX;
        const mouseY = e.clientY - eyeCenterY;
        
        const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        const angle = Math.atan2(mouseY, mouseX);
        
        const limitedDistance = Math.min(distance * this.smoothness, this.maxDistance);
        
        const pupilX = Math.cos(angle) * limitedDistance;
        const pupilY = Math.sin(angle) * limitedDistance;
        
        this.eyePupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        
        // 高光跟随
        const eyeHighlight = this.eyePupil.querySelector('.eye-highlight');
        if (eyeHighlight) {
            const highlightX = pupilX * 0.3;
            const highlightY = pupilY * 0.3;
            eyeHighlight.style.transform = `translate(${highlightX}px, ${highlightY}px)`;
        }
    }
    
    resetPupilPosition() {
        this.eyePupil.style.transform = 'translate(0px, 0px)';
        const eyeHighlight = this.eyePupil.querySelector('.eye-highlight');
        if (eyeHighlight) {
            eyeHighlight.style.transform = 'translate(0px, 0px)';
        }
    }
    
    destroy() {
        // 清理（如果需要）
    }
}
