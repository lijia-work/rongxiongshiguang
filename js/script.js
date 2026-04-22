// ---------- 宠物数据模型（不含购买日期）----------
let pets = [];
let currentPetId = null;        // 当前详情页展示的宠物id
let editPetId = null;           // 正在编辑的宠物id (null为新建)
let searchKeyword = '';

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
    if (!name) { alert('请填写宠物昵称'); return; }
    const gender = document.getElementById('petGender').value;
    const breed = document.getElementById('petBreed').value;
    const birthDate = document.getElementById('birthDate').value;
    const deathDate = document.getElementById('deathDate').value;
    const homeDate = document.getElementById('homeDate').value;
    if (!homeDate) { alert('请填写到家日期，用于计算陪伴天数'); return; }
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
    renderPetList();
    // 保存后返回首页
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
    document.getElementById('bottomNav').style.display = 'flex';
    updateActiveNav('profile');
}
function updateActiveNav(active) { /*样式略*/ }

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
function markTodoComplete(id) { const todo = todoList.find(t=>t.id===id); if(todo){ todo.lastCompleteDate=getTodayStr(); renderTodoList(); } }
function deleteTodoById(id) { todoList = todoList.filter(t=>t.id!==id); renderTodoList(); }
function openEditModal(id) { const todo=todoList.find(t=>t.id===id); if(todo){ editingTodoId=id; document.getElementById('modalTitle').innerText='编辑提醒'; document.getElementById('todoNameInput').value=todo.name; document.getElementById('cycleTypeSelect').value=todo.cycleType; document.getElementById('todoModal').classList.remove('hidden'); } }
let editingTodoId = null;
function addOrUpdateTodo(name, cycleType) {
    if (!name.trim()) return alert('请填写提醒名称');
    if(editingTodoId){
        const idx=todoList.findIndex(t=>t.id===editingTodoId);
        if(idx!==-1){ todoList[idx].name=name.trim(); todoList[idx].cycleType=cycleType; renderTodoList(); }
        editingTodoId=null;
    } else {
        todoList.push({ id:Date.now(), name:name.trim(), cycleType:cycleType, lastCompleteDate:getTodayStr() });
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
    if(todoList.length===0){
        const today=getTodayStr();
        const threeAgo=new Date(); threeAgo.setDate(threeAgo.getDate()-3);
        todoList = [{ id:1001, name:'换垫料', cycleType:'weekly', lastCompleteDate:threeAgo.toISOString().slice(0,10) },
                    { id:1002, name:'喂食营养糊', cycleType:'daily', lastCompleteDate:today },
                    { id:1003, name:'体外驱虫', cycleType:'monthly', lastCompleteDate:today }];
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
    if (!petId) { alert('请选择关联宠物'); return; }
    const date = document.getElementById('diaryDate').value;
    if (!date) { alert('请选择日记日期'); return; }
    const content = document.getElementById('diaryContent').value.trim();
    if (!content) { alert('请写下日记内容'); return; }
    if (editingDiaryId) {
        const idx = diaries.findIndex(d => d.id === editingDiaryId);
        if (idx !== -1) diaries[idx] = { ...diaries[idx], petId, date, content, images: [...tempImagesBase64] };
    } else {
        diaries.push({ id: Date.now(), petId, date, content, images: [...tempImagesBase64] });
    }
    saveDiariesToLocal();
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
    if (!date) { alert('请选择日期'); return; }
    if (isNaN(weight) || weight <= 0) { alert('请输入有效体重（克）'); return; }
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
    document.getElementById('diaryEntryBtn').onclick = () => { if(currentPetId) { document.querySelectorAll('.page').forEach(p=>p.style.display='none'); renderDiaryList(currentPetId); document.getElementById('diaryListPage').style.display='block'; document.getElementById('bottomNav').style.display='none'; } else alert('请先选择小熊'); };
    document.getElementById('backFromDiaryList').onclick = () => { if(currentPetId) showPetDetail(currentPetId); else showHome(); };
    document.getElementById('createDiaryFromListBtn').onclick = () => { openNewDiary(currentDiaryPetFilter); };
    document.getElementById('backFromDiaryCreate').onclick = () => { if(currentDiaryPetFilter) { document.querySelectorAll('.page').forEach(p=>p.style.display='none'); renderDiaryList(currentDiaryPetFilter); document.getElementById('diaryListPage').style.display='block'; document.getElementById('bottomNav').style.display='none'; } else showHome(); };
    document.getElementById('saveDiaryBtn').onclick = saveDiaryFromForm;
    document.getElementById('uploadDiaryMediaBtn').onclick = () => document.getElementById('diaryMediaInput').click();
    document.getElementById('diaryMediaInput').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (tempImagesBase64.length >= 6) { alert('最多上传6张图片'); return; }
            const reader = new FileReader();
            reader.onload = ev => { tempImagesBase64.push(ev.target.result); renderImagePreview(); };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    });
    document.getElementById('searchBtn').onclick = () => { let kw = prompt('🔍 输入宠物名字'); if(kw !== null) { searchKeyword = kw; renderPetList(); } };
    
    // 体重记录入口
    const weightEntry = document.getElementById('weightEntryBtn');
    if (weightEntry) {
        weightEntry.onclick = () => { if (currentPetId) openWeightPage(currentPetId); else alert('请先选择小熊'); };
    }
    document.getElementById('backFromWeightPage').onclick = () => { if (currentWeightPetId) showPetDetail(currentWeightPetId); else showHome(); };
    document.getElementById('saveWeightBtn').onclick = () => { if (currentWeightPetId) addWeightRecordHandler(currentWeightPetId); else alert('请先选择小熊'); };
    
    // 提醒模态框
    const modal = document.getElementById('todoModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const confirmTodoBtn = document.getElementById('confirmTodoBtn');
    const openAddModal = document.getElementById('openAddTodoModal');
    function closeModalFunc() { modal.classList.add('hidden'); editingTodoId=null; document.getElementById('todoNameInput').value=''; document.getElementById('cycleTypeSelect').value='daily'; document.getElementById('modalTitle').innerText='新建提醒'; }
    openAddModal.addEventListener('click', () => { editingTodoId=null; document.getElementById('modalTitle').innerText='新建提醒'; document.getElementById('todoNameInput').value=''; document.getElementById('cycleTypeSelect').value='daily'; modal.classList.remove('hidden'); });
    closeModalBtn.addEventListener('click', closeModalFunc);
    confirmTodoBtn.addEventListener('click', () => { const name=document.getElementById('todoNameInput').value; const cycle=document.getElementById('cycleTypeSelect').value; if(!name.trim()){ alert('请填写提醒名称'); return; } addOrUpdateTodo(name,cycle); closeModalFunc(); renderTodoList(); });
    modal.addEventListener('click', (e) => { if(e.target===modal) closeModalFunc(); });
    
    // 初始化数据
    initDefaultPets();
    initDefaultTodos();
    loadDiaries();
    showHome();
});