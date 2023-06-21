import "obsidian";

declare module "obsidian" {

    interface MarkdownView {
        inlineTitleEl: HTMLDivElement;
    }

    interface DataAdapter {
        getBasePath: any;
    }
}