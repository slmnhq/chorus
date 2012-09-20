class ChorusEncryptor
  class << self
    def encrypt_password(options = {})
      Base64.strict_encode64(encrypt_cipher(options[:value]))
    end

    def decrypt_password(options = {})
      decrypt_cipher(Base64.strict_decode64(options[:value]))
    end

    private

    def secret_key
      Base64.strict_decode64(Chorus::Application.config.chorus['secret_key'])
    end

    def decrypt_cipher(password)
      do_cipher(:decrypt, password)
    end

    def encrypt_cipher(password)
      do_cipher(:encrypt, password)
    end

    def do_cipher(method, password)
      cipher = OpenSSL::Cipher::AES.new("128-CBC").send(method)
      # pkcs5 is supposedly deprecated but jruby does not have support for pbkdf2_hmac
      cipher.pkcs5_keyivgen(secret_key)
      cipher.update(password) + cipher.final
    end
  end
end
