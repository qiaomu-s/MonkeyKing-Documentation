package example.runtime.api.augment.dynamic

object DynamicKey : Augmentable(), Invokable {
    override val key = generatedKey(BuildConfig.FLAVOR)
    override val selfAssignmentFunctions = generatedFunctions()
}
