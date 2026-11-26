class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: {
      error: "Employee not found"
    }, status: :not_found
  end
end
