# 基于 nodejs 的立马理财爬虫项目

> 技术分析，详见我的[博客](https://www.wty90.com/2018/01/17/lmlc-spider/)

## 一、工程目录分析

data是爬虫爬取数据后存储的文件夹

dist是前端js、css打包的目录

public存放一些公共文件

server是后台代码目录
* user.js是首页用户购买ajax接口爬虫代码
* product.js是理财页产品ajax接口爬虫代码
* record.js是详情页投资记录同步页面爬虫代码
* getCookie.js是测试爬虫带cookie模拟登录代码
* dataHandle.js是处理数据得到销售额的代码
* lmlcSpider.js是将上述爬虫代码整合在一起的最终线上用的爬虫代码

spider存放爬虫代码的目录

src前端工程目录

views存放html模板

## 二、项目运行
1. 下载chrome插件[LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)

2. 修改views文件夹里的index.html和detail.html文件。
* 如果是本地调试，index.js都要改成`http://localhost:8080/dist/index.js`  
* 如果是其他设备访问，则改成`your_ip_addr:5000/dist/index.js`
* index.css一样。 

3. 运行方式
```
npm run dev
npm run server // 需要带登录的账号和密码参数
npm run spider // 爬虫代码
```

4. 测试学习各页面的爬虫代码
```
npm run user  // 爬取立马理财首页的用户购买信息ajax接口
npm run product  // 爬取立马理财理财页所有产品的ajax接口
npm run record  // 爬取立马理财产品详情页的投资记录同步页面数据
```
