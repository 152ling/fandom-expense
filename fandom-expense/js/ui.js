import { state } from './state.js';
import { baseCategories, arrivalOptions,wishCategories,wishCategoriesACGN,paymentOptions } from './constants.js';
import { renderExpenseList } from './expenseList.js';

    export function showToast(msg) {
        const t = document.getElementById("toast");
        if(!t) return;
        t.textContent = msg; t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 2000);
    }
        // 通用確認工具，會回傳 true 或 false
    export function askUser(title, desc, icon = '💸') {
            const overlay = document.getElementById('common-confirm-overlay');
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-desc').textContent = desc;
            document.getElementById('confirm-icon').textContent = icon;
            
            // 根據圖示自動調整背景色（如果是垃圾桶就變紅色系，否則用品牌色）
            const iconBg = document.getElementById('confirm-icon');
            if (icon === '🗑️') {
                iconBg.className = "w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl";
            } else {
                iconBg.className = "w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4 text-2xl";
            }

            overlay.classList.remove('hidden');

            return new Promise((resolve) => {
                document.getElementById('confirm-btn-ok').onclick = () => { overlay.classList.add('hidden'); resolve(true); };
                document.getElementById('confirm-btn-cancel').onclick = () => { overlay.classList.add('hidden'); resolve(false); };
            });
        }
    /**滑動關閉編輯邏輯 */
        let touchStartY = 0;
        let isDragging = false;
    export    function initSwipeToClose() {
            const container = document.getElementById('action-modal-container');
            const overlay = document.getElementById('action-modal-overlay');
            
            container.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                isDragging = true;
                container.classList.add('dragging');
            }, { passive: true });

            container.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - touchStartY;
                
                if (deltaY > 0) { // 只有向下劃時有反應
                    container.style.transform = `translateY(${deltaY}px)`;
                    // 背景透明度隨滑動距離變淡
                    const opacity = Math.max(0, 0.6 - (deltaY / 500));
                    overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
                }
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;
                container.classList.remove('dragging');
                
                const currentY = e.changedTouches[0].clientY;
                const deltaY = currentY - touchStartY;

                if (deltaY > 120) { // 滑動門檻：120px
                    closeActionModal();
                } else {
                    // 彈回原位
                    container.style.transform = 'translateY(0)';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                }
            });
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


        export function openAddModal(itemData = null) {
            state.editingId = (itemData?.id && !itemData?.isCopy) ? String(itemData.id) : null;
            // 初始化清空
            state.tempImages = [];
            state.tempImageBase64 = [];
            state.tempImageBlob = null; // 新增：清空 Blob
            // 修改判斷邏輯：如果資料裡有 qty，或者目前確實在 expense 分頁，才顯示消費模式
            const isWishMode = (state.activeTab === 'wish' && !itemData?.qty);
            const form = document.getElementById('data-form');
            const modalTitle = document.getElementById('modal-title');
            if (itemData) {
                // 抓取圖片網址（兼容單圖與多圖）
                const itemImgs = Array.isArray(itemData.images) ? [...itemData.images] : (itemData.image ? [itemData.image] : []);
                // 無論是編輯、複製還是轉換，只要圖片網址是 http 開頭，就代表已經在雲端了
                const cloudImages = itemImgs.filter(url => url.startsWith('http'));
                const localImages = itemImgs.filter(url => url.startsWith('data:'));
                // if (state.editingId) {
                //     state.tempImages = itemImgs; // 編輯模式：放進「已存在」
                // } else {
                //     if (isWishMode) {
                //         // 願望模式複製：把網址暫存，待會 saveData 會處理
                //         // 這裡我們直接把網址塞進 tempImageBase64 偷懶讓 saveData 去跑 fetch
                //         state.tempImageBase64 = itemImgs;
                //     } else {
                //         state.tempImageBase64 = itemImgs; // 消費模式複製
                //     }
                // }
                if (state.editingId || state.wishSourceId) {
                    // 如果是編輯、從願望轉換，現有的雲端圖片應該放進 tempImages
                    // 這樣 saveData 就不會重新上傳它們
                    state.tempImages = cloudImages;
                    state.tempImageBase64 = localImages; 
                } else {
                    // 全新新增的情況（理論上不會有 http 網址）
                    state.tempImageBase64 = itemImgs;
                }
            }

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
                                <label class="text-[10px] font-bold text-slate-400 uppercase">運費/二補</label>
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
        export function handlePaymentChange(val) {
            const amountContainer = document.getElementById('paid-amount-container');
            if (amountContainer) {
                amountContainer.classList.toggle('hidden', val !== '已付訂金');
            }
        }
    export function initQtyPicker() { //數量選擇
        const input = document.getElementById('m-qty');
        const list = document.getElementById('qty-options');
        const toggle = document.getElementById('qty-toggle');
        const arrow = toggle.querySelector('svg');
        list.innerHTML = Array.from({length: 10}, (_, i) => i + 1).map(num => `<li class="px-4 py-3 text-sm hover:bg-slate-50 cursor-pointer text-gray-700 border-b border-slate-50 last:border-none font-bold" data-val="${num}">${num}</li>`).join('');
        const toggleShow = (show) => { list.classList.toggle('hidden', !show); arrow.style.transform = show ? 'rotate(180deg)' : 'rotate(0deg)'; };
        input.addEventListener('focus', () => toggleShow(true));
        toggle.onclick = (e) => { e.stopPropagation(); toggleShow(list.classList.contains('hidden')); };
        list.querySelectorAll('li').forEach(li => { li.onclick = () => { input.value = li.dataset.val; toggleShow(false); }; });
        document.addEventListener('click', (e) => { if (!document.getElementById('qty-combobox')?.contains(e.target)) toggleShow(false); }, { once: true });
    }

            //--- 圖片預覽3張與處理 ---
    export function updateImagePreviewUI() {
            const container = document.getElementById('img-preview-row');
            if (!container) return;
            // 核心防呆：確保變數一定是陣列，避免 forEach 讀取 undefined
            const urls = state.tempImages || [];
            const b64s = state.tempImageBase64 || [];
            
            let html = '';
            // 渲染已儲存的 URL
            urls.forEach((src, i) => {
                html += `
                    <div class="img-preview-chip">
                        <img src="${src}" class="w-full h-full object-cover">
                        <button type="button" onclick="removeImg(${i}, 'url')" class="img-delete-btn">✕</button>
                    </div>`;
            });
            // 渲染新選取的 Base64
            b64s.forEach((b64, i) => {
                html += `
                    <div class="img-preview-chip opacity-80">
                        <img src="${b64}" class="w-full h-full object-cover">
                        <button type="button" onclick="removeImg(${i}, 'b64')" class="img-delete-btn">✕</button>
                    </div>`;
            });

            // 如果沒滿，顯示增加按鈕
            if (urls.length + b64s.length < 3) {
                html += `
                    <div onclick="document.getElementById('m-img-input').click()" class="flex-shrink-0 w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-2xl">＋</div>`;
            }
            
            container.innerHTML = html;
        }
        export function removeImg(idx, type) {
            if (type === 'url') state.tempImages.splice(idx, 1);
            else state.tempImageBase64.splice(idx, 1);
            updateImagePreviewUI();
        }

    export function openActionModal(e, type, id) { //共用編輯彈窗
            e.stopPropagation();
            state.actionTarget = { type, id };
            
            const convertBtn = document.getElementById('action-convert-btn');
            if (convertBtn) {
                // 如果點擊的是「心願清單 (wish)」，才顯示轉換按鈕
                if (type === 'wish') {
                    convertBtn.classList.remove('hidden');
                } else {
                    convertBtn.classList.add('hidden');
                }
            }
            
            // 呼叫動畫開啟
            openModalAnimation('action-modal-overlay', 'action-modal-container');
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
        export function toggleWishDateInput(show) {
            const container = document.getElementById('wish-date-container');
            if (container) container.classList.toggle('hidden', !show);
            // 如果取消勾選，主動清空欄位值，確保 UI 與邏輯一致
            if (!show) {
                const dateInput = document.getElementById('m-release-date');
                const timeInput = document.getElementById('m-release-time');
                if (dateInput) dateInput.value = '';
                if (timeInput) timeInput.value = '';
            }
        }



        // --- 財務報表 ---
        function changeReportType(type) {
            state.reportType = type;
            renderContent(); // 重新渲染報表
        }
        function renderReport(container) {
            const rangeData = calculateReportRange();
            const currentCats = getCurrentCategories();
            const currentCatIds = currentCats.map(c => c.id);
            // 1. 過濾出該時段的所有紀錄
            const periodRecords = state.expenses.filter(ex => {
                const d = new Date(ex.year, ex.month - 1);
                const dateMatch = d >= rangeData.start && d <= rangeData.end;
                const categoryMatch = currentCatIds.includes(ex.category);
                return dateMatch && categoryMatch;
            });

            // 2. 基本金額計算
            const totalExp = periodRecords.filter(i => i.type !== 'income').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
            const totalInc = periodRecords.filter(i => i.type === 'income').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
            const netBalance = totalExp - totalInc;

            // 3. 判斷目前的報表模式 (expense / income / net)
            const reportMode = (totalInc > 0) ? (state.reportType || 'expense') : 'expense';
            let stats = [];
            let chartTitle = "";
            let centerAmount = 0;

            if (reportMode === 'net') {
                // --- 淨支出模式：顯示 支出 vs 收入 的對比 ---
                chartTitle = "淨支出";
                centerAmount = netBalance;
                stats = [
                    { id: '總支出', amount: totalExp, color: '#92A8D1', icon: '💸' },
                    { id: '總收入', amount: totalInc, color: '#10b981', icon: '💰' }
                ].filter(s => s.amount > 0);
            } else {
                // --- 支出或收入模式：顯示詳細分類 ---
                const isInc = reportMode === 'income';
                const targetRecords = periodRecords.filter(i => (isInc ? i.type === 'income' : i.type !== 'income'));
                chartTitle = isInc ? "總收入" : "總支出";
                centerAmount = isInc ? totalInc : totalExp;
                const currentCats = getCurrentCategories();
                stats = currentCats.map(cat => ({
                    ...cat,
                    amount: targetRecords
                        .filter(ex => ex.category === cat.id)
                        .reduce((sum, item) => sum + (Number(item.total) || 0), 0)
                })).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount);
            }

            const formatAmt = (num) => state.hideAmount ? '•••' : num.toLocaleString();
            
            container.innerHTML = `
                <div class="p-6">
                    <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">財務分析報告</h2>
                    
                    <div class="flex flex-col gap-4 mb-8">
                        <div class="flex bg-slate-200/50 p-1 rounded-2xl">
                            ${['month', '6months', 'year'].map(r => `
                                <button onclick="changeReportRange('${r}')" class="report-range-btn flex-1 py-2 text-xs font-bold rounded-xl transition-all ${state.reportRange === r ? 'active' : ''}">
                                    ${r === 'month' ? '月' : r === 'year' ? '年' : '近 6 個月'}
                                </button>
                            `).join('')}
                        </div>
                        <div class="flex justify-between items-center bg-white p-4 rounded-2xl card-shadow">
                            <button onclick="shiftRange(-1)" class="p-2 text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg></button>
                            <span class="text-sm font-black text-slate-700">${rangeData.label}</span>
                            <button onclick="shiftRange(1)" class="p-2 text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2"/></svg></button>
                        </div>
                    </div>
                    ${totalInc > 0 ? `
                        <div class="grid grid-cols-3 gap-3 mb-8">
                            <div onclick="changeReportType('expense')" 
                                class="cursor-pointer transition-all ${reportMode === 'expense' ? 'bg-brand shadow-lg' : 'bg-white/60'} p-3 rounded-2xl card-shadow text-center">
                                <p class="text-[9px] font-bold ${reportMode === 'expense' ? 'text-white' : 'text-slate-400'} uppercase mb-1">總支出</p>
                                <p class="text-sm font-black ${reportMode === 'expense' ? 'text-white' : 'text-slate-700'}">$${formatAmt(totalExp)}</p>
                            </div>
                            <div onclick="changeReportType('income')" 
                                class="cursor-pointer transition-all ${reportMode === 'income' ? 'bg-brand shadow-lg' : 'bg-white/60'} p-3 rounded-2xl card-shadow text-center">
                                <p class="text-[9px] font-bold ${reportMode === 'income' ? 'text-white' : 'text-emerald-400'} uppercase mb-1">總收入</p>
                                <p class="text-sm font-black ${reportMode === 'income' ? 'text-white' : 'text-emerald-400'}">+$${formatAmt(totalInc)}</p>
                            </div>
                            <div onclick="changeReportType('net')" 
                                class="cursor-pointer transition-all ${reportMode === 'net' ? 'bg-brand shadow-lg' : 'bg-white/60'} p-3 rounded-2xl card-shadow text-center">
                                <p class="text-[9px] font-bold ${reportMode === 'net' ? 'text-white' : 'text-slate-400'} uppercase mb-1">淨支出</p>
                                <p class="text-sm font-black ${reportMode === 'net' ? 'text-white' : 'text-slate-700'}">$${formatAmt(netBalance)}</p>
                            </div>
                        </div>
                    ` : ``
                    }

                    ${stats.length > 0 ? `
                        <div class="bg-white rounded-3xl p-6 card-shadow mb-8 relative">
                            <div class="w-full max-w-[240px] mx-auto relative">
                                <canvas id="donutChart"></canvas>
                                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${chartTitle}</span>
                                    <span class="text-xl font-black text-slate-800">$${formatAmt(centerAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h3 class="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
                                ${reportMode === 'net' ? '收支平衡分析' : (reportMode === 'income' ? '收入來源排名' : '支出佔比排名')}
                            </h3>
                            ${stats.map(s => { 
                                const p = ((s.amount / (reportMode === 'net' ? (totalExp + totalInc) : centerAmount)) * 100).toFixed(1); 
                                return `
                                    <div class="bg-white rounded-2xl p-4 card-shadow flex items-center gap-4 border-l-4" style="border-color:${s.color}">
                                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background-color:${s.color}20">${s.icon}</div>
                                        <div class="flex-grow">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="text-sm font-bold text-slate-700">${s.id}</span>
                                                <span class="text-xs font-black text-slate-400">${p} %</span>
                                            </div>
                                            <div class="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                                <div class="h-full rounded-full transition-all duration-1000" style="width:${p}%; background-color:${s.color}"></div>
                                            </div>
                                        </div>
                                        <div class="text-right flex-shrink-0 font-black text-slate-800">$${formatAmt(s.amount)}</div>
                                    </div>`; 
                            }).join('')}
                        </div>
                    ` : `
                        <div class="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 font-bold text-slate-300">
                            目前時段尚無數據可分析
                        </div>
                    `}
                </div>`;

            if (stats.length > 0) initChart(stats);
        }
        /*** 報表範圍切換 (月/半年/年)*/
        function changeReportRange(range) {
            state.reportRange = range;
            state.reportOffset = 0; // 切換時重設偏移量
            renderContent();
        }

        //報表時間軸前後移動
        function shiftRange(delta) {
            state.reportOffset += delta;
            renderContent();
        }
        
        function calculateReportRange() {
            let start, end, label; const now = new Date();
            if (state.reportRange === 'month') { start = new Date(now.getFullYear(), now.getMonth() + state.reportOffset, 1); end = new Date(start.getFullYear(), start.getMonth() + 1, 0); label = `${start.getFullYear()} 年 ${start.getMonth() + 1} 月`; }
            else if (state.reportRange === '6months') { end = new Date(now.getFullYear(), now.getMonth() + state.reportOffset + 1, 0); start = new Date(end.getFullYear(), end.getMonth() - 5, 1); label = `${start.getFullYear()}.${start.getMonth()+1} ～ ${end.getFullYear()}.${end.getMonth()+1}`; }
            else { start = new Date(now.getFullYear() + state.reportOffset, 0, 1); end = new Date(start.getFullYear(), 11, 31); label = `${start.getFullYear()} 年度報告`; }
            return { start, end, label };
        }
        let myChart = null;
        function initChart(stats) {
            const ctx = document.getElementById('donutChart'); if (!ctx) return;
            if (myChart) myChart.destroy();
            myChart = new Chart(ctx, { type: 'doughnut', data: { labels: stats.map(s => s.id), datasets: [{ data: stats.map(s => s.amount), backgroundColor: stats.map(s => s.color), borderWidth: 0 }] }, options: { cutout: '75%', plugins: { legend: { display: false } } } });
        }

        //設定
        function renderSettings(container) {
            container.innerHTML = `
            <div class="p-6 h-screen"><h2 class="text-2xl font-black mb-8 tracking-tight" onclick="handleSecretClick()">設定</h2>
                <div class="bg-white rounded-3xl p-5 card-shadow mb-8 flex items-center gap-4 ">
                    <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-50 border-2 border-brand/20 flex items-center justify-center">
                        ${state.user 
                        ? `<img src="${state.user.photoURL}" class="w-full h-full object-cover" alt="使用者頭像">` 
                        : `<span class="text-xl">👤</span>`}
                    </div>
                    
                    <div class="flex-grow">
                        <h4 class="font-bold text-slate-800 text-sm">
                        ${state.user ? (state.user.displayName || 'Google 用戶') : '訪客模式'}
                        </h4>
                        <p class="text-[10px] text-slate-400">
                        ${state.user ? '雲端資料已同步 ☁️' : '登入後開啟雲端備份'}
                        </p>
                    </div>
                    
                    <div>
                        ${state.user 
                        ? `<button onclick="window.cloud.logout()" class="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl active:scale-95 transition-all">登出</button>` 
                        : `<button onclick="window.cloud.login()" class="text-xs bg-brand text-white font-bold px-4 py-2 rounded-xl shadow-md active:scale-95 transition-transform">登入</button>`}
                    </div>
                    </div>
                <div class="bg-white rounded-3xl overflow-hidden card-shadow">
                    <div onclick="state.subPage = 'photowall'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-slate-50"><div class="flex items-center gap-4 text-brand"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2"/></svg><span class="font-bold text-slate-700">我的照片牆</span></div><span>▶</span></div>
                    <div onclick="state.subPage = 'appearance'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-slate-50"><div class="flex items-center gap-4 text-brand"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" stroke-width="2"/></svg><span class="font-bold text-slate-700">外觀設定</span></div><span>▶</span></div>
                    <div onclick="state.subPage = 'backup'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-slate-50"><div class="flex items-center gap-4 text-brand"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke-width="2"/></svg><span class="font-bold text-slate-700">數據匯入與匯出</span></div><span>▶</span></div>
                    <div onclick="state.subPage = 'accountConfig'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-slate-50">
                        <div class="flex items-center gap-4 text-brand">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            <span class="font-bold text-slate-700">帳本與功能</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] text-slate-300 font-bold">${state.categorySet === 'categories' ? 'KPOP' : 'ACGN'}${state.enableExchange ? ' / 匯率開' : ''}</span>
                            <span>▶</span>
                        </div>
                    </div>              
                    <div onclick="state.subPage = 'version'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-slate-50">
                        <div class="flex items-center gap-4 text-brand">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="font-bold text-slate-700">版本說明</span></div>
                        <div class="flex items-center gap-2"><span class="text-[10px] text-slate-300 font-mono text-right">v9.0</span><span>▶</span></div>
                    </div>
                    <div onclick="state.subPage = 'faq'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer">
                        <div class="flex items-center gap-4 text-brand">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg><span class="font-bold text-slate-700">常見問題與幫助</span></div>
                        <div class="flex items-center gap-2"><span>▶</span></div>
                    </div>

                </div>
                        

            </div>
                `;
        }
        let secretClickCount = 0;
        let secretClickTimer = null;

        export function handleSecretClick() { // 在設定頁面標題被點擊時呼叫清除多餘圖檔
            secretClickCount++;

            // 如果 3 秒內沒有再次點擊，就重置計數
            clearTimeout(secretClickTimer);
            secretClickTimer = setTimeout(() => {
                // 如果只點了 1 或 2 次，就當作正常的頁面切換
                if (secretClickCount < 3) {
                    state.subPage = 'accountConfig';
                    renderContent();
                }
                secretClickCount = 0;
            }, 500); // 500 毫秒內的連點才算數

            // 當連點滿 3 次時
            if (secretClickCount === 3) {
                clearTimeout(secretClickTimer);
                secretClickCount = 0;
                // 執行你的隱藏功能
                if (window.runStorageCleanup) {
                    window.runStorageCleanup();
                }
            }
        }
        window.handleSecretClick = handleSecretClick;
        //我的照片牆
        function renderPhotoWall(container) {
            const isWishWall = state.photoWallTab === 'wish';
            // 根據標籤決定資料來源與分類清單
            const dataSource = isWishWall ? state.wishlist : state.expenses;
            const BuyCats = getCurrentCategories();
            const WishCats = getCurrentWishCategories();
            const currentCats = isWishWall ? WishCats : BuyCats.map(c => c.id);

            // 取得有照片的資料並過濾分類
            let photos = dataSource.filter(i => i.image && i.type !== 'income');
            if (state.photoFilterCat && state.photoFilterCat !== '') {
                photos = photos.filter(p => p.category === state.photoFilterCat);
            }
            photos.sort((a, b) => 
                Number(b.year) - Number(a.year) ||
                Number(b.month) - Number(a.month) ||
                Number(b.day || 1) - Number(a.day || 1) ||
                Number(b.id) - Number(a.id)
            );

            container.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-center gap-3 mb-2">
                        <div class="flex items-center gap-3 mb-2">
                            <button onclick="state.subPage=null;state.photoFilterCat='';renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90 font-bold">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg>
                            </button>
                            <h2 class="text-2xl font-black tracking-tight text-slate-800">照片牆</h2>
                        </div>
                    </div>

                    <div class="flex border-b border-gray-100 mb-2">
                        <button onclick="state.photoWallTab='purchased';state.photoFilterCat='';renderContent()" 
                            class="photo-tab flex-1 pb-3 text-sm font-bold ${state.photoWallTab==='purchased'?'active':'text-gray-400'}">已購買</button>
                        <button onclick="state.photoWallTab='wish';state.photoFilterCat='';renderContent()" 
                            class="photo-tab flex-1 pb-3 text-sm font-bold ${state.photoWallTab==='wish'?'active':'text-gray-400'}">心願牆</button>
                    </div>

                    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                        <div onclick="state.photoFilterCat='';renderContent()" 
                            class="chip ${state.photoFilterCat === '' ? 'active-tag' : ''}">全部</div>
                        ${currentCats.map(c => `
                            <div onclick="state.photoFilterCat='${c}';renderContent()" 
                                class="chip ${state.photoFilterCat === c ? 'active-tag' : ''}">${c.split(' ')[0]}</div>
                        `).join('')}
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-20">
                        ${photos.length > 0 ? photos.map(item => `
                            <div onclick="openLightbox('${item.image}', '${item.name}', '${isWishWall ? (item.category || '一般') : (item.year + '/' + item.month)}')" 
                                class="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-all">
                                <img src="${item.image}" class="w-full h-full object-cover">
                            </div>
                        `).join('') : `
                            <div class="col-span-full py-24 text-center text-slate-300 font-bold">目前尚無照片</div>
                        `}
                    </div>
                </div>`;
             // 修正：渲染完後，自動將啟動中的 Chip 捲動到可視範圍
            requestAnimationFrame(() => {
                const activeChip = container.querySelector('.active-tag');
                if (activeChip) {
                    activeChip.scrollIntoView({
                        behavior: 'auto', // 直接切換
                        inline: 'center',   // 將該元素置中顯示
                        block: 'nearest'    // 垂直方向不變
                    });
                }
            });
        }

        // --- 外觀設定 ---
        function renderAppearanceView(container) {
            const presets = [
                {name:'粉藍', c:'svt', g: 'linear-gradient(135deg, #F7CAC9 0%, #92A8D1 100%)'},
                {name:'幻紫', c:'#BB96FF'},
                {name:'沁藍', c:'#69C4E0'},
                {name:'螢綠', c:'#B6ED00'},
                {name:'極光', c:'#6C3591'},
                {name:'熠金', c:'#E2B216'}
            ];
            const currentHex = (state.themeColor && state.themeColor.startsWith('#')) ? state.themeColor : '';
            const isCustomGrad = state.themeColor.includes('gradient') && state.themeColor !== 'svt';
            const btnGrad = isCustomGrad ? state.themeColor : 'linear-gradient(135deg, #FEBEBE 0%,#85D0FF 100%)';
            container.innerHTML = `
                    <div class="p-6">
                        <div class="flex items-center gap-3 mb-8">
                            <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg>
                            </button>
                            <h2 class="text-2xl font-black tracking-tight text-slate-800">外觀設定</h2>
                        </div>
                        
                        <div class="bg-white rounded-3xl p-6 card-shadow text-slate-800">
                            <div class="flex mb-6 justify-between">
                                <h3 class="text-sm font-bold text-slate-500 tracking-wide">選擇預設主題</h3>
                                <div class="flex justify-center border-slate-50">
                                    <label class="inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="grad-dark-toggle" class="sr-only peer" onchange="toggleDarkMode(this.checked)" ${document.body.classList.contains('dark-mode') ? 'checked' : ''}>
                                        <div class="relative w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                                    after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                                    after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all 
                                                    peer-checked:bg-slate-700"></div>
                                        
                                        <span class="select-none text-sm font-bold text-slate-500">深色模式</span>
                                    </label>
                                </div>
                            </div>
                            <div class="grid grid-cols-4 gap-y-8 gap-x-4 place-items-center mb-10">
                                ${presets.map(p => `
                                    <div class="flex flex-col items-center gap-2">
                                        <div onclick="applyTheme('${p.c}');renderContent()" 
                                            class="color-preset ${state.themeColor===p.c?'active':''}" 
                                            style="background:${p.g || p.c}"></div>
                                        <span class="text-[10px] font-bold text-slate-400">${p.name}</span>
                                    </div>
                                `).join('')}
                                <div class="flex flex-col items-center gap-2">
                                    <input type="color" onchange="applyTheme(this.value);renderContent()" 
                                        value="${state.themeColor==='svt'?'#92A8D1':state.themeColor==='bp'?'#FF85D0':state.themeColor}" 
                                        class="w-10 h-10 rounded-full border-none cursor-pointer bg-slate-200 shadow-sm">
                                    <span class="text-[10px] font-bold text-slate-400">滴管選色</span>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <div onclick="openGradModal()" 
                                        class="color-preset flex items-center justify-center text-white text-[10px] font-bold ${state.themeColor.includes('gradient') && state.themeColor!=='svt'?'active':''}" 
                                        style="background:white">🎨</div>
                                    <span class="text-[10px] font-bold text-slate-400">自訂漸層</span>
                                </div>
                            </div>

                            <div class="mt-8 pt-6 border-t border-slate-50">
                                <h3 class="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">輸入自訂色碼</h3>
                                <div class="flex gap-2">
                                    <input type="text" id="custom-hex-input" placeholder="#RRGGBB" 
                                        value="${currentHex}"
                                        class="flex-grow bg-slate-50 border-2 border-transparent focus:border-brand rounded-2xl px-4 py-3 text-sm outline-none font-mono text-slate-700">
                                    <button onclick="applyHexColor()" 
                                            class="bg-brand text-white font-bold px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-all">
                                        套用
                                    </button>
                                </div>
                                <p class="text-[10px] text-slate-300 mt-2 ml-1">請輸入包含 # 的六位數色碼，例如 #92A8D1</p>
                            </div>
                        </div>
                    </div>`;
            }
        export function toggleDarkMode(isDark) {
            // 套用目前的顏色，但傳入新的深淺設定
            applyTheme(state.themeColor, isDark);
            showToast(isDark ? "深色模式已開啟" : "深色模式已關閉");
        }
        export function applyHexColor() {
            const hexInput = document.getElementById('custom-hex-input');
            const color = hexInput.value.trim();
            
            // 驗證格式是否為有效的 Hex 色碼 (例如 #FFFFFF 或 #FFF)
            const isHex = /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
            
            if (isHex) {
                applyTheme(color);
                renderContent();
                showToast("已更換自訂主題色！");
            } else {
                showToast("格式錯誤！請輸入如 #92A8D1 的色碼");
            }
        }
        //漸層工具
        // 同步：輸入文字框 -> 色盤
        export function syncGradInput(id) {
            const inputEl = document.getElementById(`${id}-hex`);
            let hex = inputEl.value.trim();
            // 1. 自動補井字號
            if (hex.length > 0 && !hex.startsWith('#')) {
                hex = '#' + hex;
                inputEl.value = hex;
            }
            const isValid = /^#[0-9A-F]{6}$/i.test(hex);

            if (isValid) {
                document.getElementById(`${id}-picker`).value = hex;
                inputEl.style.borderColor = 'transparent'; // 移除紅框
                updateGradPreview();
            } else {// 如果長度已經夠了(7碼)但格式不對，或是輸入中
                if (hex.length >= 7) {
                    inputEl.style.borderColor = '#ef4444'; 
                } else {
                    inputEl.style.borderColor = 'transparent';
                }
            }
        }

        // 同步：色盤 -> 輸入文字框
        export function syncGradPicker(id) {
            const val = document.getElementById(`${id}-picker`).value;
            document.getElementById(`${id}-hex`).value = val.toUpperCase();
            updateGradPreview();
        }

        // 更新預覽區
        function updateGradPreview() {
            const c1 = document.getElementById('g1-picker').value;
            const c2 = document.getElementById('g2-picker').value;
            document.getElementById('grad-preview-box').style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
        }

        // 開啟並初始化彈窗
        export function openGradModal() {
            // 1. 顯示彈窗
            document.getElementById('grad-modal').classList.remove('hidden');
            
            // 2. 設定預設值 (避免沒抓到顏色時報錯)
            let color1 = "#F7CAC9"; 
            let color2 = "#92A8D1"; 

            // 3. 根據目前的狀態 state.themeColor 解析顏色
            if (state.themeColor.includes('gradient') && state.themeColor !== 'svt') {
                // 如果是自訂漸層，用正則表達式抓取色碼
                const matchedColors = state.themeColor.match(/#[A-Fa-f0-9]{3,6}/g);
                if (matchedColors && matchedColors.length >= 2) {
                    color1 = matchedColors[0];
                    color2 = matchedColors[1];
                }
            } else if (state.themeColor === 'svt') {
                color1 = "#F7CAC9";
                color2 = "#92A8D1";
            } else if (state.themeColor.startsWith('#')) {
                // 如果是純色，起始設為該色，結束設為白色
                color1 = state.themeColor;
                color2 = "#FFFFFF";
            }
            document.getElementById('g1-hex').value = color1.toUpperCase();
            document.getElementById('g1-picker').value = color1;
            document.getElementById('g2-hex').value = color2.toUpperCase();
            document.getElementById('g2-picker').value = color2;
            // 新增：偵測 body 是否有 dark-mode class，有的話就把開關打勾
            const isDark = document.body.classList.contains('dark-mode');
            document.getElementById('grad-dark-toggle').checked = isDark;
            updateGradPreview();
        }

    export function saveGrad() {
            const c1 = document.getElementById('g1-picker').value;
            const c2 = document.getElementById('g2-picker').value;
            const grad = `linear-gradient(135deg, ${c1}, ${c2})`;
            const isDark = document.getElementById('grad-dark-toggle').checked;
            // 套用主題，多傳一個 isDark 參數
            applyTheme(grad, isDark);
            document.getElementById('grad-modal').classList.add('hidden');
            renderContent();
            showToast("漸層已更新！");
        }

        //應用主題顏色
    export function applyTheme(color, isDarkMode = null) {
            state.themeColor = color;
            const root = document.documentElement;
            const body = document.body;

            // --- 深色模式判斷邏輯 ---
            let targetDark;
            
            if (isDarkMode !== null) {
                // 如果有從 saveGrad 傳進來 (true 或 false)，就用傳進來的
                targetDark = isDarkMode;
            } else {
                // 如果是點擊「粉藍」或其他預設顏色（只傳一個參數時），就讀取原本存的狀態
                targetDark = localStorage.getItem('fe_v11_darkMode') === 'true';
            }

            localStorage.setItem('fe_v11_darkMode', targetDark);
            if (targetDark) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }

            if (color === 'svt') {
                root.style.setProperty('--brand-color', '#92A8D1');
                root.style.setProperty('--brand-gradient', 'linear-gradient(135deg, #F7CAC9 0%, #92A8D1 100%)');
            } else if (color.includes('gradient')) {
                root.style.setProperty('--brand-gradient', color);
                const match = color.match(/#[A-Fa-f0-9]{6}/);
                root.style.setProperty('--brand-color', match ? match[0] : '#92A8D1');
            } else {
                root.style.setProperty('--brand-color', color);
                root.style.setProperty('--brand-gradient', color);
            }
            localStorage.setItem('fe_v11_theme', color);
        }



        // --- 數據匯入與匯出 ---
        function renderBackupView(container) {
            container.innerHTML = `<div class="p-6"><div class="flex items-center gap-3 mb-8"><button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg></button><h2 class="text-2xl font-black tracking-tight text-slate-800">匯入與匯出</h2></div>
                <div class="bg-white rounded-3xl p-8 card-shadow border-2 border-dashed border-slate-200 text-center text-slate-800"><div class="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">📊</div><h3 class="text-lg font-bold mb-2">Excel 管理</h3><p class="text-sm text-slate-400 mb-8 px-4">本地 Excel 備份不包含圖片資料<br>⚠️匯入後會覆蓋現有資料並清除圖片</p><div class="grid grid-cols-1 gap-4"><button onclick="exportToExcel()" class="bg-brand text-white font-black py-5 rounded-2xl shadow-lg active:scale-95 transition-transform">匯出 Excel 備份</button><label class="bg-slate-800 text-white font-black py-5 rounded-2xl active:scale-95 cursor-pointer text-center">匯入 Excel 還原<input type="file" class="hidden" accept=".xlsx, .xls" onchange="importFromExcel(this)"></label></div></div></div>`;
        }
        export function exportToExcel() {
            const wb = XLSX.utils.book_new();
            const headers = Object.values(excelHeaderMap);
            //const rows = state.expenses.map(i => { return Object.keys(excelHeaderMap).map(engKey => { let val = i[engKey]; if (engKey === 'tags' && Array.isArray(val)) return val.join(','); return (val !== undefined && val !== null) ? val : ""; }); });
            const sortedExpenses = [...state.expenses].sort((a, b) =>
                Number(a.year) - Number(b.year) ||
                Number(a.month) - Number(b.month) ||
                Number((a.day ?? 1)) - Number((b.day ?? 1)) ||
                Number(a.id) - Number(b.id)
            );
            const rows = sortedExpenses.map(i => { 
                return Object.keys(excelHeaderMap).map(engKey => { 
                    let val = i[engKey]; 
                    if (engKey === 'type') {
                        return (val === 'income') ? '售出' : '支出';
                    }
                    if (engKey === 'day' && val == null) {
                        val=1;
                    }
                    // 如果欄位是標籤且為陣列，則用逗號合併為字串
                    if (engKey === 'tags' && Array.isArray(val)) return val.join(', '); 
                    if (engKey === 'paidAmount') {
                        if (i.paymentMethod !== '已付訂金') {
                            return i.total;
                        }
                    };
                    return (val !== undefined && val !== null) ? val : ""; 
                }); 
            });
            const wsExp = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            XLSX.utils.book_append_sheet(wb, wsExp, "消費清單");
            XLSX.writeFile(wb, `追星記帳_備份_${new Date().toISOString().slice(0,10)}.xlsx`);
        }

    export async function importFromExcel(input) {
        const file = input.files[0];
        if (!file) return;
        const confirmed = await askUser(
            "確定要匯入資料嗎？", 
            "注意：匯入 Excel 會「完全覆蓋」目前的消費清單，原本的舊資料將會消失。建議匯入前先執行一次匯出備份。", 
            "⚠️"
        );

        // 2. 如果使用者點擊取消，則清空輸入框並中斷執行
        if (!confirmed) {
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                if (!workbook.SheetNames.includes("消費清單")) {
                    showToast("找不到「消費清單」工作表");
                    return;
                }

                const worksheet = workbook.Sheets["消費清單"];
                const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (aoa.length < 1) {
                    showToast("檔案為空");
                    return;
                }

                const fileHeaders = aoa[0].map(h => String(h || "").trim());
                const nameIdx = fileHeaders.indexOf("項目名稱");
                if (nameIdx === -1) {
                    showToast("找不到「項目名稱」欄位");
                    return;
                }

                // 準備預設值
                const now = new Date();
                const defaultYear = now.getFullYear();
                const defaultMonth = now.getMonth();//前一個月
                const defaultDay = 1;

                const importedData = [];

                for (let r = 1; r < aoa.length; r++) {
                    const row = aoa[r];
                    if (!row[nameIdx]) continue; // 如果沒有項目名稱則跳過

                    let item = { id: String(Date.now() + r), image: null };

                    Object.keys(excelHeaderMap).forEach(engKey => {
                        const chiKey = excelHeaderMap[engKey];
                        const colIdx = fileHeaders.indexOf(chiKey);
                        let val = colIdx > -1 ? row[colIdx] : undefined;

                        // 檢查值是否有效（非空且非 undefined）
                        const isEmpty = (val === undefined || val === null || String(val).trim() === "");
                        if (engKey === 'type') {
                            const typeStr = String(val || "").trim();
                            if (typeStr === '售出' || typeStr === 'income') {
                                item[engKey] = 'income';
                            } else {
                                item[engKey] = 'expense';
                            }
                        }
                        else if (engKey === 'tags') {
                            item[engKey] = isEmpty ? [] : String(val).split(',').map(t => t.trim());
                        } 
                        else if (engKey === 'qty') {// 數量預設為 1
                            item[engKey] = isEmpty ? 1 : (Number(val) || 1);
                        } 
                        else if (engKey === 'year') {// 年份預設為當前年份
                            item[engKey] = isEmpty ? defaultYear : Number(val);
                        } 
                        else if (engKey === 'month') { // 無月份則預設為前一個月
                            item[engKey] = isEmpty ? defaultMonth : Number(val);
                        } 
                        else if (engKey === 'day') {
                            item[engKey] = isEmpty ? defaultDay : Number(val);
                        } 
                        else if (engKey === 'category') { // 分類預設
                            item[engKey] = isEmpty ? "專輯" : String(val).trim();
                        } 
                        else if (engKey === 'arrivalStatus') {// 到貨狀態預設
                            item[engKey] = isEmpty ? "已到貨" : String(val).trim();
                        } 
                        else if (engKey === 'paymentMethod') { // 付款方式預設
                            item[engKey] = isEmpty ? "匯款全額" : String(val).trim();
                        } 
                        else if (['price', 'paidAmount','shipping'].includes(engKey)) {// 金額類預設為 0
                            item[engKey] = Number(val) || 0;
                        } 
                        else {// 其他字串欄位
                            item[engKey] = isEmpty ? "" : String(val).trim();
                        }
                    });
                    item.total =(Number(item.price) * Number(item.qty)) + Number(item.shipping);
                    if (item.paymentMethod !== '已付訂金') {
                        item.paidAmount = item.total; // 非訂金制則視為全額付清
                    }
                    importedData.push(item);
                }

                if (importedData.length > 0) {
                    state.expenses = importedData;
                    localStorage.setItem('fe_v11_expenses', JSON.stringify(state.expenses));
                    if (window.cloud) window.cloud.sync(state.expenses, state.wishlist);
                    renderContent();
                    showToast(`匯入成功：共 ${importedData.length} 筆，若無填寫日期請查看上個月的消費清單`);
                }
            } catch (err) {
                console.error(err);
                showToast("檔案格式錯誤");
            }
        };
        reader.readAsArrayBuffer(file);
        input.value = "";
    }
    //數據匯入與匯出end
    
    //清理雲端冗餘圖檔
    export async function runStorageCleanup() {
        // 1. 詢問使用者
        const confirmed = await askUser("啟動深層清理？", "正在優化雲端空間，安全移除重複或失效的圖檔。這需要一點時間，請放心，您的所有紀錄與相片都會妥善保留。", "🧹");
        if (!confirmed) return;

        showToast("正在掃描雲端檔案...");

        // 2. 收集目前所有紀錄中正在使用的圖片網址：同時收集新版 (images) 與舊版 (image) 欄位中的所有有效網址
        const activeUrls = [
            ...state.expenses.flatMap(ex => Array.isArray(ex.images) ? ex.images : (ex.image ? [ex.image] : [])),
            ...state.wishlist.flatMap(w => Array.isArray(w.images) ? w.images : (w.image ? [w.image] : []))
        ].filter(url => url); 

        // 3. 執行清理
        const count = await window.cloud.cleanupOrphanedFiles(activeUrls);

        if (count > 0) {
            showToast(`清理完成！共刪除了 ${count} 個冗餘圖檔`);
        } else if (count === 0) {
            showToast("雲端非常整潔，沒有需要清理的檔案");
        } else {
            showToast("清理過程發生錯誤");
        }
    }

        // --- 帳本與功能設定 ---
        function renderAccountConfig(container) {
        container.innerHTML = `
            <div class="p-6">
                <div class="flex items-center gap-3 mb-8">
                    <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90 font-bold text-xl">
                                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg>
                    </button>
                    
                    <h2 class="text-2xl font-black tracking-tight text-slate-800">帳本與功能</h2>
                </div>
                <div class="space-y-6">
                    <div class="bg-white rounded-3xl p-6 card-shadow">
                        <h3 class="text-sm font-bold text-slate-500 uppercase mb-4 tracking-widest">帳本分類模式</h3>
                        <div class="flex bg-slate-100 p-1 rounded-2xl">
                            <button onclick="switchCatSet('categories')" class="flex-1 py-3 text-sm font-bold rounded-xl transition-all ${state.categorySet === 'categories' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}">KPOP 模式</button>
                            <button onclick="switchCatSet('categoriesACGN')" class="flex-1 py-3 text-sm font-bold rounded-xl transition-all ${state.categorySet === 'categoriesACGN' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}">ACGN 模式</button>
                        </div>
                    </div>
                    <div class="bg-white rounded-3xl p-6 card-shadow">
                        <div class="flex items-center justify-between ${state.enableExchange ? 'mb-6 border-b border-slate-50' : ''}">
                            <div>
                                <h3 class="text-sm font-bold text-slate-500 tracking-widest">開啟匯率換算工具</h3>
                                <p class="text-[10px] text-slate-400">在新增紀錄時顯示外幣換算區</p>
                                <p class="text-[10px] text-slate-400">若在關閉時編輯紀錄，匯率資料會消失</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" onchange="toggleExchange(this.checked)" ${state.enableExchange ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-slate-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                     ${state.enableExchange ? `
                    <div class="animate-enter">
                        <h3 class="text-xs  text-slate-400 mb-4 tracking-widest uppercase">預設記帳幣別</h3>
                        <div class="relative">
                            <select onchange="updateDefaultCurrency(this.value)" class="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none border-2 border-transparent focus:border-brand appearance-none">
                                <option value="TWD" ${state.defaultCurrency === 'TWD' ? 'selected' : ''}>TWD - 新台幣</option>
                                <option value="HKD" ${state.defaultCurrency === 'HKD' ? 'selected' : ''}>HKD - 港幣</option>
                                <option value="USD" ${state.defaultCurrency === 'USD' ? 'selected' : ''}>USD - 美金</option>
                                <option value="JPY" ${state.defaultCurrency === 'JPY' ? 'selected' : ''}>JPY - 日圓</option>
                                <option value="KRW" ${state.defaultCurrency === 'KRW' ? 'selected' : ''}>KRW - 韓幣</option>
                                <option value="CNY" ${state.defaultCurrency === 'CNY' ? 'selected' : ''}>CNY - 人民幣</option>
                                <option value="MYR" ${state.defaultCurrency === 'MYR' ? 'selected' : ''}>MYR - 令吉</option>
                                <option value="SGD" ${state.defaultCurrency === 'SGD' ? 'selected' : ''}>SGD - 新加坡幣</option>
                                <option value="THB" ${state.defaultCurrency === 'THB' ? 'selected' : ''}>THB - 泰銖</option>
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-2 px-1">更改此處將會影響匯率換算的基準幣別。</p>
                    </div>
                    ` : ''}
                    </div>

                    <div class="space-y-4">
                        <div class="bg-white p-6 rounded-3xl card-shadow" onclick="state.subPage='catOrder'; renderContent();">
                            <div class="flex justify-between items-center cursor-pointer">
                                <div><h3 class="text-sm font-bold text-slate-500 tracking-widest">調整分類順序</h3><p class="text-[10px] text-slate-400">自訂最常用的分類顯示在最前面</p></div>
                                <span class="text-slate-300">▶</span>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>`;
        }
        export function switchCatSet(setName) {
            state.categorySet = setName;
            if(setName =='categories'){state.WishcategorySet = 'wishCategories';}else{state.WishcategorySet = 'wishCategoriesACGN';}
            state.selectedCategory = ''; // 切換組別時重設選擇
            localStorage.setItem('fe_cat_set', setName);
            renderContent();
            showToast(`已切換至 ${setName === 'categories' ? 'KPOP分類' : 'ACGN分類'}`);
        }
        export function updateDefaultCurrency(val) {
            state.defaultCurrency = val;
            localStorage.setItem('fe_v11_defaultCurrency', val);
            localStorage.removeItem('fandom_rates_timestamp'); //清除原本快取
            fetchRates(); 
            showToast(`預設幣別已更改為 ${val}`);
            renderContent();
        }

        export function toggleExchange(val) {
            state.enableExchange = val;
            localStorage.setItem('fe_v11_enableExchange', val);
            if (val) fetchRates();
            renderContent(); // 重新渲染以實現 toggle 效果
            showToast(val ? "已開啟換算工具" : "已關閉換算工具");
        }
     // 快取獲取匯率
        async function fetchRates() {
            if (!state.enableExchange) return;
            const CACHE_KEY = 'fandom_rates_data';
            const CACHE_TIME_KEY = 'fandom_rates_timestamp';
            const FIVE_DAY = 5 * 24 * 60 * 60 * 1000; // 5天的毫秒數

            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
            const now = Date.now();

            // 如果有快取且未過期，直接使用
            if (cachedData && cachedTime && (now - cachedTime < FIVE_DAY)) {
                state.rates = JSON.parse(cachedData);
                state.rateStatusText = "匯率已就緒 (快取)";
                console.log("Using cached rates from:", new Date(parseInt(cachedTime)).toLocaleString());
                return;
            }

            // 否則，向網路請求新的匯率
            state.rateStatusText = "正在更新最新匯率...";
            updateRateUI();
            try {
                const base = state.defaultCurrency || 'TWD';
                const res = await fetch(`https://v6.exchangerate-api.com/v6/50ae63bdd687e4ec0781ce85/latest/${base}`);
                const data = await res.json();
                if (data?.conversion_rates) {
                    const newRates = {
                        KRW: 1 / data.conversion_rates.KRW,
                        JPY: 1 / data.conversion_rates.JPY,
                        CNY: 1 / data.conversion_rates.CNY,
                        USD: 1 / data.conversion_rates.USD,
                        HKD: 1 / data.conversion_rates.HKD,
                        MYR: 1 / data.conversion_rates.MYR, // 增加馬來西亞
                        SGD: 1 / data.conversion_rates.SGD, // 增加新加坡
                        THB: 1 / data.conversion_rates.THB, // 增加泰銖
                        TWD: 1 / data.conversion_rates.TWD
                    };
                    // 更新狀態並存入本地儲存
                    state.rates = newRates;
                    localStorage.setItem(CACHE_KEY, JSON.stringify(newRates));
                    localStorage.setItem(CACHE_TIME_KEY, now.toString());
                    state.rateStatusText = "匯率已更新(網路)";
                    console.log("Rates updated from API");
                }
                else {
                    if (cachedData) state.rates = JSON.parse(cachedData);
                    state.rateStatusText = "匯率連線失敗，使用離線數據";
                }
            } catch (e) {
                console.warn("API 抓取失敗，使用預設值或舊快取",e);
                if (cachedData) state.rates = JSON.parse(cachedData);
                state.rateStatusText = "匯率連線失敗，使用離線數據";
            }
            updateRateUI();
        }
        // 更新介面上的文字 (若元素存在)
        function updateRateUI() {
            const tag = document.getElementById('rate-tag');
            if (tag) tag.innerText = state.rateStatusText;
        }
        export function convertCurrency() { //匯率換算
            const currency = document.getElementById('currency-select').value;
            const amount = parseFloat(document.getElementById('foreign-amount').value);
            const priceInput = document.getElementById('m-u-p');
            const rateTag = document.getElementById('rate-tag');

            if (!amount) return;

            const rate = state.rates[currency];
            const result = Math.round(amount * rate);
            
            priceInput.value = result;
            rateTag.innerText = `1 ${currency} ≈ ${rate.toFixed(4)} ${state.defaultCurrency}`;
            rateTag.classList.add('text-brand');
        }
        /**
         * --- 分類排序頁面渲染 ---
         */
        export function renderCategoryOrderView(container) {
            const set = state.categorySet;
            const currentCats = [...baseCategories[set]];
            // 取得當前排序，若無則按預設 id 順序
            const order = state.catOrder[set] || currentCats.map(c => c.id);
            // 如果 order.indexOf(id) 找不到 (-1)，則給予 99 讓它排在最後
            const sorted = [...currentCats].sort((a, b) => {
                const indexA = order.indexOf(a.id);
                const indexB = order.indexOf(b.id);
                const finalA = indexA === -1 ? 99 : indexA;
                const finalB = indexB === -1 ? 99 : indexB;
                return finalA - finalB;
            });
            // const sorted = [...currentCats].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

            container.innerHTML = `
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-8">
                        <button onclick="state.subPage='accountConfig';renderContent()" class="p-2 -ml-2 text-slate-400 font-bold active:scale-90 transition-all">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5"/></svg>
                        </button>
                        <h2 class="text-2xl font-black text-slate-800">排序分類</h2>
                    </div>

                    <div class="bg-white rounded-3xl m-4 p-2 card-shadow overflow-hidden" id="drag-list" style="touch-action: none;">
                        ${sorted.map((c, i) => `
                            <div class="drag-item flex items-center justify-between p-4 border-b last:border-0 bg-white group" 
                                data-id="${c.id}">
                                
                                <div class="flex items-center gap-3 flex-grow cursor-move handle">
                                    <span class="text-slate-300 group-active:text-brand transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <path d="M7 10h10M7 14h10" stroke-linecap="round"/>
                                        </svg>
                                    </span>
                                    <span class="font-bold text-slate-700 select-none">${c.icon} ${c.id}</span>
                                </div>

                                <div class="flex gap-1">
                                    <button onclick="moveCat('${c.id}', -1)" class="p-2 bg-slate-50 rounded-xl text-slate-400 active:bg-brand/10 active:text-brand disabled:opacity-10 transition-all" ${i === 0 ? 'disabled' : ''}>
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </button>
                                    <button onclick="moveCat('${c.id}', 1)" class="p-2 bg-slate-50 rounded-xl text-slate-400 active:bg-brand/10 active:text-brand disabled:opacity-10 transition-all" ${i === sorted.length - 1 ? 'disabled' : ''}>
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </button>
                                </div>
                            </div>`).join('')}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-6 text-center font-bold uppercase tracking-widest">可拖曳左側手柄或使用箭頭調整順序</p>
                </div>`;

            // 啟動拖曳監聽
            initUniversalSort();
        }

/**
 * --- 全域排序邏輯 (支援 Mouse & Touch) ---
 */
        function initUniversalSort() {
            const list = document.getElementById('drag-list');
            let dragEl = null;

            // 1. 指針按下：鎖定目標
            list.addEventListener('pointerdown', (e) => {
                const handle = e.target.closest('.handle');
                if (!handle) return;

                dragEl = handle.closest('.drag-item');
                dragEl.classList.add('drag-active');
                list.setPointerCapture(e.pointerId);
            });

            // 2. 指針移動：動態插入
            list.addEventListener('pointermove', (e) => {
                if (!dragEl) return;
                e.preventDefault();

                const target = document.elementFromPoint(e.clientX, e.clientY);
                const hoverEl = target?.closest('.drag-item');

                if (hoverEl && hoverEl !== dragEl) {
                    const rect = hoverEl.getBoundingClientRect();
                    // 判斷指針在目標的上半部還是下半部，決定插入位置
                    const isAfter = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    list.insertBefore(dragEl, isAfter ? hoverEl.nextSibling : hoverEl);
                }
            });

            // 3. 指針放開：清理與儲存
            const endHandler = (e) => {
                if (!dragEl) return;
                dragEl.classList.remove('drag-active');
                list.releasePointerCapture(e.pointerId);
                dragEl = null;
                debouncedSaveOrder();
                renderCategoryOrderView(document.getElementById('main-content')); // 重新渲染更新按鈕狀態
            };

            list.addEventListener('pointerup', endHandler);
            list.addEventListener('pointercancel', endHandler);
        }

        /**
         * --- 箭頭點擊移動邏輯 ---
         */
        export function moveCat(id, dir) {
            const list = document.getElementById('drag-list');
            const item = list.querySelector(`[data-id="${id}"]`);
            if (!item) return;

            if (dir === -1) {
                // 向上移：插入到前一個元素之前
                const prev = item.previousElementSibling;
                if (prev) list.insertBefore(item, prev);
            } else {
                // 向下移：插入到下一個元素之後 (即下下個元素之前)
                const next = item.nextElementSibling;
                if (next) list.insertBefore(item, next.nextElementSibling);
            }

            debouncedSaveOrder();
            renderCategoryOrderView(document.getElementById('main-content'));
        }

        /**
         * --- 儲存最新的分類排序至 Local & Cloud ---
         */
        let debounceTimer = null;

        /**
         * 靜默儲存順序，並延遲執行雲端同步與提示
         */
        export function debouncedSaveOrder() {
            // 1. 立即更新 State 並存入 LocalStorage (確保重新整理網頁時順序是對的)
            const list = document.getElementById('drag-list');
            if (!list) return;
            const newOrder = [...list.querySelectorAll('.drag-item')].map(el => el.dataset.id);
            state.catOrder[state.categorySet] = newOrder;
            localStorage.setItem('fe_v11_catOrder', JSON.stringify(state.catOrder));

            // 2. 清除之前的計時器，重新開始計時
            clearTimeout(debounceTimer);

            // 3. 設定延遲執行耗時動作 (2秒後沒動作才執行)
            debounceTimer = setTimeout(() => {
                showToast("分類排序已更新 ✨")
                // 執行雲端同步
                if (window.cloud?.sync) {
                    window.cloud.sync(state.expenses, state.wishlist)
                        .then(() => console.log("分類排序雲端同步成功"))
                        .catch(err => console.error("雲端同步失敗", err));
                } else {
                    // 如果沒登入雲端，至少給個本地存檔完成的提示
                    showToast("本地排序已更新 ✨");
                }
            }, 2000); 
        }
        export function saveNewOrder() {
            const list = document.getElementById('drag-list');
            if (!list) return;

            const items = [...list.querySelectorAll('.drag-item')];
            const newOrder = items.map(el => el.dataset.id);
            const set = state.categorySet;

            // 更新 State
            state.catOrder[set] = newOrder;

            // 儲存至本地
            localStorage.setItem('fe_v11_catOrder', JSON.stringify(state.catOrder));
            showToast("排序已儲存✨");

            // 同步至雲端
            if (window.cloud && typeof window.cloud.sync === 'function') {
                window.cloud.sync(state.expenses, state.wishlist)
                    .catch(err => showToast("排序同步失敗，請檢查網路或登入狀態", err));
            }
        }

        /**
         * --- 全域掛載 ---
         */
        window.moveCat = moveCat;
        window.saveNewOrder = saveNewOrder;

        // --- 版本說明 ---
        function renderVersionView(container) { 
            const logs = [
                { version: 'v9.0', date: '2026.03.15', updates: ['帳本與功能新增:調整分類順序','新增消費紀錄可上傳最多 3 張照片','新增 FAQ 頁面，可直接回報問題或回饋建議']},
                { version: 'v8.0', date: '2026.02.05', updates: ['生成分享圖功能：將當月消費與收藏照片整理成一張長圖 <br> 輕鬆分享你的追星 Photo Dump' ]},
                { version: 'v7.0', date: '2026.01.24', updates: ['匯率換算工具，啟用後支援外幣金額與原幣別紀錄','新增日期功能，保持記帳順序不被打亂']},
                { version: 'v6.0', date: '2026.01.11', updates: ['全面升級「帳本分類模式」，專為 KPOP 與 ACGN 消費情境設計','目前財務報表僅支援查看各帳本金額無法合併查看']},
                { version: 'v5.0', date: '2026.01.04', updates: ['「售出」功能，完整紀錄追星資產流向', '優化財務報表：支援支出、收入、淨支出分析', '修正 Excel 匯入/匯出之數據準確性','「複製並新增」功能，快速記錄相似支出'] },
                { version: 'v4.0', date: '2025.12.29', updates: ['智慧標籤建議，快速完成分類', '自訂主題漸層與深色模式', '清除冗餘圖檔，提升整體效能'] },
                { version: 'v3.0', date: '2025.12.27', updates: ['金額隱藏功能，看不見代表沒有花', '新增運費欄位，消費紀錄更完整', '外觀設定支援自行輸入色碼'] },
                { version: 'v2.0', date: '2025.12.25', updates: ['支援同時過濾年份、月份與分類', '優化圖片壓縮算法', '優化 Excel 匯入流程，支援預設值'] },
                { version: 'v1.0', date: '2025.12.25', updates: ['追星錢包正式上線', '消費紀錄、財務報表、願望清單', '照片牆、外觀設定'] }
            ];

            container.innerHTML = `
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-8">
                        <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg>
                        </button>
                        <h2 class="text-2xl font-black tracking-tight text-slate-800">版本說明</h2>
                    </div>
                    
                    <div class="flex flex-col items-center mb-10">
                        <div class="w-20 h-20 bg-brand rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl mb-4">💎</div>
                        <h3 class="text-lg font-black text-slate-800">追星錢包 Fandom Wallet</h3>
                        <p class="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">Version 9.0</p>
                    </div>

                    <div class="space-y-6">
                        ${logs.map(log => `
                            <div class="relative pl-6 border-l-2 border-slate-100">
                                <div class="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-brand rounded-full"></div>
                                <div class="flex justify-between items-end mb-2">
                                    <h4 class="font-black text-brand">${log.version}</h4>
                                    <span class="text-[9px] font-bold text-slate-300 font-mono">${log.date}</span>
                                </div>
                                <ul class="space-y-1">
                                    ${log.updates.map(u => `<li class="text-xs text-slate-500 font-medium leading-relaxed flex gap-2">
                                        <span class="text-brand/40">•</span>${u}
                                    </li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-8 border-t border-slate-50 text-center">
                        <p class="text-[9px] text-slate-300 font-medium">Made for Fans , by fan. </p>
                        <p class="text-[8px] text-slate-300 mt-1 uppercase tracking-widest">©2026 bobi_9yu </p>
                    </div>
                </div>
            `;
        }

        // 常見問題 FAQ 
        function renderFAQView(container) { 
            const faqs = [
                { q: "追星錢包會上架到APP商店嗎？", a: "目前因為技術限制與上架流程較繁瑣，因此暫時沒有上架 App Store / Google Play 的計畫。但現在可以直接加入主畫面使用，體驗會和 App 很接近！" },
                { q: "如何加入主畫面？", a: "使用 Safari/Chrome 開啟，點擊右上方「分享」圖示後選擇「加入主畫面」。" },
                { q: "一鍵匯入匯出功能如何使用？", a: "使用方式：<br/>1. 先在「數據匯入與匯出」內匯出 Excel，取得系統提供的範例檔案格式。<br/>2. 將你原本的 Excel 資料 複製到範例檔案的對應欄位。<br/>3. 再把整理好的檔案 匯入 App 即可。<br/>注意事項：<br/>•  項目名稱與單價為必填欄位<br/>•  其他欄位都可以留空<br/>•  如果沒有填寫時間，系統會自動匯入到「上個月」這樣就可以快速把原本的紀錄搬進追星錢包了 ✨" },
                { q: "如何查詢未到貨商品？", a: "在搜尋框輸入「未到貨」關鍵字，或點擊「#未到貨」標籤。" },
                { q: "可以自行新增分類嗎？", a: "目前不支援。<br/>為了維持報表統計的一致性，採用固定分類。<br/>💡記帳小貼士：<br/>1. 標籤功能：細節（如：成員）請用 #標籤，能更靈活地記錄細節並支援搜尋篩選。<br/>2. 切換模式：在「設定 > 帳本與功能」可依照喜好切換預設分類。<br/>3. 許願功能：歡迎點擊下方前往許願，會評估後新增！" },
                { q: "為什麼在網頁版新增了資料，打開 App (加入主畫面) 卻沒看到？", a: "這通常是因為 App 端的登入狀態尚未同步更新。<br/><b>檢查登入</b>：進入「設定」，確認目前是否為登入狀態。若顯示未登入，請重新登入即可抓回雲端資料。<br/><br/>追星錢包採用即時雲端儲存，只要是登入狀態新增的資料都會安全存在雲端囉！" }
            ];

            container.innerHTML = `
                <div class="p-6 pb-32">
                    <div class="flex items-center gap-3 mb-8">
                        <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90 font-bold">                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg></button>
                        <h2 class="text-2xl font-black tracking-tight text-slate-800">常見問題與幫助</h2>
                    </div>
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">常見問題 FAQ</h3>
                    <div class="space-y-3 mb-10">
                        ${faqs.map((faq, i) => `
                            <div class="faq-item bg-white rounded-2xl p-4 card-shadow" onclick="toggleFaq(${i})">
                                <div class="flex justify-between items-center cursor-pointer">
                                    <h4 class="text-xs font-bold text-slate-700 pr-4">${faq.q}</h4>
                                    <svg class="w-4 h-4 text-slate-300 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2.5"/></svg>
                                </div>
                                <div class="faq-answer mt-2"><p class="text-[11px] text-slate-400 border-t border-slate-50 pt-2">${faq.a}</p></div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="space-y-4">
                        <a href="https://forms.gle/vF1hfL3RTs6TMuw17" target="_blank" class="block w-full bg-white text-slate-500 font-bold py-4 rounded-2xl text-center text-sm card-shadow active:scale-[0.98] transition-all">
                            📝 問題回報與功能許願
                        </a>
                    </div>
                </div>`;
        }

        window.toggleFaq = (index) => {
            const items = document.querySelectorAll('.faq-item');
            items.forEach((item, i) => {
                if (i === index) item.classList.toggle('active'); else item.classList.remove('active');
            });
        };


// 掛載到全域 (為了相容 HTML 裡的 onclick)
// ---------------------------------------------------------

window.showToast = showToast;
window.initSwipeToClose = initSwipeToClose;
window.switchTab = switchTab;
window.renderContent = renderContent;

window.openActionModal = openActionModal;
window.closeActionModal= closeActionModal;//操作選單共用彈窗index有呼叫
window.openAddModal = openAddModal; // 這個在 index.html 裡有直接呼叫，所以需要掛載到全域
window.closeActionModal =closeActionModal;
window.handlePaymentChange = handlePaymentChange;
window.removeImg=removeImg;
window.fetchRates = fetchRates;

window.setTempType = setTempType;
window.closeModal = () => {
    document.getElementById('modal-overlay').classList.add('hidden');
};
window.toggleWishDateInput = toggleWishDateInput;


//財務報表
window.changeReportType = changeReportType;
window.changeReportRange = changeReportRange;
window.shiftRange = shiftRange;

//外觀設定
window.toggleDarkMode = toggleDarkMode;
window.saveGrad=saveGrad;
window.applyHexColor = applyHexColor;
window.applyTheme=applyTheme;
window.openGradModal=openGradModal
window.syncGradPicker=syncGradPicker;
window.syncGradInput=syncGradInput;

//數據備份匯入匯出
window.importFromExcel = importFromExcel;
window.exportToExcel = exportToExcel;

//清理圖檔
window.runStorageCleanup = runStorageCleanup;

//帳本功能與設定
//帳本分類模式
window.switchCatSet = switchCatSet;
//匯率
window.updateDefaultCurrency = updateDefaultCurrency;
window.toggleExchange = toggleExchange;
window.convertCurrency= convertCurrency;
//分類排序

