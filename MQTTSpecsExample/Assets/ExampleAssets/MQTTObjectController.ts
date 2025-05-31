import {Interactable} from "../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable"
import {validate} from "../SpectaclesInteractionKit/Utils/validate"
import {ToggleButton} from "../SpectaclesInteractionKit/Components/UI/ToggleButton/ToggleButton"
import {MQTTClient} from "../mqttlib/client/client";


@component
export class MQTTObjectController extends BaseScriptComponent {
    @input
    sobj!: SceneObject
    @input
    toggles!: ToggleButton
    
    
    async onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
        const mqttClient = new MQTTClient("wss://mqtt.eclipseprojects.io:443/mqtt ", {timeout: 10000}, this);
        const connack = await mqttClient.connect({cleanStart: true, keepAlive: 0});
        print("Started mqtt");
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
