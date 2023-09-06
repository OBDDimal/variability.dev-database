export class ConfiguratorManager {
    constructor() {
        this.commands = [];
        this.historyCommands = [];
        this.futureCommands = [];
    }

    execute(command) {
        // Execute current command and push it on stack.
        command.execute();

        // Mark last change
        if (this.historyCommands.length) {
            this.historyCommands.at(-1).unmarkChanges();
        }
        command.markChanges();

        this.historyCommands.push(command);
        this.commands = [...this.historyCommands].reverse();

        // Reset stack of future commands because a new command was already executed.
        this.futureCommands = [];
    }

    undo() {
        if (this.historyCommands.length) {
            // Remove last command from stack and undo it.
            const undoCommand = this.historyCommands.pop();
            undoCommand.undo();

            // Mark last change
            undoCommand.unmarkChanges();
            if (this.historyCommands.length) {
                this.historyCommands.at(-1).markChanges();
            }

            // After that push it to stack that only holds redo-commands.
            this.futureCommands.push(undoCommand);
        }
    }

    redo() {
        if (this.futureCommands.length) {
            // Remove last command from stack and execute it once again.
            const redoCommand = this.futureCommands.pop();
            redoCommand.execute();

            // Mark last change
            if (this.historyCommands.length) {
                this.historyCommands.at(-1).unmarkChanges();
            }
            redoCommand.markChanges();

            // After that push it to stack that only holds undo-commands.
            this.historyCommands.push(redoCommand);
        }
    }

    redoCommand(command) {
        command.execute();

        // Mark last change
        if (this.historyCommands.length) {
            this.historyCommands.at(-1).unmarkChanges();
        }
        command.markChanges();

        const commandIndex = this.commands.indexOf(command);
        this.futureCommands = this.commands.slice(0, commandIndex);
        this.historyCommands = [...this.commands.slice(commandIndex)].reverse()
    }

    isUndoAvailable() {
        return this.historyCommands.length >= 1;
    }

    isRedoAvailable() {
        return this.futureCommands.length >= 1;
    }
}
