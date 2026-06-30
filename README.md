# Nav-Cloudflare

> 一个完全构建在 [Cloudflare](https://www.cloudflare.com?utm_source=chatgpt.com)  生态上的极简个人导航收藏网站。

Nav-Cloudflare 是一个轻量、高效、易部署的个人导航站项目，专门用于管理和展示你的收藏链接、工具网站、学习资源或常用平台。

项目基于 Cloudflare 的基础设施构建，无需传统服务器，部署成本极低，访问速度快，维护简单。

访问人数是自娱自乐的，看看就好，想要真实的访问人数的也可以直接将源码拉进AI，让AI完善就可以了。

演示地址：https://marks.989886.xyz/
---

## ✨ 项目特点

* 🚀 **完全基于 Cloudflare 构建**

  * 使用 Cloudflare Pages 部署前端
  * 使用 Cloudflare KV 存储导航数据
  * 无需数据库，无需服务器
  * 暴力防刷===

* 🌙 **支持深色 / 浅色模式**

  * 自动切换主题
  * 提供更舒适的浏览体验

* 📁 **支持 JSON 导入**

  * 可直接上传 `JSON` 格式收藏数据
  * 适合批量导入导航内容

* 🔄 **自动更新导航数据**

  * 上传后自动同步
  * 无需手动修改页面代码

* 🔒 **支持后台管理保护**

  * 使用环境变量配置管理员密钥
  * 增强数据安全性

* ⚡ **全球 CDN 加速**

  * 借助 Cloudflare 全球网络实现高速访问

---

## 📦 技术架构

* **Frontend**: HTML / CSS / JavaScript
* **Hosting**: Cloudflare Pages
* **Storage**: Cloudflare KV

整体架构极简：

User → Cloudflare Pages → Cloudflare KV

页面负责展示，KV 负责存储收藏数据。

---

# 📂 数据格式

导航数据使用 JSON 格式存储，例如：

```json
{
  "categories": [
    {
      "id": "out",
      "name": "站外资源",
      "groups": [
        {
          "name": "搜索类",
          "items": [
            { "name": "Google", "url": "https://www.google.com" },
            { "name": "百度", "url": "https://www.baidu.com" },
            { "name": "必应", "url": "https://cn.bing.com" }
          ]
        }
      ]
    }
    
  ]
}
```

上传后，网站会自动读取并更新内容。

---

# 🚀 部署教程

## Step 1：创建 KV 存储

登录 [Cloudflare Dashboard](https://dash.cloudflare.com?utm_source=chatgpt.com)

进入：

Workers & Pages → KV

创建一个新的 KV Namespace：

* Namespace Name：

```bash
NAV_DATA
```

添加数据：

* Key：

```bash
categories_data
```

* Value：
  可以为空，或者直接填入你的 `data.json` 内容。

---

## Step 2：上传源码到 Pages

将项目源码上传到 cloudflare的pages。

然后直接部署

---

## Step 3：绑定 KV 到 Pages

进入 Pages 项目设置：

Settings → Bindings

添加 KV Binding：

* Variable Name：

```bash
NAV_DATA
```

* KV Namespace：

选择刚刚创建的 `NAV_DATA`

注意：变量名必须保持一致。

---

## Step 4：配置环境变量

进入：

Settings → Variables and Secrets

添加以下变量：

### Variable / Secret Name

```bash
ADMIN_SECRET
```

Value：

```bash
填写你自己的管理员密钥
```

例如：

```bash
my_admin_password_123
```

建议使用高强度随机字符串。

---

## Step 5：重新部署

完成所有配置后：

* 保存设置
* 重新部署 Pages

让 KV 和环境变量正式生效。

---

# ✅ 部署完成

部署成功后，你将获得一个：

* 极简
* 美观
* 高性能
* 可动态更新

的个人导航收藏网站。

无论是：

* 收藏常用网站
* 整理开发工具
* 管理学习资源
* 搭建个人导航页

Nav-Cloudflare 都是一个非常不错的选择。
