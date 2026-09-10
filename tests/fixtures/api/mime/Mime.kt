package example.runtime.api

object Mime {
    val stringDecoy = "@JvmField val FAKE_STRING = \"text/fake\""

    // @JvmField val FAKE_LINE = "text/fake"
    /*
     * @JvmField
     * val FAKE_BLOCK = "text/fake"
     */

    @JvmField
    val APPLICATION_JSON = "application/json"

    @JvmField
    val APPLICATION_JSON_ALIAS = APPLICATION_JSON // compatibility alias
}
