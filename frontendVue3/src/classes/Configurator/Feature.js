import {SelectionState} from "@/classes/Configurator/SelectionState";

export class Feature {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.selectionState = SelectionState.Unselected;
        this.featureNodes = [];
        this.constraints = [];
    }

    toConfigString(){
      let configText = '';

      switch (this.selectionState){
        case SelectionState.ImplicitlySelected:
          configText = "automatic=\"selected\"";
          break;
        case SelectionState.ExplicitlySelected:
          configText = "manual=\"selected\"";
          break;
        case SelectionState.ImplicitlyDeselected:
          configText = "automatic=\"deselected\"";
          break;
        case SelectionState.ExplicitlyDeselected:
          configText = "manual=\"deselected\"";
          break;
        case 'Unselected':
          break;
      }

      return `<feature ${configText} name="${this.name}"/>`
    }
}
