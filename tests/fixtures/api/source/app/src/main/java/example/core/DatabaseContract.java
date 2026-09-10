package example.core;

public interface DatabaseContract {
    default String inheritedInterface() {
        return "interface";
    }

    private void hiddenInterface() {}
}
