package example.runtime.api

object LegacyUtil {
    fun `class`(value: Any?) = value

    fun getClass(value: Any?) = value

    private fun hiddenHelper() = Unit
}
