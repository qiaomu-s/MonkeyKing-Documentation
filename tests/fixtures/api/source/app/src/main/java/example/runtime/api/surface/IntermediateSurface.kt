package example.runtime.api.surface

open class IntermediateSurface : SurfaceRoot(), SurfaceContract {
    override fun overriddenMember() = "intermediate"

    fun inheritedIntermediate() = Unit
}
