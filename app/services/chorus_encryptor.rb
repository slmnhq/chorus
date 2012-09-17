class ChorusEncryptor
  class << self
    def encrypt_password(options = {})
      salt = SecureRandom.random_bytes(8)
      value = Base64.strict_encode64(encrypt_cipher(options[:value], salt))
      value + " " + Base64.strict_encode64(salt)
    end

    def decrypt_password(options = {})
      (value, salt) = options[:value].split
      decrypt_cipher(Base64.strict_decode64(value), Base64.strict_decode64(salt))
    end

    private

    def secret_key
      Chorus::Application.config.chorus['secret_key'] || ('\0' * 32)
    end

    def decrypt_cipher(password, salt)
      do_cipher(:decrypt, password, salt)
    end

    def encrypt_cipher(password, salt)
      do_cipher(:encrypt, password, salt)
    end

    def do_cipher(method, password, salt)
      cipher = OpenSSL::Cipher::AES.new("256-CBC").send(method)
      # pkcs5 is supposedly deprecated but jruby does not have support for pbkdf2_hmac
      cipher.pkcs5_keyivgen(secret_key, salt)
      cipher.update(password) + cipher.final
    end
  end
end
