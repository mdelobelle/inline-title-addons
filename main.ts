import { MarkdownView, Plugin, setIcon, TFile } from 'obsidian';
import { AddOnCommand } from 'src/AddOnCommand';
import { Settings, DEFAULT_SETTINGS } from 'src/Settings';
import SettingTab from 'src/SettingTab';

export default class InlineTitleAddOnPlugin extends Plugin {
	settings: Settings;
	public initialCommands: Array<AddOnCommand> = [];

	async onload() {
		await this.loadSettings();

		this.settings.commands.forEach(command => {
			const addOnCommand: AddOnCommand = { ...command };
			this.initialCommands.push(addOnCommand);
		});

		this.addSettingTab(new SettingTab(this));
		app.workspace.iterateRootLeaves(async (leaf) => {
			if (leaf.view instanceof MarkdownView && leaf.view.file) {
				this.cleanTitle(leaf.view);
				await this.embedTitle(leaf.view);
			}
		})

		this.app.workspace.on("active-leaf-change", async () => {
			//@ts-ignore
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				this.cleanTitle(view);
				await this.embedTitle(view);
			}
		})

		this.app.workspace.on("editor-change", async () => {
			//@ts-ignore
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				this.cleanTitle(view);
				await this.embedTitle(view);
			}
		})
		console.log("Inline Title Addons loaded")
	}

	onunload() {
		app.workspace.iterateRootLeaves((leaf) => {
			if (leaf.view instanceof MarkdownView && leaf.view.file) { this.cleanTitle(leaf.view) }
		})
		console.log("Inline Title Addons unloaded")
	}

	private cleanTitle(view: MarkdownView) {
		const title = view.inlineTitleEl;
		const titleParent = title.parentElement!;
		if (titleParent.hasClass("inline-title-with-add-ons-container")) {
			const originContainer = titleParent.parentElement!
			title.removeClass("with-add-ons")
			originContainer.prepend(title);
			originContainer.removeChild(titleParent);
		}
	}

	private async embedTitle(view: MarkdownView) {
		const title = view.inlineTitleEl;
		const titleParent = title.parentElement!;

		if (!title.hasClass("with-add-ons")) {
			title.addClass("with-add-ons")
			const titleWithAddOnsContainer = titleParent.createDiv("inline-title-with-add-ons-container");
			titleParent.prepend(titleWithAddOnsContainer);
			titleWithAddOnsContainer.prepend(title);
			const addOnsContainer = titleWithAddOnsContainer.createDiv({ cls: "add-ons" })
			const folder = view.file.parent.path
			const inlinetags = this.app.metadataCache.getFileCache(view.file)?.tags?.map(t => t.tag) || []
			const metatags = this.app.metadataCache.getFileCache(view.file)?.frontmatter?.tags || []
			let tags: string[] = []
			if (typeof metatags === "string") {
				tags = [...inlinetags, metatags].map(t => t.replace(/^#/, ""))
			} else {
				tags = [...inlinetags, ...metatags].map(t => t.replace(/^#/, ""))
			}
			const commands = this.settings.commands.filter(command => {
				return command.folders.includes(folder) || command.tags.some(t => tags.includes(t))
			})
			commands.forEach(async command => {
				const commandBtn = addOnsContainer.createDiv({ cls: "add-on", title: command.description })
				setIcon(commandBtn, command.icon)
				try {
					const scriptFile = this.app.vault.getAbstractFileByPath(`Settings/javascript/commands/${command.command}.js`)
					if (scriptFile && scriptFile instanceof TFile) {
						const script = await this.app.vault.read(scriptFile)
						const commandFunction = new Function(`${script}; return ${command.command}`)();
						commandBtn.onclick = () => {
							commandFunction(view.file, command.args);
						}
					}
				} catch (error) {
					console.log(error)
				}
			})
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		this.settings.commands = this.initialCommands;
		await this.saveData(this.settings);
	}
}
