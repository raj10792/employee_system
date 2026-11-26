module Auth
  class TokenService
    EXPIRATION_TIME = 24.hours

    def self.encode(user)
      jti = SecureRandom.uuid

      payload = {
        sub: user.id,
        jti: jti,
        exp: EXPIRATION_TIME.from_now.to_i
      }

      JWT.encode(
        payload,
        Rails.application.secret_key_base,
        "HS256"
      )
    end

    def self.decode(token)
      payload, = JWT.decode(
        token,
        Rails.application.secret_key_base,
        true,
        algorithm: "HS256"
      )

      payload
    end
  end
end