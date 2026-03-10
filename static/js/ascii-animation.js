/**
 * ASCII动画模块
 * 将GIF转换为ASCII字符艺术动画
 */

export class AsciiAnimation {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Container element with id "${containerId}" not found`);
            return;
        }
        
        this.gifUrl = options.gifUrl || 'imerge/head.gif';
        this.scaleNums = options.scale || 2;
        this.frameDelay = options.frameDelay || 80;
        this.color = options.color || '#14ffeb';
        
        this.texts = [];
        this.currentIndex = 0;
        this.animationInterval = null;
        
        this.init();
    }
    
    async init() {
        this.setupContainerStyles();
        await this.loadGifAndConvert();
        this.startAnimation();
    }
    
    setupContainerStyles() {
        Object.assign(this.container.style, {
            color: this.color,
            fontFamily: 'monospace',
            fontSize: '8px',
            lineHeight: '1.0',
            margin: '0',
            padding: '0',
            textAlign: 'center',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'pre',
            overflow: 'hidden'
        });
    }
    
    async loadGifAndConvert() {
        try {
            // 动态导入 gifuct-js
            const { parseGIF, decompressFrames } = await import('https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm');
            
            const response = await fetch(this.gifUrl);
            const buffer = await response.arrayBuffer();
            const gif = parseGIF(buffer);
            const frames = decompressFrames(gif, true);
            
            this.texts = frames.map(frame => {
                const canvas = document.createElement('canvas');
                canvas.width = frame.dims.width;
                canvas.height = frame.dims.height;
                const ctx = canvas.getContext('2d');
                const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);
                ctx.putImageData(imageData, 0, 0);
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                return this.createAsciiText(data, canvas.width, canvas.height);
            });
        } catch (error) {
            console.error('Error loading GIF:', error);
            this.container.textContent = 'Error loading animation';
        }
    }
    
    createAsciiText(data, width, height) {
        const levels = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", ".", " "];
        let text = "";
        
        for (let y = 0; y < height; y += this.scaleNums) {
            let row = "";
            for (let x = 0; x < width; x += this.scaleNums) {
                const i = (y * width + x) * 4;
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const levelIndex = Math.floor(avg / 255 * (levels.length - 1));
                row += levels[levelIndex];
            }
            text += row + "\n";
        }
        
        return text;
    }
    
    startAnimation() {
        if (this.texts.length === 0) return;
        
        this.animationInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.texts.length;
            this.container.textContent = this.texts[this.currentIndex];
        }, this.frameDelay);
    }
    
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
    
    destroy() {
        this.stopAnimation();
    }
}
