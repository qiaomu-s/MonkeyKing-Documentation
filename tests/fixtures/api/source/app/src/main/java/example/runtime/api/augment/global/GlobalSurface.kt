package example.runtime.api.augment.global

class GlobalSurface {
    @JvmField
    val Thing = String::class

    @ScriptInterface
    fun find() = Unit
}
