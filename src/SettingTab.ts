import { PluginSettingTab, Setting, ButtonComponent, ToggleComponent, Modal, DropdownComponent, moment, setIcon } from "obsidian";
import Plugin from "main";
import { FolderSuggest } from "./utils/FolderSuggest";
import CommandSettingsModal from "./CommandSettingModal";
import { AddOnCommand } from "./AddOnCommand";
import CommandSetting from "./CommandSetting";

export default class SettingTab extends PluginSettingTab {
    public plugin: Plugin;
    public commandsContainer: HTMLDivElement;

    constructor(plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.containerEl.addClass("inline-title-addons")
        this.containerEl.addClass("settings")
    };

    private createSettingGroup(title: string, subTitle?: string, withButton: boolean = false): HTMLDivElement {
        const settingHeader = this.containerEl.createEl('div')
        const settingHeaderContainer = settingHeader.createEl("div", { cls: "header-container" });
        const settingHeaderTextContainer = settingHeaderContainer.createEl("div", { cls: "text-container" });
        settingHeaderTextContainer.createEl('h4', { text: title, cls: "section-header" });
        if (subTitle) settingHeaderTextContainer.createEl('div', { text: subTitle, cls: "setting-item-description" });

        const settingsContainer = this.containerEl.createEl("div");
        if (withButton) {
            const settingsContainerShowButtonContainer = settingHeaderContainer.createEl("div", { cls: "setting-item-control" });
            const settingsContainerShowButton = new ButtonComponent(settingsContainerShowButtonContainer);
            settingsContainerShowButton.buttonEl.addClass("setting-item-control");
            settingsContainer.hide();
            settingsContainerShowButton.setCta();
            settingsContainerShowButton.setIcon("chevrons-up-down");

            const toggleState = () => {
                if (settingsContainer.isShown()) {
                    settingsContainer.hide();
                    settingsContainerShowButton.setIcon("chevrons-up-down");
                    settingsContainerShowButton.setCta();
                } else {
                    settingsContainer.show();
                    settingsContainerShowButton.setIcon("chevrons-down-up");
                    settingsContainerShowButton.removeCta();
                }
            }
            settingsContainerShowButton.onClick(() => toggleState());
        }
        return settingsContainer
    }

    public buildCommands() {
        this.commandsContainer.replaceChildren();
        /* Managed properties that currently have preset options */
        this.plugin.initialCommands.forEach(command => {
            const addOnCommand: AddOnCommand = { ...command }
            new CommandSetting(this, addOnCommand);
        });
    }

    display() {
        let { containerEl } = this;
        containerEl.empty();

        /* 
        -----------------------------------------
        Global Settings 
        -----------------------------------------
        */
        const generalSettings = this.createSettingGroup(
            'General',
            "Folders and stuff",
            false
        )
        const scriptsFolder = new Setting(generalSettings)
            .setName('scripts folder')
            .setDesc('Path to the files containing the scripts')
            .addSearch((cfs) => {
                new FolderSuggest(this.plugin, cfs.inputEl);
                cfs.setPlaceholder("Folder")
                    .setValue(this.plugin.settings.scriptsFolder || "")
                    .onChange((new_folder) => {
                        const newPath = new_folder.endsWith("/") || !new_folder ? new_folder : new_folder + "/";
                        this.plugin.settings.scriptsFolder = newPath || "/";
                        this.plugin.saveSettings();
                    });
            });
        scriptsFolder.settingEl.addClass("no-border");
        scriptsFolder.settingEl.addClass("narrow-title");
        scriptsFolder.controlEl.addClass("full-width");

        containerEl.createDiv({ cls: "setting-divider" });

        /* 
        -----------------------------------------
        Commands Settings 
        -----------------------------------------
        */

        const commandsSettings = this.createSettingGroup(
            'Commands',
            "All commands",
            true
        )
        new Setting(commandsSettings)
            .setName("Add New Command Setting")
            .setDesc("Add a new Command for which you want to create and addon .")
            .addButton((button: ButtonComponent): ButtonComponent => {
                return button
                    .setTooltip("Add New Command")
                    .setButtonText("Add new")
                    .setCta()
                    .onClick(async () => {
                        let modal = new CommandSettingsModal(this);
                        modal.open();
                    });
            }).settingEl.addClass("no-border");

        this.commandsContainer = commandsSettings.createDiv();
        this.buildCommands();

    }
}