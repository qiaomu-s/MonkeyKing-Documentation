package example.core;

public class BaseDatabase extends GrandDatabase implements DatabaseContract {
    public String inheritedParent() {
        return "parent";
    }

    public String inheritedOverride() {
        return "parent";
    }

    protected void protectedParent() {}

    private void hiddenParent() {}
}
