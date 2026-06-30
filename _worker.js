// 在代码最外层定义内存变量（重启或重新部署后会清零）
let failedAttempts = 0;
let blockUntil = 0;
const BLOCK_DURATION = 60 * 60 * 1000; // 封堵时间：1小时 (毫秒)

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // 拦截所有针对 /api/ 开头的请求
        if (url.pathname.startsWith('/api/')) {
            
            // 页面需要读取数据渲染，GET 请求一律放行
            if (request.method === 'GET') {
                try {
                    const data = await env.NAV_DATA.get("categories_data");
                    return new Response(data || '{"categories": []}', { 
                        headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                } catch (e) {
                    return new Response('{"error": "KV 读取异常"}', { status: 500 });
                }
            }

            // 对所有 POST 请求（上传更新、下载备份）进行防刷拦截
            if (request.method === 'POST') {
                const now = Date.now();

                // 1. 检查是否处于封堵期
                if (now < blockUntil) {
                    const remainMinutes = Math.ceil((blockUntil - now) / 60000);
                    return new Response(JSON.stringify({ 
                        success: false, 
                        message: `系统安全锁定中，请 ${remainMinutes} 分钟后再试！` 
                    }), { 
                        status: 429, // 429 Too Many Requests
                        headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                } else if (blockUntil !== 0) {
                    // 封堵期已过，自动重置状态
                    failedAttempts = 0;
                    blockUntil = 0;
                }

                // 2. 校验密钥
                const authHeader = request.headers.get("Authorization");
                if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
                    // 密钥错误，增加计数
                    failedAttempts++;
                    
                    if (failedAttempts >= 5) {
                        blockUntil = now + BLOCK_DURATION; // 触发 1 小时封堵
                        return new Response(JSON.stringify({ 
                            success: false, 
                            message: `连续错误 5 次，后台已锁定 1 小时！` 
                        }), { 
                            status: 401, headers: { "Content-Type": "application/json;charset=UTF-8" } 
                        });
                    }

                    // 还没到 5 次，提示剩余次数
                    return new Response(JSON.stringify({ 
                        success: false, 
                        message: `密钥错误！再错 ${5 - failedAttempts} 次将锁定后台。` 
                    }), { 
                        status: 401, headers: { "Content-Type": "application/json;charset=UTF-8" } 
                    });
                }

                // 3. 密钥校验通过，状态重置，防止误杀
                failedAttempts = 0;
                blockUntil = 0;

                /* ================= 具体的业务逻辑 ================= */
                
                // 处理后台上传更新的请求
                if (url.pathname === '/api/data') {
                    try {
                        const body = await request.text();
                        JSON.parse(body); // 校验合法性
                        await env.NAV_DATA.put("categories_data", body);
                        return new Response(JSON.stringify({ success: true, message: "数据已成功更新到云端！" }), { 
                            headers: { "Content-Type": "application/json;charset=UTF-8" } 
                        });
                    } catch (e) {
                        return new Response(JSON.stringify({ success: false, message: "JSON 解析失败或写入异常" }), { status: 400 });
                    }
                }

                // 处理安全下载的请求
                if (url.pathname === '/api/download') {
                    try {
                        const data = await env.NAV_DATA.get("categories_data");
                        return new Response(data || '{"categories": []}', { 
                            headers: { 
                                "Content-Type": "application/json;charset=UTF-8",
                                "Content-Disposition": 'attachment; filename="data_backup.json"'
                            } 
                        });
                    } catch (e) {
                        return new Response(JSON.stringify({ success: false, message: "KV 数据读取异常" }), { status: 500 });
                    }
                }
                
                return new Response('{"error": "Method not allowed"}', { status: 405 });
            }
        }

        // 如果不是 API 请求，直接交还给正常的静态托管
        return env.ASSETS.fetch(request);
    }
};