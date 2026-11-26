FactoryBot.define do
  factory :revoked_token do
    jti { SecureRandom.uuid }
    exp { 24.hours.from_now }
  end
end
