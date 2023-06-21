import Plugin from "main";
import {
    normalizePath,
    TAbstractFile,
    TFile,
    TFolder,
    Vault,
} from "obsidian";


export function resolve_tfolder(plugin: Plugin, folder_str: string): TFolder {
    folder_str = normalizePath(folder_str);

    const folder = plugin.app.vault.getAbstractFileByPath(folder_str);
    if (!folder) {
        throw new Error(`Folder "${folder_str}" doesn't exist`);
    }
    if (!(folder instanceof TFolder)) {
        throw new Error(`${folder_str} is a file, not a folder`);
    }

    return folder;
}

export function get_tfiles_from_folder(
    plugin: Plugin,
    folder_str: string
): Array<TFile> {
    const folder = resolve_tfolder(plugin, folder_str);

    const files: Array<TFile> = [];
    Vault.recurseChildren(folder, (file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file);
        }
    });

    files.sort((a, b) => {
        return a.basename.localeCompare(b.basename);
    });

    return files;
}

export function getFileFromFileOrPath(plugin: Plugin, fileOrFilePath: TFile | string) {
    let file: TFile;
    if (fileOrFilePath instanceof TFile) {
        file = fileOrFilePath;
    } else {
        const _file = plugin.app.vault.getAbstractFileByPath(fileOrFilePath)
        if (_file instanceof TFile && _file.extension == "md") {
            file = _file;
        } else {
            throw Error("path doesn't correspond to a proper file");
        }
    }
    return file
}