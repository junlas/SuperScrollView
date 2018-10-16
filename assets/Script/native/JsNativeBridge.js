

export default class JsNativeBridge {

    static Debug = true;

    /**
     * native 调用 js 的回调监听<br/>
     * 
     */
    static callJsFromNative(dataStr) {
        console.log(`[JS]native调用JS,dataStr:${dataStr};    dataObj:${JSON.parse(dataStr)}`);
    }

    /**
     *  js调用native方法（Android，ios）
     * 
     *  ios 和 android 调用的区别:
     * 
     *         ios:    AppGame.callStatic('GameLoginSdk' , 'gameLogin' , param, false);
     *
     *     android:   AppGame.callStatic('org/cocos2dx/javascript/GameLoginSdk','gameLogin' , param , false);
     * 
     * 
     * @param clsName 类型
     * @param methodName
     * @param param     var param = {};
                        param.msg = object.msg;
                        param = JSON.stringify(param);
     * @param isReturn 是否有返回值
     */
    static callJs2Native(clsName,methodName,param = null,isReturn = false){
        if(!cc.sys.isNative){
            return;
        }

        if(JsNativeBridge.Debug) {
            console.log(`[JS]js调用Native,clsName:${clsName}; methodName:${methodName}; param:${param}; isReturn:${isReturn}`);
        }

        let rtn = null;
        if (cc.sys.os == cc.sys.OS_IOS) {
            if(param != null) {
                rtn = jsb.reflection.callStaticMethod(clsName, methodName + ':' , param);
            }
            else{
                rtn = jsb.reflection.callStaticMethod(clsName, methodName);
            }
        }
        else if (cc.sys.os == cc.sys.OS_ANDROID) {
            // 无参数无返回值
            var desc = "()V"
            // 有参数string有返回值string
            if(isReturn && param != null)desc = "(Ljava/lang/String;)Ljava/lang/String;"
            // 无参数有返回值string
            else if(isReturn)desc = "()Ljava/lang/String;"
            // 有参数string无返回值
            else if(param != null)desc = "(Ljava/lang/String;)V"
            
            if(param != null) {
                rtn = jsb.reflection.callStaticMethod(clsName, methodName, desc, param);
            }
            else{
                rtn = jsb.reflection.callStaticMethod(clsName, methodName, desc);
            }
        }
        return rtn;
    }
}

window["JsNativeBridge"] = JsNativeBridge;