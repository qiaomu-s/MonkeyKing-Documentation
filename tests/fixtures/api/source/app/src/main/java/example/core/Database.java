package example.core;

public class Database {
    public final String name = "fixture";

    public void execSQL(String sql) {}

    public String query(String sql) {
        return sql;
    }

    private void hiddenHelper() {}
}
