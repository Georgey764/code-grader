output "grader_public_ip" {
  description = "The public static IP of the grader engine"
  value       = aws_eip.grader_static_ip.public_ip
}