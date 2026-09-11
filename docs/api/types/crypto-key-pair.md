# CryptoKeyPair

CryptoKeyPair 是 `com.qiaomu.monkeyking.core.crypto.Crypto.KeyPair` 的子类, 其实例可代表一个公私密钥对, 主要用于 [密文](../utilities/crypto.md) 模块.

常见相关方法或属性:

- [crypto.generateKeyPair](../utilities/crypto.md#m-generatekeypair)
- [crypto.KeyPair](../utilities/crypto.md#c-keypair)::new

> 注：本页展开 `CryptoKeyPair` 自有成员；继承成员请参阅 Java/Android 官方参考。

---

<p style="font: bold 2em sans-serif; color: #FF7043">CryptoKeyPair</p>

---

## [p] publicKey

- { [CryptoKey](crypto-key.md) } - 公钥

用于非对称加密的公钥.

```js
let kp = crypto.generateKeyPair('RSA', 256);
console.log(kp.publicKey);
```

## [p] privateKey

- { [CryptoKey](crypto-key.md) } - 私钥

用于非对称加密的私钥.

```js
let kp = crypto.generateKeyPair('DSA', 1024);
console.log(kp.privateKey);
```

## [m] toKeySpec

### toKeySpec(transformation)

- **transformation** { [CryptoCipherTransformation](data-types.md#cryptociphertransformation) } - 密码转换名称
- <ins>**returns**</ins> { [java.security.Key](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/security/class-use/Key.html) } Java 密钥

由密码对生成一个指定算法的 Java 密钥 (Java Key).

`toKeySpec` 中的 "spec" 全称为 "specification", 意为 "规范". 因此, 此方法可理解为将密钥对转换为一个规范的密钥.

需额外留意, 此方法不能通过构造函数生成的实例进行访问, 只能通过 [crypto.generateKeyPair](../utilities/crypto.md#m-generatekeypair) 的返回值进行访问:

```js
/* 抛出异常. */
new crypto.KeyPair('pub', 'pri').toKeySpec('DES');

/* 无异常. */
crypto.generateKeyPair('DiffieHellman').toKeySpec('DES');
```

`toKeySpec` 方法的实际应用, 可参考 [crypto.generateKeyPair](../utilities/crypto.md#m-generatekeypair) 小节的示例.

> 注: 如需转换为 `crypto.Key`, 可使用 `new crypto.Key(key)`.
