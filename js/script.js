// script.js - 完整修改版

// 音乐播放器功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const vinylDisc = document.getElementById('vinyl-disc');
    const turntableArm = document.getElementById('turntable-arm');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressIndicator = document.getElementById('progress-indicator');
    const progressSlider = document.getElementById('progress-slider');
    const timeBar = document.getElementById('time-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const speedBtn = document.getElementById('speed-btn');
    const speedDisplay = document.getElementById('speed-display');
    const speedOptions = document.getElementById('speed-options');
    const volumeToggle = document.getElementById('volume-toggle');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const playlistToggleBtn = document.getElementById('playlist-toggle-btn');
    const playlistOverlay = document.getElementById('playlist-overlay');
    const closePlaylistBtn = document.getElementById('close-playlist');
    const clearPlaylistBtn = document.getElementById('clear-playlist');
    const playlistItems = document.getElementById('playlist-items');
    const playlistCount = document.getElementById('playlist-count');
    
    // 歌曲信息DOM元素
    const centerLabel = document.getElementById('center-label');
    const albumCover = document.getElementById('album-cover');
    const songTag = document.getElementById('song-tag');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const artistDesc = document.getElementById('artist-desc');
    const playCount = document.getElementById('play-count');
    const likeCount = document.getElementById('like-count');
    const commentCount = document.getElementById('comment-count');
    const albumName = document.getElementById('album-name');
    const releaseDate = document.getElementById('release-date');
    const songDurationEl = document.getElementById('song-duration');
    
    // 完整的歌曲数据
    const songsData = [
        { 
            id: 1, 
            title: "洛春赋", 
            artist: "云汐", 
            artistDesc: "原创音乐人 · 古风歌手",
            album: "古风精选集",
            releaseDate: "2023-05-20",
            duration: "03:11",
            durationSeconds: 191,
            cover: "js/photo1.avif",
            audioUrl: "js/洛春赋.mp3",
            playCount: "1,234,567",
            likeCount: "89,123",
            commentCount: "2,345",
            tag: "单曲",
            centerChar: "洛",
            active: true
        },
        { 
            id: 2, 
            title: "江南烟雨", 
            artist: "夏婉安", 
            artistDesc: "原创音乐人 · 国风创作",
            album: "烟雨江南",
            releaseDate: "2023-03-15",
            duration: "03:45",
            durationSeconds: 225,
            cover: "js/photo2.avif",
            audioUrl: "js/江南烟雨.mp3",
            playCount: "987,654",
            likeCount: "76,543",
            commentCount: "1,987",
            tag: "热门",
            centerChar: "江"
        },
        { 
            id: 3, 
            title: "山水之间", 
            artist: "许嵩", 
            artistDesc: "原创音乐人 · 山水诗人",
            album: "山水意境",
            releaseDate: "2023-07-22",
            duration: "04:35",
            durationSeconds: 275,
            cover: "js/photo3.avif",
            audioUrl: "js/山水之间.mp3",
            playCount: "876,543",
            likeCount: "65,432",
            commentCount: "1,765",
            tag: "推荐",
            centerChar: "山"
        }
    ];
    
    // 播放器状态
    let isPlaying = false;
    let currentSongIndex = 0;
    let currentRotation = 0;
    let rotationAnimation = null;
    let isPlaylistVisible = false;
    let currentPlaybackRate = 1.0;
    let totalDuration = songsData[0].durationSeconds;
    let isDraggingProgress = false;
    let isRepeat = false;
    let isShuffle = false;
    let currentVolume = 0.8;
    
    // 黑胶旋转速度（匀速）
    const ROTATION_SPEED = 0.1; // 每毫秒旋转角度
    let lastRotationTime = 0;
    
    // 初始化播放器
    function initPlayer() {
        // 渲染播放列表
        renderPlaylist();
        
        // 初始化第一首歌
        updateSongInfo(currentSongIndex);
        
        // 设置初始背景
        updateBackgroundImage(songsData[currentSongIndex].cover);
        
        // 设置音频总时长
        audioPlayer.addEventListener('loadedmetadata', function() {
            totalDuration = audioPlayer.duration || songsData[currentSongIndex].durationSeconds;
            totalTimeEl.textContent = formatTime(totalDuration);
        });
        
        // 设置初始播放时间
        updateCurrentTime(4);
        
        // 设置进度条初始位置
        const initialPercent = (4 / totalDuration) * 100;
        updateProgressBar(initialPercent);
        progressSlider.value = initialPercent;
        
        // 设置初始音量
        audioPlayer.volume = currentVolume;
        volumeSlider.value = currentVolume * 100;
        
        // 音频加载错误处理
        audioPlayer.addEventListener('error', function() {
            console.error('音频加载失败:', audioPlayer.src);
            
            // 重置播放状态
            isPlaying = false;
            playIcon.className = "fas fa-play";
            playBtn.title = "播放";
            turntableArm.classList.remove('playing');
            stopRotation();
        });
        
        // 事件监听
        playBtn.addEventListener('click', togglePlay);
        vinylDisc.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);
        repeatBtn.addEventListener('click', toggleRepeat);
        shuffleBtn.addEventListener('click', toggleShuffle);
        
        // 进度条事件 - 点击选择位置
        timeBar.addEventListener('click', handleTimeBarClick);
        progressSlider.addEventListener('input', handleProgressSliderInput);
        progressSlider.addEventListener('change', handleProgressSliderChange);
        
        // 时间条拖拽事件
        timeBar.addEventListener('mousedown', startDragProgress);
        timeBar.addEventListener('touchstart', startDragProgress);
        
        // 倍速控制事件
        speedBtn.addEventListener('click', toggleSpeedOptions);
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', function() {
                const speed = parseFloat(this.dataset.speed);
                setPlaybackSpeed(speed);
                speedOptions.style.display = 'none';
            });
        });
        
        // 音量控制事件
        volumeToggle.addEventListener('click', toggleMute);
        volumeSlider.addEventListener('input', updateVolume);
        
        // 播放列表事件
        playlistToggleBtn.addEventListener('click', showPlaylist);
        closePlaylistBtn.addEventListener('click', hidePlaylist);
        clearPlaylistBtn.addEventListener('click', clearPlaylist);
        
        // 点击播放列表外部区域关闭播放列表
        playlistOverlay.addEventListener('click', function(event) {
            if (event.target === playlistOverlay) {
                hidePlaylist();
            }
        });
        
        // 点击倍速选项外部关闭倍速菜单
        document.addEventListener('click', function(event) {
            if (!speedBtn.contains(event.target) && !speedOptions.contains(event.target)) {
                speedOptions.style.display = 'none';
            }
        });
        
        // 音频事件
        audioPlayer.addEventListener('timeupdate', updateProgressFromAudio);
        audioPlayer.addEventListener('ended', handleSongEnd);
        
        // 初始化唱针位置
        turntableArm.classList.remove('playing');
        
        // 初始化播放速度
        setPlaybackSpeed(1.0);
        audioPlayer.playbackRate = currentPlaybackRate;
    }
    
    // 渲染播放列表
    function renderPlaylist() {
        playlistItems.innerHTML = '';
        
        songsData.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = `playlist-item ${song.active ? 'active' : ''}`;
            li.dataset.index = index;
            
            li.innerHTML = `
                <div class="song-info">
                    <div class="song-cover">
                        <img src="${song.cover}" alt="${song.title}">
                    </div>
                    <div class="song-details">
                        <div class="song-name">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <span class="song-duration">${song.duration}</span>
            `;
            
            li.addEventListener('click', function() {
                selectSong(index);
            });
            
            playlistItems.appendChild(li);
        });
        
        // 更新播放列表计数
        playlistCount.textContent = `共${songsData.length}首歌曲`;
    }
    
    // 更新歌曲信息
    function updateSongInfo(index) {
        const song = songsData[index];
        
        // 更新唱片相关信息
        centerLabel.textContent = song.centerChar;
        albumCover.src = song.cover;
        albumCover.alt = `${song.title}专辑封面`;
        
        // 更新歌曲信息
        songTag.textContent = song.tag;
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        artistDesc.textContent = song.artistDesc;
        
        // 更新统计数据
        playCount.textContent = song.playCount;
        likeCount.textContent = song.likeCount;
        commentCount.textContent = song.commentCount;
        
        // 更新元数据
        albumName.textContent = song.album;
        releaseDate.textContent = song.releaseDate;
        songDurationEl.textContent = song.duration;
        totalTimeEl.textContent = song.duration;
        
        // 更新背景图片
        updateBackgroundImage(song.cover);
        
        // 重置播放状态
        isPlaying = false;
        playIcon.className = "fas fa-play";
        playBtn.title = "播放";
        turntableArm.classList.remove('playing');
        stopRotation();
        
        // 重置进度条
        updateCurrentTime(4);
        const initialPercent = (4 / totalDuration) * 100;
        updateProgressBar(initialPercent);
        progressSlider.value = initialPercent;
        
        // 设置音频源并加载
        audioPlayer.src = song.audioUrl;
        audioPlayer.load();
        totalDuration = song.durationSeconds;
        
        // 重置唱片旋转
        currentRotation = 0;
        vinylDisc.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
    }
    
    // 更新背景图片
    function updateBackgroundImage(imageUrl) {
        // 创建新的背景图片
        const newBackground = new Image();
        newBackground.src = imageUrl;
        
        // 图片加载完成后应用
        newBackground.onload = function() {
            // 创建淡入淡出效果
            document.body.style.opacity = '0.9';
            
            // 更新背景图片
            document.body.style.backgroundImage = `url('${imageUrl}')`;
            
            // 根据当前歌曲索引添加不同的类名
            document.body.classList.remove('playing-song-1', 'playing-song-2', 'playing-song-3');
            document.body.classList.add(`playing-song-${currentSongIndex + 1}`);
            
            // 恢复透明度
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 300);
        };
        
        // 如果图片加载失败，使用默认背景
        newBackground.onerror = function() {
            console.warn('背景图片加载失败，使用默认背景');
            document.body.style.backgroundImage = "url('js/photo1.avif')";
        };
    }
    
    // 显示播放列表
    function showPlaylist() {
        playlistOverlay.classList.add('show');
        isPlaylistVisible = true;
    }
    
    // 隐藏播放列表
    function hidePlaylist() {
        playlistOverlay.classList.remove('show');
        isPlaylistVisible = false;
    }
    
    // 清空播放列表
    function clearPlaylist() {
        if (confirm('确定要清空播放列表吗？')) {
            // 保留当前歌曲
            const currentSong = songsData[currentSongIndex];
            songsData.splice(0, songsData.length, currentSong);
            currentSongIndex = 0;
            renderPlaylist();
            updateSongInfo(currentSongIndex);
        }
    }
    
    // 处理进度条点击
    function handleTimeBarClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = timeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        const clampedPercent = Math.max(0, Math.min(100, percent));
        
        // 计算对应的时间
        const time = (clampedPercent / 100) * totalDuration;
        
        // 更新音频播放位置
        audioPlayer.currentTime = time;
        
        // 更新UI
        updateProgressBar(clampedPercent);
        progressSlider.value = clampedPercent;
        updateCurrentTime(time);
        
        // 更新唱片旋转位置（根据百分比）
        currentRotation = (clampedPercent / 100) * (360 * 3);
        vinylDisc.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
    }
    
    // 选择歌曲
    function selectSong(index) {
        // 如果正在播放，先停止
        if (isPlaying) {
            audioPlayer.pause();
            turntableArm.classList.remove('playing');
            stopRotation();
        }
        
        // 更新活动状态
        songsData.forEach((song, i) => {
            song.active = i === index;
        });
        
        // 更新当前播放索引
        currentSongIndex = index;
        
        // 更新UI
        const items = document.querySelectorAll('.playlist-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 更新所有歌曲信息
        updateSongInfo(index);
        
        // 播放歌曲
        setTimeout(() => {
            playSong();
        }, 100);
    }
    
    // 切换播放/暂停
    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }
    
    // 播放歌曲
    function playSong() {
        audioPlayer.play().then(() => {
            isPlaying = true;
            playIcon.className = "fas fa-pause";
            playBtn.title = "暂停";
            
            // 移动唱针到唱片位置
            turntableArm.classList.add('playing');
            
            // 开始唱片旋转（匀速）
            startRotation();
        }).catch(error => {
            console.error("播放失败:", error);
            isPlaying = false;
            playIcon.className = "fas fa-play";
            playBtn.title = "播放";
            turntableArm.classList.remove('playing');
        });
    }
    
    // 暂停歌曲
    function pauseSong() {
        audioPlayer.pause();
        isPlaying = false;
        playIcon.className = "fas fa-play";
        playBtn.title = "播放";
        
        // 移动唱针离开唱片
        turntableArm.classList.remove('playing');
        
        // 停止唱片旋转
        stopRotation();
    }
    
    // 开始唱片旋转（保持匀速）
    function startRotation() {
        if (rotationAnimation) {
            cancelAnimationFrame(rotationAnimation);
        }
        
        lastRotationTime = performance.now();
        
        function rotateDisc(timestamp) {
            if (!isPlaying) return;
            
            const deltaTime = timestamp - lastRotationTime;
            lastRotationTime = timestamp;
            
            // 匀速旋转，不受倍速影响
            currentRotation += ROTATION_SPEED * deltaTime;
            
            // 确保旋转角度在0-360度之间
            if (currentRotation >= 360) {
                currentRotation -= 360;
            }
            
            vinylDisc.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
            rotationAnimation = requestAnimationFrame(rotateDisc);
        }
        
        rotationAnimation = requestAnimationFrame(rotateDisc);
    }
    
    // 停止唱片旋转
    function stopRotation() {
        if (rotationAnimation) {
            cancelAnimationFrame(rotationAnimation);
            rotationAnimation = null;
        }
    }
    
    // 播放上一首
    function playPrevious() {
        if (isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * songsData.length);
            } while (newIndex === currentSongIndex && songsData.length > 1);
            currentSongIndex = newIndex;
        } else {
            currentSongIndex--;
            if (currentSongIndex < 0) {
                currentSongIndex = songsData.length - 1;
            }
        }
        selectSong(currentSongIndex);
    }
    
    // 播放下一首
    function playNext() {
        if (isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * songsData.length);
            } while (newIndex === currentSongIndex && songsData.length > 1);
            currentSongIndex = newIndex;
        } else {
            currentSongIndex++;
            if (currentSongIndex >= songsData.length) {
                currentSongIndex = 0;
            }
        }
        selectSong(currentSongIndex);
    }
    
    // 歌曲结束处理
    function handleSongEnd() {
        if (isRepeat) {
            selectSong(currentSongIndex);
        } else {
            playNext();
        }
    }
    
    // 切换循环模式
    function toggleRepeat() {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
        repeatBtn.title = isRepeat ? "取消循环" : "循环播放";
    }
    
    // 切换随机播放
    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.title = isShuffle ? "取消随机" : "随机播放";
    }
    
    // 处理进度条滑块输入
    function handleProgressSliderInput() {
        const percent = parseFloat(this.value);
        const time = (percent / 100) * totalDuration;
        
        // 更新UI
        updateProgressBar(percent);
        updateCurrentTime(time);
        
        // 更新唱片旋转位置
        currentRotation = (percent / 100) * (360 * 3);
        vinylDisc.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
    }
    
    // 处理进度条滑块改变（释放时）
    function handleProgressSliderChange() {
        const percent = parseFloat(this.value);
        const time = (percent / 100) * totalDuration;
        
        // 更新音频播放位置
        audioPlayer.currentTime = time;
    }
    
    // 开始拖拽进度条
    function startDragProgress(e) {
        e.preventDefault();
        isDraggingProgress = true;
        timeBar.classList.add('dragging');
        
        const rect = timeBar.getBoundingClientRect();
        let clientX;
        
        if (e.type === 'mousedown') {
            clientX = e.clientX;
        } else if (e.type === 'touchstart') {
            clientX = e.touches[0].clientX;
        }
        
        const percent = ((clientX - rect.left) / rect.width) * 100;
        const clampedPercent = Math.max(0, Math.min(100, percent));
        const time = (clampedPercent / 100) * totalDuration;
        
        // 更新UI
        updateProgressBar(clampedPercent);
        progressSlider.value = clampedPercent;
        updateCurrentTime(time);
        
        // 更新唱片旋转位置
        currentRotation = (clampedPercent / 100) * (360 * 3);
        vinylDisc.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
        
        const handleDragMove = (moveEvent) => {
            if (!isDraggingProgress) return;
            
            let moveClientX;
            if (moveEvent.type === 'mousemove') {
                moveClientX = moveEvent.clientX;
            } else if (moveEvent.type === 'touchmove') {
                moveClientX = moveEvent.touches[0].clientX;
            } else {
                return;
            }
            
            const movePercent = ((moveClientX - rect.left) / rect.width) * 100;
            const clampedMovePercent = Math.max(0, Math.min(100, movePercent));
            const moveTime = (clampedMovePercent / 100) * totalDuration;
            
            // 更新UI
            updateProgressBar(clampedMovePercent);
            progressSlider.value = clampedMovePercent;
            updateCurrentTime(moveTime);
            
            // 更新唱片旋转位置
            currentRotation = (clampedMovePercent / 100) * (360 * 3);
            vinylDisc.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
        };
        
        const handleDragEnd = () => {
            isDraggingProgress = false;
            timeBar.classList.remove('dragging');
            
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchend', handleDragEnd);
            
            // 更新音频播放位置
            const finalPercent = parseFloat(progressSlider.value);
            const finalTime = (finalPercent / 100) * totalDuration;
            audioPlayer.currentTime = finalTime;
        };
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);
    }
    
    // 更新进度条显示
    function updateProgressBar(percent) {
        progressBar.style.width = percent + "%";
        progressIndicator.style.left = percent + "%";
    }
    
    // 从音频更新进度
    function updateProgressFromAudio() {
        if (isDraggingProgress) return;
        
        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            
            // 更新进度条
            updateProgressBar(percent);
            progressSlider.value = percent;
            
            // 更新时间显示
            updateCurrentTime(audioPlayer.currentTime);
        }
    }
    
    // 更新当前时间显示
    function updateCurrentTime(seconds) {
        currentTimeEl.textContent = formatTime(seconds);
    }
    
    // 格式化时间
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 切换倍速选项显示
    function toggleSpeedOptions() {
        speedOptions.style.display = speedOptions.style.display === 'flex' ? 'none' : 'flex';
    }
    
    // 设置播放速度
    function setPlaybackSpeed(speed) {
        currentPlaybackRate = speed;
        speedDisplay.textContent = speed + "x";
        audioPlayer.playbackRate = speed;
        
        document.querySelectorAll('.speed-option').forEach(option => {
            if (parseFloat(option.dataset.speed) === speed) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    // 切换静音
    function toggleMute() {
        if (audioPlayer.volume > 0) {
            audioPlayer.volume = 0;
            volumeIcon.className = "fas fa-volume-mute";
            volumeSlider.value = 0;
        } else {
            audioPlayer.volume = currentVolume;
            volumeIcon.className = currentVolume > 0.5 ? "fas fa-volume-up" : "fas fa-volume-down";
            volumeSlider.value = currentVolume * 100;
        }
    }
    
    // 更新音量
    function updateVolume() {
        const volume = this.value / 100;
        audioPlayer.volume = volume;
        currentVolume = volume;
        
        if (volume === 0) {
            volumeIcon.className = "fas fa-volume-mute";
        } else if (volume <= 0.5) {
            volumeIcon.className = "fas fa-volume-down";
        } else {
            volumeIcon.className = "fas fa-volume-up";
        }
    }
    
    // 初始化播放器
    initPlayer();
});