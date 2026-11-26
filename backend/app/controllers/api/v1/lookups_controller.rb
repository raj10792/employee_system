module Api
  module V1
    class LookupsController < BaseController
      def index
        render json: {
          data: {
            countries: Country.order(:name).select(:id, :name, :iso_code, :currency_code),
            departments: Department.order(:name).select(:id, :name)
          }
        }, status: :ok
      end
    end
  end
end
