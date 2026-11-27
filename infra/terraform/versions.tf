terraform {
  required_version = ">= 1.17.0, < 2.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.12"
    }
  }

  # Remote state is planned as a GCS backend with versioning and restricted IAM.
  # It is intentionally not configured until the production project exists.
  # See README.md.
}
