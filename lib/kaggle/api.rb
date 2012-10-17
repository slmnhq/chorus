require "net/https"
require "uri"
require 'json'

module Kaggle
  module API
    MessageFailed = Class.new(StandardError)

    API_URL = "https://www.kaggle.com/connect/chorus-beta/message"

    def self.send_message(params)
      decoded_response = send_to_kaggle(params)
      result_status = decoded_response["status"]

      if result_status != 200 || !decoded_response['failed'].empty?
        raise MessageFailed.new('Could not send to user')
      end

      true
    end

    private

    def self.send_to_kaggle(post_params)
      uri = URI.parse(API_URL)

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE

      request = Net::HTTP::Post.new(uri.request_uri)
      request.set_form_data(post_params)
      response = http.request(request)

      JSON.parse(response.body)
    rescue Timeout::Error
      raise MessageFailed.new("Could not connect to the Kaggle server")
    rescue Exception => e
      raise MessageFailed.new("Error: " + e.message)
    end
  end
end