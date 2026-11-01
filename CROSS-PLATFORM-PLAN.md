# macOS and Linux release assessment

Status: source review completed on November 1, 2026. No usable macOS/Linux installer has been built or tested yet. The existing Windows beta and its two installers are unchanged.

## Confirmed blockers in this source tree

- `DesktopApp/Services/Local/LocalWorkspaceStore.cs` defaults to `WindowsDpapiRequestProtector`. Its implementation in `ILocalRequestProtector.cs` calls Windows user-scoped `ProtectedData` for saved requests, environments, and history.
- `src/Cli/Program.cs` explicitly exits with code 2 on non-Windows platforms. Removing that check alone would leave the underlying encryption dependency unresolved.
- `DesktopApp/Services/SecureSessionStore.cs` also calls `ProtectedData`. The two Personal Sync key/credential stores use Windows DPAPI. Future features must remain disabled until their storage paths are supported.
- `tools/build-beta.ps1` publishes only `win-x64`; `tools/build-installers.ps1` creates Windows Inno Setup installers only.
- The desktop unit-test CI job uses Windows. The existing Ubuntu job exercises API/database acceptance rather than the native desktop installer.

## Implementation sequence

1. Preserve Windows DPAPI behavior and compatibility with existing local databases. Introduce platform selection behind the existing request-protection interface, with native secure key storage on each new platform. Avoid a plaintext fallback when a key store is unavailable or locked; provide a useful error. Cover decryption failure, cancellation, and key persistence across restarts.
2. Make the desktop and CLI resolve the same local database and protection key under the same OS user. Review session-store startup paths so disabled server features cannot trigger unsupported encryption calls. Keep Personal Sync and Collaboration as Coming soon.
3. Test local workspace creation, protected request/environment/history round trips, sending a request, collection runs, backup import/export, first-run helpers, and CLI access to the desktop's data on each target OS.
4. Build self-contained targets for macOS Apple Silicon and Intel, then Linux x64 and ARM64 if supported by the chosen runtime/native dependencies. Preserve the two editions: Desktop and Desktop + CLI with a shared runtime.
5. Package on native build hosts. Prepare macOS application bundles and installer/disk-image packaging; verify executable permissions, launcher behavior, signing and notarization status. Prepare Linux desktop entries/icons, a portable distribution and an initial distribution-specific installer. Verify install, launch, upgrade, uninstall, dependency requirements, and preservation of user data.
6. Inspect every package for databases, saved credentials, test workspaces, and private keys. Produce build metadata and SHA256 manifests. Run CLI help and missing-database checks from the installed packages, then native desktop smoke tests.
7. Add only successfully tested artifacts to the website's platform chooser, using their actual sizes, hashes, architecture labels, and support requirements. Keep the existing optional coffee link after downloads.

## Testing availability

This work session is on Windows. The WSL inventory command returned `Wsl/E_ACCESSDENIED`; no usable Linux test host was established. A macOS build/test host and signing identity have not been established. Cross-published binaries alone would not demonstrate a working installer, so they must not be offered as tested releases.

The website is local-only at the owner's request. Do not publish the site or upload these release artifacts without new authorization.
