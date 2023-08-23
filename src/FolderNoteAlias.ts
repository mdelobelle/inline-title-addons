export class FolderNoteAlias {
    constructor(
        public id: number = 0,
        public folder: string = "",
        public formatingFunction: string = ""
    ) {

    }

    static copyProperty(target: FolderNoteAlias, source: FolderNoteAlias) {
        target.id = source.id;
        target.folder = source.folder;
        target.formatingFunction = source.formatingFunction;
    };
}