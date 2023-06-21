export class AddOnCommand {

    constructor(
        public id: number = 0,
        public command: string = "",
        public description: string = "",
        public type: "script" | "command" = "script",
        public folders: string[] = [],
        public tags: string[] = [],
        public icon: string = "play-circle",
        public args: any = {}
    ) {

    }

    static copyProperty(target: AddOnCommand, source: AddOnCommand) {
        target.id = source.id;
        target.command = source.command;
        target.description = source.description;
        target.type = source.type
        target.folders = source.folders
        target.tags = source.tags
        target.icon = source.icon
        Object.keys(source.args).forEach(k => {
            target.args[k] = source.args[k];
        });
        Object.keys(target.args).forEach(k => {
            if (!Object.keys(source.args).includes(k)) {
                delete target.args[k];
            };
        });
    };

}

