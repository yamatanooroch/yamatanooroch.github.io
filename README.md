## 介绍 | Introduction
一个**通用的个人主页模板**

## 快速开始 | Getting Start
### 1. Fork 该仓库 | Fork this repository
仓库名称应命名为 `<用户名>.github.io`，这样你的个人网站地址将是 `https://<用户名>.github.io/`。

The repository name should be `<username>.github.io`, which will also be your website's URL.


### 2.  编辑页面内容 | Edit page content
(1) 进入你想存放项目的文件夹，并克隆新的仓库 | Go to the folder where you want to store your project, and clone the new repository:
```
git clone https://github.com/<username>/<username>.github.io.git
```
项目的目录结构如下 | The directory structure is as follows:

```.
.
├── contents
└── static
    ├── assets
    │   └── img
    ├── css
    └── js
```

(2) 修改各个板块的内容 | Modify the content of each section, which corresponds to `contents/*.md`.

(3) 调整网站设置 | Adjust the title, copyright information, and other text of the website in `contents/config.yml`

(4) 替换图片 | Replace background image and photo with new ones for your web pages in `static/assets/img/`

(5) 提交更改 | Push it: 
```
git commit -am 'init'
git push
```


### 3. 访问你的网站 | Enjoy

打开浏览器，访问 https://<用户名>.github.io，即可查看你的个人主页

Fire up a browser and go to `https://<username>.github.io`

