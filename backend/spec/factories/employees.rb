FactoryBot.define do
  factory :employee do
    employee_code { "EMP001" }
    first_name { "Raj" }
    last_name { "kumar" }
    full_name { "#{first_name} #{last_name}" }
    email { "raj.kumar@example.com" }
    job_title { "Software Engineer" }
    salary { "9.99" }
    currency { "USD" }
    employment_status { 0 }
    joining_date { Date.current }
    association :country
    association :department
  end
end
