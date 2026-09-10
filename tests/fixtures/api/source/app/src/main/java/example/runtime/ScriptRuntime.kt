package example.runtime

import example.runtime.api.augment.alpha.Alpha
import example.runtime.api.augment.alpha.Nested as NestedAlias
import example.runtime.api.augment.dynamic.DynamicKey
import example.runtime.api.augment.global.Global

class ScriptRuntime {
    private fun augment(target: ScriptableObject) {
        // Ignored(this).augment(target, true)
        val ignored = "StringOnly(this).augment(target, true)"

        Global(this).assignWithRuntime(target, this)
        Alpha(this).augment(target, true).also { alpha ->
            NestedAlias.augmentWithRuntime(alpha, this, false)
        }
        DynamicKey.augmentWithRuntime(target, this, true)
    }

    private fun initEpilogue() {
        callFunction(this, js_structured_clone, topLevelScope, topLevelScope, arrayOf(topLevelScope))
        topLevelScope.defineProp("Module", js_Module, PERMANENT)
        topLevelScope.defineProp("require", js_Module.prop("require"), PERMANENT)
    }
}
