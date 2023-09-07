import {Command} from "@/classes/Commands/Command";
import {SelectionState} from "@/classes/Configurator/SelectionState";

export class ConfigurationCommand extends Command {
    constructor(featureModel) {
        super();
        this.featureModel = featureModel;

        this.oldExplicitlySelectedVersions = featureModel.versions.filter(v => v.selectionState === SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedVersions = featureModel.versions.filter(v => v.selectionState === SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedVersions = featureModel.versions.filter(v => v.selectionState === SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedVersions = featureModel.versions.filter(v => v.selectionState === SelectionState.ImplicitlyDeselected);
        this.oldUnselectedVersions = featureModel.versions.filter(v => v.selectionState === SelectionState.Unselected);

        this.oldExplicitlySelectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
        this.oldUnselectedFeatures = featureModel.features.filter(f => f.selectionState === SelectionState.Unselected);

        this.oldSatCount = this.featureModel.satCount;

        this.marked = false;
    }

    execute() {
        this.newExplicitlySelectedVersions.forEach(v => v.selectionState = SelectionState.ExplicitlySelected);
        this.newImplicitlySelectedVersions.forEach(v => {
            v.selectionState = SelectionState.ImplicitlySelected;
            v.selectionStateDescription = "Version with same root id is selected: " + this.newExplicitlySelectedVersions.filter(i => i.rootId === v.rootId).map(i => i.version);
        });
        this.newExplicitlyDeselectedVersions.forEach(v => v.selectionState = SelectionState.ExplicitlyDeselected);
        this.newImplicitlyDeselectedVersions.forEach(v => v.selectionState = SelectionState.ImplicitlyDeselected);
        this.newUnselectedVersions.forEach(v => v.selectionState = SelectionState.Unselected);

        if (this.newImplicitlySelectedVersions.length === 0 && this.newExplicitlySelectedVersions.length === 0 && this.newUnselectedVersions.length === 1) {
            this.newUnselectedVersions[0].selectionState = SelectionState.ImplicitlySelected;
            this.newUnselectedVersions[0].selectionStateDescription = "The only available version";
        }

        this.newExplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.newImplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.newExplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.newImplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.newUnselectedFeatures.forEach(f => f.selectionState = SelectionState.Unselected);

        this.featureModel.satCount = this.newSatCount;
    }

    undo() {
        this.oldExplicitlySelectedVersions.forEach(v => v.selectionState = SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedVersions.forEach(v => v.selectionState = SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedVersions.forEach(v => v.selectionState = SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedVersions.forEach(v => v.selectionState = SelectionState.ImplicitlyDeselected);
        this.oldUnselectedVersions.forEach(v => v.selectionState = SelectionState.Unselected);

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
