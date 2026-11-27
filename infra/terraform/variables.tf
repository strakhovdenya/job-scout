variable "project_id" {
  description = "Google Cloud project ID that hosts JobScout."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$", var.project_id))
    error_message = "project_id must be a valid Google Cloud project ID (6-30 characters, lowercase letters, digits and hyphens)."
  }

  validation {
    condition     = !startswith(var.project_id, "demo-")
    error_message = "project_id must not be a Firebase \"demo-\" project; those are reserved for local emulators."
  }
}

variable "region" {
  description = "Primary Google Cloud region. Germany (europe-west3, Frankfurt) is the initial preference; verify service availability and pricing before deployment."
  type        = string
  default     = "europe-west3"

  validation {
    condition     = can(regex("^europe-[a-z]+[0-9]+$", var.region))
    error_message = "region must be a European Google Cloud region, for example europe-west3."
  }
}

variable "environment" {
  description = "Deployment environment name. Only production exists today; staging is reserved for a future isolated project."
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "environment must be either production or staging."
  }
}
