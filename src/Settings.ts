import { AddOnCommand } from "./AddOnCommand"

export interface Settings {
    commands: AddOnCommand[]
    scriptsFolder: string;
}

export const DEFAULT_SETTINGS: Settings = {
    commands: [],
    scriptsFolder: "/"
}