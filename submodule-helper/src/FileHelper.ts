import * as vscode from 'vscode';
import * as fs2 from 'fs';
import * as path2 from 'path';

export async function readFile(uri: vscode.Uri) {
    return vscode.workspace.openTextDocument(uri)
    // let wsedit = new vscode.WorkspaceEdit();
    // return wsedit.get(url)
}

export async function connectUri(uri: vscode.Uri, file: string) {
    return vscode.Uri.file(uri.path + "/" + file);
}

export async function delUriRF(path: vscode.Uri, cmds: Array<any>) {
    let fs = vscode.workspace.fs
    // 第一步读取文件内部的文件
    try {
        let arr = await fs.readDirectory(path);
        let wsPath;
        console.log("delUriRF")
        const cp = require('child_process')
        if (vscode.workspace.workspaceFolders) {
            wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

            // console.log(arr);
            // 遍历数组
            for (let i = 0; i < arr.length; i++) {
                // let uri=vscode.Uri.file(path + '/' + arr[i])
                // 获取文件的状态
                // let stat = fs.readFile(uri);
                // 判断是文件还是文件夹
                let uri = vscode.Uri.file(path.path + '/' + arr[i][0])
                if (arr[i][1] == 2) {
                    // 说明是文件夹  递归调用
                    // cp.execSync('powershell del ' + uri.fsPath + "/*" + " -y", { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
                    //     if (err) {
                    //         console.log(err)
                    //         // notify(err)
                    //     } else {
                    //         // console.log("delete ", totalPath)
                    //     }

                    // })

                    await delUriRF(uri, cmds)
                    // await delUriRF(uri);
                } else {
                    console.log("del: ", uri.fsPath)
                    // terminal.sendText
                    // cmds.push('del ' + uri.fsPath + ' -recurse')
                    cmds.push(() => {
                        fs2.rmSync(uri.fsPath)
                    })
                    // cp.execSync('powershell del ' + uri.fsPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
                    //     if (err) {
                    //         console.log(err)
                    //         // notify(err)
                    //     } else {
                    //         // console.log("delete ", totalPath)
                    //     }

                    // })
                    // 说明是文件
                    // fs.unlinkSync(path + '/' + arr[i]);
                    // fs.
                    // await fs.delete(uri)
                }
            }

            // 遍历完成之后 删除最外层的文件
            // terminal.sendText
            // cmds.push('del ' + path.fsPath + ' -recurse')
            cmds.push(() => {
                fs2.rmdirSync(path.fsPath)
            })
            // cp.execSync('powershell del ' + path.fsPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
            //     if (err) {
            //         console.log(err)
            //         // notify(err)
            //     } else {
            //         // console.log("delete ", totalPath)
            //     }

            // })
        }
        return
    } catch (error) {
        return
    }


}


