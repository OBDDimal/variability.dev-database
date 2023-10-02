import {ConfigurationCommand} from "@/classes/Commands/SoloConfigurator/ConfigurationCommand";
import {SelectionState} from "@/classes/Configurator/SelectionState";
import axios from 'axios';

export class DecisionPropagationCommand extends ConfigurationCommand {
    constructor(featureModel, xml, feature, newSelectionState) {
        super(featureModel, xml);
        this.feature = feature;
        this.newSelectionState = newSelectionState;
        this.executed = false;
        this.newSatCount = 0;

        if (this.newSelectionState === SelectionState.Unselected) {
            if (this.feature.selectionState === SelectionState.ExplicitlySelected) {
                this.description = "Undone selection"
            } else if (this.feature.selectionState === SelectionState.ExplicitlyDeselected) {
                this.description = "Undone deselection";
            }
        } else {
            if (newSelectionState === SelectionState.ExplicitlySelected) {
                this.description = "Selected"
            } else if (newSelectionState === SelectionState.ExplicitlyDeselected) {
                this.description = "Deselected";
            }
        }

        this.description +=  " " + (feature.name);
    }

    execute() {
        if (!this.executed) {
            this.featureModel.loading = true;
            this.feature.selectionState = this.newSelectionState;

            const selection = this.featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected).map(f => f.name);
            const deselection = this.featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected).map(f => f.name);

            const content = new TextEncoder().encode(this.xml);
            axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}propagation`,
              ({      name: this.featureModel.name+".xml",
                      selection: selection,
                      deselection: deselection,
                      content: Array.from(content)
              }))
                .then((d) => {
                    const data = d.data;
                    this.newSatCount = this.formatScientificNotation(data.satCount);

                    this.newExplicitlySelectedFeatures = this.featureModel.features.filter(f => selection.includes(f.name))
                    this.newImplicitlySelectedFeatures = this.featureModel.features.filter(f => data.impliedSelection.includes(f.name))
                    this.newExplicitlyDeselectedFeatures = this.featureModel.features.filter(f => deselection.includes(f.name))
                    this.newImplicitlyDeselectedFeatures = this.featureModel.features.filter(f => data.impliedDeselection.includes(f.name))
                    this.newUnselectedFeatures = this.featureModel.features.filter(f => !(selection.includes(f.name) || data.impliedSelection.includes(f.name) || deselection.includes(f.name) || data.impliedDeselection.includes(f.name)))

                    this.executed = true;
                    super.execute();
                    this.featureModel.loading = false;
                })
                .catch(() => {
                    this.featureModel.loading = false;
                });

        } else {
            super.execute();
        }
    }
}
