module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_user!, only: :create

      def create
        user = User.find_by(email: params[:email]&.downcase)

        if user&.authenticate(params[:password])
          token = Auth::TokenService.encode(user)

          render json: {
            message: "Login successful",
            token: token,
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            }
          }, status: :ok
        else
          render json: {
            error: "Invalid email or password"
          }, status: :unauthorized
        end
      end

      def destroy
        RevokedToken.create!(
          jti: current_token_payload["jti"],
          exp: Time.at(current_token_payload["exp"])
        )

        render json: {
          message: "Logged out successfully"
        }, status: :ok
      end
    end
  end
end