/**
 * Photos Gallery 交互逻辑
 * 处理瀑布流图片加载、故障艺术绑定与 3D Lightbox 模态框的开闭
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== 爱心代码雨背景 ====================
    initMatrixHeartBg();

    const galleryContainer = document.getElementById('galleryContainer');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop');
    const closeBtn = document.getElementById('closeBtn');
    const lightboxImage = document.getElementById('lightboxImage');
    const imageWrapper = document.getElementById('imageWrapper');

    // 1. 生成占位图片库（模拟不同比例的图片，展示瀑布流不裁剪的特性）
    // 在实际使用中，你可以将这些 URL 替换为自己的图片路径
    const photoData = [
        { width: 800, height: 1200, seed: '10' }, // 竖图
        { width: 1000, height: 600, seed: '20' }, // 横图
        { width: 800, height: 800, seed: '33' },  // 方图
        { width: 600, height: 900, seed: '45' },  // 竖图
        { width: 1200, height: 800, seed: '58' }, // 横图
        { width: 700, height: 1000, seed: '62' }, // 竖图
        { width: 900, height: 600, seed: '77' },  // 横图
        { width: 800, height: 1100, seed: '88' }, // 竖图
        { width: 1000, height: 1000, seed: '99' },// 方图
    ];

    function renderGallery() {
        photoData.forEach(data => {
            // 使用 picsum 提供随机但固定 seed 的高质量图片作为占位
            const imgSrc = `https://picsum.photos/seed/${data.seed}/${data.width}/${data.height}`;
            
            // 最外层容器：负责卡片样式和滚动动画
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            // 内部容器：负责图片的 Glitch 故障效果
            const inner = document.createElement('div');
            inner.className = 'item-inner';
            inner.style.backgroundImage = `url(${imgSrc})`;
            
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = 'Gallery Image';
            img.loading = 'lazy'; // 懒加载优化性能
            
            inner.appendChild(img);
            item.appendChild(inner);
            
            // 绑定点击事件，打开大图
            item.addEventListener('click', () => openLightbox(imgSrc));
            
            galleryContainer.appendChild(item);
        });
        
        // 绑定滚动观察器
        initScrollReveal();
    }

    // 2. 初始化滚动出现动画 (Scroll Reveal)
    function initScrollReveal() {
        const items = document.querySelectorAll('.gallery-item');
        
        // 配置 IntersectionObserver
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // 当卡片进入视口底部50px时触发
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 稍微加一点随机延迟，让同时出现的图片错开
                    setTimeout(() => {
                        entry.target.classList.add('reveal-visible');
                    }, Math.random() * 150);
                    // 触发后取消观察，保证性能
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        items.forEach(item => observer.observe(item));
    }

    // 3. 打开 3D Lightbox
    function openLightbox(src) {
        // 先移除可能存在的关闭动画类
        lightboxModal.classList.remove('closing');
        
        // 设置大图源
        lightboxImage.src = src;
        
        // 激活模态框（触发 flipIn 动画）
        lightboxModal.classList.add('active');
        
        // 锁定背景滚动
        document.body.style.overflow = 'hidden';
    }

    // 3. 关闭 3D Lightbox
    function closeLightbox() {
        if (!lightboxModal.classList.contains('active')) return;
        
        // 添加关闭类（触发 flipOut 动画）
        lightboxModal.classList.add('closing');
        
        // 监听动画结束事件，彻底隐藏模态框
        imageWrapper.addEventListener('animationend', function handler() {
            lightboxModal.classList.remove('active');
            lightboxModal.classList.remove('closing');
            lightboxImage.src = ''; // 清空图片源
            document.body.style.overflow = ''; // 恢复背景滚动
            imageWrapper.removeEventListener('animationend', handler);
        });
    }

    // 绑定关闭事件
    closeBtn.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);
    
    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // 执行渲染
    renderGallery();
});

// ==================== 爱心代码雨动画引擎 ====================
function initMatrixHeartBg() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 自适应全屏
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 爱心代码内容池：数学方程 + 符号 + 二进制
    const heartEquation = "(x²+y²-1)³-x²y³=0";
    const symbols = "♥❤♡01";
    // 将字符串转为字符数组
    const charArray = (heartEquation + symbols).split("");

    const fontSize = 18; // 稍微增大字体
    const columnSpacing = 50; // 列距变宽，使代码稀疏
    let columns = canvas.width / columnSpacing;
    
    // 存储每一列当前的Y轴位置
    const drops = [];
    for (let x = 0; x < columns; x++) {
        // 增加初始负数范围，让下落更分散不拥挤
        drops[x] = Math.random() * -150;
    }

    function drawMatrix() {
        // 更新列数以防屏幕缩放后变形
        columns = canvas.width / columnSpacing;
        while(drops.length < columns) drops.push(Math.random() * -150);

        // 绘制带透明度的黑色矩形，覆盖上一帧，形成拖尾渐隐效果
        ctx.fillStyle = "rgba(5, 5, 5, 0.15)"; // 稍微加深透明度，缩短拖尾
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + "px 'Courier New', monospace";

        // 遍历每一列
        for (let i = 0; i < drops.length; i++) {
            // 随机选取一个字符
            const text = charArray[Math.floor(Math.random() * charArray.length)];

            // 头部的字为白色/高亮青色，尾部的字为标准青色
            const isHead = Math.random() > 0.95;
            ctx.fillStyle = isHead ? "#ffffff" : "#14ffeb";
            
            // 如果是爱心符号，有几率变成品红或保持青色
            if ((text === '♥' || text === '❤') && Math.random() > 0.5) {
                ctx.fillStyle = "#ff00ff";
            }

            // 绘制文字 (X坐标使用 columnSpacing)
            ctx.fillText(text, i * columnSpacing, drops[i] * fontSize);

            // 当下落到屏幕底部且满足随机条件时，将这列重置到顶部
            // 增加重置条件概率，让部分雨滴流到一半或者在底部更久才重置，制造稀疏感
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
                drops[i] = Math.random() * -50; // 重置时带上负向随机，错开下落节奏
            }

            // Y坐标增加
            drops[i]++;
        }
    }

    // 控制帧率，不需要跑到 60fps，约 30fps 会更有代码跳动的复古感
    setInterval(drawMatrix, 40);
}