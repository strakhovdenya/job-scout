# Offline tests: the mocked provider never contacts Google Cloud and needs no credentials.
mock_provider "google" {}

variables {
  project_id = "job-scout-prod"
}

run "accepts_valid_production_configuration" {
  command = plan

  assert {
    condition     = var.region == "europe-west3"
    error_message = "The default region must be europe-west3."
  }
}

run "rejects_emulator_demo_project" {
  command = plan

  variables {
    project_id = "demo-job-scout"
  }

  expect_failures = [var.project_id]
}

run "rejects_non_european_region" {
  command = plan

  variables {
    region = "us-central1"
  }

  expect_failures = [var.region]
}

run "rejects_unknown_environment" {
  command = plan

  variables {
    environment = "dev"
  }

  expect_failures = [var.environment]
}
