import Plugin from "main";
import { ButtonComponent, DropdownComponent, Modal, Notice, TextComponent, TextAreaComponent, ToggleComponent, setIcon } from "obsidian";
import { AddOnCommand } from "./AddOnCommand";
import CommandSetting from "./CommandSetting";
import SettingTab from "./SettingTab";

export default class CommandSettingsModal extends Modal {
    private namePromptComponent: TextComponent;
    private saved: boolean = false;
    private command: AddOnCommand;
    private initialCommand: AddOnCommand;
    private new: boolean = true;
    private iconName: TextComponent;

    constructor(
        private settingTab: SettingTab,
        private parentSetting?: CommandSetting,
        command?: AddOnCommand
    ) {
        super(settingTab.plugin.app);
        if (command) {
            this.new = false;
            this.command = command;
            this.initialCommand = { ...this.command }
        } else {
            let newId = 1;
            this.settingTab.plugin.initialCommands.forEach(command => {
                if (command.id && command.id >= newId) {
                    newId = command.id + 1;
                };
            });
            this.command = new AddOnCommand();
            this.command.id = newId;
            this.initialCommand = new AddOnCommand();
            this.initialCommand.id = newId;
        };
    };

    async onOpen(): Promise<void> {
        this.containerEl.addClass("inline-title-addons")
        if (this.command.command == "") {
            this.titleEl.setText(`Add a field and define options`);
        } else {
            this.titleEl.setText(`Manage settings options for ${this.command.command}`);
        };

        /* Name */
        this.createnameInputContainer();
        this.createDescriptionContainer();
        this.createIconContainer();
        this.contentEl.createEl("hr");

        /* Type */
        const typeSelectContainer = this.contentEl.createDiv({ cls: "field-container" });
        this.createFoldersContainer();
        this.createTagsContainer();
        this.contentEl.createEl("hr");

        /* Args */
        this.createArgsContainer();

        /* footer buttons*/
        const footer = this.contentEl.createDiv({ cls: "footer-actions" });
        footer.createDiv({ cls: "spacer" })
        this.createSaveButton(footer);
        this.createCancelButton(footer);

        /* init state */
        this.createTypeSelectorContainer(typeSelectContainer)

    };

    onClose(): void {
        Object.assign(this.command, this.initialCommand);
        if (!this.new && this.parentSetting) {
            this.parentSetting.setTextContentWithname()
        } else if (this.saved) {
            new CommandSetting(this.settingTab, this.command);
        };
    };

    private createnameInputContainer(): void {
        const container = this.contentEl.createDiv({ cls: "field-container" })
        container.createDiv({ cls: "label", text: "Command Name: " });
        const input = new TextComponent(container);
        input.inputEl.addClass("with-label");
        input.inputEl.addClass("full-width");
        const name = this.command.command;
        input.setValue(name);
        input.setPlaceholder("Name of the command");
        input.onChange(value => {
            this.command.command = value;
            this.titleEl.setText(`Manage options for ${this.command.command}`);
            CommandSettingsModal.removeValidationError(input);
        });
        this.namePromptComponent = input;
    };

    private createDescriptionContainer(): void {
        const container = this.contentEl.createDiv({ cls: "field-container" })
        container.createDiv({ cls: "label", text: "Description: " });
        const input = new TextComponent(container);
        input.inputEl.addClass("with-label");
        input.inputEl.addClass("full-width");
        const description = this.command.description;
        input.setValue(description);
        input.setPlaceholder("What does it do");
        input.onChange(value => {
            this.command.description = value;
            CommandSettingsModal.removeValidationError(input);
        });
        this.namePromptComponent = input;
    };

    private createIconContainer(): void {

        // options
        const iconContainer = this.contentEl.createDiv({ cls: "field-container" })

        // icon
        iconContainer.createDiv({ text: "Icon name", cls: "label" })
        this.iconName = new TextComponent(iconContainer)
        this.iconName.inputEl.addClass("full-width");
        this.iconName.inputEl.addClass("with-label");
        const iconPreview = iconContainer.createDiv({ cls: "icon-preview" })
        this.iconName.setValue(this.command.icon)
        setIcon(iconPreview, this.command.icon)
        this.iconName.onChange(value => {
            this.command.icon = value;
            setIcon(iconPreview, value)
        })
    }

    private createTypeSelectorContainer(parentNode: HTMLDivElement): void {
        const typeSelectorContainerLabel = parentNode.createDiv({ cls: "label" });
        typeSelectorContainerLabel.setText(`Field type:`);
        parentNode.createDiv({ cls: "spacer" })
        const select = new DropdownComponent(parentNode);
        ["script", "command"].forEach(t => select.addOption(t, t))
        if (this.command.type) {
            select.setValue(this.command.type)
        }

        select.onChange((t: "script" | "command") => {
            this.command = { ...this.initialCommand };
            this.command.command = this.namePromptComponent.getValue()
            this.command.type = t;
            if (this.command.type !== this.initialCommand.type) {
                this.command.args = {}
                this.command.folders = []
                this.command.tags = []
                this.command.icon = "play-circle"
                this.command.args = {}
            }
        })
    }

    private createFoldersContainer(): void {
        const folderTopContainer = this.contentEl.createDiv({ cls: "vstacked" });
        folderTopContainer.createEl("span", { text: "Folders" });
        folderTopContainer.createEl("span", { cls: "sub-text", text: "folders where addons should be added to notes' inline title, comma separated" });
        const inputContainer = folderTopContainer.createDiv({ cls: "field-container" });
        const input = new TextAreaComponent(inputContainer);
        input.inputEl.addClass("full-width");
        const folders = this.command.folders;
        input.setValue(folders.join(", "));
        input.setPlaceholder("path/to/folder/, other/path/");
        input.onChange(value => {
            //this.command.folders = value.split(",").map(folder => folder.trim() + (!folder.trim().endsWith("/") ? "/" : ""))
            this.command.folders = value.split(",").map(folder => folder.trim())
        });
    }

    private createTagsContainer(): void {
        const tagsTopContainer = this.contentEl.createDiv({ cls: "vstacked" })
        tagsTopContainer.createEl("span", { text: "Tags" })
        tagsTopContainer.createEl("span", { text: "Tags for which addons should be added to notes' inline title when those notes contains one of them ", cls: "sub-text" })
        const inputContainer = tagsTopContainer.createDiv({ cls: "field-container" });
        const input = new TextAreaComponent(inputContainer);
        input.inputEl.addClass("full-width");
        const tags = this.command.tags;
        input.setValue(tags.join(", "));
        input.setPlaceholder("Tag, other/tag");
        input.onChange(value => {
            this.command.tags = value.split(",").map(tag => tag.trim())
        });
    }

    private createArgsContainer(): void {
        const argsTopContainer = this.contentEl.createDiv({ cls: "vstacked" })
        argsTopContainer.createEl("span", { text: "Args" })
        argsTopContainer.createEl("span", { text: "args to be passed to the script. JSON object ", cls: "sub-text" })
        const inputContainer = argsTopContainer.createDiv({ cls: "field-container" });
        const input = new TextAreaComponent(inputContainer);
        input.inputEl.addClass("full-width");
        const args = JSON.stringify(this.command.args, null, 2)
        const rows = (args.match(/\n/g) || []).length + 2
        input.inputEl.rows = rows;
        input.setValue(args);
        input.setPlaceholder('{"key1": "value1", "key2": "value2"}');
        input.onChange(value => {
            try {
                this.command.args = JSON.parse(value)
            } catch (error) {
                //do nothing
            }
        });
    }

    private validateFields(): boolean {
        return true
    }

    private createSaveButton(container: HTMLDivElement): void {
        const b = new ButtonComponent(container)
        b.setTooltip("Save");
        b.setIcon("checkmark");
        b.onClick(async () => {
            let error = !this.validateFields();
            if (error) {
                new Notice("Fix errors before saving.");
                return;
            };
            this.saved = true;
            const currentExistingCommand = this.settingTab.plugin.initialCommands.filter(p => p.id == this.command.id)[0];
            if (currentExistingCommand) {
                AddOnCommand.copyProperty(currentExistingCommand, this.command);
            } else {
                this.settingTab.plugin.initialCommands.push(this.command);
            };
            AddOnCommand.copyProperty(this.initialCommand, this.command)
            if (this.parentSetting) AddOnCommand.copyProperty(this.parentSetting.command, this.command);
            this.parentSetting?.setTextContentWithname()
            this.settingTab.plugin.saveSettings();
            this.close();
        });
    };

    private createCancelButton(container: HTMLDivElement): void {
        const b = new ButtonComponent(container);
        b.setIcon("cross")
            .setTooltip("Cancel")
            .onClick(() => {
                this.saved = false;
                /* reset options from settings */
                if (this.initialCommand.command != "") {
                    Object.assign(this.command, this.initialCommand);
                };
                this.close();
            });
    };

    /* utils functions */

    public static setValidationError(textInput: TextComponent, message?: string) {
        textInput.inputEl.addClass("is-invalid");
        const fieldContainer = textInput.inputEl.parentElement;
        const fieldsContainer = fieldContainer?.parentElement;
        if (message && fieldsContainer) {
            let mDiv = fieldsContainer.querySelector(".field-error") as HTMLDivElement;
            if (!mDiv) mDiv = createDiv({ cls: "field-error" });
            mDiv.innerText = message;
            fieldsContainer.insertBefore(mDiv, fieldContainer);
        }
    }
    public static removeValidationError(textInput: TextComponent | TextAreaComponent) {
        if (textInput.inputEl.hasClass("is-invalid")) textInput.inputEl.removeClass("is-invalid");
        const fieldContainer = textInput.inputEl.parentElement;
        const fieldsContainer = fieldContainer?.parentElement;
        const fieldError = fieldsContainer?.querySelector(".field-error")
        if (fieldError) fieldsContainer!.removeChild(fieldError)
    };
};