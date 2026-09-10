package example.runtime.api.surface

interface SurfaceContract {
    fun contractMember() = Unit

    private fun hiddenContractMember() = Unit
}
