class Kaggle::MessagesController < ApplicationController
  wrap_parameters :kaggle_message, :include => ['reply_to', 'html_body', 'subject', 'recipient_ids', 'workspace_id']

  def create
    kaggleParams = prepared_parameters(params[:kaggle_message])
    Kaggle::API.send_message(kaggleParams)
    render :json => {}, :status => 200
  rescue Kaggle::API::MessageFailed => e
    present_errors({:fields => {:kaggle =>
                                    { :GENERIC => {:message => e.message}}}},
                   {:status => :unprocessable_entity})
  end

  private
  def prepared_parameters(input_params)
    params = {}
    kaggle_config = Chorus::Application.config.chorus['kaggle']
    params["apiKey"] = kaggle_config['api_key'] if kaggle_config
    params["subject"] = input_params["subject"]
    params["userId"] = input_params["recipient_ids"]
    params["htmlBody"] = input_params["html_body"]
    params["replyTo"] = input_params["reply_to"]
    params
  end
end