import {ConfigurationCommand} from "@/classes/Commands/Configurator/ConfigurationCommand";
import {SelectionState} from "@/classes/Configurator/SelectionState";

export class RollbackFixCTCCommand extends ConfigurationCommand {
    constructor(featureModel, commandManger, constraint) {
        super(featureModel);
        this.constraint = constraint;
        this.commandManager = commandManger;
        this.executed = false;
        this.newSatCount = 0;
        this.rollbackCommand = undefined;

        this.description = "Rollback fix constraint";
    }

    execute() {
        if (!this.executed) {
            this.featureModel.loading = true;

            const commands = this.commandManager.historyCommands.filter(command => command instanceof ConfigurationCommand).reverse();

            for (let i in commands) {
                const command = commands[i];
                command.newExplicitlySelectedVersions.forEach(v => v.selectionStateTmp = SelectionState.ExplicitlySelected);
                command.newImplicitlySelectedVersions.forEach(v => v.selectionStateTmp = SelectionState.ImplicitlySelected);
                command.newExplicitlyDeselectedVersions.forEach(v => v.selectionStateTmp = SelectionState.ExplicitlyDeselected);
                command.newImplicitlyDeselectedVersions.forEach(v => v.selectionStateTmp = SelectionState.ImplicitlyDeselected);
                command.newUnselectedVersions.forEach(v => v.selectionStateTmp = SelectionState.Unselected);

                command.newExplicitlySelectedFeatures.forEach(f => f.selectionStateTmp = SelectionState.ExplicitlySelected);
                command.newImplicitlySelectedFeatures.forEach(f => f.selectionStateTmp = SelectionState.ImplicitlySelected);
                command.newExplicitlyDeselectedFeatures.forEach(f => f.selectionStateTmp = SelectionState.ExplicitlyDeselected);
                command.newImplicitlyDeselectedFeatures.forEach(f => f.selectionStateTmp = SelectionState.ImplicitlyDeselected);
                command.newUnselectedFeatures.forEach(f => f.selectionStateTmp = SelectionState.Unselected);

                if (this.constraint.evaluate(true) !== false) {
                    this.rollbackCommand = command;
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

