require 'rubygems'
require 'savon'

s = Savon.client('datacloudWS.wsdl')

s.wsdl.endpoint = "https://10.80.129.96/datadirector/services/datacloudWS"
s.http.auth.ssl.verify_mode = :none
response = s.request :get_version_information
p response.to_hash
