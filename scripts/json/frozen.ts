export interface FrozenLegacyJsonEntry {
  readonly stem: string
  readonly sha256: string
}

export const frozenLegacyJsonManifest: readonly FrozenLegacyJsonEntry[] =
  Object.freeze([
    Object.freeze({
      stem: 'accessibilityActionsType',
      sha256:
        '376fdc2e4af0b910b657d82ddf5ce06921d75dd99eda6331e8d4a07fd5362d24',
    }),
    Object.freeze({
      stem: 'coordinates-based-automation',
      sha256:
        '4619c824ff1e4d73c94330e3afcc37a23ba59044ec5060d21f058692c1c393b4',
    }),
    Object.freeze({
      stem: 'coordinatesBasedAutomation',
      sha256:
        '60e81cdb5c8113552646e13a9870ecdf48a44cfc23ffd77bc816fd82ace8cbab',
    }),
    Object.freeze({
      stem: 'errors',
      sha256:
        '89224006e18cf6d26f64b6a6a118d8f8b576abc948af547c138463ac799ee9c2',
    }),
    Object.freeze({
      stem: 'globals',
      sha256:
        'c2988a4fc52fe0140cf1b9dea54f4c96dbc5cb167aa0a1a9b2704634efe6289c',
    }),
    Object.freeze({
      stem: 'imageWrapper',
      sha256:
        'c056564fc42a2272243880ce5d5d0b2b3fe738545d0441065bccaff45bdfe5bd',
    }),
    Object.freeze({
      stem: 'intent',
      sha256:
        '84a4d422443ea598abfea0028dcf3b66ba91562455ca3ee3d35262067d6e5269',
    }),
    Object.freeze({
      stem: 'intrinsicTypes',
      sha256:
        '2e4abb9775838243d194d09ee7b7a342d7694e94d93e0892cb1a4bf769f572cd',
    }),
    Object.freeze({
      stem: 'widgets-based-automation',
      sha256:
        '706482f957d6ec95bd8b8466d9f192f5dc0e5bbc891aef1b4ff1578d2bb6952b',
    }),
    Object.freeze({
      stem: 'widgetsBasedAutomation',
      sha256:
        'b04eb4e84c061ac9fc971338ebb83c25c9f92aceb958c4a3db715251e083c9e6',
    }),
  ])
