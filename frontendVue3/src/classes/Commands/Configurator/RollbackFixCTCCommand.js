import { RollbackCommand } from '@/classes/Commands/Configurator/RollbackCommand';
import { ConfigurationCommand } from '@/classes/Commands/Configurator/ConfigurationCommand';
import { SelectionState } from '@/classes/Configurator/SelectionState';

export class RollbackFixCTCCommand extends RollbackCommand {
    constructor(featureModel, commandManger, constraint, initialResetCommand) {
        super(featureModel, commandManger, initialResetCommand);
        this.constraint = constraint;
        this.description = "Rollback fix constraint";
    }

    execute() {
        this.featureModel.loading = true;

        if (!this.executed) {

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
        }
        super.execute();
    }
}
