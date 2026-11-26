require 'rails_helper'

RSpec.describe Country, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:name).case_insensitive }

    it { should validate_presence_of(:iso_code) }
    it { should validate_uniqueness_of(:iso_code) }

    it { should validate_presence_of(:currency_code) }
  end

  describe 'associations' do
    it { should have_many(:employees) }
  end
end
