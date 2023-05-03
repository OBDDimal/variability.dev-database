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
        this.newImplicitlySelectedVersions.forEach(v => v.selectionState = SelectionState.ImplicitlySelected);
        this.newExplicitlyDeselectedVersions.forEach(v => v.selectionState = SelectionState.ExplicitlyDeselected);
        this.newImplicitlyDeselectedVersions.forEach(v => v.selectionState = SelectionState.ImplicitlyDeselected);
        this.newUnselectedVersions.forEach(v => v.selectionState = SelectionState.Unselected);

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
}