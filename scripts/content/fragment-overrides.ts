export interface FragmentOverrideInput {
  readonly currentLegacySource: string
  readonly targetLegacyStem: string
  readonly fragment: string | undefined
  readonly label: string
  readonly context: string
}

export interface LinkFragmentOverride {
  readonly kind: 'link'
  readonly targetEntryId?: string
  readonly fragment?: string
  readonly label?: string
}

export interface UnlinkFragmentOverride {
  readonly kind: 'unlink'
  readonly label?: string
}

export type FragmentOverride = LinkFragmentOverride | UnlinkFragmentOverride

const timerFragments: Readonly<Record<string, string>> = Object.freeze({
  settimeout: 'settimeout-callback-delay-args',
  setinterval: 'setinterval-callback-delay-args',
  setimmediate: 'setimmediate-callback-args',
  clearinterval: 'clearinterval-id',
  cleartimeout: 'cleartimeout-id',
  clearimmediate: 'clearimmediate-id',
})

const eventEmitterFragments: Readonly<Record<string, string>> = Object.freeze({
  'm-on': 'eventemitter-on-eventname-listener',
  'm-once': 'eventemitter-once-eventname-listener',
  'm-emit': 'eventemitter-emit-eventname-args',
  'm-eventnames': 'eventemitter-eventnames',
  'm-addlistener': 'eventemitter-addlistener-eventname-listener',
  'm-removelistener': 'eventemitter-removelistener-eventname-listener',
})

function sameSource(actual: string, expected: string): boolean {
  return actual.toLowerCase() === expected.toLowerCase()
}

function sameStem(actual: string, expected: string): boolean {
  return actual.toLowerCase() === expected.toLowerCase()
}

function sameFragment(
  actual: string | undefined,
  expected: string,
): boolean {
  return actual?.toLowerCase() === expected.toLowerCase()
}

export function resolveFragmentOverride(
  input: FragmentOverrideInput,
): FragmentOverride | undefined {
  const { currentLegacySource, targetLegacyStem, fragment, label, context } =
    input

  if (
    sameSource(currentLegacySource, 'api/exceptions.md') &&
    sameStem(targetLegacyStem, 'exceptions') &&
    sameFragment(fragment, 'trycatch-语句')
  ) {
    return label.includes('try...catch')
      ? { kind: 'link', fragment: 'try-catch-语句' }
      : { kind: 'link', fragment: '异常处理' }
  }

  if (
    sameSource(currentLegacySource, 'api/global.md') &&
    sameStem(targetLegacyStem, 'global') &&
    sameFragment(fragment, 'waitcondition-callback')
  ) {
    const hasLimit = /\blimit\b/i.test(label) || /\blimit\b/i.test(context)
    return {
      kind: 'link',
      fragment: hasLimit
        ? 'wait-condition-limit-callback'
        : 'wait-condition-callback',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/console.md') &&
    sameStem(targetLegacyStem, 'console') &&
    sameFragment(fragment, 'function') &&
    label.includes('=>')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.types.data-types',
      fragment: 'function',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/engines.md') &&
    sameStem(targetLegacyStem, 'engines')
  ) {
    if (sameFragment(fragment, 'engines_scriptexecution')) {
      return { kind: 'link', fragment: 'scriptexecution' }
    }
    if (sameFragment(fragment, 'engines_scriptsource')) {
      return { kind: 'unlink' }
    }
  }

  if (
    sameSource(currentLegacySource, 'api/events.md') &&
    sameStem(targetLegacyStem, 'events') &&
    sameFragment(fragment, 'events_eventemitter')
  ) {
    return { kind: 'link', fragment: 'eventemitter' }
  }

  if (
    sameSource(currentLegacySource, 'api/global.md') &&
    sameStem(targetLegacyStem, 'util') &&
    sameFragment(fragment, 'versioncodes')
  ) {
    return { kind: 'unlink', label: 'util.versionCodes' }
  }

  if (
    sameSource(currentLegacySource, 'api/global.md') &&
    sameStem(targetLegacyStem, 'autojs')
  ) {
    if (sameFragment(fragment, 'versionname')) {
      return {
        kind: 'link',
        targetEntryId: 'api.core.monkeyking',
        fragment: 'p-versionname',
        label: 'monkeyking.versionName',
      }
    }
    if (sameFragment(fragment, 'versioncode')) {
      return {
        kind: 'link',
        targetEntryId: 'api.core.monkeyking',
        fragment: 'p-versioncode',
        label: 'monkeyking.versionCode',
      }
    }
  }

  if (
    sameSource(currentLegacySource, 'api/omniTypes.md') &&
    ((sameStem(targetLegacyStem, 'intentOptionsType') && fragment === undefined) ||
      (sameStem(targetLegacyStem, 'dataTypes') &&
        (sameFragment(fragment, 'intentshortformforactivity') ||
          sameFragment(fragment, 'intenturistring'))))
  ) {
    return { kind: 'unlink' }
  }

  if (
    sameSource(currentLegacySource, 'api/qa.md') &&
    sameStem(targetLegacyStem, 'image') &&
    sameFragment(fragment, 'm-clip')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.media.image',
      fragment: 'images-clip-img-x-y-w-h',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/qa.md') &&
    sameStem(targetLegacyStem, 'device') &&
    sameFragment(fragment, 'p-imei')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.system.device',
      fragment: 'device-getimei',
      label: 'device.getIMEI()',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/sensors.md') &&
    sameStem(targetLegacyStem, 'sensors')
  ) {
    if (sameFragment(fragment, 'sensors_sensorevent')) {
      return { kind: 'unlink' }
    }
    if (sameFragment(fragment, 'sensors_sensoreventemitter')) {
      return { kind: 'link', fragment: 'sensoreventemitter' }
    }
  }

  if (
    sameSource(currentLegacySource, 'api/threads.md') &&
    sameStem(targetLegacyStem, 'timers') &&
    fragment
  ) {
    const timerKey = fragment
      .toLowerCase()
      .replace(/^timers[_-]/, '')
      .split(/[_-]/)[0]
    const mappedFragment = timerFragments[timerKey]
    if (mappedFragment) {
      return {
        kind: 'link',
        targetEntryId: 'api.system.timers',
        fragment: mappedFragment,
      }
    }
  }

  if (
    sameStem(targetLegacyStem, 'global') &&
    sameFragment(fragment, 'm-click') &&
    sameSource(currentLegacySource, 'api/uiObjectActionsType.md')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.automation.automator',
      fragment: 'click-x-y',
    }
  }

  if (
    sameStem(targetLegacyStem, 'automator') &&
    sameFragment(fragment, 'm-click') &&
    (sameSource(currentLegacySource, 'api/uiObjectActionsType.md') ||
      sameSource(currentLegacySource, 'api/uiObjectType.md'))
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.automation.automator',
      fragment: 'click-x-y',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/uiObjectActionsType.md') &&
    sameStem(targetLegacyStem, 'uiObjectType') &&
    sameFragment(fragment, 'm-clickbybounds')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.automation.ui-object',
      fragment: 'm-clickbounds',
      label: 'UiObject#clickBounds',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/webSocketType.md') &&
    sameStem(targetLegacyStem, 'eventEmitterType') &&
    fragment
  ) {
    const mappedFragment = eventEmitterFragments[fragment.toLowerCase()]
    if (mappedFragment) {
      return {
        kind: 'link',
        targetEntryId: 'api.system.events',
        fragment: mappedFragment,
      }
    }
  }

  if (
    sameSource(currentLegacySource, 'api/changelog.md') &&
    sameStem(targetLegacyStem, 'uiObjectType') &&
    (sameFragment(fragment, 'm-plus') ||
      sameFragment(fragment, 'm-append'))
  ) {
    return { kind: 'unlink' }
  }

  if (
    sameSource(currentLegacySource, 'api/changelog.md') &&
    sameStem(targetLegacyStem, 'glossaries') &&
    (sameFragment(fragment, '通知渠道') ||
      sameFragment(fragment, 'HTTP-请求方法'))
  ) {
    if (sameFragment(fragment, 'HTTP-请求方法')) {
      return {
        kind: 'link',
        targetEntryId: 'reference.glossaries.http-request-methods',
        fragment: 'http-request-methods-http-请求方法',
      }
    }
    return {
      kind: 'link',
      targetEntryId: 'reference.glossaries.notification-channels',
      fragment: 'notification-channel-通知渠道',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/events.md') &&
    (sameStem(targetLegacyStem, 'images') ||
      sameStem(targetLegacyStem, 'image')) &&
    sameFragment(fragment, 'images_point')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.media.image',
      fragment: 'point',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/opencvSizeType.md') &&
    sameStem(targetLegacyStem, 'uiobjectType') &&
    sameFragment(fragment, 'm-size')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.automation.ui-object',
      fragment: 'm-size',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/uiSelectorType.md') &&
    sameStem(targetLegacyStem, 'uiObjecttype') &&
    sameFragment(fragment, 'm-compass')
  ) {
    return {
      kind: 'link',
      targetEntryId: 'api.automation.ui-object',
      fragment: 'm-compass',
    }
  }

  if (
    sameSource(currentLegacySource, 'api/shizuku.md') &&
    sameStem(targetLegacyStem, 'shellResultType')
  ) {
    return { kind: 'unlink' }
  }

  if (
    sameStem(targetLegacyStem, 'intentOptionsType') ||
    sameStem(targetLegacyStem, 'util')
  ) {
    return { kind: 'unlink' }
  }

  return undefined
}
