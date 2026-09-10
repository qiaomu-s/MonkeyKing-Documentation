package example.runtime

import example.core.Crypto as CoreCrypto
import example.runtime.api.AppUtils
import example.runtime.api.LegacyUtil
import example.runtime.api.augment.alpha.Alpha
import example.runtime.api.augment.alpha.Nested as NestedAlias
import example.runtime.api.augment.dynamic.DynamicKey
import example.runtime.api.augment.global.Global
import example.runtime.api.augment.proxy.Proxy

class ScriptRuntime {
    private val legacyUtil: LegacyUtil = LegacyUtil
    private val appUtils = AppUtils()

    private fun augment(target: ScriptableObject) {
        // Ignored(this).augment(target, true)
        val ignored = "StringOnly(this).augment(target, true)"

        Global(this).assignWithRuntime(target, this)
        Alpha(this).augment(target, legacyUtil, true).also { alpha ->
            NestedAlias.augmentWithRuntime(alpha, this, appUtils, false)
        }
        DynamicKey.augmentWithRuntime(target, this, CoreCrypto, true)
        Proxy(this).proxying(target, appUtils, true)
    }

    private fun initEpilogue() {
        callFunction(this, js_structured_clone, topLevelScope, topLevelScope, arrayOf(topLevelScope))
        topLevelScope.defineProp("Module", js_Module, PERMANENT)
        topLevelScope.defineProp("require", js_Module.prop("require"), PERMANENT)
    }
}
