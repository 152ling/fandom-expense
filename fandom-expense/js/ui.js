import { state } from './state.js';
import { baseCategories, arrivalOptions,wishCategories,wishCategoriesACGN,paymentOptions } from './constants.js';

    export function showToast(msg) {
        const t = document.getElementById("toast");
        if(!t) return;
        t.textContent = msg; t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 2000);
    }
        /**
         * 3. 導覽與渲染
         */
    export function switchTab(tab) {
            state.activeTab = tab; state.subPage = null; state.searchKeyword = ''; state.selectedCategory = '';state.currentPage = 1;
            ['expense', 'report', 'wish', 'settings'].forEach(t => {
                const el = document.getElementById(`tab-${t}`);
                if (el) el.className = `flex-1 flex flex-col items-center gap-1 transition-colors ${tab === t ? 'tab-active' : 'text-gray-400'}`;
            });
            document.getElementById('fab').classList.toggle('hidden', tab === 'report' || tab === 'settings');
            document.getElementById('share').classList.toggle('hidden', tab === 'report' || tab === 'settings'|| tab === 'wish');
            // 針對全域視窗與主要的內容容器進行捲動重設
            window.scrollTo(0, 0); 
            const container = document.getElementById('main-content');
            if (container) {
                container.scrollTop = 0;
            }
            renderContent();
        }
    export function renderContent() {
            const container = document.getElementById('main-content');
            if(!container) return;
            container.innerHTML = '';
            if (state.activeTab === 'expense') renderExpenseList(container);
            else if (state.activeTab === 'report') renderReport(container);
            else if (state.activeTab === 'wish') renderWishList(container);
            else if (state.activeTab === 'settings') {
                if (state.subPage === 'backup') renderBackupView(container);
                else if (state.subPage === 'appearance') renderAppearanceView(container);
                else if (state.subPage === 'photowall') renderPhotoWall(container);
                else if (state.subPage === 'version') renderVersionView(container);
                else if (state.subPage === 'accountConfig') renderAccountConfig(container);
                else if (state.subPage === 'catOrder') renderCategoryOrderView(container);
                else if (state.subPage === 'faq') renderFAQView(container);
                else renderSettings(container);
            }
    }

        export function renderExpenseList(container) {
            container.innerHTML = `
                <div class="pt-6 px-6 sticky top-0 bg-brand/5 backdrop-blur-md z-30 border-b border-gray-100">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-black tracking-tight">消費清單</h2>
                        <div class="flex gap-2 text-gray-800">
                            <select onchange="updateFilter('year', this.value)" class="bg-white border rounded-lg px-2 py-1 text-xs outline-none shadow-sm">
                                <option value="0" ${state.filterYear === 0 ? 'selected' : ''}>不限</option>
                               ${[2020,2021,2022,2023,2024, 2025, 2026].map(y => `<option value="${y}" ${Number(y) === Number(state.filterYear) ? 'selected' : ''}>${y}年</option>`).join('')}
                            </select>
                            <select onchange="updateFilter('month', this.value)" class="bg-white border rounded-lg px-2 py-1 text-xs outline-none shadow-sm">
                                <option value="0" ${state.filterMonth === 0 ? 'selected' : ''}>不限</option>
                                ${Array.from({length: 12}, (_, i) => i + 1).map(m => `<option value="${m}" ${Number(m) === Number(state.filterMonth) ? 'selected' : ''}>${m}月</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="relative mb-3">
                        <input type="text" placeholder="搜尋項目、到貨狀態、備註..." oninput="state.searchKeyword=this.value;state.currentPage=1;renderExpenseListItems(document.getElementById('expense-list-items'))" class="w-full bg-white border border-gray-100 rounded-2xl py-3 px-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20 transition-all text-gray-800">
                        <svg class="text-brand w-4 h-4 absolute left-4 top-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="3"/></svg>
                    </div>
                    <div id="cat-bar" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-1"></div>
                    <div id="tag-bar" class="flex gap-2 overflow-x-auto no-scrollbar pb-2"></div>
                </div>
                <div id="expense-list-items" class="px-6 space-y-4 pb-12 pt-4"></div>
            `;
            renderTagAndCatBar();
            renderExpenseListItems(document.getElementById('expense-list-items'));
        }        function renderExpenseListItems(container) { //消費清單渲染
            if(!container) return;
            const kw = state.searchKeyword.toLowerCase();
            const filtered = state.expenses.filter(ex => {
            // 1. 基本時間過濾
            const dateMatch = (state.filterYear === 0 || Number(ex.year) === Number(state.filterYear)) && (state.filterMonth === 0 || Number(ex.month) === Number(state.filterMonth));
            // 2. 分類過濾
            const catMatch = (state.selectedCategory === '' || ex.category === state.selectedCategory);
            
            // 3. 進階關鍵字過濾 (包含：名稱、標籤、備註、到貨狀態、收物平台)
            const keywordMatch = (
                ex.name.toLowerCase().includes(kw) || 
                (ex.tags && ex.tags.some(t => t.toLowerCase().includes(kw))) || 
                (ex.remark && ex.remark.toLowerCase().includes(kw)) ||
                (ex.arrivalStatus && ex.arrivalStatus.toLowerCase().includes(kw)) || // 新增：搜尋到貨狀態
                (ex.platform && ex.platform.toLowerCase().includes(kw))             // 新增：搜尋收物平台
            );

            return dateMatch && catMatch && keywordMatch;
            });
            const sorted = filtered.sort((a, b) => 
                Number(b.year) - Number(a.year) ||
                Number(b.month) - Number(a.month) ||
                Number(b.day  || 1) - Number(a.day  || 1) || 
                Number(b.id) - Number(a.id)
            );
            // 分頁邏輯
            const itemsPerPage = 20;
            const totalItems = sorted.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            if (state.currentPage > totalPages) state.currentPage = totalPages;
            const paginatedItems = sorted.slice((state.currentPage - 1) * itemsPerPage, state.currentPage * itemsPerPage);
            const totalExp = filtered.filter(i => i.type !== 'income').reduce((sum, i) => sum + i.total, 0);
            const totalInc = filtered.filter(i => i.type === 'income').reduce((sum, i) => sum + i.total, 0);
            const netTotal = totalExp - totalInc;
            const totalDisplay = state.hideAmount ? '•••••' : `$ ${netTotal.toLocaleString()}`;
            const totalExpDisplay= state.hideAmount ? '•••' : `$ ${totalExp.toLocaleString()}`;
            const summaryLabel = state.filterYear === 0 ? 'Total Cost' : (state.filterMonth === 0 ? '本年淨支出' : '本月淨支出');


            if (filtered.length === 0) { container.innerHTML = `<div class="text-center py-24 text-slate-300 font-bold">這個月份目前沒有紀錄唷</div>`; return; }
            let html = `<div class="bg-brand rounded-3xl p-6 text-white card-shadow flex justify-between items-end mb-6">
                <div>
                    <div class="flex items-center mb-1"><p class="text-white/70 text-[10px] font-bold uppercase tracking-wider ">${summaryLabel}</p>                     
                        <button onclick="toggleAmountVisibility()" class="text-white/60 hover:text-white transition-colors p-1">
                                ${state.hideAmount ? 
                                    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` : 
                                    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5 " stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
                                }
                        </button></div>
                    <h3 class="text-3xl font-black">${totalDisplay}</h3>
                    </div>
                    <div class="text-right flex-row">
                        ${totalInc > 0 ? `<p class="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg mb-1">支出: ${totalExpDisplay}</p>` : ''}
                        ${totalInc > 0 ? `<p class="text-[10px] font-bold bg-emerald-400/40 px-2 py-1 rounded-lg">售出: +$${totalInc.toLocaleString()}</p>` : ''}
                        <p class="text-xs text-white/80 font-medium">共 ${filtered.length} 項紀錄</p>
                    </div>
                </div>` 
            html += paginatedItems.map(item => {
                const cat = [...baseCategories.categories, ...baseCategories.categoriesACGN].find(c => c.id === item.category) || {icon: '🌈', color: '#92A8D1'};
                const imgs = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
                const isIncome = item.type === 'income';
                const cardBg = isIncome ? 'bg-[var(--income-bg-soft)]' : 'bg-white border-transparent';
                const payInfo = item.paymentMethod === '已付訂金' ? `已付訂金 $${item.paidAmount || 0}` : (item.paymentMethod || '待付款');
                return `<div class="${cardBg} rounded-3xl p-4 card-shadow relative overflow-hidden group">
                    <div class="absolute top-4 right-4 z-10">
                        <button onclick="openActionModal(event, 'expense', '${item.id}')" class="p-2 text-slate-300 hover:text-slate-600 active:scale-90 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                        </button>
                    </div>
                    <div class="flex gap-4" >
                    <div class="relative w-20 h-20 flex-shrink-0"
                        onclick="openLightbox(${JSON.stringify(imgs).replace(/"/g, '&quot;')}, '${item.name}', '${item.year}/${item.month}')">
                            ${imgs.length > 0 
                            ? `<img src="${imgs[0]}" class="w-full h-full object-cover rounded-2xl">`
                            : `<div class="w-full h-full ${isIncome ? 'bg-emerald-100' : 'bg-slate-50'} rounded-2xl flex items-center justify-center text-3xl shadow-inner">${cat.icon}</div>`
                            }

                            ${imgs.length > 1 
                            ? `<div class="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">＋${imgs.length-1}</div>` 
                            : ''
                            }
                        </div>
                        <div class="flex-grow">
                            <div class="flex gap-2 mb-1">
                                <span onclick="quickFilter('category', '${item.category}')" class="cursor-pointer text-[9px] font-bold px-2 py-0.5 rounded-lg"  style="background-color: ${cat.color}1A; color: ${cat.color};">${cat.icon} ${item.category}</span>
                                <span onclick="quickFilter('status', '${item.arrivalStatus}')" class="cursor-pointer text-[9px] font-bold px-2 py-0.5 rounded-lg ${getStatusClass(item.arrivalStatus)}">${item.arrivalStatus}</span>
                                 ${state.filterMonth === 0 ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400">${item.month}月</span>` : ''}
                            </div>
                            <h4 class="font-bold text-slate-800 text-sm leading-tight">${item.name}</h4>
                            ${item.remark ? `<div class="text-[10px] text-slate-400 mt-1"><span class="text-brand font-bold mr-1 opacity-70">備註:</span>${item.remark}</div>` : ''}

                            <div class="flex justify-between items-end mt-2">
                                <div class="flex flex-wrap gap-1 pr-2">${(item.tags || []).map(t => `<span class="bg-slate-50 text-slate-400 text-[9px] px-2 py-0.5 rounded-md">#${t}</span>`).join('')}</div>
                                <div class="text-right flex-shrink-0 text-brand"><p class="text-[9px] text-slate-300 font-normal">$${item.price} × ${item.qty} ${item.shipping > 0 ? `+ 運$${item.shipping}` : ''}</p><p class="font-black text-lg leading-none">${state.hideAmount ? '•••' : `$${(Number(item.total)).toLocaleString()}`}</p></div>
                            </div>
                        </div>
                    </div>
                    ${!isIncome ? ` 
                    <div class="mt-4 pt-3 border-t border-slate-100">
                            <div class="flex justify-between items-center">
                                <div class="text-[10px] text-slate-400">
                                    <span class="font-bold text-brand">付款:</span> ${item.paymentMethod} ${item.paymentMethod === '已付訂金' ? `(已付:$${item.paidAmount})` : ''}</div>
                                    ${item.shipping > 0 ? `<div class="text-[10px] text-slate-400 font-bold"><span class="opacity-70">運費:</span> $${item.shipping}</div>
                                ` : ''}
                                </div>
                            ${item.platform ? `<div class="bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100 text-[10px] text-slate-500 leading-relaxed">📍 ${item.platform}</div>` : ''}
                    </div>` : ''}
                </div>`;
            }).join('');

            // 添加分頁按鈕 UI
            if (totalPages > 1) {
                html += `
                <div class="flex justify-center items-center gap-6 mt-8 mb-4">
                    <button onclick="changePage(-1)" ${state.currentPage === 1 ? 'disabled' : ''} class="p-2 rounded-full bg-white shadow-sm border border-slate-100 disabled:opacity-20 transition-all active:scale-90">
                        <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="text-xs font-black text-slate-400 uppercase tracking-widest">
                        <span class="text-brand mx-1">${state.currentPage}</span> / ${totalPages}
                    </div>
                    <button onclick="changePage(1)" ${state.currentPage === totalPages ? 'disabled' : ''} class="p-2 rounded-full bg-white shadow-sm border border-slate-100 disabled:opacity-20 transition-all active:scale-90">
                        <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>`;
            }

            container.innerHTML = html;
        }
        // 換頁函式
        export function changePage(delta) {
            state.currentPage += delta;
            renderExpenseListItems(document.getElementById('expense-list-items'));
            // 捲動回最上方
            const main = document.getElementById('main-content');
            if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
        }

        export function openAddModal(itemData = null) {
            state.editingId = (itemData?.id && !itemData?.isCopy) ? String(itemData.id) : null;
            // 初始化清空
            state.tempImages = [];
            state.tempImageBase64 = [];
            state.tempImageBlob = null; // 新增：清空 Blob
            if (itemData) {
                // 抓取圖片網址（兼容單圖與多圖）
                const itemImgs = Array.isArray(itemData.images) ? [...itemData.images] : (itemData.image ? [itemData.image] : []);
                
                if (state.editingId) {
                    state.tempImages = itemImgs; // 編輯模式：放進「已存在」
                } else {
                    if (isWishMode) {
                        // 願望模式複製：把網址暫存，待會 saveData 會處理
                        // 這裡我們直接把網址塞進 tempImageBase64 偷懶讓 saveData 去跑 fetch
                        state.tempImageBase64 = itemImgs;
                    } else {
                        state.tempImageBase64 = itemImgs; // 消費模式複製
                    }
                }
            }
            const form = document.getElementById('data-form');
            const modalTitle = document.getElementById('modal-title');
            // 修改判斷邏輯：如果資料裡有 qty，或者目前確實在 expense 分頁，才顯示消費模式
            const isWishMode = (state.activeTab === 'wish' && !itemData?.qty);
         // --- 標題判斷邏輯優化 ---
            if (isWishMode) {
                modalTitle.textContent = state.editingId ? "編輯心願" : "新增心願";
            } else {
                // 消費模式下的三種情況：
                if (state.wishSourceId) {
                    // 1. 從願望清單轉換而來
                    modalTitle.textContent = "加入消費清單";
                } else if (state.editingId) {
                    // 2. 編輯現有消費紀錄
                    modalTitle.textContent = "編輯紀錄";
                } else {
                    // 3. 一般新增消費
                    modalTitle.textContent = "新增紀錄";
                }
            }
            if (!isWishMode) { //新增消費
                const yStr = state.filterYear === 0 ? String(new Date().getFullYear()) : String(state.filterYear);//如果年分選不限的時候新增
                const mStr = state.filterMonth === 0  ? String(new Date().getMonth() + 1).padStart(2, '0'): String(state.filterMonth).padStart(2, '0'); 
                const dStr = String(new Date().getDate()).padStart(2, '0');//預設當天
                const defaultDate = `${yStr}-${mStr}-${dStr}`;
                const isPaidDeposit = itemData?.paymentMethod === '已付訂金';
                const filteredOptions = state.tempType === 'expense' ? arrivalOptions.filter(o => o !== '已售出') : ['已售出'];
                const isConvertingWish = state.wishSourceId !== null;//是否為心願清單進來的
                const currentCats = getCurrentCategories();
                let dropdownOptions = [...currentCats];
                if (itemData) {
                    // 檢查編輯中項目的分類是否在目前的清單中
                    const exists = currentCats.some(c => c.id === itemData.category);
                    if (!exists) {
                        // 如果不在（跨組編輯），從所有分類中找出該分類並強制補進下拉選單
                        const allCatsPool = [
                            ...window.baseCategories.categories, 
                            ...window.baseCategories.categoriesACGN
                        ];
                        const originalCat = allCatsPool.find(c => c.id === itemData.category);
                        if (originalCat) {
                            dropdownOptions.unshift(originalCat); // 補在最前面
                        }
                    }
                }
                form.innerHTML = `
                    <div class="space-y-4">
                        <div id="type-switcher" class="flex bg-slate-100 p-1 rounded-2xl mb-6 type-switcher">
                            <button type="button" onclick="setTempType('expense')" id="btn-type-exp" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all active shadow-sm">支出</button>
                            <button type="button" onclick="setTempType('income')" id="btn-type-inc" ${isConvertingWish ? 'disabled' : ''} class="flex-1 py-2 text-xs font-bold rounded-xl transition-all text-slate-400">售出</button>
                        </div>
                        <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">商&#8203;品&#8203;名&#8203;稱<span style="color:red;">*</span></label><input type="text" id="m-t-l" autocomplete="one-time-code" autocorrect="off" required value="${itemData?.name || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none border-2 border-transparent focus:border-brand text-gray-800"></div>
                        <div class="flex gap-4">
                            <div class="flex-1 space-y-1">
                                <label class="text-[10px] font-bold text-slate-400 uppercase">單&#8203;價</label>
                                <input type="number" id="m-u-p" inputmode="decimal" autocomplete="one-time-code" autocorrect="off" value="${itemData?.price || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                            </div>
                            <div class="flex-1 space-y-1 relative" id="qty-combobox">
                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">數量</label>
                                <div class="relative flex items-center">
                                    <input type="number" id="m-qty" inputmode="numeric" value="${itemData?.qty || 1}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 border-2 border-transparent focus:border-brand">
                                    <div id="qty-toggle" class="absolute right-3 cursor-pointer text-slate-400"><svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2"/></svg></div>
                                </div>
                                <ul id="qty-options" class="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto hidden custom-scrollbar"></ul>
                            </div>
                            <div class="flex-1 space-y-1" id="shipping-fee">
                                <label class="text-[10px] font-bold text-slate-400 uppercase">運費</label>
                                <input type="number" id="m-shipping" inputmode="numeric" value="${itemData?.shipping || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                            </div>
                        </div>
                    
                        ${state.enableExchange ?`
                            <div id="converter-section" class="space-y-1 transition-all duration-300 origin-top overflow-hidden">
                                <div class="flex justify-between items-end">
                                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">原始幣值</label>
                                    <span id="rate-tag" class="text-[9px] text-slate-300 italic mr-1">正在載入匯率...</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="relative flex-1 flex items-center bg-slate-50 rounded-2xl border border-transparent focus-within:border-slate-100 transition-all overflow-hidden">
                                        <select id="currency-select" class="bg-transparent border-none py-4 pl-4 pr-1 text-xs font-bold text-slate-300 focus:ring-0 appearance-none">
                                            <option value="KRW" ${itemData?.currency === 'KRW' ? 'selected' : ''}>KRW</option>
                                            <option value="JPY" ${itemData?.currency === 'JPY' ? 'selected' : ''}>JPY</option>
                                            <option value="CNY" ${itemData?.currency === 'CNY' ? 'selected' : ''}>CNY</option>
                                            <option value="USD" ${itemData?.currency === 'USD' ? 'selected' : ''}>USD</option>
                                            <option value="HKD" ${itemData?.currency === 'HKD' ? 'selected' : ''}>HKD</option>
                                            <option value="MYR" ${itemData?.currency === 'MYR' ? 'selected' : ''}>MYR</option>
                                            <option value="SGD" ${itemData?.currency === 'SGD' ? 'selected' : ''}>SGD</option>
                                            <option value="THB" ${itemData?.currency === 'THB' ? 'selected' : ''}>THB</option>
                                            <option value="TWD" ${itemData?.currency === 'TWD' ? 'selected' : ''}>TWD</option>
                                        </select>
                                        <input type="number" id="foreign-amount" value="${itemData?.foreign_amount || ''}" class="w-full bg-transparent border-none p-4 text-sm font-medium focus:ring-0" placeholder="0">
                                        <button type="button" onclick="convertCurrency()" class="p-4 text-brand hover:bg-brand/5 transition-colors group">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">分類</label><select id="m-cat" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">${dropdownOptions.map(c => `<option ${itemData?.category == c.id ? 'selected' : ''}>${c.id}</option>`).join('')}</select></div>
                            <div class="space-y-1 flex flex-col"><label class="text-[10px] font-bold text-slate-400 uppercase mb-1">消費年月日</label><input type="date" id="m-date"     value="${itemData?.year && itemData?.month ? 
                                `${itemData.year}-${String(itemData.month).padStart(2,'0')}-${String(itemData.day? String(itemData.day).padStart(2,'0') : '01').padStart(2,'0')}` : defaultDate}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800"></div>
                        </div>
                        <div class="flex gap-4" id="shipping-state">
                            <div class="flex-1 space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">購物平台</label><input type="text" id="m-platform" autocomplete="one-time-code" autocorrect="off" placeholder="LINE社群、WVS" value="${itemData?.platform || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800"></div>
                            <div class="flex-1 space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">到貨狀態</label><select id="m-status" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">${filteredOptions.map(o => `<option ${itemData?.arrivalStatus == o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
                        </div>
                
                        <div class="grid grid-cols-2 gap-4" id="shipping-payment">
                            <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">付款方式</label><select id="m-pay-method" onchange="handlePaymentChange(this.value)" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">${paymentOptions.map(o => `<option ${itemData?.paymentMethod == o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
                            <div id="paid-amount-container" class="space-y-1 ${isPaidDeposit ? '' : 'hidden'}"><label class="text-[10px] font-bold text-slate-400 uppercase">已付金額</label><input type="number" id="m-paid-amount" autocomplete="one-time-code" autocorrect="off" value="${itemData?.paidAmount || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800"></div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 uppercase">標籤</label>
                            <div class="relative">
                                <div id="m-tag-container" class="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border-2 border-transparent focus-within:border-brand min-h-[46px] items-center transition-all">
                                    <input type="text" id="m-tag-input" autocomplete="off" placeholder="輸入完標籤後，記得加逗號加入" class="flex-1 bg-transparent outline-none text-sm text-gray-800 min-w-[120px]">
                                </div>
                                <ul id="m-tag-suggestions" class="hidden absolute z-[60] left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar"></ul>
                            </div>
                        </div>
                        <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">備註</label><textarea id="m-remark" autocomplete="one-time-code" autocorrect="off" placeholder="通路、oo代購、預計出貨日期等等" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none h-16 resize-none text-gray-800">${itemData?.remark || ''}</textarea></div>
                       
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">圖片紀錄 (上限 3 張)</label>
                            <div id="img-preview-row" class="flex gap-2 overflow-x-auto no-scrollbar img-scroll-container">
                                
                            </div>
                            <input type="file" id="m-img-input" accept="image/*" class="hidden" multiple onchange="handleMultiImage(this)">
                        </div>
                    
                    </div>`;
                    if(state.enableExchange) {updateRateUI();}
                    initQtyPicker();
                    const currentType = (itemData?.type === 'income') ? 'income' : 'expense';
                    setTempType(currentType);
                    updateImagePreviewUI();
                    window.getSmartTags = initSmartTags(itemData?.tags || []);
                        
            } else {
                // 願望模式 - 依照要求設定預設日期時間
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const defaultTime = "12:00";
                const currentCats = getCurrentWishCategories();
                let dropdownOptions = [...currentCats];
                const hasDate = itemData?.releaseDate ? true : false; //是否有存日期
                const previewImg = state.tempImages.length > 0 ? state.tempImages[0] : (itemData?.image || null);
                if (itemData) {
                    const exists = currentCats.includes(itemData.category);//願望清單直接比對字串
                    if (!exists) {
                        const allWishPool = [...wishCategories, ...wishCategoriesACGN]; 
                        const originalCat = allWishPool.find(c => c === itemData.category);
                        if (originalCat) {
                            dropdownOptions.unshift(originalCat); 
                        }
                    }
                }
                form.innerHTML = `<div class="space-y-4">
                    <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">商&#8203;品&#8203;名&#8203;稱<span style="color:red;">*</span></label><input type="text" id="m-t-l" autocomplete="one-time-code" autocorrect="off" required value="${itemData?.name || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 font-bold"></div>
                    <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">預&#8203;估&#8203;價&#8203;格</label><input type="number" id="m-u-p" inputmode="decimal" autocomplete="one-time-code" autocorrect="off" value="${itemData?.price || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 font-bold"></div>
                        ${state.enableExchange ?`
                            <div id="converter-section" class="space-y-1 transition-all duration-300 origin-top overflow-hidden">
                                <div class="flex justify-between items-end ml-1">
                                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">原始幣值</label>
                                    <span id="rate-tag" class="text-[9px] text-slate-300 italic">正在載入匯率...</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="relative flex-1 flex items-center bg-slate-50 rounded-2xl border border-transparent focus-within:border-slate-100 transition-all overflow-hidden">
                                        <select id="currency-select" class="bg-transparent border-none py-4 pl-4 pr-1 text-xs font-bold text-slate-300 focus:ring-0 appearance-none">
                                            <option value="KRW" ${itemData?.currency === 'KRW' ? 'selected' : ''}>KRW</option>
                                            <option value="JPY" ${itemData?.currency === 'JPY' ? 'selected' : ''}>JPY</option>
                                            <option value="CNY" ${itemData?.currency === 'CNY' ? 'selected' : ''}>CNY</option>
                                            <option value="USD" ${itemData?.currency === 'USD' ? 'selected' : ''}>USD</option>
                                            <option value="HKD" ${itemData?.currency === 'HKD' ? 'selected' : ''}>HKD</option>
                                            <option value="MYR" ${itemData?.currency === 'MYR' ? 'selected' : ''}>MYR</option>
                                            <option value="SGD" ${itemData?.currency === 'SGD' ? 'selected' : ''}>SGD</option>
                                            <option value="THB" ${itemData?.currency === 'THB' ? 'selected' : ''}>THB</option>
                                            <option value="TWD" ${itemData?.currency === 'TWD' ? 'selected' : ''}>TWD</option>
                                        </select>
                                        <input type="number" id="foreign-amount" value="${itemData?.foreign_amount || ''}" class="w-full bg-transparent border-none p-4 text-sm font-medium focus:ring-0" placeholder="0">
                                        <button type="button" onclick="convertCurrency()" class="p-4 text-brand hover:bg-brand/5 transition-colors group">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase">分類</label><select id="m-wish-cat" autocomplete="one-time-code" autocorrect="off" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">${dropdownOptions.map(c => `<option value="${c}" ${itemData?.category == c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
                    <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase font-black">心願備註</label><textarea id="m-remark" autocomplete="one-time-code" autocorrect="off" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 font-bold">${itemData?.remark || ''}</textarea></div>
                    
                    <div class="space-y-1">
                        <div class="flex items-center justify-between">
                            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">記錄發售日期與時間</label>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="m-wish-date-toggle" class="sr-only peer" onchange="toggleWishDateInput(this.checked)" ${hasDate ? 'checked' : ''}>
                                <div class="relative w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                            peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                            after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                            after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-700">
                                </div>
                            </label>
                        </div>
                        <div id="wish-date-container" class="${hasDate ? '' : 'hidden'} grid grid-cols-2 gap-4 animate-enter">
                            <div class="space-y-1 flex flex-col">
                                <label class="text-[10px] font-bold text-slate-400">日期</label>
                                <input type="date" id="m-release-date" value="${itemData?.releaseDate || today}" class="w-full bg-slate-50 rounded-xl p-3 text-sm text-gray-800 font-bold">
                            </div>
                            <div class="space-y-1 flex flex-col">
                                <label class="text-[10px] font-bold text-slate-400">時間</label>
                                <input type="time" id="m-release-time" value="${itemData?.releaseTime || defaultTime}" class="w-full bg-slate-50 rounded-xl p-3 text-sm text-gray-800 font-bold">
                            </div>
                        </div>
                    </div>
                    <div onclick="const el=document.getElementById('m-img'); if(el){ el.value=''; el.click(); }" id="img-placeholder" class="bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl h-24 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner">
                        ${previewImg ? `<img src="${previewImg}" class="w-full h-full object-cover">` : `<span class="text-slate-300 text-[10px] font-bold uppercase tracking-widest">上傳相片</span>`}
                    </div>
                    
                    <input type="file" id="m-img" accept="image/*" style="position: fixed;bottom: 0;left: 0;width: 48px;height: 48px;opacity: 0;z-index: 10;" onchange="handleImage(this)">
                </div>`;
                if(state.enableExchange) {updateRateUI();}
            }
                        
            document.getElementById('modal-overlay').classList.remove('hidden');
            setTimeout(() => { if (form) form.scrollTop = 0; }, 50);//每次開啟都在彈窗最上方
        }

        export function openModalAnimation(overlayId, containerId) {
            const overlay = document.getElementById(overlayId);
            const container = document.getElementById(containerId);
            if (!overlay || !container) return;
            overlay.classList.remove('hidden');
            container.style.transform = 'translateY(100%)';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            container.offsetHeight; // force reflow
            container.style.transform = 'translateY(0)';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        }

        export function closeModalAnimation(overlayId, containerId) {
            const overlay = document.getElementById(overlayId);
            const container = document.getElementById(containerId);
            if (!overlay || !container) return;
            container.style.transform = 'translateY(100%)';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            setTimeout(() => {
                overlay.classList.add('hidden');
                container.style.transform = ''; 
            }, 300);
        }

        export function closeModal() {state.wishSourceId = null; closeModalAnimation('modal-overlay', 'modal-container'); }
        export function closeActionModal() { closeModalAnimation('action-modal-overlay', 'action-modal-container'); }

        export function setTempType(type) { //切換消費/售出
            state.tempType = type;
            const isExp = type === 'expense';
            const btnExp = document.getElementById('btn-type-exp');
            const btnInc = document.getElementById('btn-type-inc');
            if(btnExp && btnInc) {
                btnExp.className = `flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isExp ? 'active shadow-sm' : 'text-slate-400'}`;
                btnInc.className = `flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!isExp ? 'active shadow-sm income' : 'text-slate-400'}`;
            }
            const shippingFee = document.getElementById('shipping-fee');
            const shippingPay = document.getElementById('shipping-payment');
            const shippingState = document.getElementById('shipping-state');
            const statusSelect = document.getElementById('m-status');
            if (statusSelect) {
                const optionsToShow = isExp  ? arrivalOptions.filter(o => o !== '已售出') : ['已售出'];
                statusSelect.innerHTML = optionsToShow.map(o => `<option value="${o}">${o}</option>`).join('');
                //if (!isExp) { statusSelect.value = '已售出'; }
                //編輯時補回原本的狀態
                if (!isExp) {
                    // 售出模式
                    if (state.editingId !== null) {
                        const item = state.expenses.find(e => e.id === state.editingId);
                        statusSelect.value = '已售出';
                    } else {
                        statusSelect.value = '已售出';
                    }
                } else if (state.editingId !== null) {
                    // 消費模式，編輯時還原原本狀態
                    const item = state.expenses.find(e => e.id === state.editingId);
                   // if (item?.arrivalStatus) statusSelect.value = item.arrivalStatus;
                   if (item?.arrivalStatus) {
                        // 如果原本是已售出切換回消費模式，改成未到貨
                        statusSelect.value = item.arrivalStatus === '已售出' ? '未到貨' : item.arrivalStatus;
                    }
                    
                }
            }
           if (isExp) {
                shippingFee.classList.remove('hidden');
                shippingState.classList.remove('hidden');
                shippingPay.classList.remove('hidden');
            } else {
                shippingFee.classList.add('hidden');
                shippingPay.classList.add('hidden');
            }
        }

        export function renderWishList(container) {
            // 1. 根據目前選中的分類過濾清單
            const filtered = state.selectedCategory === '' 
                ? state.wishlist 
                : state.wishlist.filter(item => item.category === state.selectedCategory);

            container.innerHTML = `
                <div class="pt-6 px-6 sticky top-0 bg-brand/5 backdrop-blur-md z-30 border-b border-gray-100">
                    <h2 class="text-2xl font-black mb-4 tracking-tight text-slate-800">願望清單</h2>
                    <div id="wish-cat-bar" class="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1"></div>
                </div>

                <div class="p-6 space-y-4 pb-12">
                    ${filtered.length === 0 
                        ? `<div class="text-center py-24 text-slate-300 font-bold">
                            ${state.selectedCategory ? '此分類暫無願望' : '快許下新的願望吧！'}
                        </div>` 
                        : filtered.map(item => `
                        <div class="bg-white rounded-3xl p-4 flex flex-col gap-3 card-shadow relative overflow-hidden">
                            <div class="absolute top-4 right-4 z-10">
                                <button onclick="openActionModal(event,'wish', '${item.id}')" class="p-2 text-slate-300 hover:text-slate-600 active:scale-90 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                </button>
                            </div>
                            <div class="flex items-center gap-4" onclick="${item.image ? `openLightbox('${item.image}', '${item.name}', '${item.releaseDate || ''}')` : ''}">
                                ${item.image ? `<img src="${item.image}" class="w-16 h-16 object-cover rounded-2xl shadow-sm">` : `<div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">✨</div>`}
                                <div class="flex-grow pr-24">
                                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-brand mb-1 inline-block">${item.category || '一般'}</span>
                                    <h4 class="font-bold text-sm leading-tight text-slate-800">${item.name}</h4>
                                    <p class="text-xs font-black text-brand mt-1">$ ${Number(item.price).toLocaleString()}</p>
                                    ${item.releaseDate ? `<p class="text-[10px] text-slate-400 mt-1 font-bold">🗓️ ${item.releaseDate} ${item.releaseTime || ''}</p>` : ''}
                                </div>
                            </div>
                            ${item.remark ? `
                                <div class="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                                    <div class="bg-slate-50 p-2 rounded-xl mt-1 border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                                        <span class="text-brand font-bold mr-1 opacity-70">備註:</span>${item.remark}
                                    </div>
                                </div>` : ''}
                        </div>`).join('')}
                </div>`;

            // 渲染完 HTML 後，填充分類列
            renderWishCatBar();
        }
        export function renderWishCatBar() { // 渲染分類按鈕
            const bar = document.getElementById('wish-cat-bar');
            const currentCats = getCurrentWishCategories();
            if (!bar) return;
            
            bar.innerHTML = currentCats.map(cat => {
                const isActive = state.selectedCategory === cat;
                return `
                    <div onclick="state.selectedCategory=(state.selectedCategory==='${cat}'?'':'${cat}'); renderContent();"
                        class="chip ${isActive ? 'active-tag' : ''}">
                        ${cat}
                    </div>
                    `;
            }).join('');
        }
        export function getCurrentCategories() {
            const set = state.categorySet;
            const items = [...baseCategories[set]];
            const order = state.catOrder[set];
            if (!order) return items;
            return items.sort((a, b) => (order.indexOf(a.id) === -1 ? 99 : order.indexOf(a.id)) - (order.indexOf(b.id) === -1 ? 99 : order.indexOf(b.id)));
        }
        export function getCurrentWishCategories() {
            return state.WishcategorySet === 'wishCategories' ? wishCategories : wishCategoriesACGN;
        }
        export function switchCatSet(setName) {
            state.categorySet = setName;
            if(setName =='categories'){state.WishcategorySet = wishCategories;}else{state.WishcategorySet = wishCategoriesACGN;}
            state.selectedCategory = ''; // 切換組別時重設選擇
            localStorage.setItem('fe_cat_set', setName);
            renderContent();
            showToast(`已切換至 ${setName === 'categories' ? 'KPOP分類' : 'ACGN分類'}`);
        }

// 5. 掛載到全域 (為了相容 HTML 裡的 onclick)
// ---------------------------------------------------------

window.showToast = showToast;
window.switchTab = switchTab;
window.renderContent = renderContent;

window.renderExpenseListItems = renderExpenseListItems;
window.openAddModal = openAddModal;
window.openModalAnimation = openModalAnimation;
window.openAddModal = openAddModal;
window.openAddModal = openAddModal;

window.closeActionModal = closeActionModal;
window.closeModal = closeModal;
window.closeModalAnimation = closeModalAnimation;
window.setTempType = setTempType;
window.closeModal = () => {
    document.getElementById('modal-overlay').classList.add('hidden');
};
window.renderWishList = renderWishList;
window.renderWishCatBar = renderWishCatBar;

window.getCurrentCategories = getCurrentCategories;
window.getCurrentWishCategories = getCurrentWishCategories;
window.switchCatSet = switchCatSet;

window.changePage = (delta) => {
    window.state.currentPage += delta;
    renderExpenseListItems(document.getElementById('expense-list-items'));
};