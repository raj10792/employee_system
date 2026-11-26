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
    password_env: "password123",
    role: :hr_manager
  },
  {
    email: ENV.fetch("ADMIN_SEED_EMAIL", "admin@example.com"),
    password_env: "password123",
    role: :admin
  }
]

seed_users.each do |attributes|
  user = User.find_or_initialize_by(email: attributes.fetch(:email))

  if user.new_record?
    password = ENV[attributes.fetch(:password_env)]
    password ||= "password123"
    raise "Set #{attributes.fetch(:password_env)} before seeding production users" if password.blank?

    user.password = password
  end

  user.role = attributes.fetch(:role)
  user.save! if user.changed?
end


countries_data = [
  { name: "India", iso_code: "IN", currency_code: "INR" },
  { name: "United States", iso_code: "US", currency_code: "USD" },
  { name: "United Kingdom", iso_code: "GB", currency_code: "GBP" },
  { name: "Canada", iso_code: "CA", currency_code: "CAD" },
  { name: "Australia", iso_code: "AU", currency_code: "AUD" }
]

countries_data.each do |data|
  Country.find_or_create_by!(iso_code: data[:iso_code]) do |country|
    country.name = data[:name]
    country.currency_code = data[:currency_code]
  end
end

puts "Countries created."


puts "Creating departments..."

departments_data = [
  { name: "Engineering", description: "Software development and engineering" },
  { name: "Human Resources", description: "Employee management and recruitment" },
  { name: "Product Management", description: "Product planning and strategy" },
  { name: "Marketing", description: "Marketing and brand management" },
  { name: "Finance", description: "Financial planning and accounting" }
]

departments_data.each do |data|
  Department.find_or_create_by!(name: data[:name]) do |department|
    department.description = data[:description]
  end
end

puts "Departments created."


puts "Creating employees..."

employees_data = [
  {
    employee_code: "EMP0001",
    first_name: "Raj",
    last_name: "Sharma",
    email: "raj.sharma@example.com",
    job_title: "Ruby on Rails Developer",
    salary: 85000,
    currency: "INR",
    employment_status: :active,
    country: "India",
    department: "Engineering",
    joining_date: "2022-01-15"
  },
  {
    employee_code: "EMP0002",
    first_name: "Amit",
    last_name: "Verma",
    email: "amit.verma@example.com",
    job_title: "Senior Software Engineer",
    salary: 120000,
    currency: "INR",
    employment_status: :active,
    country: "India",
    department: "Engineering",
    joining_date: "2021-05-10"
  },
  {
    employee_code: "EMP0003",
    first_name: "Priya",
    last_name: "Singh",
    email: "priya.singh@example.com",
    job_title: "HR Manager",
    salary: 95000,
    currency: "INR",
    employment_status: :active,
    country: "India",
    department: "Human Resources",
    joining_date: "2020-03-20"
  },
  {
    employee_code: "EMP0004",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    job_title: "Software Engineer",
    salary: 9000,
    currency: "USD",
    employment_status: :active,
    country: "United States",
    department: "Engineering",
    joining_date: "2021-08-12"
  },
  {
    employee_code: "EMP0005",
    first_name: "Emily",
    last_name: "Johnson",
    email: "emily.johnson@example.com",
    job_title: "Product Manager",
    salary: 11000,
    currency: "USD",
    employment_status: :active,
    country: "United States",
    department: "Product Management",
    joining_date: "2022-06-01"
  },
  {
    employee_code: "EMP0006",
    first_name: "Oliver",
    last_name: "Brown",
    email: "oliver.brown@example.com",
    job_title: "Backend Developer",
    salary: 6500,
    currency: "GBP",
    employment_status: :active,
    country: "United Kingdom",
    department: "Engineering",
    joining_date: "2023-02-15"
  },
  {
    employee_code: "EMP0007",
    first_name: "Sophia",
    last_name: "Wilson",
    email: "sophia.wilson@example.com",
    job_title: "Marketing Manager",
    salary: 5500,
    currency: "GBP",
    employment_status: :inactive,
    country: "United Kingdom",
    department: "Marketing",
    joining_date: "2020-11-10"
  },
  {
    employee_code: "EMP0008",
    first_name: "Liam",
    last_name: "Taylor",
    email: "liam.taylor@example.com",
    job_title: "DevOps Engineer",
    salary: 8500,
    currency: "CAD",
    employment_status: :active,
    country: "Canada",
    department: "Engineering",
    joining_date: "2022-09-05"
  },
  {
    employee_code: "EMP0009",
    first_name: "Isabella",
    last_name: "Martin",
    email: "isabella.martin@example.com",
    job_title: "Financial Analyst",
    salary: 7000,
    currency: "AUD",
    employment_status: :terminated,
    country: "Australia",
    department: "Finance",
    joining_date: "2019-04-18"
  },
  {
    employee_code: "EMP0010",
    first_name: "Noah",
    last_name: "Anderson",
    email: "noah.anderson@example.com",
    job_title: "Frontend Developer",
    salary: 75000,
    currency: "INR",
    employment_status: :active,
    country: "India",
    department: "Engineering",
    joining_date: "2023-07-01"
  }
]

employees_data.each do |data|
  country = Country.find_by!(name: data[:country])
  department = Department.find_by!(name: data[:department])

  employee = Employee.find_or_initialize_by(
    employee_code: data[:employee_code]
  )

  employee.assign_attributes(
    first_name: data[:first_name],
    last_name: data[:last_name],
    email: data[:email],
    job_title: data[:job_title],
    salary: data[:salary],
    currency: data[:currency],
    employment_status: data[:employment_status],
    country: country,
    department: department,
    joining_date: Date.parse(data[:joining_date])
  )

  employee.save!
end
