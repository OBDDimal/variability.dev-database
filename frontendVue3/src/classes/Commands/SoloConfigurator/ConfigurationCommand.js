import {Command} from "@/classes/Commands/Command";
import {SelectionState} from "@/classes/Configurator/SelectionState";

export class ConfigurationCommand extends Command {
    constructor(featureModel, xml) {
        super();
        this.featureModel = featureModel;
        this.xml = xml;

        this.oldExplicitlySelectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
        this.oldUnselectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.Unselected);

        this.oldSatCount = this.featureModel.satCount;

        this.marked = false;
    }

    execute() {
        this.newExplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.newImplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.newExplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.newImplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.newUnselectedFeatures.forEach(f => f.selectionState = SelectionState.Unselected);

        this.featureModel.satCount = this.newSatCount;
    }

    undo() {
        this.oldExplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.oldUnselectedFeatures.forEach(f => f.selectionState = SelectionState.Unselected);

        this.featureModel.satCount = this.oldSatCount;
    }

    unmarkChanges() {
        this.marked = false;
    }

    markChanges() {
        this.marked = true;
    }

    formatScientificNotation(number) {
        const exponential = number.toExponential();
        const parts = exponential.split("e+");


        const coefficient = (Math.round(parseFloat(parts[0]) * 10, 2) / 10).toLocaleString("en-US");
        const exponent = parts[1];
        if (exponent < 8) {
            return new Intl.NumberFormat("en-US", {notation: 'standard'}).format(number);
        }
        return `${coefficient} * 10^${exponent}`;
    }
}
