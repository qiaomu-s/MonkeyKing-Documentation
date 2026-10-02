export interface DmExample {
  readonly code: string
  readonly scenarios: readonly string[]
}

export const shapePattern: string
export function getDmExample(name: string): DmExample
export function validateDmExamples(names: readonly string[]): void
