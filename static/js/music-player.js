// 音乐播放与音量调节逻辑
let audio;
let volumeBtn;
let volumeBar;
let throwTimer = null;
let throwStart = 0;
let maxThrowTime = 2000; // 最大投掷时间（毫秒）
let minVolume = 0.0;
let maxVolume = 1.0;
let defaultVolume = 0.2;
let isLongPress = false;
let longPressThreshold = 200; // 超过200ms判定为长按
let longPressTimeout = null;
let hasStarted = false;

function setupMusicPlayer() {
    audio = document.getElementById('main-audio');
    volumeBtn = document.getElementById('volume-btn');
    volumeBar = document.getElementById('volume-bar');
    if (!audio || !volumeBtn || !volumeBar) return;

    // 设置初始音量为0.2，避免无声
    audio.playbackRate = 1.0;
    audio.volume = defaultVolume;
    audio.loop = true;
    volumeBar.style.width = (audio.volume * 100) + '%';

    // 用户首次交互后强制播放
    function startAudio() {
        if (!hasStarted) {
            audio.play().catch(() => { });
            hasStarted = true;
        }
    }
    document.body.addEventListener('mousedown', startAudio, { once: true });
    document.body.addEventListener('touchstart', startAudio, { once: true });

    // 音量键仅支持长按调节，点击即静音
    volumeBtn.addEventListener('mousedown', function (e) {
        isLongPress = false;
        throwStart = Date.now();
        longPressTimeout = setTimeout(() => {
            isLongPress = true;
            throwTimer = setInterval(() => {
                let t = Date.now() - throwStart;
                t = Math.min(t, maxThrowTime);
                let v = minVolume + (maxVolume - minVolume) * (t / maxThrowTime);
                audio.volume = v;
                volumeBar.style.width = (v * 100) + '%';
            }, 16);
        }, longPressThreshold);
    });
    document.addEventListener('mouseup', function (e) {
        clearTimeout(longPressTimeout);
        if (throwTimer) {
            clearInterval(throwTimer);
            throwTimer = null;
        }
        if (!isLongPress) {
            // 点击即静音
            audio.volume = minVolume;
            volumeBar.style.width = '0%';
        }
    });

    // 悬停提示文字
    const volumeTip = document.getElementById('volume-tip');
    volumeBtn.addEventListener('mouseenter', function () {
        if (volumeTip) volumeTip.style.display = 'block';
    });
    volumeBtn.addEventListener('mouseleave', function () {
        if (volumeTip) volumeTip.style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', setupMusicPlayer);
