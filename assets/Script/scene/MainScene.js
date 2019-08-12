import JsNativeBridge from "../native/JsNativeBridge";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    /**@type {cc.Prefab} */
    _nodePrefab = null;
    
    onLoad() {
        cc.debug.setDisplayStats(false);

        cc.loader.loadRes(`prefab/challenge3`,cc.Prefab,(error,/**@type {cc.Prefab} */prefabClass)=>{
            this._nodePrefab = cc.instantiate(prefabClass);
            this._nodePrefab.parent = this.node;
        });
        
        //
        //
        let msg = {msg:`ios i love u真好啊!`};
        let returnValue = JsNativeBridge.callJs2Native("AppJsNative","showJs",JSON.stringify(msg),true);
        console.log("[JS]native的返回值:",returnValue);
        
    }
}