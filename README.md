# submodule_selector(子模块选择器)

#### ***project classification* (项目分类):** 

cs_little_prjs

----

#### **intro(介绍):**

**A vscode extension**

When I was writing SCM in 2020, I had the idea of building a universal library for SCM, and I wrote one. The general principle is to add this universal library to the newly built SCM project based on Git Submodule, and divide it into many small Git Submodules under this universal library.But when using it this time, it occurred to me how to optionally load the required parts instead of dropping all the submodules,

`git submodule update --init -- <specific relative path to submodule>`

I'm going to write a vscode plugin that uses the interface to select the submodule that needs to be loaded and saves a local configuration file that describes the submodules on which the project depends

**一个vscode插件**

我在2020年那段时间写单片机的时候，有了构建一个单片机通用库的想法，并且写了一个出来，大概原理就是基于git submodule，来添加这个通用库到新建的单片机项目里，同时在这个通用库下又分成很多小的git submodule，但是在这次使用的时候，突然想到怎么样才能做到可选的去加载需要的部分，而不是把所有submodule 弄下来，

`git submodule update --init -- <specific relative path to submodule>`

以上那句话就可以实现，不过我觉得还是不太够，我准备之后写一个vscode插件，通过界面来选择需要加载的submodule，并且在本地保存一个配置文件，来描述这个项目所依赖到的submodules

----

