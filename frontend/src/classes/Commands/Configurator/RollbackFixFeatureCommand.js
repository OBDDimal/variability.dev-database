import {ConfigurationCommand} from "@/classes/Commands/Configurator/ConfigurationCommand";

export class RollbackFixFeatureCommand extends ConfigurationCommand {
    constructor(featureModel, commandManger, feature) {
        super(featureModel);
        this.feature = feature;
        this.commandManager = commandManger;
        this.executed = false;
        this.newSatCount = 0;
        this.rollbackCommand = undefined;

        this.description = "Rollback fix " + this.feature.name;
    }

    execute() {
        if (!this.executed) {
            this.featureModel.loading = true;

            const commands = this.commandManager.historyCommands.filter(command => command instanceof ConfigurationCommand).reverse();

            for (let i in commands) {
                if (commands[i].newUnselectedFeatures.includes(this.feature)) {
                    this.rollbackCommand = commands[i];
                    break;
                }
            }

            if (this.rollbackCommand) {
                this.newExplicitlySelectedVersions = this.rollbackCommand.newExplicitlySelectedVersions;
                this.newImplicitlySelectedVersions = this.rollbackCommand.newImplicitlySelectedVersions;
                this.newExplicitlyDeselectedVersions = this.rollbackCommand.newExplicitlyDeselectedVersions;
                this.newImplicitlyDeselectedVersions = this.rollbackCommand.newImplicitlyDeselectedVersions;
                this.newUnselectedVersions = this.rollbackCommand.newUnselectedVersions;

                this.newExplicitlySelectedFeatures = this.rollbackCommand.newExplicitlySelectedFeatures;
                this.newImplicitlySelectedFeatures = this.rollbackCommand.newImplicitlySelectedFeatures;
                this.newExplicitlyDeselectedFeatures = this.rollbackCommand.newExplicitlyDeselectedFeatures;
                this.newImplicitlyDeselectedFeatures = this.rollbackCommand.newImplicitlyDeselectedFeatures;
                this.newUnselectedFeatures = this.rollbackCommand.newUnselectedFeatures;

                this.newSatCount = this.rollbackCommand.newSatCount;

                this.executed = true;
            }

            super.execute();
            this.featureModel.loading = false;
        } else {
            super.execute();
        }
    }
}

