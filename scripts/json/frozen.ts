export interface FrozenLegacyJsonEntry {
  readonly stem: string
  readonly sha256: string
}

export const frozenLegacyJsonManifest: readonly FrozenLegacyJsonEntry[] =
  Object.freeze([
    Object.freeze({
      stem: 'accessibilityActionsType',
      sha256:
        '135ef9e95e2803174f72ba77eb53c7f819c23bd074cf10ac0f7823266822fced',
    }),
    Object.freeze({
      stem: 'coordinates-based-automation',
      sha256:
        'b9cb567af85eeda2db3ee8f6e4f786d3e76493ea71a85c4496bc268f13d4d607',
    }),
    Object.freeze({
      stem: 'coordinatesBasedAutomation',
      sha256:
        '203775cf8672d3bce5bc3e280d749639c5ef2a3a460bb19b8ba3b88430691d5b',
    }),
    Object.freeze({
      stem: 'errors',
      sha256:
        'd988e2ac4af1cf7fc867da3f3a970d32214ea789699ca06e71f4e7c4ac4ca191',
    }),
    Object.freeze({
      stem: 'globals',
      sha256:
        '12d8d4d329947023987583805a0cf097d334fc9d226cefa36b583c1b98d6283e',
    }),
    Object.freeze({
      stem: 'imageWrapper',
      sha256:
        'a6b43d45784ff4b0399746df63236087a56c39cd14425633ef41d4533a3ae5f5',
    }),
    Object.freeze({
      stem: 'intent',
      sha256:
        '676513ed7e2e7dfc4d848de3adc72f2442ad1fdd968e18ec578594d23c888ab7',
    }),
    Object.freeze({
      stem: 'intrinsicTypes',
      sha256:
        'd3df3c9d02e63328ff76543eb5cb28f4dc38abd35c6767e86d953694acf64eb6',
    }),
    Object.freeze({
      stem: 'widgets-based-automation',
      sha256:
        '0da3b149a8eb254e6fca9efa6f7aa1194fe72d5c4272ce7dd55993487d344249',
    }),
    Object.freeze({
      stem: 'widgetsBasedAutomation',
      sha256:
        '04b03a2d9cc21f68be86b8b014bb964112b76148e6285c25d53d90734e04e9ed',
    }),
  ])
