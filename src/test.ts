import {Octokit} from '@octokit/rest'
import YAML from 'js-yaml'
;(async () => {
  const projectName = ''
  const fileName = ''
  const version = ``
  const token = ''

  const octokit = new Octokit({
    // auth: token,
    baseUrl: 'https://api.github.com'
  })

  const result: any = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}',
    {
      owner: 'Travelaps',
      repo: 'helm-charts',
      path: `charts/${projectName}/${fileName}`,
      ref: 'helm-updater',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        authorization: token
      }
    }
  )

  if (result.data.content) {
    const content = Buffer.from(result.data.content, 'base64').toString()

    const yamlData = YAML.load(content) as {[k: string]: string}

    yamlData.appVersion = version

    const yamlDataBase64 = Buffer.from(YAML.dump(yamlData), 'utf8').toString(
      'base64'
    )

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Travelaps',
      repo: 'helm-charts',
      path: `charts/${projectName}/${fileName}`,
      branch: 'helm-updater',
      message: `${projectName} new app version ${version}`,
      sha: result.data.sha,
      content: yamlDataBase64,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        authorization: `token ${token}`
      }
    })

    // eslint-disable-next-line no-console
    console.log(yamlData ?? 'err')
  }
})()
