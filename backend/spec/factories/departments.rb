FactoryBot.define do
  factory :department do
    name { Faker::Commerce.unique.department }
    description { Faker::Lorem.sentence }
  end
end
