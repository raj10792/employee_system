module Api
  module V1
    class BaseController < ActionController::API
      include Authenticatable
      include Pundit::Authorization

      rescue_from Pundit::NotAuthorizedError do
        render json: {
          error: "Forbidden"
        }, status: :forbidden
      end
    end
  end
end
