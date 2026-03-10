/**
 * 物理引擎模块
 * 实现灯泡的物理碰撞、重力、摩擦力效果
 */

export class PhysicsEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        if (!this.canvas) {
            console.warn('Physics canvas not found');
            return;
        }
        
        this.ctx = canvas.getContext('2d');
        this.circles = [];
        
        // 物理参数
        this.gravity = options.gravity || 0.3;
        this.friction = options.friction || 0.98;
        this.bounceDamping = options.bounceDamping || 0.8;
        this.scrollForce = 0;
        
        // 灯泡配置
        this.totalCircles = options.totalCircles || 8;
        this.filledCircles = 0;
        this.bulbWidth = 120;
        this.bulbHeight = 180;
        this.bulbCollisionRadius = 60;
        
        // 预加载图片
        this.lightOffImg = new Image();
        this.lightOnImg = new Image();
        this.lightOffImg.src = 'imerge/lightoff.png';
        this.lightOnImg.src = 'imerge/lighton.png';
        
        // 回调函数
        this.onAllLit = options.onAllLit || null;
        
        this.animationId = null;
        this.lastScrollY = window.scrollY;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.initCircles();
        this.bindEvents();
        this.startAnimation();
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    initCircles() {
        this.circles = [];
        for (let i = 0; i < this.totalCircles; i++) {
            this.circles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: this.bulbCollisionRadius,
                filled: false,
                color: '#14ffeb',
                width: this.bulbWidth,
                height: this.bulbHeight,
                tilt: 0,
                tiltVelocity: 0
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 点击事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 键盘支持（空格键点亮最近的灯泡）
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isVisible()) {
                e.preventDefault();
                this.lightNearestBulb();
            }
        });
        
        // 滚动监听
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - this.lastScrollY;
            this.scrollForce = scrollDelta * 0.1;
            this.lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    isVisible() {
        const rect = this.canvas.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    lightNearestBulb() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        let nearestCircle = null;
        let minDistance = Infinity;
        
        this.circles.forEach(circle => {
            if (!circle.filled) {
                const dx = circle.x - centerX;
                const dy = circle.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCircle = circle;
                }
            }
        });
        
        if (nearestCircle) {
            this.lightBulb(nearestCircle);
        }
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        this.circles.forEach(circle => {
            const dx = clickX - circle.x;
            const dy = clickY - circle.y;
            
            // 椭圆碰撞检测
            const normalizedX = dx / (circle.width * 0.4);
            const normalizedY = dy / (circle.height * 0.5);
            const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            
            if (distance <= 1 && !circle.filled) {
                this.lightBulb(circle);
            }
        });
    }
    
    lightBulb(circle) {
        circle.filled = true;
        this.filledCircles++;
        
        // 点击反馈效果
        circle.vx += (Math.random() - 0.5) * 5;
        circle.vy -= Math.random() * 3 + 2;
        circle.tilt += (Math.random() - 0.5) * 0.3;
        
        // 发布事件通知
        this.canvas.dispatchEvent(new CustomEvent('bulbLit', {
            detail: { filled: this.filledCircles, total: this.totalCircles }
        }));
        
        if (this.filledCircles === this.totalCircles) {
            setTimeout(() => {
                if (this.onAllLit) {
                    this.onAllLit();
                }
            }, 500);
        }
    }
    
    updatePhysics() {
        this.circles.forEach(circle => {
            // 应用重力
            circle.vy += this.gravity;
            
            // 应用滚动力
            circle.vy += this.scrollForce;
            
            // 应用摩擦力
            circle.vx *= this.friction;
            circle.vy *= this.friction;
            
            // 更新位置
            circle.x += circle.vx;
            circle.y += circle.vy;
            
            // 更新倾斜角度
            const targetTilt = circle.vx * 0.08;
            const maxTilt = Math.PI / 4;
            circle.tilt += (Math.max(-maxTilt, Math.min(maxTilt, targetTilt)) - circle.tilt) * 0.2;
            
            // 边界碰撞
            this.handleBoundaryCollision(circle);
            
            // 灯泡间碰撞
            this.handleCircleCollisions(circle);
        });
        
        // 减少滚动力
        this.scrollForce *= 0.9;
    }
    
    handleBoundaryCollision(circle) {
        const halfWidth = circle.width / 2;
        const halfHeight = circle.height / 2;
        
        if (circle.x < halfWidth) {
            circle.x = halfWidth;
            circle.vx *= -this.bounceDamping;
            circle.tilt += Math.abs(circle.vx) * 0.01;
        }
        if (circle.x > this.canvas.width - halfWidth) {
            circle.x = this.canvas.width - halfWidth;
            circle.vx *= -this.bounceDamping;
            circle.tilt -= Math.abs(circle.vx) * 0.01;
        }
        if (circle.y < halfHeight) {
            circle.y = halfHeight;
            circle.vy *= -this.bounceDamping;
        }
        if (circle.y > this.canvas.height - halfHeight) {
            circle.y = this.canvas.height - halfHeight;
            circle.vy *= -this.bounceDamping;
        }
    }
    
    handleCircleCollisions(circle) {
        this.circles.forEach(other => {
            if (other !== circle) {
                const dx = other.x - circle.x;
                const dy = other.y - circle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = circle.radius + other.radius;
                
                if (distance < minDistance) {
                    const angle = Math.atan2(dy, dx);
                    const targetX = circle.x + Math.cos(angle) * minDistance;
                    const targetY = circle.y + Math.sin(angle) * minDistance;
                    const ax = (targetX - other.x) * 0.1;
                    const ay = (targetY - other.y) * 0.1;
                    
                    circle.vx -= ax;
                    circle.vy -= ay;
                    other.vx += ax;
                    other.vy += ay;
                    
                    // 碰撞倾斜
                    const impactTilt = ax * 0.02;
                    circle.tilt += impactTilt;
                    other.tilt -= impactTilt;
                }
            }
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.circles.forEach(circle => {
            const img = circle.filled ? this.lightOnImg : this.lightOffImg;
            
            if (img.complete && img.naturalHeight !== 0) {
                this.ctx.save();
                this.ctx.translate(circle.x, circle.y);
                this.ctx.rotate(circle.tilt);
                
                if (circle.filled) {
                    this.ctx.shadowColor = '#ffff00';
                    this.ctx.shadowBlur = 30;
                }
                
                this.ctx.drawImage(
                    img,
                    -circle.width / 2,
                    -circle.height / 2,
                    circle.width,
                    circle.height
                );
                
                this.ctx.restore();
            } else {
                // 占位圆圈
                this.ctx.beginPath();
                this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                
                if (circle.filled) {
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fill();
                    this.ctx.shadowColor = '#ffff00';
                    this.ctx.shadowBlur = 15;
                } else {
                    this.ctx.strokeStyle = circle.color;
                    this.ctx.lineWidth = 3;
                    this.ctx.stroke();
                }
                
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.updatePhysics();
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    reset() {
        this.filledCircles = 0;
        this.initCircles();
    }
    
    destroy() {
        this.stopAnimation();
    }
}
