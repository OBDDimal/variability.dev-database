import {ConfigurationCommand} from "@/classes/Commands/Configurator/ConfigurationCommand";
import api from "@/services/api.service";

export class ResetCommand extends ConfigurationCommand {
    constructor(featureModel ) {
        super(featureModel);
        this.executed = false;
        this.newSatCount = 0;

        this.description = "Reset";
    }

    execute() {
        if (!this.executed) {
            this.featureModel.loading = true;
            api.post(`${import.meta.env.VITE_APP_DOMAIN}configurator/decision-propagation`, ({"name": this.featureModel.productLineName, "config": [], "selected_roots": [], "available_roots": []}))
                .then((d) => {
                    const data = d.data;
                    this.newSatCount = this.formatScientificNotation(data.count);

                    this.newExplicitlySelectedVersions = [];
                    this.newImplicitlySelectedVersions = this.featureModel.versions.filter(v => data.selected_roots.includes(v.rootId))
                    this.newExplicitlyDeselectedVersions = [];
                    this.newImplicitlyDeselectedVersions = this.featureModel.versions.filter(v => data.deselected_roots.includes(v.rootId))
                    this.newUnselectedVersions = this.featureModel.versions.filter(v => data.available_roots.includes(v.rootId))

                    this.newExplicitlySelectedFeatures = [];
                    this.newImplicitlySelectedFeatures = this.featureModel.features.filter(f => data.implicit_selected_vars.includes(f.id))
                    this.newExplicitlyDeselectedFeatures = [];
                    this.newImplicitlyDeselectedFeatures = this.featureModel.features.filter(f => data.implicit_deselected_vars.includes(f.id))
                    this.newUnselectedFeatures = this.featureModel.features.filter(f => data.available_vars.includes(f.id))

                    this.executed = true;

                    this.markAllFeaturesAsPermanantImplicit();
                    super.execute();
                    this.featureModel.loading = false;
                    this.featureModel.loadingOpacity = 0.5;
                })
                .catch(() => {
                    this.featureModel.loading = false;
                });

        } else {
            super.execute();
        }
    }

    markAllFeaturesAsPermanantImplicit() {
        this.newImplicitlySelectedFeatures.forEach(f => f.fix = true);
        this.newImplicitlyDeselectedFeatures.forEach(f => f.fix = true);
    }

    copy() {
        const command = new ResetCommand(this.featureModel);
        command.newSatCount = this.newSatCount;

        command.newExplicitlySelectedVersions = this.newExplicitlySelectedVersions;
        command.newImplicitlySelectedVersions = this.newImplicitlySelectedVersions;
        command.newExplicitlyDeselectedVersions = this.newExplicitlyDeselectedVersions;
        command.newImplicitlyDeselectedVersions = this.newImplicitlyDeselectedVersions;
        command.newUnselectedVersions = this.newUnselectedVersions;

        command.newExplicitlySelectedFeatures = this.newExplicitlySelectedFeatures;
        command.newImplicitlySelectedFeatures = this.newImplicitlySelectedFeatures;
        command.newExplicitlyDeselectedFeatures = this.newExplicitlyDeselectedFeatures;
        command.newImplicitlyDeselectedFeatures = this.newImplicitlyDeselectedFeatures;
        command.newUnselectedFeatures = this.newUnselectedFeatures;

        command.executed = true;
        return command;
    }
}
