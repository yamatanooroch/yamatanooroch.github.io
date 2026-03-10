/**
 * 鼠标跟随光效模块
 * 使用Canvas和径向渐变创建霓虹光效
 */

export class CanvasGlow {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas element with id "${canvasId}" not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.bindEvents();
        this.startAnimation();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // 触摸支持
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });
    }
    
    draw() {
        const { ctx, canvas, mouseX, mouseY } = this;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 主光斑
        const grad1 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 350);
        grad1.addColorStop(0, 'rgba(20,255,235,0.45)');
        grad1.addColorStop(1, 'rgba(20,255,235,0)');
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad1;
        ctx.fillRect(mouseX - 350, mouseY - 350, 700, 700);
        
        // 边缘光斑（对角位置）
        const cornerX = canvas.width - mouseX;
        const cornerY = canvas.height - mouseY;
        const grad2 = ctx.createRadialGradient(cornerX, cornerY, 0, cornerX, cornerY, 300);
        grad2.addColorStop(0, 'rgba(20,255,235,0.25)');
        grad2.addColorStop(1, 'rgba(20,255,235,0)');
        
        ctx.fillStyle = grad2;
        ctx.fillRect(cornerX - 300, cornerY - 300, 600, 600);
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    startAnimation() {
        const animate = () => {
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
    
    destroy() {
        this.stopAnimation();
    }
}
