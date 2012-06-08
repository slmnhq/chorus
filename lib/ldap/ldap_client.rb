require 'net/ldap'

class LdapClient

  # entered from UsersController#ldap
  def self.search(username)
    ldap = client
    filter = Net::LDAP::Filter.eq(self.config['attribute_names']['uid'], "#{username}")
    results = ldap.search :base => "dc=#{self.config['dc']}", :filter => filter

    results.map do |result|
      {
        :username =>   result[self.config['attribute_names']['uid']].first,
        :first_name => result[self.config['attribute_names']['gn']].first,
        :last_name =>  result[self.config['attribute_names']['sn']].first,
        :title =>      result[self.config['attribute_names']['title']].first,
        :dept =>       result[self.config['attribute_names']['ou']].first,
        :email =>      result[self.config['attribute_names']['mail']].first
      }
    end
  end

  # entered from CredentialsValidator
  def self.authenticate(username, password)
    ldap = client
    ldap.auth "#{self.config['attribute_names']['uid']}=#{username},cn=#{self.config['cn']},dc=#{self.config['dc']}", password
    ldap.bind
  end

  def self.config_file_path
    File.join(Rails.root, 'config', 'ldap.yml')
  end

  private

  def self.client
    Net::LDAP.new :host => self.config['host'], :base => "dc=#{self.config['dc']}"
  end

  def self.config
    @@config ||= YAML.load_file(config_file_path())['ldap']
  end

  def self.enabled?
    self.config['host'].present?
  end
end