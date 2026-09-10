package example.runtime.api.surface

open class SurfaceRoot {
    open fun overriddenMember() = "root"

    fun inheritedRoot() = Unit

    protected fun protectedRoot() = Unit

    private fun hiddenRoot() = Unit
}
