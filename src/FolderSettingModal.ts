import { ButtonComponent, Modal, Notice, TextComponent, TextAreaComponent } from "obsidian";
import { FolderNoteAlias } from "./FolderNoteAlias";
import FolderSetting from "./FolderSetting";
import SettingTab from "./SettingTab";

export default class FolderSettingModal extends Modal {
    private namePromptComponent: TextComponent;
    private saved: boolean = false;
    private folderNoteAlias: FolderNoteAlias;
    private initialFolderNoteAlias: FolderNoteAlias;
    private new: boolean = true;

    constructor(
        private settingTab: SettingTab,
        private parentSetting?: FolderSetting,
        folderNoteAlias?: FolderNoteAlias
    ) {
        super(settingTab.plugin.app);
        if (folderNoteAlias) {
            this.new = false;
            this.folderNoteAlias = folderNoteAlias;
            this.initialFolderNoteAlias = { ...this.initialFolderNoteAlias }
        } else {
            let newId = 1;
            this.settingTab.plugin.initialFolderNoteAliases.forEach(fNA => {
                if (fNA.id && fNA.id >= newId) {
                    newId = fNA.id + 1;
                };
            });
            this.folderNoteAlias = new FolderNoteAlias();
            this.folderNoteAlias.id = newId;
            this.initialFolderNoteAlias = new FolderNoteAlias();
            this.initialFolderNoteAlias.id = newId;
        };
    };

    async onOpen(): Promise<void> {
        this.containerEl.addClass("inline-title-addons")
        if (this.folderNoteAlias.folder == "") {
            this.titleEl.setText(`Add a field and define options`);
        } else {
            this.titleEl.setText(`Manage settings options for ${this.folderNoteAlias.folder}`);
        };

        /* Name */
        this.createfolderInputContainer();
        this.createFormatingContainer();
        this.contentEl.createEl("hr");

        const footer = this.contentEl.createDiv({ cls: "footer-actions" });
        footer.createDiv({ cls: "spacer" })
        this.createSaveButton(footer);
        this.createCancelButton(footer);

    };

    onClose(): void {
        Object.assign(this.folderNoteAlias, this.initialFolderNoteAlias);
        if (!this.new && this.parentSetting) {
            this.parentSetting.setTextContentWithname()
        } else if (this.saved) {
            new FolderSetting(this.settingTab, this.folderNoteAlias);
        };
    };

    private createfolderInputContainer(): void {
        const container = this.contentEl.createDiv({ cls: "field-container" })
        container.createDiv({ cls: "label", text: "Folder: " });
        const input = new TextComponent(container);
        input.inputEl.addClass("with-label");
        input.inputEl.addClass("full-width");
        const name = this.folderNoteAlias.folder;
        input.setValue(name);
        input.setPlaceholder("Folder/Name");
        input.onChange(value => {
            this.folderNoteAlias.folder = value;
            this.titleEl.setText(`Manage options for ${this.folderNoteAlias.folder}`);
            FolderSettingModal.removeValidationError(input);
        });
        this.namePromptComponent = input;
    };

    private createFormatingContainer(): void {
        const container = this.contentEl.createDiv({ cls: "vstacked" });
        container.createEl("span", { text: "Formating Function" });
        container.createEl("span", { cls: "sub-text", text: "formating function taking title as a single arg and returning a string" });
        const inputContainer = container.createDiv({ cls: "field-container" });
        const input = new TextAreaComponent(inputContainer);
        input.inputEl.addClass("full-width");
        const formatingFunction = this.folderNoteAlias.formatingFunction;
        input.setValue(formatingFunction);
        input.setPlaceholder("return title");
        input.onChange(value => {
            this.folderNoteAlias.formatingFunction = value;
            FolderSettingModal.removeValidationError(input);
        });
    };

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
            const currentExistingFolders = this.settingTab.plugin.initialFolderNoteAliases.filter(p => p.id == this.folderNoteAlias.id)[0];
            if (currentExistingFolders) {
                FolderNoteAlias.copyProperty(currentExistingFolders, this.folderNoteAlias);
            } else {
                this.settingTab.plugin.initialFolderNoteAliases.push(this.folderNoteAlias);
            };
            FolderNoteAlias.copyProperty(this.initialFolderNoteAlias, this.folderNoteAlias)
            if (this.parentSetting) FolderNoteAlias.copyProperty(this.parentSetting.folderNoteAlias, this.folderNoteAlias);
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
                if (this.initialFolderNoteAlias.folder != "") {
                    Object.assign(this.folderNoteAlias, this.initialFolderNoteAlias);
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