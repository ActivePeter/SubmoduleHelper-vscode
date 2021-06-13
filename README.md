# submodule-helper README

A vscode extension to help organize and load submodules easily

## developement

1. ### pack

   vsce package

2. ### first open

   npm install

## install

You can download it from [releases](https://github.com/ActivePeter/SubmoduleHelper-vscode/releases/tag/0.06).

## use

1. ### Create a file in root path 

   submodule_helper.json

2. ### Add following json like structure into file

   ```json
   {
       "root_folder": "./",
       "submodules_structure": {
       }
   }
   ```

   The root folder is where the submodules will be loaded in

3. ### Add your submodules like following

   ```json
   {
       "root_folder": "./",
       "submodules_structure": {
           "paLibSubs": [
               {
                   "used": 1,
                   "git": "https://github.com/paMcuLib/paMcuLib_CoreHeads.git"
               },
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

   In above "submodules_structure" , we added 2 repos.

   **The keys**---"paLibSubs","paLibSubs/paMods/display"---represent the relative path to "root_folder" that your submodules will be in.

   **"used"**   represents if you need to load it

   **"git"**   represents your submodule repo

   **"rename"**   represents the folder name of your submodule you want to change to. This part is not necessary to write, if you don't write it, it will be load as it's own name in URI.

4. ### Run update command

   ![image-20210613182450877](https://hanbaoaaa.xyz/tuchuang/images/2021/06/13/image-20210613182450877.png)

   `ctrl +shift+p`  and type `subhelper`,then type `enter`

   It will automatically run and load your submodules.

   ![image-20210613182649456](https://hanbaoaaa.xyz/tuchuang/images/2021/06/13/image-20210613182649456.png)

