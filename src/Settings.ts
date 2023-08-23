import { AddOnCommand } from "./AddOnCommand"
import { FolderNoteAlias } from "./FolderNoteAlias";

export interface Settings {
    commands: AddOnCommand[];
    scriptsFolder: string;
    folderNoteAliases: FolderNoteAlias[];
}

export const DEFAULT_SETTINGS: Settings = {
    commands: [],
    scriptsFolder: "/",
    folderNoteAliases: []
}