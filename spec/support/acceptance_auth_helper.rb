module AcceptanceAuthHelper
  def log_in(user)
    old_document = client.metadata[:document]
    client.metadata[:document] = false
    client.post "/sessions", :session => {:username => user.username, :password => user.password }
    client.metadata[:document] = old_document
  end

  def log_out
    old_document = client.metadata[:document]
    client.metadata[:document] = false
    client.delete "/sessions"
    client.metadata[:document] = old_document
  end

  private

  def client
    @client ||= RspecApiDocumentation::TestClient.new(self, :headers => {"HTTP_ACCEPT" => "application/json"})
  end
end
