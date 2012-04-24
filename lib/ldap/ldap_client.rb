require 'net/ldap'

class LdapClient
  def self.search(username)
    ldap = client
    filter = Net::LDAP::Filter.eq("cn", "#{username}*")
    results = ldap.search :base => "dc=#{config["dc"]}", :filter =>filter

    results.map do |result|
      {
          :username => result["uid"].first,
          :first_name => result["givenname"].first,
          :last_name => result["sn"].first,
          :title => result["title"].first,
          :dept => result["departmentnumber"].first,
          :email => result["mail"].first
      }
    end
  end

  def self.authenticate(username, password)
    ldap = client
    ldap.auth "#{config["auth_attribute"]}=#{username},cn=#{config["auth_cn"]},dc=#{config["dc"]}", password
    ldap.bind
  end

  private

  def self.client
    Net::LDAP.new :host => config["host"], :base => "dc=#{config["dc"]}"
  end

  def self.config
    @@config ||= YAML.load_file(File.join(Rails.root, 'config', 'ldap.yml'))[Rails.env]
  end
end