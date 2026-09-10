package example.runtime.api

class AppUtils(@get:ScriptInterface val fileProviderAuthority: String = "fixture") {
    @ScriptInterface
    fun ensureInstalled(packageName: String) = packageName

    @ScriptInterface
    private fun privateAnnotated() = Unit

    companion object {
        @JvmStatic
        @ScriptInterface
        fun isActivityShortForm(value: String) = value.isNotEmpty()
    }
}
