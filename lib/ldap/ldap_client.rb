require 'net/ldap'

module LdapClient
  extend self

  # entered from UsersController#ldap
  def search(username)
    ldap = client
    filter = Net::LDAP::Filter.eq(config['attribute']['uid'], "#{username}")
    results = ldap.search :base => config['base'], :filter => filter

    results.map do |result|
      {
        :username =>   result[config['attribute']['uid']].first,
        :first_name => result[config['attribute']['gn']].first,
        :last_name =>  result[config['attribute']['sn']].first,
        :title =>      result[config['attribute']['title']].first,
        :dept =>       result[config['attribute']['ou']].first,
        :email =>      result[config['attribute']['mail']].first
      }
    end
  end

  # entered from CredentialsValidator
  def authenticate(username, password)
    ldap = client
    ldap.auth make_dn(username), password
    ldap.bind
  end

  def make_dn(username)
    "#{config['attribute']['uid']}=#{username},#{config['base']}"
  end

  def config_file_path
    File.join(Rails.root, 'config', 'chorus.yml')
  end

  def client
    Net::LDAP.new :host => config['host'], :base => "dc=#{config['dc']}"
  end

  def config
    @@config ||= YAML.load_file(config_file_path)['ldap']
  end

  def enabled?
    config['enable']
  end
end
