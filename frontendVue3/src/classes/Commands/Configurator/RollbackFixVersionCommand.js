import {RollbackCommand} from "@/classes/Commands/Configurator/RollbackCommand";
import {ConfigurationCommand} from "@/classes/Commands/Configurator/ConfigurationCommand";

export class RollbackFixVersionCommand extends RollbackCommand {
    constructor(featureModel, commandManger, version, initialResetCommand) {
        super(featureModel, commandManger, initialResetCommand);
        this.version = version;
        this.description = "Rollback fix version " + this.version.version;
    }

    execute() {
        this.featureModel.loading = true;

        if (!this.executed) {
            const commands = this.commandManager.historyCommands.filter(command => command instanceof ConfigurationCommand).reverse();

            for (let i in commands) {
                if (commands[i].newUnselectedVersions.includes(this.version)) {
                    this.rollbackCommand = commands[i];
                    break;
                }
            }
        }
        super.execute();
    }
}
