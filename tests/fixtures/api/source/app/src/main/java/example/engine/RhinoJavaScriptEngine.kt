package example.engine

class RhinoJavaScriptEngine {
    fun init() {
        scriptable.defineProp("global", scriptable, PERMANENT)
        scriptable.defineProp("__engine__", this, READONLY or DONTENUM or PERMANENT)
        scriptable.defineProp("Promise", runtime.js_Promise, READONLY or PERMANENT)
        scriptable.defineProp("ResultAdapter", runtime.js_ResultAdapter, READONLY or PERMANENT)
    }
}
