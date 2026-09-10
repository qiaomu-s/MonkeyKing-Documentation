package example.runtime.api.augment.alpha

class ResultSurface {
    @RhinoStandardFunctionInterface
    fun close() = Unit

    @ScriptInterface
    private fun secret() = Unit

    fun visibleButUnannotated() = Unit

    @ScriptInterface
    companion object {
        fun companionLeak() = Unit
    }

    fun afterCompanion() = Unit
}
