/**
 * constants.js - 存放固定不變的常數設定
 */
    export const baseCategories = {
            categories : [
            { id: '專輯', icon: '🎵', color: '#6366f1' },            
            { id: '小卡', icon: '✨', color: '#eab308' },               
            { id: '演唱會 / 見面會門票', icon: '🎫', color: '#f43f5e' },  
            { id: '周邊商品', icon: '💍', color: '#0ea5e9' },     
            { id: '娃娃', icon: '🧸', color: '#f97316' },               
            { id: '會員費', icon: '🫧', color: '#8b5cf6' },   
            { id: '應援物 / 飯製商品', icon: '🪄', color: '#d946ef' },          
            { id: '交通 / 住宿', icon: '✈️', color: '#10b981' },
            { id: '聯名商品', icon: '🏷️', color: '#f472b6' },          
            { id: '其他追星支出', icon: '🌈', color: '#64748b' }           
            ],
            categoriesACGN : [
                { id: '漫畫 / 輕小說', icon: '📖', color: '#6366f1' },        
                { id: '立牌 / 吊飾', icon: '🪧', color: '#f59e0b' },          
                { id: '小卡 / 色紙', icon: '🃏', color: '#d946ef' },          
                { id: '明信片 / 海報', icon: '🖼️', color: '#ec4899' },       
                { id: '徽章 / 壓克力', icon: '📍', color: '#0ea5e9' },        
                { id: '公仔 / 娃娃', icon: '🧸', color: '#f97316' },          
                { id: '一番賞', icon: '🎯', color: '#eab308' },              
                { id: '聯名服飾', icon: '👕', color: '#22c55e' },     
                { id: '應援物 / 飯製商品', icon: '🪄', color: '#d946ef' },         
                { id: '活動門票 / 展覽 / 電影票', icon: '🎟️', color: '#f43f5e' }, 
                { id: '其他支出', icon: '📦', color: '#64748b' }             
            ]
        };
    export const wishCategories = ["專輯", "周邊商品", "娃娃", "小卡","演唱會 / 見面會門票"];
    export const wishCategoriesACGN = ["漫畫 / 輕小說", "立牌 / 吊飾", "小卡 / 色紙","明信片 / 海報","徽章 / 壓克力","公仔 / 娃娃","其他周邊"];
    export const arrivalOptions = ['未到貨','待二補', '待出貨', '已取貨','已售出'];
    export const paymentOptions = ['待付款', '貨到付款', '匯款全額', '已付訂金','信用卡','現金','無卡'];
    export const excelHeaderMap = {
            type: "收支類型",name: "項目名稱", price: "單價", qty: "數量",shipping:"運費",category: "分類",
            year: "消費年份", month: "消費月份",day:"消費日期", platform: "收物平台",
            arrivalStatus: "到貨狀態", paymentMethod: "付款方式", paidAmount: "已付金額", tags: "標籤", remark: "備註"
        };

    window.baseCategories = baseCategories;
    window.wishCategories = wishCategories;
    window.wishCategoriesACGN = wishCategoriesACGN;
    window.arrivalOptions = arrivalOptions;
    window.paymentOptions = paymentOptions;
    window.excelHeaderMap = excelHeaderMap;