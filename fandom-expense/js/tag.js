/**
 * tags.js - 智慧標籤建議系統
 */
import { state } from './state.js';
        const PREDEFINED_TAGS = ["待二補", "不須二補", "線上購買", "線下購買", "SEVENTEEN"];
        // 初始化智慧標籤
        function initSmartTags(initialTags = []) {
            const container = document.getElementById('m-tag-container');
            const input = document.getElementById('m-tag-input');
            const suggestionsList = document.getElementById('m-tag-suggestions');
            if (!container || !input) return () => [];

            let selectedTags = Array.isArray(initialTags) ? [...initialTags] : [];

            const renderChips = () => {
                container.querySelectorAll('.tag-chip').forEach(el => el.remove());
                selectedTags.forEach((tag, index) => {
                    const chip = document.createElement('div');
                    chip.className = 'tag-chip flex items-center bg-slate-100 text-brand px-2 py-1 rounded-lg text-xs font-bold';
                    chip.innerHTML = `${tag}<span class="ml-1 cursor-pointer hover:text-red-500" onclick="event.stopPropagation(); window.removeSmartTag(${index})">✕</span>`;
                    container.insertBefore(chip, input);
                });
            };

            window.removeSmartTag = (index) => {
                selectedTags.splice(index, 1);
                renderChips();
            };

            const addSmartTag = (content) => {
                const clean = content.replace(/[,，]/g, '').trim();
                if (clean && !selectedTags.includes(clean)) {
                    selectedTags.push(clean);
                    renderChips();
                }
                input.value = '';
                suggestionsList.classList.add('hidden');
            };

            window.addSmartTagByClick = (val) => addSmartTag(val);
            // 監聽輸入行為：處理逗號與建議清單
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                // 1. 偵測逗號自動加入
                if (val.endsWith(',') || val.endsWith('，')) {
                    addSmartTag(val);
                    return;
                }
                // 2. 顯示建議清單 (PREDEFINED_TAGS 邏輯)
                const query = val.trim();
                if (!query) {
                    suggestionsList.classList.add('hidden');
                    return;
                }
                const dynamicPool = [...new Set(state.expenses.flatMap(ex => ex.tags || []))];
                // 合併預設標籤與從消費紀錄中提取的標籤
                const combinedPool = [...new Set([...PREDEFINED_TAGS, ...dynamicPool])];
                const matches = combinedPool.filter(t => 
                    t.toLowerCase().includes(query.toLowerCase()) && !selectedTags.includes(t)
                );
                if (matches.length > 0) {  
                    suggestionsList.innerHTML = matches.map(m => {
                        const isDynamic = !PREDEFINED_TAGS.includes(m);
                        return `<li class="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-gray-700 border-b border-slate-50 last:border-0 font-medium flex justify-between items-center" onclick="window.addSmartTagByClick('${m}')">
                            <span>${m.replace(new RegExp(`(${query})`, 'gi'), `<span class="text-brand font-bold">$1</span>`)}</span>
                            ${isDynamic ? '<span class="text-[9px] text-slate-300 italic">已使用過</span>' : ''}
                        </li>`;
                    }).join('');
                    suggestionsList.classList.remove('hidden');
                } else {
                    suggestionsList.classList.add('hidden');
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addSmartTag(input.value);
                } else if (e.key === 'Backspace' && !input.value && selectedTags.length > 0) {
                    selectedTags.pop();
                    renderChips();
                }
            });
            // 點擊外部關閉建議
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) suggestionsList.classList.add('hidden');
            });

            renderChips();
            return () => selectedTags; 
        }

window.initSmartTags = initSmartTags;