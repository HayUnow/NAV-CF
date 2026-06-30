export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 1. 专门拦截并处理我们的 API 请求
        if (url.pathname === '/api/data') {
            
            // 处理前端页面读取数据的请求 (GET)
            if (request.method === 'GET') {
                try {
                    const data = await env.NAV_DATA.get("categories_data");
                    return new Response(data || '{"categories": []}', { 
                        headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                } catch (e) {
                    return new Response('{"error": "KV 未绑定或异常"}', { 
                        status: 500, headers: { "Content-Type": "application/json" } 
                    });
                }
            }

            // 处理后台上传更新的请求 (POST)
            if (request.method === 'POST') {
                const authHeader = request.headers.get("Authorization");
                if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
                    return new Response(JSON.stringify({ success: false, message: "拒绝访问：密钥错误或未授权！" }), { 
                        status: 401, headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                }
                
                try {
                    const body = await request.text();
                    JSON.parse(body); // 校验合法性
                    await env.NAV_DATA.put("categories_data", body);
                    return new Response(JSON.stringify({ success: true, message: "数据已成功更新到云端！" }), { 
                        headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                } catch (e) {
                    return new Response(JSON.stringify({ success: false, message: "JSON 解析失败或写入异常" }), { 
                        status: 400, headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                }
            }
            return new Response('{"error": "Method not allowed"}', { status: 405 });
        }

        // 2. 如果不是 API 请求（比如访问 index.html, favicon.ico），直接交还给正常的静态托管
        return env.ASSETS.fetch(request);
    }
};