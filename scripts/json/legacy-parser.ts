// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import { createRequire } from 'node:module'

interface LegacyToken {
  readonly type: string
  readonly text?: string
  readonly depth?: number
  readonly ordered?: boolean
  readonly [key: string]: unknown
}

interface LegacyTokenArray extends Array<LegacyToken> {
  links?: Record<string, unknown>
  level?: number
}

interface LegacyMarkedRenderer {
  heading: (text: string, level: number) => string
}

interface LegacyMarked {
  Renderer: new () => LegacyMarkedRenderer
  lexer: (input: string) => LegacyTokenArray
  parser: (tokens: LegacyTokenArray) => string
  setOptions: (options: { renderer: LegacyMarkedRenderer }) => void
}

interface LegacyValue extends Record<string, unknown> {
  name?: string
  type?: string
  textRaw?: string
  desc?: string
  optional?: true
  default?: string
  options?: LegacyValue[]
}

interface LegacySignature extends Record<string, unknown> {
  params?: LegacyValue[]
  return?: LegacyValue
  desc?: string
}

interface LegacySection extends Record<string, unknown> {
  textRaw?: string
  name?: string
  type?: string
  typeof?: string
  displayName?: string
  desc?: string | LegacyTokenArray
  shortDesc?: string | LegacyTokenArray
  signatures?: LegacySignature[]
  params?: LegacyValue[]
  clone?: LegacySection
  list?: LegacyTokenArray
  ctors?: LegacySection[]
  properties?: LegacySection[]
}

export interface LegacyDocument extends LegacySection {
  source: string
}

const require = createRequire(import.meta.url)
const marked = require('marked-legacy') as LegacyMarked
const renderer = new marked.Renderer()

renderer.heading = (text, level) => `<h${level}>${text}</h${level}>\n`
// marked 0.3.19 exposes renderer configuration only through this global API.
// The compatibility generator is synchronous, so setting it once at module load
// preserves the legacy behavior without interleaving different renderers.
marked.setOptions({ renderer })

const eventExpr = /^Event(?::|\s)+['"]?([^"']+).*$/i
const classExpr = /^Class:\s*([^ ]+).*$/i
const propExpr = /^[^.]+\.([^ .()]+)\s*$/
const braceExpr = /^[^.[]+(\[[^\]]+\])\s*$/
const classMethExpr = /^class\s*method\s*:?[^.]+\.([^ .()]+)\([^)]*\)\s*$/i
const methExpr = /^(?:[^.]+\.)?([^ .()]+)\([^)]*\)\s*$/
const newExpr = /^new ([A-Z][a-zA-Z]+)\([^)]*\)\s*$/
const paramExpr = /\((.*)\);?$/

export function stripLegacyComments(input: string): string {
  return input.replace(/^@\/\/.*$/gim, '')
}

export function parseLegacyMarkdown(
  input: string,
  source: string,
): LegacyDocument {
  const preprocessed = stripLegacyComments(input)
  const root: LegacyDocument = { source }
  const stack: LegacySection[] = [root]
  let depth = 0
  let current: LegacySection = root
  let state:
    | 'AFTERHEADING'
    | 'AFTERHEADING_BLOCKQUOTE'
    | 'AFTERHEADING_LIST'
    | 'DESC'
    | null = null
  const lexed = marked.lexer(preprocessed)

  for (const token of lexed) {
    const type = token.type
    let text = token.text

    if (type === 'html' && text?.includes('<!-- YAML')) {
      throw new Error(
        `YAML metadata blocks are not supported in active Markdown: ${source}`,
      )
    }

    if ((type === 'paragraph' || type === 'html') && text !== undefined) {
      const metaExpr = /<!--([^=]+)=([^-]+)-->\n*/g
      text = text.replace(metaExpr, (_match, key: string, value: string) => {
        current[key.trim()] = value.trim()
        return ''
      })
      text = text.trim()
      if (!text) continue
    }

    if (
      type === 'heading' &&
      text !== undefined &&
      !text.trim().match(/^example/i)
    ) {
      const tokenDepth = token.depth ?? 0

      if (current && state === 'AFTERHEADING' && depth === tokenDepth) {
        const clone = current
        current = newSection({ ...token, text })
        current.clone = clone
        stack.pop()
      } else {
        let nextDepth = tokenDepth
        while (nextDepth <= depth) {
          const completed = stack.pop()
          finishSection(completed, stack[stack.length - 1])
          nextDepth++
        }
        current = newSection({ ...token, text })
      }

      depth = tokenDepth
      stack.push(current)
      state = 'AFTERHEADING'
      continue
    }

    let stability: RegExpMatchArray | null
    if (state === 'AFTERHEADING') {
      if (type === 'blockquote_start') {
        state = 'AFTERHEADING_BLOCKQUOTE'
        continue
      } else if (type === 'list_start' && !token.ordered) {
        current.list = current.list ?? ([] as unknown as LegacyTokenArray)
        current.list.push(token)
        current.list.level = 1
        state = 'AFTERHEADING_LIST'
      } else {
        current.desc = current.desc ?? ([] as unknown as LegacyTokenArray)
        if (!Array.isArray(current.desc)) {
          current.shortDesc = current.desc
          current.desc = [] as unknown as LegacyTokenArray
        }
        current.desc.links = lexed.links
        current.desc.push(token)
        state = 'DESC'
      }
      continue
    }

    if (state === 'AFTERHEADING_LIST') {
      if (!current.list) {
        throw new Error('Invalid legacy parser state: missing heading list')
      }
      current.list.push(token)
      if (type === 'list_start') {
        current.list.level = (current.list.level ?? 0) + 1
      } else if (type === 'list_end') {
        current.list.level = (current.list.level ?? 0) - 1
      }
      if (current.list.level === 0) {
        state = 'AFTERHEADING'
        processList(current)
      }
      continue
    }

    if (state === 'AFTERHEADING_BLOCKQUOTE') {
      if (type === 'blockquote_end') {
        state = 'AFTERHEADING'
        continue
      }

      if (
        type === 'paragraph' &&
        text !== undefined &&
        (stability = text.match(/^Stability: ([0-5])(?:\s*-\s*)?(.*)$/))
      ) {
        current.stability = Number.parseInt(stability[1], 10)
        current.stabilityText = stability[2].trim()
        continue
      }
    }

    current.desc = current.desc ?? ([] as unknown as LegacyTokenArray)
    if (!Array.isArray(current.desc)) {
      throw new Error('Invalid legacy parser state: description is not a token array')
    }
    current.desc.links = lexed.links
    current.desc.push(token)
  }

  let completed: LegacySection | undefined
  while (root !== (completed = stack.pop())) {
    finishSection(completed, stack[stack.length - 1])
  }

  return root
}

export function stringifyLegacyDocument(document: LegacyDocument): string {
  return JSON.stringify(document, null, 2)
}

function processList(section: LegacySection): void {
  const list = section.list ?? ([] as unknown as LegacyTokenArray)
  const values: LegacyValue[] = []
  let current: LegacyValue | undefined
  const stack: LegacyValue[] = []

  for (const token of list) {
    const type = token.type
    if (type === 'space') continue
    if (type === 'list_item_start' || type === 'loose_item_start') {
      const value: LegacyValue = {}
      if (!current) {
        values.push(value)
        current = value
      } else {
        current.options = current.options ?? []
        stack.push(current)
        current.options.push(value)
        current = value
      }
    } else if (type === 'list_item_end') {
      if (!current) {
        throw new Error(
          `invalid list - end without current item\n${JSON.stringify(token)}\n${JSON.stringify(list)}`,
        )
      }
      current = stack.pop()
    } else if (type === 'text') {
      if (!current) {
        throw new Error(
          `invalid list - text without current item\n${JSON.stringify(token)}\n${JSON.stringify(list)}`,
        )
      }
      current.textRaw = current.textRaw ?? ''
      current.textRaw += `${token.text ?? ''} `
    }
  }

  if (section.type === 'property' && values[0]) {
    values[0].textRaw = `\`${section.name}\` ${values[0].textRaw}`
  }

  values.forEach(parseListItem)

  switch (section.type) {
    case 'ctor':
    case 'classMethod':
    case 'method': {
      section.signatures = section.signatures ?? []
      const signature: LegacySignature = {}
      section.signatures.push(signature)
      signature.params = values.filter((value) => {
        if (value.name === 'return') {
          signature.return = value
          return false
        }
        return true
      })
      parseSignature(section.textRaw ?? '', signature)
      break
    }

    case 'property': {
      const value = values[0] ?? {}
      delete value.name
      section.typeof = value.type ?? section.typeof
      delete value.type
      for (const key of Object.keys(value)) {
        section[key] = value[key]
      }
      break
    }

    case 'event':
      section.params = values
      break

    default:
      if (list.length > 0) {
        section.desc = section.desc ?? ([] as unknown as LegacyTokenArray)
        if (!Array.isArray(section.desc)) {
          throw new Error('Invalid legacy parser state: list description is not an array')
        }
        for (const token of list) {
          section.desc.push(token)
        }
      }
  }

  delete section.list
}

function parseSignature(text: string, signature: LegacySignature): void {
  const match = text.match(paramExpr)
  if (!match) return

  const params = match[1].split(/,/)
  const signatureParams = signature.params ?? (signature.params = [])
  let optionalLevel = 0
  const optionalCharDict: Readonly<Record<string, number>> = {
    '[': 1,
    ' ': 0,
    ']': -1,
  }

  params.forEach((rawParam, index) => {
    let paramText = rawParam.trim()
    if (!paramText) return
    let param = signatureParams[index]

    let position = 0
    for (; position < paramText.length; position++) {
      const adjustment = optionalCharDict[paramText[position]]
      if (adjustment === undefined) break
      optionalLevel += adjustment
    }
    paramText = paramText.substring(position)
    const optional = optionalLevel > 0

    for (position = paramText.length - 1; position >= 0; position--) {
      const adjustment = optionalCharDict[paramText[position]]
      if (adjustment === undefined) break
      optionalLevel += adjustment
    }
    paramText = paramText.substring(0, position + 1)

    const equals = paramText.indexOf('=')
    let defaultValue: string | undefined
    if (equals !== -1) {
      defaultValue = paramText.substring(equals + 1)
      paramText = paramText.substring(0, equals)
    }
    if (!param) {
      param = { name: paramText }
      signatureParams[index] = param
    }
    if (optional) param.optional = true
    if (defaultValue !== undefined) param.default = defaultValue
  })
}

function parseListItem(item: LegacyValue): void {
  item.options?.forEach(parseListItem)
  if (!item.textRaw) return

  let text = item.textRaw.trim()
  text = text.replace(/^, /, '').trim()

  const returnExpr = /^returns?\s*:?\s*/i
  const returnMatch = text.match(returnExpr)
  if (returnMatch) {
    item.name = 'return'
    text = text.replace(returnExpr, '')
  } else {
    const nameExpr = /^['`"]?([^'`": {]+)['`"]?\s*:?\s*/
    const nameMatch = text.match(nameExpr)
    if (nameMatch) {
      item.name = nameMatch[1]
      text = text.replace(nameExpr, '')
    }
  }

  text = text.trim()
  const defaultExpr = /\(default\s*[:=]?\s*['"`]?([^, '"`]*)['"`]?\)/i
  const defaultMatch = text.match(defaultExpr)
  if (defaultMatch) {
    item.default = defaultMatch[1]
    text = text.replace(defaultExpr, '')
  }

  text = text.trim()
  const typeExpr = /^\{([^}]+)\}/
  const typeMatch = text.match(typeExpr)
  if (typeMatch) {
    item.type = typeMatch[1]
    text = text.replace(typeExpr, '')
  }

  text = text.trim()
  const optionalExpr = /^Optional\.|(?:, )?Optional$/
  const optionalMatch = text.match(optionalExpr)
  if (optionalMatch) {
    item.optional = true
    text = text.replace(optionalExpr, '')
  }

  text = text.replace(/^\s*-\s*/, '').trim()
  if (text) item.desc = text
}

function finishSection(
  section: LegacySection | undefined,
  parent: LegacySection | undefined,
): void {
  if (!section || !parent) {
    throw new Error(
      `Invalid finishSection call\n${JSON.stringify(section)}\n${JSON.stringify(parent)}`,
    )
  }

  if (!section.type) {
    section.type = 'module'
    if (parent.type === 'misc') section.type = 'misc'
    section.displayName = section.name
    section.name = (section.name ?? '').toLowerCase().trim().replace(/\s+/g, '_')
  }

  if (Array.isArray(section.desc)) {
    section.desc.links = section.desc.links ?? {}
    try {
      section.desc = marked.parser(section.desc)
    } catch {
      section.desc = ''
    }
  }

  if (!section.list) section.list = [] as unknown as LegacyTokenArray
  processList(section)

  if (section.type === 'class' && section.ctors) {
    section.signatures = section.signatures ?? []
    const signatures = section.signatures
    for (const constructor of section.ctors) {
      constructor.signatures = constructor.signatures ?? [{}]
      for (const signature of constructor.signatures) {
        signature.desc =
          typeof constructor.desc === 'string' ? constructor.desc : undefined
      }
      signatures.push(...constructor.signatures)
    }
    delete section.ctors
  }

  if (section.properties) {
    for (const property of section.properties) {
      if (property.typeof) property.type = property.typeof
      else delete property.type
      delete property.typeof
    }
  }

  if (section.clone) {
    const clone = section.clone
    delete section.clone
    delete clone.clone
    deepCopy(section, clone)
    finishSection(clone, parent)
  }

  let plural: string
  if (section.type.endsWith('s')) {
    plural = `${section.type}es`
  } else if (section.type.endsWith('y')) {
    plural = section.type.replace(/y$/, 'ies')
  } else {
    plural = `${section.type}s`
  }

  if (section.type === 'misc') {
    for (const key of Object.keys(section)) {
      switch (key) {
        case 'textRaw':
        case 'name':
        case 'type':
        case 'desc':
        case 'miscs':
          continue
        default:
          if (parent.type === 'misc') continue
          if (Array.isArray(key) && parent[key]) {
            parent[key] = [
              ...(parent[key] as unknown[]),
              ...(section[key] as unknown[]),
            ]
          } else if (!parent[key]) {
            parent[key] = section[key]
          }
      }
    }
  }

  const collection = (parent[plural] as LegacySection[] | undefined) ?? []
  if (!parent[plural]) parent[plural] = collection
  collection.push(section)
}

function deepCopy(source: LegacySection, destination: LegacySection): void {
  for (const key of Object.keys(source).filter(
    (candidate) => !Object.prototype.hasOwnProperty.call(destination, candidate),
  )) {
    destination[key] = deepCopyValue(source[key])
  }
}

function deepCopyValue(source: unknown): unknown {
  if (!source) return source
  if (Array.isArray(source)) return source.map(deepCopyValue)
  if (typeof source === 'object') {
    const copy: Record<string, unknown> = {}
    for (const key of Object.keys(source)) {
      copy[key] = deepCopyValue((source as Record<string, unknown>)[key])
    }
    return copy
  }
  return source
}

function newSection(token: LegacyToken & { text: string }): LegacySection {
  const section: LegacySection = {}
  const text = (section.textRaw = token.text)

  if (text.match(eventExpr)) {
    section.type = 'event'
    section.name = text.replace(eventExpr, '$1')
  } else if (text.match(classExpr)) {
    section.type = 'class'
    section.name = text.replace(classExpr, '$1')
  } else if (text.match(braceExpr)) {
    section.type = 'property'
    section.name = text.replace(braceExpr, '$1')
  } else if (text.match(propExpr)) {
    section.type = 'property'
    section.name = text.replace(propExpr, '$1')
  } else if (text.match(classMethExpr)) {
    section.type = 'classMethod'
    section.name = text.replace(classMethExpr, '$1')
  } else if (text.match(methExpr)) {
    section.type = 'method'
    section.name = text.replace(methExpr, '$1')
  } else if (text.match(newExpr)) {
    section.type = 'ctor'
    section.name = text.replace(newExpr, '$1')
  } else {
    section.name = text
  }

  return section
}
