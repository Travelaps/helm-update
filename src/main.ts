import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import YAML from 'js-yaml'

const run = async (): Promise<void> => {
  try {
    const projectName: string =
      core.getInput('projectName') !== ''
        ? core.getInput('projectName')
        : 'elektraweb-booking-api-v2'
    const fileName: string =
      core.getInput('fileName') !== ''
        ? core.getInput('fileName')
        : 'Chart.yaml'
    const version: string =
      core.getInput('version') !== '' ? core.getInput('version') : '1.0.7'

    // const path = `https://github.com/Travelaps/helm-charts/blob/helm-updater/charts/${projectName}/${fileName}`
    const token = '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'
    const octokit = new Octokit({
      auth: token,
      baseUrl: 'https://api.github.com'
    })

    const result: any = await octokit.repos.getContent({
      owner: 'Travelaps',
      repo: 'helm-charts',
      path: `charts/${projectName}/${fileName}`,
      ref: 'helm-updater'
    })

    if (!Array.isArray(result.data) && result.data.content) {
      const content = Buffer.from(result.data.content, 'base64').toString()

      const yamlData: any = YAML.load(content)

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
        committer: {
          name: 'hamzamalfawaer',
          email: 'hamzamalfawaer@gmail.com'
        },
        sha: result.data.sha,
        content: yamlDataBase64,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      // eslint-disable-next-line no-console
      console.log(yamlData ?? 'err')
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
