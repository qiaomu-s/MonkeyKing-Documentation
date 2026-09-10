package example.runtime.api.augment.alpha

class Alpha(private val scriptRuntime: ScriptRuntime) : Augmentable(scriptRuntime), Invokable {
    override val selfAssignmentProperties = listOf(
        "answer" to nestedValue(40, plus(2)),
    )

    override val globalAssignmentProperties = listOf(
        "GLOBAL_VALUE" to 7,
    )

    override val selfAssignmentFunctions = listOf(
        ::run.name,
        ::`var`.name,
        // ::commentedOut.name,
        (::fetch.name to listOf(::fetch.name, "get")) to AS_GLOBAL,
        ::shared.name to AS_GLOBAL,
    )

    override val globalAssignmentFunctions = listOf(
        ::globalOnly.name,
        ::renamed.name to listOf("renamedGlobal", "renamedGlobalAlias"),
    )

    override val selfAssignmentGetters = listOf<Pair<String, Supplier<Any?>>>(
        "state" to Supplier { nestedState(one(), two()) },
    )

    override val selfAssignmentJavaClasses = listOf(
        "Thing" to Thing::class,
    )

    @RhinoRuntimeFunctionInterface
    override fun invoke(vararg args: Any?) = args

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    // @Signature run(value: string): string;
    // @Overload run(value: number): number;
    fun run(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = args

    @JvmStatic
    @ScriptInterface
    // @Signature `var`(value: string): string;
    // @Overload
    // `var`(value: number): number;
    fun `var`(value: Any?) = value

    @ScriptInterface
    private fun privateAnnotated() = Unit

    fun publicAfterPrivateAnnotation() = Unit

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    fun fetch(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = args

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    fun shared(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = args

    @JvmStatic
    @RhinoRuntimeFunctionInterface
    fun renamed(scriptRuntime: ScriptRuntime, args: Array<out Any?>) = args

    @JvmStatic
    @ScriptInterface
    fun javaVisible() = true
}
