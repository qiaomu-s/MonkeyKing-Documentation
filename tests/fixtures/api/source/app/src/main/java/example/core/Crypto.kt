package example.core

object Crypto {
    @JvmStatic
    fun digest(value: String) = value

    @JvmStatic
    fun encrypt(value: String) = value

    private fun cipher(value: String) = value
}
