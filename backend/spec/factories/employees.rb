FactoryBot.define do
  factory :employee do
    employee_code { "EMP#{Faker::Alphanumeric.unique.alphanumeric(number: 8).upcase}" }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    full_name { Faker::Name.name }
    email { Faker::Internet.unique.email }
    job_title { Faker::Job.title }
    salary { Faker::Number.decimal(l_digits: 5, r_digits: 2) }
    currency { Faker::Currency.code }
    employment_status { Employee.employment_statuses.keys.sample }
    joining_date { Faker::Date.between(from: 10.years.ago, to: Date.current) }
    association :country
    association :department
  end
end
