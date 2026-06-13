// api/rates.js
export default async function handler(req, res) {
    const base = req.query.base || 'TWD';

    // 簡單白名單，避免被當成任意代理亂打
    const ALLOWED_CURRENCIES = ['TWD','HKD','USD','JPY','KRW','CNY','MYR','SGD','THB'];
    if (!ALLOWED_CURRENCIES.includes(base)) {
        return res.status(400).json({ error: 'invalid base currency' });
    }

    const apiKey = process.env.EXCHANGE_RATE_API_KEY; // 金鑰只存在伺服器端

    try {
        const apiRes = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
        const data = await apiRes.json();

        if (!data?.conversion_rates) {
            return res.status(502).json({ error: 'upstream error' });
        }

        const rates = {
            KRW: 1 / data.conversion_rates.KRW,
            JPY: 1 / data.conversion_rates.JPY,
            CNY: 1 / data.conversion_rates.CNY,
            USD: 1 / data.conversion_rates.USD,
            HKD: 1 / data.conversion_rates.HKD,
            MYR: 1 / data.conversion_rates.MYR,
            SGD: 1 / data.conversion_rates.SGD,
            THB: 1 / data.conversion_rates.THB,
            TWD: 1 / data.conversion_rates.TWD,
        };

        // 加上 cache header，減少重複打上游 API（5 天內重複請求會用 CDN 快取）
        res.setHeader('Cache-Control', 's-maxage=432000, stale-while-revalidate');
        return res.status(200).json({ rates });
    } catch (e) {
        console.error('rates proxy error', e);
        return res.status(500).json({ error: 'fetch failed' });
    }
}