import { Setting } from "obsidian";
import { FolderNoteAlias } from "./FolderNoteAlias";
import SettingTab from "./SettingTab";
import FolderSettingModal from "./FolderSettingModal";

export default class FolderSetting extends Setting {
    private folderNameContainer: HTMLSpanElement;
    private formatingContainer: HTMLSpanElement;

    constructor(
        private tab: SettingTab,
        public folderNoteAlias: FolderNoteAlias
    ) {
        super(tab.foldersContainer);
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
        this.folderNameContainer = this.infoEl.createEl("div", "name")
        this.folderNameContainer.setText(this.folderNoteAlias.folder)
        this.formatingContainer = this.infoEl.createSpan(this.folderNoteAlias.formatingFunction)
    };

    private addPutBeforeButton(): void {
        if (this.folderNoteAlias.id !== this.tab.plugin.settings.folderNoteAliases.first()?.id) {
            this.addButton((b) => {
                b.setIcon("chevron-up")
                    .onClick(() => {
                        const cmds = this.tab.plugin.settings.folderNoteAliases
                        const pos = cmds.map(c => c.id).indexOf(this.folderNoteAlias.id);
                        [cmds[pos - 1], cmds[pos]] = [cmds[pos], cmds[pos - 1]]
                        this.tab.plugin.saveSettings();
                        this.tab.buildFolders();
                    })
            })
        }
    }

    private addPutAfterButton(): void {
        if (this.folderNoteAlias.id !== this.tab.plugin.settings.folderNoteAliases.last()?.id) {
            this.addButton((b) => {
                b.setIcon("chevron-down")
                    .onClick(() => {
                        const cmds = this.tab.plugin.settings.folderNoteAliases
                        const pos = cmds.map(c => c.id).indexOf(this.folderNoteAlias.id);
                        [cmds[pos], cmds[pos + 1]] = [cmds[pos + 1], cmds[pos]]
                        this.tab.plugin.saveSettings();
                        this.tab.buildFolders();

                    })
            })
        }
    }

    private addEditButton(): void {
        this.addButton((b) => {
            b.setIcon("pencil")
                .setTooltip("Edit")
                .onClick(() => {
                    let modal = new FolderSettingModal(this.tab, this, this.folderNoteAlias);
                    modal.open();
                });
        });
    };

    private addDeleteButton(): void {
        this.addButton((b) => {
            b.setIcon("trash")
                .setTooltip("Delete")
                .onClick(() => {
                    const currentExistingProperty = this.tab.plugin.initialFolderNoteAliases.filter(p => p.id == this.folderNoteAlias.id)[0];
                    if (currentExistingProperty) {
                        this.tab.plugin.initialFolderNoteAliases.remove(currentExistingProperty);
                    };
                    this.settingEl.parentElement?.removeChild(this.settingEl);
                    this.tab.plugin.saveSettings();
                });
        });
    };

};