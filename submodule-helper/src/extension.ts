// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fh from './FileHelper';
const _appName = "SubHelper"
const jsonName = "submodule_helper.json"
let wsPath = ""
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
//3 分析解析出的obj
async function analyzeJsonObj(obj: any) {
	if (obj.root_folder && obj.submodules_structure) {
		let deinitRepos = []
		for (var key in obj.submodules_structure) {
			let curPath = obj.root_folder + key
			if (curPath[curPath.length - 1] != '/') {
				curPath += "/"
			}
			let repoArr = obj.submodules_structure[key]
			console.log("curPath", curPath)
			for (let i = 0; i < repoArr.length; i++) {
				let curRepoInfo = repoArr[i]
				if (curRepoInfo.used) {
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
							const cp = require('child_process')
							console.log("running cmd:", 'git submodule add -f ' + curRepoInfo.git + " " + curPath + rename)
							await cp.execSync('git submodule add -f ' + curRepoInfo.git + " " + curPath + rename, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
								console.log('result:', err, stdout);
								if (err) {
									notify(err)
								}
							});
							// await cp.exec('dir', { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
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

				} else if (curRepoInfo.used === 0) {
					// deUseRepo(curPath, curRepoInfo)
					deinitRepos.push([curPath, curRepoInfo])
					console.log("deinitRepos", deinitRepos.length)
				}

			}
		}
		// for (let i = 0; i < deinitRepos.length; i++) {
		console.log("deinitRepos", deinitRepos.length)
		if (deinitRepos.length > 0) {

			deUseRepo(deinitRepos, 0)
		}
		// }
	} else {
		notify_fileIsNotIntact()
	}
}
async function deUseRepo(deinitRepos: any, index: number) {
	console.log("deinit:", index)
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
	cp.execSync('git submodule deinit -f ' + totalPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath });
	fh.delUriRF(vscode.Uri.file(wsPath + "/.git/modules/" + totalPath))
	var d = new Date();
	cp.execSync('powershell Rename-Item .git/modules/' + totalPath + " " + d.getTime(), { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath });

	fh.delUriRF(vscode.Uri.file(wsPath + "/" + totalPath))
	// console.log("running cmd:", 'git submodule deinit -f ' + curRepoInfo.git + " " + curPath + rename)
	// await cp.exec('git submodule deinit -f ' + totalPath, { env: { ...process.env, ELECTRON_RUN_AS_NODE: '' }, cwd: wsPath }, (err: any, stdout: any) => {
	// 	console.log('result:', err, stdout);
	// 	if (err) {
	// 		notify(err)
	// 	}
	index++
	if (index < deinitRepos.length) {
		deUseRepo(deinitRepos, index)
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
async function deleteInModuleFile(uri: vscode.Uri, totalPath: string) {
	let f1 = await fh.readFile(uri)
	for (let i = 0; i < f1.lineCount; i++) {
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
			// vscode.window.showInformationMessage('请按照模板编辑，并且移除模板内容');



		}
	}
}
function notify_fileIsNotIntact() {
	notify("配置文件不完整")
}
function notify(text: string) {
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
