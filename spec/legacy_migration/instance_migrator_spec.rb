require 'legacy_migration_spec_helper'

describe InstanceMigrator do
  describe ".migrate" do
    before do
      InstanceMigrator.migrate
    end

    describe "copying the data" do
      it "creates new instances for legacy GPDB instances and is idempotent" do
        count = Legacy.connection.select_all("SELECT count(*) FROM edc_instance WHERE instance_provider = 'Greenplum Database'").first["count"]
        Instance.count.should == count
        InstanceMigrator.migrate
        Instance.count.should == count
      end

      it "copies the correct data fields from the legacy instance" do
        Legacy.connection.select_all("SELECT * FROM edc_instance WHERE instance_provider = 'Greenplum Database'").each do |legacy_instance|
          instance = Instance.find_by_legacy_id(legacy_instance["id"])
          #p instance
          instance.name.should == legacy_instance["name"]
          instance.description.should == legacy_instance["description"]
          instance.host.should == legacy_instance["host"]
          instance.port.should == legacy_instance["port"].try(:to_i)
          #instance.expire.should == legacy_instance["expire"]
          #instance.state.should == legacy_instance["state"]
          instance.provision_type.should == legacy_instance["provision_type"]
          #instance.provision_id.should == legacy_instance["provision_id"]
          #instance.size.should == legacy_instance["size"]
          instance.instance_provider.should == legacy_instance["instance_provider"]
          #instance.last_check.should == legacy_instance["last_check"]
          #instance.provision_name.should == legacy_instance["provision_name"]
          #instance.is_deleted.should == (legacy_instance["is_deleted"] != "f")
          #instance.instance_version.should == legacy_instance["instance_version"]
          instance.maintenance_db.should == legacy_instance["maintenance_db"]
          #instance.connection_string.should == legacy_instance["connection_string"]

          instance.owner.should == User.find_by_username(legacy_instance["owner"])
        end
      end
    end
  end
end
