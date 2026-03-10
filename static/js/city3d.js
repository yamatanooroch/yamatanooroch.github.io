/**
 * Three.js 赛博朋克线框城市模块
 * 实现无限穿梭的霓虹建筑群效果
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class City3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.isActive = false;
        this.buildings = [];
        this.speed = 0.4; // 飞行速度
        this.animationId = null;

        // 鼠标视差偏移变量
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetCameraX = 0;
        this.targetCameraY = 15;

        this.init();
    }

    init() {
        // 1. 初始化场景
        this.scene = new THREE.Scene();
        // 添加深度雾效，让远处的建筑自然融入背景
        this.scene.fog = new THREE.FogExp2(0x111111, 0.006);

        // 2. 初始化相机
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 300);
        this.camera.position.set(0, 10, 60); // 降低相机高度，增强穿梭感
        this.camera.lookAt(0, 5, 0);

        // 3. 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比优化性能
        
        // 设置Canvas样式并插入DOM
        this.canvas = this.renderer.domElement;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none'; // 让底层的点击事件穿透
        this.container.insertBefore(this.canvas, this.container.firstChild);

        // 4. 创建场景内容
        this.createCity();

        // 5. 绑定事件
        this.bindEvents();
    }

    createCity() {
        const neonColor = 0x14ffeb;

        // ============ 地面网格 ============
        const gridHelper = new THREE.GridHelper(400, 40, neonColor, neonColor);
        gridHelper.position.y = 0;
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // ============ 建筑群 ============
        const buildingCount = 80; // 增加建筑数量
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
        // 建筑材质：黑色实体，稍微调亮一点避免纯黑，并加点反光感
        const darkMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x050505,
            emissive: 0x000000,
            specular: 0x111111,
            shininess: 10
        });
        
        // 边缘发光材质：青色线条
        // WebGL中LineBasicMaterial的linewidth大部分设备失效固定为1
        // 所以我们把 opacity 调高，并且去掉 transparent 让线条更实更粗壮在视觉上
        const neonMaterial = new THREE.LineBasicMaterial({ 
            color: neonColor, 
            transparent: false, 
            opacity: 1.0
        });

        // 为了让线框显得更粗，我们可以创建一个稍微放大一点的外发光线框
        const neonGlowMaterial = new THREE.LineBasicMaterial({ 
            color: neonColor, 
            transparent: true, 
            opacity: 0.3
        });

        // 预定义建筑的分布范围，扩展为全屏
        const spreadX = 250;
        const spreadZ = 250;

        // 添加一个全局的环境光，稍微照亮实体，让黑底边缘对比更明显
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        for (let i = 0; i < buildingCount; i++) {
            // 随机尺寸
            const width = Math.random() * 10 + 5;
            const height = Math.random() * 50 + 15;
            const depth = Math.random() * 10 + 5;

            const group = new THREE.Group();

            // 添加实体建筑
            const box = new THREE.Mesh(geometry, darkMaterial);
            box.scale.set(width, height, depth);
            box.position.y = height / 2;
            group.add(box);

            // 1. 添加主霓虹边缘线
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, neonMaterial);
            line.scale.set(width, height, depth);
            line.position.y = height / 2;
            group.add(line);
            
            // 2. 添加外发光线框（稍微放大1.02倍），在视觉上起到加粗的作用
            const glowLine = new THREE.LineSegments(edges, neonGlowMaterial);
            glowLine.scale.set(width * 1.02, height * 1.01, depth * 1.02);
            glowLine.position.y = height / 2;
            group.add(glowLine);

            // 随机位置（全屏散布，中间留出"峡谷"通道给信息面板）
            let posX = (Math.random() - 0.5) * spreadX;
            
            // 扩大中间的空隙，避免建筑挡住居中的文字面板
            if (Math.abs(posX) < 30) {
                posX = posX > 0 ? posX + 30 : posX - 30;
            }
            
            group.position.x = posX;
            group.position.z = -Math.random() * spreadZ; // 散布在摄像机前方

            this.scene.add(group);
            this.buildings.push({
                mesh: group,
                zOffset: group.position.z
            });
        }
    }

    bindEvents() {
        // 窗口大小适配
        window.addEventListener('resize', () => {
            if (!this.container) return;
            // 因为现在是全屏，直接使用 window 的宽高
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });

        // 监听鼠标移动（视差效果）
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;
            
            // 将鼠标坐标归一化到 -1 到 +1 之间
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // 限制摄像机偏移范围
            this.targetCameraX = this.mouseX * 15;
            this.targetCameraY = 15 + this.mouseY * 5;
        });

        // 监听页面切换事件（性能优化：只在当前页渲染）
        window.addEventListener('pageChange', (e) => {
            if (e.detail.sectionClass === 'contact-section') {
                if (!this.isActive) {
                    this.isActive = true;
                    // 如果初次加载，强制重置一下尺寸为全屏
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                    this.startAnimation();
                }
            } else {
                this.stopAnimation();
            }
        });
        
        // 初始化时，如果是刷新在第一页，默认为非激活，但如果刚好在第三页（刷新后），触发一下
        // 我们通过 setTimeout 保证在 pageTransition 之后判断
        setTimeout(() => {
            const contactSection = document.querySelector('.contact-section');
            if (contactSection && contactSection.style.visibility !== 'hidden') {
                this.isActive = true;
                this.startAnimation();
            }
        }, 100);
    }

    startAnimation() {
        if (this.animationId) return;
        
        const animate = () => {
            if (!this.isActive) {
                this.animationId = null;
                return;
            }

            // 1. 摄像机平滑跟随鼠标（视差效果）
            this.camera.position.x += (this.targetCameraX - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 5, 0);

            // 2. 建筑移动逻辑（无限穿梭）
            this.buildings.forEach(b => {
                b.mesh.position.z += this.speed;
                
                // 如果建筑跑到摄像机后方，则重置到最远端
                if (b.mesh.position.z > 60) {
                    b.mesh.position.z = -140;
                }
            });

            this.renderer.render(this.scene, this.camera);
            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stopAnimation() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}