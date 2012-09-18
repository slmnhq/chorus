require 'spec_helper'

describe ChorusEncryptor do
  let(:secret_key) { Base64.strict_decode64('\0' * 32) }
  let(:password) { "secret-password" }

  describe ".encrypt_password" do
    it "encrypts the password with the project secret key" do
      encrypted_password = ChorusEncryptor.encrypt_password(:value => password)
      encrypted_password.should == Base64.strict_encode64(encrypt_cipher(password))
    end
  end

  describe ".decrypt_password" do
    let(:encrypted_password) { Base64.strict_encode64(encrypt_cipher(password)) }

    it "decrypts the password with the the project secret key" do
      ChorusEncryptor.decrypt_password(:value => encrypted_password).should == password
    end
  end

  def encrypt_cipher(password)
    cipher = OpenSSL::Cipher::AES.new("256-CBC").encrypt
    cipher.pkcs5_keyivgen(secret_key)
    cipher.update(password) + cipher.final
  end
end
