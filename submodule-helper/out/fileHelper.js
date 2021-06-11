"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delUriRF = exports.connectUri = exports.readFile = void 0;
const vscode = require("vscode");
function readFile(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        return vscode.workspace.openTextDocument(uri);
        // let wsedit = new vscode.WorkspaceEdit();
        // return wsedit.get(url)
    });
}
exports.readFile = readFile;
function connectUri(uri, file) {
    return __awaiter(this, void 0, void 0, function* () {
        return vscode.Uri.file(uri.path + "/" + file);
    });
}
exports.connectUri = connectUri;
function delUriRF(path) {
    return __awaiter(this, void 0, void 0, function* () {
        let fs = vscode.workspace.fs;
        // 第一步读取文件内部的文件
        let arr = yield fs.readDirectory(path);
        // console.log(arr);
        // 遍历数组
        for (let i = 0; i < arr.length; i++) {
            // let uri=vscode.Uri.file(path + '/' + arr[i])
            // 获取文件的状态
            // let stat = fs.readFile(uri);
            // 判断是文件还是文件夹
            let uri = vscode.Uri.file(path.path + '/' + arr[i][0]);
            if (arr[i][1] == 2) {
                // 说明是文件夹  递归调用
                yield delUriRF(uri);
            }
            else {
                // 说明是文件
                // fs.unlinkSync(path + '/' + arr[i]);
                // fs.
                yield fs.delete(uri);
            }
        }
        // 遍历完成之后 删除最外层的文件
        yield fs.delete(path);
    });
}
exports.delUriRF = delUriRF;
//# sourceMappingURL=FileHelper.js.map