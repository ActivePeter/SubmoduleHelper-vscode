"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shell = exports.doAndclearShell = exports.addCallback = exports.addShell = exports.shellWithCallback = void 0;
const vscode = require("vscode");
const main = require("./extension");
let hasChannel = false;
let channel;
function Uint8ArrayToString(fileData) {
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }
    return dataString;
}
function shellWithCallback(cmd, callback) {
}
exports.shellWithCallback = shellWithCallback;
let cmds = [];
let callbacks = {};
function addShell(cmd) {
    cmds.push(cmd);
}
exports.addShell = addShell;
function addCallback(callback) {
    callbacks[cmds.length - 1] = callback;
}
exports.addCallback = addCallback;
function doAndclearShell(index) {
    console.log("doAndclearShell", index, ", cmds", cmds.length);
    if (!hasChannel) {
        hasChannel = true;
        channel = vscode.window.createOutputChannel("SubHelper");
    }
    channel.show();
    function end() {
        index++;
        if (index < cmds.length) {
            doAndclearShell(index);
        }
        else {
            //end
            channel.appendLine(" ");
            channel.appendLine("--- end ---");
            channel.appendLine(" ");
            cmds = [];
            callbacks = {};
            main.notify("完成更新");
        }
    }
    // for (let i = 0; i < cmds.length; i++) {
    // shell(cmds[i])
    ///////////////////////////////////////////////////////////////
    if (typeof cmds[index] == "function") {
        console.log("cmd is func ");
        channel.appendLine("run cmd: " + cmds[index]);
        try {
            cmds[index]();
        }
        catch (error) {
            console.log(error);
        }
        // index++
        end();
    }
    else {
        console.log("cmd is str ");
        const cp = require('child_process');
        channel.appendLine("run cmd: " + cmds[index]);
        try {
            cp.exec('powershell ' + cmds[index], { env: Object.assign(Object.assign({}, process.env), { ELECTRON_RUN_AS_NODE: '' }), cwd: main.wsPath }, (err, stdout) => {
                console.log("_doAndclearShell", index, ", cmds", cmds.length);
                if (callbacks[index]) {
                    callbacks[index]();
                }
                // if (err) {
                //     console.log(err)
                //     // notify(err)
                // } else {
                //     // console.log("delete ", totalPath)
                // }
                end();
            });
        }
        catch (error) {
            console.log("__doAndclearShell", index, ", cmds", cmds.length);
            // index++
            end();
        }
    }
    ////////////////////////////////////////////////////////////////
    // }
}
exports.doAndclearShell = doAndclearShell;
function shell(cmd) {
    if (!hasChannel) {
        hasChannel = true;
        channel = vscode.window.createOutputChannel("SubHelper");
    }
    channel.show();
    channel.appendLine(cmd);
    main.notify("正在执行：" + cmd);
    const cp = require('child_process');
    // await vscode.workspace.fs.delete(uri3)
    // fh.delUriRF(uri3)
    //删除.git/module中的文件夹
    try {
        let ret = cp.execSync('powershell ' + cmd, { env: Object.assign(Object.assign({}, process.env), { ELECTRON_RUN_AS_NODE: '' }), cwd: main.wsPath });
        ret = Uint8ArrayToString(ret);
        channel.appendLine("    state: " + ret);
        channel.show();
        console.log('cmdret', (ret));
    }
    catch (error) {
        console.error(error);
    }
    channel.appendLine("-----------");
    // let terminal = null
    // for (let i = 0; i < vscode.window.terminals.length; i++) {
    //     if (vscode.window.terminals[i].name == "SubHelper") {
    //         terminal = vscode.window.terminals[i]
    //         break;
    //     }
    // }
    // if (!terminal) {
    //     terminal = vscode.window.createTerminal("SubHelper")
    // }
    // terminal.sendText(cmd)
    // if(vscode.window.createOutputChannel)
}
exports.shell = shell;
//# sourceMappingURL=Cmds.js.map