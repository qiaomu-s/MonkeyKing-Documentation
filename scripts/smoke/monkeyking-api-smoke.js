(function () {
    "use strict";

    var marker = "__SMOKE_MARKER__";
    var passed = [];

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    function test(name, body) {
        try {
            body();
            passed.push(name);
        } catch (error) {
            console.error(marker + ":FAIL:" + name + ":" + String(error));
            throw error;
        }
    }

    test("global", function () {
        assert(global.global === global, "global identity");
        assert(isNullish(null) && isNullish(void 0), "isNullish");
        var original = { nested: { value: 7 } };
        var cloned = structuredClone(original);
        cloned.nested.value = 8;
        assert(original.nested.value === 7, "structuredClone isolation");
        assert(monkeyking.versionName === "6.7.0", "Monkey King version");
    });

    test("conversion", function () {
        assert(Number(cvt.bytes(1024, "B", "KiB")) === 1, "cvt.bytes");
        assert(String(fmt.bytes(1024, "B", "KiB")).length > 0, "fmt.bytes");
    });

    test("text", function () {
        assert(String(pinyin.simple("中国")).length > 0, "pinyin.simple");
        assert(String(pinyin4j.of("中国")).length > 0, "pinyin4j.of");
        assert(nanoid(12).length === 12, "nanoid length");
        var parsedMime = mime("text/plain; charset=utf-8");
        assert(parsedMime.type === "text", "mime type");
        assert(parsedMime.subtype === "plain", "mime subtype");
    });

    var smokeRoot = files.join(
        files.getSdcardPath(),
        "MonkeyKing/.documentation-smoke-" + Date.now()
    );
    var textPath = files.join(smokeRoot, "sample.txt");
    var databasePath = files.join(smokeRoot, "sample.sqlite");
    var zipPath = files.join(smokeRoot, "sample.zip");
    var extractPath = files.join(smokeRoot, "unzipped");

    try {
        test("files", function () {
            files.createWithDirs(textPath);
            files.write(textPath, "Monkey King 6.7.0");
            assert(files.exists(textPath), "temporary file exists");
            assert(files.read(textPath) === "Monkey King 6.7.0", "temporary file contents");
        });

        test("sqlite", function () {
            var database = sqlite.open(databasePath);
            try {
                database.execSQL("CREATE TABLE smoke (id INTEGER PRIMARY KEY, value TEXT)");
                database.execSQL("INSERT INTO smoke(value) VALUES (?)", ["ok"]);
                var row = database.rawQuery("SELECT value FROM smoke", null).single();
                assert(row && row.value === "ok", "SQLite round trip");
            } finally {
                database.close();
            }
        });

        test("zip", function () {
            zip.zipFile(textPath, zipPath);
            assert(files.exists(zipPath), "zip archive exists");
            zip.unzip(zipPath, extractPath);
            assert(
                files.read(files.join(extractPath, "sample.txt")) === "Monkey King 6.7.0",
                "zip round trip"
            );
        });

        test("mediainfo", function () {
            var info = mediainfo(textPath);
            assert(info.path === textPath, "MediaInfo path");
            assert(typeof info.inform === "string", "MediaInfo inform");
        });
    } finally {
        files.removeDir(smokeRoot);
    }

    console.log(marker + ":PASS:" + passed.join(","));
})();
