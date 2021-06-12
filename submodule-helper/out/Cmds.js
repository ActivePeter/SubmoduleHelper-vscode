"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shell = void 0;
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