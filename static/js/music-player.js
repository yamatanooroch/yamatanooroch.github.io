/**
 * 音乐播放器模块
 * 支持点击静音、长按调节音量、键盘控制
 */

let audio;
let volumeBtn;
let volumeBar;
let volumeContainer;
let throwTimer = null;
let throwStart = 0;
const maxThrowTime = 2000;
const minVolume = 0.0;
const maxVolume = 1.0;
const defaultVolume = 0.2;
let isLongPress = false;
const longPressThreshold = 200;
let longPressTimeout = null;
let hasStarted = false;
let currentVolume = defaultVolume;
let isPressing = false; // 追踪是否从音量按钮开始按下

function setupMusicPlayer() {
    audio = document.getElementById('main-audio');
    volumeBtn = document.getElementById('volume-btn');
    volumeBar = document.getElementById('volume-bar');
    volumeContainer = volumeBar?.parentElement;
    
    if (!audio || !volumeBtn || !volumeBar) return;

    // 设置初始音量
    audio.playbackRate = 1.0;
    audio.volume = defaultVolume;
    audio.loop = true;
    currentVolume = defaultVolume;
    updateVolumeUI(currentVolume);

    // 用户首次交互后播放
    function startAudio() {
        if (!hasStarted) {
            audio.play().catch(() => { });
            hasStarted = true;
        }
    }
    document.body.addEventListener('mousedown', startAudio, { once: true });
    document.body.addEventListener('touchstart', startAudio, { once: true });
    document.body.addEventListener('keydown', startAudio, { once: true });

    // 鼠标事件
    volumeBtn.addEventListener('mousedown', handlePressStart);
    document.addEventListener('mouseup', handlePressEnd);
    
    // 触摸事件
    volumeBtn.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handlePressEnd);

    // 键盘支持
    volumeBtn.addEventListener('keydown', handleKeydown);

    // 悬停提示
    const volumeTip = document.getElementById('volume-tip');
    volumeBtn.addEventListener('mouseenter', () => {
        if (volumeTip) volumeTip.style.display = 'block';
    });
    volumeBtn.addEventListener('mouseleave', () => {
        if (volumeTip) volumeTip.style.display = 'none';
    });
    volumeBtn.addEventListener('focus', () => {
        if (volumeTip) volumeTip.style.display = 'block';
    });
    volumeBtn.addEventListener('blur', () => {
        if (volumeTip) volumeTip.style.display = 'none';
    });
}

function handleTouchStart(e) {
    e.preventDefault();
    handlePressStart(e);
}

function handlePressStart(e) {
    isPressing = true; // 标记从音量按钮开始按下
    isLongPress = false;
    throwStart = Date.now();
    
    longPressTimeout = setTimeout(() => {
        isLongPress = true;
        // 重置开始时间，从长按确认时开始计算
        throwStart = Date.now();
        // 禁用进度条transition以实现实时更新
        volumeBar.style.transition = 'none';
        
        // 使用 requestAnimationFrame 替代 setInterval，更流畅
        function updateVolume() {
            if (!isLongPress) return;
            
            let t = Date.now() - throwStart;
            t = Math.min(t, maxThrowTime);
            currentVolume = minVolume + (maxVolume - minVolume) * (t / maxThrowTime);
            audio.volume = currentVolume;
            updateVolumeUI(currentVolume);
            updateButtonIcon(false);
            
            if (t < maxThrowTime) {
                throwTimer = requestAnimationFrame(updateVolume);
            }
        }
        throwTimer = requestAnimationFrame(updateVolume);
    }, longPressThreshold);
}

function handlePressEnd() {
    // 只有从音量按钮开始按下时才处理
    if (!isPressing) return;
    
    isPressing = false; // 重置标志
    clearTimeout(longPressTimeout);
    
    // 取消动画帧
    if (throwTimer) {
        cancelAnimationFrame(throwTimer);
        throwTimer = null;
    }
    
    // 恢复进度条transition
    if (volumeBar) {
        volumeBar.style.transition = 'width 0.1s';
    }
    
    if (!isLongPress) {
        // 短按切换静音
        if (audio.volume > 0) {
            audio.volume = minVolume;
            updateVolumeUI(0);
            updateButtonIcon(true);
        } else {
            audio.volume = currentVolume || defaultVolume;
            updateVolumeUI(currentVolume || defaultVolume);
            updateButtonIcon(false);
        }
    }
}

function handleKeydown(e) {
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
            e.preventDefault();
            adjustVolume(0.1);
            break;
        case 'ArrowDown':
        case 'ArrowLeft':
            e.preventDefault();
            adjustVolume(-0.1);
            break;
        case ' ':
        case 'Enter':
            e.preventDefault();
            toggleMute();
            break;
        case 'm':
        case 'M':
            e.preventDefault();
            toggleMute();
            break;
    }
}

function adjustVolume(delta) {
    currentVolume = Math.max(minVolume, Math.min(maxVolume, currentVolume + delta));
    audio.volume = currentVolume;
    updateVolumeUI(currentVolume);
    updateButtonIcon(currentVolume === 0);
    
    // 更新ARIA属性
    if (volumeContainer) {
        volumeContainer.setAttribute('aria-valuenow', Math.round(currentVolume * 100));
    }
}

function toggleMute() {
    if (audio.volume > 0) {
        audio.volume = 0;
        updateVolumeUI(0);
        updateButtonIcon(true);
    } else {
        audio.volume = currentVolume || defaultVolume;
        updateVolumeUI(currentVolume || defaultVolume);
        updateButtonIcon(false);
    }
}

function updateVolumeUI(volume) {
    volumeBar.style.width = (volume * 100) + '%';
    if (volumeContainer) {
        volumeContainer.setAttribute('aria-valuenow', Math.round(volume * 100));
    }
}

function updateButtonIcon(isMuted) {
    const iconSpan = volumeBtn.querySelector('span[aria-hidden]');
    if (iconSpan) {
        iconSpan.textContent = isMuted ? '🔇' : '🔊';
    }
    volumeBtn.setAttribute('aria-label', isMuted ? '已静音 - 点击或按空格取消静音' : '音量控制 - 点击静音，方向键调节音量');
}

document.addEventListener('DOMContentLoaded', setupMusicPlayer);
