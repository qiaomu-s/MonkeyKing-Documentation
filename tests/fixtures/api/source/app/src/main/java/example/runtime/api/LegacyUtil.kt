package example.runtime.api

import example.runtime.api.surface.CycleOne
import example.runtime.api.surface.IntermediateSurface as SurfaceAlias

object LegacyUtil : SurfaceAlias(), CycleOne {
    override fun overriddenMember() = "legacy"

    fun `class`(value: Any?) = value

    fun getClass(value: Any?) = value

    private fun hiddenHelper() = Unit

    private data class HiddenNested(val nestedLeak: String)

    class PublicNested(val publicNestedLeak: String)
}
