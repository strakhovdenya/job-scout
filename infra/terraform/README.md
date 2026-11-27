# Terraform foundation

This directory contains provider constraints, Google provider defaults, validated inputs and mock-provider tests. It deliberately has no resources or backend. Terraform loads configuration from all `.tf` files in this directory. A `main.tf` file is optional and would have no content at this stage.

Terraform requires `>= 1.17.0, < 2.0.0`. CI uses 1.17.2. The `hashicorp/google` constraint is `~> 8.12`; `.terraform.lock.hcl` pins 8.12.0 and includes checksums for multiple platforms. Review constraint and lockfile changes together. The provider applies shared labels. `project_id` is required and excludes demo projects. `region` defaults to `europe-west3`. Verify product availability, quotas, location requirements and pricing when selecting the real European region. `environment` defaults to `production`; `staging` is reserved for a future isolated project. See `terraform.tfvars.example` for placeholders, and keep real tfvars and state out of Git.

From this directory, run:

```sh
terraform fmt -check -recursive
terraform init -backend=false -input=false
terraform validate
terraform test
```

Initialization may download the locked provider. The tests use a mocked provider without Google Cloud credentials or actual cloud operations. They validate the default and reject demo project IDs, non-European regions and unknown environments.

Planned resources include a Cloud Run Service and Job, Scheduler, Firestore Standard in Native Mode, Artifact Registry, Secret Manager, least-privilege IAM, WIF, Logging and Monitoring, and billing alerts. The planned GCS backend requires controlled access and versioning. Real provisioning, billing, API activation, remote backend setup, live planning and apply operations need the owner's explicit authorization. See the [roadmap](../../docs/roadmap.md) and [architecture decisions](../../docs/decisions/README.md).
