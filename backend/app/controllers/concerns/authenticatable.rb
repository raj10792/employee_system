module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  attr_reader :current_user, :current_token_payload

  def authenticate_user!
    token = bearer_token

    raise JWT::DecodeError, "Missing token" if token.blank?

    payload = Auth::TokenService.decode(token)

    if RevokedToken.exists?(jti: payload["jti"])
      raise JWT::DecodeError, "Token has been revoked"
    end

    @current_user = User.find(payload["sub"])
    @current_token_payload = payload

  rescue JWT::DecodeError, JWT::ExpiredSignature,
         ActiveRecord::RecordNotFound
    render json: {
      error: "Unauthorized"
    }, status: :unauthorized
  end

  def bearer_token
    authorization = request.headers["Authorization"]
    scheme, token = authorization.to_s.split(" ", 2)

    token if scheme == "Bearer"
  end
end