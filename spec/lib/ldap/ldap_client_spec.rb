require 'spec_helper'

describe LdapClient do
  before do
    stub(LdapClient).config_file_path { File.expand_path(config_file_path, Rails.root) }
  end

  after do
    LdapClient.class_variable_set(:@@config, nil)
  end

  let(:config_file_path) { "spec/fixtures/ldap.yml" }

  describe ".search" do
    before(:each) do
      @entries = [
          Net::LDAP::Entry.from_single_ldif_string("dn: uid=testguy,cn=users,dc=bartol\naltsecurityidentities: Kerberos:untitled_1@BARTOL\napple-company: Example Corporation\napple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24\napple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU\n WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO\n IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w\n LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt\n dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0\n Pgo8L3BsaXN0Pgo=\nauthauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53\nauthauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53\ncn: Test Guy\ndepartmentnumber: Greenery\ngidnumber: 20\ngivenname: Test\nhomedirectory: 99\nloginshell: /bin/bash\nmail: testguy@example.com\nobjectclass: person\nobjectclass: inetOrgPerson\nobjectclass: organizationalPerson\nobjectclass: posixAccount\nobjectclass: shadowAccount\nobjectclass: top\nobjectclass: extensibleObject\nobjectclass: apple-user\nsn: Guy\ntitle: Big Kahuna\nuid: testguy\nuidnumber: 1026\nuserpassword:: e0NSWVBUfSo=\n"),
          Net::LDAP::Entry.from_single_ldif_string("dn: uid=testguy2,cn=users,dc=bartol\naltsecurityidentities: Kerberos:untitled_1@BARTOL\napple-company: Example Corporation\napple-generateduid: 927107A3-92B4-4285-B153-A5C823369E24\napple-mcxflags:: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NU\n WVBFIHBsaXN0IFBVQkxJQyAiLS8vQXBwbGUvL0RURCBQTElTVCAxLjAvL0VO\n IiAiaHR0cDovL3d3dy5hcHBsZS5jb20vRFREcy9Qcm9wZXJ0eUxpc3QtMS4w\n LmR0ZCI+CjxwbGlzdCB2ZXJzaW9uPSIxLjAiPgo8ZGljdD4KCTxrZXk+c2lt\n dWx0YW5lb3VzX2xvZ2luX2VuYWJsZWQ8L2tleT4KCTx0cnVlLz4KPC9kaWN0\n Pgo8L3BsaXN0Pgo=\nauthauthority: ;ApplePasswordServer;0xa1a21c2c8d9411e1940d045453061d87,1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53\nauthauthority: ;Kerberosv5;0xa1a21c2c8d9411e1940d045453061d87;testguy@BARTOL;BARTOL;1024 65537 114574792543369925664970476099531574810470011447394859817353327283009252641939234027203454336596092547412893300748255582830246395307601051059741455985758726565576050698713027643598211823458461426996675470307157668087994612395127920329176467950738294806584152682809589286911571551061068009380246772002575640033 root@bartol.sf.pivotallabs.com:10.80.2.53\ncn: Test Guy 2\ndepartmentnumber: Greenery\ngidnumber: 21\ngivenname: Test\nhomedirectory: 100\nloginshell: /bin/bash\nmail: testguy2@example.com\nobjectclass: person\nobjectclass: inetOrgPerson\nobjectclass: organizationalPerson\nobjectclass: posixAccount\nobjectclass: shadowAccount\nobjectclass: top\nobjectclass: extensibleObject\nobjectclass: apple-user\nsn: Guy\ntitle: Big Kahuna\nuid: testguy\nuidnumber: 1026\nuserpassword:: e0NSWVBUfSo=\n")
      ]
    end

    it "returns an array of user hashes" do
      any_instance_of(Net::LDAP) do |ldap|
        mock(ldap).search.with_any_args { @entries }
      end

      results = LdapClient.search("testguy")
      results.should be_a(Array)
      results.first.should be_a(Hash)
      results.first.should == { :first_name => "Test", :last_name => "Guy", :title => "Big Kahuna", :dept => "Greenery", :email => "testguy@example.com", :username => "testguy" }
    end
  end

  describe ".authenticate" do
    context "when the LDAP authentication succeeds" do
      before(:each) do
        any_instance_of(Net::LDAP) do |ldap|
          mock(ldap).bind { true }
        end
      end

      it "returns true" do
        LdapClient.authenticate("testguy", "secret").should be_true
      end
    end

    context "when the LDAP authentication fails" do
      before(:each) do
        any_instance_of(Net::LDAP) do |ldap|
          mock(ldap).bind { false }
        end
      end

      it "returns true" do
        LdapClient.authenticate("testguy", "secret").should be_false
      end
    end
  end

  describe "configuration" do
    it "reads configuration from a YAML file" do
      any_instance_of(Net::LDAP) do |ldap|
        mock(ldap).search.with_any_args do |options|
          options[:base].should == "dc=foo"
          options[:filter].to_s.should == "(uid=foo)"
          []
        end
        mock(ldap).auth("username=foo,cn=users_cn,dc=foo", "secret") { true }
        mock(ldap).bind
      end

      LdapClient.search("foo")
      LdapClient.authenticate("foo", "secret")
    end
  end

  describe "enabled?" do
    context "when the ldap host is blank" do
      let(:config_file_path) { "spec/fixtures/no_ldap.yml" }

      it "returns false" do
        LdapClient.should_not be_enabled
      end
    end

    context "when the ldap host is present" do
      it "returns true" do
        LdapClient.should be_enabled
      end
    end
  end
end
