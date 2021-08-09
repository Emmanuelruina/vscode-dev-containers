/*--------------------------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
 *-------------------------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { push } from './src/push';
import { updateAllScriptSourcesInRepo, copyLibraryScriptsForAllDefinitions } from './src/prep';
import { generateImageInformationFiles } from './src/image-info';
import { patch, patchAll } from './src/patch';
import { packageDefinitions } from './src/package';
import { getConfig } from './src/utils/config';
import { CommonParams } from './src/domain/common';
const packageJson = require('../package.json');

console.log('vscode-dev-containers CLI\nCopyright (c) Microsoft Corporation. All rights reserved.\n')

require('yargs')
    .command('pack', 'package dev container definitions', (yargs) => {
        yargs
            .options({
                'release': {
                    describe: 'vscode-dev-containers release tag or a branch',
                    default: `v${packageJson.version}`
                },
                'registry': { describe: 'container registry to push images to' },
                'repository': { describe: 'container repository path prefix' },
                'stub-registry': { describe: 'registry to add to customer facing Dockerfile' },
                'stub-repository': { describe: 'customer facing Dockerfile repository path prefix' },
                'github-repo': { describe: 'vscode-dev-containers repo name' },
                'package-only': {
                    describe: 'whether to prep/build/push before packaging',
                    type: 'boolean',
                    default: false
                },
                'prep-and-package-only': {
                    describe: 'prep and package, but do not build/push',
                    type: 'boolean',
                    default: false
                },
                'update-latest': {
                    describe: 'whether to tag latest and {MAJOR}',
                    type: 'boolean',
                    default: true
                },
                'clean': {
                    describe: 'whether to clean up staging folder when done',
                    type: 'boolean',
                    default: true
                },
                'skip-push': {
                    describe: 'A space separated list of definition IDs to skip build and push.',
                    type: 'array',
                    default: []
                }
            })
    }, packCommand)
    .command('push [devcontainer]', 'push dev container images to a repository', (yargs) => {
        yargs
            .positional('devcontainer', {
                describe: 'ID of dev container to push',
                default: null
            })
            .options({
                'release': {
                    describe: 'vscode-dev-containers release tag or a branch',
                    default: `v${packageJson.version}`
                },
                'registry': { describe: 'container registry to push images to' },
                'repository': { describe: 'container repository path prefix' },
                'stub-registry': { describe: 'registry to add to customer facing Dockerfile' },
                'stub-repository': { describe: 'customer facing Dockerfile repository path prefix' },
                'github-repo': { describe: 'vscode-dev-containers repo name' },
                'update-latest': {
                    describe: 'whether to tag latest and {MAJOR} if pushing',
                    type: 'boolean',
                    default: true
                },
                'prep-only': {
                    describe: 'prep the containers for build/push, but do not actually do it',
                    type: 'boolean',
                    default: false
                },
                'push': {
                    describe: 'whether to push after prep/build',
                    type: 'boolean',
                    default: true
                },
                'page': {
                    describe: 'Page number (of total) to push',
                    type: 'integer',
                    default: 1
                },
                'page-total': {
                    describe: 'Total number of pages to use when parallelizing builds',
                    type: 'integer',
                    default: 1
                },
                'replace-images': {
                    describe: 'Whether to replace released images. Does not apply to dev tag.',
                    type: 'boolean',
                    default: false
                },
                'skip': {
                    describe: 'A space separated list of definition IDs to skip building and pushing.',
                    type: 'array',
                    default: []
                }
            })
    }, pushCommand)
    .command('update-script-sources <release>', 'updates all script source URLs in Dockerfiles to a tag or branch', (yargs) => {
        yargs
            .positional('release', {
                describe: 'release tag to branch use for script URLs',
            })
            .options({
                'github-repo': {
                    describe: 'vscode-dev-containers repo name',
                    default: getConfig('githubRepoName', 'microsoft/vscode-dev-containers')
                },
                'update-sha': {
                    describe: 'update script SHAs to match file',
                    type: 'boolean',
                    default: true
                }
            })
    }, updateScriptSourcesCommand)
    .command('cg [devcontainer]', 'generate cgmanifest.json', (yargs) => {
        yargs
            .positional('devcontainer', {
                describe: 'limits manifest generation to single definition',
                default: null
            })
            .options({
                'release': {
                    describe: 'vscode-dev-containers release tag or a branch',
                    default: `v${packageJson.version}`
                },
                'registry': { describe: 'container registry to push images to' },
                'repository': { describe: 'container repository path prefix' },
                'stub-registry': { describe: 'registry to add to customer facing Dockerfile' },
                'stub-repository': { describe: 'customer facing Dockerfile repository path prefix' },
                'github-repo': { describe: 'vscode-dev-containers repo name' },
                'build': {
                    describe: 'whether to to build the image first step',
                    type: 'boolean',
                    default: true
                },
                'prune': {
                    describe: 'whether to prune images between definitions',
                    type: 'boolean',
                    default: false
                },
                'cg': {
                    describe: 'whether to generate cgmanifest.json',
                    type: 'boolean',
                    default: true
                },
                'markdown': {
                    describe: 'whether to generate markdown files in history folders',
                    type: 'boolean',
                    default: false
                },
                'output-path': {
                    describe: 'path to where extracted information should be stored',
                    default: path.resolve(__dirname, '..', getConfig('informationFileOutputPath', '.'))
                },
                'overwrite': {
                    describe: 'whether to overwrite cgmanifest.json or markdown files',
                    type: 'boolean',
                    default: true
                }
            })
    }, imageInfoCommand)
    .command('info [devcontainer]', 'generate image information files', (yargs) => {
        yargs
            .positional('devcontainer', {
                describe: 'limits manifest generation to single definition',
                default: null
            })
            .options({
                'release': {
                    describe: 'vscode-dev-containers release tag or a branch',
                    default: `v${packageJson.version}`
                },
                'registry': { describe: 'container registry to push images to' },
                'repository': { describe: 'container repository path prefix' },
                'stub-registry': { describe: 'registry to add to customer facing Dockerfile' },
                'stub-repository': { describe: 'customer facing Dockerfile repository path prefix' },
                'github-repo': { describe: 'vscode-dev-containers repo name' },
                'build': {
                    describe: 'whether to to build the image first step',
                    type: 'boolean',
                    default: true
                },
                'cg': {
                    describe: 'whether to generate cgmanifest.json',
                    type: 'boolean',
                    default: false
                },
                'markdown': {
                    describe: 'whether to generate markdown files in history folders',
                    type: 'boolean',
                    default: true
                },
                'prune': {
                    describe: 'whether to prune images between definitions',
                    type: 'boolean',
                    default: false
                },
                'output-path': {
                    describe: 'path to where extracted information should be stored',
                    default: path.resolve(__dirname, '..', getConfig('informationFileOutputPath', '.'))
                },
                'overwrite': {
                    describe: 'whether to overwrite cgmanifest.json or markdown files',
                    type: 'boolean',
                    default: false
                }
            })
    }, imageInfoCommand)
    .command('patch', 'patch existing images', (yargs) => {
        yargs
            .options({
                'all': {
                    describe: 'run all patches not already complete',
                    type: 'boolean',
                    default: false
                },
                'patch-path': {
                    describe: 'path to the folder containing the patch files',
                    default: '.'
                },
                'registry': {
                    describe: 'container registry to push images to',
                    default: getConfig('containerRegistry', 'docker.io')
                },
                'registry-path': {
                    describe: 'container registry path',
                    default: getConfig('containerRegistryPath', '')
                }
            })
    }, patchCommand)
    .command('copy-library-scripts', 'copy files from script-library folder into appropriate definitions', () => {}, copyLibraryScriptsCommand)
    .demandCommand()
    .help()
    .argv;

function pushCommand(argv) {
    const params = argvToCommonParams(argv);
    push(params, argv.updateLatest, argv.push, argv.prepOnly, argv.skip, argv.page, argv.pageTotal, argv.replaceImages, argv.devcontainer)
        .catch((reason) => {
            console.error(`(!) Push failed - ${reason}`);
            if(reason.stack) {
                console.error(`    ${reason.stack}`);
            }
            process.exit(1);
        });
}

function packCommand(argv) {
    const params = argvToCommonParams(argv);
    packageDefinitions(params, argv.updateLatest, argv.prepAndPackageOnly, argv.packageOnly, argv.clean, argv.skipPush)
        .catch((reason) => {
            console.error(`(!) Packaging failed - ${reason}`);
            if(reason.stack) {
                console.error(`    ${reason.stack}`);
            }
            process.exit(1);
        });
}

function updateScriptSourcesCommand(argv) {
    const params = argvToCommonParams(argv);
    updateAllScriptSourcesInRepo(params, argv.updateSha)
        .catch((reason) => {
            console.error(`(!) Failed to update script sources - ${reason}`);
            if(reason.stack) {
                console.error(`    ${reason.stack}`);
            }
            process.exit(1);
        });
}

function copyLibraryScriptsCommand() {
    copyLibraryScriptsForAllDefinitions()
        .catch((reason) => {
            console.error(`(!) Failed to copy library scripts to definitions  - ${reason}`);
            if(reason.stack) {
                console.error(`    ${reason.stack}`);
            }
            process.exit(1);
        });
}

function imageInfoCommand(argv) {
    const params = argvToCommonParams(argv);
    generateImageInformationFiles(params, argv.build, argv.prune, argv.cg, argv.markdown, argv.overwrite, argv.outputPath, argv.devcontainer)
        .catch((reason) => {
            console.error(`(!) Image information file generation failed - ${reason}`);
            if(reason.stack) {
                console.error(`    ${reason.stack}`);
            }
            process.exit(1);
        });
}

function patchCommand(argv) {
    if (argv.all) {
        patch.patchAll(argv.registry, argv.registryPath)
            .catch((reason) => {
                console.error(`(!) Patching failed - ${reason}`);
                if(reason.stack) {
                    console.error(`    ${reason.stack}`);
                }    
                process.exit(1);
            });
    } else {
        patch.patch(argv.patchPath, argv.registry, argv.registryPath)
            .catch((reason) => {
                console.error(`(!) Patching failed - ${reason}`);
                if(reason.stack) {
                    console.error(`    ${reason.stack}`);
                }    
                process.exit(1);
            });
    }
}

function argvToCommonParams(argv): CommonParams {
    return <CommonParams> {
        githubRepo: argv.githubRepo || getConfig('githubRepoName', 'microsoft/vscode-dev-containers'),
        release: argv.release || `v${packageJson.version}`,
        registry: argv.registry || getConfig('containerRegistry', 'devcon.azurecr.io'),
        repository: argv.repository || getConfig('containerRepository', ''),
        stubRegistry: argv.stubRegistry || getConfig('stubRegistry', getConfig('containerRegistry', 'mcr.microsoft.com')),
        stubRepository: argv.stubRepository || getConfig('stubRepository', getConfig('containerRepository', ''))
    }
}