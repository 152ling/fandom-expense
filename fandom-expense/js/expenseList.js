// js/expenseList.js
import { state } from './state.js';
import { baseCategories } from './constants.js';
import { renderContent ,getCurrentCategories,askUser} from './ui.js';
import { escapeHTML } from './utils.js';
import './i18n.js';

        let showStatusFilter = false;
        let shippingStatusTab = 'all'; // 'all', 'not-received', 'received', 'sold'
        let detailedPendingFilter = null; // null, '未到貨', '待二補', '待出貨', '待取貨'

        export function renderExpenseList(container) {
            // 自動生成從 2010 到 明年 的年份陣列
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let y = 2010; y <= currentYear + 1; y++) { years.push(y); }
            const yearList = [0, ...years.reverse()];
            const isDoubleUnlimited = (state.filterYear === 0 && state.filterMonth === 0);
            const hideArrowsClass = isDoubleUnlimited ? 'hidden' : ''; //如果年月都是不限隱藏左右箭頭
            container.innerHTML = `
                <div class="pt-6 px-6 sticky top-0 bg-brand/5 backdrop-blur-md z-30 border-b border-gray-100">
                    <div class="flex justify-between items-center mb-4">
                        <h2 data-i18n="expense_title" class="text-2xl font-black tracking-tight">消費清單</h2>
                        <div class="flex gap-2 text-gray-800">
                            <div class="relative" id="date-picker-box">
                                <div class="flex items-center gap-1 bg-white border-brand rounded-lg shadow-sm px-1">
                                    <!-- 左箭頭：上個月 -->
                                    <button onclick="shiftMonth(-1)" class="${hideArrowsClass} p-1.5 text-slate-400 active:text-brand active:scale-90 transition-all">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>

                                    <!-- 中間：點擊彈出年/月下拉選單 -->
                                    <button onclick="toggleSelect('date-picker-panel')" class="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700">
                                        <span id="date-display-text">${getDateDisplayText()}</span>
                                        <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 9l-7 7-7-7" stroke-width="2.5"/>
                                        </svg>
                                    </button>

                                    <!-- 右箭頭：下個月 -->
                                    <button onclick="shiftMonth(1)" class="${hideArrowsClass} p-1.5 text-slate-400 active:text-brand active:scale-90 transition-all">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                </div>

                                <div id="date-picker-panel" class="hidden absolute z-50  right-0 bg-white border border-slate-100 rounded-xl shadow-xl p-3 flex gap-2 min-w-[210px]">
                                    <!-- 年份下拉選單 -->
                                    <select onchange="updateFilter('year', this.value)" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none shadow-sm text-slate-700 cursor-pointer flex-1">
                                        ${yearList.map(y => `
                                            <option value="${y}" ${Number(y) === Number(state.filterYear) ? 'selected' : ''}>
                                                ${y === 0 ? t('filter_all_years') : y }
                                            </option>
                                        `).join('')}
                                    </select>
                                        
                                     <!-- 月份下拉選單 -->
                                    <select onchange="updateFilter('month', this.value)" class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none shadow-sm text-slate-700 cursor-pointer flex-1">
                                        <option data-i18n="filter_all_months" value="0" ${state.filterMonth === 0 ? 'selected' : ''}>不限月份</option>

                                        ${(() => {
                                        return Array.from({length: 12}, (_, i) => i + 1).map(m => {
                                            let displayText = getMonthDisplayText(m);

                                            return `
                                                <option value="${m}" ${Number(m) === Number(state.filterMonth) ? 'selected' : ''}>
                                                    ${displayText}
                                                </option>
                                            `;
                                        }).join('');
                                    })()}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="relative flex mb-3 gap-2">
                        <div class="relative flex-1 flex items-center">
                            <input data-i18n-placeholder="expense_search_ph" id="search-input" type="text" oninput="state.searchKeyword=this.value;state.currentPage=1;document.getElementById('search-clear-btn').classList.toggle('hidden', !this.value); renderExpenseListItems(document.getElementById('expense-list-items'))" class="w-full bg-white border border-gray-100 rounded-2xl py-3 px-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20 transition-all text-gray-800">
                            <svg class="text-brand w-4 h-4 absolute left-4 top-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="3"/></svg>
                            <button id="search-clear-btn" onclick="clearKeywordSearch()" 
                                    class="${state.searchKeyword ? '' : 'hidden'} absolute right-4 top-3.5 text-slate-400 hover:text-brand transition-colors p-0.5 rounded-full hover:bg-slate-50 active:scale-90 transition-all" 
                                    title="清空搜尋">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <button 
                            id="toggleFilterBtn"  onclick="togglefilterPanelVisibility()"
                            class="p-3 rounded-2xl border transition-all relative flex items-center justify-center shadow-sm border ${showStatusFilter ? 'bg-brand-one border-brand text-white' : 'bg-white border-gray-100 text-slate-400'}"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal-icon lucide-sliders-horizontal"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
                        </button>
                    </div>
                

                    <div id="cat-bar" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-1"></div>
                    <div id="tag-bar" class="flex gap-2 overflow-x-auto no-scrollbar pb-2"></div>

                </div>
                <div id="expense-list-items" class="px-6 space-y-4 pb-12 pt-4"></div>
            `;
            renderTagAndCatBar();
            renderExpenseListItems(document.getElementById('expense-list-items'));
            /*** 簡單切換選單開關*/
            window.toggleSelect = (id) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.classList.toggle('hidden');
            };

            // 點擊外面時自動關閉
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#date-picker-box')) {
                    document.getElementById('date-picker-panel')?.classList.add('hidden');
                }
            });
        }
        
        export function clearKeywordSearch() { // 新增：清除搜尋內容函數
            state.searchKeyword = '';
            shippingStatusTab='all';
            detailedPendingFilter = null;
            state.currentPage = 1;
            const input = document.getElementById('search-input');
            if (input) {
                input.value = '';
            }
            const clearBtn = document.getElementById('search-clear-btn');
            if (clearBtn) {
                clearBtn.classList.add('hidden');
            }
            // 重新渲染清單
            renderExpenseListItems(document.getElementById('expense-list-items'));
        }
        window.clearKeywordSearch = clearKeywordSearch;

        export function shiftMonth(delta) { //左右箭頭切換月份或年份
            let currentMonth = state.filterMonth;
            let currentYear = state.filterYear;
            // 雙不限狀態不處理
            if (currentYear === 0 && currentMonth === 0) return;

            if (currentYear !== 0 && currentMonth === 0) {
                // 情境 1：特定數字年份 + 不限月份 -> 點擊左右箭頭切換年份增減 (不影響月份)
                currentYear += delta;
            } else if (currentYear === 0 && currentMonth !== 0) {
                // 情境 2：不限年份 + 特定數字月份 -> 僅切換月份 (1月與12月之間循環)
                currentMonth += delta;
                if (currentMonth > 12) currentMonth = 1;
                if (currentMonth < 1) currentMonth = 12;
            } else {
                // 情境 3：特定數字年份 + 特定數字月份 -> 正常的跨年份月份切換
                currentMonth += delta;
                if (currentMonth > 12) {
                    currentMonth = 1;
                    currentYear += 1;
                } else if (currentMonth < 1) {
                    currentMonth = 12;
                    currentYear -= 1;
                }
            }
            state.filterYear = currentYear;
            state.filterMonth = currentMonth;

            // 儲存狀態同步
            if (currentYear === 0) { //只記住不限的選擇
                localStorage.setItem('fe_v11_filterYear', 0);
            } else {
                localStorage.removeItem('fe_v11_filterYear');
            }
            if (currentMonth === 0) {
                localStorage.setItem('fe_v11_filterMonth', 0);
            } else {
                localStorage.removeItem('fe_v11_filterMonth');
            }
            
            renderContent();
        }
        window.shiftMonth = shiftMonth;

        function getDateDisplayText() { // 顯示目前選擇的年月文字
            const currentLang = typeof getLang === 'function' ? getLang() : (localStorage.getItem('fe_v11_lang') || 'zh-TW');
            const monthsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const y = state.filterYear;
            const m = state.filterMonth;
            if (state.filterYear === 0 && state.filterMonth === 0) return t('filter_all'); //不限
            // 處理「不限年份」
            if (y === 0) {
                if (currentLang === 'en') return `${monthsEN[m - 1]}`;
                if (currentLang === 'ko') return `${m}월`;
                return `${m}月`; // 中、日
            }
            // 處理「不限月份 (整年)」
            if (m === 0) {
                // 中文："年", 英文："Year", 韓文："년"
                return `${y}${t('filter_full_year')}`; 
            }
            // 正常年月都有的情況
            if (currentLang === 'en') {
                return `${monthsEN[m - 1]} ${y}`; //(改為 Jan 2026)
            } else if (currentLang === 'ko') {
                return `${y}년 ${m}월`;
            } else {
                return `${y}年${m}月`; // 中、日
            }
        }
        function getMonthDisplayText(monthNum) { // 顯示月份文字 用在下拉選單跟清單上
            const currentLang = typeof getLang === 'function' ? getLang() : (localStorage.getItem('fe_v11_lang') || 'zh-TW');
            const monthsEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const m = Number(monthNum); 
            if (isNaN(m) || m < 1 || m > 12) return monthNum; 

            if (currentLang === 'en') {
                return monthsEN[m - 1]; // 英文版顯示 Jan, Feb...
            } else if (currentLang === 'ko') {
                return `${m}월`;        // 韓文版顯示 1월, 2월...
            } else {
                return `${m}月`;        // 中、日文版顯示 1月, 2月...
            }
        }
            // 設定主要頁籤
        export function setShippingStatusTab(tab) {
            shippingStatusTab = tab;
            detailedPendingFilter = null; // 切換大頁籤時清除二級細項
            renderExpenseListItems(document.getElementById('expense-list-items'));
        }

        // 設定二級細項
        export function setDetailedPendingFilter(subtab) {
            detailedPendingFilter = subtab;
            renderExpenseListItems(document.getElementById('expense-list-items'));
        }
        function renderExpenseListItems(container) { //消費清單渲染
            if(!container) return;
            const kw = state.searchKeyword.toLowerCase();
            const Basefiltered = state.expenses.filter(ex => {
            // 1. 基本時間過濾
            const dateMatch = (state.filterYear === 0 || Number(ex.year) === Number(state.filterYear)) && (state.filterMonth === 0 || Number(ex.month) === Number(state.filterMonth));
            // 2. 分類過濾
            const catMatch = (state.selectedCategory === '' || ex.category === state.selectedCategory);
            // 3. 標籤複選過濾 (必須包含「所有」選中的標籤)
            const tagMatch = state.selectedTags.length === 0 || state.selectedTags.every(t => ex.tags && ex.tags.includes(t));
            // 4. 進階關鍵字過濾 (包含：名稱、備註、到貨狀態、收物平台)
            const keywordMatch = (
                ex.name.toLowerCase().includes(kw) || 
                (ex.remark && ex.remark.toLowerCase().includes(kw)) ||
                (ex.arrivalStatus && ex.arrivalStatus.toLowerCase().includes(kw)) || // 新增：搜尋到貨狀態
                (ex.platform && ex.platform.toLowerCase().includes(kw))             // 新增：搜尋收物平台
            );

            return dateMatch && catMatch && keywordMatch && tagMatch;
            });
            
            const countData = computeCounts(Basefiltered);

            // 5. 實際套用「四段式狀態篩選」與「二級細項篩選」
            const filtered = Basefiltered.filter(ex => {
                if (shippingStatusTab === 'not-received') {
                    // 未收到：排除「已取貨（即已到貨）」與「已售出」
                    const isPending = ex.arrivalStatus !== '已取貨' && ex.arrivalStatus !== '已售出';
                    if (!isPending) return false;
                    
                    // 如果有選二級細項（如：待二補、待出貨）
                    if (detailedPendingFilter) {
                        return ex.arrivalStatus === detailedPendingFilter;
                    }
                    return true;
                } else if (shippingStatusTab === 'received') {
                    return ex.arrivalStatus === '已取貨';
                } else if (shippingStatusTab === 'sold') {
                    return ex.arrivalStatus === '已售出';
                }
                return true; // 'all' 全部不篩選
            });
            


            const sorted = filtered.sort((a, b) => 
                Number(b.year) - Number(a.year) ||
                Number(b.month) - Number(a.month) ||
                Number(b.day  || 1) - Number(a.day  || 1) || 
                Number(b.id) - Number(a.id)
            );
            // 分頁邏輯
            const itemsPerPage = 20; // 每頁顯示 20 項
            const totalItems = sorted.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            if (state.currentPage > totalPages) state.currentPage = totalPages;
            const paginatedItems = sorted.slice((state.currentPage - 1) * itemsPerPage, state.currentPage * itemsPerPage);
            // 計算要顯示的頁碼陣列 (最多顯示 3 個實體數字區塊)
            const getPageNumbers = (current, total) => {
                // 1. 如果總頁數小於等於 3，直接全顯示
                if (total <= 3) {
                    return Array.from({ length: total }, (_, i) => i + 1);
                }

                // 2. 如果在第一頁：顯示 1, 2, ..., 最後一頁
                if (current === 1) {
                    return [1, 2, '...', total];
                }

                // 3. 如果在最後一頁：顯示 1, ..., 倒數第一頁, 最後一頁
                if (current === total) {
                    return [1, '...', total - 1, total];
                }

                // 4. 如果在中間頁面：
                // 如果目前是第 2 頁，且總頁數 > 3，顯示 1, 2, ..., 最後一頁 (避免出現 1, ..., 2, ..., 最後一頁)
                if (current === 2) {
                    return [1, 2, '...', total];
                }
                
                // 如果目前是倒數第 2 頁
                if (current === total - 1) {
                    return [1, '...', total - 1, total];
                }

                // 5. 其餘中間情況
                return [1, '...', current, '...', total];
            };

            const pages = getPageNumbers(state.currentPage, totalPages);
            
            const totalExp = filtered.filter(i => i.type !== 'income').reduce((sum, i) => sum + i.total, 0);
            const totalInc = filtered.filter(i => i.type === 'income').reduce((sum, i) => sum + i.total, 0);
            const netTotal = totalExp - totalInc;
            const totalDisplay = state.hideAmount ? '•••••' : `$ ${netTotal.toLocaleString()}`;
            const totalExpDisplay= state.hideAmount ? '•••' : `$ ${totalExp.toLocaleString()}`;
            const summaryLabel = state.filterYear === 0 ? 'Total Cost' : (state.filterMonth === 0 ? t('report_year_net') : t('report_month_net'));
            // 判斷使用者目前有沒有啟用任何「非時間」的篩選條件
            const hasActiveFilters = state.searchKeyword || state.selectedCategory || state.selectedTags.length > 0 || shippingStatusTab !== 'all';
            // 根據有沒有開篩選，給予不同的提示文案
            let emptyMessage = "";
            if (hasActiveFilters) {
                emptyMessage = "沒有符合目前篩選條件的紀錄唷 🔍";

            } else {
                // 沒開篩選時，再根據時間給予對應文案
                emptyMessage = state.filterYear === 0 && state.filterMonth === 0 
                    ? "目前還沒有任何消費紀錄唷，快來記第一筆吧！" 
                    : "這個月份目前沒有紀錄唷";
            }
            if (Basefiltered.length === 0) {
                if (!state.user) { // 檢查是否未登入
                    container.innerHTML = `
                        <div class="text-center py-20 px-6">
                            <div data-i18n="expense_unlogin_title" class="text-slate-300 font-bold text-lg mb-2">目前處於訪客模式</div>
                            <p data-i18n="expense_unlogin_desc" class="text-slate-300 text-sm font-bold mb-6">點擊登入以同步雲端備份<br/>隨時隨地查看你的紀錄</p>
                            <button onclick="switchTab('settings')" 
                                    class="bg-brand text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform">
                                <span data-i18n="expense_unlogin_doLogin">前往登入</span>
                            </button>
                        </div>
                    `;
                } else {// 已登入但真的沒資料
                    container.innerHTML = `<div data-i18n="expense_empty" class="text-center py-24 text-slate-300 font-bold">${emptyMessage}</div>`;
                }
                return;
            }
                // 動態決定頁籤高亮 Classes 嵌入
            const getTabClass = (tab) => {
                if( tab === 'none') return "flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all bg-slate-100 text-slate-300 pointer-events-none";
                if (shippingStatusTab === tab) {
                    if (tab === 'sold') return "flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all bg-emerald-400 text-white shadow-xs";
                    return "flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all bg-brand-one text-white shadow-xs";
                }
                return "flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all text-slate-500 hover:text-slate-800";
            };

            const getSubtabClass = (subtabId) => {
                if (subtabId === '不可點') {
                    return "px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-300 pointer-events-none";
                }
                if (detailedPendingFilter === subtabId) {
                    if(subtabId === '未到貨') return "px-2.5 py-1 rounded-full text-[10px] font-bold transition status-unArrived";
                    if(subtabId === '待二補') return "px-2.5 py-1 rounded-full text-[10px] font-bold transition status-freight";
                    if(subtabId === '待出貨') return "px-2.5 py-1 rounded-full text-[10px] font-bold transition status-toShip";
                    if(subtabId === '待取貨') return "px-2.5 py-1 rounded-full text-[10px] font-bold transition status-received";
                    return "px-2.5 py-1 rounded-full text-[10px] font-semibold transition bg-slate-400 text-white";
                }
                return "px-2.5 py-1 rounded-full text-[10px] font-semibold transition bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100";
            };

            let html = `<div class="bg-brand rounded-3xl p-6 text-white card-shadow flex justify-between items-end mb-6">
                    <div>
                        <div class="flex items-center mb-1"><p class="text-white/70 text-[10px] font-bold uppercase tracking-wider ">${summaryLabel}</p>                     
                            <button onclick="toggleAmountVisibility()" class="text-white/60 hover:text-white transition-colors p-1">
                                    ${state.hideAmount ? 
                                        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` : 
                                        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5 " stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
                                    }
                            </button>
                        </div>
                        <h3 class="text-3xl font-black">${totalDisplay}</h3>
                    </div>
                    <div class="text-right flex-row">
                        ${totalInc > 0 ? `<p class="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg mb-1"><span data-i18n="type_expense">支出</span>: ${totalExpDisplay}</p>` : ''}
                        ${totalInc > 0 ? `<p class="text-[10px] font-bold bg-emerald-400/40 px-2 py-1 rounded-lg"><span data-i18n="type_income">售出</span>: +$${totalInc.toLocaleString()}</p>` : ''}
                        <p class="text-xs text-white/80 font-medium">${t('expense_count', { n: filtered.length })}</p> 
                    </div>
                </div>
                
                <!-- 展開之「四段式狀態篩選分頁」 -->
                    <div id="filterPanel" class="filter-panel pb-2 mb-4 ${showStatusFilter ? 'show' : ''}">
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 mb-2 px-1 flex justify-between items-center">
                                <span>到貨狀態</span>
                                <button id="clearFiltersBtn" onclick="clearAllSearch()" class="${hasActiveFilters ? '':'hidden'} text-xs text-purple-600 hover:underline font-semibold">
                                    清除所有篩選
                                </button>
                            </div>
                        </div>
                        <div class="flex bg-white border border-gray-100 shadow-xs p-0.5 rounded-xl text-center">
                            <button onclick="setShippingStatusTab('all')" id="tab-all" class="${getTabClass('all')}">
                                全部(${countData.all})
                            </button>
                            <button onclick="setShippingStatusTab('not-received')" id="tab-pending" class="${countData.not_received === 0 ? getTabClass('none'):getTabClass('not-received')}">
                                未收到(${countData.not_received})
                            </button>
                            <button onclick="setShippingStatusTab('received')" id="tab-received" class="${countData.received === 0 ? getTabClass('none'):getTabClass('received')}">
                                已取貨(${countData.received})
                            </button>
                            <button onclick="setShippingStatusTab('sold')" id="tab-sold" class="${countData.sold === 0 ? getTabClass('none'):getTabClass('sold')}">
                                已售出(${countData.sold})
                            </button>
                        </div>

                        <!-- 未收到之二級細項篩選 (依照 shippingStatusTab 自動顯示/隱藏) -->
                        <div id="pendingDetailsPanel" class="${shippingStatusTab === 'not-received' ? 'flex' : 'hidden'} flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-dashed border-slate-100">
                            <button onclick="setDetailedPendingFilter(null)" id="subtab-all" class="${getSubtabClass(null)}">
                                全部未收到
                            </button>
                            <button onclick="setDetailedPendingFilter('未到貨')" id="subtab-wait" class="${countData.pendingDetails['未到貨'] === 0 ? getSubtabClass('不可點') : getSubtabClass('未到貨')}">
                                未到貨 (${countData.pendingDetails['未到貨']})
                            </button>
                            <button onclick="setDetailedPendingFilter('待二補')" id="subtab-repay" class="${countData.pendingDetails['待二補'] === 0 ? getSubtabClass('不可點') : getSubtabClass('待二補')}">
                                待二補 (${countData.pendingDetails['待二補']})
                            </button>
                            <button onclick="setDetailedPendingFilter('待出貨')" id="subtab-ship" class="${countData.pendingDetails['待出貨'] === 0 ? getSubtabClass('不可點') : getSubtabClass('待出貨')}">
                                待出貨 (${countData.pendingDetails['待出貨']})
                            </button>
                            <button onclick="setDetailedPendingFilter('待取貨')" id="subtab-collect" class="${countData.pendingDetails['待取貨'] === 0 ? getSubtabClass('不可點') : getSubtabClass('待取貨')}">
                                待取貨 (${countData.pendingDetails['待取貨']})
                            </button>
                        </div>
                    </div>
                    ` 
            html += paginatedItems.map(item => {
                const cat = [...baseCategories.categories, ...baseCategories.categoriesACGN].find(c => c.id === item.category) || {id: '其他支出',icon: '🌈', color: '#92A8D1'};
                const cleanId = cat.id.replace(/\s+/g, ''); //把有分號的分類轉換
                let translatedText = typeof t === 'function' ? t(`cat_${cleanId}`) : cat.id;
                const CategoriesText = translatedText.split(' ')[0]; //分類名稱

                const imgs = Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []);
                const isIncome = item.type === 'income';
                const cardBg = isIncome ? 'bg-[var(--income-bg-soft)]' : 'bg-white border-transparent';
                // const payInfo = item.paymentMethod === '已付訂金' ? `已付訂金 $${item.paidAmount || 0}` : (item.paymentMethod || '待付款');
                const payKey = `pay_${item.paymentMethod}`;
                let depositText = '';
                if (item.paymentMethod === '已付訂金') {
                    depositText = typeof t === 'function' 
                        ? ` (${t('pay_deposit_hint', { amount: item.paidAmount })})` 
                        : ` (已付:$${item.paidAmount})`;
                }
                const translatedPayMethod = typeof t === 'function' ? t(payKey) : item.paymentMethod;
                let displayText = getMonthDisplayText(item.month);
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
                                <span onclick="quickFilter('category', '${item.category}')" class="cursor-pointer text-[9px] font-bold px-2 py-0.5 rounded-lg"  style="background-color: ${cat.color}1A; color: ${cat.color};">${cat.icon}<span>${CategoriesText}</span></span>
                                <span data-i18n="arrival_${item.arrivalStatus}" onclick="quickFilter('status', '${item.arrivalStatus}')" class="cursor-pointer text-[9px] font-bold px-2 py-0.5 rounded-lg ${getStatusClass(item.arrivalStatus)}">${item.arrivalStatus}</span>
                                 ${state.filterMonth === 0 ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400">${displayText}</span>` : ''}
                            </div>
                            <h4 class="font-bold text-slate-800 text-sm leading-tight">${item.name}</h4>
                            ${item.remark ? `<div class="text-[10px] text-slate-400 mt-1"><span data-i18n="field_remark" class="text-brand font-bold mr-1 opacity-70">備註:</span>${item.remark}</div>` : ''}

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
                                    <span data-i18n="payment" class="font-bold text-brand">付款:</span>${translatedPayMethod}${depositText}</div>
                                    ${item.shipping > 0 ? `<div class="text-[10px] text-slate-400 font-bold"><span data-i18n="shipping" class="opacity-70">運費:</span> $${item.shipping}</div>
                                ` : ''}
                                </div>
                            ${item.platform ? `<div class="bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100 text-[10px] text-slate-500 leading-relaxed">📍 ${item.platform}</div>` : ''}
                    </div>` : ''}
                </div>`;
            }).join('');

            if (totalPages > 1) {
                html += `
                <div class="flex justify-center items-center gap-2 mt-8 mb-4">
                    <button onclick="changePage(-1)" ${state.currentPage === 1 ? 'disabled' : ''} class="p-2 rounded-full bg-white shadow-sm border border-slate-100 disabled:opacity-20 transition-all active:scale-90">
                        <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>

                    <div class="flex gap-1">
                        ${pages.map(p => {
                            if (p === '...') {
                                return `<span class="text-slate-300">...</span>`;
                            }
                            const isActive = state.currentPage === p;
                            return `
                                <button onclick="jumpToPage(${p})" 
                                    class="w-8 h-8 text-xs font-black transition-all ${isActive ? 'text-brand ' : 'text-slate-400'}">
                                    ${p}
                                </button>
                            `;
                        }).join('')}
                    </div>

                    <button onclick="changePage(1)" ${state.currentPage === totalPages ? 'disabled' : ''} class="p-2 rounded-full bg-white shadow-sm border border-slate-100 disabled:opacity-20 transition-all active:scale-90">
                        <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>`;
            }

            container.innerHTML = html;
            updateStaticTranslations(container);
        }
        export function clearAllSearch(){ //清除所有篩選
            state.selectedCategory = '';
            state.selectedTags = '';
            shippingStatusTab = 'all';
            detailedPendingFilter = null;
            // 清除搜尋框與關鍵字狀態
            state.searchKeyword = '';
            state.currentPage = 1;
            const input = document.getElementById('search-input');
            if (input) {
                input.value = '';
            }
            const clearBtn = document.getElementById('search-clear-btn');
            if (clearBtn) {
                clearBtn.classList.add('hidden');
            }
            renderTagAndCatBar(); 
            renderExpenseListItems(document.getElementById('expense-list-items'));
        }

        export function togglefilterPanelVisibility(){
            showStatusFilter = !showStatusFilter;
            const panel = document.getElementById('filterPanel');
            const btn= document.getElementById('toggleFilterBtn');
            if (showStatusFilter) {
                panel.classList.add('show');
                btn.className = "p-3 rounded-2xl border transition-all relative flex items-center justify-center  shadow-sm border bg-brand-one border-brand text-white";
            } else {
                panel.classList.remove('show');
                btn.className = "p-3 rounded-2xl border transition-all relative flex items-center justify-center  shadow-sm border bg-white border-gray-100 text-slate-400";
            }
        }
        function getStatusClass(s) {
            if (s === '未到貨') return 'status-unArrived';
            if (s === '待二補') return 'status-freight';
            if (s === '待出貨') return 'status-toShip';
            if (s === '已售出') return 'status-soldout';
            return 'status-received';
        }
        function computeCounts(items) {
            const total = items.length;
            //這裡的pendingItems是所有未收到商品包含未到待二補等等
            const pendingItems = items.filter(item => item.arrivalStatus !== '已取貨' && item.arrivalStatus !== '已售出');
            const receivedItems = items.filter(item => item.arrivalStatus === '已取貨');
            const soldItems = items.filter(item => item.arrivalStatus === '已售出');

            return {
                all: total,
                not_received: pendingItems.length,
                received: receivedItems.length,
                sold: soldItems.length,
                pendingDetails: {
                '未到貨': pendingItems.filter(i => i.arrivalStatus === '未到貨').length,
                '待二補': pendingItems.filter(i => i.arrivalStatus === '待二補').length,
                '待出貨': pendingItems.filter(i => i.arrivalStatus === '待出貨').length,
                '待取貨': pendingItems.filter(i => i.arrivalStatus === '待取貨').length,
                }
            };
         }

        // 換頁函式
        export function changePage(delta) {
            state.currentPage += delta;
            renderExpenseListItems(document.getElementById('expense-list-items'));
            // 捲動回最上方
            const main = document.getElementById('main-content');
            if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
        }
        export function jumpToPage(page) {
            if (page === state.currentPage) return;
            state.currentPage = page;
            renderContent(); // 重新渲染頁面
        }
        window.jumpToPage = jumpToPage;
        
        export function updateFilter(k, v) { 
            if (k === 'year') {
                state.filterYear = Number(v);
                if(v==0){
                    localStorage.setItem('fe_v11_filterYear', state.filterYear);}//如果是不限才存
                else {localStorage.removeItem('fe_v11_filterYear');}// 選擇具體年份，清除儲存紀錄
            }
            else {
                state.filterMonth = Number(v);
                if(v==0){localStorage.setItem('fe_v11_filterMonth', state.filterMonth);}
                else {localStorage.removeItem('fe_v11_filterMonth');}
            }
            renderContent(); }

         // 顯示/隱藏金額函數
        export async function toggleAmountVisibility() {
            // 關鍵邏輯：如果是 true (要顯示)，就等待彈窗回傳。如果使用者按取消 (!true)，就中斷
            if (state.hideAmount && !(await askUser('msg_show_amount_title', 'msg_show_amount_desc'))) {
                return;
            }
            state.hideAmount = !state.hideAmount;
            localStorage.setItem('fe_v11_hideAmount', JSON.stringify(state.hideAmount));
            renderContent();
        }
        //燈箱與切換
        export function openLightbox(imgs, name, sub) {
            if (!imgs || imgs.length === 0) return;
            state.lightbox = { images: imgs, index: 0 };
            document.getElementById('lightbox-name').textContent = name;
            document.getElementById('lightbox-sub').textContent = sub;
            updateLightboxUI();
            document.getElementById('lightbox-overlay').classList.remove('hidden');
        }
        function updateLightboxUI() {
            const lb = state.lightbox;
            document.getElementById('lightbox-img').src = lb.images[lb.index];
            const isMulti = lb.images.length > 1;
            document.getElementById('lightbox-dots').innerHTML = isMulti
                ? lb.images.map((_, i) => `
                    <div class="w-1.5 h-1.5 rounded-full ${i === lb.index ? 'bg-white' : 'bg-white/30'}"></div>
                `).join('')
                : '';
            document.getElementById('lb-prev').classList.toggle('hidden', !isMulti);
            document.getElementById('lb-next').classList.toggle('hidden', !isMulti);
        }

        export function changeLightboxImg(dir) {
            state.lightbox.index = (state.lightbox.index + dir + state.lightbox.images.length) % state.lightbox.images.length;
            updateLightboxUI();
        }
        export function closeLightbox() { document.getElementById('lightbox-overlay').classList.add('hidden'); }

        function renderTagAndCatBar() {
            const catBar = document.getElementById('cat-bar'); 
            if (!catBar) return;
            const currentCats = getCurrentCategories();
            // --- 第一層：分類 (Categories) 渲染 ---
            catBar.innerHTML = currentCats.map(cat => {
                const isActive = state.selectedCategory === cat.id;
                const cleanId = cat.id.replace(/\s+/g, ''); //把有分號的分類轉換
                let translatedText = typeof t === 'function' ? t(`cat_${cleanId}`) : cat.id;
                const shortText = translatedText.split(' ')[0];
                return `
                    <div onclick="state.selectedCategory=(state.selectedCategory==='${cat.id}'?'':'${cat.id}'); 
                                state.currentPage=1;            
                                renderTagAndCatBar(); 
                                renderExpenseListItems(document.getElementById('expense-list-items'))" 
                        class="chip ${isActive ? 'active-cat' : ''}" 
                        style="${isActive ? `background-color:${cat.color}` : `color:${cat.color}; background-color:${cat.color}10; border-color:${cat.color}30`}">
                        <span>${cat.icon}</span><span>${shortText}</span>
                    </div>`;
            }).join('');
            if (typeof updateStaticTranslations === 'function') {
                updateStaticTranslations(catBar);
            }

            // --- 第二層：連動標籤 (Filtered Tags) 邏輯 ---
            const tagBar = document.getElementById('tag-bar');
            if (!tagBar) return;

            //同時過濾 年份、月份 以及 分類
            const filteredExpensesForTags = state.expenses.filter(ex => {
                // 1. 檢查年份與月份是否符合目前的選擇   
                const dateMatch = (state.filterYear === 0 || Number(ex.year) === Number(state.filterYear)) && (state.filterMonth === 0 || Number(ex.month) === Number(state.filterMonth));
               // 2. 檢查分類是否符合目前的選擇
                const catMatch = (state.selectedCategory === '' || ex.category === state.selectedCategory);
                // 3. 檢查標籤是否符合目前的選擇 (必須包含「所有」選中的標籤)
                const tagMatch = state.selectedTags.length === 0 || state.selectedTags.every(t => ex.tags && ex.tags.includes(t));
                return dateMatch && catMatch && tagMatch;
         });

        // 2. 提取這些紀錄中不重複的標籤
            const relevantTags = [...new Set(filteredExpensesForTags.flatMap(ex => ex.tags || []))].filter(t => t);

            // 3. 渲染標籤列
            if (relevantTags.length === 0) {
                tagBar.innerHTML = `<span data-i18n="expense_no_tag" class="text-[10px] text-slate-300 py-2 ml-1">此分類暫無標籤</span>`;
            } else {
                tagBar.innerHTML = relevantTags.map(tag => {
                    const isActive = state.selectedTags.includes(tag);
                    return `
                        <div onclick="toggleTagFilter('${tag}')" 
                            class="chip ${isActive ? 'active-tag' : ''}">
                            #${tag}
                        </div>`;
                }).join('');
            }
                window.toggleTagFilter = (tag) => {
                    const index = state.selectedTags.indexOf(tag);
                    if (index > -1) {
                        state.selectedTags.splice(index, 1); // 已選中則移除
                    } else {
                        state.selectedTags.push(tag); // 未選中則加入
                    }
                    state.currentPage = 1;
                    renderTagAndCatBar(); 
                    renderExpenseListItems(document.getElementById('expense-list-items'));
                };
        }
        export function quickFilter(type, value) {
            const input = document.getElementById('search-input');
            
            if (type === 'category') {
                state.selectedCategory = value;
            } else {
                const clearBtn = document.getElementById('search-clear-btn');
                // 如果已經是相同的搜尋關鍵字，再點一次則清除搜尋
                if (state.searchKeyword === value) {
                    state.searchKeyword = '';
                    shippingStatusTab='all';
                    detailedPendingFilter = null;
                    if (input) input.value = '';
                    if (clearBtn) clearBtn.classList.add('hidden');
                } else {
                    state.searchKeyword = value;
                    if (input) input.value = value;
                    if (clearBtn) clearBtn.classList.toggle('hidden', false);
                    if(input.value ==='未到貨')  {shippingStatusTab = 'not-received';detailedPendingFilter = '未到貨';}
                    if(input.value ==='待二補')  {shippingStatusTab = 'not-received';detailedPendingFilter = '待二補';}
                    if(input.value ==='待出貨')  {shippingStatusTab = 'not-received';detailedPendingFilter = '待出貨';}
                    if(input.value ==='待取貨')  {shippingStatusTab = 'not-received';detailedPendingFilter = '待取貨';}
                }
            }
            state.currentPage = 1; // 重設分頁
            // 執行渲染：更新分類列與清單內容
            renderTagAndCatBar(); 
            renderExpenseListItems(document.getElementById('expense-list-items'));
        }

window.renderExpenseList = renderExpenseList;        
window.renderExpenseListItems = renderExpenseListItems;
window.renderTagAndCatBar = renderTagAndCatBar;
window.toggleAmountVisibility = toggleAmountVisibility;
window.openLightbox=openLightbox;
window.changeLightboxImg=changeLightboxImg;
window.closeLightbox=closeLightbox;
window.setShippingStatusTab=setShippingStatusTab;
window.setDetailedPendingFilter=setDetailedPendingFilter;
window.togglefilterPanelVisibility=togglefilterPanelVisibility;
window.clearAllSearch=clearAllSearch;


window.quickFilter = quickFilter;
window.updateFilter = updateFilter;
window.changePage = (delta) => {
    window.state.currentPage += delta;
    renderExpenseListItems(document.getElementById('expense-list-items'));
};