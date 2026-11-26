class RevokedToken < ApplicationRecord
  validates :jti, presence: true, uniqueness: true
  validates :exp, presence: true
end
