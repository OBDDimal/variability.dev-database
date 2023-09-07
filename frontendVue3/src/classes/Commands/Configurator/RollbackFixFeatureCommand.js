import {ConfigurationCommand} from "@/classes/Commands/Configurator/ConfigurationCommand";
import {RollbackCommand} from "@/classes/Commands/Configurator/RollbackCommand";

export class RollbackFixFeatureCommand extends RollbackCommand {
    constructor(featureModel, commandManger, feature, initialResetCommand) {
        super(featureModel, commandManger, initialResetCommand);
        this.feature = feature;
        this.description = "Rollback fix feature" + this.feature.name;
    }

    execute() {
        this.featureModel.loading = true;

        if (!this.executed) {
            const commands = this.commandManager.historyCommands.filter(command => command instanceof ConfigurationCommand).reverse();

            for (let i in commands) {
                if (commands[i].newUnselectedFeatures.includes(this.feature)) {
                    this.rollbackCommand = commands[i];
                    break;
                }
            }
        }
        super.execute();
    }
}
