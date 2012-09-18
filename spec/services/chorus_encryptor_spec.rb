require 'spec_helper'

describe ChorusEncryptor do
  let(:secret_key) { Base64.strict_decode64('\0' * 32) }
  let(:password) { "secret-password" }

  describe ".encrypt_password" do
    it "encrypts the password with the project secret key and adds a salt" do
      (encrypted_password, salt) = ChorusEncryptor.encrypt_password(:value => password).split
      encrypted_password.should == Base64.strict_encode64(encrypt_cipher(password, Base64.strict_decode64(salt)))
    end
  end

  describe ".decrypt_password" do
    let(:salt) {SecureRandom.random_bytes(8) }
    let(:encrypted_password) { Base64.strict_encode64(encrypt_cipher(password, salt)) }

    it "decrypts the password and salt with the the project secret key" do
      ChorusEncryptor.decrypt_password(:value => encrypted_password + " " + Base64.strict_encode64(salt)).should == password
    end
  end

  def encrypt_cipher(password, salt)
    cipher = OpenSSL::Cipher::AES.new("256-CBC").encrypt
    cipher.pkcs5_keyivgen(secret_key, salt)
    cipher.update(password) + cipher.final
  end
end
