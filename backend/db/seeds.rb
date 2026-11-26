# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

seed_users = [
  {
    email: ENV.fetch("HR_MANAGER_SEED_EMAIL", "hr@example.com"),
    password_env: "HR_MANAGER_SEED_PASSWORD",
    role: :hr_manager
  },
  {
    email: ENV.fetch("ADMIN_SEED_EMAIL", "admin@example.com"),
    password_env: "ADMIN_SEED_PASSWORD",
    role: :admin
  }
]

seed_users.each do |attributes|
  user = User.find_or_initialize_by(email: attributes.fetch(:email))

  if user.new_record?
    password = ENV[attributes.fetch(:password_env)]
    password ||= "change-me" unless Rails.env.production?
    raise "Set #{attributes.fetch(:password_env)} before seeding production users" if password.blank?

    user.password = password
  end

  user.role = attributes.fetch(:role)
  user.save! if user.changed?
end
