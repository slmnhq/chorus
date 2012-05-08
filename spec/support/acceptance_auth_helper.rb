module AcceptanceAuthHelper
  def log_in(user)
    no_doc do
      client.post "/sessions", :session => {:username => user.username, :password => user.password}
    end
  end

  def log_out
    no_doc do
      client.delete "/sessions"
    end
  end

  private

  def client
    @client ||= RspecApiDocumentation::TestClient.new(self, :headers => {"HTTP_ACCEPT" => "application/json"})
  end
end
