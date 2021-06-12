// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fh from './FileHelper';
import * as CMD from './Cmds'
const _appName = "SubHelper"
const jsonName = "submodule_helper.json"
export let wsPath = ""
//1.找json文件
async function findJson(uristr: string) {
	const uri = vscode.Uri.file(uristr);
	let someArray = await vscode.workspace.fs.readDirectory(uri)

	for (let i = 0; i < someArray.length; i++) {
		let curArray = someArray[i]
		// console.log(someArray[i])
		if (curArray[1] == 1 && curArray[0] == jsonName) {
			// hasVscodeFolder = true
			console.log("json found")
			let fileUri = await fh.connectUri(uri, jsonName)
			let file = await fh.readFile(fileUri)
			analyzeJson(file.getText())
			break;
		}
	}

}
// 2.分析数据
async function analyzeJson(text: string) {
	console.log("json is:", text)
	try {
		let object = JSON.parse(text)
		analyzeJsonObj(object)

	} catch (error) {
		console.log('出错了，文件不是合理的json格式')
		vscode.window.showInformationMessage('出错了，文件不是合理的json格式');
	}
}
function getStandardPath(path: string) {
	if (path[0] == '.') {
		path = path.substring(1)
	}
	if (path[0] == '/') {
		path = path.substring(1)
	}
	return path

}
//3 分析解析出的obj
async function analyzeJsonObj(obj: any) {
	// let terminal = null
	// for (let i = 0; i < vscode.window.terminals.length; i++) {
	// 	if (vscode.window.terminals[i].name == "SubHelper") {

	// 		terminal = vscode.window.terminals[i]
	// 		break;
	// 	}


	// }
	// if (!terminal) {
	// 	terminal = vscode.window.createTerminal("SubHelper")
	// }

	// terminal.show()
	if (obj.root_folder && obj.submodules_structure) {
		// vscode.window.showInformationMessage('SubHelper 开始更新');
		notify("开始更新")
		let olds = await getOldModulesList()
		let deinitRepos = []
		let reloadRepos = []
		for (var key in obj.submodules_structure) {
			let curPath = obj.root_folder + key
			if (curPath[curPath.length - 1] != '/') {
				curPath += "/"
			}
			let repoArr = obj.submodules_structure[key]
			console.log("curPath", curPath)
			for (let i = 0; i < repoArr.length; i++) {
				let curRepoInfo = repoArr[i]

				// if (curRepoInfo.used) {
				if (curRepoInfo.git) {
					let rename: string = ""
					let git: string = curRepoInfo.git
					let split1 = git.split("/")

					let split2 = split1[split1.length - 1].split(".git")
					if (split2 && split2.length > 0) {
						if (curRepoInfo.rename) {
							rename = curRepoInfo.rename
						} else {
							rename = split2[0]
						}
						if (curRepoInfo.used) {
							const cp = require('child_process')
							console.log("running cmd:", 'git submodule add -f ' + curRepoInfo.git + " " + curPath + rename)
							/**
							 * 将当前遍历到的从olds中删除，
							 * 最后olds剩下的就是需要删掉的仓库，
							 *  */
							olds = deleteOneIfHas_thenReturn(olds, getStandardPath(curPath + rename))

							//////
							let repoNoChange = await checkInModuleFile(curPath + rename, curRepoInfo.git)
							// if (repoNoChange == -1) {//新加入
							// 	terminal.sendText('git submodule add -f ' + curRepoInfo.git + " " + curPath + rename)
							// 	console.log("reponochange", curPath + rename)
							// }
							// else
							if (repoNoChange == 1) {//git地址变更
								deinitRepos.push(getStandardPath(curPath + rename))
								reloadRepos.push([curPath + rename, curRepoInfo])
								console.log("repochange", curPath + rename, curRepoInfo.git)
							} else {
								CMD.addShell('git submodule add -f ' + curRepoInfo.git + " " + curPath + rename)
								// terminal.sendText('git submodule add -f ' + curRepoInfo.git + " " + curPath + rename)
								console.log("reponochange", curPath + rename)
							}
						} else if (curRepoInfo.used === 0) {
							// deUseRepo(curPath, curRepoInfo)
							// deinitRepos.push([curPath, curRepoInfo])
							deinitRepos.push(getStandardPath(curPath + rename))
							console.log("deinitRepos", deinitRepos.length)
						}
						// cp.execSync('git submodule add -f ' + curRepoInfo.git + " " + curPath + rename, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
						// 	console.log('result:', err, stdout);
						// 	if (err) {
						// 		notify(err)
						// 	}
						// });

					} else {
						notify("存在一个仓库名称无法正常读取，请检查 git 项和 rename 项")
					}


				} else {
					notify("存在一个仓库信息描述不全, 请检查 git 项")
				}

				// 

			}
		}
		for (let i = 0; i < olds.length; i++) {
			deinitRepos.push(olds[i])
			console.log("push old", olds[i])
		}
		// terminal.sendText
		CMD.addShell('git submodule update --init')
		// for (let i = 0; i < deinitRepos.length; i++) {
		console.log("deinitRepos", deinitRepos.length)
		if (deinitRepos.length > 0) {
			let cmds: Array<string> = []
			await deUseRepo(deinitRepos, 0, cmds)

			for (let i = 0; i < cmds.length; i++) {
				console.log("cmd:", i, cmds[i])
				// terminal.sendText
				CMD.addShell(cmds[i])
			}
		}
		// terminal.sendText
		CMD.addShell('git add .')
		for (let i = 0; i < olds.length; i++) {
			console.log("remove old", olds[i])
			// RemoveInModuleFile(olds[i])
			CMD.addCallback(() => {
				RemoveInModuleFile(olds[i])
			})
		}
		CMD.addShell('git add .')
		if (reloadRepos.length > 0) {
			for (let i = 0; i < reloadRepos.length; i++) {
				// terminal.sendText
				CMD.addShell('git submodule add -f ' + reloadRepos[i][1].git + " " + reloadRepos[i][0])
			}
		}
		CMD.doAndclearShell(0)
		notify("完成更新")
		// terminal.sendText('git submodule update --init')
		// }
	} else {
		notify_fileIsNotIntact()
	}
}
function deleteOneIfHas_thenReturn(olds: string[], stuff: string) {
	let newList: string[] = []
	for (let i = 0; i < olds.length; i++) {
		// if (olds[i].indexOf(stuff) < 0) {
		if (olds[i] != (stuff)) {
			newList.push(olds[i])
		}
	}
	return newList
}
async function deUseRepo(deinitRepos: any, index: number, cmds: Array<string>) {


	// console.log("deinit:", index)
	// let curPath = deinitRepos[index][0]
	// let repoInfo = deinitRepos[index][1]

	// let rename: string = ""
	// let git: string = repoInfo.git
	// let split1 = git.split("/")

	// let split2 = split1[split1.length - 1].split(".git")
	// if (split2 && split2.length > 0) {
	// 	if (repoInfo.rename) {
	// 		rename = repoInfo.rename
	// 	} else {
	// 		rename = split2[0]
	// 	}
	// }
	let totalPath = deinitRepos[index]//curPath + rename
	// if (totalPath[0] == '.') {
	// 	totalPath = totalPath.substring(1)
	// }
	// if (totalPath[0] == '/') {
	// 	totalPath = totalPath.substring(1)
	// }
	//deinit
	const cp = require('child_process')
	cmds.push('git submodule deinit -f ' + totalPath)
	// terminal.sendText('git submodule deinit -f ' + totalPath)
	// cp.execSync('git submodule deinit -f ' + totalPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath });

	await fh.delUriRF(vscode.Uri.file(wsPath + "/.git/modules/" + totalPath), cmds)
	let d = new Date();
	// terminal.sendText
	cmds.push('Rename-Item .git/modules/' + totalPath + " " + d.getTime())

	// cp.execSync('powershell Rename-Item .git/modules/' + totalPath + " " + d.getTime(), { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath });

	// await fh.delUriRF(vscode.Uri.file(wsPath + "/" + totalPath), cmds)
	cmds.push('del ' + wsPath + "/" + totalPath + ' -recurse')

	for (let i = 0; i < cmds.length; i++) {
		console.log("cmd:-", i, cmds[i])
		// terminal.sendText(cmds[i])
	}
	// console.log("running cmd:", 'git submodule deinit -f ' + curRepoInfo.git + " " + curPath + rename)
	// await cp.exec('git submodule deinit -f ' + totalPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
	// 	console.log('result:', err, stdout);
	// 	if (err) {
	// 		notify(err)
	// 	}
	index++
	if (index < deinitRepos.length) {
		await deUseRepo(deinitRepos, index, cmds)
	}
	//  else {
	// 		setTimeout(() => {

	// 			deleteFolder(deinitRepos, 0)
	// 		}, 500)

	// 	}



	// });

	// //删除.gitmodules中的内容
	// const uri = vscode.Uri.file(wsPath + "/.gitmodules");
	// await deleteInModuleFile(uri, totalPath)

	// //删除.git/config
	// const uri2 = vscode.Uri.file(wsPath + "/.git/config");
	// await deleteInModuleFile(uri2, totalPath)

	// const uri3 = vscode.Uri.file(wsPath + "/" + totalPath);
	// // await vscode.workspace.fs.delete(uri3)
	// fh.delUriRF(uri3)
	// //删除.git/module中的文件夹

	//暂存
}
function deleteFolder(deinitRepos: any, index: number) {
	console.log("deleteFolder", index)
	let curPath = deinitRepos[index][0]
	let repoInfo = deinitRepos[index][1]

	let rename: string = ""
	let git: string = repoInfo.git
	let split1 = git.split("/")

	let split2 = split1[split1.length - 1].split(".git")
	if (split2 && split2.length > 0) {
		if (repoInfo.rename) {
			rename = repoInfo.rename
		} else {
			rename = split2[0]
		}
	}
	let totalPath = curPath + rename
	if (totalPath[0] == '.') {
		totalPath = totalPath.substring(1)
	}
	if (totalPath[0] == '/') {
		totalPath = totalPath.substring(1)
	}
	//deinit
	const cp = require('child_process')


	// await vscode.workspace.fs.delete(uri3)
	// fh.delUriRF(uri3)
	//删除.git/module中的文件夹
	cp.exec('powershell del ' + totalPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
		if (err) {
			console.log(err)
			notify(err)
		} else {
			console.log("delete ", totalPath)
		}
	})
}
async function getOldModulesList() {
	const uri = vscode.Uri.file(wsPath + "/.gitmodules")
	let f1 = await fh.readFile(uri)
	let list: string[] = []
	// f1.getText()
	for (let i = 0; i < f1.lineCount; i++) {
		let txt = f1.lineAt(i).text
		if (txt.indexOf("[submodule") > -1) {
			list.push(txt.split('"')[1])
		}
	}
	return list
}
/**
 * 0 完全匹配，1 地址变更，-1 新加入的sub
 */
async function RemoveInModuleFile(totalPath: string) {
	const uri = vscode.Uri.file(wsPath + "/.gitmodules")
	let f1 = await fh.readFile(uri)
	if (totalPath[0] == '.') {
		totalPath = totalPath.substring(1)
	}
	if (totalPath[0] == '/') {
		totalPath = totalPath.substring(1)
	}
	let state = -1
	for (let i = 0; i < f1.lineCount; i++) {
		// try {
		// 	console.log("repo line", f1.lineAt(i).text)
		// 	console.log("repo line+2", f1.lineAt(i + 2).text)
		// 	console.log(totalPath, repoUri)
		// 	console.log("\r\n\r\n")
		// } catch (error) {

		// }
		if (f1.lineAt(i).text.indexOf('"' + totalPath + '"') > -1) {
			let firstLine = f1.lineAt(i)
			let lastLine = f1.lineAt(i + 2)
			let wsedit = new vscode.WorkspaceEdit();
			var textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
			wsedit = new vscode.WorkspaceEdit();
			wsedit.get(uri)
			wsedit.delete(uri, textRange)
			await vscode.workspace.applyEdit(wsedit)
			// vscode.window.showTextDocument(uri);
			await f1.save()



		}
	}
	return state
}
/**
 * 0 完全匹配，1 地址变更，-1 新加入的sub
 */
async function checkInModuleFile(totalPath: string, repoUri: string) {
	const uri = vscode.Uri.file(wsPath + "/.gitmodules")
	let f1 = await fh.readFile(uri)
	if (totalPath[0] == '.') {
		totalPath = totalPath.substring(1)
	}
	if (totalPath[0] == '/') {
		totalPath = totalPath.substring(1)
	}
	let state = -1
	for (let i = 0; i < f1.lineCount; i++) {
		try {
			console.log("repo line", f1.lineAt(i).text)
			console.log("repo line+2", f1.lineAt(i + 2).text)
			console.log(totalPath, repoUri)
			console.log("\r\n\r\n")
		} catch (error) {

		}
		if (f1.lineAt(i).text.indexOf('"' + totalPath + '"') > -1) {
			if (f1.lineAt(i + 2).text.indexOf(repoUri) > -1) {
				state = 0//完全匹配
			} else {
				state = 1//git地址变更
			}
			return state
			// let firstLine = f1.lineAt(i)
			// let lastLine = f1.lineAt(i + 2)
			// let wsedit = new vscode.WorkspaceEdit();
			// var textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
			// wsedit = new vscode.WorkspaceEdit();
			// wsedit.get(uri)
			// wsedit.delete(uri, textRange)
			// await vscode.workspace.applyEdit(wsedit)
			// // vscode.window.showTextDocument(uri);
			// await f1.save()
			// vscode.window.showInformationMessage('请按照模板编辑，并且移除模板内容');



		}
	}
	return state
}
function notify_fileIsNotIntact() {
	notify("配置文件不完整")
}
export function notify(text: string) {
	vscode.window.showInformationMessage(_appName + ": " + text)
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "submodule-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('submodule-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// let control = vscode.scm.createSourceControl("control", "control test")
		// vscode.window.showInformationMessage('Hello World from submodule_helper!');
		if (vscode.workspace.workspaceFolders) {
			wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
			console.log("项目目录:", wsPath)
			findJson(wsPath);
			// const cp = require('child_process')
			// cp.exec('git', { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' } }, (err: any, stdout: any) => {
			// 	console.log('result', err, stdout);
			// });
		}

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
