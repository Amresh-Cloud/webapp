variable "credentials_file" {
  type    = string
}

variable "disk_size" {
  type    = number
}

variable "image_name" {
  type    = string
}

variable "project_id" {
  type    = string
}

variable "source_image_family" {
  type    = string
}

variable "ssh_username" {
  type    = string
}

variable "zone" {
  type    = string
}

variable "webapp_source" {
  type    = string
}

variable "webapp_destination" {
  type    = string
}

variable "star_service_source" {
  type    = string
}

variable "star_service_destination" {
  type    = string
}

variable "dependencies_script" {
  type    = string
}

variable "owner_script" {
  type    = string
}
