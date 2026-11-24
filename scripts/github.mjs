// Looks up repositories with the GitHub GraphQL API, 50 per request.
// Needs GITHUB_TOKEN (any token, read access to public repos is enough).

export const MIN_STARS = 1000

/** Returns Map<"owner/name" as given, { nameWithOwner, stars, archived, pushedAt } | null>. */
export async function fetchRepos(repos, token = process.env.GITHUB_TOKEN) {
  if (!token) throw new Error('GITHUB_TOKEN is not set')
  const result = new Map()
  for (let i = 0; i < repos.length; i += 50) {
    const batch = repos.slice(i, i + 50)
    const fields = batch.map((repo, j) => {
      const [owner, name] = repo.split('/')
      return `r${j}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { nameWithOwner stargazerCount isArchived pushedAt }`
    })
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ query: `query { ${fields.join(' ')} }` }),
    })
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`)
    // A missing repo comes back as null with a NOT_FOUND error; the others still resolve.
    const { data } = await response.json()
    batch.forEach((repo, j) => {
      const r = data?.[`r${j}`]
      result.set(repo, r ? { nameWithOwner: r.nameWithOwner, stars: r.stargazerCount, archived: r.isArchived, pushedAt: r.pushedAt } : null)
    })
  }
  return result
}
