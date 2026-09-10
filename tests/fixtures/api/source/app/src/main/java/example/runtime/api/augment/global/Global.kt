package example.runtime.api.augment.global

class Global(private val scriptRuntime: ScriptRuntime) : Augmentable(scriptRuntime) {
    override val selfAssignmentFunctions = listOf(
        ::globalHelper.name,
        ::shared.name,
    )

    override val selfAssignmentGetters = listOf(
        "axios" to Supplier { scriptRuntime.js_mod_axios },
    )

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    fun globalHelper(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = true

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    fun shared(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = true
}
