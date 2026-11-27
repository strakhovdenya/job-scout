---
name: gcp-terraform
description: Google Cloud architecture and Terraform for JobScout in infra/terraform. Use when adding or reviewing Terraform resources, variables, tests or the provider lockfile, or when designing Cloud Run services and jobs, Cloud Scheduler, Artifact Registry, Secret Manager, Firestore, IAM, service accounts, Workload Identity Federation for GitHub Actions, monitoring or billing alerts.
---

# Google Cloud + Terraform (infra/terraform)

## Hard rules

- **Never** run `terraform apply`, `terraform destroy`, `terraform import`, state commands, or
  `gcloud` commands that create projects, enable APIs, change billing, deploy, or push images
  without explicit user authorization for that exact action. A clean plan is not authorization.
- Do not run `terraform plan` against a real project unless asked; tests use `mock_provider`.
- Local infrastructure lives in `compose.yaml` only, never in Terraform.
- Never commit state, `*.tfvars` (only `terraform.tfvars.example`), plans or credentials.

## Current state

`versions.tf` (terraform `>= 1.17.0, < 2.0.0`, `hashicorp/google ~> 8.12`), `providers.tf`
(default labels), `variables.tf` (`project_id` rejects `demo-`, `region` default `europe-west3`
restricted to Europe, `environment`), `tests/variables.tftest.hcl`. No resources yet. Remote
state is **planned**: GCS backend, object versioning, uniform access, IAM restricted to the
deployer identity; added once the project exists.

## Target architecture (planned)

- Cloud Run **Service** `web` (scale to zero, `min_instance_count = 0`, bounded max instances,
  request-based billing) and Cloud Run **Job** `worker` (bounded tasks, timeout, retries).
- Cloud Scheduler triggers the job with a dedicated invoker service account.
- Artifact Registry Docker repo with cleanup policies; Secret Manager for API keys and Auth
  secrets, mounted as env/volumes; Firestore Native database in the chosen region; composite
  indexes declared here (see `firestore`).
- Dedicated service accounts per workload (web runtime, worker runtime, scheduler invoker,
  CI deployer). Least privilege: resource-level bindings (secret-level `secretAccessor`, job-level
  `run.invoker`), no `roles/owner`/`editor`, no primitive roles, no `allUsers` except where a
  public web endpoint is intended and reviewed.
- GitHub Actions via Workload Identity Federation with an attribute condition restricting the
  repository (and branch/environment); never service-account keys.
- Logging with sane retention and exclusions; uptime/alert policies; billing budget alerts
  (alerts notify only, they do **not** cap spend — see `free-tier-governance`).
- Enabling APIs (`google_project_service`) is code here but executed only on authorization.

## Workflow

1. Confirm the resource and its arguments in the provider docs for the pinned version.
2. Use variables with `description`, `type` and `validation`; no hardcoded project IDs;
   region always from `var.region`.
3. Add or extend `tests/*.tftest.hcl` (`mock_provider "google" {}`, `command = plan`,
   `expect_failures` for validations, asserts for security-relevant attributes).
4. When provider versions change, regenerate the lockfile for all platforms:
   `terraform providers lock -platform=linux_amd64 -platform=windows_amd64 -platform=darwin_amd64 -platform=darwin_arm64`.
5. Update `infra/terraform/README.md` / docs if present (keep planned vs implemented clear).

## Plan review checklist (when a user-authorized plan exists)

- Any `destroy` or `-/+ replace`? Especially Firestore, secrets, Artifact Registry, state bucket.
- IAM widened? New bindings, broader roles, project-level instead of resource-level, `allUsers`.
- Public exposure: Cloud Run ingress/invoker, bucket access, firewall-like settings.
- Cost: min instances > 0, CPU always allocated, large memory, log sinks, new paid APIs.
- Secrets or sensitive values in plain outputs or variables without `sensitive = true`.

## Verification (offline)

```sh
cd infra/terraform
terraform fmt -check -recursive
terraform init -backend=false -input=false
terraform validate
terraform test
```

Report the actual output; CI runs the same steps (`.github/workflows/ci.yml`).

## References

- https://registry.terraform.io/providers/hashicorp/google/latest/docs
- https://developer.hashicorp.com/terraform/language/tests
- https://developer.hashicorp.com/terraform/cli/commands/providers/lock
- https://cloud.google.com/run/docs
- https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines
- https://cloud.google.com/billing/docs/how-to/budgets
- https://cloud.google.com/docs/terraform/best-practices/general-style-structure
