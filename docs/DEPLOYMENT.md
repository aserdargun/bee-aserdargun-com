# BEE publication contract

GitHub-first publication was explicitly authorized, followed by deployment to **aserdargun subscription 2**. This subscription overrides the deployment skill's default subscription. All Azure CLI operations use the explicit subscription ID; the machine's default subscription is preserved.

| Field | Target |
|---|---|
| Repository | [aserdargun/bee-aserdargun-com](https://github.com/aserdargun/bee-aserdargun-com), public |
| Branch | `main` |
| Subscription | `aserdargun subscription 2` |
| Resource group | `rg-bee-aserdargun-com` |
| Static Web App | `swa-bee-aserdargun-com` |
| Region / tier | West Europe / Free |
| Generated hostname | [agreeable-forest-01a27f803.6.azurestaticapps.net](https://agreeable-forest-01a27f803.6.azurestaticapps.net) |
| Existing public address | [bee.aserdargun.com](https://bee.aserdargun.com), Azure binding verified `Ready` on 2026-09-06 |
| Static artifact | `out/` |
| Workflow | `.github/workflows/deploy-swa-bee-aserdargun-com.yml` |
| Secret name | `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_BEE_ASERDARGUN_COM` |
| Concurrency group | `swa-bee-aserdargun-com-production` |

The original application was published to GitHub in commit `9e9319b`, with validation-only CI and no Azure source integration. The production workflow is a subsequent, separately sequenced publication step. Existing macOS CI remains, while the Azure workflow runs the same release contract on Ubuntu before deployment.

The workflow pins official actions to immutable commits, installs from the lockfile, runs kernel/environment/browser checks, verifies the prebuilt static artifact, and uploads it without a server build or API. This follows Microsoft's [prebuilt artifact configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration#skip-building-front-end-app). Only the repository-specific deployment secret is used, and it is transferred directly from Azure to GitHub without printing or writing its value.

`out/release.json` records repository, commit, branch, working-tree status, application version and build time. Production verification requires the live record to match the workflow commit, then runs all 36 desktop/mobile browser scenarios against the generated Azure hostname, including bilingual term help, glossary search and experiment learning checks. Model seed/tick determinism is independent of this deployment timestamp.

To run the browser suite against the verified production URL:

```sh
BEE_BASE_URL=https://agreeable-forest-01a27f803.6.azurestaticapps.net npm run test:e2e
```

The environment variable disables the temporary local test server. Tests affect only browser-local simulation state and do not write server data.

The initial deployment used only the Azure-generated hostname. The existing `bee.aserdargun.com` binding is now `Ready` on this same app. Routine releases reuse that binding and verify both hosts; DNS and domain-configuration changes require a separate request. The app currently reports provider `GitHub`, repository `aserdargun/bee-aserdargun-com` and branch `main`; the workflow listed above remains its only active Azure deployment workflow.
