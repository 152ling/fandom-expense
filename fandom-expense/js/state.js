/**
 * state.js - 負責狀態管理與資料持久化
 */
    export const state = {
            activeTab: 'expense',
            subPage: null,
            photoWallTab: 'purchased',
            themeColor: localStorage.getItem('fe_v11_theme') || 'svt', 
            tempType: 'expense',
            expenses: JSON.parse(localStorage.getItem('fe_v11_expenses')) || [],
            tempImage: [],     // 用來存既有的圖片網址 (URL)
            tempImageBlob: null, // 用來存新選取的圖片檔案 (Blob)
            tempImageBase64: [], // 即將上傳的圖片 Base64
            wishlist: JSON.parse(localStorage.getItem('fe_v11_wishlist')) || [],
            wishSourceId: null, // 用來暫存轉換中的願望 ID
            filterYear: Number(new Date().getFullYear()),
            filterMonth: Number(new Date().getMonth() + 1),
            reportRange: '6months', 
            reportOffset: 0,
            searchKeyword: '',
            selectedCategory: '',
            photoFilterCat: '',
            editingId: null,
            actionTarget: { type: null, id: null },
            user: null,
            hideAmount: JSON.parse(localStorage.getItem('fe_v11_hideAmount')) || false, //總金額隱藏狀態
            reportType: 'expense',
            categorySet: 'categories',//kpop/acgn
            catOrder: JSON.parse(localStorage.getItem('fe_v11_catOrder')) || {},
            WishcategorySet:'wishCategories',
            rates: { KRW: 0.022, JPY: 0.21, CNY: 4.5, USD: 32.0, HKD: 4.05, MYR: 7.2, SGD: 23.8, TWD: 1,THB:1},
            rateStatusText: '匯率已就緒',
            enableExchange :false,
            defaultCurrency:'TWD',
            currentPage: 1, // 新增：分頁功能
        };

window.state = state;