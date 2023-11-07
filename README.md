# Inline title add-ons

## add actions in the title line of your notes
each action can be a command already available in Obsidian command palette or a javascript file

### Settings

First you'll have to define a folder that store those files

Then add a new command:
- set the name of the command. In case of use of a javascipt script for this command, the name of the command is the name of the file minus the ".js" extension
- set a description (will appear as a tooltip when hovering the button on desktop)
- set an icon name for the button (from lucide.dev library)
- set the field type:
  - command : for à obsidian command
  - script: for a javascript file
- set the folders where this command button should be added
- set the tags whose matching files will have this command button added
- set extra arguments (JSON format) for your javascript script

### example
#### general setting
scripts folder: Settings/javascript/commands/

#### Add a new command
- Command name: shiftDate
- Description: day -1
- Icon name: calendar-minus
- Field type: script
- Folders: Daily/Notes
- Tags: 
- Args: 
```json
{
  "dateFormat": "YYYY-MM-DD ddd",
  "folder": "Daily/Notes",
  "duration": -1,
  "unit": "days"
}
```

In this example
the plugin will search for `shiftDate.js` in the folder `Settings/javascript/commands/`

the shiftDate.js is like this
```
const shiftDate = async (file, args) => {
    const date = moment(file.basename, args.dateFormat)
    const yesterday = date.add(args.duration, args.unit)
    await app.workspace.openLinkText(`${args.folder}/${yesterday.format(args.dateFormat)}.md`, file.path, false)
}
```

You don't have to export it, just write an arrow function

The obsidian api is available, from there you can access the api of your enabled plugins as well

### Folder note aliases

Replace the inline display title of notes in a given folder to improve readability
(this won't change the title of the file)

### settings

- Folder: the folder where the note inline title display will be modified
- Formating function: a javascript function taking title as a single argument and returning a string


### Example
- Folder: Daily/Notes
- Formating function: `return moment(title, "YYYY-MM-DD ddd").format("ddd DD MMM");`

In this case the inline title of a note called "2023-11-07 Tue.md" will be displayed "Tue 07 Nov", shorter easier to read but not breaking the unicity and the sortability of the file

