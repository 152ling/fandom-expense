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
    btn_ok: '確認',
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
    filter_all:  '不限',
    filter_all_years:  '不限年份',
    filter_full_year: '年',
    filter_all_months: '不限月份',
    expense_title:        '消費清單',
    expense_unlogin_title: '目前處於訪客模式',
    expense_unlogin_desc:  '點擊登入以同步雲端備份，隨時隨地查看你的紀錄',
    expense_unlogin_doLogin: '前往登入',
    expense_empty:        '這個月份目前沒有紀錄唷',
    expense_search_ph:    '搜尋項目、到貨狀態、備註...',
    expense_no_tag:       '此分類暫無標籤',
    expense_total:        '總計',
    report_year_net:    '本年淨支出',
    report_month_net:    '本月淨支出',
    expense_count:        '共 {n} 項紀錄',
    expense_total_label:  'Total Cost',
    shipping:             '運費:',
    payment:              '付款:',

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
    field_remark:       '備註:',
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
    currency_loading:        '正在載入匯率...',
    rate_cached: "匯率已就緒 (快取)",
    rate_updating: "正在更新最新匯率...",
    rate_updated: "匯率已更新(網路)",
    rate_failed: "匯率連線失敗，使用離線數據",

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
    pay_deposit_hint: '已付:${amount}',
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
    cat_未貼標籤: '未貼標籤',

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
    report_yearly:      '年度報告',
    report_total_exp:   '總支出',
    report_total_inc:   '總收入',
    cat_總支出:          '總支出',
    cat_總收入:          '總收入',
    report_net:         '淨支出',
    report_no_data:     '目前時段尚無數據可分析',
    report_byCat:       '依分類',
    report_byTag:       '依標籤',
    report_hint:        '提示：複選標籤之項目會重複計算，佔比以該時段總金額為基準',
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
    appear_lang:          '語言',
    appear_preset:        '選擇預設主題',
    appear_dark:          '深色模式',
    appear_custom_hex:    '輸入自訂色碼',
    appear_hex_hint:      '請輸入包含 # 的六位數色碼，例如 #92A8D1',
    appear_eyedropper:    '滴管選色',
    appear_custom_grad:   '自訂漸層',
    theme_svt: "粉藍",
    theme_purple: "幻紫",
    theme_blue: "沁藍",
    theme_green: "螢綠",
    theme_aurora: "極光",
    theme_gold: "熠金",

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
    account_exchange_desc:'若在關閉時編輯紀錄，匯率資料會消失',
    account_currency:     '預設記帳幣別',
    account_currency_sub: '更改此處將會影響匯率換算的基準幣別',
    account_cat_order:    '調整分類順序',
    account_cat_order_sub:'自訂最常用的分類顯示在最前面',
    account_cat_order_desc:'可拖曳左側手柄或使用箭頭調整順序',

    //=== 常見問題===
    faq_title:            '常見問題 FAQ',
    faq_submit:        '📝 問題回報與功能許願',
    faq_q1:               '追星錢包會上架到APP商店嗎？',
    faq_a1:               '目前因為技術限制與上架流程較繁瑣，因此暫時沒有上架 App Store / Google Play 的計畫。但現在可以直接加入主畫面使用，體驗會和 App 很接近！',
    faq_q2:               '如何加入主畫面？',
    faq_a2:               '使用 Safari/Chrome 開啟，點擊右上方「分享」圖示後選擇「加入主畫面」。',
    faq_q3:               '一鍵匯入匯出功能如何使用？',
    faq_a3:               '使用方式：<br/>1. 先在「數據匯入與匯出」內匯出 Excel，取得系統提供的範例檔案格式。<br/>2. 將你原本的 Excel 資料 複製到範例檔案的對應欄位。<br/>3. 再把整理好的檔案 匯入 App 即可。<br/>注意事項：<br/>•  項目名稱與單價為必填欄位<br/>•  其他欄位都可以留空<br/>•  如果沒有填寫時間，系統會自動匯入到「上個月」這樣就可以快速把原本的紀錄搬進追星錢包了 ✨',
    faq_q4:               '如何查詢未到貨商品？',
    faq_a4:               '在搜尋框輸入「未到貨」關鍵字，或點擊「#未到貨」標籤。',
    faq_q5:               '可以自行新增分類嗎？',
    faq_a5:               '目前不支援。<br/>為了維持報表統計的一致性，採用固定分類。<br/>💡記帳小貼士：<br/>1. 標籤功能：細節（如：成員）請用 #標籤，能更靈活地記錄細節並支援搜尋篩選。<br/>2. 切換模式：在「設定 > 帳本與功能」可依照喜好切換預設分類。<br/>3. 許願功能：歡迎點擊下方前往許願，會評估後新增！',
    faq_q6:               '為什麼在網頁版新增了資料，打開 App (加入主畫面) 卻沒看到？',
    faq_a6:               '這通常是因為 App 端的登入狀態尚未同步更新。<br/><b>檢查登入</b>：進入「設定」，確認目前是否為登入狀態。若顯示未登入，請重新登入即可抓回雲端資料。<br/><br/>追星錢包採用即時雲端儲存，只要是登入狀態新增的資料都會安全存在雲端囉！',

    // === 確認彈窗 ===
    // 彈窗系列文案
    msg_delete_title: '確定要刪除嗎？',
    msg_delete_desc: '紀錄刪除後將無法恢復。',
    msg_delete_title: '確定要刪除嗎？',
    msg_delete_desc:  '紀錄刪除後將無法恢復。',
    msg_show_amount_title:  '確定要顯示金額嗎？',
    msg_show_amount_desc: '顯示後將可查看完整的消費明細與總計。',
    msg_import_title: '確定要匯入資料嗎？',
    msg_import_desc:  '注意：匯入 Excel 會「完全覆蓋」目前的消費清單，原本的舊資料將會消失。建議匯入前先執行一次匯出備份。',
    confirm_ok:           '確定',
    confirm_cancel:       '取消',

    // === Toast 提示 ===
    toast_saved:          '已成功儲存並同步',
    toast_deleted:        '已成功刪除紀錄',
    toast_delete_error:   '刪除過程發生錯誤，請稍後再試',
    toast_duplicate:      '已載入複製資料，修改後請儲存',
    toast_imported:       '匯入成功：共 {n} 筆',
    toast_uploading:      '正在上傳圖片...',
    toast_uploading_sync: '正在上傳並同步...',
    toast_login_required: '請先登入以開啟圖片上傳功能☁️',
    toast_img_too_large:  '圖片太大囉！請選擇較小的照片',
    toast_img_error:      '圖片處理失敗，請換一張試試',
    toast_img_success:    '圖片上傳成功',
    toast_theme_changed:  '已更換自訂主題色！',
    toast_dark_on:        '深色模式已開啟',
    toast_dark_off:       '深色模式已關閉',
    toast_cat_updated:    '分類排序已更新 ✨',
    toast_cat_updated_local: '本地排序已更新 ✨',
    toast_exchange_on:    '已開啟換算工具',
    toast_exchange_off:   '已關閉換算工具',
    toast_grad_updated:   '漸層已更新！',
    toast_hex_updated:    '已更換自訂主題色',
    toast_hex_error:      '格式錯誤！請輸入如 #92A8D1 的色碼',
    toast_switch_kpop:    '已切換至 KPOP分類',
    toast_switch_acgn:    '已切換至 ACGN分類',
    toast_currency_changed: '預設幣別已更改為 {n}',
    toast_exchange_on:    '已開啟換算工具',
    toast_exchange_off:   '已關閉換算工具',
    toast_name_required:  '請輸入商品名稱',
    toast_save_error:     '儲存發生錯誤，請檢查輸入內容',
    toast_login_fail:     '登入失敗，請檢查彈窗設定',
    toast_cleanup_done:   '清理完成！共刪除了 {n} 個冗餘圖檔',
    toast_cleanup_clean:  '雲端非常整潔，沒有需要清理的檔案',
    toast_cleanup_error:  '清理過程發生錯誤',
    toast_no_sheet: "找不到「消費清單」工作表",
    toast_file_empty: "檔案為空",
    toast_no_name_field: "找不到「項目名稱」欄位",
    toast_import_success: "匯入成功：共 {n} 筆，若無填寫日期請查看上個月的消費清單",
    toast_format_error: "檔案格式錯誤",
  },

  'en': {
    // === 導覽列 ===
    nav_expense:  'Expenses',
    nav_report:   'Reports',
    nav_wish:     'Wishlist',
    nav_settings: 'Settings',

    // === 通用按鈕 ===
    btn_save:   'Save',
    btn_cancel: 'Cancel',
    btn_ok:     'Confirm',
    btn_add:    'Add',
    btn_edit:   'Edit',
    btn_delete: 'Delete',
    btn_receive: 'Mark as Received',
    btn_copy:   'Duplicate',
    btn_login:  'Login',
    btn_logout: 'Logout',
    btn_back:   'Back',
    btn_apply:  'Apply',
    btn_export: 'Export Excel',
    btn_import: 'Import Excel',

    // === 消費清單 ===
    filter_all:  'All',
    filter_all_years:  'All Years',
    filter_full_year: 'Year',
    filter_all_months: 'All Months',
    expense_title:        'Expenses',
    expense_unlogin_title: 'Currently in Guest Mode',
    expense_unlogin_desc:  'Click Login to enable cloud backup and access your records anytime, anywhere',
    expense_unlogin_doLogin: 'Go to Login',
    expense_empty:        'No records this month',
    expense_search_ph:    'Search items, status, notes...',
    expense_no_tag:       'No tags in this category',
    expense_total:        'Total',
    report_year_net:    'Annual Net',
    report_month_net:    'Monthly Net',
    expense_count:        '{n} items',
    expense_total_label:  'Total Cost',
    shipping:             'Shipping:',
    payment:              'Payment:',

    // === 新增/編輯彈窗 ===
    modal_add_expense:  'Add Expense',
    modal_edit_expense: 'Edit Record',
    modal_add_wish:     'Add Wish',
    modal_edit_wish:    'Edit Wish',
    modal_add_from_wish:'Add to Expenses',
    field_name:         'Item Name',
    field_price:        'Unit Price',
    field_qty:          'Qty',
    field_shipping:     'Shipping/二補',
    field_category:     'Category',
    field_date:         'Date',
    field_platform:     'Platform',
    field_platform_ph:  'e.g. LINE Group, Weverse',
    field_status:       'Arrival Status',
    field_payment:      'Payment Method',
    field_paid_amount:  'Paid Amount',
    field_tags:         'Tags',
    field_tags_ph:      'Type a tag then add comma',
    field_remark:       'Notes:',
    field_remark_ph:    'Proxy, expected ship date, etc.',
    field_upload_img:   'Upload Photo',
    field_img_limit:    'Photos (max 3)',
    field_wish_price:   'Est. Price',
    field_wish_cat:     'Category',
    field_wish_remark:  'Notes',
    field_wish_date_toggle: 'Record Release Date & Time',
    field_release_date: 'Release Date',
    field_release_time: 'Time',
    type_expense:       'Expense',
    type_income:        'Sold',
    currency_label:     'Original Currency',
    currency_loading:        'Exchange rate is loading...',
    rate_cached: "Exchange rates ready (Cached)",
    rate_updating: "Updating latest exchange rates...",
    rate_updated: "Exchange rates updated",
    rate_failed: "Connection failed, using offline data",

    // 到貨狀態
    arrival_未到貨: 'Not Arrived',
    arrival_待二補: 'Awaiting Restock',
    arrival_待出貨: 'Processing',
    arrival_待取貨: 'Ready for Pickup',
    arrival_已取貨: 'Received',
    arrival_已售出: 'Sold',

    // 付款方式
    pay_待付款:   'Unpaid',
    pay_貨到付款: 'Cash on Delivery',
    pay_匯款全額: 'Full Payment',
    pay_已付訂金: 'Deposit Paid',
    pay_deposit_hint: 'Paid:${amount}',
    pay_信用卡:   'Credit Card',
    pay_現金:     'Cash',
    pay_無卡:     'Card-free',

    // === KPOP分類 (categories) ===
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
    'cat_小卡/色紙': 'Photo Card / Art Board',
    'cat_明信片/海報': 'Postcard / Poster',
    'cat_徽章/壓克力': 'Pin Badge / Acrylic',
    'cat_公仔/娃娃': 'Figure / Plushie',
    cat_一番賞: 'Ichiban Kuji',
    cat_聯名服飾: 'Collaboration Apparel',
    'cat_活動門票/展覽/電影票': 'Event Ticket / Exhibition / Movie Ticket',
    cat_其他支出: 'Other Expenses',
    cat_未貼標籤: 'No Tag',

    // === 願願清單 ===
    wish_title:       'Wishlist',
    wish_empty:       'Make a wish!',
    wish_cat_empty:   'No wishes in this category',
    wish_convert_btn: 'Add to Expenses',
    wish_date_tbd:    'TBD',

    // === 財務報表 ===
    report_title:       'Financial Report',
    report_month:       'Month',
    report_6months:     '6 Months',
    report_year:        'Year',
    report_yearly:      'Yearly Report',
    report_total_exp:   'Total Spent',
    report_total_inc:   'Total Earned',
    cat_總支出:          'Total Spent',
    cat_總收入:          'Total Earned',
    report_net:         'Net Expense',
    report_no_data:     'No data for this period',
    report_byCat:       'By Category',
    report_byTag:       'By Tag',
    report_hint:        'Tip: Items with multiple tags will be counted multiple times, and the percentage is based on the total amount for that period.',
    report_rank_exp:    'Expense Breakdown',
    report_rank_inc:    'Income Sources',
    report_rank_net:    'Balance Analysis',

    // === 設定 ===
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

    // === 外觀設定 ===
    appear_title:         'Appearance',
    appear_lang:          'Language',
    appear_preset:        'Choose Theme',
    appear_dark:          'Dark Mode',
    appear_custom_hex:    'Enter Hex Color',
    appear_hex_hint:      'Enter a 6-digit hex code, e.g. #92A8D1',
    appear_eyedropper:    'Color Picker',
    appear_custom_grad:   'Custom Gradient',
    theme_svt: "Pink & Blue",
    theme_purple: "Purple",
    theme_blue: "Aqua Blue",
    theme_green: "Neon Green",
    theme_aurora: "Aurora",
    theme_gold: "Gold",

    // === 照片牆 ===
    photowall_title:      'Photo Wall',
    photowall_purchased:  'Purchased',
    photowall_wish:       'Wishlist',
    photowall_all:        'All',
    photowall_empty:      'No photos yet',

    // === 匯入匯出 ===
    backup_title:         'Import & Export',
    backup_excel_title:   'Excel Management',
    backup_excel_desc:    'Local backup does not include images',
    backup_excel_warn:    '⚠️ Import will overwrite all current data',

    // === 帳本與功能 ===
    account_title:        'Account & Features',
    account_cat_mode:     'Category Mode',
    account_kpop:         'KPOP Mode',
    account_acgn:         'ACGN Mode',
    account_exchange:     'Enable Currency Converter',
    account_exchange_sub: 'Show currency field when adding records',
    account_exchange_desc:'If you edit a record while this is off, the exchange rate data will disappear.',
    account_currency:     'Default Currency',
    account_currency_sub: 'Changing this will affect the base currency for exchange rate calculations',
    account_cat_order:    'Reorder Categories',
    account_cat_order_sub:'Pin your favorites to the top',
    account_cat_order_desc:'Drag the handle or use the arrows to reorder categories',

    //=== 常見問題===
    faq_title:            'Frequently Asked Questions (FAQ)',
    faq_submit:           '📝 Report Issues & Make Feature Requests',
    faq_q1:               'Will Fandom Wallet be available on app stores?',
    faq_a1:               'Due to technical limitations and complex review processes, there are currently no plans to launch on the App Store or Google Play. However, you can add it directly to your home screen for an experience that feels just like a native app!',
    faq_q2:               'How do I add it to the home screen?',
    faq_a2:               'Open the site in Safari or Chrome, tap the "Share" icon, and select "Add to Home Screen".',
    faq_q3:               'How do I use the one-click import/export feature?',
    faq_a3:               'How to use:<br/>1. Export an Excel file from "Data Import & Export" to get the system\'s template format.<br/>2. Copy your existing Excel data into the corresponding columns of the template.<br/>3. Import the updated file back into the app.<br/>Notes:<br/>•  Item Name and Price are required fields.<br/>•  Other fields can be left blank.<br/>•  If no date is specified, the system will automatically import the data into "last month". This allows you to quickly migrate your old records into Fandom Wallet! ✨',
    faq_q4:               'How do I search for items that haven\'t arrived yet?',
    faq_a4:               'Enter the keyword "Not Arrived" (未到貨) in the search bar, or tap the "#未到貨" tag.',
    faq_q5:               'Can I add custom categories?',
    faq_a5:               'Currently not supported.<br/>To maintain consistency in report statistics, we use fixed categories.<br/>💡 Quick Bookkeeping Tips:<br/>1. Tags Feature: Use #tags for details (e.g., member names) to flexibly record and filter your data.<br/>2. Switch Modes: Go to "Settings > Ledger & Features" to switch the default category set according to your preference.<br/>3. Wishlist Feature: Feel free to tap below to make a wish; we will evaluate and add new categories accordingly!',
    faq_q6:               'Why can\'t I see the data I added on the web version when I open the App (added to home screen)?',
    faq_a6:               'This usually happens because the login status on the App side hasn\'t synchronized yet.<br/><b>Check Login</b>: Go to "Settings" and check if you are currently logged in. If it shows you are logged out, simply log in again to fetch your cloud data.<br/><br/>Fandom Wallet uses real-time cloud storage, so any data added while logged in is safely saved in the cloud!',

    // === 確認彈窗 ===
    msg_delete_title: 'Delete this record?',
    msg_delete_desc:  'This action cannot be undone.',
    msg_show_amount_title:  'Show amount?',
    msg_show_amount_desc: 'Full expense details will be visible.',
    msg_import_title: 'Import data?',
    msg_import_desc:  'This will overwrite all current records.',
    confirm_ok:           'Confirm',
    confirm_cancel:       'Cancel',

    // === Toast 提示 ===
    toast_saved:          'Saved and synced',
    toast_deleted:        'Record deleted',
    toast_delete_error:   'Delete failed, please try again',
    toast_duplicate:      'Loaded duplicate data, please edit and save',
    toast_imported:       'Imported {n} records',
    toast_uploading:      'Uploading image...',
    toast_uploading_sync: 'Uploading and syncing...',
    toast_login_required: 'Please login to upload images ☁️',
    toast_img_too_large:  'Image too large, please choose a smaller one',
    toast_img_success:    'Image uploaded successfully',
    toast_img_error:      'Image processing failed, try another',
    toast_theme_changed:  'Theme color updated!',
    toast_dark_on:        'Dark mode on',
    toast_dark_off:       'Dark mode off',
    toast_cat_updated:    'Category order updated ✨',
    toast_cat_updated_local: 'Local sort updated ✨',
    toast_grad_updated:   'Gradient updated!',
    toast_hex_updated:    'Custom theme color updated!',
    toast_hex_error:      'Invalid format! Use e.g. #92A8D1',
    toast_switch_kpop:    'Switched to KPOP category',
    toast_switch_acgn:    'Switched to ACGN category',
    toast_currency_changed: 'Default currency changed to {n}',
    toast_name_required:  'Please enter an item name',
    toast_save_error:     'Save failed, please check your input',
    toast_login_fail:     'Login failed, please check popup settings',
    toast_cleanup_done:   'Cleaned! Removed {n} orphaned files',
    toast_cleanup_clean:  'Cloud storage is clean, nothing to remove',
    toast_cleanup_error:  'Cleanup encountered an error',
    toast_no_sheet:       "Worksheet '消費清單' not found",
    toast_file_empty:     'The file is empty',
    toast_no_name_field:  "Column '項目名稱' not found",
    toast_import_success: "Import successful: {n} items in total. If no date was specified, please check last month's list.",
    toast_format_error:   'Invalid file format',
  },
'ja': {
    // === 導覽列 ===
    nav_expense:  '支出リスト',
    nav_report:   'レポート',
    nav_wish:     'ウィッシュリスト',
    nav_settings: '設定',

    // === 通用按鈕 ===
    btn_save:   '保存',
    btn_cancel: 'キャンセル',
    btn_ok:     '確認',
    btn_add:    '追加',
    btn_edit:   '編集',
    btn_delete: '削除',
    btn_receive: '受取済みにする',
    btn_copy:   '複製して追加',
    btn_login:  'ログイン',
    btn_logout: 'ログアウト',
    btn_back:   '戻る',
    btn_apply:  '適用',
    btn_export: 'Excel バックアップ書き出し',
    btn_import: 'Excel 復元インポート',

    // === 消費清單 ===
    filter_all:  '指定なし',
    filter_all_years:  'すべての年',
    filter_full_year: '年',
    filter_all_months: 'すべての月',
    expense_title:        '支出リスト',
    expense_unlogin_title: '現在ゲストモードです',
    expense_unlogin_desc:  'ログインするとクラウドバックアップが有効になり、いつでもどこでも記録を確認できます',
    expense_unlogin_doLogin: 'ログインへ',
    expense_empty:        'この月の記録はありません',
    expense_search_ph:    '商品・状態・メモを検索...',
    expense_no_tag:       'このカテゴリにはタグがありません',
    expense_total:        '合計',
    report_year_net:    '今年の純支出',
    report_month_net:    '今月の純支出',
    expense_count:        '{n} 件',
    expense_total_label:  'Total Cost',
    shipping:             '送料:',
    payment:              '支払い:',

    // === 新增/編輯彈窗 ===
    modal_add_expense:  '支出の追加',
    modal_edit_expense: '記録の編集',
    modal_add_wish:     '願いの追加',
    modal_edit_wish:    '願いの編集',
    modal_add_from_wish:'支出リストに追加',
    field_name:         '商品名',
    field_price:        '単価',
    field_qty:          '数量',
    field_shipping:     '送料/二次決済',
    field_category:     'カテゴリ',
    field_date:         '購入年月日',
    field_platform:     '購入先・プラットフォーム',
    field_platform_ph:  'LINEオープンチャット、WVSなど',
    field_status:       '到着状態',
    field_payment:      '支払い方法',
    field_paid_amount:  '支払い済み金額',
    field_tags:         'タグ',
    field_tags_ph:      'タグを入力後、カンマ（,）で区切って追加',
    field_remark:       '備考:',
    field_remark_ph:    'ショップ、代行、発送予定日など',
    field_upload_img:   '写真をアップロード',
    field_img_limit:    '画像記録 (最大 3 枚)',
    field_wish_price:   '予想価格',
    field_wish_cat:     'カテゴリ',
    field_wish_remark:  'ウィッシュメモ',
    field_wish_date_toggle: '発売日時を記録する',
    field_release_date: '日付',
    field_release_time: '時間',
    type_expense:       '支出',
    type_income:        '出品/売却',
    currency_label:     '元の通貨',
    currency_loading:   '為替レートを読み込み中...',
    rate_cached:        '為替レート準備完了 (キャッシュ)',
    rate_updating:      '最新の為替レートを更新中...',
    rate_updated:       '為替レートを更新しました (ネットワーク)',
    rate_failed:        'レートの取得に失敗しました。オフラインデータを使用します',

    // 到貨狀態
    arrival_未到貨: '未到着',
    arrival_待二補: '二次決済待ち',
    arrival_待出貨: '発送待ち',
    arrival_待取貨: '受取待ち',
    arrival_已取貨: '受取済み',
    arrival_已售出: '売却済み',

    // 付款方式
    pay_待付款:   '未払い',
    pay_貨到付款: '代金引換',
    pay_匯款全額: '全額振込',
    pay_已付訂金: '手付金/予約金支払い済み',
    pay_deposit_hint: '支払い済み:${amount}',
    pay_信用卡:   'クレジットカード',
    pay_現金:     '現金',
    pay_無卡:     'カードなし決済',

    // === KPOP分類 (categories) ===
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

    // === ACGN分類 (categoriesACGN) ===
    'cat_漫畫/輕小說': '漫画 / ライトノベル',
    'cat_立牌/吊飾': 'アクスタ / キーホルダー',
    'cat_小卡/色紙': 'トレカ / 色紙',
    'cat_明信片/海報': 'ポストカード / ポスター',
    'cat_徽章/壓克力': '缶バッジ / アクリル',
    'cat_公仔/娃娃': 'フィギュア / ぬいぐるみ',
    cat_一番賞: '一番くじ',
    cat_聯名服飾: 'コラボ服飾',
    'cat_活動門票/展覽/電影票': 'イベントチケット / 展示会 / 映画券',
    cat_其他支出: 'その他支出',
    cat_未貼標籤: 'タグなし',

    // === 願望清單 ===
    wish_title:       'ウィッシュリスト',
    wish_empty:       '願いを追加しましょう！',
    wish_cat_empty:   'このカテゴリにはまだ願いがありません',
    wish_convert_btn: '支出リストに追加',
    wish_date_tbd:    '未定',

    // === 財務報表 ===
    report_title:       '財務分析レポート',
    report_month:       '月',
    report_6months:     '過去 6 ヶ月',
    report_year:        '年',
    report_yearly:      '年間レポート',
    report_total_exp:   '総支出',
    report_total_inc:   '総収入',
    cat_總支出:          '総支出',
    cat_總收入:          '総収入',
    report_net:         '純支出',
    report_no_data:     'この期間のデータはありません',
    report_byCat:       'カテゴリ別',
    report_byTag:       'タグ別',
    report_hint:        'ヒント：複数のタグが付いた項目は複数回カウントされます。割合はその期間の合計金額に基づいて計算されます。',
    report_rank_exp:    '支出割合ランキング',
    report_rank_inc:    '収入源ランキング',
    report_rank_net:    '収支バランス分析',

    // === 設定 ===
    settings_title:       '設定',
    settings_guest:       'ゲストモード',
    settings_synced:      'クラウド同期済み ☁️',
    settings_login_hint:  'ログインしてクラウド同期を有効化',
    settings_photowall:   'マイフォトウォール',
    settings_appearance:  '外観設定',
    settings_backup:      'データのインポートとエクスポート',
    settings_account:     '家計簿と機能',
    settings_version:     'バージョン情報',
    settings_faq:         'よくある質問とヘルプ',
    settings_cleanup:     '不要な画像のクリーンアップ',
    settings_cleanup_sub: '容量を解放',

    // === 外觀設定 ===
    appear_title:         '外觀設定',
    appear_lang:          '言語',
    appear_preset:        'デフォルトテーマの選択',
    appear_dark:          'ダークモード',
    appear_custom_hex:    'カスタムカラーコードの入力',
    appear_hex_hint:      '# を含む6桁のカラーコードを入力してください (例: #92A8D1)',
    appear_eyedropper:    'スポイト選択',
    appear_custom_grad:   'グラデーションカスタム',
    theme_svt: "ローズクォーツ＆セレニティ",
    theme_purple: "パープル",
    theme_blue: "アクアブルー",
    theme_green: "ネオングリーン",
    theme_aurora: "オーロラ",
    theme_gold: "ゴールド",

    // === 照片牆 ===
    photowall_title:      'フォトウォール',
    photowall_purchased:  '購入済み',
    photowall_wish:       'ウィッシュウォール',
    photowall_all:        'すべて',
    photowall_empty:      'まだ写真がありません',

    // === 匯入匯出 ===
    backup_title:         'インポートとエクスポート',
    backup_excel_title:   'Excel 管理',
    backup_excel_desc:    'ローカル Excel バックアップに画像データは含まれません',
    backup_excel_warn:    '⚠️ インポートすると現在のデータが上書きされ、画像が削除されます',

    // === 帳本與功能 ===
    account_title:        '家計簿と機能',
    account_cat_mode:     '家計簿カテゴリモード',
    account_kpop:         'KPOP モード',
    account_acgn:         'ACGN モード',
    account_exchange:     '為替換算ツールを有効にする',
    account_exchange_sub: '記録追加時に外貨換算エリアを表示する',
    account_exchange_desc:'無効時に記録を編集すると、為替レートデータが失われます',
    account_currency:     'デフォルトの記帳通貨',
    account_currency_sub: 'ここを変更すると、為替換算の基準通貨に影響します',
    account_cat_order:    'カテゴリ順序の調整',
    account_cat_order_sub:'よく使うカテゴリを一番上に固定する',
    account_cat_order_desc:'左側のハンドルをドラッグするか、矢印を使用して順序を調整できます',

    //=== 常見問題===
    faq_title:            'よくある質問 FAQ',
    faq_submit:           '📝 不具合報告・機能要望',
    faq_q1:               '推し活お財布はアプリストアにリリースされますか？',
    faq_a1:               '現在、技術的な制限や審査手続きが複雑なため、App Store や Google Play へのリリースの予定は一時的にございません。しかし、ブラウザから直接「ホーム画面に追加」していただければ、通常のアプリとほぼ変わらない操作感でご利用いただけます！',
    faq_q2:               'ホーム画面に追加する方法は？',
    faq_a2:               'Safari または Chrome でページを開き、「共有」アイコンをタップして「ホーム画面に追加」を選択してください。',
    faq_q3:               'ワンクリックインポート・エクスポート機能の使い方は？',
    faq_a3:               '使い方：<br/>1. まず「データのインポートとエクスポート」から Excel ファイルをエクスポートし、システムが提供するサンプルファイルの形式を取得します。<br/>2. 元々お持ち of Excel データを、サンプルファイルの対応する列にコピーします。<br/>3. 整理したファイルをアプリにインポートすれば完了です。<br/>注意事項：<br/>•  「項目名稱（アイテム名）」と「單價（単価）」は必須項目です。<br/>•  その他の項目は空欄のままでも構いません。<br/>•  日付が未入力の場合、システムは自動的に「先月」のデータとしてインポートします。これにより、元の記録を素早く推し活お財布に移行できます！ ✨',
    faq_q4:               '未発送（未到着）のグッズを確認するには？',
    faq_a4:               '検索ボックスに「未到貨」というキーワードを入力するか、「#未到貨」タグをタップしてください。',
    faq_q5:               '自分で新しいカテゴリーを追加できますか？',
    faq_a5:               '現在は対応しておりません。<br/>レポート統計の一貫性を維持するため、固定のカテゴリーを採用しています。<br/>💡 家計簿のコツ：<br/>1. タグ機能：詳細（例：メンバー名など）は #タグ を使用すると、より柔軟に記録や検索・絞り込みが可能です。<br/>2. モード切り替え：「設定 > 家計簿と機能」でお好みに合わせてデフォルトのカテゴリーセットを切り替えることができます。<br/>3. リクエスト機能：下のボタンから追加の要望（リクエスト）を送っていただければ、検討の上、新しいカテゴリーを追加いたします！',
    faq_q6:               'ウェブ版でデータを追加したのに、アプリ（ホーム画面に追加したもの）を開くと反映されていないのはなぜですか？',
    faq_a6:               'これは通常、アプリ側のログイン状態がまだ同期・更新されていないことが原因です。<br/><b>ログインの確認</b>：「設定」に移動し、現在ログイン状態であるか確認してください。未ログインと表示されている場合は、再度ログインし直すことでクラウドからデータを取得できます。<br/><br/>推し活お財布はリアルタイムのクラウド保存を採用しているため、ログイン状態で追加されたデータは安全にクラウドに保存されています！',

    // === 確認彈窗 ===
    msg_delete_title: '本当に削除しますか？',
    msg_delete_desc:  '削除された記録は復元できません。',
    msg_show_amount_title:  '金額を表示しますか？',
    msg_show_amount_desc: '表示すると、完全な消費明細と合計を確認できます。',
    msg_import_title: 'データをインポートしますか？',
    msg_import_desc:  '注意：Excel をインポートすると現在の支出リストが完全に上書きされ、古いデータは消去されます。インポート前に一度バックアップを書き出すことをお勧めします。',
    confirm_ok:           '確定',
    confirm_cancel:       'キャンセル',

    // === Toast 提示 ===
    toast_saved:          '保存と同期が成功しました',
    toast_deleted:        '記録を削除しました',
    toast_delete_error:   '削除に失敗しました。もう一度お試しください',
    toast_duplicate:      '複製データを読み込みました。編集後に保存してください',
    toast_imported:       'インポート成功：計 {n} 件',
    toast_uploading:      '画像をアップロード中...',
    toast_uploading_sync: 'アップロードと同期中...',
    toast_login_required: '画像アップロード機能を利用するには先にログインしてください☁️',
    toast_img_too_large:  '画像が大きすぎます！より小さな写真を選択してください',
    toast_img_success:    '画像をアップロードしました',
    toast_img_error:      '画像の処理に失敗しました。別の写真を試してください',
    toast_theme_changed:  'カスタムテーマカラーを変更しました！',
    toast_dark_on:        'ダークモードをオンにしました',
    toast_dark_off:       'ダークモードをオフにしました',
    toast_cat_updated:    'カテゴリ順序を更新しました ✨',
    toast_cat_updated_local: 'ローカルの順序を更新しました ✨',
    toast_exchange_on:    '換算ツールを有効にしました',
    toast_exchange_off:   '換算ツールを無効にしました',
    toast_grad_updated:   'グラデーションを更新しました！',
    toast_hex_updated:    'カスタムテーマカラーを変更しました',
    toast_hex_error:      '形式が不正です！#92A8D1 のようなコードを入力してください',
    toast_switch_kpop:    'KPOP カテゴリに切り替えました',
    toast_switch_acgn:    'ACGN カテゴリに切り替えました',
    toast_currency_changed: 'デフォルト通貨を {n} に変更しました',
    toast_name_required:  '商品名を入力してください',
    toast_save_error:     '保存中にエラーが発生しました。入力内容を確認してください',
    toast_login_fail:     'ログインに失敗しました。ポップアップブロック等の設定を確認してください',
    toast_cleanup_done:   'クリーンアップ完了！計 {n} 個の不要な画像を削除しました',
    toast_cleanup_clean:  'クラウドは非常に綺麗です。削除が必要なファイルはありません',
    toast_cleanup_error:  'クリーンアップ中にエラーが発生しました',
    toast_no_sheet:       '「消費清單」ワークシートが見つかりません',
    toast_file_empty:     'ファイルが空です',
    toast_no_name_field:  '「項目名稱」列が見つかりません',
    toast_import_success: 'インポート成功：計 {n} 件。日付が未入力の場合は、先月の消費リストを確認してください。',
    toast_format_error:   'ファイル形式が不正です',
  },

'ko': {
    // === 導覽列 ===
    nav_expense:  '지출 목록',
    nav_report:   '재무 보고서',
    nav_wish:     '위시리스트',
    nav_settings: '설정',

    // === 通用按鈕 ===
    btn_save:   '저장',
    btn_cancel: '취소',
    btn_ok:     '확인',
    btn_add:    '추가',
    btn_edit:   '편집',
    btn_delete: '삭제',
    btn_receive: '수령 완료 표시',
    btn_copy:   '복사 후 추가',
    btn_login:  '로그인',
    btn_logout: '로그아웃',
    btn_back:   '돌아가기',
    btn_apply:  '적용',
    btn_export: 'Excel 백업 내보내기',
    btn_import: 'Excel 복구 가져오기',

    // === 消費清單 ===
    filter_all:  '전체',
    filter_all_years:  '모든 연도',
    filter_full_year: '년',
    filter_all_months: '모든 달',
    expense_title:        '지출 목록',
    expense_unlogin_title: '현재 게스트 모드입니다',
    expense_unlogin_desc:  '로그인하시면 클라우드 백업이 활성화되어 언제 어디서나 기록을 확인할 수 있습니다',
    expense_unlogin_doLogin: '로그인하기',
    expense_empty:        '이번 달 기록이 없어요',
    expense_search_ph:    '상품, 상태, 메모 검색...',
    expense_no_tag:       '이 카테고리에는 태그가 없습니다',
    expense_total:        '합계',
    report_year_net:    '올해 순지출',
    report_month_net:    '이번 달 순지출',
    expense_count:        '{n}개',
    expense_total_label:  'Total Cost',
    shipping:             '배송비:',
    payment:              '결제:',

    // === 新增/編輯彈窗 ===
    modal_add_expense:  '지출 추가',
    modal_edit_expense: '기록 편집',
    modal_add_wish:     '위시 추가',
    modal_edit_wish:    '위시 편집',
    modal_add_from_wish:'지출 목록에 추가',
    field_name:         '상품명',
    field_price:        '단가',
    field_qty:          '수량',
    field_shipping:     '배송비/추가 입금',
    field_category:     '카테고리',
    field_date:         '소비 년월일',
    field_platform:     '구매처/플랫폼',
    field_platform_ph:  '카카오톡 오픈채팅, 위버스숍 등',
    field_status:       '배송 상태',
    field_payment:      '결제 수단',
    field_paid_amount:  '결제 금액',
    field_tags:         '태그',
    field_tags_ph:      '태그 입력 후 쉼표(,)를 입력하여 추가',
    field_remark:       '메모:',
    field_remark_ph:    '공구, 대행업체, 예상 출고일 등',
    field_upload_img:   '사진 업로드',
    field_img_limit:    '사진 기록 (최대 3장)',
    field_wish_price:   '예상 가격',
    field_wish_cat:     '카테고리',
    field_wish_remark:  '위시 메모',
    field_wish_date_toggle: '발매 일시 기록하기',
    field_release_date: '날짜',
    field_release_time: '시간',
    type_expense:       '지출',
    type_income:        '양도/판매',
    currency_label:     '원래 통화',
    currency_loading:   '환율 정보를 불러오는 중...',
    rate_cached:        '환율 정보 준비 완료 (캐시)',
    rate_updating:      '최신 환율 정보를 업데이트 중...',
    rate_updated:       '환율 정보 업데이트 완료 (네트워크)',
    rate_failed:        '환율 연결 실패, 오프라인 데이터를 사용합니다',

    // 到貨狀態
    arrival_未到貨: '미도착',
    arrival_待二補: '추가 입금 대기',
    arrival_待出貨: '출고 대기',
    arrival_待取貨: '수령 대기',
    arrival_已取貨: '수령 완료',
    arrival_已售出: '판매 완료',

    // 付款方式
    pay_待付款:   '결제 대기',
    pay_貨到付款: '대금 상환 (착불)',
    pay_匯款全額: '전액 무통장 입금',
    pay_已付訂金: '예약금/인도금 납부 완료',
    pay_deposit_hint: '기결제:${amount}',
    pay_信用卡:   '신용카드',
    pay_現金:     '현금',
    pay_無卡:     '무통장 결제',

    // === KPOP分類 (categories) ===
    cat_專輯: '앨범',
    cat_小卡: '포토카드',
    'cat_演唱會/見面會門票': '콘서트 / 팬미팅 티켓',
    cat_周邊商品: '굿즈',
    cat_娃娃: '인형',
    cat_會員費: '팬클럽 가입비',
    'cat_應援物/飯製商品': '응원도구 / 비공식 굿즈',
    'cat_交通/住宿': '교통비 / 숙박비',
    cat_聯名商品: '콜라보 상품',
    cat_其他追星支出: '기타 덕질 지출',

    // === ACGN分類 (categoriesACGN) ===
    'cat_漫畫/輕小說': '만화 / 라이트노벨',
    'cat_立牌/吊飾': '아크릴 스탠드 / 키링',
    'cat_小卡/色紙': '포토카드 / 일러스트 보드',
    'cat_明信片/海報': '엽서 / 포스터',
    'cat_徽章/壓克力': '캔배지 / 아크릴',
    'cat_公仔/娃娃': '피규어 / 인형',
    cat_一番賞: '이치방쿠지',
    cat_聯名服飾: '콜라보 의류',
    'cat_活動門票/展覽/電影票': '이벤트 티켓 / 전시회 / 영화 예매권',
    cat_其他支出: '기타 지출',
    cat_未貼標籤: '태그 없음',

    // === 願望清單 ===
    wish_title:       '위시리스트',
    wish_empty:       '위시를 추가해보세요!',
    wish_cat_empty:   '이 카테고리에는 아직 위시가 없습니다',
    wish_convert_btn: '지출 목록에 추가',
    wish_date_tbd:    '미정',

    // === 財務報表 ===
    report_title:       '재무 분석 보고서',
    report_month:       '월',
    report_6months:     '최근 6개월',
    report_year:        '년',
    report_yearly:      '연간 보고서',
    report_total_exp:   '총지출',
    report_total_inc:   '총수입',
    cat_總支出:          '총지출',
    cat_總收入:          '총수입',
    report_net:         '순지출',
    report_no_data:     '해당 기간에 분석할 데이터가 없습니다',
    report_byCat:       '카테고리별',
    report_byTag:       '태그별',
    report_hint:        '힌트: 여러 태그가 붙은 항목은 여러 번 계산됩니다. 비율은 해당 기간의 총액을 기준으로 계산됩니다.',
    report_rank_exp:    '지출 비중 순위',
    report_rank_inc:    '수입 출처 순위',
    report_rank_net:    '손익 균형 분석',

    // === 設定 ===
    settings_title:       '설정',
    settings_guest:       '게스트 모드',
    settings_synced:      '클라우드 데이터 동기화 완료 ☁️',
    settings_login_hint:  '로그인 후 클라우드 백업 사용 가능',
    settings_photowall:   '나의 포토월',
    settings_appearance:  '외관 설정',
    settings_backup:      '데이터 가져오기 및 내보내기',
    settings_account:     '장부 및 기능',
    settings_version:     '버전 정보',
    settings_faq:         '자주 묻는 질문 및 도움말',
    settings_cleanup:     '불필요한 이미지 정리',
    settings_cleanup_sub: '저장 공간 확보',

    // === 外觀設定 ===
    appear_title:         '외관 설정',
    appear_lang:          '언어',
    appear_preset:        '기본 테마 선택',
    appear_dark:          '다크 모드',
    appear_custom_hex:    '사용자 지정 색상 코드 입력',
    appear_hex_hint:      '#을 포함한 6자리 색상 코드를 입력해 주세요 (예: #92A8D1)',
    appear_eyedropper:    '스포이트 선택',
    appear_custom_grad:   '그라데이션 지정',
    theme_svt: "로즈쿼츠 & 세레니티",
    theme_purple: "퍼플",
    theme_blue: "아쿠아 블루",
    theme_green: "네온 그린",
    theme_aurora: "오로라",
    theme_gold: "골드",

    // === 照片牆 ===
    photowall_title:      '포토월',
    photowall_purchased:  '구매 완료',
    photowall_wish:       '위시월',
    photowall_all:        '전체',
    photowall_empty:      '등록된 사진이 없습니다',

    // === 匯入匯出 ===
    backup_title:         '가져오기 및 내보내기',
    backup_excel_title:   'Excel 관리',
    backup_excel_desc:    '로컬 Excel 백업에는 이미지 데이터가 포함되지 않습니다',
    backup_excel_warn:    '⚠️ 가져오기를 진행하면 현재 데이터가 덮어씌워지며 이미지가 초기화됩니다',

    // === 帳本與功能 ===
    account_title:        '장부 및 기능',
    account_cat_mode:     '장부 카테고리 모드',
    account_kpop:         'KPOP 모드',
    account_acgn:         'ACGN 모드',
    account_exchange:     '환율 변환 도구 활성화',
    account_exchange_sub: '기록 추가 시 외화 변환 영역 표시',
    account_exchange_desc:'비활성화 상태에서 기록을 편집하면 환율 정보가 유실될 수 있습니다',
    account_currency:     '기본 장부 통화',
    account_currency_sub: '이곳을 변경하면 환율 계산의 기준 통화가 변경됩니다',
    account_cat_order:    '카테고리 순서 조정',
    account_cat_order_sub:'자주 사용하는 카테고리를 최상단에 고정',
    account_cat_order_desc:'좌측 핸들을 드래그하거나 화살표를 사용하여 순서를 조정할 수 있습니다',

    //=== 常見問題===
    faq_title:            '자주 묻는 질문 FAQ',
    faq_submit:           '📝 오류 제보 및 기능 건의',
    faq_q1:               '덕질 가계부가 앱 스토어에 출시되나요?',
    faq_a1:               '현재 기술적 제한 및 번거로운 출시 절차로 인해 당분간 App Store / Google Play 출시 계획은 없습니다. 하지만 지금 바로 \'홈 화면에 추가\'하여 사용하시면 앱과 거의 동일한 환경으로 편리하게 이용하실 수 있습니다!',
    faq_q2:               '홈 화면에 어떻게 추가하나요?',
    faq_a2:               'Safari 또는 Chrome 브라우저로 접속한 후, \'공유\' 아이콘을 클릭하고 \'홈 화면에 추가\'를 선택해 주세요.',
    faq_q3:               '원클릭 가져오기/내보내기 기능은 어떻게 사용하나요?',
    faq_a3:               '사용 방법:<br/>1. 먼저 \'데이터 가져오기 및 내보내기\'에서 Excel을 내보내어 시스템에서 제공하는 샘플 파일 양식을 확인합니다.<br/>2. 기존에 가지고 있던 Excel 데이터를 샘플 파일의 알맞은 열에 복사합니다.<br/>3. 정리가 완료된 파일을 앱으로 가져오기(업로드)하면 끝납니다.<br/>주의 사항:<br/>•  \'項目名稱(품목명)\'과 \'單價(단가)\'는 필수 입력 항목입니다.<br/>•  기타 항목은 비워두셔도 됩니다.<br/>•  날짜를 입력하지 않은 경우, 시스템이 자동으로 \'지난달\' 데이터로 가져옵니다. 이 기능을 통해 기존 기록을 덕질 가계부로 빠르게 옮길 수 있습니다! ✨',
    faq_q4:               '미도착(미배송) 상품은 어떻게 조회하나요?',
    faq_a4:               '검색창에 \'未到貨\' 키워드를 입력하거나 \'#未到貨\' 태그를 클릭해 주세요.',
    faq_q5:               '카테고리를 직접 추가할 수 있나요?',
    faq_a5:               '현재는 지원하지 않습니다.<br/>통계 리포트의 일관성을 유지하기 위해 고정된 카테고리를 사용하고 있습니다.<br/>💡 작성 팁:<br/>1. 태그 기능: 상세 내용(예: 멤버 이름)은 #태그를 사용하시면 더욱 유연하게 기록하고 검색 필터링을 할 수 있습니다.<br/>2. 모드 전환: \'설정 > 장부 및 기능\'에서 취향에 따라 기본 카테고리 세트를 전환할 수 있습니다.<br/>3. 건의 기능: 아래 링크를 통해 원하시는 카테고리를 건의해 주시면 검토 후 추가하도록 하겠습니다!',
    faq_q6:               '웹 버전에서 데이터를 추가했는데, 앱(홈 화면에 추가된 버전)을 열었을 때 안 보이는 이유는 무엇인가요?',
    faq_a6:               '이는 보통 앱 쪽의 로그인 상태가 아직 동기화되어 업데이트되지 않았기 때문입니다.<br/><b>로그인 상태 확인</b>: \'설정\'으로 이동하여 현재 로그인 상태인지 확인해 주세요. 로그아웃 상태로 표시된다면 다시 로그인하시면 클라우드 데이터를 즉시 불러올 수 있습니다.<br/><br/>덕질 가계부는 실시간 클라우드 저장을 적용하고 있으므로, 로그인 상태에서 추가한 데이터는 모두 클라우드에 안전하게 보관됩니다!',

    // === 確認彈窗 ===
    msg_delete_title: '정말로 삭제하시겠습니까?',
    msg_delete_desc:  '삭제된 기록은 복구할 수 없습니다.',
    msg_show_amount_title:  '금액을 표시하시겠습니까?',
    msg_show_amount_desc: '표시하면 상세한 소비 명세와 합계를 확인할 수 있습니다.',
    msg_import_title: '데이터를 가져오시겠습니까?',
    msg_import_desc:  '주의: Excel 파일을 가져오면 현재 소비 목록이 "완전히 덮어씌워지며" 기존 데이터는 유실됩니다. 가져오기 전에 먼저 백업용 내보내기를 실행하시는 것을 권장합니다.',
    confirm_ok:           '확인',
    confirm_cancel:       '취소',

    // === Toast 提示 ===
    toast_saved:          '성공적으로 저장 및 동기화되었습니다',
    toast_deleted:        '기록이 성공적으로 삭제되었습니다',
    toast_delete_error:   '삭제에 실패했습니다. 다시 시도해 주세요',
    toast_duplicate:      '복제된 데이터를 불러왔습니다. 수정 후 저장해 주세요',
    toast_imported:       '가져오기 성공: 총 {n}건',
    toast_uploading:      '이미지를 업로드 중입니다...',
    toast_uploading_sync: '업로드 및 동기화 중입니다...',
    toast_login_required: '이미지 업로드 기능을 이용하시려면 먼저 로그인해 주세요☁️',
    toast_img_too_large:  '이미지 용량이 너무 큽니다! 더 작은 사진을 선택해 주세요',
    toast_img_success:    '이미지를 업로드했습니다',
    toast_img_error:      '이미지 처리에 실패했습니다. 다른 사진으로 시도해 주세요',
    toast_theme_changed:  '사용자 지정 테마 색상으로 변경되었습니다!',
    toast_dark_on:        '다크 모드가 활성화되었습니다',
    toast_dark_off:       '다크 모드가 비활성화되었습니다',
    toast_cat_updated:    '카테고리 순서가 업데이트되었습니다 ✨',
    toast_cat_updated_local: '로컬 정렬 순서가 업데이트되었습니다 ✨',
    toast_exchange_on:    '환율 변환 도구가 활성화되었습니다',
    toast_exchange_off:   '환율 변환 도구가 비활성화되었습니다',
    toast_grad_updated:   '그라데이션이 업데이트되었습니다!',
    toast_hex_updated:    '사용자 지정 테마 색상으로 변경되었습니다',
    toast_hex_error:      '형식이 올바르지 않습니다! #92A8D1과 같은 코드를 입력해 주세요',
    toast_switch_kpop:    'KPOP 모드로 전환되었습니다',
    toast_switch_acgn:    'ACGN 모드로 전환되었습니다',
    toast_currency_changed: '기본 통화가 {n}(으)로 변경되었습니다',
    toast_name_required:  '상품명을 입력해 주세요',
    toast_save_error:     '저장 중 오류가 발생했습니다. 입력 내용을 확인해 주세요',
    toast_login_fail:     '로그인에 실패했습니다. 팝업 차단 설정을 확인해 주세요',
    toast_cleanup_done:   '정리 완료! 총 {n}개의 불필요한 이미지를 삭제했습니다',
    toast_cleanup_clean:  '클라우드 저장 공간이 깔끔합니다. 정리할 파일이 없습니다',
    toast_cleanup_error:  '정리 작업 중 오류가 발생했습니다',
    toast_no_sheet:       "'消費清單' 워크시트를 찾을 수 없습니다",
    toast_file_empty:     '파일이 비어 있습니다',
    toast_no_name_field:  "'項目名稱' 열을 찾을 수 없습니다",
    toast_import_success: '가져오기 성공: 총 {n}건. 날짜를 입력하지 않은 경우 지난달 소비 내역을 확인해 주세요.',
    toast_format_error:   '파일 형식이 올바르지 않습니다',
  },
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
  return 'zh-TW';
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
  //含有 HTML 標籤的文字：使用 innerHTML (會解析 <br/>, <b> 等)
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
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