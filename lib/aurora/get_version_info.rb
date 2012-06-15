require 'rubygems'
require 'savon'

s = Savon.client('lib/aurora/datacloudWS.wsdl')

s.wsdl.endpoint = "https://tinker/datadirector/services/datacloudWS"
s.http.auth.ssl.verify_mode = :none
p "HEADERS"
p s.http.headers
response = s.request :get_version_information
p response.to_hash
p "TRYING LISTING TEMPLATES"



s.request "ins0:GetDatabaseConfigTemplatesByOrgIdRequest" do
  s.http.headers["SOAPAction"] = "getDatabaseConfigTemplatesByOrgId"
  soap.version = 1
  soap.body = {"ins0:orgId" => 1}
end


