module AuthHelper
  def log_in(user)
    session[:user_id] = user.id
    session[:expires_at] = 2.hours.from_now

    return user
  end

  def log_out
    session.clear
  end
end
