import * as vscode from 'vscode';
import * as main from './extension'

let hasChannel = false
let channel: vscode.OutputChannel
function Uint8ArrayToString(fileData: Uint8Array) {
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }

    return dataString

}

export function shellWithCallback(cmd: string, callback: any) {

}

let cmds: string[] = []
let callbacks: any = {}
export function addShell(cmd: string) {
    cmds.push(cmd)
}

export function addCallback(callback: any) {
    callbacks[cmds.length - 1] = callback
}
export function doAndclearShell(index: number) {
    console.log("doAndclearShell", index, ", cmds", cmds.length)
    if (!hasChannel) {
        hasChannel = true
        channel = vscode.window.createOutputChannel("SubHelper")

    }
    channel.show()


    // for (let i = 0; i < cmds.length; i++) {
    // shell(cmds[i])
    ///////////////////////////////////////////////////////////////
    const cp = require('child_process')
    channel.appendLine("run cmd: " + cmds[index])
    try {
        cp.exec('powershell ' + cmds[index], { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: main.wsPath }, (err: any, stdout: any) => {
            console.log("_doAndclearShell", index, ", cmds", cmds.length)
            if (callbacks[index]) {
                callbacks[index]()
            }
            // if (err) {
            //     console.log(err)
            //     // notify(err)
            // } else {
            //     // console.log("delete ", totalPath)
            // }
            index++
            if (index < cmds.length) {

                doAndclearShell(index)
            } else {
                //end
                channel.appendLine(" ")
                channel.appendLine("--- end ---")
                channel.appendLine(" ")
                cmds = []
                callbacks = {}
            }
        })
    } catch (error) {
        console.log("__doAndclearShell", index, ", cmds", cmds.length)
        index++
        if (index < cmds.length) {
            doAndclearShell(index)
        }
    }

    ////////////////////////////////////////////////////////////////
    // }
}

export function shell(cmd: string) {
    if (!hasChannel) {
        hasChannel = true
        channel = vscode.window.createOutputChannel("SubHelper")

    }
    channel.show()
    channel.appendLine(cmd)
    main.notify("正在执行：" + cmd)
    const cp = require('child_process')


    // await vscode.workspace.fs.delete(uri3)
    // fh.delUriRF(uri3)
    //删除.git/module中的文件夹
    try {
        let ret = cp.execSync('powershell ' + cmd, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: main.wsPath })
        ret = Uint8ArrayToString(ret)
        channel.appendLine("    state: " + ret)
        channel.show()
        console.log('cmdret', (ret))
    } catch (error) {
        console.error(error)
    }
    channel.appendLine("-----------")

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