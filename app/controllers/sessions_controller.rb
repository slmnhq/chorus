class SessionsController < ApplicationController
  def create
    if params[:username].present? && params[:password].present?
      user = User.authenticate(params[:username], params[:password])
      if user
        session[:user_id] = user.id
        render :json => UserPresenter.present(user),
               :status => :created
      else
        render :json => {:errors => {:fields => {:username_or_password => "INVALID"}}},
               :status => :unauthorized
      end
    else
      errors = {}
      if params[:username].blank?
        errors["username"] = "REQUIRED"
      end
      if params[:password].blank?
        errors["password"] = "REQUIRED"
      end

      render :json => {:errors => {:fields => errors}}, :status => :unauthorized
    end
  end

  def destroy
    session.clear
    head :no_content
  end
end
