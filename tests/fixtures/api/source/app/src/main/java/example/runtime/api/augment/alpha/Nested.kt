package example.runtime.api.augment.alpha

object Nested : Augmentable(), Constructable {
    override val selfAssignmentFunctions = listOf(
        ::ping.name,
    )

    override fun construct(vararg args: Any?) = args

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    fun ping(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = true
}
