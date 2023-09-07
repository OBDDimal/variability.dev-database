import {ConfigurationCommand} from "@/classes/Commands/Configurator/ConfigurationCommand";

export class RollbackCommand extends ConfigurationCommand {
    constructor(featureModel, commandManger, initialResetCommand) {
        super(featureModel);
        this.initialResetCommand = initialResetCommand;
        this.commandManager = commandManger;
        this.executed = false;
        this.newSatCount = 0;
        this.rollbackCommand = this.initialResetCommand;
    }

    execute() {
        if (!this.executed) {
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
        }

        this.executed = true;
        super.execute();
        this.featureModel.loading = false;
    }
}
