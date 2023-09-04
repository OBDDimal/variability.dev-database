import * as commandFactory from "@/classes/Commands/CommandFactory";
import * as update from '@/services/FeatureModel/update.service.js';
import { getColorsFromService } from '@/services/FeatureModel/colorsFromService.service';
import { ReloadCommand } from '@/classes/Commands/ReloadCommand';

export class CommandManager {
    constructor() {
        this.historyCommands = [];
        this.futureCommands = [];
        this.collaborationManager = null;
        this.type = null;
        this.remoteCommands = null;
        this.commandEvent = null;
        this.d3Data = null;
    }

    executeReload(){
      this.fadeOut(this.d3Data, new ReloadCommand());
    }

    execute(command, initiator = true) {
        if (initiator && this.collaborationManager) {
            this.collaborationManager.send(this.type, 'execute', command.createDTO());
        }

        // Execute current command and push it on stack.
        command.execute();

        // Mark last change
        if (this.historyCommands.length) {
            this.historyCommands.at(-1).unmarkChanges();
        }
        command.markChanges();

        this.historyCommands.push(command);

        // Reset stack of future commands because a new command was already executed.
        this.futureCommands = [];

        this.commandEvent();

        this.fadeOut(this.d3Data, command);
    }

    undo(initiator = true) {
        if (this.historyCommands.length) {
            if (initiator && this.collaborationManager) {
                this.collaborationManager.send(this.type, 'undo');
            }

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

            this.commandEvent();

            this.fadeOut(this.d3Data, undoCommand);
        }
    }

    redo(initiator = true) {
        if (this.futureCommands.length) {
            if (initiator && this.collaborationManager) {
                this.collaborationManager.send(this.type, 'redo');
            }

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

            this.commandEvent();

            this.fadeOut(this.d3Data, redoCommand);
        }
    }

    isUndoAvailable() {
        return this.historyCommands.length >= 1;
    }

    isRedoAvailable() {
        return this.futureCommands.length >= 1;
    }

    executeRemoteCommands(rootNode, constraints) {
        if (this.remoteCommands) {
            this.remoteCommands.historyCommands.forEach(commandData => {
                const command = commandFactory.create(rootNode, constraints, commandData.type, commandData.data, this.collaborationManager.featureModel);
                this.execute(command, false);
            });

            this.remoteCommands.futureCommands.forEach(commandData => {
                const command = commandFactory.create(rootNode, constraints, commandData.type, commandData.data, this.collaborationManager.featureModel);
                this.execute(command, false);
            });

            this.remoteCommands.futureCommands.forEach(() => this.undo(false));
        }
    }

    fadeOut(d3Data, command) {
        if(command instanceof ReloadCommand){
            if(d3Data.coloringIndex < 1) {
                getColorsFromService(this.collaborationManager.featureModel.data, d3Data).then(
                  value => {
                    if (!value) {
                      d3Data.coloringIndex = 0;
                    } else {
                      d3Data.coloringIndex = -1;
                    }
                  }
                );
            }
            // Rerender for edits and fade them out
            setTimeout(() => {
                command.unmarkChanges();
                update.updateSvg(d3Data);
            }, 500);
        } else if(this.type !== 'constraint') {
            if(d3Data.coloringIndex < 1) {
                getColorsFromService(this.collaborationManager.featureModel.data, d3Data).then(
                  value => {
                    if (!value) {
                      d3Data.coloringIndex = 0;
                    } else {
                      d3Data.coloringIndex = -1;
                    }
                  }
                );
            }
            // Rerender for edits and fade them out
            setTimeout(() => {
                command.unmarkChanges();
                update.updateSvg(d3Data);
            }, 3000);
        } else {
            if(this.collaborationManager.featureModelCommandManager.d3Data.coloringIndex < 1) {
                getColorsFromService(this.collaborationManager.featureModel.data, this.collaborationManager.featureModelCommandManager.d3Data).then(
                  value => {
                    if (!value) {
                      this.collaborationManager.featureModelCommandManager.d3Data.coloringIndex = 0;
                    } else {
                      this.collaborationManager.featureModelCommandManager.d3Data.coloringIndex = -1;
                    }
                  }
                );
            }
            // Rerender for edits and fade them out
            setTimeout(() => {
                command.unmarkChanges();
                update.updateSvg(this.collaborationManager.featureModelCommandManager.d3Data);
            }, 500);
        }
    }
}
