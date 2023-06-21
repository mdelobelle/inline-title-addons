import { PluginSettingTab, Setting, TFile } from "obsidian";
import Plugin from "main";
import { AddOnCommand } from "./AddOnCommand";
import CommandSettingsModal from "./CommandSettingModal";
import SettingTab from "./SettingTab";

export default class CommandSetting extends Setting {
    private commandNameContainer: HTMLSpanElement;
    private typeContainer: HTMLSpanElement;
    private commandDescriptionContainer: HTMLSpanElement;

    constructor(
        private tab: SettingTab,
        public command: AddOnCommand
    ) {
        super(tab.commandsContainer);
        this.setTextContentWithname();
        this.addPutBeforeButton();
        this.addPutAfterButton();
        this.addEditButton();
        this.addDeleteButton();
        this.settingEl.addClass("no-border")
    };

    public setTextContentWithname(): void {

        this.infoEl.textContent = "";
        this.infoEl.addClass("setting-item")
        this.commandNameContainer = this.infoEl.createEl("div", "name")
        this.commandNameContainer.setText(this.command.command)
        this.typeContainer = this.infoEl.createEl("div")
        this.typeContainer.setAttr("class", `chip ${this.command.type}`)
        this.typeContainer.setText(this.command.type)
        this.commandDescriptionContainer = this.infoEl.createEl("div")
        this.commandDescriptionContainer.setText(`${this.command.description}`)
    };

    private addPutBeforeButton(): void {
        if (this.command.id !== this.tab.plugin.settings.commands.first()?.id) {
            this.addButton((b) => {
                b.setIcon("chevron-up")
                    .onClick(() => {
                        const cmds = this.tab.plugin.settings.commands
                        const pos = cmds.map(c => c.id).indexOf(this.command.id);
                        [cmds[pos - 1], cmds[pos]] = [cmds[pos], cmds[pos - 1]]
                        this.tab.plugin.saveSettings();
                        this.tab.buildCommands();
                    })
            })
        }
    }

    private addPutAfterButton(): void {
        if (this.command.id !== this.tab.plugin.settings.commands.last()?.id) {
            this.addButton((b) => {
                b.setIcon("chevron-down")
                    .onClick(() => {
                        const cmds = this.tab.plugin.settings.commands
                        const pos = cmds.map(c => c.id).indexOf(this.command.id);
                        [cmds[pos], cmds[pos + 1]] = [cmds[pos + 1], cmds[pos]]
                        this.tab.plugin.saveSettings();
                        this.tab.buildCommands();

                    })
            })
        }
    }

    private addEditButton(): void {
        this.addButton((b) => {
            b.setIcon("pencil")
                .setTooltip("Edit")
                .onClick(() => {
                    let modal = new CommandSettingsModal(this.tab, this, this.command);
                    modal.open();
                });
        });
    };

    private addDeleteButton(): void {
        this.addButton((b) => {
            b.setIcon("trash")
                .setTooltip("Delete")
                .onClick(() => {
                    const currentExistingProperty = this.tab.plugin.initialCommands.filter(p => p.id == this.command.id)[0];
                    if (currentExistingProperty) {
                        this.tab.plugin.initialCommands.remove(currentExistingProperty);
                    };
                    this.settingEl.parentElement?.removeChild(this.settingEl);
                    this.tab.plugin.saveSettings();
                });
        });
    };

};