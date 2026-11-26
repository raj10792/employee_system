FactoryBot.define do
  factory :country do
    name { Faker::Address.unique.country }
    iso_code { Faker::Address.unique.country_code }
    currency_code { Faker::Currency.code }
  end
end
