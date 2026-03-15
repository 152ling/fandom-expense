/**
 * actions.js - 處理所有按鈕觸發的動作（儲存、刪除、複製、轉換）
 */
import { state } from './state.js';
import { showToast,askUser, renderContent, closeModal, closeActionModal, updateImagePreviewUI } from './ui.js';
import { compressImage } from './utils.js';

// 全域鎖定變數，防止連點導致重複存檔或刪除
let isSaving = false;

export async function saveData() {
        if (isSaving) return; // 防止重複點擊
        try {
            const n = document.getElementById('m-t-l')?.value; 
            const pVal = document.getElementById('m-u-p')?.value; 
            const p = Number(pVal) || 0;
            if (!n) {
                showToast("請輸入商品名稱");
                return;
            }


            const isExp = (state.activeTab === 'expense' || document.getElementById('m-qty'));
            const key = isExp ? 'expenses' : 'wishlist';
            isSaving = true; // 開鎖
            showToast("正在上傳並同步...");

             // --- 核心轉移邏輯：清理孤兒圖片與舊格式 ---
            if (state.editingId) {
                const oldItem = state[key].find(i => String(i.id) === state.editingId);
                // 同時檢查舊版的 .image 跟新版的 .images
                const oldImgs = Array.isArray(oldItem?.images) ? oldItem.images : (oldItem?.image ? [oldItem.image] : []);
                
                // 找出編輯後不再被需要的 URL
                const removedUrls = oldImgs.filter(url => !state.tempImages.includes(url));
                removedUrls.forEach(url => {
                    window.cloud.deleteFile(url).then(() => console.log("已從雲端清理被移除的舊圖:", url));
                });
            }
            const uploadTasks = [];

            // 1. 處理消費模式的多圖 (Base64 陣列)
            state.tempImageBase64.forEach(b64 => {
                uploadTasks.push((async () => {
                    const blob = await fetch(b64).then(r => r.blob());
                    const fileName = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;
                    return await window.cloud.uploadFile(blob, fileName);
                })());
            });

            // 2. 處理願望模式的單圖 (Blob 物件)
            if (state.tempImageBlob) {
                uploadTasks.push((async () => {
                    const fileName = `wish_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;
                    return await window.cloud.uploadFile(state.tempImageBlob, fileName);
                })());
            }

            const uploadedUrls = await Promise.all(uploadTasks);

            // 3. 合併所有網址並去重
            const rawImages = [...state.tempImages, ...uploadedUrls.filter(u => u)];
            const finalImages = [...new Set(rawImages)].slice(0, 3);
            const finalImageUrl = finalImages.length > 0 ? finalImages[0] : null;
            let item;
            const tags = window.getSmartTags ? window.getSmartTags() : [];
            let c, pf;
            if(state.enableExchange){
                c = document.getElementById('currency-select').value;
                pf = Number(document.getElementById('foreign-amount')?.value);
            }else{
                c='KRW';
                pf= 0;
            }
            if (isExp) { //消費模式
                const dateVal = document.getElementById('m-date').value;
                const dateParts = dateVal ? dateVal.split('-') : [state.filterYear, state.filterMonth];
                const y = Number(dateParts[0]);
                const m = Number(dateParts[1]);
                const d = Number(dateParts[2]);
                const p = Number(document.getElementById('m-u-p').value) || 0;
                const q = Number(document.getElementById('m-qty').value) || 1;
                const s = Number(document.getElementById('m-shipping').value) || 0;

                const payM = document.getElementById('m-pay-method')?.value || '待付款';
                const totalPrice = (p * q) + s;

                item = { 
                    id: state.editingId || String(Date.now()), 
                    type: state.tempType || 'expense', // expense 或 income
                    name: n, price: p, qty: q,shipping: s,
                    currency: c,foreign_amount: pf || '', 
                    total: state.tempType === 'income' ? (p * q) : (p * q + s), 
                    category: document.getElementById('m-cat').value, 
                    year: y, month: m,day:d || 1,
                    images: finalImages,
                    image: finalImageUrl, // 單圖兼容
                    platform: document.getElementById('m-platform').value || '', 
                    arrivalStatus: document.getElementById('m-status').value, 
                    paymentMethod: payM,
                    paidAmount: payM === '已付訂金' ? (Number(document.getElementById('m-paid-amount').value) || 0) : totalPrice,
                    tags:tags,
                    remark: document.getElementById('m-remark').value || '' ,
                };
                item.total = (item.price * item.qty) + item.shipping;
            } else { //心願模式
                const recordDate = document.getElementById('m-wish-date-toggle').checked; //是否有勾選紀錄日期
                item = { 
                    id: state.editingId || String(Date.now()), name: n, 
                    price: p,
                    currency: c,foreign_amount: pf || '',
                    category: document.getElementById('m-wish-cat').value, 
                    // 儲存邏輯：若勾選才存入值，否則存入空字串
                    releaseDate: recordDate ? document.getElementById('m-release-date').value : '', 
                    releaseTime: recordDate ? document.getElementById('m-release-time').value : '',
                    remark: document.getElementById('m-remark').value || '', 
                    image: finalImageUrl
                };
            }

            // 更新 state、LocalStorage 並同步
            if (state.editingId) {
                const idx = state[key].findIndex(i => String(i.id) === state.editingId);
                if (idx !== -1) {
                    state[key][idx] = item;
                } else {
                    // 如果是編輯模式但在該清單找不到（例如從願望轉過來），改用新增
                    state[key].push(item);
                }
            } else {
                state[key].push(item);
            }

            // 儲存至本地 (修正引號問題)
            localStorage.setItem(`fe_v11_${key}`, JSON.stringify(state[key]));
            // --- 核心修正：如果是從願望轉過來的，刪除該願望 ---
            if (isExp && state.wishSourceId) {
                state.wishlist = state.wishlist.filter(w => String(w.id) !== state.wishSourceId);
                localStorage.setItem('fe_v11_wishlist', JSON.stringify(state.wishlist));
                state.wishSourceId = null; // 處理完後清空
            }

            // 同步至雲端 (加入 await)
            if (window.cloud && typeof window.cloud.sync === 'function') {
                await window.cloud.sync(state.expenses, state.wishlist);
                // 存檔後清除暫存 Blob
                state.tempImageBlob = null;
            }
            if (isExp && state.activeTab !== 'expense') {
                state.activeTab = 'expense';
                // 同步更新底部導覽列的顏色
                ['expense', 'report', 'wish', 'settings'].forEach(t => {
                    const el = document.getElementById(`tab-${t}`);
                    if (el) el.className = `flex-1 flex flex-col items-center gap-1 transition-colors ${state.activeTab === t ? 'tab-active' : 'text-gray-400'}`;
                });
            }
            closeModal(); 
            renderContent(); 
            showToast("已成功儲存並同步");
        } catch (error) {
            console.error("儲存失敗：", error);
            showToast("儲存發生錯誤，請檢查輸入內容");
        } finally {
            isSaving = false; // 關鎖
        }
    }
export    async function handleImage(input) { //願望清單用的上傳
            if (!state.user) {
                showToast("請先登入以開啟圖片上傳功能☁️");
                input.value = "";
                return;
            }
            const file = input.files[0];
            if (!file) {
                reportEvent('image_picker_error', {reason: 'empty_file',userAgent: navigator.userAgent})
                showToast('圖片取得失敗');
                return;
            }
            showToast("正在讀取圖片...");
        // 2. 處理 file.type 為空的情況 (針對部分 Android/OPPO 系統)
            let isImage = false;
            if (file.type) {
                isImage = file.type.startsWith('image/');
            } else {
                // 如果系統沒給 MIME type，改用副檔名判斷 (防呆)
                const ext = file.name.split('.').pop().toLowerCase();
                isImage = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext);
            }

            if (!isImage) {
                showToast("不支援的檔案格式，請選擇圖片檔");
                input.value = ""; // 清空選取
                return;
            }
            // 3. 檢查檔案大小 (超過 15MB 預警)
            if (file.size > 15 * 1024 * 1024) {
                showToast("圖片太大囉！請選擇較小的照片");
                input.value = "";
                return;
            }
            if (file) {
                const reader = new FileReader();
                // 檔案讀取失敗的處理
                reader.onerror = () => {
                    showToast("檔案讀取發生錯誤，請重試");
                    input.value = "";
                };
                reader.onload = async (e) => {
                    try {
                        const compressionWidth = file.size > 2 * 1024 * 1024 ? 500 : 800;
                        const compressedBase64 = await compressImage(e.target.result, compressionWidth);
                        if (!compressedBase64) throw new Error("壓縮失敗");

                        // 更新 UI 預覽
                        const placeholder = document.getElementById('img-placeholder');
                        if (placeholder) {
                            placeholder.innerHTML = `<img src="${compressedBase64}" class="w-full h-full object-cover">`;
                        }

                        // 將 Base64 轉換為 Blob 準備上傳
                        const response = await fetch(compressedBase64);
                        if (!response.ok) throw new Error("轉換失敗");
                        
                        // state.tempImageBlob = await response.blob(); 
                        // state.tempImage = null; // 清除舊網址紀錄
                        // 2. 存入 Blob 供 saveData 使用
                        state.tempImageBlob = await fetch(compressedBase64).then(r => r.blob());
                        state.tempImages = []; // 清空舊圖，確保只傳這張新的
                        state.tempImageBase64 = [];
                        showToast("圖片上傳成功");

                    } catch (error) {
                        console.error("Image processing error:", error);
                        showToast("圖片處理失敗，請換一張試試");
                        // 重置狀態
                        state.tempImageBlob = null;
                        document.getElementById('img-placeholder').innerHTML = `<span class="text-slate-300 text-[10px] font-bold uppercase tracking-widest">上傳相片</span>`;
                        input.value = "";
                    }
                };
                reader.readAsDataURL(file);
            }
        }
export async function handleMultiImage(input) {
            if (!state.user) {
                showToast("請先登入以開啟圖片上傳功能☁️");
                input.value = "";
                return;
            }

            const files = Array.from(input.files);
            if (files.length === 0) return;

            const currentCount = state.tempImages.length + state.tempImageBase64.length;
            const remain = 3 - currentCount;
            if (remain <= 0) {
                showToast("已達上傳上限 (最多 3 張)");
                input.value = "";
                return;
            }

            const toProcess = files.slice(0, remain);
            showToast("正在讀取圖片...");

            for (const file of toProcess) {
                // 1. 類型檢查 (每一張圖片都會個別執行此檢查)
                let isImage = false;
                if (file.type) {
                    isImage = file.type.startsWith('image/');
                } else {
                    const ext = file.name.split('.').pop().toLowerCase();
                    isImage = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext);
                }

                if (!isImage) {
                    showToast(`不支援的檔案格式，請選擇圖片檔: ${file.name}`);
                    continue;
                }

                // 2. 大小檢查 (上限 15MB)
                if (file.size > 15 * 1024 * 1024) {
                    showToast(`圖片太大囉: ${file.name}`);
                    continue;
                }

                try {
                    const b64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onerror = () => {
                            showToast("讀取失敗");
                            reject(new Error("Read failed"));
                        };
                        reader.onload = async (e) => {
                            try {
                                // 3. 壓縮邏輯 (與單圖上傳一致)
                                const compressionWidth = file.size > 2 * 1024 * 1024 ? 500 : 800;
                                const compressedBase64 = await compressImage(e.target.result, compressionWidth);
                                resolve(compressedBase64);
                            } catch (err) {
                                reject(err);
                            }
                        };
                        reader.readAsDataURL(file);
                    });

                    if (b64) {
                        state.tempImageBase64.push(b64);
                        // 每處理完一張就更新一次預覽，增加反應速度
                        updateImagePreviewUI();
                    }
                } catch (error) {
                    console.error("Image processing error:", error);
                    showToast(`處理失敗: ${file.name}`);
                }
            }
            
            showToast("圖片處理完成");
            input.value = ""; // 清空 input 以便下次選擇
        }
            // 點擊刪除按鈕觸發
export  async function handleDelete(e, type, id) {
            if (e) e.stopPropagation();
            
            // 使用通用工具
            const confirmed = await askUser("確定要刪除嗎？", "紀錄刪除後將無法恢復。", "🗑️");

            if (confirmed) {
                try{
                    const key = type === 'expense' ? 'expenses' : 'wishlist';
                    // 2. 找到要刪除的那筆資料，檢查是否有圖片
                    const itemToDelete = state[key].find(i => String(i.id) === String(id));
            
                    // 用window.cloud.deleteFile刪除storage資料
                    if (itemToDelete) {
                        // 同時抓取兩種欄位，過濾出不重複的有效網址
                        const imagesToDelete = [
                            ...(Array.isArray(itemToDelete.images) ? itemToDelete.images : []),
                            ...(itemToDelete.image ? [itemToDelete.image] : [])
                        ];
                        
                        const uniqueUrls = [...new Set(imagesToDelete)];

                        if (uniqueUrls.length > 0) {
                            await Promise.all(uniqueUrls.map(url => window.cloud.deleteFile(url)));
                            console.log(`已清理該紀錄相關的 ${uniqueUrls.length} 張圖片`);
                        }
                    }

                    // 4. 刪除本地與雲端的文字紀錄
                    state[key] = state[key].filter(i => String(i.id) !== String(id));
                    localStorage.setItem(`fe_v11_${key}`, JSON.stringify(state[key]));
                    
                    if (window.cloud) window.cloud.sync(state.expenses, state.wishlist);
                    
                    renderContent();
                    showToast("已成功刪除紀錄");
                } catch (error) {
                    console.error("刪除失敗：", error);
                    showToast("刪除過程發生錯誤，請稍後再試");
                }
            }
        }

// --- 3. 操作選單的觸發中轉函數 ---
export  function triggerEditFromAction() {
            const { type, id } = state.actionTarget; closeActionModal();
            const list = type === 'expense' ? state.expenses : state.wishlist;
            const item = list.find(i => i.id === id);
            if (item) openAddModal(item);
        }
export function triggerCopyFromAction() {
            const { type, id } = state.actionTarget; 
            closeActionModal();
            //根據類型（消費或願望）找到原始資料
            const list = type === 'expense' ? state.expenses : state.wishlist;
            const originalItem = list.find(i => String(i.id) === String(id));
            if (originalItem) {
                const copiedData = { 
                    ...originalItem, 
                    id: null,
                    isCopy: true // 標記這是一筆複製件
                };
                openAddModal(copiedData);
                showToast("已載入複製資料，修改後請儲存");
            }
        }

export  function triggerConvertToExpense() {
            const { id } = state.actionTarget; closeActionModal();
            const wish = state.wishlist.find(w => w.id === id);
            if(wish) {
                state.wishSourceId = id;
                const categoryMap = { //因為原本願望分類跟消費分類不一致
                    '周邊': '周邊商品',
                    '演唱會': '演唱會 / 見面會門票',
                };
                const targetCategory = categoryMap[wish.category] || wish.category || '周邊商品';
                openAddModal({ ...wish,id: null, qty: 1, category: targetCategory, arrivalStatus: '未到貨', paymentMethod: '待付款' });
            }
        }
export async function triggerDeleteFromAction() {
            const { type, id } = state.actionTarget;
            closeActionModal(); // 先關閉操作選單
            await handleDelete(null, type, id);
        }
        
window.saveData = saveData;
window.handleDelete = handleDelete;
window.handleImage = handleImage;
window.handleMultiImage = handleMultiImage;
window.triggerConvertToExpense = triggerConvertToExpense;
window.triggerEditFromAction = triggerEditFromAction;
window.triggerDeleteFromAction = triggerDeleteFromAction;
window.triggerCopyFromAction = triggerCopyFromAction;