// Internal evidence helper. Never imports/runs the documentation generator.
// Requires curl, python3 and beautifulsoup4; original articles stay in memory.
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const auditPath = resolve(root, 'scripts/dm-example-audit.json')
const manifestPath = resolve(root, '../MonkeyKing/docs/dm/api-manifest.json')

const python = String.raw`
import concurrent.futures, hashlib, json, re, subprocess, sys
from bs4 import BeautifulSoup

def digest(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def fetch(entry):
    # Preserve manifest URLs, including the upstream enablegetcoloryycapture slug.
    url = entry.get("source") or "https://zimaoxy.com/docs/qscript/dm." + entry["name"].lower() + "/"
    process = subprocess.run(
        ["curl", "--location", "--silent", "--show-error", "--retry", "2",
         "--connect-timeout", "15", "--max-time", "60",
         "--write-out", "\n%{http_code}\t%{url_effective}", url],
        capture_output=True, text=True, encoding="utf-8", errors="replace")
    body, _, trailer = process.stdout.rpartition("\n")
    fields = trailer.split("\t", 1)
    code = int(fields[0]) if fields and fields[0].isdigit() else 0
    effective = fields[1] if len(fields) > 1 else url
    soup = BeautifulSoup(body, "html.parser")
    article = soup.select_one("article .theme-doc-markdown") or soup.find("article")
    title_node = article.find("h1") if article else None
    title = title_node.get_text("", strip=True) if title_node else ""
    identity = re.search(r"([A-Za-z0-9]+)", title)
    identity_ok = bool(identity and identity[1].lower() == entry["name"].lower())
    sections = []
    if article:
        for heading in article.find_all(re.compile("^h[1-6]$")):
            if not re.search(r"示例|例子|example", heading.get_text(), re.I):
                continue
            nodes = []
            for node in heading.next_siblings:
                if getattr(node, "name", None) and re.match("^h[1-6]$", node.name):
                    if int(node.name[1]) <= int(heading.name[1]):
                        break
                nodes.append(node)
            # Docusaurus uses token spans; preserve lines without splitting tokens.
            fragment = BeautifulSoup("".join(str(n) for n in nodes), "html.parser")
            # Cloudflare mistakes color expressions containing @ for email addresses.
            for protected in fragment.select("[data-cfemail]"):
                try:
                    encoded = bytes.fromhex(protected["data-cfemail"])
                    protected.replace_with(bytes(b ^ encoded[0] for b in encoded[1:]).decode("utf-8"))
                except (ValueError, UnicodeDecodeError, IndexError):
                    pass
            for button in fragment.find_all("button"):
                button.decompose()
            for br in fragment.find_all("br"):
                br.replace_with("\n")
            for pre in fragment.find_all("pre"):
                pre.replace_with("\n" + pre.get_text() + "\n")
            text = fragment.get_text("\n", strip=True).replace("\u200b", "")
            sections.append({"heading": heading.get_text("", strip=True).replace("\u200b", ""),
                             "text": text})
    combined = "\n\n".join(s["text"] for s in sections)
    explicitly_absent = bool(re.search(r"故无例子|暂无示例|没有示例", combined))
    meaningful = bool(combined.strip() and combined.strip() not in ("无", "暂无", "无。") and not explicitly_absent)
    available = process.returncode == 0 and 200 <= code < 300 and identity_ok and meaningful
    reason = None if available else (
        "curl-error" if process.returncode else
        "http-" + str(code) if not 200 <= code < 300 else
        "article-identity-mismatch" if not identity_ok else
        "example-section-missing-or-empty")
    evidence = {
        "requestedUrl": url, "effectiveUrl": effective, "httpStatus": code,
        "articleTitle": title, "articleIdentityMatches": identity_ok,
        "exampleSectionCount": len(sections), "exampleCharacterCount": len(combined),
        "exampleSha256": digest(combined) if combined else None,
        "observedDmCalls": sorted(set(re.findall(r"\bdm\.([A-Za-z][A-Za-z0-9]*)", combined, re.I))),
        "available": available, "missingReason": reason
    }
    if process.returncode:
        evidence["retrievalError"] = process.stderr.strip()[:300]
    return {"name": entry["name"], "modern": entry["modern"],
            "evidence": evidence, "sections": sections}

entries = json.load(sys.stdin)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    print(json.dumps(list(pool.map(fetch, entries)), ensure_ascii=False))
`

export function fetchEvidence(entries) {
  return new Promise((fulfill, reject) => {
    const child = spawn('python3', ['-c', python], { stdio: ['pipe', 'pipe', 'pipe'] })
    let output = ''
    let errors = ''
    child.stdout.setEncoding('utf8').on('data', (data) => { output += data })
    child.stderr.setEncoding('utf8').on('data', (data) => { errors += data })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Python exited ${code}: ${errors}`))
      try { fulfill(JSON.parse(output)) } catch (error) { reject(error) }
    })
    child.stdin.on('error', reject)
    child.stdin.end(JSON.stringify(entries))
  })
}

async function main() {
  const [mode, argument] = process.argv.slice(2)
  if (!['--inspect', '--refresh'].includes(mode) || (mode === '--refresh' && argument)) {
    throw new Error('Usage: node scripts/audit-dm-examples.mjs --inspect [modernName] | --refresh')
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.length !== 104) throw new Error('Expected 104 manifest entries')
  const selected = argument ? manifest.filter((entry) => entry.modern === argument) : manifest
  if (!selected.length) throw new Error(`Unknown manifest method: ${argument}`)
  const fetched = await fetchEvidence(selected)
  if (mode === '--inspect') {
    // Only stdout contains source excerpts. Do not redirect into the repository.
    for (const item of fetched) console.log(JSON.stringify(item, null, 2))
    return
  }
  const audit = JSON.parse(readFileSync(auditPath, 'utf8'))
  if (audit.entries.length !== 114) throw new Error('Expected 114 audit entries')
  const checkedOn = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  for (const item of fetched) {
    const entry = audit.entries.find((candidate) => candidate.modern === item.modern)
    if (!entry) throw new Error(`Missing audit entry: ${item.modern}`)
    // Historical, manually reviewed evidence and completion fields are immutable here.
    entry.latestReferenceCheck = {
      checkedOn,
      ...item.evidence,
      requiresManualReview: !item.evidence.available ||
        entry.referenceEvidence.exampleSha256 !== item.evidence.exampleSha256 ||
        entry.referenceStatus !== 'verified',
    }
  }
  writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n')
  console.log(`Refreshed ${fetched.length} evidence checks; manual scenarios/statuses preserved.`)
}

if (typeof process !== 'undefined' && process.argv[1] &&
    resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1 })
}
