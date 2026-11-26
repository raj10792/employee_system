module Api
  module V1
    class BaseController < ActionController::API
      include Authenticatable
      include Pundit::Authorization
    end
  end
end