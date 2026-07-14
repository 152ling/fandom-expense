import { state } from './state.js';
import { baseCategories, arrivalOptions,wishCategories,wishCategoriesACGN,paymentOptions } from './constants.js';
import { renderExpenseList } from './expenseList.js';
import { escapeHTML} from './utils.js';
import  './i18n.js';
    export function showToast(msg) {
        const t = document.getElementById("toast");
        if(!t) return;
        t.textContent = msg; t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 2000);
    }
        // 通用確認工具，會回傳 true 或 false
    export function askUser(titleKey, descKey, icon = '💸') {
            const overlay = document.getElementById('common-confirm-overlay');
            // document.getElementById('confirm-title').textContent = title;
            // document.getElementById('confirm-desc').textContent = desc;
            document.getElementById('confirm-title').textContent = typeof t === 'function' ? t(titleKey) : titleKey;
            document.getElementById('confirm-desc').textContent = typeof t === 'function' ? t(descKey) : descKey;
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
                document.getElementById('confirm-ok').onclick = () => { overlay.classList.add('hidden'); resolve(true); };
                document.getElementById('confirm-cancel').onclick = () => { overlay.classList.add('hidden'); resolve(false); };
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
                else if (state.subPage === 'privacy') renderPrivacyView(container);
                else renderSettings(container);
            }
              // 渲染完動態內容後，統一更新靜態翻譯
            requestAnimationFrame(() => updateStaticTranslations());
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
                modalTitle.textContent = state.editingId ? t('modal_edit_wish') : t('modal_add_wish');//"編輯心願" : "新增心願";
            } else {
                // 消費模式下的三種情況：
                if (state.wishSourceId) {
                    // 1. 從願望清單轉換而來
                    modalTitle.textContent = t('modal_add_from_wish'); // "加入消費清單";
                } else if (state.editingId) {
                    // 2. 編輯現有消費紀錄
                    modalTitle.textContent = t('modal_edit_expense'); // "編輯紀錄";
                } else {
                    // 3. 一般新增消費
                    modalTitle.textContent = t('modal_add_expense'); // "新增紀錄";
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
                            <button data-i18n="type_expense" type="button" onclick="setTempType('expense')" id="btn-type-exp" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all active shadow-sm">支出</button>
                            <button data-i18n="type_income" type="button" onclick="setTempType('income')" id="btn-type-inc" ${isConvertingWish ? 'disabled' : ''} class="flex-1 py-2 text-xs font-bold rounded-xl transition-all text-slate-400">售出</button>
                        </div>
                        <div class="space-y-1"><label class="text-[10px] font-bold text-slate-400 uppercase"><span data-i18n="field_name">商&#8203;品&#8203;名&#8203;稱</span><span style="color:red;">*</span></label><input type="text" id="m-t-l" autocomplete="one-time-code" autocorrect="off" required value="${itemData?.name || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none border-2 border-transparent focus:border-brand text-gray-800"></div>
                        <div class="flex gap-4">
                            <div class="flex-1 space-y-1">
                                <label data-i18n="field_price" class="text-[10px] font-bold text-slate-400 uppercase">單&#8203;價</label>
                                <input type="number" id="m-u-p" inputmode="decimal" autocomplete="one-time-code" autocorrect="off" value="${itemData?.price || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                            </div>
                            <div class="flex-1 space-y-1 relative" id="qty-combobox">
                                <label data-i18n="field_qty" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">數量</label>
                                <div class="relative flex items-center">
                                    <input type="number" id="m-qty" inputmode="numeric" value="${itemData?.qty || 1}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 border-2 border-transparent focus:border-brand">
                                    <div id="qty-toggle" class="absolute right-3 cursor-pointer text-slate-400"><svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2"/></svg></div>
                                </div>
                                <ul id="qty-options" class="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto hidden custom-scrollbar"></ul>
                            </div>
                            <div class="flex-1 space-y-1" id="shipping-fee">
                                <label data-i18n="field_shipping" class="text-[10px] font-bold text-slate-400 uppercase">運費/二補</label>
                                <input type="number" id="m-shipping" inputmode="numeric" value="${itemData?.shipping || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                            </div>
                        </div>
                    
                        ${state.enableExchange ?`
                            <div id="converter-section" class="space-y-1 transition-all duration-300 origin-top overflow-hidden">
                                <div class="flex justify-between items-end">
                                    <label data-i18n="currency_label" class="text-[10px] font-bold text-slate-400 uppercase">原始幣值</label>
                                    <span  id="rate-tag" class="text-[9px] text-slate-300 italic mr-1">正在載入匯率...</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="relative flex-1 flex items-center bg-slate-50 rounded-2xl border border-transparent focus-within:border-gray-100 transition-all overflow-hidden">
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
                            <div data-i18n-label="field_category" class="space-y-1"><label data-i18n="field_category" class="text-[10px] font-bold text-slate-400 uppercase">分類</label>
                            <select id="m-cat" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">${dropdownOptions.map(c => {const cleanId = c.id.replace(/\s+/g, ''); return `<option value="${c.id}" data-i18n="cat_${cleanId}" ${itemData?.category == c.id ? 'selected' : ''}>${c.id}</option>`}).join('')}</select></div>
                            <div class="space-y-1 flex flex-col"><label data-i18n="field_date" class="text-[10px] font-bold text-slate-400 uppercase mb-1">消費年月日</label><input type="date" id="m-date"     value="${itemData?.year && itemData?.month ? 
                                `${itemData.year}-${String(itemData.month).padStart(2,'0')}-${String(itemData.day? String(itemData.day).padStart(2,'0') : '01').padStart(2,'0')}` : defaultDate}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800"></div>
                        </div>
                        <div class="flex gap-4" id="shipping-state">
                            <div class="flex-1 space-y-1 relative" id="platform-combobox">
                                <label data-i18n="field_platform" class="text-[10px] font-bold text-slate-400 uppercase">購物平台</label>
                                <input type="text" id="m-platform" autocomplete="off" autocorrect="off" 
                                    data-i18n-placeholder="field_platform_ph" value="${itemData?.platform || ''}" 
                                    class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                                <ul id="platform-suggestions" class="hidden absolute z-[60] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar"></ul>
                            </div>
                            <div class="flex-1 space-y-1"><label data-i18n="field_status" class="text-[10px] font-bold text-slate-400 uppercase">到貨狀態</label><select id="m-status" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                            ${filteredOptions.map(o => `<option data-i18n="arrival_${o}" value="${o}" ${itemData?.arrivalStatus == o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
                        </div>
                
                        <div class="grid grid-cols-2 gap-4" id="shipping-payment">
                            <div class="space-y-1"><label data-i18n="field_payment" class="text-[10px] font-bold text-slate-400 uppercase">付款方式</label><select id="m-pay-method" onchange="handlePaymentChange(this.value)" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">${paymentOptions.map(o => `<option value="${o}" data-i18n="pay_${o}" ${itemData?.paymentMethod == o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
                            <div id="paid-amount-container" class="space-y-1 ${isPaidDeposit ? '' : 'hidden'}"><label data-i18n="field_paid_amount" class="text-[10px] font-bold text-slate-400 uppercase">已付金額</label><input type="number" id="m-paid-amount" autocomplete="one-time-code" autocorrect="off" value="${itemData?.paidAmount || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800"></div>
                        </div>
                        <div class="space-y-1">
                            <label data-i18n="field_tags" class="text-[10px] font-bold text-slate-400 uppercase">標籤</label>
                            <div class="relative">
                                <div id="m-tag-container" class="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border-2 border-transparent focus-within:border-brand min-h-[46px] items-center transition-all">
                                    <input type="text" data-i18n-placeholder="field_tags_ph" id="m-tag-input" autocomplete="off" class="flex-1 bg-transparent outline-none text-sm text-gray-800 min-w-[120px]">
                                </div>
                                <ul id="m-tag-suggestions" class="hidden absolute z-[60] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar"></ul>
                            </div>
                        </div>
                        <div class="space-y-1"><label data-i18n="field_remark" class="text-[10px] font-bold text-slate-400 uppercase">備註</label><textarea id="m-remark" autocomplete="one-time-code" autocorrect="off" data-i18n-placeholder="field_remark_ph" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none h-16 resize-none text-gray-800">${itemData?.remark || ''}</textarea></div>
                       
                        <div class="space-y-2">
                            <label data-i18n="field_img_limit" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">圖片紀錄 (上限 3 張)</label>
                            <div id="img-preview-row" class="flex gap-2 overflow-x-auto no-scrollbar img-scroll-container">
                                
                            </div>
                            <input type="file" id="m-img-input" accept="image/*" class="hidden" multiple onchange="handleMultiImage(this)">
                        </div>
                    
                    </div>`;
                    if(state.enableExchange) {updateRateUI();}
                    initQtyPicker();
                    initPlatformSuggest();
                    const currentType = (itemData?.type === 'income') ? 'income' : 'expense';
                    setTempType(currentType);
                    updateImagePreviewUI();
                    updateStaticTranslations(form); // 更新動態內容的翻譯
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
                    <div class="space-y-1"><label data-i18n="field_name" class="text-[10px] font-bold text-slate-400 uppercase">商&#8203;品&#8203;名&#8203;稱<span style="color:red;">*</span></label><input type="text" id="m-t-l" autocomplete="one-time-code" autocorrect="off" required value="${itemData?.name || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 font-bold"></div>
                    <div class="space-y-1"><label data-i18n="field_wish_price" class="text-[10px] font-bold text-slate-400 uppercase">預&#8203;估&#8203;價&#8203;格</label><input type="number" id="m-u-p" inputmode="decimal" autocomplete="one-time-code" autocorrect="off" value="${itemData?.price || ''}" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 font-bold"></div>
                        ${state.enableExchange ?`
                            <div id="converter-section" class="space-y-1 transition-all duration-300 origin-top overflow-hidden">
                                <div class="flex justify-between items-end ml-1">
                                    <label data-i18n="currency_label" class="text-[10px] font-bold text-slate-400 uppercase">原始幣值</label>
                                    <span id="rate-tag" class="text-[9px] text-slate-300 italic">正在載入匯率...</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="relative flex-1 flex items-center bg-slate-50 rounded-2xl border border-transparent focus-within:border-gray-100 transition-all overflow-hidden">
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
                    <div class="space-y-1"><label data-i18n="field_wish_cat" class="text-[10px] font-bold text-slate-400 uppercase">分類</label><select id="m-wish-cat" autocomplete="one-time-code" autocorrect="off" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800">
                    ${dropdownOptions.map(c => {
                        const cleanId = c.replace(/\s+/g, '');
                        return `<option data-i18n="cat_${cleanId}" value="${c}" ${itemData?.category == c ? 'selected' : ''}>${c}</option>`;
                    }).join('')}</select></div>
                    <div class="space-y-1"><label data-i18n="field_wish_remark" class="text-[10px] font-bold text-slate-400 uppercase font-black">心願備註</label><textarea id="m-remark" autocomplete="one-time-code" autocorrect="off" class="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none text-gray-800 font-bold">${itemData?.remark || ''}</textarea></div>
                    
                    <div class="space-y-1">
                        <div class="flex items-center justify-between">
                            <label data-i18n="field_wish_date_toggle" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">記錄發售日期與時間</label>
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
                                <label data-i18n="field_release_date" class="text-[10px] font-bold text-slate-400">日期</label>
                                <input type="date" id="m-release-date" value="${itemData?.releaseDate || today}" class="w-full bg-slate-50 rounded-xl p-3 text-sm text-gray-800 font-bold">
                            </div>
                            <div class="space-y-1 flex flex-col">
                                <label data-i18n="field_release_time" class="text-[10px] font-bold text-slate-400">時間</label>
                                <input type="time" step="60" id="m-release-time" value="${itemData?.releaseTime || defaultTime}" class="w-full bg-slate-50 rounded-xl p-3 text-sm text-gray-800 font-bold">
                            </div>
                        </div>
                    </div>
                    <div onclick="const el=document.getElementById('m-img'); if(el){ el.value=''; el.click(); }" id="img-placeholder" class="bg-slate-50 border-2 border-dashed border-gray-100 rounded-3xl h-24 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner">
                        ${previewImg ? `<img src="${previewImg}" class="w-full h-full object-cover">` : `<span data-i18n="field_upload_img" class="text-slate-300 text-[10px] font-bold uppercase tracking-widest">上傳相片</span>`}
                    </div>
                    
                    <input type="file" id="m-img" accept="image/*" style="position: fixed;bottom: 0;left: 0;width: 48px;height: 48px;opacity: 0;z-index: 10;" onchange="handleImage(this)">
                </div>`;
                if(state.enableExchange) {updateRateUI();}
                updateStaticTranslations(form);
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
            list.innerHTML = Array.from({length: 10}, (_, i) => i + 1).map(num => `<li class="px-4 py-3 text-sm hover:bg-slate-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-none font-bold" data-val="${num}">${num}</li>`).join('');
            const toggleShow = (show) => { list.classList.toggle('hidden', !show); arrow.style.transform = show ? 'rotate(180deg)' : 'rotate(0deg)'; };
            input.addEventListener('focus', () => toggleShow(true));
            toggle.onclick = (e) => { e.stopPropagation(); toggleShow(list.classList.contains('hidden')); };
            list.querySelectorAll('li').forEach(li => { li.onclick = () => { input.value = li.dataset.val; toggleShow(false); }; });
            document.addEventListener('click', (e) => { if (!document.getElementById('qty-combobox')?.contains(e.target)) toggleShow(false); }, { once: true });
        }
        export function initPlatformSuggest() {
            const input = document.getElementById('m-platform');
            const list = document.getElementById('platform-suggestions');
            if (!input || !list) return;

            const showSuggestions = (query) => {
                const pool = [...new Set(
                    state.expenses.map(ex => ex.platform).filter(p => p && p.trim())
                )];
                const q = query.trim().toLowerCase();
                const matches = q 
                    ? pool.filter(p => p.toLowerCase().includes(q))
                    : pool.slice(0, 5); // 沒輸入時顯示最近常用的前幾個

                if (matches.length === 0) {
                    list.classList.add('hidden');
                    return;
                }
                list.innerHTML = matches.map(p => `
                    <li class="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0 font-medium" 
                        onclick="document.getElementById('m-platform').value='${p.replace(/'/g, "\\'")}'; document.getElementById('platform-suggestions').classList.add('hidden');">
                        ${p}
                    </li>
                `).join('');
                list.classList.remove('hidden');
            };

            input.addEventListener('focus', () => showSuggestions(input.value));
            input.addEventListener('input', () => showSuggestions(input.value));
            document.addEventListener('click', (e) => {
                if (!document.getElementById('platform-combobox')?.contains(e.target)) {
                    list.classList.add('hidden');
                }
            });
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
            const receiveBtn = document.getElementById('action-receive-btn');
            if (convertBtn) {
                // 如果點擊的是「心願清單 (wish)」，才顯示轉換按鈕
                if (type === 'wish') {
                    convertBtn.classList.remove('hidden');
                } else {
                    convertBtn.classList.add('hidden');
                }
            }
            if (receiveBtn) {
                if (type === 'expense') {
                    const item = state.expenses.find(e => String(e.id) === String(id));
                    // 只有支出且非收入且非已取貨的項目，才顯示到貨狀態切換
                    if (item && item.type !== 'income' && item.arrivalStatus !== '已取貨') {
                        receiveBtn.classList.remove('hidden');
                    } else {
                        receiveBtn.classList.add('hidden');
                    }
                } else {
                    receiveBtn.classList.add('hidden');
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
                statusSelect.innerHTML = optionsToShow.map(o => `<option data-i18n="arrival_${o}" value="${o}">${o}</option>`).join('');
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
                if (typeof updateStaticTranslations === 'function') { //更新m-status翻譯
                    updateStaticTranslations(statusSelect);
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
                    <h2 data-i18n="wish_title" class="text-2xl font-black mb-4 tracking-tight text-slate-800">願望清單</h2>
                    <div id="wish-cat-bar" class="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1"></div>
                </div>

                <div class="p-6 space-y-4 pb-12">
                    ${filtered.length === 0 
                        ? `<div class="text-center py-24 text-slate-300 font-bold">
                            ${state.selectedCategory ? '<span data-i18n="wish_cat_empty">此分類暫無願望</span>' : '<span data-i18n="wish_empty">快許下新的願望吧！</span>'}
                        </div>` 
                        : filtered.map(item =>{
                            const cleanId = item.category ? item.category.toLowerCase().replace(/\s+/g, '') : 'default';
                        return `
                        <div class="bg-white rounded-3xl p-4 flex flex-col gap-3 card-shadow relative overflow-hidden">
                            <div class="absolute top-4 right-4 z-10">
                                <button onclick="openActionModal(event,'wish', '${item.id}')" class="p-2 text-slate-300 hover:text-slate-600 active:scale-90 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                </button>
                            </div>
                            <div class="flex items-center gap-4" onclick="${item.image ? `openLightbox(['${item.image}'], '${item.name}', '${item.releaseDate || ''}')` : ''}">
                                ${item.image ? `<img src="${item.image}" class="w-16 h-16 object-cover rounded-2xl shadow-sm">` : `<div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">✨</div>`}
                                <div class="flex-grow pr-24">
                                    <span data-i18n="cat_${cleanId}" class="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-brand mb-1 inline-block">${item.category || '一般'}</span>
                                    <h4 class="font-bold text-sm leading-tight text-slate-800">${item.name}</h4>
                                    <p class="text-xs font-black text-brand mt-1">$ ${Number(item.price).toLocaleString()}</p>
                                    ${item.releaseDate ? `<p class="text-[10px] text-slate-400 mt-1 font-bold">🗓️ ${item.releaseDate} ${item.releaseTime || ''}</p>` : ''}
                                </div>
                            </div>
                            ${item.remark ? `
                                <div class="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                                    <div class="bg-slate-50 p-2 rounded-xl mt-1 border border-gray-100 text-[10px] text-slate-500 leading-relaxed">
                                        <span data-i18n="field_remark" class="text-brand font-bold mr-1 opacity-70">備註:</span>${item.remark}
                                    </div>
                                </div>` : ''}
                        </div>`}).join('')}
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
                const cleanId = cat.replace(/\s+/g, '');
                return `
                    <div data-i18n="cat_${cleanId}" onclick="state.selectedCategory=(state.selectedCategory==='${cat}'?'':'${cat}'); renderContent();"
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
            state.reportDimension = (type === 'net') ? 'category' : state.reportDimension; // 淨支出模式強制使用分類維度方便多語系判斷
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
                chartTitle = t('report_net');
                centerAmount = netBalance;
                stats = [
                    { id: '總支出', amount: totalExp, color: '#92A8D1', icon: '💸' },
                    { id: '總收入', amount: totalInc, color: '#10b981', icon: '💰' }
                ].filter(s => s.amount > 0);
            } else {
                // --- 支出或收入模式：顯示詳細分類 ---
                const isInc = reportMode === 'income';
                const targetRecords = periodRecords.filter(i => (isInc ? i.type === 'income' : i.type !== 'income'));
                chartTitle = isInc ? t('report_total_inc') : t('report_total_exp');
                centerAmount = isInc ? totalInc : totalExp;
                if (state.reportDimension === 'tag') {
                    // =================【標籤分析維度】=================
                    let tagMap = {};
                    targetRecords.forEach(ex => {
                        const amt = Number(ex.total) || 0;
                        if (Array.isArray(ex.tags) && ex.tags.length > 0) {
                            ex.tags.forEach(tag => {
                                const cleanTag = tag.trim();
                                if (!cleanTag) return;
                                if (!tagMap[cleanTag]) {
                                    tagMap[cleanTag] = { 
                                        id: `#${cleanTag}`, 
                                        amount: 0, 
                                        color: '#92A8D1', // 可以使用品牌色，或設計一套標籤隨機色彩機制
                                        icon: '🏷️' 
                                    };
                                }
                                tagMap[cleanTag].amount += amt;
                            });
                        } else {
                            // 未貼標籤的項目歸納
                            if (!tagMap['未貼標籤']) {
                                tagMap['未貼標籤'] = { id: '未貼標籤', amount: 0, color: '#cbd5e1', icon: '📁' };
                            }
                            tagMap['未貼標籤'].amount += amt;
                        }
                    });
                    // 轉成陣列並按照金額降冪排序
                    stats = Object.values(tagMap).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount);
                    
                    // 可選優化：為標籤列表動態著色，讓 Donut 圖呈現更漂亮
                    const tagColors = ['#f43f5e', '#f97316', '#eec448', '#22c55e', '#0ea5e9', '#6366f1', '#d946ef'];
                    stats.forEach((s, idx) => {
                        if (s.id !== '未貼標籤') {
                            s.color = tagColors[idx % tagColors.length];
                        }
                    });

                } else {
                        // =================【分類分析維度】=================
                        const currentCats = getCurrentCategories();
                        stats = currentCats.map(cat => ({
                            ...cat,
                            amount: targetRecords
                                .filter(ex => ex.category === cat.id)
                                .reduce((sum, item) => sum + (Number(item.total) || 0), 0)
                        })).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount);
                    }
            }

            const formatAmt = (num) => state.hideAmount ? '•••' : num.toLocaleString();
            
            container.innerHTML = `
                <div class="p-6">
                    <h2 data-i18n="report_title" class="text-2xl font-black text-slate-800 mb-6 tracking-tight">財務分析報告</h2>
                    
                    <div class="flex flex-col gap-4 mb-8">
                        <div class="flex bg-slate-200/50 p-1 rounded-2xl">
                            ${['month', '6months', 'year'].map(r => `
                                <button onclick="changeReportRange('${r}')" class="report-range-btn flex-1 py-2 text-xs font-bold rounded-xl transition-all ${state.reportRange === r ? 'active' : ''}">
                                    ${r === 'month' ? t('report_month') : r === 'year' ? t('report_year') : t('report_6months')}
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
                                <p data-i18n="report_total_exp" class="text-[9px] font-bold ${reportMode === 'expense' ? 'text-white' : 'text-slate-400'} uppercase mb-1">總支出</p>
                                <p class="text-sm font-black ${reportMode === 'expense' ? 'text-white' : 'text-slate-700'}">$${formatAmt(totalExp)}</p>
                            </div>
                            <div onclick="changeReportType('income')" 
                                class="cursor-pointer transition-all ${reportMode === 'income' ? 'bg-brand shadow-lg' : 'bg-white/60'} p-3 rounded-2xl card-shadow text-center">
                                <p data-i18n="report_total_inc" class="text-[9px] font-bold ${reportMode === 'income' ? 'text-white' : 'text-emerald-400'} uppercase mb-1">總收入</p>
                                <p class="text-sm font-black ${reportMode === 'income' ? 'text-white' : 'text-emerald-400'}">+$${formatAmt(totalInc)}</p>
                            </div>
                            <div onclick="changeReportType('net')" 
                                class="cursor-pointer transition-all ${reportMode === 'net' ? 'bg-brand shadow-lg' : 'bg-white/60'} p-3 rounded-2xl card-shadow text-center">
                                <p data-i18n="report_net" class="text-[9px] font-bold ${reportMode === 'net' ? 'text-white' : 'text-slate-400'} uppercase mb-1">淨支出</p>
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
                            ${(reportMode !== 'net' && stats.length > 0) ? `
                                <div class="flex border-b border-gray-100 mb-2">
                                    <button data-i18n="report_byCat" onclick="changeReportDimension('category')" 
                                        class="report-tab flex-1 pb-3 text-sm font-bold  ${state.reportDimension === 'category' ? 'active' : 'text-slate-400'}">
                                        依分類
                                    </button>
                                    <button data-i18n="report_byTag" onclick="changeReportDimension('tag')" 
                                        class="report-tab flex-1 pb-3 text-sm font-bold ${state.reportDimension === 'tag' ? 'active' : 'text-slate-400'}">
                                        依標籤
                                    </button>
                                </div>
                            ` : ''}
        
                    
                            
                            <h3 class="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
                                ${reportMode === 'net' ? t('report_rank_net') : (reportMode === 'income' ? t('report_rank_inc') : t('report_rank_exp'))}
                            </h3>
                            ${(reportMode !== 'net' && state.reportDimension === 'tag') ? `
                            <p data-i18n="report_hint" class="text-[10px] font-bold text-slate-400/70 mt-1  tracking-wide">
                                提示：複選標籤之項目會重複計算，佔比以該時段總金額為基準
                            </p>
                        ` : ''}
                            ${stats.map(s => { 
                                const p = ((s.amount / (reportMode === 'net' ? (totalExp + totalInc) : centerAmount)) * 100).toFixed(1); 
                                const cleanId = s.id.replace(/\s+/g, '');
                                return `
                                    <div class="bg-white rounded-2xl p-4 card-shadow flex items-center gap-4 border-l-4" style="border-color:${s.color}">
                                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background-color:${s.color}20">${s.icon}</div>
                                        <div class="flex-grow">
                                            <div class="flex justify-between items-center mb-1">
                                                <span ${state.reportDimension === 'category' || (state.reportDimension === 'tag' && cleanId === '未貼標籤') ? `data-i18n="cat_${cleanId}"` : ''} class="text-sm font-bold text-slate-700">${s.id}</span>
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
                        <div data-i18n="report_no_data" class="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 font-bold text-slate-300">
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

        window.changeReportDimension = (dimension) => {
            state.reportDimension = dimension;
            renderContent(); // 重新渲染報表
        };
                
        function calculateReportRange() {
            let start, end, label; const now = new Date();
            // if (state.reportRange === 'month') { start = new Date(now.getFullYear(), now.getMonth() + state.reportOffset, 1); end = new Date(start.getFullYear(), start.getMonth() + 1, 0); label = `${start.getFullYear()} 年 ${start.getMonth() + 1} 月`; }

            if (state.reportRange === 'month') {
                start = new Date(now.getFullYear(), now.getMonth() + state.reportOffset, 1);
                end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
                const currentLang = typeof getLang === 'function' ? getLang() : (localStorage.getItem('fe_v11_lang') || 'zh-TW');
                if (currentLang === 'en') {
                    const monthsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    label = `${monthsEN[start.getMonth()]} ${start.getFullYear()}`; // 產出: Jul 2026
                } else if (currentLang === 'ja') {
                    label = `${start.getFullYear()}年${start.getMonth() + 1}月`;    // 日文格式也是 2026年7月
                }
                else if (currentLang === 'ko') {
                    label = `${start.getFullYear()}년${start.getMonth() + 1}월`;    // 韓文格式也是 2026년7월
                }
                else {
                    label = `${start.getFullYear()} 年 ${start.getMonth() + 1} 月`; // 繁體中文格式
                }
            }
            else if (state.reportRange === '6months') { end = new Date(now.getFullYear(), now.getMonth() + state.reportOffset + 1, 0); start = new Date(end.getFullYear(), end.getMonth() - 5, 1); label = `${start.getFullYear()}.${start.getMonth()+1} ～ ${end.getFullYear()}.${end.getMonth()+1}`; }
            else { start = new Date(now.getFullYear() + state.reportOffset, 0, 1); end = new Date(start.getFullYear(), 11, 31); label = `${start.getFullYear()} ${t('report_yearly')}`; }
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
            <div class="p-6 h-screen"><h2 data-i18n="settings_title" class="text-2xl font-black mb-8 tracking-tight" onclick="handleSecretClick()">設定</h2>
                <div class="bg-white rounded-3xl p-5 card-shadow mb-8 flex items-center gap-4 ">
                    <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-50 border-2 border-brand/20 flex items-center justify-center">
                        ${state.user 
                        ? `<img src="${state.user.photoURL}" class="w-full h-full object-cover" alt="使用者頭像">` 
                        : `<span class="text-xl">👤</span>`}
                    </div>
                    
                    <div class="flex-grow">
                        <h4 class="font-bold text-slate-800 text-sm">
                        ${state.user ? (state.user.displayName || 'Google 用戶') : t('settings_guest')}
                        </h4>
                        <p class="text-[10px] text-slate-400">
                        ${state.user ? t('settings_synced') : t('settings_login_hint')}
                        </p>
                    </div>
                    
                    <div>
                        ${state.user 
                        ? `<button  onclick="window.cloud.logout()" data-i18n="btn_logout" class="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl active:scale-95 transition-all">登出</button>` 
                        : `<button  onclick="window.cloud.login()" data-i18n="btn_login" class="text-xs bg-brand text-white font-bold px-4 py-2 rounded-xl shadow-md active:scale-95 transition-transform">登入</button>`}
                    </div>
                    </div>
                <div class="bg-white rounded-3xl overflow-hidden card-shadow">
                        <div onclick="state.subPage = 'photowall'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-gray-100">
                            <div class="flex items-center gap-4 text-brand">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2"/></svg>
                                <span data-i18n="settings_photowall" class="font-bold text-slate-700">我的照片牆</span>
                            </div>
                            <div class="flex items-center gap-2"><span>▶</span></div>
                        </div>
                        <div onclick="state.subPage = 'appearance'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-gray-100">
                            <div class="flex items-center gap-4 text-brand">
                                <svg class="w-6 h-6 xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paintbrush-vertical-icon lucide-paintbrush-vertical"><path d="M10 2v2"/><path d="M14 2v4"/><path d="M17 2a1 1 0 0 1 1 1v9H6V3a1 1 0 0 1 1-1z"/><path d="M6 12a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h2a1 1 0 0 1 1 1v2.9a2 2 0 1 0 4 0V17a1 1 0 0 1 1-1h2a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1"/></svg>
                                <span data-i18n="settings_appearance" class="font-bold text-slate-700">外觀設定</span>
                            </div>
                            <div class="flex items-center gap-2"><span>▶</span></div>
                        </div>
                        <div onclick="state.subPage = 'accountConfig'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-gray-100">
                            <div class="flex items-center gap-4 text-brand">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                <span data-i18n="settings_account" class="font-bold text-slate-700">帳本與功能</span>
                            </div>
                            <div class="flex items-center gap-2"><span>▶</span></div>
                        </div> 
                    <div onclick="state.subPage = 'backup'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-gray-100"><div class="flex items-center gap-4 text-brand"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke-width="2"/></svg><span data-i18n="settings_backup" class="font-bold text-slate-700">數據匯入與匯出</span></div><span>▶</span></div>

                    <div onclick="state.subPage = 'faq'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer border-b border-gray-100">
                        <div class="flex items-center gap-4 text-brand">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg><span data-i18n="settings_faq" class="font-bold text-slate-700">常見問題與幫助</span></div>
                        <div class="flex items-center gap-2"><span>▶</span></div>
                    </div>      
                    <div onclick="state.subPage = 'version'; renderContent();" class="flex items-center justify-between p-5 custom-hover cursor-pointer ">
                        <div class="flex items-center gap-4 text-brand">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="settings_version" class="font-bold text-slate-700">版本說明</span></div>
                        <div class="flex items-center gap-2"><span class="text-[10px] text-slate-300 font-mono text-right">v13.0</span><span>▶</span></div>
                    </div>
                </div>
                <div data-i18n="settings_privacy" onclick="state.subPage = 'privacy'; renderContent();" class="mt-6 flex justify-center font-bold text-xs text-slate-400 item-center text-center underline cursor-pointer">隱私權政策</div>
                        

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
                            <h2 data-i18n="photowall_title" class="text-2xl font-black tracking-tight text-slate-800">照片牆</h2>
                        </div>
                    </div>

                    <div class="flex border-b border-gray-100 mb-2">
                        <button onclick="state.photoWallTab='purchased';state.photoFilterCat='';renderContent()" 
                            class="photo-tab flex-1 pb-3 text-sm font-bold ${state.photoWallTab==='purchased'?'active':'text-gray-400'}" data-i18n="photowall_purchased">已購買</button>
                        <button onclick="state.photoWallTab='wish';state.photoFilterCat='';renderContent()" 
                            class="photo-tab flex-1 pb-3 text-sm font-bold ${state.photoWallTab==='wish'?'active':'text-gray-400'}" data-i18n="photowall_wish">心願牆</button>
                    </div>

                    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                        <div onclick="state.photoFilterCat='';renderContent()" 
                            class="chip ${state.photoFilterCat === '' ? 'active-tag' : ''}" data-i18n="photowall_all">全部</div>
                        ${currentCats.map(c => `
                            <div onclick="state.photoFilterCat='${c}';renderContent()" 
                                class="chip ${state.photoFilterCat === c ? 'active-tag' : ''}" data-i18n="cat_${c.toLowerCase().replace(/\s+/g, '')}">${c.split(' ')[0]}</div>
                        `).join('')}
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-20">
                        ${photos.length > 0 ? photos.map(item => `
                            <div onclick="openLightbox(['${item.image}'], '${item.name}', '${isWishWall ? (item.category || '一般') : (item.year + '/' + item.month)}')" 
                                class="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-all">
                                <img src="${item.image}" class="w-full h-full object-cover">
                            </div>
                        `).join('') : `
                            <div data-i18n="photowall_empty" class="col-span-full py-24 text-center text-slate-300 font-bold">目前尚無照片</div>
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
                {key: 'theme_svt', name:'粉藍', c:'svt', g: 'linear-gradient(135deg, #F7CAC9 0%, #92A8D1 100%)'},
                {key: 'theme_purple', name:'幻紫', c:'#BB96FF'},
                {key: 'theme_blue', name:'沁藍', c:'#69C4E0'},
                {key: 'theme_green', name:'螢綠', c:'#B6ED00'},
                {key: 'theme_aurora', name:'極光', c:'#6C3591'},
                {key: 'theme_gold', name:'熠金', c:'#E2B216'}
            ];
            const currentHex = (state.themeColor && state.themeColor.startsWith('#')) ? state.themeColor : '';
            const isCustomGrad = state.themeColor.includes('gradient') && state.themeColor !== 'svt';
            const btnGrad = isCustomGrad ? state.themeColor : 'linear-gradient(135deg, #FEBEBE 0%,#85D0FF 100%)';
            const langOptions = [
                { code: 'zh-TW', label: '繁體中文' },
                { code: 'en',    label: 'English' },
                { code: 'ko',    label: '한국어' },
                { code: 'ja',    label: '日本語' },
            ];
            container.innerHTML = `
                    <div class="p-6">
                        <div class="flex items-center gap-3 mb-8">
                            <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg>
                            </button>
                            <h2 data-i18n="appear_title" class="text-2xl font-black tracking-tight text-slate-800">外觀設定</h2>
                        </div>
                        
                        <div class="bg-white rounded-3xl p-6 card-shadow text-slate-800">
                            <div class="flex mb-6 justify-between">
                                <h3 data-i18n="appear_preset" class="text-sm font-bold text-slate-500 tracking-wide">選擇預設主題</h3>
                                <div class="flex justify-center border-gray-100">
                                    <label class="inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="grad-dark-toggle" class="sr-only peer" onchange="toggleDarkMode(this.checked)" ${document.body.classList.contains('dark-mode') ? 'checked' : ''}>
                                        <div class="relative w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                                    after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                                    after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all 
                                                    peer-checked:bg-slate-700"></div>
                                        
                                        <span class="select-none text-sm font-bold text-slate-500" data-i18n="appear_dark">深色模式</span>
                                    </label>
                                </div>
                            </div>
                            <div class="grid grid-cols-4 gap-y-8 gap-x-4 place-items-center mb-10">
                                ${presets.map(p => `
                                    <div class="flex flex-col items-center gap-2">
                                        <div onclick="applyTheme('${p.c}');renderContent()" 
                                            class="color-preset ${state.themeColor===p.c?'active':''}" 
                                            style="background:${p.g || p.c}"></div>
                                        <span class="text-[10px] font-bold text-slate-400 text-center" data-i18n="${p.key}">${p.name}</span>
                                    </div>
                                `).join('')}
                                <div class="flex flex-col items-center gap-2">
                                    <input type="color" onchange="applyTheme(this.value);renderContent()" 
                                        value="${state.themeColor==='svt'?'#92A8D1':state.themeColor==='bp'?'#FF85D0':state.themeColor}" 
                                        class="w-10 h-10 rounded-full border-none cursor-pointer bg-slate-200 shadow-sm">
                                    <span data-i18n="appear_eyedropper" class="text-[10px] font-bold text-slate-400 text-center">滴管選色</span>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <div onclick="openGradModal()" 
                                        class="color-preset flex items-center justify-center text-white text-[10px] font-bold ${state.themeColor.includes('gradient') && state.themeColor!=='svt'?'active':''}" 
                                        style="background:white">🎨</div>
                                    <span data-i18n="appear_custom_grad" class="text-[10px] font-bold text-slate-400 text-center">自訂漸層</span>
                                </div>
                            </div>

                            <div class="mt-8 pt-6 border-t border-gray-100">
                                <h3 data-i18n="appear_custom_hex" class="text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">輸入自訂色碼</h3>
                                <div class="flex gap-2">
                                    <input type="text" id="custom-hex-input" placeholder="#RRGGBB" 
                                        value="${currentHex}"
                                        class="flex-grow min-w-0 w-full bg-slate-50 border-2 border-transparent focus:border-brand rounded-2xl px-4 py-3 text-sm outline-none font-mono text-slate-700">
                                    <button data-i18n="btn_apply" onclick="applyHexColor()" 
                                            class="flex-shrink-0 bg-brand text-white font-bold px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-all">
                                        套用
                                    </button>
                                </div>
                                <p data-i18n="appear_hex_hint" class="text-[10px] text-slate-300 mt-2 ml-1">請輸入包含 # 的六位數色碼，例如 #92A8D1</p>
                            </div>
                        </div>
                        
                        <div class="mt-6 pt-2 border-t border-gray-100">
                            <div class="bg-white rounded-3xl p-5 card-shadow flex items-center justify-between border border-gray-100/50">
                                <div class="flex items-center gap-1">
                                    <div class="w-10 h-10 flex items-center justify-center ">
                                        <svg class="text-brand" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"/></svg>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-sm text-slate-500" data-i18n="appear_lang">語言</h4>
                                    </div>
                                </div>
                                <div>
                                    <select 
                                        onchange="changeLang(this.value)" 
                                        class="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-brand focus:bg-white transition-all cursor-pointer"
                                    >
                                        ${langOptions.map(l => 
                                            `<option value="${l.code}" ${getLang() === l.code ? 'selected' : ''}>${l.label}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>`;
            }
        export function toggleDarkMode(isDark) {
            // 套用目前的顏色，但傳入新的深淺設定
            applyTheme(state.themeColor, isDark);
            showToast(isDark ? t('toast_dark_on') : t('toast_dark_off'));
        }
        export function applyHexColor() {
            const hexInput = document.getElementById('custom-hex-input');
            const color = hexInput.value.trim();
            
            // 驗證格式是否為有效的 Hex 色碼 (例如 #FFFFFF 或 #FFF)
            const isHex = /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
            
            if (isHex) {
                applyTheme(color);
                renderContent();
                showToast(t('toast_hex_updated')); //更新自訂主題色
            } else {
                showToast(t('toast_hex_error')); //格式錯誤 
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
            document.getElementById('grad-preview-box').style.background = `linear-gradient(135deg, ${c1} 0%,${c1} 20%, ${c2})`;
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
                    color2 = matchedColors[2];
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
            const grad = `linear-gradient(135deg, ${c1} 0%,${c1} 20%, ${c2})`;
            const isDark = document.getElementById('grad-dark-toggle').checked;
            // 套用主題，多傳一個 isDark 參數
            applyTheme(grad, isDark);
            document.getElementById('grad-modal').classList.add('hidden');
            renderContent();
            showToast(t('toast_grad_updated')); //更新自訂漸層
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
                root.style.setProperty('--brand-color-one', '#F7CAC9');
                root.style.setProperty('--brand-gradient', 'linear-gradient(135deg, #F7CAC9 0%,#F7CAC9 20%, #92A8D1 100%)');
            } else if (color.includes('gradient')) {
                root.style.setProperty('--brand-gradient', color);
                const match = color.match(/#[A-Fa-f0-9]{6}/);
                root.style.setProperty('--brand-color', match ? match[0] : '#92A8D1');
                root.style.setProperty('--brand-color-one', match ? match[0] : '#92A8D1');
            } else {
                root.style.setProperty('--brand-color', color);
                root.style.setProperty('--brand-gradient', color);
                root.style.setProperty('--brand-color-one', color);
            }
            localStorage.setItem('fe_v11_theme', color);
        }



        // --- 數據匯入與匯出 ---
        function renderBackupView(container) {
            container.innerHTML = `<div class="p-6"><div class="flex items-center gap-3 mb-8"><button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg></button><h2 data-i18n="backup_title" class="text-2xl font-black tracking-tight text-slate-800">匯入與匯出</h2></div>
                <div class="bg-white rounded-3xl p-8 card-shadow border-2 border-dashed border-slate-200 text-center text-slate-800"><div class="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">📊</div><h3 data-i18n="backup_excel_title" class="text-lg font-bold mb-2">Excel 管理</h3><p class="text-sm text-slate-400 mb-8 px-4"><span data-i18n="backup_excel_desc">本地 Excel 備份不包含圖片資料</span><br><span data-i18n="backup_excel_warn" class="text-yellow-500 font-bold">⚠️匯入後會覆蓋現有資料並清除圖片</span></p>
                <div class="grid grid-cols-1 gap-4">
                    <button data-i18n="btn_export" onclick="exportToExcel()" class="bg-brand text-white font-black py-5 rounded-2xl shadow-lg active:scale-95 transition-transform">匯出 Excel 備份</button>
                <label data-i18n="btn_import" class="bg-slate-800 text-white font-black py-5 rounded-2xl active:scale-95 cursor-pointer text-center">匯入 Excel 還原<input type="file" class="hidden" accept=".xlsx, .xls" onchange="importFromExcel(this)"></label>
                </div></div></div>`;
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
        const confirmed = await askUser('msg_import_title', 'msg_import_desc', "⚠️" );

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
                    showToast(t('toast_no_sheet')); //找不到「消費清單」工作表
                    return;
                }

                const worksheet = workbook.Sheets["消費清單"];
                const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (aoa.length < 1) {
                    showToast(t('toast_file_empty')); //檔案為空
                    return;
                }

                const fileHeaders = aoa[0].map(h => String(h || "").trim());
                const nameIdx = fileHeaders.indexOf("項目名稱");
                if (nameIdx === -1) {
                    showToast(t('toast_no_name_field')); //找不到「項目名稱」欄位
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
                    const TEXT_FIELDS = ['name', 'platform', 'remark', 'category', 'arrivalStatus', 'paymentMethod'];
                    TEXT_FIELDS.forEach(f => {
                        if (typeof item[f] === 'string') {
                            item[f] = escapeHTML(item[f]);
                        }
                    });
                    if (Array.isArray(item.tags)) {
                        item.tags = item.tags.map(t => escapeHTML(t));
                    }

                    importedData.push(item);
                }

                if (importedData.length > 0) {
                    state.expenses = importedData;
                    localStorage.setItem('fe_v11_expenses', JSON.stringify(state.expenses));
                    if (window.cloud) window.cloud.sync(state.expenses, state.wishlist);
                    renderContent();
                    showToast(t('toast_import_success', { n: importedData.length }));
                }
            } catch (err) {
                console.error(err); 
                showToast(t('toast_format_error'));
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
                    
                    <h2 data-i18n="account_title" class="text-2xl font-black tracking-tight text-slate-800">帳本與功能</h2>
                </div>
                <div class="space-y-6">
                    <div class="bg-white rounded-3xl p-6 card-shadow">
                        <h3 data-i18n="account_cat_mode" class="text-sm font-bold text-slate-500 uppercase mb-4 tracking-widest">帳本分類模式</h3>
                        <div class="flex bg-slate-100 p-1 rounded-2xl">
                            <button data-i18n="account_kpop" onclick="switchCatSet('categories')" class="flex-1 py-3 text-sm font-bold rounded-xl transition-all ${state.categorySet === 'categories' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}">KPOP 模式</button>
                            <button data-i18n="account_acgn" onclick="switchCatSet('categoriesACGN')" class="flex-1 py-3 text-sm font-bold rounded-xl transition-all ${state.categorySet === 'categoriesACGN' ? 'bg-white text-brand shadow-sm' : 'text-slate-400'}">ACGN 模式</button>
                        </div>
                    </div>
                    <div class="bg-white rounded-3xl p-6 card-shadow">
                        <div class="flex items-center justify-between ${state.enableExchange ? 'mb-6 border-b border-gray-100' : ''}">
                            <div>
                                <h3 data-i18n="account_exchange" class="text-sm font-bold text-slate-500 tracking-widest">開啟匯率換算工具</h3>
                                <p data-i18n="account_exchange_sub" class="text-[10px] text-slate-400">在新增紀錄時顯示外幣換算區</p>
                                <p data-i18n="account_exchange_desc" class="text-[10px] text-slate-400">若在關閉時編輯紀錄，匯率資料會消失</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" onchange="toggleExchange(this.checked)" ${state.enableExchange ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-slate-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                     ${state.enableExchange ? `
                    <div class="animate-enter">
                        <h3 data-i18n="account_currency" class="text-xs  text-slate-400 mb-4 tracking-widest uppercase">預設記帳幣別</h3>
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
                        <p data-i18n="account_currency_sub" class="text-[10px] text-slate-400 mt-2 px-1">更改此處將會影響匯率換算的基準幣別</p>
                    </div>
                    ` : ''}
                    </div>

                    <div class="space-y-4">
                        <div class="bg-white p-6 rounded-3xl card-shadow" onclick="state.subPage='catOrder'; renderContent();">
                            <div class="flex justify-between items-center cursor-pointer">
                                <div><h3 data-i18n="account_cat_order" class="text-sm font-bold text-slate-500 tracking-widest">調整分類順序</h3><p data-i18n="account_cat_order_sub" class="text-[10px] text-slate-400">自訂最常用的分類顯示在最前面</p></div>
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
            showToast(`${setName === 'categories' ? t('toast_switch_kpop') : t('toast_switch_acgn')}`);
        }
        export function updateDefaultCurrency(val) {
            state.defaultCurrency = val;
            localStorage.setItem('fe_v11_defaultCurrency', val);
            localStorage.removeItem('fandom_rates_timestamp'); //清除原本快取
            fetchRates(); 
            showToast(t('toast_currency_changed', { n: val })); //預設幣別已更改為
            renderContent();
        }

        export function toggleExchange(val) {
            state.enableExchange = val;
            localStorage.setItem('fe_v11_enableExchange', val);
            if (val) fetchRates();
            renderContent(); // 重新渲染以實現 toggle 效果
            showToast(val ? t('toast_exchange_on') : t('toast_exchange_off'));
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
                state.rateStatusText = "rate_cached"; //匯率已就緒 (快取)
                console.log("Using cached rates from:", new Date(parseInt(cachedTime)).toLocaleString());
                return;
            }

            // 否則，向網路請求新的匯率
            state.rateStatusText = "rate_updating"; //正在更新最新匯率...
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
                    state.rateStatusText = "rate_updated"; //匯率已更新(網路);
                    console.log("Rates updated from API");
                }
                else {
                    if (cachedData) state.rates = JSON.parse(cachedData);
                    state.rateStatusText = "rate_failed"; //匯率連線失敗，使用離線數據
                }
            } catch (e) {
                console.warn("API 抓取失敗，使用預設值或舊快取",e);
                if (cachedData) state.rates = JSON.parse(cachedData);
                state.rateStatusText = "rate_failed"; //匯率連線失敗，使用離線數據
            }
            updateRateUI();
        }
        // 更新介面上的文字 (若元素存在)
        function updateRateUI() {
            const tag = document.getElementById('rate-tag');
            if (tag){
                const currentKey = state.rateStatusText;
                tag.setAttribute('data-i18n', currentKey);
        
                if (typeof t === 'function') {
                    tag.innerText = t(currentKey);
                } else {
                    tag.innerText = currentKey; // 防呆
                };
            }
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
                        <h2 data-i18n="account_cat_order" class="text-2xl font-black text-slate-800">調整分類順序</h2>
                    </div>

                    <div class="bg-white rounded-3xl m-4 p-2 card-shadow overflow-hidden" id="drag-list" style="touch-action: none;">
                        ${sorted.map((c, i) =>{ 
                            const cleanId = c.id.replace(/\s+/g, '');
                            return `<div class="drag-item flex items-center justify-between p-4 border-b last:border-0 bg-white group" 
                                data-id="${c.id}">
                                
                                <div class="flex items-center gap-3 flex-grow cursor-move handle">
                                    <span class="text-slate-300 group-active:text-brand transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                            <path d="M7 10h10M7 14h10" stroke-linecap="round"/>
                                        </svg>
                                    </span>
                                    <span class="font-bold text-slate-700 select-none">${c.icon} <span data-i18n="cat_${cleanId}">${c.id}<span></span>
                                </div>

                                <div class="flex gap-1">
                                    <button onclick="moveCat('${c.id}', -1)" class="p-2 bg-slate-50 rounded-xl text-slate-400 active:bg-brand/10 active:text-brand disabled:opacity-10 transition-all" ${i === 0 ? 'disabled' : ''}>
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </button>
                                    <button onclick="moveCat('${c.id}', 1)" class="p-2 bg-slate-50 rounded-xl text-slate-400 active:bg-brand/10 active:text-brand disabled:opacity-10 transition-all" ${i === sorted.length - 1 ? 'disabled' : ''}>
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </button>
                                </div>
                            </div>`}).join('')}
                    </div>
                    <p data-i18n="account_cat_order_desc" class="text-[10px] text-slate-400 mt-6 text-center font-bold uppercase tracking-widest">可拖曳左側手柄或使用箭頭調整順序</p>
                </div>`;

            // 啟動拖曳監聽
            initUniversalSort();
            updateStaticTranslations(container);
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
                showToast(t('toast_cat_updated')); //分類排序已更新
                // 執行雲端同步
                if (window.cloud?.sync) {
                    window.cloud.sync(state.expenses, state.wishlist)
                        .then(() => console.log("分類排序雲端同步成功"))
                        .catch(err => console.error("雲端同步失敗", err));
                } else {
                    // 如果沒登入雲端，至少給個本地存檔完成的提示
                    showToast(t('toast_cat_updated_local')); //分類排序已更新 (本地)
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
                { version: 'v13.0', date: '2026.07.15', updates: ['新增物流管理篩選：顯示各狀態商品數量，快速切換並支援一鍵清除篩選','支援多語系:繁體中文、英文、韓文、日文，可前往外觀設定切換語系 <br> 非專業翻譯若有遇到翻譯錯誤或不通順的地方，歡迎回報','成功馴服AI所以抱著我家大胖貓慶祝🐈']},
                { version: 'v12.0', date: '2026.06.22', updates: ['新增常用購物平台建議，快速完成消費紀錄','優化年月切換介面：新增左右箭頭快速瀏覽歷史紀錄','新增「標記已取貨」功能，收到商品後可一鍵更新狀態','財務報表新增標籤分析，看看你的錢都花在哪個坑裡']},
                { version: 'v11.0', date: '2026.06.13', updates: ['設定自動記憶：修正帳本模式（KPOP/ACGN）與匯率工具，重開 App 不再跳回預設值','優化登入合流機制，重新登入時會自動將登出期間新增的資料合併上雲端','未登入限制與提示：未登入時會鎖定新增功能並跳出提示，避免資料沒同步到雲端而遺失']},
                { version: 'v10.0', date: '2026.05.31', updates: ['篩選功能升級：標籤支援複選，快速查看符合多個條件的紀錄','優化年月份篩選：記住「不限」篩選設定，避免每次開啟都切回當月']},
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
                        <h2 data-i18n="settings_version" class="text-2xl font-black tracking-tight text-slate-800">版本說明</h2>
                    </div>
                    
                    <div class="flex flex-col items-center mb-10">
                        <div class="w-20 h-20 bg-brand rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl mb-4">💎</div>
                        <h3 class="text-lg font-black text-slate-800">追星錢包 Fandom Wallet</h3>
                        <p class="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">Version 13.0</p>
                    </div>

                    <div class="space-y-6">
                        ${logs.map(log => `
                            <div class="relative pl-6 border-l-2 border-gray-100">
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

                    <div class="mt-8 border-t border-gray-100 text-center">
                        <p class="text-[9px] text-slate-300 font-medium">Made for Fans , by fan. </p>
                        <p class="text-[8px] text-slate-300 mt-1 uppercase tracking-widest">©2026 bobi_9yu </p>
                    </div>
                </div>
            `;
        }

        // 常見問題 FAQ 
        function renderFAQView(container) { 
            const faqs = [
                { key_q: "faq_q1", q: "追星錢包會上架到APP商店嗎？",key_a: "faq_a1", a: "目前因為技術限制與上架流程較繁瑣，因此暫時沒有上架 App Store / Google Play 的計畫。但現在可以直接加入主畫面使用，體驗會和 App 很接近！" },
                { key_q: "faq_q2", q: "如何加入主畫面？", key_a: "faq_a2", a: "使用 Safari/Chrome 開啟，點擊右上方「分享」圖示後選擇「加入主畫面」。" },
                { key_q: "faq_q3", q: "一鍵匯入匯出功能如何使用？", key_a: "faq_a3", a: "使用方式：<br/>1. 先在「數據匯入與匯出」內匯出 Excel，取得系統提供的範例檔案格式。<br/>2. 將你原本的 Excel 資料 複製到範例檔案的對應欄位。<br/>3. 再把整理好的檔案 匯入 App 即可。<br/>注意事項：<br/>•  項目名稱與單價為必填欄位<br/>•  其他欄位都可以留空<br/>•  如果沒有填寫時間，系統會自動匯入到「上個月」這樣就可以快速把原本的紀錄搬進追星錢包了 ✨" },
                { key_q: "faq_q4", q: "如何查詢未到貨商品？", key_a: "faq_a4", a: "在搜尋框輸入「未到貨」關鍵字，或點擊「#未到貨」標籤。" },
                { key_q: "faq_q5", q: "可以自行新增分類嗎？", key_a: "faq_a5", a: "目前不支援。<br/>為了維持報表統計的一致性，採用固定分類。<br/>💡記帳小貼士：<br/>1. 標籤功能：細節（如：成員）請用 #標籤，能更靈活地記錄細節並支援搜尋篩選。<br/>2. 切換模式：在「設定 > 帳本與功能」可依照喜好切換預設分類。<br/>3. 許願功能：歡迎點擊下方前往許願，會評估後新增！" },
                { key_q: "faq_q6", q: "為什麼在網頁版新增了資料，打開 App (加入主畫面) 卻沒看到？", key_a: "faq_a6", a: "這通常是因為 App 端的登入狀態尚未同步更新。<br/><b>檢查登入</b>：進入「設定」，確認目前是否為登入狀態。若顯示未登入，請重新登入即可抓回雲端資料。<br/><br/>追星錢包採用即時雲端儲存，只要是登入狀態新增的資料都會安全存在雲端囉！" }
            ];

            container.innerHTML = `
                <div class="p-6 pb-32">
                    <div class="flex items-center gap-3 mb-8">
                        <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90 font-bold">                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg></button>
                        <h2 data-i18n="settings_faq" class="text-2xl font-black tracking-tight text-slate-800">常見問題與幫助</h2>
                    </div>
                    <h3 data-i18n="faq_title" class="text-sm font-black text-brand uppercase tracking-widest mb-4 ml-1">常見問題 FAQ</h3>
                    <div class="space-y-3 mb-10">
                        ${faqs.map((faq, i) => `
                            <div class="faq-item bg-white rounded-2xl p-4 card-shadow" onclick="toggleFaq(${i})">
                                <div class="flex justify-between items-center cursor-pointer">
                                    <h4 data-i18n="${faq.key_q}" class="text-xs font-bold text-slate-500 pr-4">${faq.q}</h4>
                                    <svg class="w-4 h-4 text-slate-300 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2.5"/></svg>
                                </div>
                                <div class="faq-answer mt-2"><p data-i18n-html="${faq.key_a}" class="text-[11px] text-slate-400 border-t border-gray-100 pt-2">${faq.a}</p></div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="space-y-4">
                        <a href="https://forms.gle/vF1hfL3RTs6TMuw17" target="_blank" data-i18n="faq_submit" class="block w-full bg-white text-brand font-bold py-4 rounded-2xl text-center text-sm card-shadow active:scale-[0.98] transition-all">
                            📝 問題回報與功能許願
                        </a>
                    </div>
                </div>`;
        }
        // 常見問題 FAQ 
        function renderPrivacyView(container) { 
            container.innerHTML=`
            <div class="max-w-4xl mx-auto px-6 py-6">
                <div class="flex justify-between items-center gap-3 mb-2">
                    <div class="flex items-center gap-3 mb-2">
                        <button onclick="state.subPage=null;renderContent()" class="p-2 -ml-2 text-slate-400 active:scale-90 font-bold">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2"/></svg>
                        </button>
                        <h2 class="text-2xl font-black tracking-tight text-slate-800">隱私權政策</h2>
                    </div>
                </div>
            <div class="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <h1 class="text-2xl font-black text-brand mb-3">追星錢包 隱私權政策</h1>
                <p class="text-slate-500 mb-10">最後更新日期：2026 年 7 月</p>

                <p class="text-slate-700 leading-8 mb-10">
                    歡迎使用「追星錢包」（以下簡稱「本應用」）。
                    我們重視您的個人資料與隱私權，並致力於以安全、透明的方式處理您的資料。
                    本隱私權政策說明本應用蒐集、使用、儲存及保護您的資訊方式。
                </p>

                <!-- 一 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">一、蒐集的資料</h2>
                    <p class="mb-4">本應用僅會蒐集提供服務所需的資料。 </p>
                    <h3 class="font-bold text-lg mt-6 mb-2">（一）您主動提供的資料</h3>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>消費紀錄（例如品名、金額、分類、日期、備註、付款方式等）</li>
                        <li>願望清單內容</li>
                        <li>收藏、標記或其他您自行建立的資料</li>
                        <li>您上傳的商品、周邊、活動或其他與追星相關的圖片</li>
                        <li>您自行輸入的其他文字內容</li>
                    </ul>
                    <p class="mt-4 text-slate-700">上述資料皆由您自行決定是否建立、修改或刪除。</p>
                    <h3 class="font-bold text-lg mt-8 mb-2">（二）Google 帳號資訊</h3>
                    <p class="mb-2">若您使用 Google 帳號登入，本應用將取得 Google 提供的必要資訊，包括： </p>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>使用者唯一識別碼（UID）</li>
                        <li>顯示名稱</li>
                        <li>大頭貼圖片網址</li>
                        <li>電子郵件地址（若 Google 授權提供）</li>
                    </ul>
                    <p class="mt-4 text-slate-700">上述資訊僅用於登入驗證、建立帳戶、雲端同步及顯示帳號資訊，本應用不會取得您的 Google 密碼。</p>
                    <h3 class="font-bold text-lg mt-8 mb-2">（三）系統自動收集的技術資訊</h3>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>Firebase Analytics 使用事件</li>
                        <li>錯誤紀錄</li>
                        <li>JavaScript 執行錯誤資訊</li>
                        <li>裝置資訊（例如 User Agent）</li>
                        <li>應用程式版本資訊</li>
                    </ul>

                    <p class="mt-4 text-slate-700">上述資訊僅供分析及改善應用程式，不會用於識別您的身分或投放廣告。</p>

                    <h3 class="font-bold text-lg mt-8 mb-2">（四）本機儲存資料</h3>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>主題設定</li>
                        <li>語言設定</li>
                        <li>篩選與排序條件</li>
                        <li>是否隱藏金額</li>
                        <li>匯率快取資料</li>
                        <li>其他使用偏好設定</li>
                    </ul>
                    <p class="mt-4 text-slate-700">上述資料主要儲存在您的裝置中，不會因本機設定而分享給其他使用者。</p>
                </section>

                <!-- 二 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4"> 二、資料用途</h2>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>提供記帳、圖片紀錄及願望清單功能。</li>
                        <li>提供雲端備份及跨裝置同步。</li>
                        <li>顯示統計分析、報表及圖片牆等功能。</li>
                        <li>提供登入驗證及帳戶管理。</li>
                        <li>改善應用程式功能、效能及使用體驗。</li>
                        <li>分析錯誤並提升系統穩定性。</li>
                        <li>維護服務安全及防止異常使用。</li>
                    </ul>
                    <p class="mt-4 text-slate-700">本應用不會販售您的個人資料，也不會將您的資料提供第三方作為廣告行銷用途。</p>
                </section>

                <!-- 三 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4"> 三、資料儲存與第三方服務</h2>
                    <p class="text-slate-700 leading-8">
                        本應用使用 Google Firebase 提供登入驗證、雲端資料庫、圖片儲存及匿名使用分析等服務。
                        您建立的消費紀錄、願望清單、圖片及帳戶資料將儲存在 Google Firebase 伺服器，由 Google 依其安全機制進行保護。
                    </p>
                    <p class="mt-4 text-slate-700 leading-8">此外，本應用可能使用第三方匯率服務取得最新匯率資料，以提供多幣別換算功能。</p>
                    <p class="mt-4">
                        Firebase 隱私權政策：
                        <a
                            class="text-brand underline break-all"
                            href="https://firebase.google.com/support/privacy"
                            target="_blank">
                            https://firebase.google.com/support/privacy
                        </a>
                    </p>
                </section>

                <!-- 四 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">四、裝置權限</h2>
                    <h3 class="font-bold text-lg mb-2">（一）相片</h3>
                    <p class="mb-6">用於讓您自行選擇圖片並上傳至消費紀錄或願望清單。</p>
                    <h3 class="font-bold text-lg mb-2">（二）相機（依裝置支援）</h3>
                    <p class="mb-6">若您選擇使用裝置提供的拍照功能新增圖片，系統可能要求相機權限。相機僅會於您主動操作時使用，本應用不會在背景或未經您同意的情況下存取相機。</p>
                    <h3 class="font-bold text-lg mb-2">（三）網路連線</h3>
                    <p>用於 Google 帳號登入、雲端同步、圖片上傳、匯率更新及 Firebase 雲端服務。</p>
                    <p class="mt-4">除上述功能外，本應用不會主動要求存取您的聯絡人、位置資訊、通話紀錄、簡訊或麥克風等權限。</p>
                </section>

                <!-- 五 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">五、本機儲存與快取</h2>
                    <p class="leading-8">若您透過瀏覽器或 PWA 版本使用本應用，系統可能使用 LocalStorage、瀏覽器快取或 Service Worker，以儲存必要設定並提升載入速度及離線使用體驗。</p>
                    <p class="mt-4">上述資料主要儲存在您的裝置中，不會用於跨網站追蹤或廣告用途。</p>
                </section>

                <!-- 六 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">六、資料安全</h2>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>使用 HTTPS 加密傳輸。</li>
                        <li>使用 Firebase 提供的安全機制保護雲端資料。</li>
                        <li>設定適當的資料存取權限。</li>
                        <li>持續改善系統安全性與穩定性。</li>
                    </ul>
                    <p class="mt-4"> 惟任何網路傳輸或電子儲存方式均無法保證百分之百安全，我們將持續採取合理措施保護您的資料。</p>
                </section>

                <!-- 七 -->

                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">七、您的權利</h2>
                    <ul class="list-disc ml-6 space-y-2 text-slate-700">
                        <li>查詢或閱覽您提供的個人資料。</li>
                        <li>請求更正或更新您的個人資料。</li>
                        <li>請求刪除您的帳戶及相關資料（依法須保存者除外）。</li>
                        <li>撤回您對個人資料處理的同意；惟撤回前已依法進行之資料處理，不受影響。</li>
                    </ul>
                </section>

                <!-- 八 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">八、資料刪除 </h2>
                    <p class="leading-8">您可以隨時於本應用內刪除個別消費紀錄、願望清單內容或圖片，刪除後將同步更新至雲端資料。 </p>
                    <p class="mt-4 leading-8">如需刪除帳戶及所有相關雲端資料，可透過本應用提供的功能（若有）或聯絡開發者提出申請，我們將於確認身分後協助處理。</p>
                </section>

                <!-- 九 -->
                <section class="mb-12">
                    <h2 class="text-2xl font-bold text-brand mb-4">九、隱私權政策更新 </h2>
                    <p class="leading-8">本隱私權政策可能因法令變更、服務內容調整或功能更新而修訂。</p>

                    <p class="mt-4">如有重大變更，我們將於本應用或相關頁面公告更新內容，更新後的隱私權政策自公布日起生效。</p>
                </section>
                <!-- 十 -->
                <section>
                    <h2 class="text-2xl font-bold text-brand mb-4">十、聯絡我們</h2>
                    <p class="leading-8">若您對本隱私權政策或個人資料處理方式有任何疑問、建議或申請，歡迎透過以下方式聯絡我們。</p>
                    <div class="mt-6 rounded-2xl bg-violet-50 p-6 border border-violet-100">
                        <p><strong>開發者：</strong>追星錢包</p>
                        <p class="mt-2"><strong>電子郵件：</strong>bobi9yu@gmail.com</p>
                    </div>
                </section>
            </div>
            <footer class="text-center text-slate-400 text-sm py-10">© 2026 追星錢包 Fandom Wallet. All Rights Reserved.</footer>
        </div>`
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

// 語言切換函數
window.changeLang = (lang) => {
    setLang(lang);
    updateStaticTranslations(); // 先更新靜態部分（導覽列等）
    renderContent();             // 再重繪動態內容
};


