'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
const mockProject = require('../../../test/mocks/mock-project')
const mockRelease = require('../../../test/mocks/mock-release')
const octopusApi = require('../../octopus-deploy')
const subject = require('../simple-create-release')

describe('commands/simple-create-release', () => {
  afterEach(() => {
    sinon.restore(getProject.execute)
    sinon.restore(getSelectedPackages.execute)
    sinon.restore(octopusApi.variables.find)
  })

  it('creates a release', () => {
    const projectSlug = 'my-project-name'
    const version = '1.0.0-rc-3'
    const releaseNotes = 'Release notes for testing'
    const packageVersion = '1.0.0'
    const releaseParams = { projectSlugOrId: projectSlug, version, releaseNotes, packageVersion }

    const selectedPackages = [{ 'StepName': 'Step 1', 'Version': packageVersion }]

    sinon.stub(getProject, 'execute', () => BPromise.resolve(mockProject))
    sinon.stub(getSelectedPackages, 'execute', () => BPromise.resolve(selectedPackages))
    sinon.stub(octopusApi.releases, 'create', () => BPromise.resolve(mockRelease))

    return subject(releaseParams).then(release => {
      expect(release).to.eql(mockRelease)
      expect(getProject.execute).to.be.calledWith(projectSlug)
      expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, packageVersion)
      expect(octopusApi.releases.create).to.be.calledWith(mockProject.Id, version, releaseNotes, selectedPackages)
    })
  })
})
