module AuthHelper
  def log_in(user = nil)
    if user
      session[:user_id] = user.id
    else
      user = User.create! :username => 'some_user',
                          :first_name => "Sam",
                          :last_name => "blow",
                          :password => 'secret',
                          :email => "sam@greenplum.com"
      session[:user_id] = user.id
    end
    session[:expires_at] = 2.hours.from_now

    return user
  end
end