variable "disk_size" {
  type    = number
  default = 100
}
variable "image_name" {
  type    = string
  default = "custom-image-19"
}

variable "project_id" {
  type    = string
  default = "devv-414701"
}

variable "source_image_family" {
  type    = string
  default = "centos-stream-8"
}

variable "ssh_username" {
  type    = string
  default = "dev"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
}

variable "webapp_source" {
  type    = string
  default = "webapp.zip"
}

variable "webapp_destination" {
  type    = string
  default = "/tmp/webapp.zip"
}

variable "star_service_source" {
  type    = string
  default = "./packer/star.service"
}

variable "star_service_destination" {
  type    = string
  default = "/tmp/star.service"
}

variable "dependencies_script" {
  type    = string
  default = "./packer/dependencies.sh"
}

variable "owner_script" {
  type    = string
  default = "./packer/owner.sh"
}

packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}

source "googlecompute" "autogenerated_1" {
  disk_size           = var.disk_size
  image_name          = var.image_name
  project_id          = var.project_id
  source_image_family = var.source_image_family
  ssh_username        = var.ssh_username
  zone                = var.zone
}

build {
  sources = ["source.googlecompute.autogenerated_1"]

  provisioner "file" {
    destination = var.webapp_destination
    source      = var.webapp_source
  }

  provisioner "file" {
    destination = var.star_service_destination
    source      = var.star_service_source
  }
  provisioner "shell" {
    script = var.dependencies_script
  }

  provisioner "shell" {
    script = var.owner_script
  }
}
