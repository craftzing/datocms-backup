Changelog
===

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2022-07-12

### Added
- .trivyignore was added to whitelist CVEs that do not affect the project. 

### Changed
- Dependencies were updated to patch a number of CVE's.

### Removed
- The version has been removed from `package.json` as it has no relevance. The version is set as an environment variable
  on the image.

## [0.1.0-beta2] - 2021-11-10

### Added
- A new `dump` command has been added to enable uploading a full DatoCMS data dump (including assets) to a storage
  service. At this moment, we only support uploads to AWS S3.

## [0.1.0-beta1] - 2021-10-26

### Added
- A confirm option (`--confirm|-y`) has been added to the `cleanup older-than` command, which can be used to bypass any 
  confirmation prompts.

### Fixed
- Failed attempts to retrieve primary environment when creating a backup are now handled to provide better output.

## [0.1.0-alpha1] - 2021-10-07

First alpha release for the initial release.
