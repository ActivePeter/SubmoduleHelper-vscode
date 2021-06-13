[English](./README.md)

# submodule-helper README

一个vscode插件帮你轻松地管理和加载子模块

## 开发

1. ### 打包

   vsce package

2. ### 第一次打开项目

   npm install

## 安装

你可以从 [releases](https://github.com/ActivePeter/SubmoduleHelper-vscode/releases/tag/0.06) 里下载到最新版

## 使用

1. ### 在根目录创建文件

   submodule_helper.json

2. ### 添加如下的json结构到文件里

   ```json
   {
       "root_folder": "./",
       "submodules_structure": {
       }
   }
   ```

   根文件夹是子模块将要被加载到的地方

3. ### 如下添加你的子模块信息

   ```json
   {
       "root_folder": "./",
       "submodules_structure": {
           "paLibSubs": [
               {
                   "used": 1,
                   "git": "https://github.com/paMcuLib/paMcuLib_CoreHeads.git"
               },
               {
                   "used": 1,
                   "git": "https://github.com/paMcuLib/paMcuLibCore_Esp32.git"
               }
           ],
           "paLibSubs/paMods/display": [
               {
                   "used": 0,
                   "rename": "SSD1306",
                   "git": "https://github.com/pa-McuLib-parts/ssd1306_pa_CommonLib.git"
               }
           ]
       }
   }
   ```

   在上面这个例子的 "submodules_structure"中，我们添加了3个仓库

   **The keys**---"paLibSubs","paLibSubs/paMods/display"---代表相对与"root_folder"的相对路径你的仓库要被加入的地方

   **"used"**   代表你是否需要加载这个模块

   **"git"**   代表你的子模块仓库地址

   **"rename"**   代表你的子模块要改写的的文件夹名称。这一项可以不写，然后会使用默认的仓库链接名称

4. ### Run update command

   ![image-20210613182450877](https://hanbaoaaa.xyz/tuchuang/images/2021/06/13/image-20210613182450877.png)

   `ctrl +shift+p`  然后输入 `subhelper`  然后 `enter`回车

   它会自动运行并且加载你的子模块

   ![image-20210613182649456](https://hanbaoaaa.xyz/tuchuang/images/2021/06/13/image-20210613182649456.png)

