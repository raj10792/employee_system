module Api
  module V1
    class SalariesController < BaseController
      def index
        authorize :salary, :index?

        result = Salary::DashboardQuery.new.call

        render json: {
          data: result
        }, status: :ok
      end
    end
  end
end