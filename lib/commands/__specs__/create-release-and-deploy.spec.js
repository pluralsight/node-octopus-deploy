'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const subject = require('../create-release-and-deploy').execute
const mockDeployment = require('../../../test/mocks/mock-deployment')
const mockRelease = require('../../../test/mocks/mock-release')
const octopusApi = require('../../octopus-deploy')

describe('commands/create-release-and-deploy', () => {
  afterEach(() => {
    sinon.restore(octopusApi.releases.create)
    sinon.restore(octopusApi.deployments.create)
  })

  it('creates a release and then deploys that release', () => {
    const projectId = 'project-123'
    const version = '1.0.0-rc-3'
    const releaseNotes = 'Release notes for testing'
    const selectedPackages = [{ 'StepName': 'Step 1', 'Version': '1.0.0' }]
    const releaseParams = { projectId, version, releaseNotes, selectedPackages }

    const environmentId = 'Environments-123'
    const comments = 'Deploy releases-123 to DEVSERVER1'
    const formValues = { 'd02ff723-6fdb-2011-792d-ad99eaa3e0bb': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }
    const deployParams = { environmentId, comments, formValues }

    sinon.stub(octopusApi.releases, 'create', () => BPromise.resolve(mockRelease))
    sinon.stub(octopusApi.deployments, 'create', () => BPromise.resolve(mockDeployment))

    return subject(releaseParams, deployParams).then(deployment => {
      expect(deployment).to.eql(mockDeployment)
      expect(octopusApi.releases.create).to.be.calledWith(projectId, version, releaseNotes, selectedPackages)
      expect(octopusApi.deployments.create).to.be.calledWith(environmentId, mockRelease.Id, comments, formValues)
    })
  })
})
