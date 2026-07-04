/**
 * i18n.js - 國際化翻譯模組
 * 使用方式：在 HTML 元素加上 data-i18n 屬性
 * 
 * 支援：
 *   data-i18n="key"              → 替換 textContent
 *   data-i18n-placeholder="key" → 替換 placeholder
 *   data-i18n-title="key"       → 替換 title
 *   data-i18n-html="key"        → 替換 innerHTML (謹慎使用)
 */

// ─── 翻譯字典 ───────────────────────────────────────
const translations = {
  'zh-TW': {
    // === 導覽列 ===
    nav_expense:  '消費清單',
    nav_report:   '財務報表',
    nav_wish:     '願望清單',
    nav_settings: '設定',

    // === 通用按鈕 ===
    btn_save:   '確認儲存',
    btn_cancel: '取消',
    btn_add:    '新增',
    btn_edit:   '編輯資料',
    btn_delete: '刪除資料',
    btn_receive: '標記已取貨',
    btn_copy:   '複製並新增',
    btn_login:  '登入',
    btn_logout: '登出',
    btn_back:   '返回',
    btn_apply:  '套用',
    btn_export: '匯出 Excel 備份',
    btn_import: '匯入 Excel 還原',

    // === 消費清單 ===
    expense_title:        '消費清單',
    expense_empty:        '這個月份目前沒有紀錄唷',
    expense_search_ph:    '搜尋項目、到貨狀態、備註...',
    expense_no_tag:       '此分類暫無標籤',
    expense_total:        '總計',
    expense_本年淨支出:    '本年淨支出',
    expense_本月淨支出:    '本月淨支出',
    expense_count:        '共 {n} 項紀錄',
    expense_total_label:  'Total Cost',

    // === 新增/編輯彈窗 ===
    modal_add_expense:  '新增消費',
    modal_edit_expense: '編輯紀錄',
    modal_add_wish:     '新增心願',
    modal_edit_wish:    '編輯心願',
    modal_add_from_wish:'加入消費清單',
    field_name:         '商品名稱',
    field_price:        '單價',
    field_qty:          '數量',
    field_shipping:     '運費/二補',
    field_category:     '分類',
    field_date:         '消費年月日',
    field_platform:     '購物平台',
    field_platform_ph:  'LINE社群、WVS',
    field_status:       '到貨狀態',
    field_payment:      '付款方式',
    field_paid_amount:  '已付金額',
    field_tags:         '標籤',
    field_tags_ph:      '輸入完標籤後，記得加逗號加入',
    field_remark:       '備註',
    field_remark_ph:    '通路、oo代購、預計出貨日期等等',
    field_upload_img:   '上傳相片',
    field_img_limit:    '圖片紀錄 (上限 3 張)',
    field_wish_price:   '預估價格',
    field_wish_cat:     '分類',
    field_wish_remark:  '心願備註',
    field_wish_date_toggle: '記錄發售日期與時間',
    field_release_date: '日期',
    field_release_time: '時間',
    type_expense:       '支出',
    type_income:        '售出',
    currency_label:     '原始幣值',

    // 到貨狀態
    arrival_未到貨: '未到貨',
    arrival_待二補: '待二補',
    arrival_待出貨: '待出貨',
    arrival_待取貨: '待取貨',
    arrival_已取貨: '已取貨',
    arrival_已售出: '已售出',

    // 付款方式
    pay_待付款:   '待付款',
    pay_貨到付款: '貨到付款',
    pay_匯款全額: '匯款全額',
    pay_已付訂金: '已付訂金',
    pay_信用卡:   '信用卡',
    pay_現金:     '現金',
    pay_無卡:     '無卡',

    // === KPOP分類 (categories) ===
    cat_專輯: '專輯',
    cat_小卡: '小卡',
    'cat_演唱會/見面會門票': '演唱會 / 見面會門票', // 含有斜線符號，建議保留引號以防語法報錯
    cat_周邊商品: '周邊商品',
    cat_娃娃: '娃娃',
    cat_會員費: '會員費',
    'cat_應援物/飯製商品': '應援物 / 飯製商品', // 含有斜線符號
    'cat_交通/住宿': '交通 / 住宿',         // 含有斜線符號
    cat_聯名商品: '聯名商品',
    cat_其他追星支出: '其他追星支出',

    // === ACGN分類 (categoriesACGN) ===
    'cat_漫畫/輕小說': '漫畫 / 輕小說',       // 含有斜線符號
    'cat_立牌/吊飾': '立牌 / 吊飾',         // 含有斜線符號
    'cat_小卡/色紙': '小卡 / 色紙',         // 含有斜線符號
    'cat_明信片/海報': '明信片 / 海報',       // 含有斜線符號
    'cat_徽章/壓克力': '徽章 / 壓克力',       // 含有斜線符號
    'cat_公仔/娃娃': '公仔 / 娃娃',         // 含有斜線符號
    cat_一番賞: '一番賞',
    cat_聯名服飾: '聯名服飾',
    'cat_活動門票/展覽/電影票': '活動門票 / 展覽 / 電影票', // 含有斜線符號
    cat_其他支出: '其他支出',

    // === 願望清單 ===
    wish_title:       '願望清單',
    wish_empty:       '快許下新的願望吧！',
    wish_cat_empty:   '此分類暫無願望',
    wish_convert_btn: '加入消費清單',
    wish_date_tbd:    '未定',

    // === 財務報表 ===
    report_title:       '財務分析報告',
    report_month:       '月',
    report_6months:     '近 6 個月',
    report_year:        '年',
    report_total_exp:   '總支出',
    report_total_inc:   '總收入',
    report_net:         '淨支出',
    report_no_data:     '目前時段尚無數據可分析',
    report_rank_exp:    '支出佔比排名',
    report_rank_inc:    '收入來源排名',
    report_rank_net:    '收支平衡分析',

    // === 設定 ===
    settings_title:       '設定',
    settings_guest:       '訪客模式',
    settings_synced:      '雲端資料已同步 ☁️',
    settings_login_hint:  '登入後開啟雲端備份',
    settings_photowall:   '我的照片牆',
    settings_appearance:  '外觀設定',
    settings_backup:      '數據匯入與匯出',
    settings_account:     '帳本與功能',
    settings_version:     '版本說明',
    settings_faq:         '常見問題與幫助',
    settings_cleanup:     '清理冗餘圖檔',
    settings_cleanup_sub: '釋放空間',

    // === 外觀設定 ===
    appear_title:         '外觀設定',
    appear_preset:        '選擇預設主題',
    appear_dark:          '深色模式',
    appear_custom_hex:    '輸入自訂色碼',
    appear_hex_hint:      '請輸入包含 # 的六位數色碼，例如 #92A8D1',
    appear_eyedropper:    '滴管選色',
    appear_custom_grad:   '自訂漸層',

    // === 照片牆 ===
    photowall_title:      '照片牆',
    photowall_purchased:  '已購買',
    photowall_wish:       '心願牆',
    photowall_all:        '全部',
    photowall_empty:      '目前尚無照片',

    // === 匯入匯出 ===
    backup_title:         '匯入與匯出',
    backup_excel_title:   'Excel 管理',
    backup_excel_desc:    '本地 Excel 備份不包含圖片資料',
    backup_excel_warn:    '⚠️ 匯入後會覆蓋現有資料並清除圖片',

    // === 帳本與功能 ===
    account_title:        '帳本與功能',
    account_cat_mode:     '帳本分類模式',
    account_kpop:         'KPOP 模式',
    account_acgn:         'ACGN 模式',
    account_exchange:     '開啟匯率換算工具',
    account_exchange_sub: '在新增紀錄時顯示外幣換算區',
    account_currency:     '預設記帳幣別',
    account_cat_order:    '調整分類順序',
    account_cat_order_sub:'自訂最常用的分類顯示在最前面',

    // === 確認彈窗 ===
    confirm_delete_title: '確定要刪除嗎？',
    confirm_delete_desc:  '紀錄刪除後將無法恢復。',
    confirm_show_amount:  '確定要顯示金額嗎？',
    confirm_show_amount_desc: '顯示後將可查看完整的消費明細與總計。',
    confirm_import_title: '確定要匯入資料嗎？',
    confirm_import_desc:  '注意：匯入 Excel 會「完全覆蓋」目前的消費清單。',
    confirm_ok:           '確定',
    confirm_cancel:       '取消',

    // === Toast 提示 ===
    toast_saved:          '已成功儲存並同步',
    toast_deleted:        '已成功刪除紀錄',
    toast_imported:       '匯入成功：共 {n} 筆',
    toast_uploading:      '正在上傳圖片...',
    toast_login_required: '請先登入以開啟圖片上傳功能☁️',
    toast_img_too_large:  '圖片太大囉！請選擇較小的照片',
    toast_img_error:      '圖片處理失敗，請換一張試試',
    toast_theme_changed:  '已更換自訂主題色！',
    toast_dark_on:        '深色模式已開啟',
    toast_dark_off:       '深色模式已關閉',
    toast_kpop_mode:      '已切換至 KPOP分類',
    toast_acgn_mode:      '已切換至 ACGN分類',
    toast_cat_updated:    '分類排序已更新 ✨',
    toast_exchange_on:    '已開啟換算工具',
    toast_exchange_off:   '已關閉換算工具',
    toast_grad_updated:   '漸層已更新！',
    toast_hex_error:      '格式錯誤！請輸入如 #92A8D1 的色碼',
    toast_name_required:  '請輸入商品名稱',
    toast_save_error:     '儲存發生錯誤，請檢查輸入內容',
    toast_login_fail:     '登入失敗，請檢查彈窗設定',
    toast_cleanup_done:   '清理完成！共刪除了 {n} 個冗餘圖檔',
    toast_cleanup_clean:  '雲端非常整潔，沒有需要清理的檔案',
    toast_cleanup_error:  '清理過程發生錯誤',
  },

  'en': {
    nav_expense:  'Expenses',
    nav_report:   'Reports',
    nav_wish:     'Wishlist',
    nav_settings: 'Settings',

    btn_save:   'Save',
    btn_cancel: 'Cancel',
    btn_add:    'Add',
    btn_edit:   'Edit',
    btn_delete: 'Delete',
    btn_copy:   'Duplicate',
    btn_receive: 'Mark as Received',
    btn_login:  'Login',
    btn_logout: 'Logout',
    btn_back:   'Back',
    btn_apply:  'Apply',
    btn_export: 'Export Excel',
    btn_import: 'Import Excel',

    expense_title:       'Expenses',
    expense_empty:       'No records this month',
    expense_search_ph:   'Search items, status, notes...',
    expense_no_tag:      'No tags in this category',
    expense_total:       'Total',
    expense_本年淨支出:   'Annual Net',
    expense_本月淨支出:   'Monthly Net',
    expense_count:       '{n} items',
    expense_total_label: 'Total Cost',

    modal_add_expense:   'Add Expense',
    modal_edit_expense:  'Edit Record',
    modal_add_wish:      'Add Wish',
    modal_edit_wish:     'Edit Wish',
    modal_add_from_wish: 'Add to Expenses',
    field_name:          'Item Name',
    field_name_required: 'Item Name *',
    field_price:         'Unit Price',
    field_qty:           'Qty',
    field_shipping:      'Shipping',
    field_category:      'Category',
    field_date:          'Date',
    field_platform:      'Platform',
    field_platform_ph:   'e.g. eBay, Weverse',
    field_status:        'Arrival Status',
    field_payment:       'Payment',
    field_paid_amount:   'Paid Amount',
    field_tags:          'Tags',
    field_tags_ph:       'Type a tag then add comma',
    field_remark:        'Notes',
    field_remark_ph:     'Proxy, expected ship date...',
    field_upload_img:    'Upload Photo',
    field_img_limit:     'Photos (max 3)',
    field_wish_price:    'Est. Price',
    field_wish_cat:      'Category',
    field_wish_remark:   'Notes',
    field_wish_date_toggle: 'Record Release Date & Time',
    field_release_date:  'Release Date',
    field_release_time:  'Time',
    type_expense:        'Expense',
    type_income:         'Sold',
    currency_label:      'Original Currency',

    arrival_未到貨: 'Not Arrived',
    arrival_待二補: 'Awaiting Restock',
    arrival_待出貨: 'Processing',
    arrival_待取貨: 'Ready for Pickup',
    arrival_已取貨: 'Received',
    arrival_已售出: 'Sold',

    pay_待付款:   'Unpaid',
    pay_貨到付款: 'Cash on Delivery',
    pay_匯款全額: 'Full Payment',
    pay_已付訂金: 'Deposit Paid',
    pay_信用卡:   'Credit Card',
    pay_現金:     'Cash',
    pay_無卡:     'Card-free',

    // === 追星分類 (categories) ===
    cat_專輯: 'Album',
    cat_小卡: 'Photo Card',
    'cat_演唱會/見面會門票': 'Concert / Fan Meeting Ticket',
    cat_周邊商品: 'Merchandise',
    cat_娃娃: 'Plushie',
    cat_會員費: 'Membership Fee',
    'cat_應援物/飯製商品': 'Cheering Supplies / Fan-made Goods',
    'cat_交通/住宿': 'Transportation / Accommodation',
    cat_聯名商品: 'Collaboration Goods',
    cat_其他追星支出: 'Other Fandom Expenses',

    // === ACGN分類 (categoriesACGN) ===
    'cat_漫畫/輕小說': 'Manga / Light Novel',
    'cat_立牌/吊飾': 'Acrylic Stand / Keychain',
    'cat_小卡/色紙': 'Photo Card / Shikishi (Art Board)',
    'cat_明信片/海報': 'Postcard / Poster',
    'cat_徽章/壓克力': 'Pin Badge / Acrylic',
    'cat_公仔/娃娃': 'Figure / Plushie',
    cat_一番賞: 'Ichiban Kuji',
    cat_聯名服飾: 'Collaboration Apparel',
    'cat_活動門票/展覽/電影票': 'Event Ticket / Exhibition / Movie Ticket',
    cat_其他支出: 'Other Expenses',

    wish_title:       'Wishlist',
    wish_empty:       'Make a wish!',
    wish_cat_empty:   'No wishes in this category',
    wish_convert_btn: 'Add to Expenses',
    wish_date_tbd:    'TBD',

    report_title:     'Financial Report',
    report_month:     'Month',
    report_6months:   '6 Months',
    report_year:      'Year',
    report_total_exp: 'Total Spent',
    report_total_inc: 'Total Earned',
    report_net:       'Net Expense',
    report_no_data:   'No data for this period',
    report_rank_exp:  'Expense Breakdown',
    report_rank_inc:  'Income Sources',
    report_rank_net:  'Balance Analysis',

    settings_title:       'Settings',
    settings_guest:       'Guest Mode',
    settings_synced:      'Cloud synced ☁️',
    settings_login_hint:  'Login to enable cloud backup',
    settings_photowall:   'Photo Wall',
    settings_appearance:  'Appearance',
    settings_backup:      'Import & Export',
    settings_account:     'Account & Features',
    settings_version:     'Version Notes',
    settings_faq:         'FAQ & Help',
    settings_cleanup:     'Clean Up Files',
    settings_cleanup_sub: 'Free up space',

    appear_title:       'Appearance',
    appear_preset:      'Choose Theme',
    appear_dark:        'Dark Mode',
    appear_custom_hex:  'Enter Hex Color',
    appear_hex_hint:    'Enter a 6-digit hex code, e.g. #92A8D1',
    appear_eyedropper:  'Color Picker',
    appear_custom_grad: 'Custom Gradient',

    photowall_title:     'Photo Wall',
    photowall_purchased: 'Purchased',
    photowall_wish:      'Wishlist',
    photowall_all:       'All',
    photowall_empty:     'No photos yet',

    backup_title:       'Import & Export',
    backup_excel_title: 'Excel Management',
    backup_excel_desc:  'Local backup does not include images',
    backup_excel_warn:  '⚠️ Import will overwrite all current data',

    account_title:        'Account & Features',
    account_cat_mode:     'Category Mode',
    account_kpop:         'KPOP Mode',
    account_acgn:         'ACGN Mode',
    account_exchange:     'Enable Currency Converter',
    account_exchange_sub: 'Show currency field when adding records',
    account_currency:     'Default Currency',
    account_cat_order:    'Reorder Categories',
    account_cat_order_sub:'Pin your favorites to the top',

    confirm_delete_title: 'Delete this record?',
    confirm_delete_desc:  'This action cannot be undone.',
    confirm_show_amount:  'Show amount?',
    confirm_show_amount_desc: 'Full expense details will be visible.',
    confirm_import_title: 'Import data?',
    confirm_import_desc:  'This will overwrite all current records.',
    confirm_ok:           'Confirm',
    confirm_cancel:       'Cancel',

    toast_saved:          'Saved and synced',
    toast_deleted:        'Record deleted',
    toast_imported:       'Imported {n} records',
    toast_uploading:      'Uploading image...',
    toast_login_required: 'Please login to upload images ☁️',
    toast_img_too_large:  'Image too large, please choose a smaller one',
    toast_img_error:      'Image processing failed, try another',
    toast_theme_changed:  'Theme color updated!',
    toast_dark_on:        'Dark mode on',
    toast_dark_off:       'Dark mode off',
    toast_kpop_mode:      'Switched to KPOP categories',
    toast_acgn_mode:      'Switched to ACGN categories',
    toast_cat_updated:    'Category order updated ✨',
    toast_exchange_on:    'Currency converter enabled',
    toast_exchange_off:   'Currency converter disabled',
    toast_grad_updated:   'Gradient updated!',
    toast_hex_error:      'Invalid format! Use e.g. #92A8D1',
    toast_name_required:  'Please enter an item name',
    toast_save_error:     'Save failed, please check your input',
    toast_login_fail:     'Login failed, please check popup settings',
    toast_cleanup_done:   'Cleaned! Removed {n} orphaned files',
    toast_cleanup_clean:  'Cloud storage is clean, nothing to remove',
    toast_cleanup_error:  'Cleanup encountered an error',
  },

  'ja': {
    nav_expense:  '支出リスト',
    nav_report:   'レポート',
    nav_wish:     'ウィッシュリスト',
    nav_settings: '設定',
    btn_save:     '保存',
    btn_cancel:   'キャンセル',
    btn_add:      '追加',
    btn_edit:     '編集',
    btn_delete:   '削除',
    btn_login:    'ログイン',
    btn_logout:   'ログアウト',
    expense_title: '支出リスト',
    expense_empty: 'この月の記録はありません',
    expense_search_ph: '商品・状態・メモを検索...',
    expense_count: '{n} 件',
    wish_title:   'ウィッシュリスト',
    wish_empty:   '願いを追加しましょう！',
    settings_title: '設定',
    confirm_ok:   '確認',
    confirm_cancel: 'キャンセル',
    toast_saved:  '保存・同期しました',
    toast_deleted: '削除しました',
  
    cat_專輯: 'アルバム',
    cat_小卡: 'トレカ',
    'cat_演唱會/見面會門票': 'コンサート / ファンミチケット',
    cat_周邊商品: 'グッズ',
    cat_娃娃: 'ぬいぐるみ',
    cat_會員費: 'ファンクラブ会費',
    'cat_應援物/飯製商品': '応援グッズ / ファンメイドグッズ',
    'cat_交通/住宿': '交通費 / 宿泊費',
    cat_聯名商品: 'コラボ商品',
    cat_其他追星支出: 'その他推し活支出',

    'cat_漫畫/輕小說': '漫画 / ライトノベル',
    'cat_立牌/吊飾': 'アクスタ / キーホルダー',
    'cat_小卡/色紙': 'トレカ / 色紙',
    'cat_明信片/海報': 'ポストカード / ポスター',
    'cat_徽章/壓克力': '缶バッジ / アクリル',
    'cat_公仔/娃娃': 'フィギュア / ぬいぐるみ',
    cat_一番賞: '一番くじ',
    cat_聯名服飾: 'コラボ服飾',
    'cat_活動門票/展覽/電影票': 'イベントチケット / 展示会 / 映画券',
    cat_其他支出: 'その他支出'
  },

  'ko': {
    nav_expense:  '지출 목록',
    nav_report:   '재무 보고서',
    nav_wish:     '위시리스트',
    nav_settings: '설정',
    btn_save:     '저장',
    btn_cancel:   '취소',
    btn_add:      '추가',
    btn_login:    '로그인',
    btn_logout:   '로그아웃',
    expense_title: '지출 목록',
    expense_empty: '이번 달 기록이 없어요',
    expense_search_ph: '상품, 상태, 메모 검색...',
    expense_count: '{n}개',
    wish_title:   '위시리스트',
    wish_empty:   '위시를 추가해보세요!',
    settings_title: '설정',
    confirm_ok:   '확인',
    confirm_cancel: '취소',
    toast_saved:  '저장 및 동기화 완료',
    toast_deleted: '삭제되었습니다',
  }
};

// ─── 語言管理 ────────────────────────────────────────
const SUPPORTED_LANGS = Object.keys(translations);

// 自動偵測瀏覽器語言
function detectLang() {
  const saved = localStorage.getItem('fe_v11_lang');
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  const browser = navigator.language || 'zh-TW';
  if (browser.startsWith('zh')) return 'zh-TW';
  if (browser.startsWith('ja')) return 'ja';
  if (browser.startsWith('ko')) return 'ko';
  return 'en';
}

let currentLang = detectLang();

// ─── 核心翻譯函數 ────────────────────────────────────
/**
 * 翻譯 key，支援變數插入
 * @param {string} key
 * @param {Object} params  例如 { n: 5 } 會把 {n} 替換成 5
 */
export function t(key, params = {}) {
  const dict = translations[currentLang] || {};
  const fallback = translations['zh-TW'] || {};
  let str = dict[key] ?? fallback[key] ?? key; // 找不到 key 就直接顯示 key

  Object.entries(params).forEach(([k, v]) => {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  });
  return str;
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem('fe_v11_lang', lang);
}

export function getLang() { return currentLang; }
export function getSupportedLangs() { return SUPPORTED_LANGS; }

// ─── DOM 掃描更新（你的核心需求）────────────────────
/**
 * 掃描所有帶 data-i18n* 屬性的元素並翻譯
 * 
 * 支援：
 *   data-i18n="key"             → el.textContent
 *   data-i18n-placeholder="key" → el.placeholder
 *   data-i18n-title="key"       → el.title
 *   data-i18n-label="key"       → el.setAttribute('aria-label', ...)
 */
export function updateStaticTranslations(root = document) {
  // textContent
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  // placeholder
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  // title (tooltip)
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });

  // aria-label (無障礙)
  root.querySelectorAll('[data-i18n-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label')));
  });
}

// ─── 掛載全域 ────────────────────────────────────────
window.t = t;
window.setLang = setLang;
window.getLang = getLang;
window.updateStaticTranslations = updateStaticTranslations;