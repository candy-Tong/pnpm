import path from 'path'
import { prepareEmpty, preparePackages } from '@pnpm/prepare'
import {
  install,
  MutatedProject,
  mutateModules,
} from '@pnpm/core'
import rimraf from '@zkochan/rimraf'
import { testDefaults } from '../utils'

test('installing to a custom modules directory', async () => {
  const project = prepareEmpty()

  await install({
    dependencies: {
      'is-positive': '1.0.0',
    },
  }, await testDefaults({ modulesDir: 'pnpm_modules' }))

  await project.has('is-positive', 'pnpm_modules')

  await rimraf('pnpm_modules')
  await project.hasNot('is-positive', 'pnpm_modules')

  await install({
    dependencies: {
      'is-positive': '1.0.0',
    },
  }, await testDefaults({ frozenLockfile: true, modulesDir: 'pnpm_modules' }))

  await project.has('is-positive', 'pnpm_modules')
})

test('using different custom modules directory for every project', async () => {
  const projects = preparePackages([
    {
      location: 'project-1',
      package: {
        name: 'project-1',

        dependencies: { 'is-positive': '1.0.0' },
      },
    },
    {
      location: 'project-2',
      package: {
        name: 'project-2',

        dependencies: { 'is-positive': '1.0.0' },
      },
    },
  ])

  const importers: MutatedProject[] = [
    {
      mutation: 'install',
      rootDir: path.resolve('project-1'),
    },
    {
      mutation: 'install',
      rootDir: path.resolve('project-2'),
    },
  ]
  const allProjects = [
    {
      buildIndex: 0,
      manifest: {
        name: 'project-1',
        version: '1.0.0',

        dependencies: {
          'is-positive': '1.0.0',
        },
      },
      modulesDir: 'modules_1',
      rootDir: path.resolve('project-1'),
    },
    {
      buildIndex: 0,
      manifest: {
        name: 'project-2',
        version: '1.0.0',

        dependencies: {
          'is-positive': '1.0.0',
        },
      },
      modulesDir: 'modules_2',
      rootDir: path.resolve('project-2'),
    },
  ]
  await mutateModules(importers, await testDefaults({ allProjects }))

  await projects['project-1'].has('is-positive', 'modules_1')
  await projects['project-2'].has('is-positive', 'modules_2')
})
