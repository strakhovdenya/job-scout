provider "google" {
  project = var.project_id
  region  = var.region

  default_labels = {
    app         = "job-scout"
    environment = var.environment
    managed-by  = "terraform"
  }
}
