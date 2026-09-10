package example.core;

public class Database extends BaseDatabase {
    public final String name = "fixture";

    @Override
    public String inheritedOverride() {
        return "database";
    }

    public void execSQL(String sql) {}

    public String query(String sql) {
        return sql;
    }

    private void hiddenHelper() {}
}
