// ---------- 宠物数据模型（不含购买日期）----------
let pets = [];
let currentPetId = null;        // 当前详情页展示的宠物id
let editPetId = null;           // 正在编辑的宠物id (null为新建)
let searchKeyword = '';

// ---------- 用户信息数据模型 ----------
let userProfile = {
    avatar: '🐻‍❄️',
    avatarType: 'emoji',
    nickname: '小熊饲养员'
};

function loadUserProfile() {
    const stored = localStorage.getItem('userProfile');
    if (stored) userProfile = JSON.parse(stored);
}

function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function updateProfileDisplay() {
    const avatarEl = document.getElementById('userAvatar');
    if (userProfile.avatarType === 'image') {
        avatarEl.innerHTML = `<img src="${userProfile.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
        avatarEl.innerText = userProfile.avatar;
    }
    document.getElementById('userName').innerText = userProfile.nickname;
}

// ---------- 消息通知设置数据模型 ----------
let notificationSettings = {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    doNotDisturb: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
    }
};

let systemMessages = [
    { id: 1, type: 'version', title: '版本更新', content: '绒熊时光 v2.0 已发布，新增日记功能、体重记录、用户信息编辑等众多新功能！', date: '2025-04-25', read: false },
    { id: 2, type: 'announcement', title: '系统公告', content: '感谢您使用绒熊时光，祝您和小熊生活愉快！如有问题请通过意见反馈联系我们。', date: '2025-04-15', read: true },
    { id: 3, type: 'notification', title: '饲养提醒', content: '记得给小熊换垫料哦~', date: '2025-04-20', read: true }
];

function loadNotificationSettings() {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) notificationSettings = JSON.parse(stored);
}

function saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
}

// ---------- 意见反馈数据模型 ----------
let feedbackList = [];
let feedbackImages = [];
let currentFeedbackCategory = 'bug';

const feedbackCategories = [
    { id: 'bug', label: 'Bug反馈', icon: '🐛' },
    { id: 'feature', label: '功能建议', icon: '💡' },
    { id: 'content', label: '内容建议', icon: '📝' },
    { id: 'ui', label: 'UI体验', icon: '🎨' },
    { id: 'other', label: '其他', icon: '💬' }
];

function loadFeedbackList() {
    const stored = localStorage.getItem('feedbackList');
    if (stored) feedbackList = JSON.parse(stored);
}

function saveFeedbackList() {
    localStorage.setItem('feedbackList', JSON.stringify(feedbackList));
}

// ---------- 邀请统计数据 ----------
let inviteStats = {
    count: 0,
    rewards: 0
};

function loadInviteStats() {
    const stored = localStorage.getItem('inviteStats');
    if (stored) inviteStats = JSON.parse(stored);
}

function saveInviteStats() {
    localStorage.setItem('inviteStats', JSON.stringify(inviteStats));
}

// 辅助函数：计算陪伴天数（基于到家日期，若死亡则截至死亡日期）
function calcCompanionDays(homeDateStr, deathDateStr) {
    if (!homeDateStr) return 0;
    const start = new Date(homeDateStr);
    const end = deathDateStr && deathDateStr.trim() ? new Date(deathDateStr) : new Date();
    if (isNaN(start)) return 0;
    const diffTime = end - start;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

// 渲染首页宠物列表
function renderPetList() {
    const container = document.getElementById('petListContainer');
    let filtered = pets.filter(p => p.name.includes(searchKeyword));
    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-result">🐾 没有找到叫这个名字的小熊，试试其他名字吧～</div>`;
        return;
    }
    let html = '';
    filtered.forEach(pet => {
        const days = calcCompanionDays(pet.homeDate, pet.deathDate);
        html += `<div class="pet-card" data-petid="${pet.id}">
                    <div class="pet-avatar">${pet.avatar || '🐹'}</div>
                    <div class="pet-info"><div class="pet-name">${pet.name} · ${pet.gender === '♂ 公' ? '♂' : '♀'}</div><div class="pet-days">🎂 已陪伴 ${days} 天</div></div>
                    <div style="color:#D9A13B;">›</div>
                </div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.pet-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = parseInt(card.getAttribute('data-petid'));
            showPetDetail(id);
        });
    });
}

// 显示宠物档案详情页
function showPetDetail(petId) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    currentPetId = petId;
    document.getElementById('detailAvatar').innerHTML = pet.avatar || '🐹';
    document.getElementById('detailName').innerText = pet.name;
    document.getElementById('detailGender').innerText = pet.gender;
    document.getElementById('detailBreed').innerText = pet.breed || '金丝熊';
    document.getElementById('detailBirth').innerText = pet.birthDate || '未填写';
    document.getElementById('detailDeath').innerText = (pet.deathDate && pet.deathDate.trim()) ? pet.deathDate : '至今';
    document.getElementById('detailHome').innerText = pet.homeDate || '未设置';
    const days = calcCompanionDays(pet.homeDate, pet.deathDate);
    document.getElementById('detailDays').innerHTML = `已陪伴 ${days} 天`;
    // 隐藏所有其他页面
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('petDetailPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
}

// 显示创建/编辑页 (mode: 'create' 或 'edit')
function showCreatePet(mode, petId = null) {
    editPetId = petId;
    const titleElem = document.getElementById('createTitle');
    if (mode === 'edit' && petId) {
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            titleElem.innerText = '编辑小熊档案';
            document.getElementById('petName').value = pet.name;
            document.getElementById('petGender').value = pet.gender;
            document.getElementById('petBreed').value = pet.breed || '';
            document.getElementById('birthDate').value = pet.birthDate || '';
            document.getElementById('deathDate').value = pet.deathDate || '';
            document.getElementById('homeDate').value = pet.homeDate || '';
            // 头像预选
            if (pet.avatar && !pet.avatar.startsWith('data:')) {
                selectAvatarEmoji(pet.avatar);
            } else if (pet.avatar && pet.avatar.startsWith('data:')) {
                document.getElementById('customAvatarPreview').innerHTML = `<img src="${pet.avatar}" class="preview-img">`;
            } else {
                selectAvatarEmoji('🐹');
            }
        }
    } else {
        titleElem.innerText = '创建小熊档案';
        document.getElementById('petName').value = '';
        document.getElementById('petGender').value = '♂ 公';
        document.getElementById('petBreed').value = '金丝熊';
        document.getElementById('birthDate').value = '';
        document.getElementById('deathDate').value = '';
        document.getElementById('homeDate').value = '';
        document.getElementById('customAvatarPreview').innerHTML = '';
        selectAvatarEmoji('🐹');
    }
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('createPetPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
}

let selectedAvatar = '🐹';
let uploadedImageBase64 = null;
function selectAvatarEmoji(emoji) {
    selectedAvatar = emoji;
    uploadedImageBase64 = null;
    document.getElementById('customAvatarPreview').innerHTML = '';
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-emoji') === emoji) opt.classList.add('selected');
    });
}
// 头像选择交互
document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
        selectAvatarEmoji(opt.getAttribute('data-emoji'));
    });
});
document.getElementById('triggerUpload').addEventListener('click', () => {
    document.getElementById('avatarUpload').click();
});
document.getElementById('avatarUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            uploadedImageBase64 = ev.target.result;
            selectedAvatar = null;
            document.getElementById('customAvatarPreview').innerHTML = `<img src="${uploadedImageBase64}" class="preview-img">`;
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
        };
        reader.readAsDataURL(file);
    }
});

function getCurrentAvatar() {
    if (uploadedImageBase64) return uploadedImageBase64;
    return selectedAvatar || '🐹';
}

function savePetFromForm() {
    const name = document.getElementById('petName').value.trim();
    if (!name) { showToast('请填写宠物昵称'); return; }
    if (name.length < 2 || name.length > 12) { showToast('昵称长度应为2-12个字符'); return; }

    const gender = document.getElementById('petGender').value;
    const breed = document.getElementById('petBreed').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const deathDate = document.getElementById('deathDate').value;
    const homeDate = document.getElementById('homeDate').value;

    if (!homeDate) { showToast('请填写到家日期'); return; }

    const today = new Date().toISOString().slice(0, 10);
    if (homeDate > today) { showToast('到家日期不能晚于今天'); return; }

    if (birthDate && deathDate && birthDate > deathDate) {
        showToast('出生日期不能晚于死亡日期');
        return;
    }

    const avatarFinal = getCurrentAvatar();
    if (editPetId !== null) {
        const idx = pets.findIndex(p => p.id === editPetId);
        if (idx !== -1) {
            pets[idx] = { ...pets[idx], name, gender, breed, birthDate, deathDate, homeDate, avatar: avatarFinal };
        }
    } else {
        const newId = Date.now();
        pets.push({ id: newId, name, gender, breed, birthDate, deathDate, homeDate, avatar: avatarFinal });
    }
    localStorage.setItem('petsData', JSON.stringify(pets));
    showToast('保存成功');
    renderPetList();
    showHome();
}

// 页面控制函数
function showHome() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('homePage').classList.add('active-page');
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('profilePage').classList.remove('active-page');
    document.getElementById('todoPage').style.display = 'none';
    document.getElementById('petDetailPage').style.display = 'none';
    document.getElementById('createPetPage').style.display = 'none';
    document.getElementById('diaryListPage').style.display = 'none';
    document.getElementById('diaryCreatePage').style.display = 'none';
    document.getElementById('weightPage').style.display = 'none';
    document.getElementById('notificationPage').style.display = 'none';
    document.getElementById('privacyPage').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'none';
    document.getElementById('feedbackPage').style.display = 'none';
    document.getElementById('invitePage').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'flex';
    renderPetList();
    updateActiveNav('home');
}
function showProfile() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('profilePage').style.display = 'block';
    document.getElementById('profilePage').classList.add('active-page');
    document.getElementById('homePage').classList.remove('active-page');
    document.getElementById('todoPage').style.display = 'none';
    document.getElementById('petDetailPage').style.display = 'none';
    document.getElementById('createPetPage').style.display = 'none';
    document.getElementById('diaryListPage').style.display = 'none';
    document.getElementById('diaryCreatePage').style.display = 'none';
    document.getElementById('weightPage').style.display = 'none';
    document.getElementById('notificationPage').style.display = 'none';
    document.getElementById('privacyPage').style.display = 'none';
    document.getElementById('aboutPage').style.display = 'none';
    document.getElementById('feedbackPage').style.display = 'none';
    document.getElementById('invitePage').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'flex';
    updateProfileDisplay();
    updateActiveNav('profile');
}

// ---------- 新增页面导航函数 ----------
function showNotificationPage() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('notificationPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
    updateNotificationUI();
    renderSystemMessages();
}

function showPrivacyPage() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('privacyPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
}

function showAboutPage() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('aboutPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
}

function showFeedbackPage() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('feedbackPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
    renderCategorySelector();
    renderFeedbackHistory();
}

function showInvitePage() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('invitePage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('inviteInviterName').innerText = userProfile.nickname;
    document.getElementById('inviteCount').innerText = inviteStats.count;
    document.getElementById('rewardCount').innerText = inviteStats.rewards;
    generateQRCode();
}
function updateActiveNav(active) { /*样式略*/ }

// ---------- Toast提示函数 ----------
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
}

// ---------- 新增辅助函数 ----------
function updateNotificationUI() {
    document.getElementById('notificationToggle').classList.toggle('active', notificationSettings.enabled);
    document.getElementById('soundToggle').classList.toggle('active', notificationSettings.soundEnabled);
    document.getElementById('vibrationToggle').classList.toggle('active', notificationSettings.vibrationEnabled);
    document.getElementById('dndToggle').classList.toggle('active', notificationSettings.doNotDisturb.enabled);
    document.getElementById('dndTimeSelector').style.display = notificationSettings.doNotDisturb.enabled ? 'block' : 'none';
    document.getElementById('dndStartTime').value = notificationSettings.doNotDisturb.startTime;
    document.getElementById('dndEndTime').value = notificationSettings.doNotDisturb.endTime;
    document.getElementById('notificationStatus').innerText = (notificationSettings.enabled ? '开' : '关') + ' ›';
}

function renderSystemMessages() {
    const container = document.getElementById('systemMessagesList');
    if (!container) return;
    if (systemMessages.length === 0) {
        container.innerHTML = '<div class="no-result">📭 暂无系统消息</div>';
        return;
    }
    let html = '';
    systemMessages.forEach(msg => {
        html += `<div class="message-card">
            <div class="message-header">
                <span class="message-title">${msg.title}${!msg.read ? '<span class="message-unread-dot"></span>' : ''}</span>
                <span class="message-date">${msg.date}</span>
            </div>
            <div class="message-content">${msg.content}</div>
        </div>`;
    });
    container.innerHTML = html;
}

function renderCategorySelector() {
    const container = document.getElementById('feedbackCategorySelector');
    let html = '';
    feedbackCategories.forEach((cat, idx) => {
        html += `<div class="category-option ${idx === 0 ? 'selected' : ''}" data-id="${cat.id}">${cat.icon} ${cat.label}</div>`;
    });
    container.innerHTML = html;
    currentFeedbackCategory = 'bug';
    container.querySelectorAll('.category-option').forEach(opt => {
        opt.addEventListener('click', () => {
            container.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            currentFeedbackCategory = opt.dataset.id;
        });
    });
}

function renderFeedbackImages() {
    const container = document.getElementById('feedbackImagePreview');
    container.innerHTML = '';
    feedbackImages.forEach((img, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        const imgEl = document.createElement('img');
        imgEl.src = img;
        const removeSpan = document.createElement('span');
        removeSpan.innerText = '✕';
        removeSpan.className = 'remove-img';
        removeSpan.onclick = (e) => {
            e.stopPropagation();
            feedbackImages.splice(idx, 1);
            renderFeedbackImages();
        };
        div.appendChild(imgEl);
        div.appendChild(removeSpan);
        container.appendChild(div);
    });
}

function renderFeedbackHistory() {
    const container = document.getElementById('feedbackHistoryList');
    if (feedbackList.length === 0) {
        container.innerHTML = '<div class="no-result">暂无反馈记录</div>';
        return;
    }
    let html = '';
    feedbackList.forEach(fb => {
        const cat = feedbackCategories.find(c => c.id === fb.category);
        const statusText = { pending: '待处理', processing: '处理中', resolved: '已解决' };
        html += `<div class="feedback-history-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>${cat ? cat.icon : ''} ${cat ? cat.label : fb.category}</span>
                <span class="feedback-status ${fb.status}">${statusText[fb.status]}</span>
            </div>
            <div style="font-size:13px; color:#3E2C1F;">${fb.description.substring(0, 50)}${fb.description.length > 50 ? '...' : ''}</div>
            <div style="font-size:12px; color:#B3A28E; margin-top:8px;">${new Date(fb.submitTime).toLocaleDateString()}</div>
        </div>`;
    });
    container.innerHTML = html;
}

function generateInviteCode() {
    return btoa(userProfile.nickname + Date.now()).substring(0, 8);
}

function generateQRCode() {
    const canvas = document.getElementById('inviteQRCanvas');
    const ctx = canvas.getContext('2d');
    const size = 90;
    ctx.clearRect(0, 0, size, size);

    // 简单的二维码模拟图案
    ctx.fillStyle = '#D9A13B';
    const moduleSize = 6;
    const margin = 6;

    // 绘制定位图案
    function drawFinderPattern(x, y) {
        ctx.fillRect(x, y, moduleSize * 3, moduleSize * 3);
        ctx.fillStyle = 'white';
        ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize, moduleSize);
        ctx.fillStyle = '#D9A13B';
    }

    drawFinderPattern(margin, margin);
    drawFinderPattern(size - margin - moduleSize * 3, margin);
    drawFinderPattern(margin, size - margin - moduleSize * 3);

    // 绘制随机数据模块
    const code = generateInviteCode();
    ctx.fillStyle = '#D9A13B';
    for (let i = 0; i < code.length; i++) {
        const x = margin + moduleSize * 4 + (i % 5) * moduleSize;
        const y = margin + moduleSize * 4 + Math.floor(i / 5) * moduleSize;
        if (code.charCodeAt(i) % 2 === 0) {
            ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1);
        }
    }

    // 添加更多随机模块
    for (let i = 0; i < 20; i++) {
        const x = margin + Math.floor(Math.random() * 10) * moduleSize;
        const y = margin + Math.floor(Math.random() * 10) * moduleSize;
        if (Math.random() > 0.5) {
            ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1);
        }
    }
}

function saveInviteCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 300, 400);
    gradient.addColorStop(0, '#D9A13B');
    gradient.addColorStop(1, '#E8B84A');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 300, 400, 24);
    ctx.fill();

    // 绘制标题
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px 微软雅黑';
    ctx.textAlign = 'center';
    ctx.fillText('绒熊时光', 150, 50);

    // 绘制logo
    ctx.font = '48px serif';
    ctx.fillText('🐻', 150, 110);

    // 绘制邀请文字
    ctx.font = 'bold 20px 微软雅黑';
    ctx.fillText('我的小熊在等我！', 150, 170);

    ctx.font = '14px 微软雅黑';
    ctx.fillText('来一起记录与毛孩子的美好时光吧~', 150, 200);

    ctx.font = '13px 微软雅黑';
    ctx.fillText(`${userProfile.nickname} 邀请你加入`, 150, 240);

    // 绘制二维码区域
    ctx.fillStyle = 'white';
    ctx.roundRect(100, 270, 100, 100, 12);
    ctx.fill();

    ctx.fillStyle = '#D9A13B';
    ctx.font = '12px 微软雅黑';
    ctx.fillText('扫码加入', 150, 325);

    // 导出图片
    const link = document.createElement('a');
    link.download = `绒熊时光_邀请海报.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('邀请卡片已保存');
}

// 初始化默认宠物（不含购买日期）
function initDefaultPets() {
    const stored = localStorage.getItem('petsData');
    if (stored) {
        pets = JSON.parse(stored);
    } else {
        pets = [
            { id: 1001, name: '团团', gender: '♂ 公', breed: '金丝熊', birthDate: '2023-12-01', deathDate: '', homeDate: '2024-01-15', avatar: '🐹' },
            { id: 1002, name: '圆圆', gender: '♀ 母', breed: '长毛金丝熊', birthDate: '2024-09-10', deathDate: '', homeDate: '2024-10-05', avatar: '🐻' }
        ];
    }
    renderPetList();
}

// ---------- 提醒模块（完整的新建提醒功能）----------
let todoList = [];
function getTodayStr() { return new Date().toISOString().slice(0,10); }
function getDaysUntilNext(lastDateStr, cycleType) {
    const last = new Date(lastDateStr);
    if (isNaN(last.getTime())) return 0;
    let next = new Date(last);
    if (cycleType === 'daily') next.setDate(last.getDate() + 1);
    else if (cycleType === 'weekly') next.setDate(last.getDate() + 7);
    else next.setDate(last.getDate() + 30);
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.ceil((next - today) / (1000*60*60*24));
}
function renderTodoList() {
    const container = document.getElementById('todoListContainer');
    if (!container) return;
    if (todoList.length === 0) {
        container.innerHTML = '<div class="empty-todo">✨ 暂无提醒事项<br>点击“新建提醒”添加饲养任务～</div>';
        updateHomeReminderPreview();
        return;
    }
    let html = '';
    todoList.forEach(todo => {
        const days = getDaysUntilNext(todo.lastCompleteDate, todo.cycleType);
        const status = days <= 0 ? 'overdue' : 'completed';
        let cycleDisplay = todo.cycleType === 'daily' ? '每天重复' : (todo.cycleType === 'weekly' ? '每周重复' : '每月重复');
        html += `<div class="todo-card" data-id="${todo.id}">
                    <div class="todo-card-header"><span class="todo-name">${escapeHtml(todo.name)}</span><span class="status-badge ${status}">${status === 'completed' ? '✔️ 待办' : '🔔 逾期'}</span></div>
                    <div class="todo-detail"><span class="todo-cycle">🔄 ${cycleDisplay}</span><span class="last-date">📅 上次完成: ${todo.lastCompleteDate}</span><span class="next-days">⏳ ${status === 'completed' ? `剩余${days}天` : `逾期 ${Math.abs(days)} 天`}</span></div>
                    <div class="todo-actions"><div class="action-btn complete" data-action="complete" data-id="${todo.id}">✅ 标记完成</div><div class="action-btn" data-action="edit" data-id="${todo.id}">✏️ 编辑</div><div class="action-btn delete" data-action="delete" data-id="${todo.id}">🗑️ 删除</div></div>
                </div>`;
    });
    container.innerHTML = html;
    updateHomeReminderPreview();
    container.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const id = parseInt(btn.getAttribute('data-id'));
            if (action === 'complete') markTodoComplete(id);
            else if (action === 'edit') openEditModal(id);
            else if (action === 'delete') if(confirm('确定删除？')) deleteTodoById(id);
        });
    });
}
function markTodoComplete(id) {
    const todo = todoList.find(t => t.id === id);
    if (todo) {
        todo.lastCompleteDate = getTodayStr();
        saveTodoList();
        renderTodoList();
    }
}
function deleteTodoById(id) {
    todoList = todoList.filter(t => t.id !== id);
    saveTodoList();
    renderTodoList();
}

function saveTodoList() {
    localStorage.setItem('todoListData', JSON.stringify(todoList));
}

function loadTodoList() {
    const stored = localStorage.getItem('todoListData');
    if (stored) todoList = JSON.parse(stored);
}
function openEditModal(id) { const todo=todoList.find(t=>t.id===id); if(todo){ editingTodoId=id; document.getElementById('modalTitle').innerText='编辑提醒'; document.getElementById('todoNameInput').value=todo.name; document.getElementById('cycleTypeSelect').value=todo.cycleType; document.getElementById('todoModal').classList.remove('hidden'); } }
let editingTodoId = null;
function addOrUpdateTodo(name, cycleType) {
    if (!name.trim()) return showToast('请填写提醒名称');
    if (editingTodoId) {
        const idx = todoList.findIndex(t => t.id === editingTodoId);
        if (idx !== -1) {
            todoList[idx].name = name.trim();
            todoList[idx].cycleType = cycleType;
            saveTodoList();
            renderTodoList();
        }
        editingTodoId = null;
    } else {
        todoList.push({ id: Date.now(), name: name.trim(), cycleType: cycleType, lastCompleteDate: getTodayStr() });
        saveTodoList();
        renderTodoList();
    }
    return true;
}
function updateHomeReminderPreview() {
    const previewSpan = document.getElementById('reminderPreviewText');
    const badgeSpan = document.getElementById('reminderBadge');
    if(!previewSpan) return;
    if(todoList.length===0){ previewSpan.innerText='暂无待办提醒，点击＋新建'; badgeSpan.innerText='0'; return; }
    let overdue=0, nearest=null, nearestDays=Infinity;
    todoList.forEach(t=>{ const d=getDaysUntilNext(t.lastCompleteDate,t.cycleType); if(d<=0) overdue++; else if(d<nearestDays){ nearestDays=d; nearest=t; } });
    if(overdue>0){ previewSpan.innerText=`⚠️ 有 ${overdue} 个提醒已逾期`; badgeSpan.innerText=overdue; }
    else if(nearest){ previewSpan.innerText=`${nearest.name} · 距下次还有${nearestDays}天`; badgeSpan.innerText='待办'; }
    else { previewSpan.innerText='所有任务已完成 🎉'; badgeSpan.innerText='0'; }
}
function escapeHtml(str) { return str.replace(/[&<>]/g,function(m){return m==='&'?'&amp;':m==='<'?'&lt;':'&gt;';}); }
function initDefaultTodos() {
    loadTodoList();
    if (todoList.length === 0) {
        const today = getTodayStr();
        const threeAgo = new Date();
        threeAgo.setDate(threeAgo.getDate() - 3);
        todoList = [
            { id: 1001, name: '换垫料', cycleType: 'weekly', lastCompleteDate: threeAgo.toISOString().slice(0, 10) },
            { id: 1002, name: '喂食营养糊', cycleType: 'daily', lastCompleteDate: today },
            { id: 1003, name: '体外驱虫', cycleType: 'monthly', lastCompleteDate: today }
        ];
        saveTodoList();
    }
    renderTodoList();
}

// ================= 新增日记功能 (完全不影响原有逻辑) =================
let diaries = [];   // { id, petId, date, content, images }
let editingDiaryId = null;
let currentDiaryPetFilter = null;
let tempImagesBase64 = [];

function loadDiaries() {
    const stored = localStorage.getItem('diariesData');
    if (stored) diaries = JSON.parse(stored);
    else {
        diaries = [
            { id: 10001, petId: 1001, date: '2025-03-10', content: '团团今天学会用滚轮啦，毛茸茸超可爱！', images: [] },
            { id: 10002, petId: 1001, date: '2025-03-15', content: '换新垫料，它兴奋得一直打滚', images: [] }
        ];
        saveDiariesToLocal();
    }
}
function saveDiariesToLocal() { localStorage.setItem('diariesData', JSON.stringify(diaries)); }
function renderDiaryList(petId) {
    currentDiaryPetFilter = petId;
    const pet = pets.find(p => p.id === petId);
    document.getElementById('diaryListTitle').innerHTML = `📔 ${pet ? pet.name : '小熊'}的日记`;
    const filtered = diaries.filter(d => d.petId === petId).sort((a,b) => new Date(b.date) - new Date(a.date));
    const container = document.getElementById('timelineContainer');
    if (filtered.length === 0) { container.innerHTML = '<div class="empty-diary">✨ 还没有日记，点击右上角“写日记”记录美好瞬间～</div>'; return; }
    const grouped = {};
    filtered.forEach(d => { const year = d.date.substring(0,4); if(!grouped[year]) grouped[year] = []; grouped[year].push(d); });
    let html = '';
    Object.keys(grouped).sort((a,b)=>b-a).forEach(year => {
        html += `<div class="timeline-year-group"><div class="year-title">📅 ${year}</div>`;
        grouped[year].forEach(diary => {
            html += `<div class="diary-card" data-diaryid="${diary.id}"><div class="diary-date-badge"><span>📆 ${diary.date}</span><span style="font-size:12px;">📖 回忆</span></div><div class="diary-content"><div class="diary-text">${escapeHtml(diary.content.substring(0,120))}${diary.content.length>120?'...':''}</div>`;
            if (diary.images && diary.images.length) {
                html += `<div class="diary-images">`;
                diary.images.forEach((img,idx) => { html += `<img src="${img}" class="diary-img" data-fullimg="${img}" onclick="viewImage('${img}')">`; });
                html += `</div>`;
            }
            html += `<div class="diary-actions"><div class="diary-action-btn edit-diary" data-id="${diary.id}">✏️ 编辑</div><div class="diary-action-btn delete-diary" data-id="${diary.id}">🗑️ 删除</div></div></div></div>`;
        });
        html += `</div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.edit-diary').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); const id = parseInt(btn.dataset.id); openDiaryCreateForEdit(id); }); });
    document.querySelectorAll('.delete-diary').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); if(confirm('确定删除这条日记吗？')) { const id = parseInt(btn.dataset.id); diaries = diaries.filter(d => d.id !== id); saveDiariesToLocal(); renderDiaryList(petId); } }); });
}
function openDiaryCreateForEdit(diaryId) {
    const diary = diaries.find(d => d.id === diaryId);
    if (!diary) return;
    editingDiaryId = diaryId;
    document.getElementById('diaryCreateTitle').innerText = '编辑日记';
    populatePetSelect(diary.petId);
    document.getElementById('diaryDate').value = diary.date;
    document.getElementById('diaryContent').value = diary.content;
    tempImagesBase64 = diary.images ? [...diary.images] : [];
    renderImagePreview();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('diaryCreatePage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
}
function openNewDiary(presetPetId = null) {
    editingDiaryId = null;
    document.getElementById('diaryCreateTitle').innerText = '写日记';
    populatePetSelect(presetPetId);
    document.getElementById('diaryDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('diaryContent').value = '';
    tempImagesBase64 = [];
    renderImagePreview();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('diaryCreatePage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
}
function populatePetSelect(selectedId) {
    const select = document.getElementById('diaryPetSelect');
    select.innerHTML = '';
    pets.forEach(pet => {
        const opt = document.createElement('option');
        opt.value = pet.id;
        opt.textContent = `${pet.name} (${pet.gender})`;
        if (selectedId && selectedId === pet.id) opt.selected = true;
        select.appendChild(opt);
    });
    if (pets.length === 0) select.innerHTML = '<option disabled>暂未创建宠物</option>';
}
function renderImagePreview() {
    const container = document.getElementById('diaryImagePreviewList');
    if (!container) return;
    container.innerHTML = '';
    tempImagesBase64.forEach((img, idx) => {
        const div = document.createElement('div'); div.className = 'preview-item';
        const imgEl = document.createElement('img'); imgEl.src = img;
        const removeSpan = document.createElement('span'); removeSpan.innerText = '✕'; removeSpan.className = 'remove-img';
        removeSpan.onclick = (e) => { e.stopPropagation(); tempImagesBase64.splice(idx,1); renderImagePreview(); };
        div.appendChild(imgEl); div.appendChild(removeSpan); container.appendChild(div);
    });
}
function saveDiaryFromForm() {
    const petId = parseInt(document.getElementById('diaryPetSelect').value);
    if (!petId) { showToast('请选择关联宠物'); return; }
    const date = document.getElementById('diaryDate').value;
    if (!date) { showToast('请选择日记日期'); return; }

    const today = new Date().toISOString().slice(0, 10);
    if (date > today) { showToast('日记日期不能晚于今天'); return; }

    const content = document.getElementById('diaryContent').value.trim();
    if (!content) { showToast('请写下日记内容'); return; }
    if (content.length < 10) { showToast('日记内容至少10个字符'); return; }

    if (editingDiaryId) {
        const idx = diaries.findIndex(d => d.id === editingDiaryId);
        if (idx !== -1) diaries[idx] = { ...diaries[idx], petId, date, content, images: [...tempImagesBase64] };
    } else {
        diaries.push({ id: Date.now(), petId, date, content, images: [...tempImagesBase64] });
    }
    saveDiariesToLocal();
    showToast('日记保存成功');
    if (currentDiaryPetFilter && diaries.some(d => d.petId === currentDiaryPetFilter)) {
        renderDiaryList(currentDiaryPetFilter);
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        document.getElementById('diaryListPage').style.display = 'block';
        document.getElementById('bottomNav').style.display = 'none';
    } else {
        showHome();
    }
    editingDiaryId = null;
    tempImagesBase64 = [];
}
window.viewImage = function(src) {
    const modalDiv = document.createElement('div'); modalDiv.className = 'modal-mask'; modalDiv.style.background = 'rgba(0,0,0,0.8)';
    modalDiv.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;"><img src="${src}" style="max-width:90%;max-height:80%;border-radius:20px;"></div>`;
    modalDiv.onclick = () => modalDiv.remove();
    document.body.appendChild(modalDiv);
};

// ========== 新增体重记录页独立逻辑 ==========
function getWeightRecords(petId) {
    const key = `weightRecords_${petId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}
function saveWeightRecords(petId, records) {
    localStorage.setItem(`weightRecords_${petId}`, JSON.stringify(records));
}
function drawWeightChart(petId) {
    const records = getWeightRecords(petId);
    const canvas = document.getElementById('weightChartCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    if (records.length === 0) {
        ctx.fillStyle = '#B3A28E';
        ctx.font = '12px "微软雅黑"';
        ctx.fillText('暂无体重数据，添加第一条记录吧~', 20, 100);
        return;
    }
    const sorted = [...records].sort((a,b)=>new Date(a.date)-new Date(b.date));
    const weights = sorted.map(r => r.weight);
    if (weights.length < 2) {
        ctx.fillStyle = '#D9A13B';
        ctx.font = '12px "微软雅黑"';
        ctx.fillText('至少需要两次记录才能生成趋势图', 20, 100);
        return;
    }
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;
    const padding = 30;
    const stepX = (width - padding*2) / (weights.length-1);
    ctx.beginPath();
    ctx.strokeStyle = '#D9A13B';
    ctx.lineWidth = 2;
    for (let i=0; i<weights.length; i++) {
        let x = padding + i*stepX;
        let y = height - padding - ((weights[i]-minW)/range)*(height-padding*2);
        if (i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    }
    ctx.stroke();
    for (let i=0; i<weights.length; i++) {
        let x = padding + i*stepX;
        let y = height - padding - ((weights[i]-minW)/range)*(height-padding*2);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2*Math.PI);
        ctx.fillStyle = '#D9A13B';
        ctx.fill();
        ctx.fillStyle = '#3E2C1F';
        ctx.font = '10px "微软雅黑"';
        ctx.fillText(weights[i]+'g', x-12, y-6);
        ctx.fillText(sorted[i].date.slice(5), x-12, y+12);
    }
}
function renderWeightPage(petId) {
    if (!petId) return;
    const pet = pets.find(p => p.id === petId);
    if (pet) document.getElementById('weightPetNameSpan').innerText = `（${pet.name}）`;
    const records = getWeightRecords(petId);
    const container = document.getElementById('weightRecordList');
    if (!records.length) {
        container.innerHTML = '<div class="empty-weight">🐾 暂无体重记录，添加一条吧~</div>';
    } else {
        let html = '';
        [...records].sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(rec => {
            html += `<div class="weight-record-item" data-date="${rec.date}">
                        <div class="weight-record-info">
                            <span class="weight-record-date">📅 ${rec.date}</span>
                            <span class="weight-record-value">⚖️ ${rec.weight} g</span>
                        </div>
                        <div class="delete-weight-btn" data-date="${rec.date}">删除</div>
                     </div>`;
        });
        container.innerHTML = html;
        document.querySelectorAll('.delete-weight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const date = btn.getAttribute('data-date');
                if (confirm(`删除 ${date} 的体重记录？`)) {
                    let newRecords = getWeightRecords(petId).filter(r => r.date !== date);
                    saveWeightRecords(petId, newRecords);
                    renderWeightPage(petId);
                    drawWeightChart(petId);
                }
            });
        });
    }
    drawWeightChart(petId);
}
function addWeightRecordHandler(petId) {
    const date = document.getElementById('weightDateInput').value;
    const weight = parseFloat(document.getElementById('weightValueInput').value);
    if (!date) { showToast('请选择日期'); return; }
    if (isNaN(weight) || weight <= 0) { showToast('请输入有效体重（克）'); return; }
    if (weight < 10 || weight > 500) { showToast('体重范围应在10-500克之间'); return; }

    let records = getWeightRecords(petId);
    const existingIdx = records.findIndex(r => r.date === date);
    if (existingIdx !== -1) {
        if (confirm(`该日期已有体重记录（${records[existingIdx].weight}g），是否覆盖？`)) {
            records[existingIdx] = { date, weight };
        } else return;
    } else {
        records.push({ date, weight });
    }
    saveWeightRecords(petId, records);
    document.getElementById('weightDateInput').value = new Date().toISOString().slice(0,10);
    document.getElementById('weightValueInput').value = '';
    showToast('记录保存成功');
    renderWeightPage(petId);
}
let currentWeightPetId = null;
function openWeightPage(petId) {
    currentWeightPetId = petId;
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('weightPage').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('weightDateInput').value = new Date().toISOString().slice(0,10);
    renderWeightPage(petId);
}

// ---------- 绑定事件（需确保 DOM 加载完成）----------
document.addEventListener('DOMContentLoaded', () => {
    // 导航
    document.getElementById('navHome').onclick = showHome;
    document.getElementById('navProfile').onclick = showProfile;
    document.getElementById('navAdd').onclick = () => document.getElementById('actionOverlay').style.display = 'flex';
    document.getElementById('reminderBar').addEventListener('click', () => { document.querySelectorAll('.page').forEach(p=>p.style.display='none'); document.getElementById('todoPage').style.display='block'; document.getElementById('bottomNav').style.display='none'; renderTodoList(); });
    document.getElementById('backFromTodo').onclick = showHome;
    document.getElementById('backFromDetail').onclick = showHome;
    document.getElementById('backFromCreate').onclick = showHome;
    document.getElementById('cancelCreateBtn').onclick = showHome;
    document.getElementById('savePetBtn').onclick = savePetFromForm;
    document.getElementById('editPetBtn').onclick = () => { if(currentPetId) showCreatePet('edit', currentPetId); };
    document.getElementById('createAnotherBtn').onclick = () => showCreatePet('create', null);
    document.getElementById('quickCreateBtn').onclick = () => showCreatePet('create', null);
    document.getElementById('menuCreatePet').onclick = () => { closeMenu(); showCreatePet('create', null); };
    document.getElementById('menuWriteDiary').onclick = () => { closeMenu(); openNewDiary(null); };
    document.getElementById('menuTodo').onclick = () => { closeMenu(); document.querySelectorAll('.page').forEach(p=>p.style.display='none'); document.getElementById('todoPage').style.display='block'; document.getElementById('bottomNav').style.display='none'; renderTodoList(); };
    window.closeMenu = () => document.getElementById('actionOverlay').style.display = 'none';
    
    // 日记入口
    document.getElementById('diaryEntryBtn').onclick = () => { if(currentPetId) { document.querySelectorAll('.page').forEach(p=>p.style.display='none'); renderDiaryList(currentPetId); document.getElementById('diaryListPage').style.display='block'; document.getElementById('bottomNav').style.display='none'; } else showToast('请先选择小熊'); };
    document.getElementById('backFromDiaryList').onclick = () => { if(currentPetId) showPetDetail(currentPetId); else showHome(); };
    document.getElementById('createDiaryFromListBtn').onclick = () => { openNewDiary(currentDiaryPetFilter); };
    document.getElementById('backFromDiaryCreate').onclick = () => { if(currentDiaryPetFilter) { document.querySelectorAll('.page').forEach(p=>p.style.display='none'); renderDiaryList(currentDiaryPetFilter); document.getElementById('diaryListPage').style.display='block'; document.getElementById('bottomNav').style.display='none'; } else showHome(); };
    document.getElementById('saveDiaryBtn').onclick = saveDiaryFromForm;
    document.getElementById('uploadDiaryMediaBtn').onclick = () => document.getElementById('diaryMediaInput').click();
    document.getElementById('diaryMediaInput').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (tempImagesBase64.length >= 6) { showToast('最多上传6张图片'); return; }
            const reader = new FileReader();
            reader.onload = ev => { tempImagesBase64.push(ev.target.result); renderImagePreview(); };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    });
    // 搜索栏展开逻辑
    const searchBtn = document.getElementById('searchBtn');
    const searchExpandable = document.getElementById('searchExpandable');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => {
        searchExpandable.style.display = 'flex';
        searchBtn.style.display = 'none';
        searchInput.focus();
    });

    searchInput.addEventListener('input', (e) => {
        searchKeyword = e.target.value.trim();
        renderPetList();
    });

    searchInput.addEventListener('blur', () => {
        if (searchInput.value.trim() === '') {
            searchExpandable.style.display = 'none';
            searchBtn.style.display = 'inline-flex';
            searchKeyword = '';
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchKeyword = searchInput.value.trim();
            renderPetList();
            searchInput.blur();
        }
        if (e.key === 'Escape') {
            searchExpandable.style.display = 'none';
            searchBtn.style.display = 'inline-flex';
            searchInput.value = '';
            searchKeyword = '';
            renderPetList();
        }
    });
    
    // 体重记录入口
    const weightEntry = document.getElementById('weightEntryBtn');
    if (weightEntry) {
        weightEntry.onclick = () => { if (currentPetId) openWeightPage(currentPetId); else showToast('请先选择小熊'); };
    }
    document.getElementById('backFromWeightPage').onclick = () => { if (currentWeightPetId) showPetDetail(currentWeightPetId); else showHome(); };
    document.getElementById('saveWeightBtn').onclick = () => { if (currentWeightPetId) addWeightRecordHandler(currentWeightPetId); else showToast('请先选择小熊'); };
    
    // 提醒模态框
    const modal = document.getElementById('todoModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const confirmTodoBtn = document.getElementById('confirmTodoBtn');
    const openAddModal = document.getElementById('openAddTodoModal');
    function closeModalFunc() { modal.classList.add('hidden'); editingTodoId=null; document.getElementById('todoNameInput').value=''; document.getElementById('cycleTypeSelect').value='daily'; document.getElementById('modalTitle').innerText='新建提醒'; }
    openAddModal.addEventListener('click', () => { editingTodoId=null; document.getElementById('modalTitle').innerText='新建提醒'; document.getElementById('todoNameInput').value=''; document.getElementById('cycleTypeSelect').value='daily'; modal.classList.remove('hidden'); });
    closeModalBtn.addEventListener('click', closeModalFunc);
    confirmTodoBtn.addEventListener('click', () => { const name=document.getElementById('todoNameInput').value; const cycle=document.getElementById('cycleTypeSelect').value; if(!name.trim()){ showToast('请填写提醒名称'); return; } addOrUpdateTodo(name,cycle); closeModalFunc(); renderTodoList(); });
    modal.addEventListener('click', (e) => { if(e.target===modal) closeModalFunc(); });
    
    // 初始化数据
    initDefaultPets();
    initDefaultTodos();
    loadDiaries();
    loadUserProfile();
    loadNotificationSettings();
    loadFeedbackList();
    loadInviteStats();
    showHome();

    // ---------- 用户信息编辑功能 ----------
    let selectedUserAvatar = '🐻‍❄️';
    let uploadedUserAvatarBase64 = null;

    document.getElementById('editProfileBtn').addEventListener('click', () => {
        document.getElementById('userNicknameInput').value = userProfile.nickname;
        if (userProfile.avatarType === 'emoji') {
            selectedUserAvatar = userProfile.avatar;
            uploadedUserAvatarBase64 = null;
            document.getElementById('userCustomAvatarPreview').innerHTML = '';
            document.querySelectorAll('#userAvatarSelector .avatar-option').forEach(opt => {
                opt.classList.toggle('selected', opt.getAttribute('data-emoji') === userProfile.avatar);
            });
        } else if (userProfile.avatarType === 'image') {
            uploadedUserAvatarBase64 = userProfile.avatar;
            selectedUserAvatar = null;
            document.getElementById('userCustomAvatarPreview').innerHTML = `<img src="${userProfile.avatar}" class="preview-img">`;
            document.querySelectorAll('#userAvatarSelector .avatar-option').forEach(opt => opt.classList.remove('selected'));
        }
        document.getElementById('profileEditModal').classList.remove('hidden');
    });

    document.getElementById('triggerUserAvatarUpload').addEventListener('click', () => {
        document.getElementById('userAvatarUpload').click();
    });

    document.getElementById('userAvatarUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                uploadedUserAvatarBase64 = ev.target.result;
                selectedUserAvatar = null;
                document.getElementById('userCustomAvatarPreview').innerHTML = `<img src="${uploadedUserAvatarBase64}" class="preview-img">`;
                document.querySelectorAll('#userAvatarSelector .avatar-option').forEach(opt => opt.classList.remove('selected'));
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelectorAll('#userAvatarSelector .avatar-option').forEach(opt => {
        opt.addEventListener('click', () => {
            selectedUserAvatar = opt.getAttribute('data-emoji');
            uploadedUserAvatarBase64 = null;
            document.getElementById('userCustomAvatarPreview').innerHTML = '';
            document.querySelectorAll('#userAvatarSelector .avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    document.getElementById('cancelProfileEdit').addEventListener('click', () => {
        document.getElementById('profileEditModal').classList.add('hidden');
    });

    document.getElementById('confirmProfileEdit').addEventListener('click', () => {
        const nickname = document.getElementById('userNicknameInput').value.trim() || '小熊饲养员';
        userProfile.nickname = nickname;
        if (uploadedUserAvatarBase64) {
            userProfile.avatar = uploadedUserAvatarBase64;
            userProfile.avatarType = 'image';
        } else if (selectedUserAvatar) {
            userProfile.avatar = selectedUserAvatar;
            userProfile.avatarType = 'emoji';
        }
        saveUserProfile();
        updateProfileDisplay();
        document.getElementById('profileEditModal').classList.add('hidden');
    });

    document.getElementById('profileEditModal').addEventListener('click', (e) => {
        if (e.target.id === 'profileEditModal') {
            document.getElementById('profileEditModal').classList.add('hidden');
        }
    });

    // ---------- 设置页面导航 ----------
    document.getElementById('notificationSettingsItem').addEventListener('click', showNotificationPage);
    document.getElementById('privacySettingsItem').addEventListener('click', showPrivacyPage);
    document.getElementById('aboutItem').addEventListener('click', showAboutPage);
    document.getElementById('feedbackItem').addEventListener('click', showFeedbackPage);
    document.getElementById('inviteItem').addEventListener('click', showInvitePage);

    // ---------- 消息通知页面 ----------
    document.getElementById('backFromNotification').addEventListener('click', showProfile);

    document.getElementById('notificationToggle').addEventListener('click', function() {
        this.classList.toggle('active');
        notificationSettings.enabled = this.classList.contains('active');
        document.getElementById('notificationStatus').innerText = (notificationSettings.enabled ? '开' : '关') + ' ›';
        saveNotificationSettings();
    });

    document.getElementById('soundToggle').addEventListener('click', function() {
        this.classList.toggle('active');
        notificationSettings.soundEnabled = this.classList.contains('active');
        saveNotificationSettings();
    });

    document.getElementById('vibrationToggle').addEventListener('click', function() {
        this.classList.toggle('active');
        notificationSettings.vibrationEnabled = this.classList.contains('active');
        saveNotificationSettings();
    });

    document.getElementById('dndToggle').addEventListener('click', function() {
        this.classList.toggle('active');
        notificationSettings.doNotDisturb.enabled = this.classList.contains('active');
        document.getElementById('dndTimeSelector').style.display = notificationSettings.doNotDisturb.enabled ? 'block' : 'none';
        saveNotificationSettings();
    });

    document.getElementById('dndStartTime').addEventListener('change', (e) => {
        notificationSettings.doNotDisturb.startTime = e.target.value;
        saveNotificationSettings();
    });

    document.getElementById('dndEndTime').addEventListener('change', (e) => {
        notificationSettings.doNotDisturb.endTime = e.target.value;
        saveNotificationSettings();
    });

    // ---------- 隐私设置页面 ----------
    document.getElementById('backFromPrivacy').addEventListener('click', showProfile);

    document.getElementById('exportDataBtn').addEventListener('click', () => {
        const data = {
            pets: pets,
            todos: todoList,
            diaries: diaries,
            profile: userProfile,
            notificationSettings: notificationSettings,
            feedbackList: feedbackList,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `绒熊时光_数据导出_${new Date().toLocaleDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('clearCacheBtn').addEventListener('click', () => {
        if (confirm('确定清除缓存？这不会删除您的数据。')) {
            showToast('缓存已清除');
        }
    });

    let deleteType = null;
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        deleteType = 'account';
        document.getElementById('deleteConfirmModal').classList.remove('hidden');
    });

    document.getElementById('deleteAllDataBtn').addEventListener('click', () => {
        deleteType = 'data';
        document.getElementById('deleteConfirmModal').classList.remove('hidden');
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
        document.getElementById('deleteConfirmModal').classList.add('hidden');
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        if (deleteType === 'data' || deleteType === 'account') {
            localStorage.clear();
            showToast(deleteType === 'account' ? '账户已注销' : '数据已删除');
            location.reload();
        }
    });

    document.getElementById('deleteConfirmModal').addEventListener('click', (e) => {
        if (e.target.id === 'deleteConfirmModal') {
            document.getElementById('deleteConfirmModal').classList.add('hidden');
        }
    });

    // ---------- 关于我们页面 ----------
    document.getElementById('backFromAbout').addEventListener('click', showProfile);

    const documents = {
        agreement: {
            title: '用户服务协议',
            content: `<h4>一、服务条款</h4>
            <p>欢迎使用绒熊时光。本协议是您与绒熊时光团队之间的法律协议。使用本应用即表示您同意遵守本协议的所有条款。</p>
            <h4>二、用户责任</h4>
            <p>您承诺使用本应用时遵守相关法律法规，不利用本应用从事任何违法活动。您对您在本应用中创建的内容负责。</p>
            <h4>三、知识产权</h4>
            <p>本应用的所有内容，包括但不限于文字、图片、软件代码等，均受知识产权法保护。未经许可，不得复制、传播或用于商业目的。</p>
            <h4>四、服务变更</h4>
            <p>我们保留随时修改或终止服务的权利，恕不另行通知。我们将尽合理努力通知您任何重大变更。</p>
            <h4>五、免责声明</h4>
            <p>本应用按"现状"提供服务，不提供任何明示或暗示的保证。我们不对因使用本应用而产生的任何损失负责。</p>`
        },
        privacy: {
            title: '隐私政策',
            content: `<h4>一、信息收集</h4>
            <p>我们收集的信息包括：您创建的宠物档案、日记内容、体重记录等。所有数据均存储在您的设备本地，我们不会上传到服务器。</p>
            <h4>二、信息使用</h4>
            <p>您的信息仅用于提供和改善服务。我们不会将您的个人信息用于其他目的。</p>
            <h4>三、信息保护</h4>
            <p>我们采用安全措施保护您的信息。由于数据存储在本地，请您妥善保管您的设备。</p>
            <h4>四、信息共享</h4>
            <p>我们承诺不会将您的数据分享给任何第三方，除非法律要求或经您明确同意。</p>
            <h4>五、您的权利</h4>
            <p>您有权查看、修改、导出和删除您的数据。您可以在应用内的隐私设置中执行这些操作。</p>`
        },
        disclaimer: {
            title: '免责声明',
            content: `<h4>重要提示</h4>
            <p>本应用仅供参考和娱乐用途，不构成专业兽医建议。</p>
            <h4>饲养建议</h4>
            <p>本应用中提供的饲养建议仅供参考，不替代专业兽医诊疗。如果您的宠物出现健康问题，请及时咨询专业兽医。</p>
            <h4>数据安全</h4>
            <p>本应用数据存储在您的设备本地，请您定期导出备份。我们不对因设备损坏、丢失等原因导致的数据丢失负责。</p>
            <h4>责任限制</h4>
            <p>在法律允许的最大范围内，我们不对因使用或无法使用本应用而产生的任何直接、间接、附带、特殊或后果性损害负责。</p>`
        }
    };

    document.getElementById('viewUserAgreement').addEventListener('click', () => {
        document.getElementById('documentTitle').innerText = documents.agreement.title;
        document.getElementById('documentContent').innerHTML = documents.agreement.content;
        document.getElementById('documentModal').classList.remove('hidden');
    });

    document.getElementById('viewPrivacyPolicy').addEventListener('click', () => {
        document.getElementById('documentTitle').innerText = documents.privacy.title;
        document.getElementById('documentContent').innerHTML = documents.privacy.content;
        document.getElementById('documentModal').classList.remove('hidden');
    });

    document.getElementById('viewDisclaimer').addEventListener('click', () => {
        document.getElementById('documentTitle').innerText = documents.disclaimer.title;
        document.getElementById('documentContent').innerHTML = documents.disclaimer.content;
        document.getElementById('documentModal').classList.remove('hidden');
    });

    document.getElementById('closeDocumentModal').addEventListener('click', () => {
        document.getElementById('documentModal').classList.add('hidden');
    });

    document.getElementById('documentModal').addEventListener('click', (e) => {
        if (e.target.id === 'documentModal') {
            document.getElementById('documentModal').classList.add('hidden');
        }
    });

    // ---------- 意见反馈页面 ----------
    document.getElementById('backFromFeedback').addEventListener('click', showProfile);

    document.getElementById('uploadFeedbackImage').addEventListener('click', () => {
        document.getElementById('feedbackImageInput').click();
    });

    document.getElementById('feedbackImageInput').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (feedbackImages.length >= 3) { showToast('最多上传3张截图'); return; }
            const reader = new FileReader();
            reader.onload = ev => {
                feedbackImages.push(ev.target.result);
                renderFeedbackImages();
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    });

    document.getElementById('submitFeedbackBtn').addEventListener('click', () => {
        const description = document.getElementById('feedbackDescription').value.trim();
        if (!description) {
            showToast('请描述您的问题或建议');
            return;
        }
        if (description.length < 10) {
            showToast('描述内容至少10个字符');
            return;
        }

        const contact = document.getElementById('feedbackContact').value.trim();
        if (contact) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
                showToast('请输入有效的邮箱或手机号');
                return;
            }
        }

        const feedback = {
            id: Date.now(),
            category: currentFeedbackCategory,
            description: description,
            images: [...feedbackImages],
            contact: contact,
            status: 'pending',
            submitTime: new Date().toISOString()
        };
        feedbackList.unshift(feedback);
        saveFeedbackList();
        showToast('感谢您的反馈！');
        document.getElementById('feedbackDescription').value = '';
        document.getElementById('feedbackContact').value = '';
        feedbackImages = [];
        renderFeedbackImages();
        renderFeedbackHistory();
    });

    // ---------- 邀请好友页面 ----------
    document.getElementById('backFromInvite').addEventListener('click', showProfile);

    document.getElementById('shareToWechat').addEventListener('click', () => {
        showToast('需要微信SDK支持');
    });

    document.getElementById('shareToMoments').addEventListener('click', () => {
        showToast('需要微信SDK支持');
    });

    document.getElementById('saveImage').addEventListener('click', saveInviteCard);

    document.getElementById('copyLink').addEventListener('click', () => {
        const link = `https://rongxiong.example.com/invite?code=${generateInviteCode()}`;
        navigator.clipboard.writeText(link).then(() => {
            showToast('链接已复制');
        }).catch(() => {
            showToast('复制失败');
        });
    });
});