/**
 * utils.js - 獨立工具箱
 * 負責：圖片壓縮、日期格式化、Excel 匯入匯出邏輯
 */

// --- 1. 圖片處理工具 ---
/**
 * 壓縮圖片 Base64 字串
 * @param {string} base64Str 
 * @param {number} maxWidth 
 * @returns {Promise<string>}
 */


export    function compressImage(base64Str, maxWidth = 600) {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = base64Str;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;

                    // 1. 強制調整尺寸
                    if (w > maxWidth) {
                        h *= maxWidth / w;
                        w = maxWidth;
                    }
                    canvas.width = w;
                    canvas.height = h;

                    const ctx = canvas.getContext('2d');
                    // 2. 使用更平滑的縮放繪製
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, w, h);

                    // 3. 優先使用 webp 格式 (體積減少約 30%)，品質設為 0.4
                    // 如果瀏覽器不支援 webp，它會自動退回到 image/jpeg
                    let outputFormat = "image/webp";
                    let quality = 0.4; 

                    const compressedBase64 = canvas.toDataURL(outputFormat, quality);
                    resolve(compressedBase64);
                };
            });
        }

/**
 * 分享卡專用的工具
 */
export    function showShareConfirm() {
            document.getElementById('share-confirm-overlay').classList.remove('hidden');
        }

export    function startShareGeneration() {
            document.getElementById('share-confirm-overlay').classList.add('hidden');
            drawShareCard();
        }
        const base64Cache = new Map();
        const finalCardCache = new Map();
        const ENGLISH_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        /** * 1. 圖片處理：縮圖快取 */
        async function getSafeBase64(url) {
            if (!url) return null;
            if (base64Cache.has(url)) return base64Cache.get(url);
            
            try {
                if (url.startsWith('data:')) return url;
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) throw new Error('Fetch failed');
                const blob = await response.blob();
                const shrunkBase64 = await shrinkImage(blob, 400); 
                base64Cache.set(url, shrunkBase64);
                return shrunkBase64;
            } catch (err) {
                console.warn("讀取失敗:", url);
                return null; 
            }
        }

export    function shrinkImage(blob, targetSize) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = URL.createObjectURL(blob);
                img.onload = () => {
                   try {
                        const canvas = document.createElement('canvas');
                        const scale = targetSize / Math.max(img.width, img.height);
                        canvas.width = img.width * scale;
                        canvas.height = img.height * scale;
                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.6));
                    } catch {
                        resolve(null);
                    }
                };
                img.onerror = () => resolve(null);
            });
        }

        /**
         * 2. 生成分享卡 (智慧快取優化版)
         * @param {boolean} force - 是否強制清除快取並重新繪製
         */
        async function drawShareCard(forceRandom = false) {
            const modal = document.getElementById('share-modal');
            const resultBox = document.getElementById('share-result-container');
            const grid = document.getElementById('share-photo-grid');
            
            // A. 計算資料指紋 (Fingerprint)
            // --- 智慧時間篩選 (包含不限月份/年份邏輯) ---
            const currentMonthItems = state.expenses.filter(ex => {
                const typeMatch = ex.type !== 'income';
                const yearMatch = state.filterYear === 0 || Number(ex.year) === state.filterYear;
                const monthMatch = state.filterMonth === 0 || Number(ex.month) === state.filterMonth;
                return typeMatch && yearMatch && monthMatch;
            });
            const totalExp = currentMonthItems.filter(i => i.type !== 'income').reduce((sum, i) => sum + i.total, 0);
            const totalInc = currentMonthItems.filter(i => i.type === 'income').reduce((sum, i) => sum + i.total, 0);
            const total = totalExp - totalInc;
            const photoItems = currentMonthItems.filter(i => i.image).slice(0, 9);
            
            // 關鍵優化：Cache Key 包含圖片 URL，網址一換快取就自動失效
            const imagesFingerprint = photoItems.map(i => i.image).join('|');
            const cacheKey = `${state.filterYear}-${state.filterMonth}-${currentMonthItems.length}-${total}-${imagesFingerprint}`;

           // C. 檢查快取
            if (!forceRandom && finalCardCache.has(cacheKey)) {
                const cachedDataUrl = finalCardCache.get(cacheKey);
                modal.classList.remove('hidden');
                resultBox.innerHTML = `<img src="${finalCardCache.get(cacheKey)}" class="w-full h-auto rounded-[2.5rem] shadow-2xl animate-card">`;
                document.getElementById('download-trigger').onclick = () => {
                    const link = document.createElement('a');
                    link.download = `Report_${state.filterYear}_${state.filterMonth}.png`;
                    link.href = cachedDataUrl;
                    link.click();
                };               
                return;
            }

            // D. 繪製流程
            modal.classList.remove('hidden');
            resultBox.innerHTML = `
                <div class=" h-[70vh] flex items-center justify-center p-10 text-center">
                    <div>
                    <div class="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-slate-400 text-sm font-bold tracking-widest uppercase italic">生成圖片中...</p>
                    <p class="text-slate-400 text-xs tracking-widest ">預計會花5~10秒</p>
                    <p class="text-slate-400 text-xs tracking-widest ">若圖片有缺漏請點擊重新生成</p>
                    </div>
                </div>`;

            const base64Photos = await Promise.all(photoItems.map(async (item) => {
                return await getSafeBase64(item.image);
            }));
            // 更新 DOM 內容
            //document.getElementById('share-title').textContent = `${state.filterYear}.${String(state.filterMonth).padStart(2, '0')}`;
            //document.getElementById('share-total').textContent = `$${total.toLocaleString()}`;
            // --- 更新標題：英文月份 ---
            if (state.filterMonth === 0) { //月份選不限
                const yearName = state.filterYear === 0 ? "ALL-TIME" : state.filterYear;
                document.getElementById('share-title').textContent = "ANNUAL";
                document.getElementById('share-title-sub').textContent = `${yearName}`;
            } else {
                const monthName = ENGLISH_MONTHS[state.filterMonth - 1] || "MONTH";
                document.getElementById('share-title').textContent = `${monthName}`;
                document.getElementById('share-title-sub').textContent = `${state.filterYear}`;
            }

            // --- 隨機人格邏輯 ---
            const categoryPrefixTemplates = {
                '專輯': ['{tag}專輯控','音樂守護者','實體CD執念者','銷量貢獻大戶'],
                '小卡': ['{tag}小卡狂熱者','小卡愛好者','卡片蒐集狂','迷你收藏家','卡冊建築大師'],
                '演唱會 / 見面會門票': ['搶票戰神','門票富翁','舞台追尋者', '排隊專業戶'],
                '周邊商品': ['{tag}周邊控','實體收藏達人'],
                '娃娃': ['{tag}娃娃親媽','娃娃守護者','萌物收藏家'],

                '漫畫 / 輕小說': ['{tag}書架破壞者', '精神糧食糧倉主', '二次元住民'],
                '立牌 / 吊飾': ['{tag}神壇建築師', '壓克力守護靈', '桌面空間侵占者', '壓克力收藏家'],
                '小卡 / 色紙': ['{tag}紙片人代購商', '卡冊建築大師','色紙展示狂'],
                '明信片 / 海報': ['{tag}牆面粉刷匠', '平面美學監製', '視線捕捉者'],
                '徽章 / 壓克力': ['{tag}痛包重量擔當', '金屬撞擊愛好者', '閃亮亮搜刮者','別針受難者'],
                '公仔 / 娃娃': ['{tag}棉花娃親媽', '娃娃守護者', '萌物收藏家'],
            };

            const getSuffixByAmount = (amount) => {
                if (amount === 0) return '純愛戰士(零成本版)';
                if (amount < 1000) return '純愛戰士';
                if (amount < 1500) return '理性小粉絲';
                if (amount < 2000) return '快樂小粉絲';
                if (amount < 3000) return '精神糧食愛好者';
                if (amount < 4000) return '存摺縮水警告中';
                if (amount < 4500) return '提款機精靈';
                if (amount < 5000) return '專業周邊獵人';
                if (amount < 5500) return '行走的周邊收割機';
                if (amount < 6000) return '窮到吃土的快樂人🛖';
                if (amount < 7000) return 'MBTI是ATM💸';
                if (amount < 8000) return '為了歐爸呼吸的ATM';
                if (amount < 8500) return '破產美學實踐者🏚️';
                if (amount < 9000) return '偶像的神仙教母';
                if (amount < 10000) return '粉絲銀行董事🏦';
                if (amount < 20000) return '經紀公司再生父母💰';
                if (amount < 30000) return '經紀公司榮譽董事';
                return '偶像背後的隱形金主👑';
            };

            const getPrefixByExpenses = (expenses) => {
                if (!expenses.length) return '快樂追星族';
                const categorySum = {};
                const categoryTagMap = {};
                expenses.forEach(e => {
                    categorySum[e.category] = (categorySum[e.category] || 0) + (Number(e.total) || 0);
                    const tag = (Array.isArray(e.tags) && e.tags.length > 0) ? e.tags[0] : '';
                    if (tag) {
                        categoryTagMap[e.category] = categoryTagMap[e.category] || {};
                        categoryTagMap[e.category][tag] = (categoryTagMap[e.category][tag] || 0) + 1;
                    }
                });
                const topCategory = Object.entries(categorySum).sort((a,b)=>b[1]-a[1])[0][0];
                const topTagObj = categoryTagMap[topCategory] || {};
                const topTag = Object.entries(topTagObj).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';
                const templates = categoryPrefixTemplates[topCategory] || ['追星玩家'];
                let chosen = templates[Math.floor(Math.random() * templates.length)];
                return chosen.replace('{tag}', topTag);
            };
            const prefix = getPrefixByExpenses(currentMonthItems);
            const suffix = getSuffixByAmount(total);
            document.getElementById('share-personality').textContent = `${prefix}｜${suffix}`;

            // 強制填充至 9 個格子，不足的留白
            grid.innerHTML = '';
            const loadPromises = [];

            for (let i = 0; i < 9; i++) {
                const slot = document.createElement('div');
                    slot.className = 'aspect-square bg-white/10 rounded-[45px] overflow-hidden border-2 border-white/20 ';
                    slot.style.filter = 'drop-shadow(0 15px 20px rgba(0, 0, 0, 0.15))';
                    // 取得圖片網址：優先使用處理過的 b64，其次是原始網址
                    const imageUrl = base64Photos[i] || photoItems[i]?.image;

                    if (imageUrl) {
                        const img = new Image();
                        img.className = 'w-full h-full object-cover';
                        
                        // 建立 Promise 確保這張圖「下載」且「解碼」完成
                        const p = new Promise((resolve) => {
                            img.onload = async () => {
                                // 針對 iOS/Safari 的關鍵優化：確保圖片解碼完成
                                if ('decode' in img) {
                                    try {
                                        await img.decode();
                                    } catch (e) {
                                        console.warn("Decode failed", e);
                                    }
                                }
                                resolve();
                            };
                            img.onerror = resolve; // 失敗也要繼續
                        });
                        loadPromises.push(p);
                        img.src = imageUrl;
                        slot.appendChild(img);
                    } else {
                        // 剩餘留白處理
                        slot.innerHTML = `<div class="w-full h-full"></div>`;
                    }
                grid.appendChild(slot);
            }

            requestAnimationFrame(async () => {
                try {
                    const node = document.getElementById('share-card');
                    
                    // 核心修正：等待圖片載入 + 字體就緒 + 給予瀏覽器額外 1000ms 渲染圖層
                    await Promise.all([...loadPromises, document.fonts.ready]);
                    
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    const dataUrl = await htmlToImage.toPng(node, { 
                        width: 1080, 
                        height: 1920,
                        pixelRatio: 1, 
                        cacheBust: true,
                        includeGraphics: true,
                        fontEmbedCSS: "",
                        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    });
                    
                    finalCardCache.set(cacheKey, dataUrl);
                    
                    resultBox.innerHTML = `<img src="${dataUrl}" class="w-full h-full shadow-2xl animate-card">`;
                    document.getElementById('download-trigger').onclick = () => {
                        const link = document.createElement('a');
                        link.download = `Report_${state.filterYear}_${state.filterMonth}.png`;
                        link.href = dataUrl;
                        link.click();
                    };
                } catch (err) {
                    showToast("生成失敗");
                    modal.classList.add('hidden');
                }
            });
        }

// 掛載到全域（若 HTML 仍有 onclick 呼叫）
window.compressImage = compressImage;