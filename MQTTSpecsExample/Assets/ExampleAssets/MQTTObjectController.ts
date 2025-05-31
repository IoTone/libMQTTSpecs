import {Interactable} from "../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {validate} from "../SpectaclesInteractionKit/Utils/validate"
import {ToggleButton} from "../SpectaclesInteractionKit/Components/UI/ToggleButton/ToggleButton"


@component
export class MQTTObjectController extends BaseScriptComponent {
    @input
    sobj!: SceneObject
    @input
    toggles!: ToggleButton
    
    
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart()
        })
    }
    
    onStart() {
        print("onStart() ...");
        
        this.toggles.onStateChanged.add(
            (isToggledOn: boolean) => {
            if (isToggledOn) {
                print("toggleOn");
                // this.launchPlatform.enabled = true
            } else {
                // this.launchPlatform.enabled = false
                print("toggleOff");
            }
            },
       );
    }
    
    
}
