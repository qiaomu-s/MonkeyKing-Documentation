import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function markdown(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('fixed-source runtime reference contracts', () => {
  test('records continuation rejection as recovery data and warns about nullish hangs', () => {
    const continuation = markdown('docs/api/system/continuation.md')
    const modules = markdown('docs/api/core/modules.md')

    for (const source of [continuation, modules]) {
      expect(source).toContain('非 nullish 的拒绝原因不会在等待点重新抛出')
      expect(source).toContain('作为普通恢复值返回')
      expect(source).toContain('nullish')
      expect(source).toContain('可能一直保持等待')
    }

    expect(modules).toContain('UI continuation 路径')
    expect(modules).toContain('ResultAdapter.wait')
  })

  test('documents the truthiness bug in Promise#wait', () => {
    const source = markdown('docs/api/core/modules.md')

    expect(source).toContain('只有真值拒绝原因才会抛出')
    expect(source).toContain('`false`、`0`、空字符串、`null` 或 `undefined`')
    expect(source).toContain('Promise.reject(false).wait()')
    expect(source).toContain('// undefined')
  })

  test('documents notification permission, settings, builder, and channel edge cases', () => {
    const source = markdown('docs/api/system/notice.md')

    expect(source).toContain('提交给 NotificationManager 之前同步抛出 RuntimeException')
    expect(source).toContain('`ensureEnabled()` 会先尝试打开系统通知设置页，再抛出异常')
    expect(source).toContain('设置页启动失败会被 startSafely 吞掉')
    expect(source).toContain('notice.builder 与 notice.getBuilder() 相同')
    expect(source).toContain('缺少 channelId 时回退到当前默认渠道 ID')
  })

  test('warns about once removal and reflected overload defects', () => {
    const source = markdown('docs/api/types/event-emitter.md')

    expect(source).toContain('两个或更多 once 监听器')
    expect(source).toContain('后续一次性监听器可能残留')
    expect(source).toContain('IndexOutOfBoundsException')
    expect(source).toContain('两个 removeAllListeners Java 重载会以同名属性互相覆盖')
    expect(source).toContain('不要依赖两种调用形式同时可用')
  })

  test('states that exit scripts run only after a later app launch', () => {
    const source = markdown('docs/api/core/monkeyking.md')

    expect(source).toContain('不会自动重启应用，也不会在退出后立即运行这些脚本')
    expect(source).toContain('用户以后再次启动 Monkey King')
  })

  test('states that assigning i18n.banana does not replace the closed-over parser', () => {
    const source = markdown('docs/api/utilities/i18n.md')

    expect(source).toContain('不会替换闭包捕获的原始 Banana-i18n 实例')
    expect(source).toContain('可调用的 i18n 函数和包装方法仍使用原始实例')
  })
})
