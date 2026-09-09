import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  expectedRenderedHtmlFiles,
  expectedSearchKeys,
} from './build'
import {
  validateRenderedPages,
  type RenderedPagesReport,
} from './content/rendered-pages'

export function checkRenderedLinks(
  projectRoot = process.cwd(),
): RenderedPagesReport {
  return validateRenderedPages({
    outputDirectory: resolve(projectRoot, 'dist/web'),
    base: '/',
    expectedHtmlFiles: expectedRenderedHtmlFiles(),
    expectedSearchKeys: expectedSearchKeys(),
  })
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return (
    executable !== undefined &&
    pathToFileURL(resolve(executable)).href === import.meta.url
  )
}

if (isDirectExecution()) {
  try {
    const report = checkRenderedLinks()
    process.stdout.write(
      `Rendered links valid: ${report.htmlFileCount} HTML files, ` +
        `${report.referenceCount} internal references, ` +
        `${report.fragmentReferenceCount} fragments, ` +
        `${report.searchPageCount} search pages.\n`,
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}
